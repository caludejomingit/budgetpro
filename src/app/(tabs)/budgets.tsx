import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetRow } from '@/components/budgets/BudgetRow';
import { EditBudgetsModal } from '@/components/budgets/EditBudgetsModal';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const categoriesWithBudget = expenseCategories.filter((c) => (limitByCategory.get(c.id) ?? 0) > 0);

  const onSaveBudgets = async (values: Map<string, number>) => {
    if (!user) return;
    setSaving(true);
    try {
      const changed = expenseCategories.filter((c) => (values.get(c.id) ?? 0) !== (limitByCategory.get(c.id) ?? 0));
      await Promise.all(
        changed.map((c) => upsertBudget.mutateAsync({ userId: user.id, categoryId: c.id, month: viewMonth, limitAmount: values.get(c.id) ?? 0 }))
      );
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <Card style={styles.panelCard}>
          <ThemedText type="smallBold">Budgets by category</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.panelSub}>
            Monthly limits you&apos;ve set for yourself
          </ThemedText>
          {categoriesWithBudget.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No budgets set yet. Add one so your diary can tell you when to slow down.
            </ThemedText>
          ) : (
            <View>
              {categoriesWithBudget.map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <View style={[styles.separator, { backgroundColor: theme.border }]} /> : null}
                  <BudgetRow category={c} spent={spentByCategory.get(c.id) ?? 0} limit={limitByCategory.get(c.id) ?? 0} />
                </View>
              ))}
            </View>
          )}
          <Pressable onPress={() => setModalVisible(true)} style={styles.editLink}>
            <ThemedText type="linkPrimary">Edit budgets →</ThemedText>
          </Pressable>
        </Card>
      </ScrollView>

      <EditBudgetsModal
        visible={modalVisible}
        categories={expenseCategories}
        limitByCategoryId={limitByCategory}
        saving={saving}
        onClose={() => setModalVisible(false)}
        onSave={onSaveBudgets}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statTile: { flex: 1, gap: 4 },
  statIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 19 },
  panelCard: { gap: 2 },
  panelSub: { marginBottom: 4 },
  emptyText: { paddingVertical: 4 },
  separator: { height: 1 },
  editLink: { paddingTop: 8 },
});
