import { createBrowserClient } from "@supabase/ssr";

/**
 * عميل Supabase يُستخدم داخل مكونات العميل (Client Components) فقط.
 * يعتمد على الجلسة المخزّنة في الكوكيز عبر Supabase SSR، وليس على localStorage.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
