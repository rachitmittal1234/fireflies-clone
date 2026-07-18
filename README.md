# Fireflies.ai Clone — Meeting Notes & Transcription Platform

A functional clone of Fireflies.ai built for the Scaler SDE Fullstack Assignment. Recreates the core meeting library, interactive transcript viewer, AI-generated summaries/action items, and meeting CRUD workflows.

## Tech Stack
- **Frontend:** Next.js 14 (TypeScript, App Router), Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite via SQLAlchemy ORM
- **Validation:** Pydantic v2

## Architecture Overview
- Frontend is a client-rendered Next.js app that talks to the backend exclusively via REST (`src/lib/api.ts`).
- Backend exposes a REST API under `/api/meetings/*`, using SQLAlchemy models mapped to a single SQLite file.
- No real STT/audio processing — transcripts are seeded or pasted by the user in a simple `Speaker [start-end]: text` format and parsed server-side.

## Database Schema

| Table | Key Fields | Relationships |
|---|---|---|
| `users` | id, name, email | 1:N with meetings |
| `meetings` | id, title, date, duration_seconds, media_url | N:M participants, 1:N transcript_segments/topics/action_items, 1:1 summary |
| `participants` | id, name, email | N:M with meetings via `meeting_participants` |
| `meeting_participants` | meeting_id, participant_id | join table |
| `transcript_segments` | id, meeting_id, speaker_name, start_time, end_time, text, order_index | N:1 meeting |
| `summaries` | id, meeting_id (unique), overview_text | 1:1 meeting |
| `topics` | id, meeting_id, title, start_time, order_index | N:1 meeting |
| `action_items` | id, meeting_id, text, is_completed, assignee_name | N:1 meeting |

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | List meetings (search, participant, date range, sort) |
| GET | `/api/meetings/{id}` | Full meeting detail (transcript, summary, topics, action items) |
| POST | `/api/meetings` | Create meeting (form fields + optional pasted transcript) |
| PUT | `/api/meetings/{id}` | Update meeting metadata |
| DELETE | `/api/meetings/{id}` | Delete meeting (cascades to related rows) |
| GET | `/api/meetings/{id}/transcript/search?q=` | Search within one transcript |
| GET | `/api/meetings/search/global?q=` | Search titles + transcripts across all meetings |
| POST | `/api/meetings/{id}/action-items` | Create action item |
| PUT | `/api/meetings/{id}/action-items/{item_id}` | Update / toggle-complete action item |
| DELETE | `/api/meetings/{id}/action-items/{item_id}` | Delete action item |

## Setup Instructions

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed          # seeds 3 sample meetings
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
- Meetings library with search, sort (recent/oldest), grid view
- Meeting detail page: transcript panel synced bidirectionally with a placeholder media player (click transcript line → seeks player, playback highlights active line)
- In-transcript search with highlighted matches
- AI summary, topics/chapters, and action items (seeded / mocked)
- Full CRUD: create meeting (form + pasted transcript), edit title inline, delete meeting, add/complete/delete action items
- Toast notifications, dark mode toggle, Markdown/TXT export

## Assumptions
- No real authentication — a single default user is assumed logged in.
- No real audio/video — the media player is a functional placeholder (seek bar drives transcript sync, not actual playback).
- Transcript upload accepts a simple text format (`Speaker [start-end]: text` per line) rather than `.vtt`/`.json` parsing, to keep scope manageable within the time budget.
- AI summaries/action items are seeded rather than LLM-generated live, per assignment's "can be mocked" allowance.

## Known Limitations
- SQLite file is local; on some free-tier hosts the filesystem is ephemeral (data resets on redeploy) — see deployment notes below.
- No real-time collaboration or live meeting bot (explicitly out of scope per assignment).
