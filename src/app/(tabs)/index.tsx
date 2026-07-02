import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IncomeExpenseTrendChart } from '@/components/charts/IncomeExpenseTrendChart';
import { ThemedText } from '@/components/themed-text';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary, useMonthlyTrend } from '@/hooks/useMonthlySummary';
import { useTransactions, useTransactionsRange } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency } from '@/lib/format/currency';
import { currentMonthKey } from '@/lib/format/date';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatTile({
  icon,
  label,
  value,
  tint,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tint: string;
  sub?: string;
}) {
  return (
    <Card style={styles.statTile}>
      <View style={[styles.statIconWrap, { backgroundColor: `${tint}22` }]}>
        <Feather name={icon} size={16} color={tint} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.statValue}>
        {value}
      </ThemedText>
      {sub ? (
        <ThemedText type="small" themeColor="textMuted">
          {sub}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const monthKey = currentMonthKey();

  const { data: transactions } = useTransactions(monthKey);
  const { data: budgets } = useBudgets(monthKey);
  const summary = useMonthlySummary(transactions);

  const { data: rangeTransactions } = useTransactionsRange(6);
  const trend = useMonthlyTrend(rangeTransactions, 6);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'there';

  const savingsRate = summary.totalIncome > 0 ? Math.round((summary.net / summary.totalIncome) * 100) : 0;
  const statusWord = summary.totalIncome === 0 && summary.totalExpense === 0 ? 'getting started' : summary.net >= 0 ? 'on track' : 'overspending';

  const budgetsSet = (budgets ?? []).filter((b) => b.limit_amount > 0);
  const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c.amount]));
  const totalBudgetLimit = budgetsSet.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalBudgetSpent = budgetsSet.reduce((sum, b) => sum + (spentByCategory.get(b.category_id) ?? 0), 0);
  const budgetRemaining = totalBudgetLimit - totalBudgetSpent;

  const recentEntries = (transactions ?? []).slice(0, 5);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <ScreenHeader eyebrow={`${greeting()}, ${displayName}`} title={`This month, you're ${statusWord}`} accent={statusWord} />
          <Pressable onPress={() => router.push('/transaction/new')} style={[styles.fab, { backgroundColor: theme.primary }]}>
            <Feather name="plus" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <Card style={styles.savingsCard}>
          <View style={[styles.savingsIconWrap, { backgroundColor: theme.primaryLight }]}>
            <Feather name="trending-up" size={20} color={theme.primary} />
          </View>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Savings rate
            </ThemedText>
            <ThemedText type="subtitle" style={{ color: theme.primary }}>
              {savingsRate}%
            </ThemedText>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <StatTile icon="trending-up" label="Total income" value={formatCurrency(summary.totalIncome)} tint={theme.success} />
          <StatTile icon="trending-down" label="Total expenses" value={formatCurrency(summary.totalExpense)} tint={theme.danger} />
          <StatTile icon="check-circle" label="Net savings" value={formatCurrency(summary.net)} tint={theme.gold} />
          <StatTile
            icon="calendar"
            label="Budget remaining"
            value={formatCurrency(budgetRemaining)}
            tint={theme.gold}
            sub={budgetsSet.length === 0 ? 'No budgets set yet' : undefined}
          />
        </View>

        <Card style={styles.trendCard}>
          <ThemedText type="smallBold">Income vs. expenses</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            Last 6 months
          </ThemedText>
          <IncomeExpenseTrendChart data={trend} />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <ThemedText type="smallBold">Budgets at a glance</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Your monthly limits
              </ThemedText>
            </View>
          </View>
          {budgetsSet.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No budgets set yet. Add one so you know when to slow down.
            </ThemedText>
          ) : (
            <View style={styles.budgetPreviewList}>
              {budgetsSet.slice(0, 3).map((b) => {
                const spent = spentByCategory.get(b.category_id) ?? 0;
                return (
                  <View key={b.id} style={styles.budgetPreviewRow}>
                    <ThemedText type="small" numberOfLines={1} style={styles.budgetPreviewLabel}>
                      {b.category?.name ?? 'Category'}
                    </ThemedText>
                    <ProgressBar ratio={spent / b.limit_amount} />
                  </View>
                );
              })}
            </View>
          )}
          <Pressable onPress={() => router.push('/(tabs)/budgets')}>
            <ThemedText type="linkPrimary">Manage budgets →</ThemedText>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <ThemedText type="smallBold">Recent entries</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Your last few logs this month
              </ThemedText>
            </View>
          </View>
          {recentEntries.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              Nothing logged this month yet — add your first entry to start tracking.
            </ThemedText>
          ) : (
            <View>
              {recentEntries.map((t) => (
                <TransactionListItem key={t.id} transaction={t} inset />
              ))}
            </View>
          )}
          <Pressable onPress={() => router.push('/(tabs)/transactions')}>
            <ThemedText type="linkPrimary">View all entries →</ThemedText>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fab: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  savingsCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savingsIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statTile: { flexBasis: '47%', flexGrow: 1, gap: 4 },
  statIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 20 },
  trendCard: { gap: 2 },
  sectionSub: { marginBottom: 4 },
  card: { gap: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyText: { paddingVertical: 4 },
  budgetPreviewList: { gap: 12 },
  budgetPreviewRow: { gap: 6 },
  budgetPreviewLabel: {},
});
