import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Tip } from '@/lib/insights/savingsTips';

const ROTATE_MS = 30_000;

const LABELS: Record<Tip['severity'], string> = {
  critical: 'Needs attention',
  warning: 'Worth a look',
  info: 'Heads up',
};

export function RotatingTipNote({ tips }: { tips: Tip[] }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [tips]);

  useEffect(() => {
    if (tips.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % tips.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [tips.length]);

  if (tips.length === 0) {
    return (
      <View style={[styles.note, { backgroundColor: theme.primaryLight }]}>
        <ThemedText type="small" themeColor="textMuted" style={styles.label}>
          ALL QUIET
        </ThemedText>
        <ThemedText type="tagline" style={[styles.message, { color: theme.primaryDark }]}>
          Nothing to flag this month. Keep logging entries and I&apos;ll keep watching your numbers.
        </ThemedText>
      </View>
    );
  }

  const tip = tips[index];
  const bg = tip.severity === 'critical' ? theme.clayLight : tip.severity === 'warning' ? theme.clayLight : theme.primaryLight;
  const textColor = tip.severity === 'info' ? theme.primaryDark : theme.danger;

  return (
    <View style={[styles.note, { backgroundColor: bg }]}>
      <View style={styles.headerRow}>
        <ThemedText type="small" themeColor="textMuted" style={styles.label}>
          {LABELS[tip.severity].toUpperCase()}
        </ThemedText>
        {tips.length > 1 ? (
          <View style={styles.dots}>
            {tips.map((t, i) => (
              <View key={t.id} style={[styles.dot, { backgroundColor: i === index ? textColor : theme.border }]} />
            ))}
          </View>
        ) : null}
      </View>
      <ThemedText type="tagline" style={[styles.message, { color: textColor }]}>
        {tip.message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: 14, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8 },
  message: { fontSize: 15, lineHeight: 21 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
