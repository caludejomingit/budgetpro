import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryColor } from '@/lib/constants/categories';
import { formatCurrency } from '@/lib/format/currency';

interface Props {
  data: { name: string; total: number }[];
}

export function CategoryDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyState icon="pie-chart" title="No expenses yet" message="No expenses match these filters." />;
  }

  const pieData = data.map((d) => ({ value: d.total, color: categoryColor(d.name) }));

  return (
    <View style={styles.row}>
      <PieChart data={pieData} donut radius={72} innerRadius={48} />
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.name} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: categoryColor(d.name) }]} />
            <ThemedText type="small" numberOfLines={1} style={styles.legendLabel}>
              {d.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {((d.total / total) * 100).toFixed(1)}%
            </ThemedText>
            <ThemedText type="amountSmall" themeColor="textMuted">
              {formatCurrency(d.total)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  legend: { flex: 1, minWidth: 180, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  legendLabel: { flex: 1 },
});
