import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { InsightNote } from '@/lib/insights/savingsTips';

interface Props {
  notes: InsightNote[];
}

const ICONS: Record<InsightNote['variant'], keyof typeof Feather.glyphMap> = {
  warn: 'alert-circle',
  gold: 'award',
  default: 'compass',
};

export function StoryTicker({ notes }: Props) {
  const theme = useTheme();
  if (notes.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {notes.map((note) => {
        const bg = note.variant === 'warn' ? theme.clayLight : note.variant === 'gold' ? '#FBF4E3' : theme.primaryLight;
        const tint = note.variant === 'warn' ? theme.clay : note.variant === 'gold' ? theme.gold : theme.primary;
        return (
          <View key={note.tag + note.text} style={[styles.card, { backgroundColor: bg }]}>
            <View style={styles.headRow}>
              <Feather name={ICONS[note.variant]} size={12} color={tint} />
              <ThemedText type="small" style={[styles.tag, { color: tint }]} numberOfLines={1}>
                {note.tag.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.text} numberOfLines={3}>
              {note.text}
            </ThemedText>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingVertical: 2, paddingRight: 4 },
  card: { width: 200, borderRadius: 14, padding: 12, gap: 6, justifyContent: 'flex-start' },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tag: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6 },
  text: { fontSize: 12.5, lineHeight: 17 },
});
