import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  data: { label: string; total: number }[];
}

export function TrendChart({ data }: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return <EmptyState icon="trending-up" title="No data yet" message="Once you have spending across a few months, the trend shows up here." />;
  }

  const lineData = data.map((d) => ({
    value: d.total,
    label: d.label.replace(' 2026', '').replace(/ \d{4}$/, ''),
    labelTextStyle: { color: theme.textMuted, fontSize: 10 },
  }));

  return (
    <View style={styles.wrap}>
      <LineChart
        data={lineData}
        curved
        areaChart
        color={theme.primary}
        startFillColor={theme.primary}
        endFillColor={theme.primary}
        startOpacity={0.3}
        endOpacity={0.02}
        thickness={3}
        hideRules
        hideDataPoints={false}
        dataPointsColor={theme.primary}
        dataPointsRadius={4}
        xAxisColor={theme.border}
        yAxisColor={theme.border}
        yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
        noOfSections={4}
        height={170}
        initialSpacing={12}
        endSpacing={12}
        adjustToWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
});
