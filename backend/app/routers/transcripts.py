from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/transcript-segments", tags=["transcript_segments"])


@router.put("/{segment_id}/highlight", response_model=schemas.TranscriptSegmentOut)
def toggle_highlight(segment_id: int, db: Session = Depends(get_db)):
    segment = db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.id == segment_id
    ).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")

    segment.is_highlighted = not segment.is_highlighted
    db.commit()
    db.refresh(segment)
    return segment


@router.post("/{segment_id}/comments", response_model=schemas.CommentOut, status_code=201)
def add_comment(segment_id: int, payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    segment = db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.id == segment_id
    ).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")

    comment = models.Comment(segment_id=segment_id, **payload.model_dump())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{segment_id}/comments/{comment_id}", status_code=204)
def delete_comment(segment_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id, models.Comment.segment_id == segment_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return None
