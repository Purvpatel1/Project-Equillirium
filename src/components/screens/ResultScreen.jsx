import React, { useEffect, useState, useMemo } from 'react';
import { getSessions, addXP, getXP } from '../../utils/storage';
import ScatterPlot from '../ScatterPlot';
import XPBar from '../XPBar';
import Confetti from '../Confetti';
import { RefreshCcw, BookOpen, X, Flame, Star, Printer, Sparkles, TrendingUp, Trophy, Clock } from 'lucide-react';
import { vibrate } from '../../utils/haptics';

export default function ResultScreen({ onStartNew, streak, optimisticSession, onReturnHome, level = 1, duration }) {
  // Initialize with optimistic session immediately to satisfy data availability on mount
  const [showDrawer, setShowDrawer] = useState(false);

  // Staggered Animation States
  const [showText, setShowText] = useState(false);
  const [xpData, setXpData] = useState({ current: 0, added: 0 });
  const [sessions, setSessions] = useState(optimisticSession ? [optimisticSession] : []);
  const [showStats, setShowStats] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // Derive suggestion based on mood
  const suggestion = useMemo(() => {
    if (!optimisticSession?.mood) return "Great job finding your center.";
    const { valence, arousal } = optimisticSession.mood;
    
    if (valence < -0.2 && arousal > 0.2) return "Feeling stressed? Maybe another short breathing session could help.";
    if (valence < -0.2 && arousal < -0.2) return "Remember, every small step counts. You're doing the work.";
    if (arousal > 0.5) return "Your energy is high! Channel it into something creative.";
    if (valence > 0.5) return "You're in a great space. Carry this peace with you.";
    return "Balanced and centered. Keep up this momentum.";
  }, [optimisticSession]);

  const moodTrend = useMemo(() => {
    if (sessions.length < 2) return null;
    const recent = sessions.slice(-3);
    const avgValence = recent.reduce((acc, s) => acc + s.mood.valence, 0) / recent.length;
    
    if (avgValence > 0.3) return "Your mood has been consistently positive lately.";
    if (avgValence < -0.3) return "You've been through a lot. Keep prioritizing your peace.";
    return "Your emotional baseline is stabilizing.";
  }, [sessions]);

  useEffect(() => {
    // 1. Heavy lifting deferred to next tick
    const loadTimer = setTimeout(() => {
      const rawLoaded = getSessions();
      // Sanitize legacy entries missing the strict schema to prevent React TypeError crashes
      const loaded = rawLoaded.filter(s => s && s.mood && typeof s.mood.valence === 'number' && typeof s.mood.arousal === 'number');
      
      if (optimisticSession && !loaded.find(s => s.id === optimisticSession.id)) {
        loaded.push(optimisticSession);
      }
      setSessions(loaded);

      // 2. XP Calculation
      const xpBonus = streak > 5 ? 5 : 0;
      const amount = 10 + xpBonus;
      const oldXP = getXP();
      addXP(amount);
      setXpData({ current: oldXP + amount, added: amount });
    }, 50);

    // Staggered UI entry to prevent jank
    const t1 = setTimeout(() => setShowText(true), 100);
    const t2 = setTimeout(() => setShowStats(true), 350);
    const t3 = setTimeout(() => setShowXP(true), 600);
    const t4 = setTimeout(() => setShowSuggestion(true), 850);
    const t5 = setTimeout(() => setShowChart(true), 1100);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [optimisticSession, streak]);

  const recentSessions = sessions.filter(s => {
    const entryDate = new Date(s.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of today
    const diffTime = Math.abs(now - entryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  });

  const handlePrint = () => {
    window.print();
  };

  if (!sessions) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl min-h-screen py-20 relative z-10 overflow-x-hidden">

      {/* 100ms Text Animation */}
      <div className={`text-center mb-16 transition-opacity duration-700 ease-out ${showText ? 'opacity-100' : 'opacity-0'}`}>
        <div className="inline-block px-6 py-2 rounded-full bg-[#6B7D5C]/10 border border-[#6B7D5C]/20 text-[#6B7D5C] text-[10px] uppercase tracking-[0.3em] font-bold mb-8">
           Level {level} Milestone
        </div>
        <h2 className="flex items-center justify-center gap-4 text-5xl font-serif font-medium mb-4 text-[var(--color-text-main)]">
          Peace found.
        </h2>
        <p className="text-[var(--color-text-muted)] text-lg font-light opacity-60">Session successfully completed.</p>

        {/* 250ms Stats Animation */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out transform ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-3 px-10 py-3 glass-panel text-lg font-semibold text-[var(--color-text-main)] border-white/60">
            <Flame className="text-[#6B7D5C]" size={20} />
            <span>{streak} Day Streak</span>
          </div>
          
          <div className={`transition-all duration-700 ${showXP ? 'opacity-100' : 'opacity-0'}`}>
            <XPBar currentXP={xpData.current} addedXP={xpData.added} />
          </div>

          {/* Session Duration Tracker */}
          {duration && (
            <div className={`mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500`}>
              <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-[9px] uppercase tracking-[0.25em] mb-1 font-bold opacity-40">
                <Clock size={12} className="text-[#6B7D5C]" />
                <span>Time Mindful</span>
              </div>
              <div className="text-[var(--color-text-main)] text-2xl font-serif tracking-tight">
                {duration}
              </div>
            </div>
          )}
        </div>

        <div className={`mt-12 transition-all duration-700 ${showSuggestion ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
           <div className="flex flex-col gap-6 items-center">
              {/* Mood Insights */}
              <div className="flex flex-col gap-3 w-full max-w-md">
                <div className="px-8 py-4 rounded-3xl bg-white/40 border border-white/80 text-[var(--color-text-muted)] text-sm font-light italic flex items-center gap-4 shadow-sm">
                  <Sparkles size={18} className="text-[#A3B18A]" />
                  "{suggestion}"
                </div>
                {moodTrend && (
                  <div className="px-6 py-3 rounded-2xl bg-[#6B7D5C]/5 text-[#6B7D5C] text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 self-center">
                    <TrendingUp size={14} className="opacity-50" />
                    {moodTrend}
                  </div>
                )}
              </div>

              {/* Dynamic Session Counter / Milestone Celebration */}
              <div className="mt-4 transition-all duration-1000 delay-300">
                {sessions.length > 0 && sessions.length % 5 === 0 ? (
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in fade-in duration-1000">
                    <div className="flex items-center gap-3 text-[#6B7D5C] font-serif text-3xl animate-pulse">
                      <Trophy size={32} />
                      <span>{sessions.length} sessions strong!</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-30">
                    <span className="text-[var(--color-text-main)] text-sm font-bold uppercase tracking-widest">
                      <span className="text-[#6B7D5C]">{sessions.length}</span> Sessions Complete
                    </span>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      <Confetti />

      {/* 400ms Deferred Heavy Component Animation */}
      {showChart && (
        <div className="flex flex-col w-full items-center fade-in">
          <div className="flex flex-col md:flex-row gap-12 items-center w-full justify-center mb-20">
            <div className="glass-panel p-10 relative flex flex-col items-center border-white/60">
              <h3 className="text-xl font-serif mb-8 text-center text-[var(--color-text-main)] opacity-80 font-medium">Weekly Flow</h3>
              {recentSessions.length > 0 ? (
                <ScatterPlot sessions={recentSessions} width={320} height={320} />
              ) : (
                <div className="w-80 h-80 flex items-center justify-center text-[var(--color-text-muted)] opacity-30">No data available</div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center no-print items-center w-full max-w-2xl mt-8">
            <button
              onClick={() => { vibrate(20); onStartNew(); }}
              className="flex items-center justify-center gap-3 px-10 py-4 w-full sm:w-auto rounded-full bg-[#6B7D5C] text-white font-medium tracking-wide shadow-lg shadow-[#6B7D5C]/20 hover:scale-105 transition-all duration-300"
            >
              <RefreshCcw size={18} />
              New Practice
            </button>

            <button
              onClick={() => { vibrate(15); onReturnHome(); }}
              className="flex items-center justify-center gap-3 px-10 py-4 w-full sm:w-auto rounded-full bg-white/60 border border-white/80 backdrop-blur-md text-[var(--color-text-muted)] font-medium tracking-wide hover:bg-white/80 hover:scale-105 transition-all duration-300"
            >
              Back Home
            </button>
            
            <button
              onClick={() => {
                 vibrate(15);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 setShowDrawer(true);
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-full bg-transparent border border-[#6B7D5C]/10 text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[9px] hover:bg-[#6B7D5C]/5 transition-all duration-300 opacity-60"
            >
              <BookOpen size={16} />
              Insights
            </button>

            <button
              onClick={() => {
                vibrate(15);
                window.print();
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-full bg-transparent border border-[#6B7D5C]/10 text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[9px] hover:bg-[#6B7D5C]/5 transition-all duration-300 opacity-60"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-cosmic-dark/80 backdrop-blur-xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 no-print flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-3xl font-serif text-white/90">Past Entries</h3>
          <button onClick={() => setShowDrawer(false)} className="p-3 bg-white/5 hover:bg-white/20 rounded-full transition-colors border border-white/10">
            <X size={20} className="text-white/80" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-white/40 text-center mt-10 italic">No entries yet.</p>
          ) : (
            [...sessions].reverse().map(s => (
              <div key={s.id} className="glass-panel p-6 border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-teal-200/80 font-medium tracking-wide">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="text-xs font-mono text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    V: {s.mood.valence.toFixed(2)} | A: {s.mood.arousal.toFixed(2)}
                  </span>
                </div>
                <p className="text-white/80 text-base leading-relaxed">{s.journal}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showDrawer && (
        <div
          className="fixed inset-0 bg-black/50 z-40 no-print backdrop-blur-sm"
          onClick={() => setShowDrawer(false)}
        ></div>
      )}

    </div>
  );
}
