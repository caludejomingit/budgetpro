import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ChartColors } from '@/constants/theme';
import type { Tip } from '@/lib/insights/savingsTips';

const ICONS: Record<Tip['severity'], keyof typeof Feather.glyphMap> = {
  critical: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

export function TipCard({ tip }: { tip: Tip }) {
  const scheme = useColorScheme();
  const status = ChartColors[scheme === 'dark' ? 'dark' : 'light'].status;
  const color = status[tip.severity === 'info' ? 'good' : tip.severity === 'warning' ? 'warning' : 'critical'];
  const iconColor = tip.severity === 'info' ? ChartColors.light.accent : color;

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
        <Feather name={ICONS[tip.severity]} size={16} color={iconColor} />
      </View>
      <ThemedText type="small" style={styles.message}>
        {tip.message}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  message: { flex: 1, lineHeight: 20 },
});
