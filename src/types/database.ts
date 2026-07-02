export type CategoryType = 'income' | 'expense';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: CategoryType;
  amount: number;
  occurred_on: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string; // YYYY-MM-DD, first of month
  limit_amount: number;
  created_at: string;
}

export interface BudgetWithCategory extends Budget {
  category: Category;
}
