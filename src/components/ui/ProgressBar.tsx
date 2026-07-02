import { StyleSheet, View } from 'react-native';

import { ChartColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  ratio: number; // spent / limit, can exceed 1
  height?: number;
}

export function ProgressBar({ ratio, height = 8 }: ProgressBarProps) {
  const theme = useTheme();
  const palette = ChartColors.light;

  const fillColor = ratio >= 1 ? palette.status.critical : ratio >= 0.8 ? palette.status.warning : palette.status.good;
  const width = `${Math.min(Math.max(ratio, 0), 1) * 100}%` as const;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width, height, borderRadius: height / 2, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {},
});
