import type { SupabaseClient } from "@supabase/supabase-js";

export const STUDENT_PHOTOS_BUCKET = "student-photos";
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * يتحقق من أن الملف صورة صالحة قبل رفعه (نوع الملف وحجمه).
 * يُرجع نص الخطأ إن وُجد، أو null إن كانت الصورة صالحة.
 */
export function validateStudentPhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "الملف المختار ليس صورة. الرجاء اختيار صورة بصيغة JPG أو PNG أو WEBP.";
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "حجم الصورة كبير جدًا. الحد الأقصى 5 ميغابايت.";
  }
  return null;
}

/**
 * يرفع صورة الطالب إلى مسار ثابت بحسب معرّف الطالب (upsert)، بحيث لا تتكوّن
 * ملفات يتيمة عند استبدال الصورة لاحقًا، ثم يُرجع رابط عام مع علامة زمنية
 * لإجبار المتصفح على عرض النسخة الجديدة فورًا بدل النسخة المخزّنة مؤقتًا.
 */
export async function uploadStudentPhoto(
  supabase: SupabaseClient,
  studentId: string,
  file: File
): Promise<string> {
  const path = `${studentId}/photo`;

  const { error } = await supabase.storage
    .from(STUDENT_PHOTOS_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`تعذّر رفع الصورة: ${error.message}`);
  }

  const { data } = supabase.storage.from(STUDENT_PHOTOS_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/**
 * يحذف صورة الطالب من المخزن (تُستدعى عند حذف الطالب نفسه).
 * تُهمل أي أخطاء بصمت لأن غياب الملف ليس خطأ يستحق إيقاف عملية الحذف.
 */
export async function deleteStudentPhoto(
  supabase: SupabaseClient,
  studentId: string
): Promise<void> {
  await supabase.storage.from(STUDENT_PHOTOS_BUCKET).remove([`${studentId}/photo`]);
}
