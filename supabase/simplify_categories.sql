-- Run this once in your Supabase SQL Editor to switch your default
-- categories over to your real personal spending list (Grocery, Food,
-- Petrol, Travel Expense, Rent, Bills, Medical Bills, Shopping, EMI,
-- Savings, Miscellaneous) — only needed if you already ran an earlier
-- version of schema.sql. Safe to re-run.
--
-- Renames are used wherever there's a clear old -> new match, so any
-- transactions/budgets already logged against those categories carry
-- over automatically. Categories with no equivalent in the new list are
-- deleted, but ONLY if nothing references them yet — if you've logged
-- transactions or set budgets against one (e.g. "Health" or "Education"),
-- it's left in place instead of failing, so you don't lose data; you can
-- rename or delete it yourself afterward once it's unused.

update public.categories set name = 'Grocery', color = '#1E6B4E' where name = 'Groceries' and is_default;
update public.categories set name = 'Food', color = '#C97452' where name = 'Food & Dining' and is_default;
update public.categories set name = 'Petrol', color = '#8B6BB0' where name = 'Fuel' and is_default;
update public.categories set name = 'Travel Expense', color = '#A65D57' where name = 'Travel' and is_default;
update public.categories set color = '#7A6E5E' where name = 'Rent' and is_default;
update public.categories set name = 'Bills', color = '#4C7A94' where name = 'Bills & Utilities' and is_default;
update public.categories set name = 'Medical Bills', color = '#8E5B4A' where name = 'Medicine & Pharmacy' and is_default;
update public.categories set color = '#3E8E7E' where name = 'Shopping' and is_default;
update public.categories set name = 'EMI', color = '#5B7A6E' where name = 'EMI & Loans' and is_default;
update public.categories set color = '#6E7C73' where name = 'Miscellaneous' and is_default;

insert into public.categories (name, type, icon, color, is_default)
select 'Savings', 'expense', 'trending-up', '#C9A03D', true
where not exists (select 1 from public.categories where name = 'Savings' and is_default);

-- Drop categories with no place in the new list, skipping any still in use.
delete from public.categories c
where c.is_default
  and c.name in (
    'Mobile & Internet', 'Transport', 'Entertainment', 'Health', 'Fitness',
    'Personal Care', 'Home & Maintenance', 'Domestic Help', 'Subscriptions',
    'Insurance', 'Education', 'Pets', 'Childcare', 'Gifts & Donations'
  )
  and not exists (select 1 from public.transactions t where t.category_id = c.id)
  and not exists (select 1 from public.budgets b where b.category_id = c.id);
