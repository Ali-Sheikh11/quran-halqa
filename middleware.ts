import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAdminEmail } from "@/lib/auth/admin";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");

  // النظام عام بالكامل: أي زائر (بدون تسجيل دخول) يمكنه مشاهدة
  // الطلاب والنقاط والترتيب والإحصائيات بدون أي قيود.
  // التسجيل مطلوب فقط لمسار لوحة تحكم المسؤول /admin.
  if (!isAdminRoute) {
    return response;
  }

  // لا توجد جلسة مصادقة على الإطلاق → إعادة توجيه إلى صفحة الدخول
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // مسار لوحة التحكم /admin يتطلب أن يكون البريد الإلكتروني ضمن قائمة الأدمن
  if (!isAdminEmail(user.email)) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * نطبّق الـ Middleware على كل المسارات ما عدا:
     * الملفات الثابتة، الصور، و API الخاصة بـ Next نفسه
     */
    "/((?!_next/static|_next/image|favicon.ico|patterns/).*)",
  ],
};
