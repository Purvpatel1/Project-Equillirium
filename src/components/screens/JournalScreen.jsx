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
      <h2 className="text-4xl font-serif font-medium mb-10 text-center text-theme-olive tracking-tight">Capture your thoughts</h2>

      <div className="w-full relative mb-12 group">
        <textarea
          className="w-full h-64 glass-panel p-8 text-lg text-theme-olive/80 placeholder:text-theme-olive/20 focus:outline-none focus:border-theme-olive/20 resize-none transition-all duration-300 font-sans font-light leading-relaxed shadow-sm"
          placeholder="How are you feeling right now? (minimum 3 words)"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
        ></textarea>

        <div className={`absolute bottom-4 right-8 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 font-bold ${isOverLimit ? 'text-rose-400' : 'text-theme-olive/30'}`}>
          {charCount} / 200 {isOverLimit && "(limit)"}
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="px-14 py-5 rounded-full bg-theme-olive text-white font-medium tracking-widest uppercase text-[11px] shadow-lg shadow-theme-olive/20 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Complete Session
      </button>
    </div>
  );
}
