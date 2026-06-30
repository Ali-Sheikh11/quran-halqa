import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * عميل Supabase يُستخدم داخل Server Components و Route Handlers و Server Actions.
 * يقرأ الجلسة من الكوكيز الآمنة (HTTP-only) التي يديرها Supabase نفسه.
 * لا يوجد أي اعتماد على localStorage.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // يحدث هذا الخطأ عند استدعاء set من داخل Server Component فقط (وليس Server Action)
            // ويمكن تجاهله بأمان لأن Middleware يتكفّل بتحديث الجلسة.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // نفس الملاحظة أعلاه
          }
        },
      },
    }
  );
}
