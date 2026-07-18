"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeetingDetail, ActionItem } from "@/types";
import MediaPlayer from "@/components/MediaPlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import SummaryTabs from "@/components/SummaryTabs";
import { useToast } from "@/components/Toast";
import { exportMeetingAsMarkdown, exportMeetingAsText } from "@/lib/export";

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingParticipants, setEditingParticipants] = useState(false);
  const [participantDrafts, setParticipantDrafts] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = (await api.getMeeting(Number(id))) as MeetingDetail;
        setMeeting(data);
        setTitleDraft(data.title);
        setParticipantDrafts(data.participants.map((p) => ({ id: p.id, name: p.name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleTitleSave() {
    if (!meeting) return;
    const updated = (await api.updateMeeting(meeting.id, {
      title: titleDraft,
    })) as MeetingDetail;
    setMeeting({ ...meeting, title: updated.title });
    setEditingTitle(false);
    showToast("Title updated");
  }

  async function handleParticipantsSave() {
    if (!meeting) return;
    let latest: MeetingDetail = meeting;
    for (const draft of participantDrafts) {
      const original = meeting.participants.find((p) => p.id === draft.id);
      if (original && original.name !== draft.name && draft.name.trim()) {
        latest = (await api.renameParticipant(meeting.id, draft.id, draft.name.trim())) as MeetingDetail;
      }
    }
    setMeeting(latest);
    setEditingParticipants(false);
    showToast("Participants updated — transcript and action items synced");
  }

  async function handleDelete() {
    if (!meeting) return;
    if (!confirm("Delete this meeting? This cannot be undone.")) return;
    await api.deleteMeeting(meeting.id);
    showToast("Meeting deleted");
    router.push("/");
  }

  function handleActionItemsChange(items: ActionItem[]) {
    if (!meeting) return;
    setMeeting({ ...meeting, action_items: items });
  }

  if (loading) {
    return <div className="p-6 text-sm text-[var(--ff-text-muted)]">Loading meeting...</div>;
  }

  if (!meeting) {
    return <div className="p-6 text-sm text-red-500">Meeting not found.</div>;
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/")}
        className="text-sm text-[var(--ff-text-muted)] hover:text-[var(--ff-text)] mb-4"
      >
        ← Back to Meetings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex gap-2">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="text-xl font-semibold border border-[var(--ff-border)] rounded-lg px-3 py-1.5"
                autoFocus
              />
              <button onClick={handleTitleSave} className="ff-btn-primary px-3 py-1.5 text-sm">
                Save
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                className="px-3 py-1.5 text-sm border border-[var(--ff-border)] rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{meeting.title}</h1>
              <button
                onClick={() => setEditingTitle(true)}
                className="text-xs text-[var(--ff-purple)] border border-[var(--ff-purple-light)] rounded px-2 py-0.5 hover:bg-purple-50 transition"
              >
                ✎ Edit Title
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <p className="text-sm text-[var(--ff-text-muted)]">
              {new Date(meeting.date).toLocaleString()} ·{" "}
            </p>
            {!editingParticipants && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--ff-text-muted)]">
                  {meeting.participants.map((p) => p.name).join(", ") || "No participants"}
                </p>
                <button
                  onClick={() => setEditingParticipants(true)}
                  className="text-xs text-[var(--ff-purple)] border border-[var(--ff-purple-light)] rounded px-2 py-0.5 hover:bg-purple-50 transition"
                >
                  ✎ Edit Participants
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportMeetingAsMarkdown(meeting);
              showToast("Exported as Markdown");
            }}
            className="text-sm border border-[var(--ff-border)] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            Export .md
          </button>
          <button
            onClick={() => {
              exportMeetingAsText(meeting);
              showToast("Exported as TXT");
            }}
            className="text-sm border border-[var(--ff-border)] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            Export .txt
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
          >
            Delete Meeting
          </button>
        </div>
      </div>

      {editingParticipants && (
        <div className="ff-card p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">Edit Participants</h3>
          <p className="text-xs text-[var(--ff-text-muted)] mb-3">
            Renaming a participant here automatically updates their name in the transcript and any assigned action items.
          </p>
          <div className="space-y-2 mb-4">
            {participantDrafts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2">
                <input
                  value={p.name}
                  onChange={(e) => {
                    const next = [...participantDrafts];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setParticipantDrafts(next);
                  }}
                  className="flex-1 text-sm border border-[var(--ff-border)] rounded-lg px-3 py-1.5"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingParticipants(false)}
              className="px-3 py-1.5 text-sm border border-[var(--ff-border)] rounded-lg"
            >
              Cancel
            </button>
            <button onClick={handleParticipantsSave} className="ff-btn-primary px-4 py-1.5 text-sm">
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <MediaPlayer
          duration={meeting.duration_seconds}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onSeek={setCurrentTime}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TranscriptPanel
          segments={meeting.transcript_segments}
          currentTime={currentTime}
          onSeek={(t) => {
            setCurrentTime(t);
            setIsPlaying(false);
          }}
        />
        <SummaryTabs
          meetingId={meeting.id}
          summary={meeting.summary}
          actionItems={meeting.action_items}
          topics={meeting.topics}
          onSeek={(t) => {
            setCurrentTime(t);
            setIsPlaying(false);
          }}
          onActionItemsChange={handleActionItemsChange}
        />
      </div>
    </div>
  );
}
