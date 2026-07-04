import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrencyCompact } from '@/lib/format/currency';
import { monthLabelOf, type HeatMatrixData } from '@/lib/insights/dashboardStats';

interface Props {
  matrix: HeatMatrixData;
}

const CELL_WIDTH = 78;
const LABEL_WIDTH = 120;

export function HeatMatrix({ matrix }: Props) {
  const theme = useTheme();

  if (matrix.categories.length === 0 || matrix.months.length === 0) {
    return <EmptyState icon="grid" title="No data yet" message="Log expenses across a few months to see the heat matrix." />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.row}>
          <View style={[styles.labelCell, { width: LABEL_WIDTH }]}>
            <ThemedText type="small" themeColor="textMuted" style={styles.headerText}>
              Category
            </ThemedText>
          </View>
          {matrix.months.map((m) => (
            <View key={m} style={[styles.cell, { width: CELL_WIDTH }]}>
              <ThemedText type="small" themeColor="textMuted" style={styles.headerText}>
                {monthLabelOf(m).split(' ')[0]}
              </ThemedText>
            </View>
          ))}
          <View style={[styles.cell, { width: CELL_WIDTH }]}>
            <ThemedText type="small" themeColor="textMuted" style={styles.headerText}>
              Total
            </ThemedText>
          </View>
        </View>

        {matrix.categories.map((c) => (
          <View key={c} style={[styles.row, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
            <View style={[styles.labelCell, { width: LABEL_WIDTH }]}>
              <ThemedText type="small" numberOfLines={1}>
                {c}
              </ThemedText>
            </View>
            {matrix.months.map((m) => {
              const v = matrix.grid[c][m];
              const intensity = matrix.max > 0 ? v / matrix.max : 0;
              return (
                <View key={m} style={[styles.cell, { width: CELL_WIDTH, backgroundColor: `rgba(30,107,78,${(0.06 + intensity * 0.55).toFixed(2)})` }]}>
                  <ThemedText type="small" style={intensity > 0.45 ? styles.lightText : undefined}>
                    {v > 0 ? formatCurrencyCompact(v) : '—'}
                  </ThemedText>
                </View>
              );
            })}
            <View style={[styles.cell, { width: CELL_WIDTH }]}>
              <ThemedText type="smallBold">{formatCurrencyCompact(matrix.rowTotals[c])}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  labelCell: { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
  cell: { paddingVertical: 10, paddingHorizontal: 6, alignItems: 'flex-end', justifyContent: 'center' },
  headerText: { fontWeight: '700', fontSize: 11 },
  lightText: { color: '#ffffff' },
});
