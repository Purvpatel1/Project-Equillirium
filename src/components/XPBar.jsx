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
        <div className="text-teal-400 text-sm font-bold tracking-widest mb-3 animate-in fade-in zoom-in duration-700">
          +{addedXP} XP
        </div>
      )}
      
      {/* Line 2: Progress Bar */}
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm mb-3">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-transform duration-1000 ease-out origin-left rounded-full"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* Line 3: Muted Values */}
      <div className="text-white/30 text-[10px] font-sans tracking-[0.2em] uppercase">
        {xpInLevel} / {xpPerLevel} XP
      </div>
    </div>
  );
}
