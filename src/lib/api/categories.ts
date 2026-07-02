import { supabase } from '@/lib/supabase';
import type { Category, CategoryType } from '@/types/database';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function fetchCategoriesByType(type: CategoryType): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').eq('type', type).order('name');
  if (error) throw error;
  return data;
}

export async function createCategory(input: {
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: input.userId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
