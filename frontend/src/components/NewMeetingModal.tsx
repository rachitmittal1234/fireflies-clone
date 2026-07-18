"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

function parseTimeToSeconds(t: string): number {
  // Supports "00:01:23.456" or "00:01:23" or "1:23"
  const parts = t.trim().split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(t) || 0;
}

function parseVtt(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let currentTimes: [number, number] | null = null;
  let buffer: string[] = [];

  function flush() {
    if (currentTimes && buffer.length) {
      const raw = buffer.join(" ").trim();
      let speaker = "Unknown Speaker";
      let content = raw;
      const match = raw.match(/^([A-Za-z][A-Za-z\s]{0,30}):\s*(.*)$/);
      if (match) {
        speaker = match[1].trim();
        content = match[2].trim();
      }
      out.push(`${speaker} [${currentTimes[0]}-${currentTimes[1]}]: ${content}`);
    }
    buffer = [];
  }

  for (const line of lines) {
    const timeMatch = line.match(
      /(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})/
    );
    if (timeMatch) {
      flush();
      const start = parseTimeToSeconds(timeMatch[1].replace(",", "."));
      const end = parseTimeToSeconds(timeMatch[2].replace(",", "."));
      currentTimes = [start, end];
    } else if (line.trim() && !line.trim().startsWith("WEBVTT") && !/^\d+$/.test(line.trim())) {
      buffer.push(line.trim());
    }
  }
  flush();
  return out.join("\n");
}

function parseJsonTranscript(text: string): string {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return text;
    return data
      .map((seg: any) => {
        const speaker = seg.speaker || seg.speaker_name || "Unknown Speaker";
        const start = seg.start ?? seg.start_time ?? 0;
        const end = seg.end ?? seg.end_time ?? start + 5;
        const content = seg.text || "";
        return `${speaker} [${start}-${end}]: ${content}`;
      })
      .join("\n");
  } catch {
    return text;
  }
}

async function parseUploadedFile(file: File): Promise<string> {
  const text = await file.text();
  if (file.name.endsWith(".vtt")) return parseVtt(text);
  if (file.name.endsWith(".json")) return parseJsonTranscript(text);
  return text; // .txt — pass through, backend already handles bracket format or falls back
}

export default function NewMeetingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(600);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  if (!open) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      setTranscript(parsed);
      setUploadedFileName(file.name);
    } catch (err) {
      alert("Failed to read file: " + (err as Error).message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const meeting: any = await api.createMeeting({
        title,
        date: new Date().toISOString(),
        duration_seconds: Number(duration),
        participant_names: participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        transcript_raw: transcript || null,
      });
      onClose();
      router.push(`/meetings/${meeting.id}`);
      router.refresh();
    } catch (err) {
      alert("Failed to create meeting: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="ff-card w-full max-w-lg p-6 bg-white max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">New Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
              placeholder="e.g. Weekly Sync"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Participants (comma separated)
            </label>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
              placeholder="e.g. Priya Sharma, Daniel Lee"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Transcript (optional)</label>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[var(--ff-purple)] hover:underline"
                >
                  Upload file (.txt, .vtt, .json)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.vtt,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {uploadedFileName && (
              <p className="text-xs text-green-600 mb-1">
                ✓ Loaded from {uploadedFileName}
              </p>
            )}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder={`Priya Sharma [0-15]: Let's get started.\nDaniel Lee [16-30]: Sounds good.`}
              className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
            />
            <p className="text-xs text-[var(--ff-text-muted)] mt-1">
              Paste directly, or upload a .txt/.vtt/.json file above. Format: Speaker [start-end]: text
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--ff-border)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ff-btn-primary px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
