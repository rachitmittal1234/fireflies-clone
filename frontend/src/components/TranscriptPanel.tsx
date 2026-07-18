"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptSegment } from "@/types";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const SPEAKER_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function buildSpeakerColorMap(segments: TranscriptSegment[]) {
  const map: Record<string, string> = {};
  let colorIndex = 0;
  for (const seg of segments) {
    if (!(seg.speaker_name in map)) {
      map[seg.speaker_name] = SPEAKER_COLORS[colorIndex % SPEAKER_COLORS.length];
      colorIndex++;
    }
  }
  return map;
}

export default function TranscriptPanel({
  segments,
  currentTime,
  onSeek,
}: {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const [query, setQuery] = useState("");
  const speakerColors = buildSpeakerColorMap(segments);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const activeSegment = segments.find(
    (s) => currentTime >= s.start_time && currentTime < s.end_time
  );

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSegment?.id]);

  const filtered = query.trim()
    ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : segments;

  return (
    <div className="ff-card flex flex-col h-full">
      <div className="p-4 border-b border-[var(--ff-border)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search within transcript..."
          className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
        />
        {query && (
          <p className="text-xs text-[var(--ff-text-muted)] mt-1">
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
        {filtered.map((seg) => {
          const isActive = activeSegment?.id === seg.id;
          return (
            <div
              key={seg.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSeek(seg.start_time)}
              style={isActive ? { backgroundColor: "var(--ff-highlight-bg)" } : undefined}
              className={`flex gap-3 p-2 rounded-lg cursor-pointer transition ${
                isActive ? "ring-1 ring-[var(--ff-purple-light)]" : "ff-hover"
              }`}
            >
              <div className="shrink-0 w-24">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    speakerColors[seg.speaker_name]
                  }`}
                >
                  {seg.speaker_name}
                </span>
                <div className="text-[10px] text-[var(--ff-text-muted)] mt-1">
                  {formatTime(seg.start_time)}
                </div>
              </div>
              <p className="text-sm text-[var(--ff-text)] leading-relaxed">
                {highlightText(seg.text, query)}
              </p>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--ff-text-muted)] text-center py-8">
            No matching transcript lines.
          </p>
        )}
      </div>
    </div>
  );
}
