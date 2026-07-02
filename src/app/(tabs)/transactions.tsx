import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MonthPicker } from '@/components/transactions/MonthPicker';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/useTransactions';
import { currentMonthKey, type MonthKey } from '@/lib/format/date';

export default function TransactionsScreen() {
  const theme = useTheme();
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: transactions, isLoading } = useTransactions(monthKey);
  const { data: categories } = useCategories();

  const usedCategoryIds = useMemo(() => new Set((transactions ?? []).map((t) => t.category_id)), [transactions]);
  const filterChips = (categories ?? []).filter((c) => usedCategoryIds.has(c.id));

  const filtered = (transactions ?? []).filter((t) => !categoryFilter || t.category_id === categoryFilter);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <MonthPicker monthKey={monthKey} onChange={setMonthKey} />
      </View>

      {filterChips.length > 0 ? (
        <FlatList
          horizontal
          data={filterChips}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const active = categoryFilter === item.id;
            return (
              <Pressable
                onPress={() => setCategoryFilter(active ? null : item.id)}
                style={[styles.chip, { backgroundColor: active ? item.color ?? theme.backgroundElement : theme.backgroundElement }]}>
                <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
                  {item.name}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.backgroundElement }]} />}
        renderItem={({ item }) => <TransactionListItem transaction={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="inbox" title="No transactions" message="You haven't added any income or expenses for this month yet." />
          ) : null
        }
      />

      <Pressable onPress={() => router.push('/transaction/new')} style={[styles.fab, { backgroundColor: theme.primary }]}>
        <Feather name="plus" size={24} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingVertical: 12 },
  chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 },
  separator: { height: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
