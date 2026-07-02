import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { exportTransactionsToXlsx } from '@/lib/export/exportTransactions';
import { formatMonthShort } from '@/lib/format/date';
import { useMonth } from '@/lib/state/MonthContext';

export function AppTopBar() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { viewMonth, shiftMonth } = useMonth();
  const { data: transactions } = useTransactions(viewMonth);
  const [isExporting, setIsExporting] = useState(false);

  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'there';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  const onExport = async () => {
    if (!transactions || transactions.length === 0) return;
    setIsExporting(true);
    try {
      await exportTransactionsToXlsx(transactions);
    } finally {
      setIsExporting(false);
    }
  };

  const onAvatarPress = () => {
    Alert.alert('Log out', `Log out of BudgetPro, ${displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Feather name="trending-up" size={17} color="#EAF4EE" />
        </View>
        <View>
          <ThemedText type="smallBold" style={styles.t1}>
            BudgetPro
          </ThemedText>
          <ThemedText type="tagline" style={styles.t2}>
            Plan. Track. Grow.
          </ThemedText>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onExport} disabled={isExporting} style={styles.iconBtn}>
          {isExporting ? <ActivityIndicator size="small" color="#EAF4EE" /> : <Feather name="download" size={15} color="#EAF4EE" />}
        </Pressable>
        <View style={styles.monthPill}>
          <Pressable onPress={() => shiftMonth(-1)} style={styles.monthBtn}>
            <Feather name="chevron-left" size={13} color="#EAF4EE" />
          </Pressable>
          <ThemedText type="subtitle" style={styles.monthLabel}>
            {formatMonthShort(viewMonth)}
          </ThemedText>
          <Pressable onPress={() => shiftMonth(1)} style={styles.monthBtn}>
            <Feather name="chevron-right" size={13} color="#EAF4EE" />
          </Pressable>
        </View>
        <Pressable onPress={onAvatarPress} style={styles.avatar}>
          <ThemedText type="subtitle" style={styles.avatarText}>
            {initial}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#164F3A',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  mark: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  t1: { color: '#EAF4EE', fontSize: 14.5, lineHeight: 17 },
  t2: { color: '#B9D6C4', fontSize: 10.5, lineHeight: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  monthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 5 },
  monthBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  monthLabel: { color: '#EAF4EE', fontSize: 12, minWidth: 66, textAlign: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#EAF4EE', fontSize: 11 },
});
