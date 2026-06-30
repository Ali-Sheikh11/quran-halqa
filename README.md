# منارة القرآن 🌙 — منصة إدارة نقاط الحلقة القرآنية

منصّة جاهزة للنشر مباشرة على Vercel، توفّر: هوية بصرية إسلامية هادئة،
نظام مصادقة آمن عبر Supabase (مسؤول / مشاهد)، حماية كاملة لصفحات لوحة
التحكم على مستوى السيرفر، **ونظام كامل لإدارة الطلاب** (إضافة، تعديل،
حذف، صور، بحث فوري، وتحديث مباشر عبر Realtime). **لا يتضمن هذا الإصدار**
نظام النقاط الفعلي أو الترتيب أو الإنجازات — هذه مرحلة لاحقة تُبنى فوق
هذا الأساس.

---

## 1) التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 14 (App Router) + TypeScript |
| التنسيق | Tailwind CSS (RTL كامل) |
| المصادقة وقاعدة البيانات | Supabase Auth + Postgres |
| الصور | Supabase Storage |
| التحديث المباشر | Supabase Realtime (postgres_changes) |
| الجلسات | كوكيز HTTP-only عبر `@supabase/ssr` (بدون أي اعتماد على localStorage) |
| الحماية | Next.js Middleware + تحقق إضافي على مستوى Server Components + RLS |
| الاستضافة | Vercel |

---

## 2) إعداد مشروع Supabase (مرة واحدة)

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com) (أو استخدم مشروعًا موجودًا).
2. من **SQL Editor**، افتح ملف `supabase/schema.sql` الموجود في هذا المشروع،
   انسخ محتواه **بالكامل** (القسمان معًا: الملفات الشخصية + الطلاب)، الصقه، ثم اضغط **Run**.
   - القسم الأول ينشئ جدول `profiles` ويُفعّل الحماية (RLS) ويضبط كل مستخدم جديد
     ليكون دوره الافتراضي `viewer`.
   - القسم الثاني (المرحلة 2) ينشئ جدول `students`، يفعّل سياسات RLS
     (قراءة لأي مستخدم مسجّل دخوله، وكتابة للمسؤول فقط)، يفعّل Realtime
     على الجدول، وينشئ حاوية تخزين `student-photos` لصور الطلاب مع
     سياساتها الخاصة (قراءة عامة، كتابة للمسؤول فقط).
3. من **Project Settings > API** انسخ القيمتين:
   - `Project URL`
   - `anon public key`

### إنشاء أول حساب "مسؤول" (Admin)
لا يوجد تسجيل عام في الموقع (بشكل مقصود لأسباب أمنية). لإنشاء المسؤول الأول:

1. من **Authentication > Users**، اضغط **Add user** وأدخل بريدًا إلكترونيًا
   وكلمة مرور للمسؤول (المعلّم).
2. عُد إلى **SQL Editor** ونفّذ (بعد استبدال البريد الإلكتروني):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

من الآن فصاعدًا، يمكن لهذا الحساب فقط الدخول إلى `/admin` والقيام بإضافة/تعديل/حذف الطلاب.

### إنشاء حساب "مشاهد" (Viewer)
بنفس الطريقة تمامًا (Authentication > Users > Add user)، لكن **بدون** تنفيذ
أمر الترقية أعلاه — الدور الافتراضي لأي مستخدم جديد هو `viewer` تلقائيًا.
يمكن لهذا الحساب الدخول وعرض صفحة `/students` فقط دون أي صلاحية تعديل.

---

## 3) التشغيل محليًا

```bash
npm install
cp .env.local.example .env.local
# عدّل .env.local وضع فيه القيمتين من خطوة Supabase أعلاه
npm run dev
```

افتح `http://localhost:3000`.

---

## 4) النشر على Vercel

1. ارفع المشروع إلى مستودع GitHub/GitLab.
2. من Vercel: **Add New Project** → اختر المستودع.
3. أثناء الإعداد، أضف متغيرّي البيئة التاليين (من نفس قيم Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. اضغط **Deploy**. لا حاجة لأي إعداد إضافي — المشروع لا يعتمد على أي
   شيء محلي (`localhost`) ويعمل بالكامل على بنية Vercel السحابية.

> ملاحظة: في إعدادات Supabase تحت **Authentication > URL Configuration**،
> أضف رابط موقعك على Vercel ضمن `Site URL` و `Redirect URLs` حتى تعمل
> الجلسات بشكل صحيح في بيئة الإنتاج.

---

## 5) هيكل المشروع

```
src/
├── app/
│   ├── page.tsx              # الصفحة الرئيسية العامة (آية/حديث اليوم)
│   ├── login/page.tsx        # دخول المسؤول والمشاهد
│   ├── students/page.tsx     # صفحة إدارة/عرض الطلاب (محمية: أي مستخدم مسجّل دخوله)
│   ├── admin/                # لوحة تحكم محمية بالكامل (للمسؤول فقط)
│   ├── auth/callback/        # معالج روابط تأكيد Supabase
│   └── globals.css
├── components/
│   ├── students/              # StudentsManager, StudentCard, StudentFormModal,
│   │                           # DeleteConfirmModal, StudentAvatar, QuranicBanner
│   └── Header, Footer, VerseOfTheDay, IslamicPattern...
├── lib/
│   ├── supabase/               # عملاء Supabase (browser / server / middleware)
│   ├── students/storage.ts     # رفع/حذف صور الطلاب عبر Supabase Storage
│   └── content/quotes.ts       # مصدر الآيات والأحاديث المعروضة
└── types/database.types.ts
middleware.ts                  # حماية /admin و /students على مستوى الشبكة قبل أي Render
supabase/schema.sql             # سكربت قاعدة البيانات الكامل (profiles + students)
```

---

## 6) كيف تعمل الحماية الأمنية؟

- الجلسة مخزّنة في كوكيز HTTP-only يديرها Supabase نفسه — **لا** يوجد أي
  `localStorage` أو `sessionStorage` في الكود.
- `middleware.ts` يعترض كل طلب لمسار `/admin` (يتطلب دور `admin`) أو
  `/students` (يتطلب أي مستخدم مسجّل دخوله)، عبر `supabase.auth.getUser()`
  (وليس `getSession()` لأنها تتحقق فعليًا من الخادم).
- طبقة حماية ثانية مستقلة موجودة في كل صفحة محمية كدفاع إضافي حتى لو
  حدث خطأ في إعداد الـ Middleware مستقبلًا.
- سياسات RLS في قاعدة البيانات تمنع أي مستخدم غير مسؤول من إضافة أو
  تعديل أو حذف أي طالب أو صورة، حتى لو حاول استدعاء واجهة Supabase
  مباشرة متجاوزًا الواجهة.
- صور الطلاب تُخزَّن في حاوية Supabase Storage عامة للقراءة (لعرضها
  مباشرة دون روابط موقّتة تنتهي صلاحيتها)، لكن الرفع/الحذف مقصور على
  المسؤول فقط عبر سياسات RLS الخاصة بالتخزين. **ملاحظة خصوصية:** نظرًا
  لأن الحاوية عامة، يُنصح بعدم مشاركة روابط الصور مباشرة خارج المنصة.

---

## 7) ماذا لم يتم تنفيذه (بحسب الطلب)

تم تعمّد عدم إضافة: نظام النقاط الفعلي، عرض الترتيب، والإنجازات. عمود
`points` موجود في جدول `students` (قيمته 0 دائمًا حاليًا) تجهيزًا لمرحلة
لاحقة دون أي إعادة هيكلة لقاعدة البيانات.

