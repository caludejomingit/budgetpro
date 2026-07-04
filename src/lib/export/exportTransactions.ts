import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { TransactionWithCategory } from '@/types/database';

function buildWorkbook(transactions: TransactionWithCategory[]) {
  const rows = [...transactions]
    .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
    .map((t) => ({
      Date: t.occurred_on,
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Category: t.category?.name ?? 'Other',
      'Paid by': t.person,
      Note: t.note ?? '',
      'Amount (₹)': t.amount,
    }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 32 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  return wb;
}

export async function exportTransactionsToXlsx(transactions: TransactionWithCategory[]): Promise<void> {
  const wb = buildWorkbook(transactions);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `BudgetPro-Transactions-${stamp}.xlsx`;

  if (Platform.OS === 'web') {
    const arrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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

  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const FileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export transactions',
    });
  }
}
