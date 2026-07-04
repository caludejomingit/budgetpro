-- Run this once in your Supabase SQL Editor to bring an already-provisioned
-- database up to date with: (1) a "person" label on transactions, and
-- (2) the new Goals feature (goals + goal_contributions tables).
-- Safe to re-run.

alter table public.transactions
  add column if not exists person text not null default 'Shared';

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  target_date date,
  is_achieved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

drop policy if exists "Users manage own goals select" on public.goals;
create policy "Users manage own goals select"
  on public.goals for select using (auth.uid() = user_id);
drop policy if exists "Users manage own goals insert" on public.goals;
create policy "Users manage own goals insert"
  on public.goals for insert with check (auth.uid() = user_id);
drop policy if exists "Users manage own goals update" on public.goals;
create policy "Users manage own goals update"
  on public.goals for update using (auth.uid() = user_id);
drop policy if exists "Users manage own goals delete" on public.goals;
create policy "Users manage own goals delete"
  on public.goals for delete using (auth.uid() = user_id);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  occurred_on date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists goal_contributions_goal_idx
  on public.goal_contributions (goal_id, occurred_on);

alter table public.goal_contributions enable row level security;

drop policy if exists "Users manage own goal contributions select" on public.goal_contributions;
create policy "Users manage own goal contributions select"
  on public.goal_contributions for select using (auth.uid() = user_id);
drop policy if exists "Users manage own goal contributions insert" on public.goal_contributions;
create policy "Users manage own goal contributions insert"
  on public.goal_contributions for insert with check (auth.uid() = user_id);
drop policy if exists "Users manage own goal contributions update" on public.goal_contributions;
create policy "Users manage own goal contributions update"
  on public.goal_contributions for update using (auth.uid() = user_id);
drop policy if exists "Users manage own goal contributions delete" on public.goal_contributions;
create policy "Users manage own goal contributions delete"
  on public.goal_contributions for delete using (auth.uid() = user_id);
