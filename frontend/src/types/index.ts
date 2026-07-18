export interface Participant {
  id: number;
  name: string;
  email?: string | null;
  avatar_url?: string | null;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  order_index: number;
}

export interface Topic {
  id: number;
  meeting_id: number;
  title: string;
  start_time: number;
  order_index: number;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview_text: string;
  created_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  is_completed: boolean;
  assignee_name?: string | null;
  created_at: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
}

export interface MeetingDetail extends MeetingListItem {
  media_url?: string | null;
  transcript_segments: TranscriptSegment[];
  summary?: Summary | null;
  topics: Topic[];
  action_items: ActionItem[];
}
