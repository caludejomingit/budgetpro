import { router } from 'expo-router';

import { TransactionForm, type TransactionFormValues } from '@/components/transactions/TransactionForm';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';

export default function NewTransactionScreen() {
  const { user } = useAuth();
  const createTransaction = useCreateTransaction();

  const onSubmit = async (values: TransactionFormValues) => {
    if (!user) return;
    await createTransaction.mutateAsync({
      userId: user.id,
      categoryId: values.categoryId,
      type: values.type,
      amount: Number(values.amount),
      occurredOn: values.occurredOn,
      note: values.note,
    });
    router.back();
  };

  return <TransactionForm onSubmit={onSubmit} submitLabel="Add transaction" />;
}
