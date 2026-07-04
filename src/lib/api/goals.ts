import { supabase } from '@/lib/supabase';
import type { Goal, GoalContribution, GoalWithProgress } from '@/types/database';

export async function fetchGoals(): Promise<GoalWithProgress[]> {
  const [{ data: goals, error: goalsError }, { data: contributions, error: contribError }] = await Promise.all([
    supabase.from('goals').select('*').order('created_at', { ascending: false }),
    supabase.from('goal_contributions').select('*').order('occurred_on', { ascending: false }),
  ]);
  if (goalsError) throw goalsError;
  if (contribError) throw contribError;

  return (goals as Goal[]).map((g) => {
    const own = (contributions as GoalContribution[]).filter((c) => c.goal_id === g.id);
    return { ...g, savedAmount: own.reduce((s, c) => s + c.amount, 0), contributions: own };
  });
}

export interface GoalInput {
  userId: string;
  name: string;
  targetAmount: number;
  targetDate?: string | null;
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: input.userId, name: input.name, target_amount: input.targetAmount, target_date: input.targetDate || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, input: Partial<GoalInput> & { isAchieved?: boolean }): Promise<Goal> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.targetAmount !== undefined) patch.target_amount = input.targetAmount;
  if (input.targetDate !== undefined) patch.target_date = input.targetDate || null;
  if (input.isAchieved !== undefined) patch.is_achieved = input.isAchieved;
  const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export interface GoalContributionInput {
  goalId: string;
  userId: string;
  amount: number;
  occurredOn: string;
  note?: string;
}

export async function addGoalContribution(input: GoalContributionInput): Promise<GoalContribution> {
  const { data, error } = await supabase
    .from('goal_contributions')
    .insert({ goal_id: input.goalId, user_id: input.userId, amount: input.amount, occurred_on: input.occurredOn, note: input.note || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoalContribution(id: string): Promise<void> {
  const { error } = await supabase.from('goal_contributions').delete().eq('id', id);
  if (error) throw error;
}
