import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CategorySpend } from '@/hooks/useMonthlySummary';

interface Props {
  data: CategorySpend[];
}

export function CategoryBreakdownChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyState icon="pie-chart" title="No expenses yet" message="Add a transaction to see your spending by category." />;
  }

  const pieData = data.map((d) => ({ value: d.amount, color: d.color }));

  return (
    <View style={styles.row}>
      <PieChart data={pieData} donut radius={70} innerRadius={46} />
      <View style={styles.legend}>
        {data.slice(0, 8).map((d) => (
          <View key={d.categoryId} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <ThemedText type="small" numberOfLines={1} style={styles.legendLabel}>
              {d.categoryName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {Math.round((d.amount / total) * 100)}%
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
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1 },
});
