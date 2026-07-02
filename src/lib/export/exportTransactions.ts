import { Platform } from 'react-native';

import { formatMonthShort } from '@/lib/format/date';
import type { TransactionWithCategory } from '@/types/database';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(transactions: TransactionWithCategory[]): string {
  const header = ['Date', 'Type', 'Category', 'Amount', 'Note'];
  const rows = transactions.map((t) => [
    t.occurred_on,
    t.type === 'income' ? 'Income' : 'Expense',
    t.category?.name ?? 'Other',
    t.amount.toFixed(2),
    t.note ?? '',
  ]);
  return [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n');
}

export async function exportTransactionsToCsv(transactions: TransactionWithCategory[], monthKey: string): Promise<void> {
  const csv = buildCsv(transactions);
  const filename = `budgetpro-transactions-${formatMonthShort(monthKey).replace(' ', '-').toLowerCase()}.csv`;

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export transactions' });
  }
}
