import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/useTransactions';
import { exportTransactionsToXlsx } from '@/lib/export/exportTransactions';
import { useMonth } from '@/lib/state/MonthContext';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { viewMonth } = useMonth();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: transactions, isLoading } = useTransactions(viewMonth);
  const { data: categories } = useCategories();

  const usedCategoryIds = useMemo(() => new Set((transactions ?? []).map((t) => t.category_id)), [transactions]);
  const filterChips = (categories ?? []).filter((c) => usedCategoryIds.has(c.id));

  const filtered = (transactions ?? []).filter((t) => !categoryFilter || t.category_id === categoryFilter);

  const onExport = async () => {
    if (!transactions || transactions.length === 0) return;
    setIsExporting(true);
    try {
      await exportTransactionsToXlsx(transactions);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Every rupee, logged" title="All entries this month" accent="All entries" />
            <Card style={styles.listCard}>
              <View style={styles.listCardHeader}>
                <View style={styles.flexShrink}>
                  <ThemedText type="smallBold">Transactions</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Everything logged this month
                  </ThemedText>
                </View>
                <Pressable
                  onPress={onExport}
                  disabled={isExporting || !transactions?.length}
                  style={[styles.exportBtn, { backgroundColor: theme.primary, opacity: transactions?.length ? 1 : 0.5 }]}>
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Feather name="download" size={14} color="#ffffff" />
                  )}
                  <ThemedText type="small" style={{ color: '#ffffff', fontWeight: '700' }}>
                    Export to Excel
                  </ThemedText>
                </Pressable>
              </View>
            </Card>

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
                      style={[styles.chip, { backgroundColor: active ? item.color ?? theme.backgroundSelected : theme.backgroundSelected }]}>
                      <ThemedText type="small" style={{ color: active ? '#ffffff' : theme.text }}>
                        {item.name}
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
        renderItem={({ item }) => <TransactionListItem transaction={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="inbox" title="No transactions" message="Your diary is empty for this month — add your first entry to start tracking." />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listCard: { marginHorizontal: 20, marginTop: 20 },
  listCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flexShrink: { flexShrink: 1 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  chipRow: { paddingHorizontal: 20, gap: 8, paddingTop: 12, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  list: { paddingTop: 0, paddingHorizontal: 0, paddingBottom: 40, flexGrow: 1 },
  separator: { height: 1, marginHorizontal: 20 },
});
