import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetVsActualChart } from '@/components/charts/BudgetVsActualChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { IncomeExpenseTrendChart } from '@/components/charts/IncomeExpenseTrendChart';
import { NoteCard } from '@/components/insights/NoteCard';
import { TipsList } from '@/components/insights/TipsList';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary, useMonthlyTrend } from '@/hooks/useMonthlySummary';
import { useTransactions, useTransactionsRange } from '@/hooks/useTransactions';
import { daysRemainingInMonth, previousMonthKey } from '@/lib/format/date';
import { buildTipsPool, generateInsights } from '@/lib/insights/savingsTips';
import { useMonth } from '@/lib/state/MonthContext';

export default function InsightsScreen() {
  const theme = useTheme();
  const { viewMonth } = useMonth();
  const prevMonthKey = previousMonthKey(viewMonth);

  const { data: transactions } = useTransactions(viewMonth);
  const { data: prevTransactions } = useTransactions(prevMonthKey);
  const { data: budgets } = useBudgets(viewMonth);
  const { data: rangeTransactions } = useTransactionsRange(6);

  const summary = useMonthlySummary(transactions);
  const prevSummary = useMonthlySummary(prevTransactions);
  const trend = useMonthlyTrend(rangeTransactions, 6);

  const notes = useMemo(
    () =>
      generateInsights({
        currentMonthExpense: summary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })),
        previousMonthExpense: prevSummary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })),
        budgets: (budgets ?? []).map((b) => ({ categoryId: b.category_id, categoryName: b.category?.name ?? '', limitAmount: b.limit_amount })),
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        daysRemainingInMonth: daysRemainingInMonth(viewMonth) || null,
      }),
    [summary, prevSummary, budgets, viewMonth]
  );

  const tipsPool = buildTipsPool(summary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })));

  const budgetRows = useMemo(() => {
    const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c.amount]));
    return (budgets ?? [])
      .filter((b) => b.limit_amount > 0)
      .map((b) => ({
        categoryId: b.category_id,
        categoryName: b.category?.name ?? 'Category',
        spent: spentByCategory.get(b.category_id) ?? 0,
        limit: b.limit_amount,
      }));
  }, [budgets, summary]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Notes from your numbers" title="What your diary is telling you" accent="telling you" />

        <Card style={styles.card}>
          <ThemedText type="smallBold">This month&apos;s notes</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            Written from your own numbers
          </ThemedText>
          <View style={styles.notesGrid}>
            {notes.map((note) => (
              <NoteCard key={note.tag + note.text} note={note} />
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Where it went</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            Spending by category this month
          </ThemedText>
          <CategoryBreakdownChart data={summary.expenseByCategory} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Income vs. expenses</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            Last 6 months
          </ThemedText>
          <IncomeExpenseTrendChart data={trend} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Budget vs. actual</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            How this month compares to what you planned
          </ThemedText>
          <BudgetVsActualChart rows={budgetRows} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Save more, gently</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            A few habits worth trying — refreshes every 30s
          </ThemedText>
          <TipsList pool={tipsPool} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { gap: 4 },
  cardSubtitle: { marginBottom: 8 },
  notesGrid: { gap: 12 },
});
