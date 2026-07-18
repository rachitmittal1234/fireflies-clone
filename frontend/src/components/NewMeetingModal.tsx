"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  if (!open) return null;

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
            <label className="text-sm font-medium block mb-1">
              Paste Transcript (optional)
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder={`Priya Sharma [0-15]: Let's get started.\nDaniel Lee [16-30]: Sounds good.`}
              className="w-full border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
            />
            <p className="text-xs text-[var(--ff-text-muted)] mt-1">
              Format: Speaker [start-end]: text (one line per segment)
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
