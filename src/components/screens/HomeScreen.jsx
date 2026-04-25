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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6B7D5C]/5 rounded-full blur-[120px] animate-home-bg"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A3B18A]/5 rounded-full blur-[120px] animate-home-bg" style={{ animationDelay: '-5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.8),transparent)] opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-serif font-medium mb-4 tracking-tight text-theme-olive">
            Project Equilibrium
          </h1>
          <div className="flex items-center justify-center gap-3 text-theme-muted tracking-[0.25em] font-light uppercase text-[10px]">
            <Sparkles size={12} className="text-theme-sage/60" />
            <span>Find your center</span>
            <Sparkles size={12} className="text-theme-sage/60" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-10 mb-12 w-full animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-theme-muted/50 mb-2 font-medium">Streak</span>
            <div className="flex items-center gap-1.5 text-theme-olive font-semibold">
              <Flame size={14} className="text-theme-sage" />
              <span>{streak}d</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-theme-olive/10 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-theme-muted/50 mb-2 font-medium">Sessions</span>
            <div className="flex items-center gap-1.5 text-theme-olive font-semibold">
              <Calendar size={14} className="text-theme-sage" />
              <span>{stats.total}</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-theme-olive/10 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-theme-muted/50 mb-2 font-medium">Today</span>
            <div className="flex items-center gap-1.5 text-theme-olive font-semibold">
              <Clock size={14} className="text-theme-sage" />
              <span>{stats.todayCount}</span>
            </div>
          </div>
        </div>

        {/* Support Text */}
        <p className="text-theme-olive/40 text-sm italic font-light mb-10 animate-in fade-in duration-1000 delay-400">
          “Take a moment to reset your mind.”
        </p>

        <div className="glass-panel p-8 mb-12 w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <p className="text-[10px] uppercase tracking-[0.25em] text-theme-muted/30 mb-6 font-semibold">Recent Mood Flow</p>
          <div className="w-full h-[180px] flex items-center justify-center">
            <ScatterPlot sessions={sessions.slice(-7)} width={240} height={180} small={true} light={true} />
          </div>

          <button
            className="mt-8 flex items-center gap-2 text-theme-olive/50 hover:text-theme-olive text-[10px] uppercase tracking-widest transition-all group duration-300 hover:translate-x-1"
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
          className="group relative inline-flex items-center justify-center px-14 py-5 font-medium tracking-[0.2em] text-white bg-theme-olive rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_10px_30px_rgba(107,125,92,0.3)] active:scale-95 animate-idle-pulse-light"
        >
          <span className="relative flex items-center gap-4 uppercase text-[11px]">
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
