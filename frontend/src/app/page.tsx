"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/types";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}m`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = (await api.listMeetings({ sort: "recent" })) as MeetingListItem[];
        setMeetings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalMeetings = meetings.length;
  const totalMinutes = Math.round(
    meetings.reduce((sum, m) => sum + m.duration_seconds, 0) / 60
  );
  const uniqueParticipants = new Set(
    meetings.flatMap((m) => m.participants.map((p) => p.name))
  ).size;

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-1">
          {getGreeting()}, Rachit 👋
        </h1>
        <p className="text-sm text-[var(--ff-text-muted)] mb-6">
          Here&apos;s what&apos;s happening across your meetings.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="ff-card p-5">
            <p className="text-xs text-[var(--ff-text-muted)] mb-1">Total Meetings</p>
            <p className="text-2xl font-semibold text-[var(--ff-purple)]">
              {loading ? "—" : totalMeetings}
            </p>
          </div>
          <div className="ff-card p-5">
            <p className="text-xs text-[var(--ff-text-muted)] mb-1">Minutes Transcribed</p>
            <p className="text-2xl font-semibold text-[var(--ff-purple)]">
              {loading ? "—" : totalMinutes}
            </p>
          </div>
          <div className="ff-card p-5">
            <p className="text-xs text-[var(--ff-text-muted)] mb-1">People You've Met With</p>
            <p className="text-2xl font-semibold text-[var(--ff-purple)]">
              {loading ? "—" : uniqueParticipants}
            </p>
          </div>
        </div>

        {/* Recent meetings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Meetings</h2>
          <button
            onClick={() => router.push("/meetings")}
            className="text-sm text-[var(--ff-purple)] hover:underline"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-[var(--ff-text-muted)]">Loading...</div>
        ) : meetings.length === 0 ? (
          <div className="ff-card p-8 text-center text-[var(--ff-text-muted)]">
            No meetings yet.{" "}
            <button
              onClick={() => router.push("/meetings")}
              className="text-[var(--ff-purple)] hover:underline"
            >
              Create your first one
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => router.push(`/meetings/${m.id}`)}
                className="ff-card p-4 flex items-center justify-between cursor-pointer hover:border-[var(--ff-purple-light)] transition"
              >
                <div>
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-[var(--ff-text-muted)] mt-0.5">
                    {timeAgo(m.date)} · {m.participants.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <span className="text-xs text-[var(--ff-text-muted)]">
                  {formatDuration(m.duration_seconds)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
