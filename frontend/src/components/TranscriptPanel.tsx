"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptSegment } from "@/types";
import { api } from "@/lib/api";

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
  const [localSegments, setLocalSegments] = useState<TranscriptSegment[]>(segments);
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    setLocalSegments(segments);
  }, [segments]);

  async function handleToggleHighlight(segId: number, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = (await api.toggleHighlight(segId)) as TranscriptSegment;
    setLocalSegments((prev) => prev.map((s) => (s.id === segId ? updated : s)));
  }

  async function handleAddComment(segId: number, e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!commentDraft.trim()) return;
    const comment = await api.addComment(segId, commentDraft);
    setLocalSegments((prev) =>
      prev.map((s) =>
        s.id === segId ? { ...s, comments: [...s.comments, comment as any] } : s
      )
    );
    setCommentDraft("");
  }

  async function handleDeleteComment(segId: number, commentId: number, e: React.MouseEvent) {
    e.stopPropagation();
    await api.deleteComment(segId, commentId);
    setLocalSegments((prev) =>
      prev.map((s) =>
        s.id === segId ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) } : s
      )
    );
  }

  const activeSegment = localSegments.find(
    (s) => currentTime >= s.start_time && currentTime < s.end_time
  );

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSegment?.id]);

  const filtered = query.trim()
    ? localSegments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : localSegments;

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
              style={
                isActive
                  ? { backgroundColor: "var(--ff-highlight-bg)" }
                  : seg.is_highlighted
                  ? { backgroundColor: "rgba(250, 204, 21, 0.12)" }
                  : undefined
              }
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
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-[var(--ff-text)] leading-relaxed">
                    {highlightText(seg.text, query)}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleHighlight(seg.id, e)}
                      title={seg.is_highlighted ? "Remove highlight" : "Highlight this line"}
                      className={`text-sm ${
                        seg.is_highlighted
                          ? "text-amber-500"
                          : "text-[var(--ff-text-muted)] hover:text-amber-500"
                      } transition`}
                    >
                      {seg.is_highlighted ? "★" : "☆"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCommentId(openCommentId === seg.id ? null : seg.id);
                      }}
                      title="Comment on this line"
                      className="text-xs text-[var(--ff-text-muted)] hover:text-[var(--ff-purple)] transition"
                    >
                      💬{(seg.comments?.length ?? 0) > 0 ? ` ${seg.comments!.length}` : ""}
                    </button>
                  </div>
                </div>

                {(seg.comments?.length ?? 0) > 0 && (
                  <div className="mt-2 space-y-1">
                    {seg.comments!.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-xs bg-black/5 rounded px-2 py-1"
                      >
                        <span>
                          <span className="font-medium">{c.author_name}:</span> {c.text}
                        </span>
                        <button
                          onClick={(e) => handleDeleteComment(seg.id, c.id, e)}
                          className="text-red-400 hover:text-red-500 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {openCommentId === seg.id && (
                  <form
                    onSubmit={(e) => handleAddComment(seg.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 flex gap-2"
                  >
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Add a comment..."
                      autoFocus
                      className="flex-1 text-xs border border-[var(--ff-border)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--ff-purple-light)]"
                    />
                    <button type="submit" className="text-xs ff-btn-primary px-2 py-1">
                      Post
                    </button>
                  </form>
                )}
              </div>
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
