import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryColor } from '@/lib/constants/categories';
import { formatCurrencyCompact } from '@/lib/format/currency';

interface Segment {
  category: string;
  amount: number;
}

interface MonthStack {
  monthKey: string;
  label: string;
  segments: Segment[];
  total: number;
}

interface Props {
  data: MonthStack[];
  categories: string[];
}

const CHART_HEIGHT = 180;
const BAR_WIDTH = 40;

export function StackedMonthChart({ data, categories }: Props) {
  if (data.length === 0) {
    return <EmptyState icon="bar-chart-2" title="No data yet" message="Monthly category breakdown will appear here once you have expenses." />;
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {data.map((d) => (
            <View key={d.monthKey} style={styles.barCol}>
              <View style={[styles.barTrack, { height: CHART_HEIGHT }]}>
                <View style={styles.barStack}>
                  {d.segments
                    .filter((s) => s.amount > 0)
                    .map((s) => (
                      <View
                        key={s.category}
                        style={{
                          width: BAR_WIDTH,
                          height: (s.amount / max) * CHART_HEIGHT,
                          backgroundColor: categoryColor(s.category),
                        }}
                      />
                    ))}
                </View>
              </View>
              <ThemedText type="small" themeColor="textMuted" style={styles.monthLabel}>
                {d.label.split(' ')[0]}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatCurrencyCompact(d.total)}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {categories.map((c) => (
          <View key={c} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: categoryColor(c) }]} />
            <ThemedText type="small" themeColor="textSecondary">
              {c}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: { flexDirection: 'row', gap: 18, paddingBottom: 8, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 4, width: BAR_WIDTH + 8 },
  barTrack: { justifyContent: 'flex-end' },
  barStack: { flexDirection: 'column-reverse', borderRadius: 4, overflow: 'hidden' },
  monthLabel: { fontWeight: '700' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
});
