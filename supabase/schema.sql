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

-- Seed default categories (user_id left null = visible to every user).
-- Names and colors are ported verbatim from the BudgetPro reference app
-- (github.com/caludejomingit/bugetprofinal, js/app.js CAT_COLORS) — the
-- client renders category glyphs from a local name-keyed icon map
-- (src/lib/constants/categories.ts), so `icon` here is just a Feather
-- fallback name, not the source of truth for the glyph shown in the UI.
insert into public.categories (name, type, icon, color, is_default) values
  ('Salary',                'income',  'briefcase',      '#1E6B4E', true),
  ('Freelance',              'income',  'trending-up',    '#C97452', true),
  ('Business',               'income',  'target',         '#C9A03D', true),
  ('Rental Income',          'income',  'home',           '#4C7A94', true),
  ('Interest & Dividends',   'income',  'percent',        '#8B6BB0', true),
  ('Refunds & Cashback',     'income',  'refresh-ccw',    '#3E8E7E', true),
  ('Gifts',                  'income',  'gift',           '#B0574F', true),
  ('Other Income',           'income',  'plus-circle',    '#6E8C4A', true),
  ('Groceries',              'expense', 'shopping-cart',  '#1E6B4E', true),
  ('Bills & Utilities',      'expense', 'zap',            '#C97452', true),
  ('Food & Dining',          'expense', 'coffee',         '#C9A03D', true),
  ('Transport',              'expense', 'navigation',     '#4C7A94', true),
  ('Fuel',                   'expense', 'droplet',        '#8B6BB0', true),
  ('Shopping',               'expense', 'shopping-bag',   '#3E8E7E', true),
  ('Entertainment',          'expense', 'film',           '#B0574F', true),
  ('Health',                 'expense', 'heart',          '#6E8C4A', true),
  ('Fitness',                'expense', 'activity',       '#A88B3F', true),
  ('Personal Care',          'expense', 'sun',             '#4E6E8C', true),
  ('Rent',                   'expense', 'home',           '#7A6E5E', true),
  ('Home & Maintenance',     'expense', 'tool',           '#5C8A72', true),
  ('Subscriptions',          'expense', 'refresh-cw',     '#B0894A', true),
  ('Insurance',              'expense', 'shield',         '#6B5B95', true),
  ('Education',              'expense', 'book',           '#4F8FA6', true),
  ('Travel',                 'expense', 'map-pin',        '#A65D57', true),
  ('Pets',                   'expense', 'feather',        '#598C6E', true),
  ('Childcare',              'expense', 'user',           '#8C7548', true),
  ('Gifts & Donations',      'expense', 'gift',           '#7E6BA6', true),
  ('Miscellaneous',          'expense', 'grid',           '#4E7A8C', true);

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
