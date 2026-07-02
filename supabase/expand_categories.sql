-- Run this once in your Supabase SQL Editor to expand the default category
-- set to match the new BudgetPro design (only needed if you already ran
-- schema.sql before this update — a fresh schema.sql run doesn't need this).

-- Rename + recolor categories that changed name
update public.categories set name = 'Food & Dining', icon = 'coffee', color = '#C9A03D' where name = 'Food' and is_default;
update public.categories set name = 'Rent', icon = 'home', color = '#C9A03D' where name = 'Housing/Rent' and is_default;
update public.categories set name = 'Bills & Utilities', icon = 'zap', color = '#2C6FBE' where name = 'Utilities' and is_default;
update public.categories set name = 'Miscellaneous', icon = 'grid', color = '#6E7C73' where name = 'Other Expense' and is_default;

-- Recolor categories that kept their name
update public.categories set color = '#8B4FB0' where name = 'Transport' and is_default;
update public.categories set color = '#C97452' where name = 'Shopping' and is_default;
update public.categories set color = '#C2478B' where name = 'Entertainment' and is_default;
update public.categories set color = '#3B6FA5' where name = 'Health' and is_default;
update public.categories set color = '#C2478B' where name = 'Education' and is_default;
update public.categories set color = '#0F8A5B' where name = 'Salary' and is_default;
update public.categories set color = '#2C6FBE' where name = 'Freelance' and is_default;
update public.categories set color = '#6E7C73' where name = 'Other Income' and is_default;

-- Add the new categories (skip any that already exist by name+type)
insert into public.categories (name, type, icon, color, is_default)
select v.name, v.type, v.icon, v.color, true
from (values
  ('Business',           'income',  'target',        '#C9A03D'),
  ('Investments',        'income',  'bar-chart-2',   '#8B4FB0'),
  ('Groceries',          'expense', 'shopping-cart', '#0F8A5B'),
  ('Fuel',               'expense', 'droplet',       '#1B9E9E'),
  ('Fitness',            'expense', 'activity',      '#0F8A5B'),
  ('Personal Care',      'expense', 'smile',         '#2C6FBE'),
  ('Home & Maintenance', 'expense', 'tool',          '#8B4FB0'),
  ('Subscriptions',      'expense', 'refresh-cw',    '#1B9E9E'),
  ('Insurance',          'expense', 'shield',        '#C97452'),
  ('Travel',             'expense', 'map-pin',       '#3B6FA5'),
  ('Pets',               'expense', 'feather',       '#0F8A5B'),
  ('Childcare',          'expense', 'user',          '#2C6FBE'),
  ('Gifts & Donations',  'expense', 'gift',          '#C9A03D')
) as v(name, type, icon, color)
where not exists (
  select 1 from public.categories c
  where c.name = v.name and c.type = v.type and c.is_default
);
