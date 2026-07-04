import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';

interface Props {
  data: { label: string; total: number }[];
}

export function RankedBarList({ data }: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return <EmptyState icon="bar-chart-2" title="Nothing to show" message="No transactions match these filters." />;
  }

  const max = Math.max(...data.map((d) => d.total));

  return (
    <View style={styles.list}>
      {data.map((d) => (
        <View key={d.label} style={styles.row}>
          <ThemedText type="small" numberOfLines={1} style={styles.label}>
            {d.label}
          </ThemedText>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View style={[styles.fill, { width: `${max > 0 ? (d.total / max) * 100 : 0}%`, backgroundColor: theme.primary }]} />
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.amount}>
            {formatCurrency(d.total)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { gap: 4 },
  label: { fontSize: 13 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  amount: { alignSelf: 'flex-end' },
});
