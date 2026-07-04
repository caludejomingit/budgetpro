import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';

interface Props {
  essential: number;
  nonEssential: number;
}

export function EssentialSplitBar({ essential, nonEssential }: Props) {
  const theme = useTheme();
  const total = essential + nonEssential;

  if (total === 0) {
    return <EmptyState icon="pie-chart" title="No data yet" message="Essential vs. non-essential spend will appear here once you have expenses." />;
  }

  const essentialPct = (essential / total) * 100;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.segment, { width: `${essentialPct}%`, backgroundColor: theme.primary }]} />
        <View style={[styles.segment, { width: `${100 - essentialPct}%`, backgroundColor: theme.clay }]} />
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <ThemedText type="small">Essential</ThemedText>
          <ThemedText type="amountSmall" themeColor="textMuted">
            {formatCurrency(essential)} ({essentialPct.toFixed(1)}%)
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.clay }]} />
          <ThemedText type="small">Non-Essential</ThemedText>
          <ThemedText type="amountSmall" themeColor="textMuted">
            {formatCurrency(nonEssential)} ({(100 - essentialPct).toFixed(1)}%)
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  track: { flexDirection: 'row', height: 22, borderRadius: 11, overflow: 'hidden' },
  segment: { height: 22 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
});
