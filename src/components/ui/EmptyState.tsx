import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ChartColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
  children?: React.ReactNode;
}

/** A minimal illustration: a soft decorative ring behind a centered line icon. */
function Illustration({ icon, accent }: { icon: keyof typeof Feather.glyphMap; accent: string }) {
  return (
    <View style={styles.illustrationWrap}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <Circle cx={70} cy={70} r={68} fill={accent} opacity={0.08} />
        <Circle cx={70} cy={70} r={48} fill={accent} opacity={0.12} />
      </Svg>
      <View style={styles.iconOverlay}>
        <Feather name={icon} size={40} color={accent} />
      </View>
    </View>
  );
}

export function EmptyState({ icon, title, message, children }: EmptyStateProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const accent = ChartColors[scheme === 'dark' ? 'dark' : 'light'].accent;

  return (
    <View style={styles.container}>
      <Illustration icon={icon} accent={accent} />
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
  iconOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
