from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def get_meeting_or_404(db: Session, meeting_id: int):
    meeting = (
        db.query(models.Meeting)
        .options(
            joinedload(models.Meeting.participants),
            joinedload(models.Meeting.transcript_segments),
            joinedload(models.Meeting.summary),
            joinedload(models.Meeting.topics),
            joinedload(models.Meeting.action_items),
        )
        .filter(models.Meeting.id == meeting_id)
        .first()
    )
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("", response_model=List[schemas.MeetingListOut])
def list_meetings(
    search: Optional[str] = Query(None),
    participant: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    sort: str = Query("recent"),  # recent | oldest
    db: Session = Depends(get_db),
):
    query = db.query(models.Meeting).options(joinedload(models.Meeting.participants))

    if search:
        query = query.filter(models.Meeting.title.ilike(f"%{search}%"))

    if participant:
        query = query.join(models.Meeting.participants).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )

    if date_from:
        query = query.filter(models.Meeting.date >= date_from)
    if date_to:
        query = query.filter(models.Meeting.date <= date_to)

    if sort == "oldest":
        query = query.order_by(models.Meeting.date.asc())
    else:
        query = query.order_by(models.Meeting.date.desc())

    return query.all()


@router.get("/{meeting_id}", response_model=schemas.MeetingDetailOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    return get_meeting_or_404(db, meeting_id)


def _parse_transcript_raw(raw: str):
    """
    Parses a simple transcript format:
    Speaker Name [start-end]: text
    e.g. "Priya Sharma [0-15]: Let's get started."
    Falls back to treating each non-empty line as a single unlabeled segment.
    """
    segments = []
    lines = [l.strip() for l in raw.splitlines() if l.strip()]
    for idx, line in enumerate(lines):
        speaker = "Unknown Speaker"
        start, end = float(idx * 10), float(idx * 10 + 8)
        text = line
        if "]:" in line and "[" in line:
            try:
                name_part, rest = line.split("[", 1)
                time_part, text_part = rest.split("]:", 1)
                speaker = name_part.strip()
                if "-" in time_part:
                    s, e = time_part.split("-")
                    start, end = float(s), float(e)
                text = text_part.strip()
            except Exception:
                pass
        segments.append(
            schemas.TranscriptSegmentCreate(
                speaker_name=speaker, start_time=start, end_time=end, text=text, order_index=idx
            )
        )
    return segments


@router.post("", response_model=schemas.MeetingDetailOut, status_code=201)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting = models.Meeting(
        title=payload.title,
        date=payload.date,
        duration_seconds=payload.duration_seconds,
        media_url=payload.media_url,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    for name in payload.participant_names:
        p = db.query(models.Participant).filter(models.Participant.name == name).first()
        if not p:
            p = models.Participant(name=name)
            db.add(p)
            db.commit()
            db.refresh(p)
        meeting.participants.append(p)

    if payload.transcript_raw:
        segments = _parse_transcript_raw(payload.transcript_raw)
        for seg in segments:
            db.add(models.TranscriptSegment(meeting_id=meeting.id, **seg.model_dump()))

    db.commit()
    return get_meeting_or_404(db, meeting.id)


@router.put("/{meeting_id}", response_model=schemas.MeetingDetailOut)
def update_meeting(meeting_id: int, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = get_meeting_or_404(db, meeting_id)

    if payload.title is not None:
        meeting.title = payload.title
    if payload.date is not None:
        meeting.date = payload.date
    if payload.duration_seconds is not None:
        meeting.duration_seconds = payload.duration_seconds
    if payload.media_url is not None:
        meeting.media_url = payload.media_url

    if payload.participant_names is not None:
        meeting.participants = []
        for name in payload.participant_names:
            p = db.query(models.Participant).filter(models.Participant.name == name).first()
            if not p:
                p = models.Participant(name=name)
                db.add(p)
                db.commit()
                db.refresh(p)
            meeting.participants.append(p)

    db.commit()
    return get_meeting_or_404(db, meeting_id)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = get_meeting_or_404(db, meeting_id)
    db.delete(meeting)
    db.commit()
    return None


@router.get("/{meeting_id}/transcript/search")
def search_transcript(meeting_id: int, q: str = Query(...), db: Session = Depends(get_db)):
    get_meeting_or_404(db, meeting_id)
    results = (
        db.query(models.TranscriptSegment)
        .filter(
            models.TranscriptSegment.meeting_id == meeting_id,
            models.TranscriptSegment.text.ilike(f"%{q}%"),
        )
        .order_by(models.TranscriptSegment.order_index)
        .all()
    )
    return [schemas.TranscriptSegmentOut.model_validate(r) for r in results]


@router.get("/search/global")
def global_search(q: str = Query(...), db: Session = Depends(get_db)):
    meetings = (
        db.query(models.Meeting)
        .join(models.Meeting.transcript_segments, isouter=True)
        .filter(
            or_(
                models.Meeting.title.ilike(f"%{q}%"),
                models.TranscriptSegment.text.ilike(f"%{q}%"),
            )
        )
        .distinct()
        .all()
    )
    return [schemas.MeetingListOut.model_validate(m) for m in meetings]
