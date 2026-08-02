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
 * يضغط الصورة باستخدام Canvas API المدمجة في المتصفح:
 * - يُقلّص أبعادها إلى حد أقصى 800×800 بكسل مع الحفاظ على النسبة
 * - يُحوّلها إلى JPEG بجودة 80%
 * - النتيجة: صورة أصغر بكثير (عادةً من 5MB إلى أقل من 200KB)
 */
export async function compressPhoto(file: File): Promise<File> {
  const MAX_DIMENSION = 800;
  const QUALITY = 0.8;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("تعذّر ضغط الصورة"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("تعذّر ضغط الصورة"));
            return;
          }
          // نُعيد File بنفس اسم الملف الأصلي لكن بصيغة JPEG
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
          }));
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("تعذّر قراءة الصورة"));
    };

    img.src = objectUrl;
  });
}

/**
 * يرفع صورة الطالب إلى مسار ثابت بحسب معرّف الطالب (upsert)، بحيث لا تتكوّن
 * ملفات يتيمة عند استبدال الصورة لاحقًا، ثم يُرجع رابط عام مع علامة زمنية
 * لإجبار المتصفح على عرض النسخة الجديدة فورًا بدل النسخة المخزّنة مؤقتًا.
 * يضغط الصورة تلقائياً قبل الرفع.
 */
export async function uploadStudentPhoto(
  supabase: SupabaseClient,
  studentId: string,
  file: File
): Promise<string> {
  // ضغط الصورة أولاً قبل الرفع
  const compressed = await compressPhoto(file);

  const path = `${studentId}/photo`;

  const { error } = await supabase.storage
    .from(STUDENT_PHOTOS_BUCKET)
    .upload(path, compressed, {
      upsert: true,
      contentType: "image/jpeg",
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
