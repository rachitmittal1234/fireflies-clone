"use client";

import { useEffect, useRef } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MediaPlayer({
  duration,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
}: {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onSeek(Math.min(currentTime + 1, duration));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTime, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="ff-card p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-[var(--ff-purple)] text-white flex items-center justify-center hover:bg-[var(--ff-purple-light)] transition shrink-0"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full accent-[var(--ff-purple)]"
          />
          <div className="flex justify-between text-xs text-[var(--ff-text-muted)] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--ff-text-muted)] mt-2">
        Placeholder player — real audio/video is out of scope per assignment spec.
      </p>
    </div>
  );
}
