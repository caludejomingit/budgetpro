import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/use-theme';
import { PERSON_PRESETS } from '@/lib/constants/categories';
import { monthLabelOf } from '@/lib/insights/dashboardStats';
import type { DashboardFilters } from '@/lib/insights/dashboardStats';

interface Props {
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
  months: string[];
  categories: string[];
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? theme.primary : theme.backgroundSelected }]}>
      <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function FilterBar({ filters, onChange, months, categories }: Props) {
  return (
    <View style={styles.wrap}>
      <Input placeholder="Search notes…" value={filters.search} onChangeText={(v) => onChange({ ...filters, search: v })} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <Chip label="All months" active={!filters.month} onPress={() => onChange({ ...filters, month: null })} />
        {months.map((m) => (
          <Chip key={m} label={monthLabelOf(m)} active={filters.month === m} onPress={() => onChange({ ...filters, month: filters.month === m ? null : m })} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <Chip label="All categories" active={!filters.category} onPress={() => onChange({ ...filters, category: null })} />
        {categories.map((c) => (
          <Chip key={c} label={c} active={filters.category === c} onPress={() => onChange({ ...filters, category: filters.category === c ? null : c })} />
        ))}
      </ScrollView>

      <View style={styles.chipRow}>
        <Chip label="Everyone" active={!filters.person} onPress={() => onChange({ ...filters, person: null })} />
        {PERSON_PRESETS.map((p) => (
          <Chip key={p} label={p} active={filters.person === p} onPress={() => onChange({ ...filters, person: filters.person === p ? null : p })} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
