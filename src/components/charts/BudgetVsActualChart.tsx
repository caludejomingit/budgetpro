import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/format/currency';

export interface BudgetActualRow {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number;
}

interface Props {
  rows: BudgetActualRow[];
}

export function BudgetVsActualChart({ rows }: Props) {
  if (rows.length === 0) {
    return <EmptyState icon="target" title="No budgets set" message="Set monthly budgets to compare planned vs. actual spending here." />;
  }

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <View key={row.categoryId} style={styles.row}>
          <View style={styles.labelRow}>
            <ThemedText type="small">{row.categoryName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCurrency(row.spent)} / {formatCurrency(row.limit)}
            </ThemedText>
          </View>
          <ProgressBar ratio={row.limit > 0 ? row.spent / row.limit : 0} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
