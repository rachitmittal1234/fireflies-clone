"use client";

import { useState, useRef, useEffect } from "react";

export interface Filters {
  participant: string;
  dateFrom: string;
  dateTo: string;
}

export default function FilterBar({
  onApply,
  onClear,
}: {
  onApply: (filters: Filters) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [participant, setParticipant] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const hasActiveFilters = participant || dateFrom || dateTo;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function apply() {
    onApply({ participant, dateFrom, dateTo });
    setOpen(false);
  }

  function clear() {
    setParticipant("");
    setDateFrom("");
    setDateTo("");
    onClear();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg border transition ${
          hasActiveFilters
            ? "border-[var(--ff-purple)] text-[var(--ff-purple)] bg-purple-50"
            : "border-[var(--ff-border)] text-[var(--ff-text)] hover:bg-gray-50"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-4 h-4 rounded-full bg-[var(--ff-purple)] text-white text-[10px] flex items-center justify-center">
            {[participant, dateFrom, dateTo].filter(Boolean).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 ff-card p-5 z-20 shadow-xl border border-[var(--ff-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Filter Meetings</h3>
            {hasActiveFilters && (
              <button
                onClick={clear}
                className="text-xs text-[var(--ff-text-muted)] hover:text-red-500 transition"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium block mb-1.5 text-[var(--ff-text-muted)] uppercase tracking-wide">
              Participant
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ff-text-muted)]"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                placeholder="Search by name"
                className="w-full border border-[var(--ff-border)] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium block mb-1.5 text-[var(--ff-text-muted)] uppercase tracking-wide">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-[var(--ff-text-muted)] block mb-1">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-[var(--ff-border)] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
                />
              </div>
              <div>
                <span className="text-[11px] text-[var(--ff-text-muted)] block mb-1">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-[var(--ff-border)] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--ff-border)]">
            <button
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 text-sm rounded-lg border border-[var(--ff-border)] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button onClick={apply} className="ff-btn-primary px-4 py-1.5 text-sm">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
