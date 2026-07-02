import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MonthPicker } from '@/components/transactions/MonthPicker';
import { BudgetRow } from '@/components/budgets/BudgetRow';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets, useUpsertBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { currentMonthKey, type MonthKey } from '@/lib/format/date';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey());

  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions(monthKey);
  const { data: budgets } = useBudgets(monthKey);
  const upsertBudget = useUpsertBudget();
  const summary = useMonthlySummary(transactions);

  const expenseCategories = (categories ?? []).filter((c) => c.type === 'expense');
  const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c.amount]));
  const limitByCategory = new Map((budgets ?? []).map((b) => [b.category_id, b.limit_amount]));

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <MonthPicker monthKey={monthKey} onChange={setMonthKey} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Tap a budget amount to set or edit it.
        </ThemedText>
      </View>
      <FlatList
        data={expenseCategories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.backgroundElement }]} />}
        renderItem={({ item }) => (
          <BudgetRow
            category={item}
            spent={spentByCategory.get(item.id) ?? 0}
            limit={limitByCategory.get(item.id) ?? 0}
            onSave={(limitAmount) => {
              if (!user) return;
              upsertBudget.mutate({ userId: user.id, categoryId: item.id, month: monthKey, limitAmount });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingVertical: 12, alignItems: 'center' },
  hint: { marginTop: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  separator: { height: 1 },
});
