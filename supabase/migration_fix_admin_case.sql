-- ============================================================
-- منارة القرآن — إصلاح: is_admin() كانت تقارن البريد الإلكتروني
-- بحساسية لحالة الأحرف (case-sensitive)، بينما التحقق في الواجهة
-- (src/lib/auth/admin.ts) يقارن بدون حساسية لحالة الأحرف.
-- هذا التضارب كان يمنع المسؤول من الإضافة/التعديل/رفع الصور
-- (سياسات RLS ترفض العملية رغم ظهور أزرار الأدمن في الواجهة).
-- نفّذ هذا الملف من: Supabase Dashboard > SQL Editor > New query
-- عدّل قائمة البريد أدناه لتطابق src/lib/auth/admin.ts بالضبط
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(
    (select email from auth.users where id = auth.uid()),
    ''
  )) = any (
    select lower(e) from unnest(array['ad@qr.com']) as e
  );
$$;
