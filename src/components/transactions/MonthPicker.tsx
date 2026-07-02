import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { currentMonthKey, formatMonthLabel, nextMonthKey, previousMonthKey, type MonthKey } from '@/lib/format/date';

interface MonthPickerProps {
  monthKey: MonthKey;
  onChange: (monthKey: MonthKey) => void;
}

export function MonthPicker({ monthKey, onChange }: MonthPickerProps) {
  const theme = useTheme();
  const isCurrentMonth = monthKey === currentMonthKey();

  return (
    <View style={styles.row}>
      <Pressable onPress={() => onChange(previousMonthKey(monthKey))} hitSlop={12} style={styles.arrow}>
        <Feather name="chevron-left" size={22} color={theme.text} />
      </Pressable>
      <ThemedText type="smallBold" style={styles.label}>
        {formatMonthLabel(monthKey)}
      </ThemedText>
      <Pressable onPress={() => !isCurrentMonth && onChange(nextMonthKey(monthKey))} hitSlop={12} style={styles.arrow} disabled={isCurrentMonth}>
        <Feather name="chevron-right" size={22} color={isCurrentMonth ? theme.textMuted : theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  label: { minWidth: 140, textAlign: 'center' },
  arrow: { padding: 4 },
});
