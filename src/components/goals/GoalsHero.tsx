import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';

interface Props {
  goalCount: number;
  totalSaved: number;
  totalTarget: number;
  achievedCount: number;
}

export function GoalsHero({ goalCount, totalSaved, totalTarget, achievedCount }: Props) {
  const theme = useTheme();

  const headline =
    goalCount === 0
      ? 'What are you saving for?'
      : achievedCount === goalCount
        ? 'Every goal reached — amazing work!'
        : `Building toward ${goalCount} goal${goalCount === 1 ? '' : 's'}`;

  const sub =
    goalCount === 0
      ? 'Set a target — a car, a trip, a rainy-day fund — and log every rupee you put toward it.'
      : `${formatCurrency(totalSaved)} saved so far${totalTarget > 0 ? ` toward ${formatCurrency(totalTarget)}` : ''}${achievedCount > 0 ? ` · ${achievedCount} reached` : ''}`;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.primaryDark }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice">
        <Circle cx={270} cy={24} r={58} fill={theme.gold} opacity={0.16} />
        <Circle cx={30} cy={116} r={70} fill={theme.clay} opacity={0.16} />
        <Path d="M-10 90 Q 80 40 170 80 T 340 60" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={3} fill="none" />
      </Svg>
      <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
        <Feather name="flag" size={20} color="#EAF4EE" />
      </View>
      <ThemedText type="subtitle" style={styles.headline}>
        {headline}
      </ThemedText>
      <ThemedText type="small" style={styles.sub}>
        {sub}
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
