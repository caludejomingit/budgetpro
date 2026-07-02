import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { buildTipsPool, shuffle } from '@/lib/insights/savingsTips';
import { useMonth } from '@/lib/state/MonthContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { viewMonth } = useMonth();
  const { data: transactions } = useTransactions(viewMonth);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'there';

  const tip = useMemo(() => {
    const expenseByCategory = new Map<string, number>();
    for (const t of transactions ?? []) {
      if (t.type !== 'expense') continue;
      const name = t.category?.name ?? 'Miscellaneous';
      expenseByCategory.set(name, (expenseByCategory.get(name) ?? 0) + t.amount);
    }
    const pool = buildTipsPool(Array.from(expenseByCategory.entries()).map(([categoryName, amount], i) => ({ categoryId: String(i), categoryName, amount })));
    return shuffle(pool)[0];
  }, [transactions]);

  const onLogout = () => {
    Alert.alert('Log out', `Log out of BudgetPro, ${displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Your account" title="Profile" accent="Profile" />

        <Card style={styles.profileCard}>
          <Avatar name={displayName} size={64} />
          <ThemedText type="subtitle" style={styles.name}>
            {displayName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user?.email}
          </ThemedText>
        </Card>

        {tip ? (
          <Card style={styles.tipCard}>
            <View style={[styles.tipIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Feather name="check-circle" size={16} color={theme.primary} />
            </View>
            <View style={styles.tipTextWrap}>
              <ThemedText type="small" themeColor="textMuted" style={styles.tipLabel}>
                SAVINGS TIP
              </ThemedText>
              <ThemedText type="small" style={styles.tipText}>
                {tip}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        <Card style={styles.infoCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Currency
          </ThemedText>
          <ThemedText type="smallBold">Indian Rupee (₹)</ThemedText>
        </Card>

        <Pressable onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: theme.clayLight }]}>
          <Feather name="log-out" size={16} color={theme.danger} />
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            Log out
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  profileCard: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  name: { marginTop: 8 },
  tipCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tipIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tipTextWrap: { flex: 1, gap: 4 },
  tipLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  tipText: { lineHeight: 19 },
  infoCard: { gap: 4 },
  logoutBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
});
