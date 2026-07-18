"use client";

import { useState } from "react";

export default function Topbar({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const [query, setQuery] = useState("");

  return (
    <header className="h-16 border-b border-[var(--ff-border)] bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 w-full max-w-md">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder="Search meetings..."
          className="w-full px-4 py-2 rounded-lg border border-[var(--ff-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="ff-btn-primary px-4 py-2 text-sm">
          + New Meeting
        </button>
      </div>
    </header>
  );
}
