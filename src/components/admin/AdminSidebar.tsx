"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "📊 لوحة التحكم", exact: true },
  { href: "/admin/session", label: "🏁 إدارة الدورة" },
  { href: "/admin/students", label: "👥 إدارة الطلاب" },
  { href: "/admin/settings", label: "⚙️ الإعدادات" },
  { href: "/admin/logs", label: "📋 سجل العمليات" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
        {NAV.map(({ href, label, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href) && href !== "/admin";
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-emerald-100 bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
