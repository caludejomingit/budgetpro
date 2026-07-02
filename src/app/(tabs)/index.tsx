import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { IncomeExpenseTrendChart } from '@/components/charts/IncomeExpenseTrendChart';
import { PlantSignature } from '@/components/insights/PlantSignature';
import { TipsList } from '@/components/insights/TipsList';
import { ThemedText } from '@/components/themed-text';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EXPENSE_CATEGORIES } from '@/lib/constants/categories';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthlySummary, useMonthlyTrend } from '@/hooks/useMonthlySummary';
import { useTransactions, useTransactionsRange } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { buildTipsPool } from '@/lib/insights/savingsTips';
import { formatCurrency } from '@/lib/format/currency';
import { useMonth } from '@/lib/state/MonthContext';

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
  iconBg,
  iconColor,
  valueColor,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <Card style={styles.statTile}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={17} color={iconColor} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="amount" style={valueColor ? { color: valueColor } : undefined}>
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
  const { viewMonth } = useMonth();

  const { data: transactions } = useTransactions(viewMonth);
  const { data: budgets } = useBudgets(viewMonth);
  const summary = useMonthlySummary(transactions);

  const { data: rangeTransactions } = useTransactionsRange(6);
  const trend = useMonthlyTrend(rangeTransactions, 6);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'there';

  const rate = summary.totalIncome > 0 ? Math.round((summary.net / summary.totalIncome) * 100) : summary.totalExpense > 0 ? -100 : 0;
  const statusWord = rate >= 20 ? 'thriving' : rate >= 0 ? 'on track' : 'overspending';

  const totalBudget = EXPENSE_CATEGORIES.reduce((sum, name) => {
    const b = (budgets ?? []).find((x) => x.category?.name === name);
    return sum + (b?.limit_amount ?? 0);
  }, 0);
  const budgetRemaining = totalBudget - summary.totalExpense;

  const budgetsSet = (budgets ?? []).filter((b) => b.limit_amount > 0);
  const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.categoryId, c.amount]));

  const recentEntries = [...(transactions ?? [])].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on)).slice(0, 5);
  const tipsPool = buildTipsPool(summary.expenseByCategory.map((c) => ({ categoryId: c.categoryId, categoryName: c.categoryName, amount: c.amount })));

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ScreenHeader eyebrow={`${greeting()}, ${displayName}`} title={`This month, you're ${statusWord}`} accent={statusWord} />
          </View>
          <Card style={styles.plantCard}>
            <PlantSignature rate={rate} />
            <View>
              <ThemedText type="small" themeColor="textMuted">
                Savings rate
              </ThemedText>
              <ThemedText type="subtitle" style={{ color: rate >= 0 ? theme.success : theme.danger }}>
                {rate}%
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <StatTile icon="trending-up" label="Total income" value={formatCurrency(summary.totalIncome)} iconBg={theme.primaryLight} iconColor={theme.primary} />
          <StatTile icon="trending-down" label="Total expenses" value={formatCurrency(summary.totalExpense)} iconBg={theme.clayLight} iconColor={theme.clay} />
          <StatTile
            icon="check-circle"
            label="Net savings"
            value={`${summary.net < 0 ? '-' : ''}${formatCurrency(Math.abs(summary.net))}`}
            iconBg="#EFF4E7"
            iconColor={theme.gold}
            valueColor={summary.net < 0 ? theme.danger : undefined}
          />
          <StatTile
            icon="credit-card"
            label="Budget remaining"
            value={formatCurrency(Math.max(0, budgetRemaining))}
            iconBg={theme.backgroundSelected}
            iconColor={theme.primaryDark}
            valueColor={budgetRemaining < 0 ? theme.danger : undefined}
            sub={totalBudget > 0 ? `of ${formatCurrency(totalBudget)} planned` : 'No budgets set yet'}
          />
        </View>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Where it went</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            Spending by category this month
          </ThemedText>
          <CategoryBreakdownChart data={summary.expenseByCategory} />
        </Card>

        <Card style={styles.trendCard}>
          <ThemedText type="smallBold">Income vs. expenses</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            Last 6 months
          </ThemedText>
          <IncomeExpenseTrendChart data={trend} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Budgets at a glance</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            Your monthly limits
          </ThemedText>
          {budgetsSet.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No budgets set yet. Add one so your diary can tell you when to slow down.
            </ThemedText>
          ) : (
            <View style={styles.budgetPreviewList}>
              {budgetsSet.slice(0, 3).map((b) => {
                const spent = spentByCategory.get(b.category_id) ?? 0;
                return (
                  <View key={b.id} style={styles.budgetPreviewRow}>
                    <ThemedText type="small" numberOfLines={1}>
                      {b.category?.name ?? 'Category'}
                    </ThemedText>
                    <ProgressBar ratio={spent / b.limit_amount} />
                  </View>
                );
              })}
            </View>
          )}
          <ThemedText type="linkPrimary" onPress={() => router.push('/(tabs)/budgets')}>
            Manage budgets →
          </ThemedText>
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Save more, gently</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            A few habits worth trying
          </ThemedText>
          <TipsList pool={tipsPool} />
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">Recent entries</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionSub}>
            Your last few logs this month
          </ThemedText>
          {recentEntries.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              Your diary is empty for this month — add your first entry to start tracking.
            </ThemedText>
          ) : (
            <View>
              {recentEntries.map((t) => (
                <TransactionListItem key={t.id} transaction={t} inset />
              ))}
            </View>
          )}
          <ThemedText type="linkPrimary" onPress={() => router.push('/(tabs)/transactions')}>
            View all entries →
          </ThemedText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  headerText: { flex: 1 },
  plantCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statTile: { flexBasis: '47%', flexGrow: 1, gap: 4 },
  statIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  trendCard: { gap: 2 },
  sectionSub: { marginBottom: 4 },
  card: { gap: 4 },
  emptyText: { paddingVertical: 4 },
  budgetPreviewList: { gap: 12, marginTop: 4, marginBottom: 4 },
  budgetPreviewRow: { gap: 6 },
});
