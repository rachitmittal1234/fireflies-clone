"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/types";
import MeetingCard from "@/components/MeetingCard";
import NewMeetingModal from "@/components/NewMeetingModal";
import FilterBar, { Filters } from "@/components/FilterBar";

export default function MeetingsLibrary() {
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ participant: "", dateFrom: "", dateTo: "" });

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listMeetings({
        search,
        sort,
        participant: filters.participant || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setMeetings(data as MeetingListItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, filters]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Your Meetings</h1>
            <p className="text-sm text-[var(--ff-text-muted)]">
              {meetings.length} meeting{meetings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings by title..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-[var(--ff-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div />

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
            <FilterBar
              onApply={setFilters}
              onClear={() => setFilters({ participant: "", dateFrom: "", dateTo: "" })}
            />
            <button
              onClick={() => setModalOpen(true)}
              className="ff-btn-primary px-4 py-2 text-sm"
            >
              + New Meeting
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-[var(--ff-text-muted)]">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="ff-card p-12 text-center text-[var(--ff-text-muted)]">
            No meetings found. Try adjusting your search or create a new meeting.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </div>

      <NewMeetingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
