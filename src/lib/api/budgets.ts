import type { MonthKey } from '@/lib/format/date';
import { supabase } from '@/lib/supabase';
import type { Budget, BudgetWithCategory } from '@/types/database';

export async function fetchBudgetsForMonth(monthKey: MonthKey): Promise<BudgetWithCategory[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .eq('month', monthKey);
  if (error) throw error;
  return data as unknown as BudgetWithCategory[];
}

export async function upsertBudget(input: {
  userId: string;
  categoryId: string;
  month: MonthKey;
  limitAmount: number;
}): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: input.userId,
        category_id: input.categoryId,
        month: input.month,
        limit_amount: input.limitAmount,
      },
      { onConflict: 'user_id,category_id,month' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
}
