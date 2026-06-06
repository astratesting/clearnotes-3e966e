from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import SessionLocal
from models.transcript import Transcript
from models.meeting import Meeting
from models.user import User
from routes.auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/meeting/{meeting_id}")
def get_transcript(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = db.query(Transcript).filter(Transcript.meeting_id == meeting_id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return transcript


@router.post("/meeting/{meeting_id}")
def create_transcript(
    meeting_id: int,
    content: str,
    action_items: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = Transcript(
        meeting_id=meeting_id,
        content=content,
        action_items=action_items,
        created_at=datetime.utcnow()
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


@router.patch("/{transcript_id}")
def update_transcript(
    transcript_id: int,
    content: str = None,
    action_items: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    meeting = db.query(Meeting).filter(
        Meeting.id == transcript.meeting_id,
        Meeting.user_id == current_user.id
    ).first()
    if not meeting:
        raise HTTPException(status_code=403, detail="Access denied")

    if content:
        transcript.content = content
    if action_items:
        transcript.action_items = action_items

    db.commit()
    db.refresh(transcript)
    return transcript