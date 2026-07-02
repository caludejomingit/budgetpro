import { Feather } from '@expo/vector-icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetRow } from '@/components/budgets/BudgetRow';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets, useUpsertBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency } from '@/lib/format/currency';
import { useMonth } from '@/lib/state/MonthContext';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { viewMonth } = useMonth();

  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions(viewMonth);
  const { data: budgets } = useBudgets(viewMonth);
  const upsertBudget = useUpsertBudget();
  const summary = useMonthlySummary(transactions);

  const expenseCategories = (categories ?? []).filter((c) => c.type === 'expense');
  const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c.amount]));
  const limitByCategory = new Map((budgets ?? []).map((b) => [b.category_id, b.limit_amount]));

  const budgetsSet = (budgets ?? []).filter((b) => b.limit_amount > 0);
  const totalLimit = budgetsSet.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalSpent = budgetsSet.reduce((sum, b) => sum + (spentByCategory.get(b.category_id) ?? 0), 0);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <FlatList
        data={expenseCategories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Plan ahead" title="Your budgets this month" accent="budgets" />
            <View style={styles.statsRow}>
              <Card style={styles.statTile}>
                <View style={[styles.statIconWrap, { backgroundColor: theme.clayLight }]}>
                  <Feather name="trending-down" size={16} color={theme.clay} />
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Spent this month
                </ThemedText>
                <ThemedText type="amount" style={styles.statValue}>
                  {formatCurrency(totalSpent)}
                </ThemedText>
              </Card>
              <Card style={styles.statTile}>
                <View style={[styles.statIconWrap, { backgroundColor: theme.backgroundSelected }]}>
                  <Feather name="credit-card" size={16} color={theme.primaryDark} />
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Budget remaining
                </ThemedText>
                <ThemedText type="amount" style={styles.statValue}>
                  {formatCurrency(totalLimit - totalSpent)}
                </ThemedText>
                {budgetsSet.length === 0 ? (
                  <ThemedText type="small" themeColor="textMuted">
                    No budgets set yet
                  </ThemedText>
                ) : null}
              </Card>
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              Tap a budget amount to set or edit it.
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
        renderItem={({ item }) => (
          <BudgetRow
            category={item}
            spent={spentByCategory.get(item.id) ?? 0}
            limit={limitByCategory.get(item.id) ?? 0}
            onSave={(limitAmount) => {
              if (!user) return;
              upsertBudget.mutate({ userId: user.id, categoryId: item.id, month: viewMonth, limitAmount });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statTile: { flex: 1, gap: 4 },
  statIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 19 },
  hint: { marginTop: 16, marginBottom: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  separator: { height: 1 },
});
