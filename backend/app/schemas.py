from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional


class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantOut(ParticipantBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TranscriptSegmentBase(BaseModel):
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    order_index: int = 0


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentOut(TranscriptSegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int


class TopicBase(BaseModel):
    title: str
    start_time: float = 0
    order_index: int = 0


class TopicCreate(TopicBase):
    pass


class TopicOut(TopicBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int


class SummaryBase(BaseModel):
    overview_text: str


class SummaryCreate(SummaryBase):
    pass


class SummaryOut(SummaryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int
    created_at: datetime


class ActionItemBase(BaseModel):
    text: str
    is_completed: bool = False
    assignee_name: Optional[str] = None


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    is_completed: Optional[bool] = None
    assignee_name: Optional[str] = None


class ActionItemOut(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int
    created_at: datetime


class MeetingBase(BaseModel):
    title: str
    date: datetime
    duration_seconds: int = 0
    media_url: Optional[str] = None


class MeetingCreate(MeetingBase):
    participant_names: List[str] = []
    transcript_raw: Optional[str] = None  # raw pasted transcript text


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    media_url: Optional[str] = None
    participant_names: Optional[List[str]] = None


class MeetingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    date: datetime
    duration_seconds: int
    participants: List[ParticipantOut] = []


class MeetingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    date: datetime
    duration_seconds: int
    media_url: Optional[str] = None
    participants: List[ParticipantOut] = []
    transcript_segments: List[TranscriptSegmentOut] = []
    summary: Optional[SummaryOut] = None
    topics: List[TopicOut] = []
    action_items: List[ActionItemOut] = []
