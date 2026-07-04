import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryColor } from '@/lib/constants/categories';
import { formatCurrencyCompact } from '@/lib/format/currency';

interface Props {
  data: { name: string; total: number }[];
}

export function Treemap({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0 || total === 0) {
    return <EmptyState icon="square" title="No data yet" message="Category proportions will appear here once you have expenses." />;
  }

  return (
    <View style={styles.wrap}>
      {data.map((d) => {
        const pct = total > 0 ? d.total / total : 0;
        return (
          <View
            key={d.name}
            style={[
              styles.block,
              {
                backgroundColor: categoryColor(d.name),
                flexGrow: Math.max(pct * 100, 6),
                flexBasis: `${Math.max(pct * 100, 16)}%`,
              },
            ]}>
            <ThemedText type="smallBold" style={styles.blockText} numberOfLines={1}>
              {d.name}
            </ThemedText>
            <ThemedText type="small" style={styles.blockText}>
              {formatCurrencyCompact(d.total)} · {(pct * 100).toFixed(1)}%
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  block: { minWidth: 100, minHeight: 70, borderRadius: 8, padding: 10, justifyContent: 'space-between' },
  blockText: { color: '#ffffff' },
});
