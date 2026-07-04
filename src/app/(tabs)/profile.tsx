import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { confirmAction, notify } from '@/lib/utils/confirm';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const { viewMonth } = useMonth();
  const { data: transactions } = useTransactions(viewMonth);
  const [deleting, setDeleting] = useState(false);

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
    confirmAction('Log out', `Log out of BudgetPro, ${displayName}?`, 'Log out', signOut, true);
  };

  const onDeleteAccount = () => {
    confirmAction(
      'Delete account',
      "This permanently deletes your account and every transaction, budget, and goal you've logged. This can't be undone.",
      'Delete everything',
      async () => {
        setDeleting(true);
        const { error } = await deleteAccount();
        setDeleting(false);
        if (error) notify('Could not delete account', error);
      },
      true
    );
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

        <Pressable onPress={onDeleteAccount} disabled={deleting} style={styles.deleteAccountBtn}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.danger} />
          ) : (
            <Feather name="trash-2" size={14} color={theme.danger} />
          )}
          <ThemedText type="small" style={{ color: theme.danger }}>
            Delete my account and all data
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
  deleteAccountBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
});
