-- ============================================================
-- منارة القرآن — إعداد قاعدة بيانات Supabase الأساسية
-- نفّذ هذا الملف بالكامل من: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1) جدول الملفات الشخصية (يُربط مع جدول المصادقة auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- 2) تفعيل أمان مستوى الصف (RLS) — إلزامي
alter table public.profiles enable row level security;

-- 3) سياسة: يمكن لأي مستخدم مسجّل دخوله قراءة ملفه الشخصي فقط
drop policy if exists "المستخدم يقرأ ملفه الشخصي فقط" on public.profiles;
create policy "المستخدم يقرأ ملفه الشخصي فقط"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 4) دالة + Trigger: عند إنشاء مستخدم جديد في Supabase Auth،
--    يتم تلقائيًا إنشاء صف له في profiles بدور "viewer" افتراضيًا
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- خطوة يدوية مطلوبة بعد إنشاء أول مستخدم "مسؤول" من لوحة Supabase:
-- Authentication > Users > Add user (أدخل بريدًا إلكترونيًا وكلمة مرور)
-- ثم نفّذ الأمر التالي بعد استبدال البريد الإلكتروني:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@example.com');
-- ============================================================

-- ============================================================
-- المرحلة 2: إدارة الطلاب (بطاقات + صور فقط — بدون نقاط فعلية أو ترتيب بعد)
-- نفّذ هذا القسم بالكامل من SQL Editor بعد تنفيذ القسم الأول أعلاه
-- ============================================================

-- 1) دالة مساعدة: هل المستخدم الحالي مسجّل دخوله بدور "admin"؟
--    صلاحية الأدمن تُحدَّد عبر قائمة بريد إلكتروني ثابتة (أبسط طريقة)،
--    يجب أن تطابق القائمة في src/lib/auth/admin.ts
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
    select lower(e) from unnest(array['admin@example.com']) as e
  );
$$;

-- 2) جدول الطلاب
--    ملاحظة: عمود points موجود فقط لتجهيز قاعدة البيانات لمرحلة لاحقة،
--    ولا توجد في هذه المرحلة أي واجهة لتعديله — يبقى دائمًا 0.
create table if not exists public.students (
  id uuid primary key,
  full_name text not null check (char_length(trim(full_name)) > 0),
  photo_url text,
  points integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students enable row level security;

-- 3) سياسات الوصول: العرض (SELECT) عام بالكامل لأي زائر بدون تسجيل دخول،
--    والمسؤول فقط (admin) يضيف/يعدّل/يحذف ويغيّر النقاط.
drop policy if exists "أي مستخدم مسجل دخوله يقرأ الطلاب" on public.students;
drop policy if exists "الجميع يقرأ الطلاب بدون تسجيل دخول" on public.students;
create policy "الجميع يقرأ الطلاب بدون تسجيل دخول"
  on public.students for select
  to anon, authenticated
  using (true);

drop policy if exists "المسؤول فقط يضيف طلابًا" on public.students;
create policy "المسؤول فقط يضيف طلابًا"
  on public.students for insert
  with check (public.is_admin());

drop policy if exists "المسؤول فقط يعدّل بيانات الطلاب" on public.students;
create policy "المسؤول فقط يعدّل بيانات الطلاب"
  on public.students for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "المسؤول فقط يحذف الطلاب" on public.students;
create policy "المسؤول فقط يحذف الطلاب"
  on public.students for delete
  using (public.is_admin());

-- 4) تحديث updated_at تلقائيًا عند أي تعديل
create or replace function public.handle_students_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_students_updated on public.students;
create trigger on_students_updated
  before update on public.students
  for each row execute procedure public.handle_students_updated_at();

-- 5) تفعيل Realtime على جدول الطلاب (شرط Realtime UI بدون reload)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'students'
  ) then
    alter publication supabase_realtime add table public.students;
  end if;
end $$;

-- 6) تخزين صور الطلاب (Supabase Storage)
--    الحاوية عامة للقراءة (لعرض الصور مباشرة بدون روابط موقّتة)،
--    لكن الرفع/التعديل/الحذف مقصور على المسؤول فقط عبر السياسات أدناه.
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

drop policy if exists "صور الطلاب متاحة للقراءة للجميع" on storage.objects;
create policy "صور الطلاب متاحة للقراءة للجميع"
  on storage.objects for select
  using (bucket_id = 'student-photos');

drop policy if exists "المسؤول فقط يرفع صور الطلاب" on storage.objects;
create policy "المسؤول فقط يرفع صور الطلاب"
  on storage.objects for insert
  with check (bucket_id = 'student-photos' and public.is_admin());

drop policy if exists "المسؤول فقط يحدّث صور الطلاب" on storage.objects;
create policy "المسؤول فقط يحدّث صور الطلاب"
  on storage.objects for update
  using (bucket_id = 'student-photos' and public.is_admin());

drop policy if exists "المسؤول فقط يحذف صور الطلاب" on storage.objects;
create policy "المسؤول فقط يحذف صور الطلاب"
  on storage.objects for delete
  using (bucket_id = 'student-photos' and public.is_admin());
