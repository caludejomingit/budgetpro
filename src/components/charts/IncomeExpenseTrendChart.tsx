import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface MonthlyTotal {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

interface Props {
  data: MonthlyTotal[];
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSquare, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

export function IncomeExpenseTrendChart({ data }: Props) {
  const theme = useTheme();

  const barData = data.flatMap((d) => [
    { value: d.income, frontColor: theme.primary, spacing: 3, label: d.label, labelTextStyle: { color: theme.textMuted, fontSize: 10 } },
    { value: d.expense, frontColor: theme.clay, spacing: 20 },
  ]);

  return (
    <View>
      <View style={styles.legendRow}>
        <LegendDot color={theme.primary} label="Income" />
        <LegendDot color={theme.clay} label="Expenses" />
      </View>
      <BarChart
        data={barData}
        barWidth={16}
        barBorderRadius={3}
        hideRules
        xAxisColor={theme.border}
        yAxisColor={theme.border}
        yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
        noOfSections={4}
        height={150}
        initialSpacing={12}
        endSpacing={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSquare: { width: 8, height: 8, borderRadius: 2 },
});
