import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  fetchAllTransactions,
  fetchTransactionsForMonth,
  fetchTransactionsSince,
  updateTransaction,
  type TransactionInput,
} from '@/lib/api/transactions';
import { monthKeyFromDate, type MonthKey } from '@/lib/format/date';
import { subMonths } from 'date-fns';

export function transactionsKey(monthKey: MonthKey) {
  return ['transactions', monthKey] as const;
}

export function useTransactions(monthKey: MonthKey) {
  return useQuery({
    queryKey: transactionsKey(monthKey),
    queryFn: () => fetchTransactionsForMonth(monthKey),
  });
}

/** Transactions from `monthsBack` full months ago through today, for trend charts. */
export function useTransactionsRange(monthsBack: number) {
  const startDate = monthKeyFromDate(subMonths(new Date(), monthsBack - 1));
  return useQuery({
    queryKey: ['transactions', 'range', startDate],
    queryFn: () => fetchTransactionsSince(startDate),
  });
}

export function useAllTransactions() {
  return useQuery({ queryKey: ['transactions', 'all'], queryFn: fetchAllTransactions });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) => updateTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
