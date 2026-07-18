import { MeetingDetail } from "@/types";
import jsPDF from "jspdf";

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


export function exportMeetingAsPDF(meeting: MeetingDetail) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;

  function addLine(text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) {
    const { size = 11, bold = false, gap = 16 } = opts;
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, marginX, y);
      y += gap;
    }
  }

  addLine(meeting.title, { size: 18, bold: true, gap: 24 });
  addLine(new Date(meeting.date).toLocaleString(), { size: 10, gap: 14 });
  addLine(
    `Participants: ${meeting.participants.map((p) => p.name).join(", ")}`,
    { size: 10, gap: 20 }
  );

  if (meeting.summary) {
    addLine("Summary", { size: 13, bold: true, gap: 18 });
    addLine(meeting.summary.overview_text, { gap: 16 });
    y += 8;
  }

  if (meeting.topics.length) {
    addLine("Topics", { size: 13, bold: true, gap: 18 });
    meeting.topics.forEach((t) => addLine(`• ${t.title}`, { gap: 15 }));
    y += 8;
  }

  if (meeting.action_items.length) {
    addLine("Action Items", { size: 13, bold: true, gap: 18 });
    meeting.action_items.forEach((a) =>
      addLine(
        `${a.is_completed ? "[x]" : "[ ]"} ${a.text}${a.assignee_name ? ` (${a.assignee_name})` : ""}`,
        { gap: 15 }
      )
    );
    y += 8;
  }

  addLine("Transcript", { size: 13, bold: true, gap: 18 });
  meeting.transcript_segments.forEach((s) => {
    const mins = Math.floor(s.start_time / 60);
    const secs = Math.floor(s.start_time % 60).toString().padStart(2, "0");
    addLine(`${s.speaker_name} [${mins}:${secs}]: ${s.text}`, { gap: 15 });
  });

  doc.save(`${meeting.title.replace(/\s+/g, "_")}.pdf`);
}
