-- ============================================================
-- منارة القرآن — تحويل صلاحية الأدمن إلى بريد إلكتروني فقط
-- نفّذ هذا الملف من: Supabase Dashboard > SQL Editor > New query
-- عدّل قائمة البريد أدناه لتطابق src/lib/auth/admin.ts
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select email from auth.users where id = auth.uid()),
    ''
  ) = any (array['ad@qr.com']);
$$;
