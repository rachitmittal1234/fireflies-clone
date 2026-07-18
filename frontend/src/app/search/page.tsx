"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/types";

function GlobalSearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .globalSearch(query)
      .then((data) => setResults(data as MeetingListItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputValue)}`);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Search Across All Meetings</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search meeting titles and transcript content..."
          className="w-full max-w-xl px-4 py-2.5 rounded-lg border border-[var(--ff-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
          autoFocus
        />
      </form>

      {!query.trim() ? (
        <p className="text-sm text-[var(--ff-text-muted)]">
          Type a search term above to find matching meetings by title or transcript content.
        </p>
      ) : loading ? (
        <p className="text-sm text-[var(--ff-text-muted)]">Searching...</p>
      ) : results.length === 0 ? (
        <div className="ff-card p-8 text-center text-[var(--ff-text-muted)]">
          No meetings found matching &quot;{query}&quot;
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--ff-text-muted)] mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          <div className="space-y-2">
            {results.map((m) => (
              <div
                key={m.id}
                onClick={() => router.push(`/meetings/${m.id}`)}
                className="ff-card p-4 cursor-pointer hover:border-[var(--ff-purple-light)] transition"
              >
                <p className="font-medium text-sm">{m.title}</p>
                <p className="text-xs text-[var(--ff-text-muted)] mt-1">
                  {new Date(m.date).toLocaleDateString()} ·{" "}
                  {m.participants.map((p) => p.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--ff-text-muted)]">Loading...</div>}>
      <GlobalSearchInner />
    </Suspense>
  );
}
