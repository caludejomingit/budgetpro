import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NoteCard } from '@/components/insights/NoteCard';
import { TipsList } from '@/components/insights/TipsList';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { buildTipsPool, generateInsights } from '@/lib/insights/savingsTips';
import { daysRemainingInMonth, previousMonthKey } from '@/lib/format/date';
import { useMonth } from '@/lib/state/MonthContext';

export default function InsightsScreen() {
  const theme = useTheme();
  const { viewMonth } = useMonth();
  const prevMonthKey = previousMonthKey(viewMonth);

  const { data: transactions } = useTransactions(viewMonth);
  const { data: prevTransactions } = useTransactions(prevMonthKey);
  const { data: budgets } = useBudgets(viewMonth);

  const summary = useMonthlySummary(transactions);
  const prevSummary = useMonthlySummary(prevTransactions);

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
          <ThemedText type="smallBold">Save more, gently</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
            A few habits worth trying
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
