"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TagFilter({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (topic: string | null) => void;
}) {
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    api
      .listAllTopics()
      .then((data) => setTopics(data as string[]))
      .catch(console.error);
  }, []);

  if (topics.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-[var(--ff-text-muted)] mr-1">Tags:</span>
      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-3 py-1 rounded-full border transition ${
          selected === null
            ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]"
            : "border-[var(--ff-border)] text-[var(--ff-text-muted)] ff-hover"
        }`}
      >
        All
      </button>
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelect(topic)}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            selected === topic
              ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]"
              : "border-[var(--ff-border)] text-[var(--ff-text-muted)] ff-hover"
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
