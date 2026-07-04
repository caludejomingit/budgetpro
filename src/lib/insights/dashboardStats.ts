import { format, parseISO } from 'date-fns';

import { isEssentialCategory } from '@/lib/constants/categories';
import { formatCurrency } from '@/lib/format/currency';
import type { InsightNote } from '@/lib/insights/savingsTips';
import type { TransactionWithCategory } from '@/types/database';

export interface DashboardFilters {
  type: 'income' | 'expense' | null; // null = both
  month: string | null; // 'yyyy-MM' or null for all
  category: string | null;
  person: string | null;
  search: string;
}

export function monthKeyOf(occurredOn: string): string {
  return occurredOn.slice(0, 7); // 'yyyy-MM'
}

export function monthLabelOf(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMM yyyy');
}

export function filterTransactions(transactions: TransactionWithCategory[], filters: DashboardFilters): TransactionWithCategory[] {
  const search = filters.search.trim().toLowerCase();
  return transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.month && monthKeyOf(t.occurred_on) !== filters.month) return false;
    if (filters.category && t.category?.name !== filters.category) return false;
    if (filters.person && t.person !== filters.person) return false;
    if (search && !(t.note ?? '').toLowerCase().includes(search)) return false;
    return true;
  });
}

export function orderedMonthKeys(transactions: TransactionWithCategory[]): string[] {
  const set = new Set(transactions.map((t) => monthKeyOf(t.occurred_on)));
  return Array.from(set).sort();
}

export function monthlyIncomeExpense(transactions: TransactionWithCategory[], months: string[]): { monthKey: string; label: string; income: number; expense: number }[] {
  return months.map((monthKey) => ({
    monthKey,
    label: monthLabelOf(monthKey),
    income: transactions.filter((t) => t.type === 'income' && monthKeyOf(t.occurred_on) === monthKey).reduce((s, t) => s + t.amount, 0),
    expense: transactions.filter((t) => t.type === 'expense' && monthKeyOf(t.occurred_on) === monthKey).reduce((s, t) => s + t.amount, 0),
  }));
}

export function monthlyTotals(transactions: TransactionWithCategory[], months: string[]): { monthKey: string; label: string; total: number }[] {
  return months.map((monthKey) => ({
    monthKey,
    label: monthLabelOf(monthKey),
    total: transactions.filter((t) => monthKeyOf(t.occurred_on) === monthKey).reduce((s, t) => s + t.amount, 0),
  }));
}

