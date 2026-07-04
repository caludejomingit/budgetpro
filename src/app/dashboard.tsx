import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IncomeExpenseTrendChart } from '@/components/charts/IncomeExpenseTrendChart';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { EssentialSplitBar } from '@/components/dashboard/EssentialSplitBar';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { HeatMatrix } from '@/components/dashboard/HeatMatrix';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { RankedBarList } from '@/components/dashboard/RankedBarList';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { StackedMonthChart } from '@/components/dashboard/StackedMonthChart';
import { StoryTicker } from '@/components/dashboard/StoryTicker';
import { Treemap } from '@/components/dashboard/Treemap';
import { TransactionExplorer } from '@/components/dashboard/TransactionExplorer';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { useAllTransactions } from '@/hooks/useTransactions';
import {
  buildDashboardStory,
  buildHeatMatrix,
  categoryTotals,
  essentialSplit,
  filterTransactions,
  monthlyIncomeExpense,
  monthlyTotals,
  orderedMonthKeys,
  stackedByMonthAndCategory,
  topItemsByNote,
  type DashboardFilters,
} from '@/lib/insights/dashboardStats';

function GroupLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <ThemedText type="small" themeColor="textMuted" style={[styles.groupLabel, { borderColor: theme.border }]}>
      {children.toUpperCase()}
    </ThemedText>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { data: transactions, isLoading } = useAllTransactions();
  const [filters, setFilters] = useState<DashboardFilters>({ type: null, month: null, category: null, person: null, search: '' });

  const all = useMemo(() => transactions ?? [], [transactions]);
  const allMonths = useMemo(() => orderedMonthKeys(all), [all]);
  const allExpenseCategories = useMemo(() => categoryTotals(all.filter((t) => t.type === 'expense')).map((c) => c.name), [all]);

  const filtered = useMemo(() => filterTransactions(all, filters), [all, filters]);
  const filteredMonths = useMemo(() => orderedMonthKeys(filtered), [filtered]);
  const filteredExpense = useMemo(() => filtered.filter((t) => t.type === 'expense'), [filtered]);
  const filteredIncome = useMemo(() => filtered.filter((t) => t.type === 'income'), [filtered]);

  const expenseCats = useMemo(() => categoryTotals(filteredExpense), [filteredExpense]);
  const incomeCats = useMemo(() => categoryTotals(filteredIncome), [filteredIncome]);
  const incomeExpenseTrend = useMemo(() => monthlyIncomeExpense(filtered, filteredMonths), [filtered, filteredMonths]);
  const expenseTrend = useMemo(() => monthlyTotals(filteredExpense, filteredMonths), [filteredExpense, filteredMonths]);
  const topItems = useMemo(() => topItemsByNote(filteredExpense, 10), [filteredExpense]);
  const heatMatrix = useMemo(() => buildHeatMatrix(filteredExpense, filteredMonths), [filteredExpense, filteredMonths]);
  const stacked = useMemo(() => stackedByMonthAndCategory(filteredExpense, filteredMonths, heatMatrix.categories), [filteredExpense, filteredMonths, heatMatrix.categories]);
  const split = useMemo(() => essentialSplit(filteredExpense), [filteredExpense]);
  const story = useMemo(
    () => buildDashboardStory(filteredExpense, filteredIncome.reduce((s, t) => s + t.amount, 0), filteredMonths, expenseCats, expenseTrend, split),
    [filteredExpense, filteredIncome, filteredMonths, expenseCats, expenseTrend, split]
  );

  const totalIncome = filteredIncome.reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredExpense.reduce((s, t) => s + t.amount, 0);

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
      ) : all.length === 0 ? (
        <EmptyState icon="compass" title="Nothing to tell yet" message="Log a few transactions and this dashboard will turn them into your money story." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <DashboardHero income={totalIncome} expense={totalExpense} months={filteredMonths.length} />

          <StoryTicker notes={story} />

          <FilterBar filters={filters} onChange={setFilters} months={allMonths} categories={allExpenseCategories} />

          <KpiRow
            income={totalIncome}
            expense={totalExpense}
            transactionCount={filtered.length}
            activeMonths={filteredMonths.length}
            topCategory={expenseCats[0] ? { name: expenseCats[0].name, total: expenseCats[0].total } : null}
          />

          <GroupLabel>Trends</GroupLabel>

          <Card style={styles.card}>
            <SectionHeader icon="trending-up" title="Income vs. Expense" subtitle="Month by month" />
            <IncomeExpenseTrendChart data={incomeExpenseTrend} />
          </Card>

          <GroupLabel>Where it goes</GroupLabel>

          <Card style={styles.card}>
            <SectionHeader icon="pie-chart" title="Expense by Category" />
            <CategoryDonut data={expenseCats} />
          </Card>

          {incomeCats.length > 0 ? (
            <Card style={styles.card}>
              <SectionHeader icon="arrow-down-circle" title="Income Sources" />
              <RankedBarList data={incomeCats.map((c) => ({ label: c.name, total: c.total }))} />
            </Card>
          ) : null}

          <Card style={styles.card}>
            <SectionHeader icon="bar-chart-2" title="Top 10 Spending Items" subtitle="Grouped by note/description" />
            <RankedBarList data={topItems} />
          </Card>

          <Card style={styles.card}>
            <SectionHeader icon="check-circle" title="Essential vs. Non-Essential" />
            <EssentialSplitBar essential={split.essential} nonEssential={split.nonEssential} />
          </Card>

          <GroupLabel>Patterns</GroupLabel>

          <Card style={styles.card}>
            <SectionHeader icon="grid" title="Category × Month Heat Matrix" />
            <HeatMatrix matrix={heatMatrix} />
          </Card>

          <Card style={styles.card}>
            <SectionHeader icon="bar-chart-2" title="Monthly Spend by Category" />
            <StackedMonthChart data={stacked} categories={heatMatrix.categories} />
          </Card>

          <Card style={styles.card}>
            <SectionHeader icon="square" title="Category Proportion" />
            <Treemap data={expenseCats} />
          </Card>

          <GroupLabel>All transactions</GroupLabel>

          <Card style={styles.card}>
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
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  groupLabel: { fontWeight: '700', fontSize: 11, letterSpacing: 0.8, paddingTop: 10, borderTopWidth: 1 },
  card: { gap: 12 },
  loader: { marginTop: 40 },
});
