from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/meetings/{meeting_id}/action-items", tags=["action_items"])


@router.post("", response_model=schemas.ActionItemOut, status_code=201)
def create_action_item(meeting_id: int, payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    item = models.ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(meeting_id: int, item_id: int, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = (
        db.query(models.ActionItem)
        .filter(models.ActionItem.id == item_id, models.ActionItem.meeting_id == meeting_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_action_item(meeting_id: int, item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(models.ActionItem)
        .filter(models.ActionItem.id == item_id, models.ActionItem.meeting_id == meeting_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
    return None
