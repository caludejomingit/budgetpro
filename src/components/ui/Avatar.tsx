import { StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChartColors } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 64 }: AvatarProps) {
  const scheme = useColorScheme();
  const accent = ChartColors[scheme === 'dark' ? 'dark' : 'light'].accent;
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: accent }]}>
      <ThemedText style={{ color: '#ffffff', fontSize: size * 0.4, fontWeight: '700' }}>{initial}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
