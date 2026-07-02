import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetVsActualChart } from '@/components/charts/BudgetVsActualChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { RotatingTipNote } from '@/components/insights/RotatingTipNote';
import { ThemedText } from '@/components/themed-text';
import { MonthPicker } from '@/components/transactions/MonthPicker';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { GENERAL_SAVINGS_TIPS } from '@/lib/constants/generalTips';
import { currentMonthKey, daysRemainingInMonth, previousMonthKey, type MonthKey } from '@/lib/format/date';
import { generateSavingsTips } from '@/lib/insights/savingsTips';

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
        <ScreenHeader eyebrow="Notes from your numbers" title="What your diary is telling you" accent="telling you" />
        <MonthPicker monthKey={monthKey} onChange={setMonthKey} />

        <Card style={styles.card}>
          <ThemedText type="smallBold">This month&apos;s notes</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            Written from your own numbers, refreshes every 30s
          </ThemedText>
          <RotatingTipNote tips={tips} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Save more, gently</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            A few habits worth trying
          </ThemedText>
          <View style={styles.habitList}>
            {GENERAL_SAVINGS_TIPS.slice(0, 3).map((habit) => (
              <View key={habit} style={styles.habitRow}>
                <Feather name="check-circle" size={15} color={theme.primary} style={styles.habitIcon} />
                <ThemedText type="small" style={styles.habitText}>
                  {habit}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { gap: 4 },
  cardSubtitle: { marginBottom: 8 },
  sectionTitle: { marginBottom: 4 },
  habitList: { gap: 10, marginTop: 4 },
  habitRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  habitIcon: { marginTop: 2 },
  habitText: { flex: 1, lineHeight: 19 },
});
