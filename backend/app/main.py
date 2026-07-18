from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import meetings, action_items
from .seed import seed_if_empty
import os

Base.metadata.create_all(bind=engine)
seed_if_empty()

app = FastAPI(title="Fireflies Clone API")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", FRONTEND_URL, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(action_items.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Fireflies Clone API running"}
