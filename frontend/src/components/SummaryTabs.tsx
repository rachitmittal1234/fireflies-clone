"use client";

import { useState } from "react";
import { ActionItem, Summary, Topic } from "@/types";
import { api } from "@/lib/api";

type Tab = "summary" | "actions" | "topics";

export default function SummaryTabs({
  meetingId,
  summary,
  actionItems,
  topics,
  onSeek,
  onActionItemsChange,
}: {
  meetingId: number;
  summary?: Summary | null;
  actionItems: ActionItem[];
  topics: Topic[];
  onSeek: (time: number) => void;
  onActionItemsChange: (items: ActionItem[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("summary");
  const [newItemText, setNewItemText] = useState("");

  async function toggleComplete(item: ActionItem) {
    const updated = (await api.updateActionItem(meetingId, item.id, {
      is_completed: !item.is_completed,
    })) as ActionItem;
    onActionItemsChange(
      actionItems.map((i) => (i.id === item.id ? updated : i))
    );
  }

  async function deleteItem(item: ActionItem) {
    await api.deleteActionItem(meetingId, item.id);
    onActionItemsChange(actionItems.filter((i) => i.id !== item.id));
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const created = (await api.createActionItem(meetingId, {
      text: newItemText,
      is_completed: false,
    })) as ActionItem;
    onActionItemsChange([...actionItems, created]);
    setNewItemText("");
  }

  return (
    <div className="ff-card h-full flex flex-col">
      <div className="flex border-b border-[var(--ff-border)]">
        {[
          { key: "summary", label: "Summary" },
          { key: "actions", label: `Action Items (${actionItems.length})` },
          { key: "topics", label: "Topics" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === t.key
                ? "text-[var(--ff-purple)] border-b-2 border-[var(--ff-purple)]"
                : "text-[var(--ff-text-muted)] hover:text-[var(--ff-text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
        {tab === "summary" && (
          <p className="text-sm leading-relaxed text-[var(--ff-text)]">
            {summary?.overview_text || "No summary available for this meeting yet."}
          </p>
        )}

        {tab === "actions" && (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 group">
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleComplete(item)}
                  className="mt-1 accent-[var(--ff-purple)]"
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      item.is_completed
                        ? "line-through text-[var(--ff-text-muted)]"
                        : "text-[var(--ff-text)]"
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.assignee_name && (
                    <span className="text-xs text-[var(--ff-text-muted)]">
                      Assigned to {item.assignee_name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 transition"
                >
                  Delete
                </button>
              </div>
            ))}
            {actionItems.length === 0 && (
              <p className="text-sm text-[var(--ff-text-muted)]">No action items yet.</p>
            )}

            <form onSubmit={addItem} className="flex gap-2 pt-3 border-t border-[var(--ff-border)]">
              <input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add an action item..."
                className="flex-1 border border-[var(--ff-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-purple-light)]"
              />
              <button type="submit" className="ff-btn-primary px-3 py-2 text-sm">
                Add
              </button>
            </form>
          </div>
        )}

        {tab === "topics" && (
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => onSeek(topic.start_time)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-sm">{topic.title}</span>
                <span className="text-xs text-[var(--ff-text-muted)]">
                  {Math.floor(topic.start_time / 60)}:{String(Math.floor(topic.start_time % 60)).padStart(2, "0")}
                </span>
              </div>
            ))}
            {topics.length === 0 && (
              <p className="text-sm text-[var(--ff-text-muted)]">No topics identified.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
