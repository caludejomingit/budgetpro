import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';
import { formatDayLabel } from '@/lib/format/date';
import type { TransactionWithCategory } from '@/types/database';

interface Props {
  transaction: TransactionWithCategory;
  /** True when embedded inside a Card that already has its own padding. */
  inset?: boolean;
}

export function TransactionListItem({ transaction, inset }: Props) {
  const theme = useTheme();
  const isIncome = transaction.type === 'income';
  const sign = isIncome ? '+' : '-';
  const amountColor = isIncome ? theme.success : theme.clay;

  return (
    <Pressable style={[styles.row, !inset && styles.rowPadded]} onPress={() => router.push(`/transaction/${transaction.id}`)}>
      <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
        <CategoryGlyph name={transaction.category?.name ?? 'Miscellaneous'} size={14} color={theme.primaryDark} />
      </View>
      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {transaction.category?.name ?? 'Other'}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
          {transaction.note ? `${formatDayLabel(transaction.occurred_on)} · ${transaction.note}` : formatDayLabel(transaction.occurred_on)}
        </ThemedText>
      </View>
      <ThemedText type="amountSmall" style={{ color: amountColor, fontWeight: '600' }}>
        {sign}
        {formatCurrency(transaction.amount)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowPadded: { paddingHorizontal: 20 },
  iconWrap: { width: 28, height: 28, borderRadius: Radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, gap: 2 },
});
