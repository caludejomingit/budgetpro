-- Run this once in your Supabase SQL Editor to sync your default categories
-- with the current BudgetPro category list/colors (only needed if you already
-- ran schema.sql before this update — a fresh schema.sql run doesn't need this).
-- Safe to re-run: renames matching old rows, updates colors, adds anything
-- missing, and never touches your own transactions/budgets or custom categories.

update public.categories set name = 'Food & Dining', color = '#C9A03D' where name = 'Food' and is_default;
update public.categories set name = 'Rent', color = '#7A6E5E' where name = 'Housing/Rent' and is_default;
update public.categories set name = 'Bills & Utilities', color = '#C97452' where name = 'Utilities' and is_default;
update public.categories set name = 'Miscellaneous', color = '#4E7A8C' where name = 'Other Expense' and is_default;
delete from public.categories where name = 'Investments' and is_default;

update public.categories set color = '#4C7A94' where name = 'Transport' and is_default;
update public.categories set color = '#3E8E7E' where name = 'Shopping' and is_default;
update public.categories set color = '#B0574F' where name = 'Entertainment' and is_default;
update public.categories set color = '#6E8C4A' where name = 'Health' and is_default;
update public.categories set color = '#4F8FA6' where name = 'Education' and is_default;
update public.categories set color = '#1E6B4E' where name = 'Salary' and is_default;
update public.categories set color = '#C97452' where name = 'Freelance' and is_default;
update public.categories set color = '#6E8C4A' where name = 'Other Income' and is_default;
update public.categories set color = '#C9A03D' where name = 'Business' and is_default;

insert into public.categories (name, type, icon, color, is_default)
select v.name, v.type, v.icon, v.color, true
from (values
  ('Rental Income',        'income',  'home',          '#4C7A94'),
  ('Interest & Dividends', 'income',  'percent',       '#8B6BB0'),
  ('Refunds & Cashback',   'income',  'refresh-ccw',   '#3E8E7E'),
  ('Gifts',                'income',  'gift',          '#B0574F'),
  ('Groceries',            'expense', 'shopping-cart', '#1E6B4E'),
  ('Fuel',                 'expense', 'droplet',       '#8B6BB0'),
  ('Fitness',              'expense', 'activity',      '#A88B3F'),
  ('Personal Care',        'expense', 'sun',           '#4E6E8C'),
  ('Home & Maintenance',   'expense', 'tool',          '#5C8A72'),
  ('Subscriptions',        'expense', 'refresh-cw',    '#B0894A'),
  ('Insurance',            'expense', 'shield',        '#6B5B95'),
  ('Travel',               'expense', 'map-pin',       '#A65D57'),
  ('Pets',                 'expense', 'feather',       '#598C6E'),
  ('Childcare',            'expense', 'user',          '#8C7548'),
  ('Gifts & Donations',    'expense', 'gift',          '#7E6BA6')
) as v(name, type, icon, color)
where not exists (
  select 1 from public.categories c
  where c.name = v.name and c.type = v.type and c.is_default
);
