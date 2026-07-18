"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState as useStateAlias } from "react";

export default function TopHeader() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function handleGlobalSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  }
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{ backgroundColor: "var(--ff-sidebar)" }}
      className="h-14 border-b border-[var(--ff-border)] flex items-center justify-between gap-3 px-6 sticky top-0 z-20"
    >
      <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md">
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search across all meetings..."
          className="w-full px-3 py-1.5 rounded-lg border border-[var(--ff-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
          style={{ backgroundColor: "var(--ff-surface-bg)", color: "var(--ff-text)" }}
        />
      </form>

      <div className="flex items-center gap-3">
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="w-9 h-9 rounded-full ff-hover flex items-center justify-center text-[var(--ff-text-muted)] hover:text-[var(--ff-text)] transition relative"
          title="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-72 ff-card p-4 shadow-xl z-30">
            <h3 className="text-sm font-semibold mb-3">Notifications</h3>
            <p className="text-sm text-[var(--ff-text-muted)] text-center py-6">
              You&apos;re all caught up! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="w-9 h-9 rounded-full bg-[var(--ff-purple)] text-white flex items-center justify-center text-sm font-semibold hover:bg-[var(--ff-purple-light)] transition"
        >
          RM
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 ff-card p-2 shadow-xl z-30">
            <div className="px-3 py-2 border-b border-[var(--ff-border)] mb-1">
              <p className="text-sm font-medium">Rachit Mittal</p>
              <p className="text-xs text-[var(--ff-text-muted)]">Free Plan</p>
            </div>
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/coming-soon");
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg ff-hover transition"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/coming-soon");
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg ff-hover transition"
            >
              Upgrade Plan
            </button>
            <button className="w-full text-left px-3 py-2 text-sm rounded-lg ff-hover text-red-500 transition">
              Log Out
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
