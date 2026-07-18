"use client";

import { useRouter } from "next/navigation";
import { MeetingListItem } from "@/types";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return h > 0 ? `${h}h ${remM}m` : `${remM}m`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/meetings/${meeting.id}`)}
      className="ff-card p-4 cursor-pointer hover:shadow-md hover:border-[var(--ff-purple-light)] transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[var(--ff-text)] group-hover:text-[var(--ff-purple)] transition line-clamp-1">
          {meeting.title}
        </h3>
        <span className="text-xs text-[var(--ff-text-muted)] whitespace-nowrap ml-2">
          {formatDuration(meeting.duration_seconds)}
        </span>
      </div>

      <div className="text-xs text-[var(--ff-text-muted)] mb-3">
        {formatDate(meeting.date)}
      </div>

      <div className="flex items-center -space-x-2">
        {meeting.participants.slice(0, 4).map((p) => (
          <div
            key={p.id}
            title={p.name}
            className="w-7 h-7 rounded-full bg-[var(--ff-purple-light)] text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white"
          >
            {initials(p.name)}
          </div>
        ))}
        {meeting.participants.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold flex items-center justify-center border-2 border-white">
            +{meeting.participants.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}
