import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryColor } from '@/lib/constants/categories';
import type { CategorySpend } from '@/hooks/useMonthlySummary';

interface Props {
  data: CategorySpend[];
}

export function CategoryBreakdownChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyState icon="pie-chart" title="No expenses yet" message="No expenses logged this month yet." />;
  }

  const pieData = data.map((d) => ({ value: d.amount, color: categoryColor(d.categoryName) }));

  return (
    <View style={styles.row}>
      <PieChart data={pieData} donut radius={70} innerRadius={46} />
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.categoryId} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: categoryColor(d.categoryName) }]} />
            <ThemedText type="small" numberOfLines={1} style={styles.legendLabel}>
              {d.categoryName}
            </ThemedText>
            <ThemedText type="amountSmall" themeColor="textMuted">
              {Math.round(d.amount).toLocaleString('en-IN')}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  legendLabel: { flex: 1 },
});
