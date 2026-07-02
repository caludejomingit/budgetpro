import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { shuffle } from '@/lib/insights/savingsTips';

const ROTATE_MS = 30_000;

/** Shows up to 3 tips from `pool`, reshuffled every 30 seconds so the set keeps changing. */
export function TipsList({ pool }: { pool: string[] }) {
  const theme = useTheme();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (pool.length <= 3) return;
    const id = setInterval(() => setTick((t) => t + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, [pool.length]);

  const tips = useMemo(() => shuffle(pool).slice(0, Math.min(3, pool.length)), [pool, tick]);

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
