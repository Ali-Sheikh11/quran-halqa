import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-emerald-800/95 backdrop-blur supports-[backdrop-filter]:bg-emerald-800/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden="true">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#C9A227" strokeWidth="1.5" />
            <g transform="translate(20,20)" stroke="#E8D9A8" strokeWidth="1.2" fill="none">
              <polygon points="0,-10 10,0 0,10 -10,0" />
              <polygon points="7,-7 7,7 -7,7 -7,-7" />
            </g>
          </svg>
          <span className="font-verse text-lg font-bold text-sand sm:text-xl">
            منارة القرآن
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/students"
            className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-medium text-sand transition hover:bg-white/10"
          >
            الطلاب
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-night transition hover:bg-gold-light"
                >
                  لوحة التحكم
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-medium text-sand transition hover:bg-white/10"
            >
              تسجيل دخول المسؤول
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
