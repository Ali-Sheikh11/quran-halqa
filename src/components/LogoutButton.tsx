"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-medium text-sand transition hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? "جارٍ الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
