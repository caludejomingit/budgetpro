import { StyleSheet, View, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { ChartColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrencyCompact } from '@/lib/format/currency';

export interface MonthlyTotal {
  monthKey: string;
  label: string; // short month label, e.g. "Jan"
  income: number;
  expense: number;
}

interface Props {
  data: MonthlyTotal[];
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

export function IncomeExpenseTrendChart({ data }: Props) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const palette = ChartColors[scheme === 'dark' ? 'dark' : 'light'];

  const incomeData = data.map((d) => ({ value: d.income, label: d.label }));
  const expenseData = data.map((d) => ({ value: d.expense, label: d.label }));

  return (
    <View>
      <LineChart
        data={incomeData}
        data2={expenseData}
        color1={palette.income}
        color2={palette.expense}
        thickness1={2}
        thickness2={2}
        dataPointsRadius1={4}
        dataPointsRadius2={4}
        dataPointsColor1={palette.income}
        dataPointsColor2={palette.expense}
        startFillColor1={palette.income}
        startFillColor2={palette.expense}
        startOpacity={0.1}
        endOpacity={0}
        areaChart
        curved
        hideRules
        xAxisColor={theme.gridline}
        yAxisColor={theme.gridline}
        xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 11 }}
        yAxisTextStyle={{ color: theme.textMuted, fontSize: 11 }}
        yAxisLabelWidth={44}
        formatYLabel={(v: string) => formatCurrencyCompact(Number(v))}
        noOfSections={4}
        spacing={44}
        initialSpacing={16}
        height={180}
        adjustToWidth
      />
      <View style={styles.legendRow}>
        <LegendDot color={palette.income} label="Income" />
        <LegendDot color={palette.expense} label="Expense" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
