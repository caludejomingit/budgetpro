import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChartColors } from '@/constants/theme';
import { formatCurrency } from '@/lib/format/currency';
import { formatDayLabel } from '@/lib/format/date';
import type { TransactionWithCategory } from '@/types/database';

interface Props {
  transaction: TransactionWithCategory;
}

export function TransactionListItem({ transaction }: Props) {
  const isIncome = transaction.type === 'income';
  const color = transaction.category?.color ?? '#898781';
  const sign = isIncome ? '+' : '-';
  const amountColor = isIncome ? ChartColors.light.income : ChartColors.light.expense;

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/transaction/${transaction.id}`)}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Feather name={(transaction.category?.icon as any) ?? 'circle'} size={18} color={color} />
      </View>
      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {transaction.category?.name ?? 'Other'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {transaction.note || formatDayLabel(transaction.occurred_on)}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={{ color: amountColor }}>
        {sign}
        {formatCurrency(transaction.amount)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, gap: 2 },
});
