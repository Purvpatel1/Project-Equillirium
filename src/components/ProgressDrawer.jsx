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
        className={`absolute inset-0 bg-theme-olive/10 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Drawer Container */}
      <div 
        className={`relative w-full max-w-2xl bg-theme-bg/95 backdrop-blur-2xl border-t border-theme-olive/10 rounded-t-[40px] p-8 shadow-2xl transition-transform duration-500 pointer-events-auto max-h-[90vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-theme-olive/10 rounded-full"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-10 mt-2">
          <div className="flex flex-col">
            <h2 className="text-3xl font-serif text-theme-olive font-medium tracking-tight">Your Journey</h2>
            <p className="text-theme-olive/30 text-[10px] uppercase tracking-[0.25em] font-bold mt-1.5">Consistency is key</p>
          </div>
          <button 
            onClick={() => {
              vibrate(10);
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-theme-olive/5 flex items-center justify-center text-theme-olive/40 hover:text-theme-olive hover:bg-theme-olive/10 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-full bg-theme-olive/5 flex items-center justify-center mb-8">
              <Sparkles size={36} className="text-theme-olive/20" />
            </div>
            <p className="text-theme-olive/30 text-lg font-light italic">No sessions yet. Start your first session.</p>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-5">
              <div className="glass-panel p-6 flex flex-col items-center shadow-sm">
                <Flame size={20} className="text-theme-sage mb-3" />
                <span className="text-2xl font-serif text-theme-olive font-semibold">{streak}d</span>
                <span className="text-[10px] uppercase tracking-widest text-theme-muted/40 mt-1.5 font-bold">Streak</span>
              </div>
              <div className="glass-panel p-6 flex flex-col items-center shadow-sm">
                <Calendar size={20} className="text-theme-sage mb-3" />
                <span className="text-2xl font-serif text-theme-olive font-semibold">{stats.total}</span>
                <span className="text-[10px] uppercase tracking-widest text-theme-muted/40 mt-1.5 font-bold">Total</span>
              </div>
              <div className="glass-panel p-6 flex flex-col items-center shadow-sm">
                <Clock size={20} className="text-theme-sage mb-3" />
                <span className="text-2xl font-serif text-theme-olive font-semibold">{stats.todayCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-theme-muted/40 mt-1.5 font-bold">Today</span>
              </div>
            </div>

            {/* Mood Trajectory Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-theme-sage/60" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-theme-olive/40 font-bold">Mood Trajectory</h3>
              </div>
              <div className="glass-panel p-10 flex items-center justify-center overflow-hidden shadow-sm">
                <div className="w-full max-w-md h-[240px] flex items-center justify-center scale-110">
                  <ScatterPlot sessions={sessions} width={340} height={240} light={true} />
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2 mb-6">
                <History size={16} className="text-theme-sage/60" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-theme-olive/40 font-bold">Past Entries</h3>
              </div>
              <div className="space-y-5">
                {[...sessions].reverse().map((session, i) => (
                  <div key={i} className="glass-panel p-8 flex flex-col gap-6 group hover:bg-white transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-theme-olive/30 uppercase tracking-[0.2em] font-bold mb-1.5">
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-theme-olive/80 font-serif italic text-base line-clamp-2 leading-relaxed font-light">
                          "{session.journal || "No journal entry"}"
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <div className="flex flex-col items-center bg-theme-olive/5 px-3 py-2 rounded-xl border border-theme-olive/5">
                          <span className="text-[8px] uppercase tracking-tighter text-theme-olive/30 font-bold">V</span>
                          <span className="text-xs font-bold text-theme-olive/60">{session.mood.valence > 0 ? `+${session.mood.valence.toFixed(1)}` : session.mood.valence.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-theme-olive/5 px-3 py-2 rounded-xl border border-theme-olive/5">
                          <span className="text-[8px] uppercase tracking-tighter text-theme-olive/30 font-bold">A</span>
                          <span className="text-xs font-bold text-theme-olive/60">{session.mood.arousal > 0 ? `+${session.mood.arousal.toFixed(1)}` : session.mood.arousal.toFixed(1)}</span>
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
