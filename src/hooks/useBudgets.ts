import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchBudgetsForMonth, upsertBudget } from '@/lib/api/budgets';
import type { MonthKey } from '@/lib/format/date';

export function budgetsKey(monthKey: MonthKey) {
  return ['budgets', monthKey] as const;
}

export function useBudgets(monthKey: MonthKey) {
  return useQuery({
    queryKey: budgetsKey(monthKey),
    queryFn: () => fetchBudgetsForMonth(monthKey),
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
