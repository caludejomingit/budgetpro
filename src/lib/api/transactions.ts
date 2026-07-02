import { monthRange, type MonthKey } from '@/lib/format/date';
import { supabase } from '@/lib/supabase';
import type { CategoryType, Transaction, TransactionWithCategory } from '@/types/database';

export async function fetchTransactionsForMonth(monthKey: MonthKey): Promise<TransactionWithCategory[]> {
  const { start, end } = monthRange(monthKey);
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .gte('occurred_on', start)
    .lte('occurred_on', end)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as TransactionWithCategory[];
}

export async function fetchTransactionsSince(startDate: string): Promise<TransactionWithCategory[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .gte('occurred_on', startDate)
    .order('occurred_on', { ascending: true });
  if (error) throw error;
  return data as unknown as TransactionWithCategory[];
}

export async function fetchTransactionById(id: string): Promise<TransactionWithCategory> {
  const { data, error } = await supabase.from('transactions').select('*, category:categories(*)').eq('id', id).single();
  if (error) throw error;
  return data as unknown as TransactionWithCategory;
}

export interface TransactionInput {
  userId: string;
  categoryId: string;
  type: CategoryType;
  amount: number;
  occurredOn: string;
  note?: string;
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: input.userId,
      category_id: input.categoryId,
      type: input.type,
      amount: input.amount,
      occurred_on: input.occurredOn,
      note: input.note || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      category_id: input.categoryId,
      type: input.type,
      amount: input.amount,
      occurred_on: input.occurredOn,
      note: input.note || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
