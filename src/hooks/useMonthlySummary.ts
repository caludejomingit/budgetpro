import { format } from 'date-fns';
import { useMemo } from 'react';

import { monthKeyFromDate } from '@/lib/format/date';
import type { TransactionWithCategory } from '@/types/database';

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  expenseByCategory: CategorySpend[];
  incomeByCategory: CategorySpend[];
}

export function summarizeTransactions(transactions: TransactionWithCategory[]): MonthlySummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseMap = new Map<string, CategorySpend>();
  const incomeMap = new Map<string, CategorySpend>();

  for (const tx of transactions) {
    const map = tx.type === 'income' ? incomeMap : expenseMap;
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpense += tx.amount;

    const existing = map.get(tx.category_id);
    if (existing) {
      existing.amount += tx.amount;
    } else {
      map.set(tx.category_id, {
        categoryId: tx.category_id,
        categoryName: tx.category?.name ?? 'Other',
        color: tx.category?.color ?? '#898781',
        icon: tx.category?.icon ?? 'circle',
        amount: tx.amount,
      });
    }
  }

  const sortByAmountDesc = (a: CategorySpend, b: CategorySpend) => b.amount - a.amount;

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    expenseByCategory: Array.from(expenseMap.values()).sort(sortByAmountDesc),
    incomeByCategory: Array.from(incomeMap.values()).sort(sortByAmountDesc),
  };
}

export function useMonthlySummary(transactions: TransactionWithCategory[] | undefined): MonthlySummary {
  return useMemo(() => summarizeTransactions(transactions ?? []), [transactions]);
}

export interface MonthlyTotal {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

/** Buckets a flat transaction list (e.g. last N months) into per-month income/expense totals. */
export function useMonthlyTrend(transactions: TransactionWithCategory[] | undefined, monthsBack: number): MonthlyTotal[] {
  return useMemo(() => {
    const buckets = new Map<string, MonthlyTotal>();
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKeyFromDate(date);
      buckets.set(key, { monthKey: key, label: format(date, 'MMM'), income: 0, expense: 0 });
    }
    for (const tx of transactions ?? []) {
      const key = monthKeyFromDate(new Date(tx.occurred_on));
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (tx.type === 'income') bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }
    return Array.from(buckets.values());
  }, [transactions, monthsBack]);
}
