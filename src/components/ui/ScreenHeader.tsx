import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  /** Substring of `title` to render in italic serif brand green. Case-sensitive, first match. */
  accent?: string;
}

export function ScreenHeader({ eyebrow, title, accent }: ScreenHeaderProps) {
  const theme = useTheme();
  const parts = accent && title.includes(accent) ? title.split(accent) : null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{eyebrow.toUpperCase()}</Text>
      {parts ? (
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
          {parts[0]}
          <Text style={{ fontFamily: Fonts.serifItalic, color: theme.primary }}>{accent}</Text>
          {parts[1]}
        </Text>
      ) : (
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 26, lineHeight: 32 },
});