export function categoryTotals(transactions: TransactionWithCategory[]): { name: string; total: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const name = t.category?.name ?? 'Miscellaneous';
    map.set(name, (map.get(name) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export function topItemsByNote(transactions: TransactionWithCategory[], limit = 10): { label: string; total: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const key = t.note?.trim() || '(no note)';
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export interface HeatMatrixData {
  categories: string[];
  months: string[];
  grid: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  max: number;
}

export function buildHeatMatrix(transactions: TransactionWithCategory[], months: string[]): HeatMatrixData {
  const categories = Array.from(new Set(transactions.map((t) => t.category?.name ?? 'Miscellaneous'))).sort();
  const grid: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  let max = 0;
  categories.forEach((c) => {
    grid[c] = {};
    rowTotals[c] = 0;
    months.forEach((m) => (grid[c][m] = 0));
  });
  for (const t of transactions) {
    const c = t.category?.name ?? 'Miscellaneous';
    const m = monthKeyOf(t.occurred_on);
    if (!grid[c] || grid[c][m] === undefined) continue;
    grid[c][m] += t.amount;
    rowTotals[c] += t.amount;
    if (grid[c][m] > max) max = grid[c][m];
  }
  return { categories, months, grid, rowTotals, max };
}

export function stackedByMonthAndCategory(transactions: TransactionWithCategory[], months: string[], categories: string[]): { monthKey: string; label: string; segments: { category: string; amount: number }[]; total: number }[] {
  return months.map((monthKey) => {
    const segments = categories.map((category) => ({
      category,
      amount: transactions.filter((t) => monthKeyOf(t.occurred_on) === monthKey && (t.category?.name ?? 'Miscellaneous') === category).reduce((s, t) => s + t.amount, 0),
    }));
    return { monthKey, label: monthLabelOf(monthKey), segments, total: segments.reduce((s, seg) => s + seg.amount, 0) };
  });
}

export function essentialSplit(transactions: TransactionWithCategory[]): { essential: number; nonEssential: number } {
  let essential = 0;
  let nonEssential = 0;
  for (const t of transactions) {
    if (isEssentialCategory(t.category?.name ?? '')) essential += t.amount;
    else nonEssential += t.amount;
  }
  return { essential, nonEssential };
}

/** Turns the filtered numbers into a short, readable narrative — the "story" behind the charts. Kept tight (one clause each) since this renders as a compact scrollable ticker, not a full report. */
export function buildDashboardStory(
  expenseTransactions: TransactionWithCategory[],
  totalIncome: number,
  months: string[],
  expenseCats: { name: string; total: number }[],
  expenseTrend: { monthKey: string; label: string; total: number }[],
  split: { essential: number; nonEssential: number }
): InsightNote[] {
  const notes: InsightNote[] = [];
  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0);
  if (totalExpense === 0 && totalIncome === 0) return notes;

  const net = totalIncome - totalExpense;
  if (totalIncome > 0) {
    const rate = Math.round((net / totalIncome) * 100);
    notes.push({
      tag: 'Net position',
      variant: net >= 0 ? (rate >= 10 ? 'gold' : 'default') : 'warn',
      text: `${formatCurrency(totalIncome)} in, ${formatCurrency(totalExpense)} out — net ${net >= 0 ? '+' : ''}${formatCurrency(net)} (${rate}%).`,
    });
  } else if (totalExpense > 0) {
    const avgMonth = months.length > 0 ? totalExpense / months.length : totalExpense;
    notes.push({
      tag: 'The big picture',
      variant: 'default',
      text: `${expenseTransactions.length} expenses totalling ${formatCurrency(totalExpense)} — averaging ${formatCurrency(avgMonth)}/month.`,
    });
  }

  if (expenseTrend.length > 1) {
    const avgMonth = totalExpense / (months.length || 1);
    const last = expenseTrend[expenseTrend.length - 1];
    const prev = expenseTrend[expenseTrend.length - 2];
    if (prev.total > 0) {
      const deltaPct = Math.round(((last.total - prev.total) / prev.total) * 100);
      if (Math.abs(deltaPct) >= 5) {
        notes.push({
          tag: deltaPct > 0 ? 'Trending up' : 'Trending down',
          variant: deltaPct > 0 ? 'warn' : 'default',
          text: `Spending ${deltaPct > 0 ? 'rose' : 'fell'} ${Math.abs(deltaPct)}% from ${prev.label} to ${last.label}.`,
        });
      }
    } else {
      const peak = [...expenseTrend].sort((a, b) => b.total - a.total)[0];
      if (peak.total > avgMonth * 1.05) {
        notes.push({ tag: 'Heaviest month', variant: 'warn', text: `${peak.label} was your biggest month at ${formatCurrency(peak.total)}.` });
      }
    }
  }

  if (expenseCats.length > 0) {
    const top = expenseCats[0];
    const pct = Math.round((top.total / totalExpense) * 100);
    notes.push({ tag: 'Top category', variant: 'gold', text: `${top.name} leads at ${formatCurrency(top.total)} (${pct}% of spend).` });
  }

  const splitTotal = split.essential + split.nonEssential;
  if (splitTotal > 0) {
    const essentialPct = Math.round((split.essential / splitTotal) * 100);
    notes.push({
      tag: 'Essential vs. lifestyle',
      variant: essentialPct < 55 ? 'warn' : 'default',
      text: `${essentialPct}% essentials, ${100 - essentialPct}% discretionary.`,
    });
  }

  const biggest = [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0];
  if (biggest) {
    notes.push({
      tag: 'Biggest expense',
      variant: 'warn',
      text: `${biggest.note?.trim() || biggest.category?.name || 'An expense'} — ${formatCurrency(biggest.amount)} on ${format(parseISO(biggest.occurred_on), 'd MMM')}.`,
    });
  }

  return notes;
}
