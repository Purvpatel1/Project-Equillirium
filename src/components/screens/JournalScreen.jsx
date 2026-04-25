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
      <h2 className="text-4xl font-serif font-medium mb-10 text-center drop-shadow-lg text-white/90">Capture your thoughts</h2>

      <div className="w-full relative mb-10 group">
        <textarea
          className="w-full h-64 glass-panel p-6 text-lg text-white/90 placeholder:text-white/40 focus:outline-none focus:border-teal-400 focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] resize-none transition-all duration-300"
          placeholder="How are you feeling right now? (minimum 3 words)"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
        ></textarea>

        <div className={`absolute bottom-4 right-6 text-sm transition-colors duration-300 ${isOverLimit ? 'text-rose-400 font-medium drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]' : 'text-white/50'}`}>
          {charCount} / 200 {isOverLimit && "(soft limit exceeded)"}
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="px-12 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white font-medium tracking-wide w-full sm:w-auto hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
      >
        Complete Session
      </button>
    </div>
  );
}
