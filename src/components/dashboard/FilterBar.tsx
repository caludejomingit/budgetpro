import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
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
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? theme.primary : theme.backgroundSelected }]}>
      <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function Segment({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.segment, { backgroundColor: active ? color : 'transparent' }]}>
      <ThemedText type="small" style={active ? { color: '#ffffff', fontWeight: '700' } : undefined} themeColor={active ? undefined : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function FilterBar({ filters, onChange, months, categories }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const activeCount = [filters.month, filters.category, filters.person].filter(Boolean).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={[styles.segmentRow, { backgroundColor: theme.backgroundSelected }]}>
          <Segment label="All" active={!filters.type} onPress={() => onChange({ ...filters, type: null })} color={theme.text} />
          <Segment label="Income" active={filters.type === 'income'} onPress={() => onChange({ ...filters, type: 'income' })} color={theme.success} />
          <Segment label="Expense" active={filters.type === 'expense'} onPress={() => onChange({ ...filters, type: 'expense' })} color={theme.clay} />
        </View>
        <Pressable onPress={() => setExpanded((v) => !v)} style={[styles.moreBtn, { backgroundColor: theme.backgroundSelected }]}>
          <Feather name="sliders" size={13} color={theme.text} />
          <ThemedText type="small" style={styles.moreLabel}>
            Filters{activeCount ? ` (${activeCount})` : ''}
          </ThemedText>
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={theme.textMuted} />
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.expandedWrap}>
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  topRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  segmentRow: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 2, flex: 1 },
  segment: { flex: 1, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 12, borderRadius: 12 },
  moreLabel: { fontWeight: '600' },
  expandedWrap: { gap: 10 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
