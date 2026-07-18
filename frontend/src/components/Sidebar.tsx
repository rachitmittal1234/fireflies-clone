"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Meetings", href: "/", icon: "📼" },
  { label: "AI Apps", href: "/coming-soon", icon: "✨" },
  { label: "Integrations", href: "/coming-soon", icon: "🔗" },
  { label: "Team", href: "/coming-soon", icon: "👥" },
  { label: "Settings", href: "/coming-soon", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[var(--ff-sidebar)] text-white flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[var(--ff-purple-light)] flex items-center justify-center font-bold">
          F
        </div>
        <span className="font-semibold text-lg tracking-tight">Fireflies</span>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = item.href === "/" && pathname === "/";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--ff-purple-light)] flex items-center justify-center text-sm font-semibold">
          RM
        </div>
        <div className="text-sm">
          <div className="font-medium">Rachit Mittal</div>
          <div className="text-white/50 text-xs">Free Plan</div>
        </div>
      </div>
    </aside>
  );
}
