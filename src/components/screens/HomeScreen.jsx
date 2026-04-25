import React, { useEffect, useState } from 'react';
import { getSessions } from '../../utils/storage';
import { vibrate } from '../../utils/haptics';
import ScatterPlot from '../ScatterPlot';
import { Play, Flame, Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';

export default function HomeScreen({ onStart, streak }) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ total: 0, todayTime: "0s" });

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
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-home-bg"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-home-bg" style={{ animationDelay: '-5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-transparent via-transparent to-cosmic-dark opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-serif font-medium mb-3 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-300 drop-shadow-sm">
            Project Equilibrium
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400/80 tracking-[0.2em] font-light uppercase text-[10px]">
            <Sparkles size={12} className="text-teal-400/50" />
            <span>Find your center</span>
            <Sparkles size={12} className="text-teal-400/50" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-8 mb-10 w-full animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Streak</span>
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <Flame size={14} className="text-orange-400" />
              <span>{streak}d</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Sessions</span>
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <Calendar size={14} className="text-teal-400" />
              <span>{stats.total}</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Today</span>
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <Clock size={14} className="text-indigo-400" />
              <span>{stats.todayCount}</span>
            </div>
          </div>
        </div>

        {/* Support Text */}
        <p className="text-teal-200/40 text-sm italic font-light mb-8 animate-in fade-in duration-1000 delay-400">
          “Take a moment to reset your mind.”
        </p>

        <div className="glass-panel p-6 mb-10 w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-4 font-medium">Recent Mood Flow</p>
          <div className="w-full h-[180px] flex items-center justify-center">
            <ScatterPlot sessions={sessions.slice(-7)} width={240} height={180} small={true} />
          </div>

          <button
            className="mt-6 flex items-center gap-2 text-white/40 hover:text-teal-300 text-[10px] uppercase tracking-widest transition-all group"
            onClick={() => vibrate(10)}
          >
            <span>Explore Progress</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <button
          onClick={() => {
            vibrate(20);
            onStart();
          }}
          className="group relative inline-flex items-center justify-center px-12 py-5 font-medium tracking-[0.2em] text-white bg-gradient-to-br from-teal-500/20 to-indigo-600/20 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] active:scale-95 border border-white/20 backdrop-blur-md animate-idle-pulse"
        >
          <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-gradient-to-br from-teal-400/10 to-indigo-500/10 transition-opacity"></span>
          <span className="relative flex items-center gap-4 uppercase text-xs">
            <Play size={16} fill="currentColor" className="group-hover:text-teal-300 transition-colors" />
            Begin Session
          </span>
        </button>
      </div>
    </div>
  );
}
