import React, { useState } from 'react';
import { Award, Zap, Calendar } from 'lucide-react';

export default function Milestones({ sessionsCount, streak }) {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const milestones = [
    { 
      id: 'first', 
      label: '1st Session', 
      desc: 'Take your first step toward center.',
      icon: Award, 
      achieved: sessionsCount >= 1, 
      target: 1,
      current: Math.min(sessionsCount, 1),
      color: 'text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]'
    },
    { 
      id: 'session3', 
      label: '3 Sessions', 
      desc: 'Establishing a consistent rhythm.',
      icon: Zap, 
      achieved: sessionsCount >= 3, 
      target: 3,
      current: Math.min(sessionsCount, 3),
      color: 'text-teal-400',
      glow: 'shadow-[0_0_15px_rgba(45,212,191,0.3)]'
    },
    { 
      id: 'session7', 
      label: '7 Sessions', 
      desc: 'Commitment to long-term peace.',
      icon: Calendar, 
      achieved: sessionsCount >= 7, 
      target: 7,
      current: Math.min(sessionsCount, 7),
      color: 'text-indigo-400', 
      glow: 'shadow-[0_0_15px_rgba(129,140,248,0.3)]'
    },
  ];

  return (
    <div className="flex gap-6 mt-8 relative">
      {milestones.map((m, i) => (
        <div 
          key={m.id}
          className={`group flex flex-col items-center gap-2 transition-all duration-500 transform 
            ${m.achieved ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'} 
            hover:scale-105 active:scale-95 cursor-help relative`}
          onMouseEnter={() => setHoveredBadge(m.id)}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          {/* Badge Icon */}
          <div className={`p-4 rounded-2xl glass-panel transition-all duration-300 border-white/10
            ${m.achieved ? `${m.glow} border-white/20 bg-white/10` : 'border-white/5 bg-transparent'}
            group-hover:border-white/30`}
          >
            <m.icon 
              size={24} 
              className={`transition-all duration-500 ${m.achieved ? m.color : 'text-white/20'} 
              ${m.achieved && sessionsCount === m.target ? 'animate-[bounce_2s_infinite]' : ''}`} 
            />
          </div>

          {/* Label & Progress */}
          <div className="flex flex-col items-center">
            <span className={`text-[10px] uppercase tracking-[0.2em] mb-1 font-medium ${m.achieved ? 'text-white/80' : 'text-white/30'}`}>
              {m.label}
            </span>
            <span className="text-[9px] font-sans tracking-widest text-white/20">
              {m.current} / {m.target}
            </span>
          </div>

          {/* Tooltip */}
          {hoveredBadge === m.id && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 glass-panel whitespace-nowrap text-[10px] text-white/90 animate-in fade-in zoom-in duration-200 z-50">
              {m.achieved ? "Achievement Unlocked" : m.desc}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 glass-panel rotate-45 border-t-0 border-l-0"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
