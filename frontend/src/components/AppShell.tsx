"use client";

import { useState, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      <Suspense fallback={<div className="w-60 shrink-0 h-screen bg-white border-r border-[var(--ff-border)]" />}>
        <Sidebar collapsed={collapsed} />
      </Suspense>

      <button
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-5 z-30 w-6 h-6 rounded-full bg-white border border-[var(--ff-border)] shadow-sm flex items-center justify-center text-xs text-[var(--ff-text-muted)] hover:text-[var(--ff-purple)] hover:border-[var(--ff-purple-light)] transition"
        style={{ left: collapsed ? "52px" : "228px" }}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <main className="flex-1 min-w-0 flex flex-col">
        <TopHeader />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
