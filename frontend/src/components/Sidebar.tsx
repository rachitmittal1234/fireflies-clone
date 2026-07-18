"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Meetings", href: "/meetings", icon: "📼" },
  { label: "AI Apps", href: "/coming-soon?from=ai-apps", icon: "✨" },
  { label: "Integrations", href: "/coming-soon?from=integrations", icon: "🔗" },
  { label: "Team", href: "/coming-soon?from=team", icon: "👥" },
  { label: "Settings", href: "/coming-soon?from=settings", icon: "⚙️" },
];

function isItemActive(pathname: string, searchParams: URLSearchParams, href: string): boolean {
  const [hrefPath, hrefQuery] = href.split("?");
  if (hrefPath === "/") return pathname === "/";
  if (hrefPath !== pathname) return false;
  if (!hrefQuery) return true; // e.g. /meetings with no query to match
  const hrefFrom = new URLSearchParams(hrefQuery).get("from");
  return searchParams.get("from") === hrefFrom;
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (collapsed) {
    return (
      <aside
        style={{ backgroundColor: "var(--ff-sidebar)" }}
        className="w-16 shrink-0 h-screen sticky top-0 border-r border-[var(--ff-border)] flex flex-col items-center py-5"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--ff-purple)] text-white flex items-center justify-center font-bold mb-6">
          F
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isItemActive(pathname, searchParams, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-purple-light)] ${
                  active ? "bg-purple-50 text-[var(--ff-purple)]" : ""
                }`}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "var(--ff-hover-bg)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "";
                }}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      style={{ backgroundColor: "var(--ff-sidebar)" }}
      className="w-60 shrink-0 h-screen sticky top-0 border-r border-[var(--ff-border)] flex flex-col"
    >
      <div className="px-5 py-5 flex items-center gap-2 border-b border-[var(--ff-border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--ff-purple)] text-white flex items-center justify-center font-bold">
          F
        </div>
        <span className="font-semibold text-lg tracking-tight text-[var(--ff-text)]">
          Fireflies
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isItemActive(pathname, searchParams, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-purple-light)] ${
                active
                  ? "bg-purple-50 text-[var(--ff-purple)] font-medium"
                  : "text-[var(--ff-text-muted)] hover:text-[var(--ff-text)]"
              }`}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--ff-hover-bg)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "";
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
