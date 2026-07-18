"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = document.documentElement.classList.contains("dark");
    setDark(stored);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      onClick={toggle}
      title="Toggle dark mode"
      className="w-9 h-9 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 flex items-center justify-center transition"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
