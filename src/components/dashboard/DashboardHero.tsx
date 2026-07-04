import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrencyCompact } from '@/lib/format/currency';

interface Props {
  income: number;
  expense: number;
  months: number;
}

export function DashboardHero({ income, expense, months }: Props) {
  const theme = useTheme();
  const net = income - expense;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.primaryDark }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 320 90" preserveAspectRatio="xMidYMid slice">
        <Circle cx={30} cy={14} r={44} fill={theme.gold} opacity={0.16} />
        <Circle cx={290} cy={80} r={54} fill={theme.clay} opacity={0.18} />
      </Svg>
      <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
        <Feather name="compass" size={18} color="#EAF4EE" />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="smallBold" style={styles.headline}>
          Your money story
        </ThemedText>
        <ThemedText type="small" style={styles.sub} numberOfLines={1}>
          {formatCurrencyCompact(income)} in · {formatCurrencyCompact(expense)} out · net {net >= 0 ? '+' : ''}
          {formatCurrencyCompact(net)} · {months || 1}mo
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, overflow: 'hidden' },
  iconBadge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, gap: 2 },
  headline: { color: '#EAF4EE', fontSize: 15 },
  sub: { color: '#CFE4D8' },
});
