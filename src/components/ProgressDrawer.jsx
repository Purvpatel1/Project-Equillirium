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
        className={`relative w-full max-w-2xl bg-[#F7F8F4]/95 backdrop-blur-2xl border-t border-white rounded-t-[40px] p-8 shadow-2xl transition-transform duration-500 pointer-events-auto max-h-[90vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200 rounded-full"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-10 mt-2">
          <div className="flex flex-col">
            <h2 className="text-3xl font-serif text-[var(--color-text-main)] font-medium tracking-tight">Your Journey</h2>
            <p className="text-[#6B7D5C] text-[10px] uppercase tracking-[0.25em] font-bold mt-1 opacity-50">Consistency is key</p>
          </div>
          <button 
            onClick={() => {
              vibrate(10);
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-[var(--color-text-main)] shadow-sm transition-all active:scale-90"
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
              <div className="glass-panel p-5 flex flex-col items-center border-white/60">
                <Flame size={20} className="text-[#6B7D5C] mb-3" />
                <span className="text-2xl font-serif text-[var(--color-text-main)] font-medium">{streak}d</span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1 opacity-40 font-bold">Streak</span>
              </div>
              <div className="glass-panel p-5 flex flex-col items-center border-white/60">
                <Calendar size={20} className="text-[#6B7D5C] mb-3" />
                <span className="text-2xl font-serif text-[var(--color-text-main)] font-medium">{stats.total}</span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1 opacity-40 font-bold">Total</span>
              </div>
              <div className="glass-panel p-5 flex flex-col items-center border-white/60">
                <Clock size={20} className="text-[#6B7D5C] mb-3" />
                <span className="text-2xl font-serif text-[var(--color-text-main)] font-medium">{stats.todayCount}</span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1 opacity-40 font-bold">Today</span>
              </div>
            </div>

            {/* Mood Trajectory Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2 mb-6 opacity-40">
                <TrendingUp size={16} className="text-[#6B7D5C]" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] font-bold">Mood Flow</h3>
              </div>
              <div className="glass-panel p-8 flex items-center justify-center overflow-hidden border-white/60">
                <div className="w-full max-w-md h-[240px] flex items-center justify-center scale-110">
                  <ScatterPlot sessions={sessions} width={340} height={240} />
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2 mb-6 opacity-40">
                <History size={16} className="text-[#6B7D5C]" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] font-bold">Past Entries</h3>
              </div>
              <div className="space-y-4">
                {[...sessions].reverse().map((session, i) => (
                  <div key={i} className="glass-panel p-6 flex flex-col gap-4 group hover:bg-white transition-all border-white/60 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[var(--color-text-muted)] opacity-40 uppercase tracking-widest font-bold mb-1">
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[var(--color-text-main)] font-serif italic text-sm line-clamp-2 leading-relaxed opacity-80">
                          "{session.journal || "No journal entry"}"
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <div className="flex flex-col items-center bg-[#6B7D5C]/5 px-3 py-2 rounded-xl border border-[#6B7D5C]/5">
                          <span className="text-[8px] uppercase tracking-tighter text-[#6B7D5C] opacity-40 font-bold">V</span>
                          <span className="text-xs font-mono text-[#6B7D5C] font-bold">{session.mood.valence > 0 ? `+${session.mood.valence.toFixed(1)}` : session.mood.valence.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#A3B18A]/5 px-3 py-2 rounded-xl border border-[#A3B18A]/5">
                          <span className="text-[8px] uppercase tracking-tighter text-[#A3B18A] opacity-40 font-bold">A</span>
                          <span className="text-xs font-mono text-[#A3B18A] font-bold">{session.mood.arousal > 0 ? `+${session.mood.arousal.toFixed(1)}` : session.mood.arousal.toFixed(1)}</span>
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
