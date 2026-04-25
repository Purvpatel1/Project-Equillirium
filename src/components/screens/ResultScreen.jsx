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
        <div className="inline-block px-6 py-2 rounded-full bg-[#6B7D5C]/10 border border-[#6B7D5C]/20 text-[#6B7D5C] text-[11px] uppercase tracking-[0.4em] font-bold mb-10 shadow-sm">
           Level {level}
        </div>
        <h2 className="flex items-center justify-center gap-5 text-6xl font-serif font-medium mb-6 text-[#2F2F2F] tracking-tight">
          Great job!
          <Star className="text-[#A3B18A]" size={44} />
        </h2>
        <p className="text-[#6E6E6E] text-lg font-light mb-10 tracking-wide font-sans">You've completed today's session.</p>

        {/* 250ms Stats Animation */}
        <div className={`flex flex-col items-center gap-6 transition-all duration-700 ease-out transform ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-4 px-10 py-4 bg-[#EEF1E8]/60 backdrop-blur-3xl border border-[#6B7D5C]/10 rounded-[28px] text-xl font-semibold text-[#2F2F2F] shadow-sm">
            <Flame className={`${streak >= 7 ? 'animate-pulse text-[#6B7D5C]' : 'text-[#A3B18A]'}`} size={24} />
            <span>{streak} day streak</span>
          </div>
          
          <div className={`transition-all duration-700 ${showXP ? 'opacity-100' : 'opacity-0'}`}>
            <XPBar currentXP={xpData.current} addedXP={xpData.added} light={true} />
          </div>

          {/* Session Duration Tracker */}
          {duration && (
            <div className={`mt-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500`}>
              <div className="flex items-center gap-2 text-[#6E6E6E]/40 text-[10px] uppercase tracking-[0.25em] mb-2 font-bold">
                <Clock size={12} className="text-[#A3B18A]" />
                <span>Session Duration</span>
              </div>
              <div className="text-[#2F2F2F]/80 text-2xl font-serif font-medium tracking-tight">
                {duration}
              </div>
            </div>
          )}
        </div>

        <div className={`mt-12 transition-all duration-700 ${showSuggestion ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
           <div className="flex flex-col gap-5 items-center">
              {/* Mood Insights */}
              <div className="flex flex-col gap-3 w-full max-w-md">
                <div className="px-8 py-4 rounded-[24px] bg-[#EEF1E8]/60 border border-[#6B7D5C]/10 text-[#6E6E6E] text-base font-light italic flex items-center gap-4 shadow-sm font-sans text-left">
                  <Sparkles size={18} className="text-[#A3B18A]" />
                  "{suggestion}"
                </div>
                {moodTrend && (
                  <div className="px-8 py-3 rounded-[18px] bg-[#EEF1E8]/40 border border-[#6B7D5C]/5 text-[#6E6E6E]/60 text-[10px] uppercase tracking-[0.25em] font-bold flex items-center gap-4">
                    <TrendingUp size={16} className="text-[#A3B18A]/60" />
                    {moodTrend}
                  </div>
                )}
              </div>

              {/* Dynamic Session Counter / Milestone Celebration */}
              <div className="mt-6 transition-all duration-1000 delay-300">
                {sessions.length > 0 && sessions.length % 5 === 0 ? (
                  <div className="flex flex-col items-center gap-3 animate-in zoom-in fade-in duration-1000">
                    <div className="flex items-center gap-4 text-[#2F2F2F] font-serif text-3xl tracking-tight animate-pulse">
                      <Trophy size={32} className="text-[#A3B18A]" />
                      <span>{sessions.length} sessions strong!</span>
                    </div>
                    <p className="text-[#6E6E6E]/30 text-[10px] uppercase tracking-[0.35em] font-bold">Milestone Achieved</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-80">
                    <span className="text-[#2F2F2F]/60 text-xl font-serif tracking-tight font-medium">
                      <span className="text-[#2F2F2F] font-bold">{sessions.length}</span> Sessions Completed
                    </span>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#6B7D5C]/10 to-transparent"></div>
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
            <div className="bg-[#EEF1E8]/30 backdrop-blur-2xl p-12 relative flex flex-col items-center rounded-[32px] border border-[#6B7D5C]/10 shadow-sm">
              <h3 className="text-2xl font-serif mb-10 text-center text-[#2F2F2F]/70 tracking-tight font-medium">7-Day Mood Trajectory</h3>
              {recentSessions.length > 0 ? (
                <ScatterPlot sessions={recentSessions} width={320} height={320} light={true} />
              ) : (
                <div className="w-80 h-80 flex items-center justify-center text-[#6E6E6E]/30 italic font-light">No data yet</div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap gap-5 justify-center no-print items-center w-full max-w-2xl mt-12">
            <button
              onClick={() => { vibrate(20); onStartNew(); }}
              className="flex items-center justify-center gap-4 px-10 py-5 w-full md:w-auto rounded-[24px] bg-[#6B7D5C] text-white font-medium tracking-widest uppercase text-[11px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <RefreshCcw size={18} />
              Start New Session
            </button>

            <button
              onClick={() => { vibrate(15); onReturnHome(); }}
              className="flex items-center justify-center gap-4 px-10 py-5 w-full md:w-auto rounded-[24px] bg-[#EEF1E8] border border-[#6B7D5C]/10 text-[#2F2F2F] font-medium tracking-widest uppercase text-[11px] hover:bg-[#EEF1E8]/80 hover:scale-105 shadow-sm transition-all duration-300"
            >
              Go to Home
            </button>
            
            <button
              onClick={() => {
                 vibrate(15);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 setShowDrawer(true);
              }}
              className="flex items-center justify-center gap-4 px-10 py-5 w-full md:w-auto rounded-[24px] bg-transparent border border-[#6B7D5C]/10 text-[#6E6E6E]/60 font-medium tracking-widest uppercase text-[10px] hover:bg-[#6B7D5C]/5 hover:text-[#6B7D5C] transition-all duration-300"
            >
              <BookOpen size={18} />
              View Report
            </button>

            <button
              onClick={() => {
                vibrate(15);
                window.print();
              }}
              className="flex items-center justify-center gap-4 px-10 py-5 w-full md:w-auto rounded-[24px] bg-transparent border border-[#6B7D5C]/10 text-[#6E6E6E]/60 font-medium tracking-widest uppercase text-[10px] hover:bg-[#6B7D5C]/5 hover:text-[#6B7D5C] transition-all duration-300"
            >
              <Printer size={18} />
              Print Weekly
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-theme-bg/95 backdrop-blur-2xl border-l border-theme-olive/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 no-print flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-10 border-b border-theme-olive/5 flex items-center justify-between">
          <h3 className="text-3xl font-serif text-theme-olive font-medium tracking-tight">Past Entries</h3>
          <button onClick={() => setShowDrawer(false)} className="p-3 bg-theme-olive/5 hover:bg-theme-olive/10 rounded-full transition-all border border-theme-olive/5 active:scale-90">
            <X size={20} className="text-theme-olive/60" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-theme-muted/30 text-center mt-20 italic font-light">No entries yet.</p>
          ) : (
            [...sessions].reverse().map(s => (
              <div key={s.id} className="glass-panel p-8 border border-theme-olive/5 hover:border-theme-olive/10 transition-all shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] text-theme-olive/40 font-bold uppercase tracking-[0.2em]">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="text-[9px] font-bold text-theme-olive/50 bg-theme-olive/5 px-4 py-1.5 rounded-full border border-theme-olive/5 uppercase tracking-tighter">
                    V: {s.mood.valence.toFixed(2)} | A: {s.mood.arousal.toFixed(2)}
                  </span>
                </div>
                <p className="text-theme-olive/80 text-base leading-relaxed font-sans italic font-light">"{s.journal}"</p>
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
