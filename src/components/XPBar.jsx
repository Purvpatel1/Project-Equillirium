import React, { useEffect, useState } from 'react';

export default function XPBar({ currentXP, addedXP }) {
  const [progress, setProgress] = useState(0);
  const xpPerLevel = 50;
  const level = Math.floor(currentXP / xpPerLevel) + 1;
  const xpInLevel = currentXP % xpPerLevel;
  const targetProgress = (xpInLevel / xpPerLevel) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(targetProgress), 500);
    return () => clearTimeout(timer);
  }, [targetProgress]);

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col items-center">
      {/* Line 1: +XP */}
      {addedXP > 0 && (
        <div className="text-[#6B7D5C] text-sm font-bold tracking-widest mb-3 animate-in fade-in zoom-in duration-700 opacity-80">
          +{addedXP} XP Gained
        </div>
      )}
      
      {/* Line 2: Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden border border-white/40 mb-3">
        <div 
          className="h-full bg-gradient-to-r from-[#A3B18A] to-[#6B7D5C] transition-transform duration-1000 ease-out origin-left rounded-full"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* Line 3: Muted Values */}
      <div className="text-[var(--color-text-muted)] text-[9px] font-bold tracking-[0.2em] uppercase opacity-40">
        Progress: {xpInLevel} / {xpPerLevel} XP
      </div>
    </div>
  );
}
