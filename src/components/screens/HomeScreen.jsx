import React, { useEffect, useState } from 'react';
import { getSessions } from '../../utils/storage';
import { vibrate } from '../../utils/haptics';
import ScatterPlot from '../ScatterPlot';
import { Play, Flame, Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import ProgressDrawer from '../ProgressDrawer';

export default function HomeScreen({ onStart, streak }) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ total: 0, todayCount: 0 });
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const all = getSessions();
    setSessions(all);

    // Calculate Stats
    const today = new Date().toDateString();
    const todaySessions = all.filter(s => new Date(s.date).toDateString() === today);

    // Duration calculation (assuming session objects have 'duration' if I added it or I can just count sessions)
    // Actually, I just added duration to ResultScreen, let's see if it's in storage.
    // I didn't save the duration string in storage, just used it for display. 
    // Let's just use session count for now or approximate.

    setStats({
      total: all.length,
      todayCount: todaySessions.length
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen w-full fade-in text-center relative overflow-hidden">

      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#A3B18A]/20 rounded-full blur-[100px] animate-home-bg"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6B7D5C]/15 rounded-full blur-[100px] animate-home-bg" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-serif font-medium mb-3 tracking-tight text-[var(--color-text-main)]">
            Equilibrium
          </h1>
          <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)] tracking-[0.25em] font-light uppercase text-[10px]">
            <span>Presence & Peace</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-8 mb-12 w-full animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1 opacity-60">Streak</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-main)] font-semibold">
              <Flame size={14} className="text-[#6B7D5C]" />
              <span>{streak}d</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-gray-200 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1 opacity-60">Sessions</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-main)] font-semibold">
              <Calendar size={14} className="text-[#6B7D5C]" />
              <span>{stats.total}</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-gray-200 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1 opacity-60">Today</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-main)] font-semibold">
              <Clock size={14} className="text-[#6B7D5C]" />
              <span>{stats.todayCount}</span>
            </div>
          </div>
        </div>

        {/* Support Text */}
        <p className="text-[var(--color-text-muted)] text-sm italic font-light mb-10 animate-in fade-in duration-1000 delay-400 max-w-[280px] leading-relaxed">
          “Inhale the present moment, exhale the past.”
        </p>

        <div className="glass-panel p-6 mb-12 w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 delay-500 border-white/40">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 font-semibold opacity-40">Mood Journey</p>
          <div className="w-full h-[180px] flex items-center justify-center">
            <ScatterPlot sessions={sessions.slice(-7)} width={240} height={180} small={true} />
          </div>

          <button
            className="mt-6 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-olive-primary)] text-[10px] uppercase tracking-widest transition-all group duration-300 hover:translate-x-1"
            onClick={() => {
              vibrate(15);
              setShowDrawer(true);
            }}
          >
            <span>Explore Progress</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        <button
          onClick={() => {
            vibrate(20);
            onStart();
          }}
          className="group relative inline-flex items-center justify-center px-14 py-5 font-medium tracking-[0.2em] text-white bg-[#6B7D5C] rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_10px_30px_rgba(107,125,92,0.25)] active:scale-95"
        >
          <span className="relative flex items-center gap-4 uppercase text-xs">
            <Play size={16} fill="currentColor" />
            Begin Session
          </span>
        </button>
      </div>

      <ProgressDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        sessions={sessions}
        stats={stats}
        streak={streak}
      />
    </div>
  );
}
