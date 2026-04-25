import React, { useState } from 'react';
import { Award, Zap, Calendar } from 'lucide-react';

export default function Milestones({ sessionsCount, streak }) {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const milestones = [
    { 
      id: 'first', 
      label: 'Presence', 
      desc: 'First step toward center.',
      icon: Award, 
      achieved: sessionsCount >= 1, 
      target: 1,
      current: Math.min(sessionsCount, 1),
      color: 'text-[#6B7D5C]',
      glow: 'shadow-[0_10px_20px_rgba(107,125,92,0.1)]'
    },
    { 
      id: 'session3', 
      label: 'Rhythm', 
      desc: 'Establishing a consistent flow.',
      icon: Zap, 
      achieved: sessionsCount >= 3, 
      target: 3,
      current: Math.min(sessionsCount, 3),
      color: 'text-[#A3B18A]',
      glow: 'shadow-[0_10px_20px_rgba(163,177,138,0.1)]'
    },
    { 
      id: 'session7', 
      label: 'Ritual', 
      desc: 'Commitment to long-term peace.',
      icon: Calendar, 
      achieved: sessionsCount >= 7, 
      target: 7,
      current: Math.min(sessionsCount, 7),
      color: 'text-[#6B7D5C]', 
      glow: 'shadow-[0_10px_20px_rgba(107,125,92,0.15)]'
    },
  ];

  return (
    <div className="flex gap-6 mt-8 relative">
      {milestones.map((m, i) => (
        <div 
          key={m.id}
          className={`group flex flex-col items-center gap-2 transition-all duration-500 transform 
            ${m.achieved ? 'opacity-100 scale-100' : 'opacity-30 scale-95 grayscale'} 
            hover:scale-105 active:scale-95 cursor-help relative`}
          onMouseEnter={() => setHoveredBadge(m.id)}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          {/* Badge Icon */}
          <div className={`p-4 rounded-2xl glass-panel transition-all duration-300 border-white/60
            ${m.achieved ? `${m.glow} bg-white/60` : 'border-white/20 bg-transparent'}
            group-hover:border-white`}
          >
            <m.icon 
              size={24} 
              className={`transition-all duration-500 ${m.achieved ? m.color : 'text-gray-300'} 
              ${m.achieved && sessionsCount === m.target ? 'animate-[bounce_2s_infinite]' : ''}`} 
            />
          </div>

          {/* Label & Progress */}
          <div className="flex flex-col items-center">
            <span className={`text-[9px] uppercase tracking-[0.2em] mb-1 font-bold ${m.achieved ? 'text-[var(--color-text-main)] opacity-60' : 'text-[var(--color-text-muted)] opacity-30'}`}>
              {m.label}
            </span>
            <span className="text-[8px] font-bold tracking-widest text-[var(--color-text-muted)] opacity-20">
              {m.current} / {m.target}
            </span>
          </div>

          {/* Tooltip */}
          {hoveredBadge === m.id && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 glass-panel whitespace-nowrap text-[9px] font-bold text-[var(--color-text-main)] animate-in fade-in zoom-in duration-200 z-50 uppercase tracking-widest border-white/80">
              {m.achieved ? "Unlocked" : m.desc}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 glass-panel rotate-45 border-t-0 border-l-0 bg-white"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
