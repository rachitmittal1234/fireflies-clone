# Fireflies.ai Clone — Meeting Notes & Transcription Platform

A functional clone of Fireflies.ai built for the Scaler SDE Fullstack Assignment. Recreates the core meeting library, interactive transcript viewer with highlights and comments, AI-generated summaries/action items/topics, meeting CRUD, global search, tag filtering, and export — with a UI closely modeled on the real Fireflies app (including light/dark themes and a collapsible sidebar).

## Live Demo
- **Frontend:** https://fireflies-clone-ruby.vercel.app
- **Backend API:** https://fireflies-clone-backend-62hd.onrender.com

> Note: the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle time may take 30–50 seconds to wake up.

## Tech Stack
- **Frontend:** Next.js 16 (TypeScript, App Router), Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite via SQLAlchemy ORM
- **Validation:** Pydantic v2
- **PDF export:** jsPDF (client-side)

## Architecture Overview
- The frontend is a client-rendered Next.js app that talks to the backend exclusively via REST (`src/lib/api.ts`).
- The backend exposes a REST API under `/api/*`, using SQLAlchemy models mapped to a single SQLite file. Tables are created automatically on startup, and the database is auto-seeded on first boot if empty (`seed_if_empty()` in `main.py`).
- No real STT/audio processing — transcripts are seeded, pasted, or uploaded (`.txt` / `.vtt` / `.json`) and parsed server-side (or client-side for `.vtt`/`.json`, then sent through the same pipeline as pasted text).

## Database Schema

| Table | Key Fields | Relationships |
|---|---|---|
| `users` | id, name, email | 1:N with meetings |
| `meetings` | id, title, date, duration_seconds, media_url | N:M participants, 1:N transcript_segments / topics / action_items, 1:1 summary |
| `participants` | id, name, email | N:M with meetings via `meeting_participants` |
| `meeting_participants` | meeting_id, participant_id | join table |
| `transcript_segments` | id, meeting_id, speaker_name, start_time, end_time, text, order_index, **is_highlighted** | N:1 meeting, 1:N comments |
| `comments` | id, segment_id, text, author_name, created_at | N:1 transcript_segment |
| `summaries` | id, meeting_id (unique), overview_text | 1:1 meeting |
| `topics` | id, meeting_id, title, start_time, order_index | N:1 meeting |
| `action_items` | id, meeting_id, text, is_completed, assignee_name | N:1 meeting |

## API Overview

### Meetings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | List meetings — filters: `search` (title), `participant`, `topic`, `date_from`, `date_to`; `sort=recent\|oldest` |
| GET | `/api/meetings/{id}` | Full meeting detail (participants, transcript, summary, topics, action items) |
| POST | `/api/meetings` | Create meeting — form fields + optional `transcript_raw` (pasted or file-parsed text) |
| PUT | `/api/meetings/{id}` | Update meeting metadata (title, date, duration, participant list) |
| PUT | `/api/meetings/{id}/participants/{participant_id}` | Rename a participant — **cascades** the new name to their transcript speaker labels and assigned action items within that meeting |
| DELETE | `/api/meetings/{id}` | Delete meeting (cascades to all related rows) |
| GET | `/api/meetings/{id}/transcript/search?q=` | Search within one meeting's transcript |
| GET | `/api/meetings/search/global?q=` | Global search — matches meeting titles or transcript content across all meetings |
| GET | `/api/meetings/topics/all` | Distinct list of all topic titles across meetings, used to build the tag filter |

### Action Items
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/meetings/{meeting_id}/action-items` | Create action item |
| PUT | `/api/meetings/{meeting_id}/action-items/{item_id}` | Update text, assignee, or toggle `is_completed` |
| DELETE | `/api/meetings/{meeting_id}/action-items/{item_id}` | Delete action item |

### Transcript Segments
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/transcript-segments/{segment_id}/highlight` | Toggle highlight (soundbite) on a transcript line |
| POST | `/api/transcript-segments/{segment_id}/comments` | Add a comment to a transcript line |
| DELETE | `/api/transcript-segments/{segment_id}/comments/{comment_id}` | Delete a comment |

## Setup Instructions

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed          # seeds 3 sample meetings with full transcripts/summaries/topics/action items
uvicorn app.main:app --reload --port 8000
```
API available at `http://localhost:8000`.

### Frontend
```bash
cd frontend
npm install
# create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
App available at `http://localhost:3000`.

## Features Implemented

**Core:**
- Meetings library: search (title), sort (recent/oldest), filters (participant, date range), tag/topic filter chips
- Meeting detail: transcript panel bidirectionally synced with a placeholder media player (click a line to seek; playback highlights the active line and auto-scrolls to it)
- In-transcript search with highlighted matches
- AI summary, topics/chapters (click-to-seek), and action items (seeded/mocked per assignment spec)
- Full CRUD: create meeting via form, pasted transcript, or uploaded `.txt`/`.vtt`/`.json` file; inline-editable title and per-participant renaming (with cascading updates to transcript + action items); delete meeting; add/edit/complete/delete action items
- Navigation matching Fireflies patterns: collapsible sidebar, top header with notifications and profile dropdown, toasts, "Coming Soon" placeholders for out-of-scope features (integrations, team, real auth)

**Bonus:**
- Highlights ("soundbites") and comments on individual transcript lines
- Export a meeting as Markdown, plain text, or PDF
- Global search across all meeting titles and transcript content
- Tag/topic filter chips on the meetings library
- Dark mode (theme-aware sidebar, header, and all interactive surfaces)

## Assumptions
- No real authentication — a single default user (Rachit Mittal) is assumed logged in throughout.
- No real audio/video — the media player is a functional placeholder; its seek bar drives transcript sync via timestamps rather than real playback.
- Transcript upload accepts `.txt` (either the `Speaker [start-end]: text` format or freeform lines), `.vtt` (parsed client-side into the same format), and `.json` (array of `{speaker, start, end, text}` objects).
- AI summaries/topics/action items are seeded rather than generated live by an LLM at meeting-creation time, per the assignment's explicit allowance for mocked/seeded content.
- Deleting a participant entirely (versus renaming them) is not supported from the UI — only rename, matching the "edit metadata" requirement rather than full participant-list management.

## Known Limitations
- SQLite on Render's free tier can reset on redeploy in some configurations; the app auto-reseeds if the database is empty on startup, so it self-heals but any manually-created meetings would not survive a cold redeploy.
- No real-time collaboration or live meeting bot (explicitly out of scope per the assignment).
