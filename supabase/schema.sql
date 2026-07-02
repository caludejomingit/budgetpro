-- ============================================================
-- Month-wise Income & Expense Tracker — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ============================================================
-- 1. profiles — one row per authenticated user
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. categories — shared defaults (user_id null) + user-custom
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,  -- null = global default category
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,                     -- Feather icon name, e.g. 'shopping-bag'
  color text,                    -- hex, used as the chart series color
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

alter table public.categories enable row level security;

-- Users see global defaults (user_id is null) plus their own custom categories
create policy "View default and own categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

create policy "Insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Seed default categories (user_id left null = visible to every user)
-- Colors are the validated categorical palette from the dataviz skill, in fixed
-- slot order (blue, aqua, yellow, green, violet, red, magenta, orange); the
-- catch-all "Other" categories use the muted/gray slot instead of a bright hue.
insert into public.categories (name, type, icon, color, is_default) values
  ('Salary',         'income',  'briefcase',       '#2a78d6', true),
  ('Freelance',      'income',  'trending-up',     '#1baf7a', true),
  ('Other Income',   'income',  'plus-circle',     '#898781', true),
  ('Food',           'expense', 'coffee',          '#2a78d6', true),
  ('Transport',      'expense', 'navigation',      '#1baf7a', true),
  ('Housing/Rent',   'expense', 'home',            '#eda100', true),
  ('Utilities',      'expense', 'zap',              '#008300', true),
  ('Shopping',       'expense', 'shopping-bag',    '#4a3aa7', true),
  ('Entertainment',  'expense', 'film',            '#e34948', true),
  ('Health',         'expense', 'heart',           '#e87ba4', true),
  ('Education',      'expense', 'book',            '#eb6834', true),
  ('Other Expense',  'expense', 'more-horizontal', '#898781', true);

-- ============================================================
-- 3. transactions
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  occurred_on date not null,          -- the transaction date (used for month grouping)
  note text,
  created_at timestamptz not null default now()
);

create index transactions_user_month_idx
  on public.transactions (user_id, occurred_on);

alter table public.transactions enable row level security;

create policy "Users manage own transactions select"
  on public.transactions for select using (auth.uid() = user_id);
create policy "Users manage own transactions insert"
  on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users manage own transactions update"
  on public.transactions for update using (auth.uid() = user_id);
create policy "Users manage own transactions delete"
  on public.transactions for delete using (auth.uid() = user_id);

-- ============================================================
-- 4. budgets — per-category monthly limit
-- ============================================================
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  month date not null,               -- stored as first-of-month, e.g. 2026-07-01
  limit_amount numeric(12,2) not null check (limit_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table public.budgets enable row level security;

create policy "Users manage own budgets select"
  on public.budgets for select using (auth.uid() = user_id);
create policy "Users manage own budgets insert"
  on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users manage own budgets update"
  on public.budgets for update using (auth.uid() = user_id);
create policy "Users manage own budgets delete"
  on public.budgets for delete using (auth.uid() = user_id);
