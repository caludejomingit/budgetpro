import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BudgetVsActualChart } from '@/components/charts/BudgetVsActualChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { MonthPicker } from '@/components/transactions/MonthPicker';
import { Card } from '@/components/ui/Card';
import { TipCard } from '@/components/insights/TipCard';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { generateSavingsTips } from '@/lib/insights/savingsTips';
import { currentMonthKey, daysRemainingInMonth, previousMonthKey, type MonthKey } from '@/lib/format/date';

export default function InsightsScreen() {
  const theme = useTheme();
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey());
  const prevMonthKey = previousMonthKey(monthKey);

  const { data: transactions } = useTransactions(monthKey);
  const { data: prevTransactions } = useTransactions(prevMonthKey);
  const { data: budgets } = useBudgets(monthKey);

  const summary = useMonthlySummary(transactions);
  const prevSummary = useMonthlySummary(prevTransactions);

  const budgetRows = useMemo(() => {
    const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c]));
    return (budgets ?? [])
      .filter((b) => b.limit_amount > 0)
      .map((b) => ({
        categoryId: b.category_id,
        categoryName: b.category?.name ?? 'Category',
        spent: spentByCategory.get(b.category_id)?.amount ?? 0,
        limit: b.limit_amount,
      }));
  }, [budgets, summary]);

  const tips = useMemo(
    () =>
      generateSavingsTips({
        currentMonthExpense: summary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })),
        previousMonthExpense: prevSummary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })),
        budgets: (budgets ?? []).map((b) => ({ categoryId: b.category_id, categoryName: b.category?.name ?? '', limitAmount: b.limit_amount })),
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        daysRemainingInMonth: daysRemainingInMonth(monthKey),
      }),
    [summary, prevSummary, budgets, monthKey]
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthPicker monthKey={monthKey} onChange={setMonthKey} />

        <Card style={styles.card}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Spending by category
          </ThemedText>
          <CategoryBreakdownChart data={summary.expenseByCategory} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Budget vs. actual
          </ThemedText>
          <BudgetVsActualChart rows={budgetRows} />
        </Card>

        <View style={styles.tipsSection}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Tips for you
          </ThemedText>
          <View style={styles.tipsList}>
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { gap: 8 },
  sectionTitle: { marginBottom: 4 },
  tipsSection: { gap: 8 },
  tipsList: { gap: 10 },
});
