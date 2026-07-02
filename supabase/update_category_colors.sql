-- Run this once in your Supabase SQL Editor to refresh default category
-- colors to the new BudgetPro brand palette (only needed if you already
-- ran schema.sql before the rebrand — a fresh schema.sql run doesn't need this).
update public.categories set color = '#0F8A5B' where name = 'Salary' and is_default;
update public.categories set color = '#2C6FBE' where name = 'Freelance' and is_default;
update public.categories set color = '#6E7C73' where name = 'Other Income' and is_default;
update public.categories set color = '#0F8A5B' where name = 'Food' and is_default;
update public.categories set color = '#2C6FBE' where name = 'Transport' and is_default;
update public.categories set color = '#C9A03D' where name = 'Housing/Rent' and is_default;
update public.categories set color = '#8B4FB0' where name = 'Utilities' and is_default;
update public.categories set color = '#1B9E9E' where name = 'Shopping' and is_default;
update public.categories set color = '#C97452' where name = 'Entertainment' and is_default;
update public.categories set color = '#C2478B' where name = 'Health' and is_default;
update public.categories set color = '#3B6FA5' where name = 'Education' and is_default;
update public.categories set color = '#6E7C73' where name = 'Other Expense' and is_default;
