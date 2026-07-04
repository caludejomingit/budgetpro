-- Run this once in your Supabase SQL Editor to add self-service account
-- deletion (required by Google Play's User Data policy for apps with
-- login). Safe to re-run.

create or replace function public.delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

grant execute on function public.delete_own_account() to authenticated;
