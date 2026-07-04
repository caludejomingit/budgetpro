import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format/currency';

interface Props {
  income: number;
  expense: number;
  transactionCount: number;
  activeMonths: number;
  topCategory: { name: string; total: number } | null;
}

export function KpiRow({ income, expense, transactionCount, activeMonths, topCategory }: Props) {
  const theme = useTheme();
  const net = income - expense;
  const avgIncomeMonth = activeMonths > 0 ? income / activeMonths : income;
  const avgExpenseMonth = activeMonths > 0 ? expense / activeMonths : expense;

  const items: { label: string; icon: keyof typeof Feather.glyphMap; value: string; sub: string; tone: 'income' | 'expense' | 'net' | 'neutral' }[] = [
    { label: 'Income', icon: 'arrow-down-circle', value: formatCurrencyCompact(income), sub: `${formatCurrencyCompact(avgIncomeMonth)}/month avg`, tone: 'income' },
    { label: 'Expense', icon: 'arrow-up-circle', value: formatCurrencyCompact(expense), sub: `${formatCurrencyCompact(avgExpenseMonth)}/month avg`, tone: 'expense' },
    { label: 'Net Savings', icon: 'trending-up', value: `${net >= 0 ? '' : '-'}${formatCurrencyCompact(Math.abs(net))}`, sub: income > 0 ? `${Math.round((net / income) * 100)}% of income` : '', tone: 'net' },
    { label: 'Transactions', icon: 'list', value: transactionCount.toLocaleString('en-IN'), sub: `across ${activeMonths || 1} month(s)`, tone: 'neutral' },
    { label: 'Top Expense', icon: 'award', value: topCategory?.name ?? '—', sub: topCategory ? formatCurrency(topCategory.total) : '', tone: 'neutral' },
  ];

  const toneColor = (tone: (typeof items)[number]['tone']) =>
    tone === 'income' ? theme.success : tone === 'expense' ? theme.clay : tone === 'net' ? (net >= 0 ? theme.success : theme.danger) : theme.primary;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Card key={item.label} style={styles.card}>
          <View style={styles.labelRow}>
            <Feather name={item.icon} size={11} color={theme.textMuted} />
            <ThemedText type="small" themeColor="textMuted" style={styles.label}>
              {item.label.toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={[styles.value, { color: toneColor(item.tone) }]} numberOfLines={1}>
            {item.value}
          </ThemedText>
          {item.sub ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {item.sub}
            </ThemedText>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { flexGrow: 1, flexBasis: 150, gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6 },
  value: { fontSize: 19 },
});
