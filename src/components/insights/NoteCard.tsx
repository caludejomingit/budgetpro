import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { InsightNote } from '@/lib/insights/savingsTips';

export function NoteCard({ note }: { note: InsightNote }) {
  const theme = useTheme();
  const bg = note.variant === 'warn' ? theme.clayLight : note.variant === 'gold' ? '#FBF4E3' : theme.primaryLight;
  const border = note.variant === 'warn' ? '#EFD9CB' : note.variant === 'gold' ? '#EFDFB0' : '#D7E9DC';
  const tagColor = note.variant === 'warn' ? theme.clay : note.variant === 'gold' ? theme.gold : theme.primary;

  return (
    <View style={[styles.note, { backgroundColor: bg, borderColor: border }]}>
      <ThemedText type="small" style={[styles.tag, { color: tagColor }]}>
        {note.tag.toUpperCase()}
      </ThemedText>
      <ThemedText type="tagline" style={styles.text}>
        {note.text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: Radius.md, borderWidth: 1, padding: 16, flexBasis: '100%', minWidth: 220 },
  tag: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  text: { fontSize: 14.5, lineHeight: 21 },
});
