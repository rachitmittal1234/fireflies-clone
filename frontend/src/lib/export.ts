import { MeetingDetail } from "@/types";

export function exportMeetingAsMarkdown(meeting: MeetingDetail) {
  let md = `# ${meeting.title}\n\n`;
  md += `**Date:** ${new Date(meeting.date).toLocaleString()}\n`;
  md += `**Participants:** ${meeting.participants.map((p) => p.name).join(", ")}\n\n`;

  if (meeting.summary) {
    md += `## Summary\n${meeting.summary.overview_text}\n\n`;
  }

  if (meeting.topics.length) {
    md += `## Topics\n`;
    meeting.topics.forEach((t) => (md += `- ${t.title}\n`));
    md += `\n`;
  }

  if (meeting.action_items.length) {
    md += `## Action Items\n`;
    meeting.action_items.forEach((a) => {
      md += `- [${a.is_completed ? "x" : " "}] ${a.text}${a.assignee_name ? ` (${a.assignee_name})` : ""}\n`;
    });
    md += `\n`;
  }

  md += `## Transcript\n`;
  meeting.transcript_segments.forEach((s) => {
    md += `**${s.speaker_name}** [${Math.floor(s.start_time / 60)}:${String(
      Math.floor(s.start_time % 60)
    ).padStart(2, "0")}]: ${s.text}\n\n`;
  });

  downloadFile(`${meeting.title.replace(/\s+/g, "_")}.md`, md);
}

export function exportMeetingAsText(meeting: MeetingDetail) {
  let txt = `${meeting.title}\n${new Date(meeting.date).toLocaleString()}\n\n`;
  meeting.transcript_segments.forEach((s) => {
    txt += `${s.speaker_name}: ${s.text}\n`;
  });
  downloadFile(`${meeting.title.replace(/\s+/g, "_")}.txt`, txt);
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
