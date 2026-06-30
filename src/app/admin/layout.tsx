import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/admin");
  }

  // طبقة حماية إضافية على مستوى السيرفر، تعمل جنبًا إلى جنب مع middleware.ts
  if (!isAdminEmail(user.email)) {
    redirect("/?unauthorized=1");
  }

  return <div className="min-h-[calc(100vh-64px)] bg-sand-100/50">{children}</div>;
}
