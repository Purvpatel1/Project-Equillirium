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
      <h2 className="text-4xl font-serif font-medium mb-10 text-center text-[#2F2F2F] tracking-tight">Capture your thoughts</h2>

      <div className="w-full relative mb-12 group">
        <textarea
          className="w-full h-64 bg-[#F7F8F4] border border-[#6B7D5C]/10 rounded-[24px] p-8 text-lg text-[#2F2F2F] placeholder:text-[#6E6E6E]/30 focus:outline-none focus:border-[#6B7D5C]/30 resize-none transition-all duration-300 font-sans font-light leading-relaxed shadow-sm"
          placeholder="How are you feeling right now? (minimum 3 words)"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
        ></textarea>

        <div className={`absolute bottom-4 right-8 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 font-bold ${isOverLimit ? 'text-rose-400' : 'text-[#6E6E6E]/30'}`}>
          {charCount} / 200 {isOverLimit && "(limit)"}
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="px-14 py-5 rounded-[24px] bg-[#6B7D5C] text-white font-medium tracking-widest uppercase text-[11px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Complete Session
      </button>
    </div>
  );
}
