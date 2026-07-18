from datetime import datetime, timedelta
from .database import Base, engine, SessionLocal
from . import models


def get_or_create_participant(db, name, email=None):
    p = db.query(models.Participant).filter(models.Participant.name == name).first()
    if p:
        return p
    p = models.Participant(name=name, email=email or f"{name.lower().replace(' ', '.')}@example.com")
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    user = models.User(name="Rachit Mittal", email="rachit@example.com", avatar_url=None)
    db.add(user)
    db.commit()
    db.refresh(user)

    meetings_data = [
        {
            "title": "Q3 Product Roadmap Sync",
            "days_ago": 1,
            "duration": 1845,
            "participants": ["Rachit Mittal", "Priya Sharma", "Daniel Lee"],
            "segments": [
                ("Rachit Mittal", 0, 12, "Alright everyone, let's kick off the Q3 roadmap discussion. Priya, can you start with the design updates?"),
                ("Priya Sharma", 13, 35, "Sure. We finalized the new onboarding flow and it's ready for dev handoff by Friday."),
                ("Daniel Lee", 36, 58, "Great, I'll allocate two engineers for that next sprint. What about the analytics dashboard?"),
                ("Priya Sharma", 59, 80, "That's still in wireframe stage, I need another week before handoff."),
                ("Rachit Mittal", 81, 100, "Okay, let's timebox it. Daniel, can your team start on the API side in parallel?"),
                ("Daniel Lee", 101, 130, "Yes, we can start the backend endpoints now since the data model is mostly settled."),
                ("Rachit Mittal", 131, 150, "Perfect. Let's also talk about the action items from last week before wrapping up."),
            ],
            "summary": "The team reviewed Q3 roadmap priorities, focusing on the onboarding redesign and analytics dashboard. Design finalized the onboarding flow for dev handoff, while the analytics dashboard remains in wireframe stage. Engineering will begin backend API work in parallel to save time.",
            "topics": [("Onboarding Redesign", 0), ("Analytics Dashboard", 36), ("Sprint Planning", 81)],
            "action_items": [
                ("Hand off onboarding designs to engineering", "Priya Sharma"),
                ("Finalize analytics dashboard wireframes", "Priya Sharma"),
                ("Start backend API scaffolding for analytics", "Daniel Lee"),
            ],
        },
        {
            "title": "Customer Feedback Review",
            "days_ago": 3,
            "duration": 1500,
            "participants": ["Rachit Mittal", "Ananya Gupta"],
            "segments": [
                ("Ananya Gupta", 0, 20, "I compiled feedback from the last 15 customer calls. Biggest theme is around search performance."),
                ("Rachit Mittal", 21, 40, "Interesting. Is that latency or relevance of results?"),
                ("Ananya Gupta", 41, 65, "Mostly latency. A few customers mentioned search taking over three seconds on large datasets."),
                ("Rachit Mittal", 66, 90, "Let's flag that to the infra team. Anything else stand out?"),
                ("Ananya Gupta", 91, 115, "Yes, several requests for a dark mode option and better mobile responsiveness."),
            ],
            "summary": "Customer feedback highlighted search latency as the top pain point, with several users reporting slow performance on large datasets. Additional requests included dark mode support and improved mobile responsiveness.",
            "topics": [("Search Performance", 0), ("Feature Requests", 91)],
            "action_items": [
                ("Escalate search latency issue to infra team", "Rachit Mittal"),
                ("Add dark mode to product backlog", "Ananya Gupta"),
            ],
        },
        {
            "title": "Weekly Engineering Standup",
            "days_ago": 5,
            "duration": 900,
            "participants": ["Daniel Lee", "Priya Sharma", "Rachit Mittal"],
            "segments": [
                ("Daniel Lee", 0, 15, "Quick round of updates. I finished the auth refactor and it's in review."),
                ("Priya Sharma", 16, 30, "I'm blocked on the design system tokens, waiting on the brand team."),
                ("Rachit Mittal", 31, 45, "I'll follow up with brand team today to unblock that."),
                ("Daniel Lee", 46, 60, "Also, we should schedule a postmortem for last week's outage."),
            ],
            "summary": "Team shared weekly updates: the auth refactor is complete and under review, while the design system work is blocked pending brand team tokens. A postmortem for last week's outage was proposed.",
            "topics": [("Status Updates", 0), ("Outage Postmortem", 46)],
            "action_items": [
                ("Follow up with brand team on design tokens", "Rachit Mittal"),
                ("Schedule outage postmortem meeting", "Daniel Lee"),
            ],
        },
    ]

    for m in meetings_data:
        last_segment_end = max((seg[2] for seg in m["segments"]), default=m["duration"])
        actual_duration = int(last_segment_end) + 15  # small buffer after last line

        meeting = models.Meeting(
            title=m["title"],
            date=datetime.utcnow() - timedelta(days=m["days_ago"]),
            duration_seconds=actual_duration,
            media_url=None,
            user_id=user.id,
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)

        for name in m["participants"]:
            p = get_or_create_participant(db, name)
            meeting.participants.append(p)
        db.commit()

        for idx, (speaker, start, end, text) in enumerate(m["segments"]):
            seg = models.TranscriptSegment(
                meeting_id=meeting.id,
                speaker_name=speaker,
                start_time=start,
                end_time=end,
                text=text,
                order_index=idx,
            )
            db.add(seg)

        summary = models.Summary(meeting_id=meeting.id, overview_text=m["summary"])
        db.add(summary)

        for idx, (title, start) in enumerate(m["topics"]):
            topic = models.Topic(meeting_id=meeting.id, title=title, start_time=start, order_index=idx)
            db.add(topic)

        for text, assignee in m["action_items"]:
            ai = models.ActionItem(meeting_id=meeting.id, text=text, assignee_name=assignee)
            db.add(ai)

        db.commit()

    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed()


def seed_if_empty():
    """Seeds the DB only if no meetings exist yet — safe to call on every startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    count = db.query(models.Meeting).count()
    db.close()
    if count == 0:
        seed()
