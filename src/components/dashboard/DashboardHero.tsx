import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';

interface Props {
  total: number;
  months: number;
  transactionCount: number;
}

export function DashboardHero({ total, months, transactionCount }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.primaryDark }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice">
        <Circle cx={40} cy={26} r={60} fill={theme.gold} opacity={0.16} />
        <Circle cx={272} cy={112} r={72} fill={theme.clay} opacity={0.18} />
        <Circle cx={190} cy={16} r={38} fill="#ffffff" opacity={0.08} />
      </Svg>
      <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
        <Feather name="compass" size={20} color="#EAF4EE" />
      </View>
      <ThemedText type="subtitle" style={styles.headline}>
        Here&apos;s the story of your money
      </ThemedText>
      <ThemedText type="small" style={styles.sub}>
        {transactionCount.toLocaleString('en-IN')} expenses across {months || 1} month{months === 1 ? '' : 's'} · {formatCurrency(total)} total
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 20, padding: 20, overflow: 'hidden', gap: 6, minHeight: 128, justifyContent: 'center' },
  iconBadge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  headline: { color: '#EAF4EE', fontSize: 19 },
  sub: { color: '#CFE4D8' },
});
