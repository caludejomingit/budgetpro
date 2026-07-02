import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
  children?: React.ReactNode;
}

/**
 * A minimal illustration: a small cluster of soft, offset brand-color blobs
 * behind a centered icon badge — reads as a crafted illustration without
 * needing hand-drawn art.
 */
function Illustration({
  icon,
  primary,
  clay,
  gold,
  badgeBg,
}: {
  icon: keyof typeof Feather.glyphMap;
  primary: string;
  clay: string;
  gold: string;
  badgeBg: string;
}) {
  return (
    <View style={styles.illustrationWrap}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Circle cx={44} cy={50} r={40} fill={gold} opacity={0.16} />
        <Circle cx={96} cy={92} r={34} fill={clay} opacity={0.16} />
        <Circle cx={70} cy={70} r={46} fill={primary} opacity={0.12} />
      </Svg>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Feather name={icon} size={30} color={primary} />
      </View>
    </View>
  );
}

export function EmptyState({ icon, title, message, children }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Illustration icon={icon} primary={theme.primary} clay={theme.clay} gold={theme.gold} badgeBg={theme.backgroundElement} />
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  illustrationWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badge: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
