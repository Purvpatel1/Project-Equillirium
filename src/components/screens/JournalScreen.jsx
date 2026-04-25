import React, { useState } from 'react';
import { vibrate } from '../../utils/haptics';

export default function JournalScreen({ sessionData, onComplete }) {
  const [journal, setJournal] = useState('');

  const charCount = journal.length;
  const wordCount = journal.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = charCount > 200;

  const handleComplete = () => {
    if (wordCount < 3) {
      alert("Please enter at least 3 words.");
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const newSession = {
      id: crypto.randomUUID(),
      date: dateStr,
      timestamp: Date.now(),
      mood: sessionData.mood,
      journal: journal,
      breathingDuration: sessionData.breathingDuration
    };

    vibrate(20);

    // ONLY update UI state here. Do NOT block transition with heavy writes.
    onComplete(newSession, dateStr);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-xl fade-in min-h-screen relative z-10">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-serif font-medium mb-3 text-[var(--color-text-main)]">Capture your thoughts</h2>
        <p className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.25em] font-bold opacity-40">Reflect on your experience</p>
      </div>

      <div className="w-full relative mb-12 group">
        <textarea
          className="w-full h-64 p-8 rounded-[32px] bg-white/60 backdrop-blur-xl border border-white/80 text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-30 focus:outline-none focus:ring-4 focus:ring-[#6B7D5C]/5 transition-all resize-none shadow-xl shadow-black/[0.02]"
          placeholder="I feel..."
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
        ></textarea>

        <div className={`absolute bottom-6 right-8 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isOverLimit ? 'text-rose-400 opacity-100' : 'text-[var(--color-text-muted)] opacity-30'}`}>
          {charCount} / 200 {isOverLimit && "!"}
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="px-14 py-4 rounded-full bg-[#6B7D5C] text-white font-medium tracking-[0.15em] uppercase text-xs shadow-lg shadow-[#6B7D5C]/20 hover:scale-105 transition-all duration-300 active:scale-95 w-full sm:w-auto"
      >
        Complete Session
      </button>
    </div>
  );
}
