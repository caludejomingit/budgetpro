import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addGoalContribution,
  createGoal,
  deleteGoal,
  deleteGoalContribution,
  fetchGoals,
  updateGoal,
} from '@/lib/api/goals';

const GOALS_KEY = ['goals'] as const;

export function useGoals() {
  return useQuery({ queryKey: GOALS_KEY, queryFn: fetchGoals, refetchOnMount: 'always', refetchOnWindowFocus: true });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateGoal>[1] }) => updateGoal(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useAddGoalContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addGoalContribution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoalContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoalContribution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}
