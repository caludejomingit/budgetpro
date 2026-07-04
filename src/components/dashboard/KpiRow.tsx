import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format/currency';

interface Props {
  total: number;
  transactionCount: number;
  activeMonths: number;
  topCategory: { name: string; total: number } | null;
  savings: number;
}

export function KpiRow({ total, transactionCount, activeMonths, topCategory, savings }: Props) {
  const theme = useTheme();
  const avgMonth = activeMonths > 0 ? total / activeMonths : 0;
  const avgTxn = transactionCount > 0 ? total / transactionCount : 0;
  const savingsRate = total > 0 ? (savings / total) * 100 : 0;

  const items = [
    { label: 'Total Spend', value: formatCurrencyCompact(total), sub: `${transactionCount} transactions` },
    { label: 'Avg Monthly Spend', value: formatCurrencyCompact(avgMonth), sub: `across ${activeMonths} month(s)` },
    { label: 'Transactions', value: transactionCount.toLocaleString('en-IN'), sub: transactionCount ? `${formatCurrency(avgTxn)} avg/txn` : '' },
    { label: 'Top Category', value: topCategory?.name ?? '—', sub: topCategory ? `${formatCurrency(topCategory.total)} spent` : '', tone: 'clay' as const },
    { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, sub: `${formatCurrency(savings)} saved`, tone: savingsRate >= 10 ? ('good' as const) : ('clay' as const) },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Card key={item.label} style={styles.card}>
          <ThemedText type="small" themeColor="textMuted" style={styles.label}>
            {item.label.toUpperCase()}
          </ThemedText>
          <ThemedText type="subtitle" style={[styles.value, { color: theme.primary }]} numberOfLines={1}>
            {item.value}
          </ThemedText>
          {item.sub ? (
            <ThemedText type="small" style={{ color: item.tone === 'clay' ? theme.clay : item.tone === 'good' ? theme.success : theme.textSecondary }} numberOfLines={1}>
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
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6 },
  value: { fontSize: 20 },
});
