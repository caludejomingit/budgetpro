import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { EssentialSplitBar } from '@/components/dashboard/EssentialSplitBar';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { HeatMatrix } from '@/components/dashboard/HeatMatrix';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { RankedBarList } from '@/components/dashboard/RankedBarList';
import { StackedMonthChart } from '@/components/dashboard/StackedMonthChart';
import { Treemap } from '@/components/dashboard/Treemap';
import { TransactionExplorer } from '@/components/dashboard/TransactionExplorer';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/use-theme';
import { useAllTransactions } from '@/hooks/useTransactions';
import {
  buildHeatMatrix,
  categoryTotals,
  essentialSplit,
  filterTransactions,
  monthlyTotals,
  orderedMonthKeys,
  stackedByMonthAndCategory,
  topItemsByNote,
  type DashboardFilters,
} from '@/lib/insights/dashboardStats';

export default function DashboardScreen() {
  const theme = useTheme();
  const { data: transactions, isLoading } = useAllTransactions();
  const [filters, setFilters] = useState<DashboardFilters>({ month: null, category: null, person: null, search: '' });

  const allExpenses = useMemo(() => (transactions ?? []).filter((t) => t.type === 'expense'), [transactions]);
  const allMonths = useMemo(() => orderedMonthKeys(allExpenses), [allExpenses]);
  const allCategories = useMemo(() => categoryTotals(allExpenses).map((c) => c.name), [allExpenses]);

  const filtered = useMemo(() => filterTransactions(allExpenses, filters), [allExpenses, filters]);
  const filteredMonths = useMemo(() => orderedMonthKeys(filtered), [filtered]);
  const cats = useMemo(() => categoryTotals(filtered), [filtered]);
  const trend = useMemo(() => monthlyTotals(filtered, filteredMonths), [filtered, filteredMonths]);
  const topItems = useMemo(() => topItemsByNote(filtered, 10), [filtered]);
  const heatMatrix = useMemo(() => buildHeatMatrix(filtered, filteredMonths), [filtered, filteredMonths]);
  const stacked = useMemo(() => stackedByMonthAndCategory(filtered, filteredMonths, heatMatrix.categories), [filtered, filteredMonths, heatMatrix.categories]);
  const split = useMemo(() => essentialSplit(filtered), [filtered]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const savings = cats.find((c) => c.name === 'Savings')?.total ?? 0;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleWrap}>
          <ThemedText type="subtitle">Analytics Dashboard</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every transaction, every angle
          </ThemedText>
        </View>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: theme.backgroundSelected }]}>
          <Feather name="x" size={18} color={theme.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <FilterBar filters={filters} onChange={setFilters} months={allMonths} categories={allCategories} />

          <KpiRow
            total={total}
            transactionCount={filtered.length}
            activeMonths={filteredMonths.length}
            topCategory={cats[0] ? { name: cats[0].name, total: cats[0].total } : null}
            savings={savings}
          />

          <Card style={styles.card}>
            <ThemedText type="smallBold">Monthly Spend Trend</ThemedText>
            <TrendChart data={trend} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Spend by Category</ThemedText>
            <CategoryDonut data={cats} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Top 10 Spending Items</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
              Grouped by note/description
            </ThemedText>
            <RankedBarList data={topItems} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Category × Month Heat Matrix</ThemedText>
            <HeatMatrix matrix={heatMatrix} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Monthly Spend by Category</ThemedText>
            <StackedMonthChart data={stacked} categories={heatMatrix.categories} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Category Proportion</ThemedText>
            <Treemap data={cats} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Essential vs. Non-Essential Spend</ThemedText>
            <EssentialSplitBar essential={split.essential} nonEssential={split.nonEssential} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Transaction Explorer</ThemedText>
            <TransactionExplorer transactions={filtered} />
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitleWrap: { gap: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { gap: 6 },
  cardSubtitle: { marginTop: -4, marginBottom: 4 },
  loader: { marginTop: 40 },
});
