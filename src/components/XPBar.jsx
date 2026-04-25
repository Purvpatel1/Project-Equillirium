import React, { useEffect, useState } from 'react';

export default function XPBar({ currentXP, addedXP, light = false }) {
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
        <div className={`${light ? 'text-theme-olive' : 'text-teal-400'} text-sm font-bold tracking-widest mb-3 animate-in fade-in zoom-in duration-700`}>
          +{addedXP} XP
        </div>
      )}
      
      {/* Line 2: Progress Bar */}
      <div className={`h-2.5 w-full ${light ? 'bg-theme-olive/5 border-theme-olive/5' : 'bg-white/5 border-white/5'} rounded-full overflow-hidden border backdrop-blur-sm mb-4 shadow-inner`}>
        <div 
          className={`h-full ${light ? 'bg-gradient-to-r from-theme-sage to-theme-olive' : 'bg-gradient-to-r from-teal-500 to-indigo-500'} transition-transform duration-1500 ease-out origin-left rounded-full shadow-[0_0_10px_rgba(107,125,92,0.2)]`}
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* Line 3: Muted Values */}
      <div className={`${light ? 'text-theme-olive/30' : 'text-white/30'} text-[10px] font-bold font-sans tracking-[0.25em] uppercase`}>
        {xpInLevel} / {xpPerLevel} XP
      </div>
    </div>
  );
}
