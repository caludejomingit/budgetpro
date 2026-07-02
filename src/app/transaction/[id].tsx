import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TransactionForm, type TransactionFormValues } from '@/components/transactions/TransactionForm';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { fetchTransactionById } from '@/lib/api/transactions';

export default function EditTransactionScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
  });
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const onSubmit = async (values: TransactionFormValues) => {
    await updateTransaction.mutateAsync({
      id,
      input: {
        categoryId: values.categoryId,
        type: values.type,
        amount: Number(values.amount),
        occurredOn: values.occurredOn,
        note: values.note,
      },
    });
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete transaction', 'This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !transaction) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TransactionForm initialValues={transaction} onSubmit={onSubmit} submitLabel="Save changes" />
      <Pressable
        onPress={onDelete}
        style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
        <Feather name="trash-2" size={16} color={theme.danger} />
        <ThemedText type="smallBold" style={{ color: theme.danger }}>Delete transaction</ThemedText>
      </Pressable>
    </View>
  );
}
