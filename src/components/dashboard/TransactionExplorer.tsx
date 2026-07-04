import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { exportRowsToCsv } from '@/lib/export/exportCsv';
import { isEssentialCategory } from '@/lib/constants/categories';
import { formatCurrency } from '@/lib/format/currency';
import type { TransactionWithCategory } from '@/types/database';

type SortKey = 'date' | 'category' | 'amount';

interface Props {
  transactions: TransactionWithCategory[];
}

const ROW_LIMIT = 300;

export function TransactionExplorer({ transactions }: Props) {
  const theme = useTheme();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [exporting, setExporting] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...transactions];
    copy.sort((a, b) => {
      if (sortKey === 'amount') return (a.amount - b.amount) * sortDir;
      if (sortKey === 'category') return (a.category?.name ?? '').localeCompare(b.category?.name ?? '') * sortDir;
      return a.occurred_on.localeCompare(b.occurred_on) * sortDir;
    });
    return copy;
  }, [transactions, sortKey, sortDir]);

  const total = sorted.reduce((s, t) => s + t.amount, 0);
  const shown = sorted.slice(0, ROW_LIMIT);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      await exportRowsToCsv(
        sorted.map((t) => ({
          Date: t.occurred_on,
          Category: t.category?.name ?? 'Other',
          Note: t.note ?? '',
          'Paid by': t.person,
          Essential: isEssentialCategory(t.category?.name ?? '') ? 'Essential' : 'Non-Essential',
          'Amount (INR)': t.amount,
        })),
        `BudgetPro-Dashboard-Export-${format(new Date(), 'yyyy-MM-dd')}.csv`
      );
    } finally {
      setExporting(false);
    }
  };

  if (transactions.length === 0) {
    return <EmptyState icon="list" title="No transactions match" message="Try clearing a filter or widening your search." />;
  }

  const SortHeader = ({ label, sortField, flex }: { label: string; sortField: SortKey; flex: number }) => (
    <Pressable onPress={() => toggleSort(sortField)} style={[styles.th, { flex }]}>
      <ThemedText type="small" themeColor="textMuted" style={styles.thText}>
        {label}
      </ThemedText>
      {sortKey === sortField ? <Feather name={sortDir === 1 ? 'arrow-up' : 'arrow-down'} size={11} color={theme.textMuted} /> : null}
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {sorted.length.toLocaleString('en-IN')} transaction(s) · {formatCurrency(total)}
          {sorted.length > ROW_LIMIT ? ` (showing first ${ROW_LIMIT})` : ''}
        </ThemedText>
        <Pressable onPress={onExport} disabled={exporting} style={[styles.exportBtn, { backgroundColor: theme.primaryLight }]}>
          <Feather name="download" size={13} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
        <SortHeader label="Date" sortField="date" flex={1.1} />
        <SortHeader label="Category" sortField="category" flex={1.3} />
        <View style={[styles.th, { flex: 1.6 }]}>
          <ThemedText type="small" themeColor="textMuted" style={styles.thText}>
            Note
          </ThemedText>
        </View>
        <SortHeader label="Amount" sortField="amount" flex={1} />
      </View>

      {shown.map((t) => (
        <View key={t.id} style={[styles.row, { borderBottomColor: theme.border }]}>
          <ThemedText type="small" style={{ flex: 1.1 }} numberOfLines={1}>
            {format(parseISO(t.occurred_on), 'd MMM')}
          </ThemedText>
          <ThemedText type="small" style={{ flex: 1.3 }} numberOfLines={1}>
            {t.category?.name ?? 'Other'}
          </ThemedText>
          <View style={{ flex: 1.6 }}>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {t.note || '—'}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted" style={styles.metaLine} numberOfLines={1}>
              {t.person} · {isEssentialCategory(t.category?.name ?? '') ? 'Essential' : 'Non-Essential'}
            </ThemedText>
          </View>
          <ThemedText type="amountSmall" style={{ flex: 1 }}>
            {formatCurrency(t.amount)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1.5, paddingBottom: 8, marginBottom: 4 },
  th: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  thText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1 },
  metaLine: { fontSize: 10.5 },
});
