import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { shuffle } from '@/lib/insights/savingsTips';

/** Shows up to 3 tips from `pool`, freshly shuffled on every mount (i.e. every screen visit),
 * matching the reference app's renderTips() which reshuffles on each page load. */
export function TipsList({ pool }: { pool: string[] }) {
  const theme = useTheme();
  const tips = useMemo(() => shuffle(pool).slice(0, Math.min(3, pool.length)), [pool]);

  return (
    <View style={styles.list}>
      {tips.map((tip) => (
        <View key={tip} style={styles.row}>
          <Feather name="check-circle" size={15} color={theme.primary} style={styles.icon} />
          <ThemedText type="small" style={styles.text}>
            {tip}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, marginTop: 6 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  icon: { marginTop: 1 },
  text: { flex: 1, lineHeight: 19 },
});
