// أبسط طريقة لتحديد صلاحية الأدمن: عبر قائمة بريد إلكتروني ثابتة.
// عدّل هذه القائمة لإضافة/إزالة مشرفين. يجب أن تطابق القائمة
// الموجودة داخل دالة public.is_admin() في supabase (انظر
// supabase/migration_admin_by_email.sql).
export const ADMIN_EMAILS = ["ad@qr.com"];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized);
}
