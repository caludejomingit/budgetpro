import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IncomeExpenseTrendChart } from '@/components/charts/IncomeExpenseTrendChart';
import { Card } from '@/components/ui/Card';
import { ChartColors } from '@/constants/theme';
import { useMonthlySummary, useMonthlyTrend } from '@/hooks/useMonthlySummary';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions, useTransactionsRange } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency } from '@/lib/format/currency';
import { currentMonthKey, formatMonthLabel } from '@/lib/format/date';

function StatTile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card style={styles.statTile}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="title" style={[styles.statValue, color ? { color } : null]}>
        {value}
      </ThemedText>
    </Card>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const scheme = useColorScheme();
  const palette = ChartColors[scheme === 'dark' ? 'dark' : 'light'];
  const monthKey = currentMonthKey();

  const { data: transactions } = useTransactions(monthKey);
  const summary = useMonthlySummary(transactions);

  const { data: rangeTransactions } = useTransactionsRange(6);
  const trend = useMonthlyTrend(rangeTransactions, 6);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'there';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText themeColor="textSecondary">Hi, {displayName}</ThemedText>
            <ThemedText type="title" style={styles.monthTitle}>
              {formatMonthLabel(monthKey)}
            </ThemedText>
          </View>
          <Pressable onPress={() => router.push('/transaction/new')} style={[styles.fab, { backgroundColor: palette.accent }]}>
            <Feather name="plus" size={24} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Income" value={formatCurrency(summary.totalIncome)} color={palette.income} />
          <StatTile label="Expense" value={formatCurrency(summary.totalExpense)} color={palette.expense} />
        </View>
        <Card style={styles.netCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Net this month
          </ThemedText>
          <ThemedText type="title" style={[styles.netValue, { color: summary.net >= 0 ? palette.income : palette.expense }]}>
            {formatCurrency(summary.net)}
          </ThemedText>
        </Card>

        <Card style={styles.trendCard}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Last 6 months
          </ThemedText>
          <IncomeExpenseTrendChart data={trend} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthTitle: { fontSize: 24, marginTop: 2 },
  fab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statTile: { flex: 1, gap: 4 },
  statValue: { fontSize: 22 },
  netCard: { gap: 4 },
  netValue: { fontSize: 28 },
  trendCard: { gap: 8 },
  sectionTitle: { marginBottom: 4 },
});
