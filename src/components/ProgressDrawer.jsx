import React from 'react';
import { X, Calendar, Clock, Flame, ChevronRight, History, TrendingUp, Sparkles } from 'lucide-react';
import ScatterPlot from './ScatterPlot';
import { vibrate } from '../utils/haptics';

export default function ProgressDrawer({ isOpen, onClose, sessions, stats, streak }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Drawer Container */}
      <div 
        className={`relative w-full max-w-2xl bg-[#0d0f1e]/90 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] p-8 shadow-2xl transition-transform duration-500 pointer-events-auto max-h-[90vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-10 mt-2">
          <div className="flex flex-col">
            <h2 className="text-3xl font-serif text-white/90 font-medium tracking-tight">Your Journey</h2>
            <p className="text-teal-400/40 text-[10px] uppercase tracking-[0.2em] font-medium mt-1">Consistency is key</p>
          </div>
          <button 
            onClick={() => {
              vibrate(10);
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-white/20" />
            </div>
            <p className="text-white/40 text-lg font-light italic">No sessions yet. Start your first session.</p>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-5 flex flex-col items-center">
                <Flame size={20} className="text-orange-400 mb-3" />
                <span className="text-2xl font-serif text-white font-medium">{streak}d</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Streak</span>
              </div>
              <div className="glass-panel p-5 flex flex-col items-center">
                <Calendar size={20} className="text-teal-400 mb-3" />
                <span className="text-2xl font-serif text-white font-medium">{stats.total}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Total</span>
              </div>
              <div className="glass-panel p-5 flex flex-col items-center">
                <Clock size={20} className="text-indigo-400 mb-3" />
                <span className="text-2xl font-serif text-white font-medium">{stats.todayCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Today</span>
              </div>
            </div>

            {/* Mood Trajectory Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-teal-400/60" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">Mood Trajectory</h3>
              </div>
              <div className="glass-panel p-8 flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-md h-[240px] flex items-center justify-center scale-110">
                  <ScatterPlot sessions={sessions} width={340} height={240} />
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2 mb-6">
                <History size={16} className="text-indigo-400/60" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">Past Entries</h3>
              </div>
              <div className="space-y-4">
                {[...sessions].reverse().map((session, i) => (
                  <div key={i} className="glass-panel p-6 flex flex-col gap-4 group hover:bg-white/[0.06] transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-1">
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-white/80 font-serif italic text-sm line-clamp-2 leading-relaxed">
                          "{session.journal || "No journal entry"}"
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <div className="flex flex-col items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-tighter text-white/20">V</span>
                          <span className="text-xs font-mono text-teal-400 font-bold">{session.mood.valence > 0 ? `+${session.mood.valence.toFixed(1)}` : session.mood.valence.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                          <span className="text-[8px] uppercase tracking-tighter text-white/20">A</span>
                          <span className="text-xs font-mono text-indigo-400 font-bold">{session.mood.arousal > 0 ? `+${session.mood.arousal.toFixed(1)}` : session.mood.arousal.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
