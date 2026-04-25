import React, { useState, useEffect, useRef } from 'react';
import { vibrate } from '../../utils/haptics';
import { Play, Pause, Plus, Minus, ArrowUp, ArrowDown, Circle } from 'lucide-react';

export default function BreathingScreen({ onComplete, level = 1 }) {
  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(2);
  const [exhale, setExhale] = useState(4);

  const [phase, setPhase] = useState('Init');
  const [textPhase, setTextPhase] = useState('Inhale');
  const [textAnimClass, setTextAnimClass] = useState('text-in');

  const [cycles, setCycles] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [guidanceText, setGuidanceText] = useState('');

  const presets = [
    { id: 'basic', name: 'Relax (Basic)', inhale: 4, hold: 2, exhale: 4, unlockLevel: 1 },
    { id: 'box', name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, unlockLevel: 3 },
    { id: '478', name: '4-7-8 (Deep)', inhale: 4, hold: 7, exhale: 8, unlockLevel: 5 },
  ];

  const selectPreset = (p) => {
    setInhale(p.inhale);
    setHold(p.hold);
    setExhale(p.exhale);
    vibrate(10);
  };

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Trigger haptic pulses cleanly on state changes
  useEffect(() => {
    if (phase === 'Inhale' || phase === 'Hold' || phase === 'Exhale') {
      vibrate(15);
    }
  }, [phase]);

  // Accessibility check
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Text Animation Engine (Fade out, translate up, then fade in new text)
  useEffect(() => {
    // Ignore initial states
    if (phase === 'Init' || phase === 'InitTransition') return;

    // Ignore initial "Inhale" setup if text is already "Inhale"
    if (textPhase === 'Init' && phase === 'Inhale') {
      setTextPhase('Inhale');
      setTextAnimClass('text-in');
      return;
    }

    if (phase === textPhase) return;

    setTextAnimClass('text-out');
    const t = setTimeout(() => {
      setTextPhase(phase);
      setTextAnimClass('text-in');
    }, 400); // Wait for fade out duration

    return () => clearTimeout(t);
  }, [phase]); // Simplified dependency to ensure it runs on every phase change

  // Guidance Feedback Loop
  useEffect(() => {
    if (phase === 'Init') return;
    
    const messages = {
      Inhale: ["Fill your lungs...", "Deep breath in...", "Steady inhale..."],
      Hold: ["Find the stillness...", "Stay here...", "Gentle hold..."],
      Exhale: ["Release it all...", "Let it go...", "Slowly out..."]
    };

    if (messages[phase]) {
      const options = messages[phase];
      setGuidanceText(options[Math.floor(Math.random() * options.length)]);
    }
  }, [phase]);

  // Core Breathing Engine - Guaranteed zero drift with requestAnimationFrame decoupling
  useEffect(() => {
    if (isPaused) return;

    let timeoutId;
    let rAF1, rAF2;

    const runPhase = () => {
      const currentPhase = phaseRef.current;

      if (currentPhase === 'Init') {
        // Step 2: Next Frame -> Apply transition FIRST
        rAF1 = requestAnimationFrame(() => {
          setPhase('InitTransition');
          phaseRef.current = 'InitTransition';

          // Step 3: Next Frame AFTER transition is applied -> Trigger Inhale scale
          rAF2 = requestAnimationFrame(() => {
            setPhase('Inhale');
            phaseRef.current = 'Inhale';
            runPhase(); // recursively continue cycle
          });
        });
        return;
      }

      let duration = 0;
      let nextPhase = '';

      if (currentPhase === 'Inhale') {
        duration = inhale * 1000;
        nextPhase = 'Hold';
      } else if (currentPhase === 'Hold') {
        duration = hold * 1000;
        nextPhase = 'Exhale';
      } else if (currentPhase === 'Exhale') {
        duration = exhale * 1000;
        nextPhase = 'Inhale';
      }

      timeoutId = setTimeout(() => {
        if (currentPhase === 'Exhale') {
          setCycles(c => c + 1);
        }
        setPhase(nextPhase);
        phaseRef.current = nextPhase;
        runPhase();
      }, duration);
    };

    runPhase();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rAF1);
      cancelAnimationFrame(rAF2);
    };
  }, [inhale, hold, exhale, isPaused]);

  // Phase Overlay Tinting
  const getOverlayStyle = () => {
    let bgColor = 'rgba(232, 121, 154, 0.07)'; // default/exhale

    if (phase === 'Inhale' || phase === 'InitTransition') {
      bgColor = 'rgba(124, 92, 191, 0.08)';
    } else if (phase === 'Hold') {
      bgColor = 'rgba(61, 214, 200, 0.06)';
    } else if (phase === 'Exhale' || phase === 'Init') {
      bgColor = 'rgba(232, 121, 154, 0.07)';
    }

    return {
      backgroundColor: bgColor,
      transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  // Derived styles for GPU accelerated blob transition
  const getBlobContainerStyle = () => {
    // Step 1: Initial Render State -> NO transition
    if (phase === 'Init') {
      return {
        transform: 'scale(0.95)',
        transition: 'none',
        filter: 'drop-shadow(0 0 20px rgba(124, 92, 191, 0.2))'
      };
    }

    let scale = 0.95;
    let duration = exhale;

    if (phase === 'InitTransition') {
      scale = 0.95;
      duration = inhale; // Prep transition duration
    } else if (phase === 'Inhale') {
      scale = 1.5;
      duration = inhale;
    } else if (phase === 'Hold') {
      scale = 1.5;
      duration = hold; // Scale remains stable
    } else if (phase === 'Exhale') {
      scale = 0.95;
      duration = exhale; // Contracts smoothly
    }

    if (isReducedMotion) {
      return {
        opacity: phase === 'Inhale' || phase === 'Hold' ? 0.9 : 0.5,
        transition: `opacity ${duration}s ease-in-out`
      };
    }

    return {
      transform: `scale(${scale})`,
      transition: `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1), filter ${duration}s ease-in-out`,
      filter: phase === 'Inhale' || phase === 'Hold'
        ? `drop-shadow(0 0 ${30 + level * 5}px rgba(124, 92, 191, ${0.3 + level * 0.05}))`
        : `drop-shadow(0 0 ${15 + level * 3}px rgba(124, 92, 191, ${0.1 + level * 0.02}))`
    };
  };

  const getInstructionText = (p) => {
    const map = {
      Inhale: "DEEP BREATH IN",
      Hold: "HOLD",
      Exhale: "SLOW EXHALE"
    };
    return map[p] || "";
  };

  const getMainTextStyle = () => {
    if (phase === 'Inhale' && !isPaused) {
      return {
        animation: 'pulseScale 4s ease-in-out infinite'
      };
    }
    return {};
  };

  // Organic blob morphing paths
  const pathExhale = "M 90 25 C 140 15, 175 60, 175 100 C 175 140, 130 180, 95 175 C 60 170, 25 140, 25 95 C 25 50, 40 35, 90 25 Z";
  const pathInhale = "M 100 15 C 160 20, 185 55, 185 105 C 185 155, 145 185, 105 185 C 65 185, 15 150, 15 100 C 15 50, 40 10, 100 15 Z";

  const getBlobPath = () => {
    return phase === 'Exhale' ? pathExhale : pathInhale;
  };

  const getBlobPathStyle = () => {
    let duration = phase === 'Inhale' ? inhale : phase === 'Hold' ? hold : exhale;
    return {
      transition: `d ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`
    };
  };

  // SVG Arc Calculations
  const radius = 145;
  const circumference = 2 * Math.PI * radius;

  const getStrokeDashoffset = () => {
    if (phase === 'Inhale') return 0;
    if (phase === 'Hold') return 0;
    if (phase === 'Exhale') return circumference;
    return circumference;
  };

  const getArcTransition = () => {
    let duration = exhale;
    if (phase === 'Inhale') duration = inhale;
    if (phase === 'Hold') duration = hold;
    return `stroke-dashoffset ${duration}s linear`;
  };

  const css = `
    @keyframes ripple {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .ripple-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(124, 92, 191, 0.4);
      background: radial-gradient(circle, rgba(124,92,191,0.1) 0%, rgba(45,212,191,0.05) 100%);
      animation: ripple 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      animation-play-state: ${isPaused ? 'paused' : 'running'};
    }
    .ripple-ring:nth-child(1) { animation-delay: 0s; }
    .ripple-ring:nth-child(2) { animation-delay: 0.8s; }
    .ripple-ring:nth-child(3) { animation-delay: 1.6s; }

    @keyframes textFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
    @keyframes textFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .text-out {
      animation: textFadeOut 0.2s ease forwards;
    }
    .text-in {
      animation: textFadeIn 0.3s ease forwards;
    }

    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .breathing-bg {
      background: linear-gradient(
        135deg,
        #07080f,
        #0d0f1e,
        #12102a,
        #0d0f1e,
        #07080f
      );
      background-size: 400% 400%;
      animation: gradientShift 18s ease-in-out infinite;
    }
    .breathing-bg::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.02), transparent);
      pointer-events: none;
    }

    @keyframes valueChange {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .value-pop {
      animation: valueChange 0.15s ease-out;
    }

    .control-container {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
  `;

  return (
    <div className="flex flex-col items-center justify-between h-screen w-full fade-in relative breathing-bg p-4 sm:p-8 overflow-hidden">
      <style>{css}</style>

      {/* Phase Tint Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={getOverlayStyle()}></div>

      {/* Top Header & Instruction */}
      <div className="w-full flex flex-col items-center gap-4 z-20 shrink-0">
        <div className="w-full flex justify-between text-white/30 text-[9px] tracking-[0.3em] font-sans uppercase px-2">
          <span>Project Equilibrium</span>
          <span>Cycles: {cycles}</span>
        </div>
        
        {/* Instruction Text - Primary Guidance */}
        <div className={`flex items-center justify-center ${textAnimClass === 'text-in' ? 'instruction-in' : 'opacity-0'}`}>
          <span className="text-[clamp(1rem,2.5vw,1.3rem)] font-sans tracking-[0.2em] text-white/80 uppercase font-medium text-center">
            {getInstructionText(textPhase)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-lg z-10 min-h-0">
        
        {/* Main Breathing Visualization - Centered and Scaling */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full min-h-0">

          {/* Central Blob Container - Responsive Size */}
          <div className="relative flex items-center justify-center" style={{ width: 'clamp(180px, 38vh, 320px)', height: 'clamp(180px, 38vh, 320px)' }}>

            {/* Ripples */}
            {!isReducedMotion && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
                style={{ opacity: phase === 'Hold' ? 0.2 : 1 }}
              >
                <div className="ripple-ring w-[180px] h-[180px]"></div>
                <div className="ripple-ring w-[180px] h-[180px]"></div>
                <div className="ripple-ring w-[180px] h-[180px]"></div>
              </div>
            )}

            {/* SVG Progress Arc */}
            {!isReducedMotion && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                <circle
                  cx="160" cy="160" r={radius}
                  stroke="url(#arcGradient)"
                  strokeWidth="3" fill="none"
                  transform="rotate(-90 160 160)"
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeDashoffset()}
                  style={{ transition: getArcTransition() }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#7c5cbf" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {/* Central Blob with Integrated Text */}
            <div className="absolute w-[240px] h-[240px] flex items-center justify-center" style={getBlobContainerStyle()}>
              {/* Blob SVG */}
              <div className="absolute inset-0 opacity-90">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c5cbf" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getBlobPath()}
                    fill="url(#blobGradient)"
                    style={getBlobPathStyle()}
                  />
                </svg>
              </div>

              {/* Main Phase Text - Remains Inside Blob */}
              <div className={`z-10 flex flex-col items-center pointer-events-none ${textAnimClass}`}>
                <div 
                  className="text-4xl sm:text-5xl font-serif text-white drop-shadow-md tracking-wider text-center"
                  style={getMainTextStyle()}
                >
                  {isPaused ? 'Paused' : textPhase}
                </div>
                
                {isPaused && (
                  <div className="text-[10px] text-white/40 mt-1 font-sans tracking-widest uppercase animate-pulse">
                    Take your time
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guidance Text (Secondary Feedback) */}
        {!isPaused && phase !== 'Init' && (
          <div className="text-[clamp(0.85rem,1.5vw,1rem)] text-teal-200/50 font-sans tracking-[0.1em] text-center animate-pulse h-5 mb-4 shrink-0">
            {guidanceText}
          </div>
        )}

        {/* Level-based presets */}
        {level >= 3 && (
          <div className="flex gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {presets.filter(p => level >= p.unlockLevel).map(p => (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all duration-300 ${inhale === p.inhale && hold === p.hold && exhale === p.exhale ? 'bg-teal-400/20 border-teal-400/40 text-teal-300' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Controls - Enhanced Glassmorphism Panel (Compressed) */}
        <div className="control-container p-6 flex flex-col items-center gap-6 text-sm text-gray-300 w-full max-w-md shrink-0">

          {/* Pause/Play Button - Enhanced */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              vibrate(20);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(124,92,191,0.3)] border border-white/20 ${isPaused ? 'bg-teal-500/20' : 'bg-white/10'}`}
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={24} className="ml-1 fill-white/20" /> : <Pause size={24} className="fill-white/20" />}
          </button>

          <div className="flex justify-between w-full gap-4">
            {[
              { label: 'Inhale', value: inhale, setter: setInhale, min: 2, max: 10, icon: ArrowUp, color: 'text-teal-400' },
              { label: 'Hold', value: hold, setter: setHold, min: 0, max: 10, icon: Circle, color: 'text-indigo-400' },
              { label: 'Exhale', value: exhale, setter: setExhale, min: 2, max: 15, icon: ArrowDown, color: 'text-rose-400' }
            ].map((ctrl) => (
              <div key={ctrl.label} className="flex flex-col items-center flex-1 group">
                <div className="flex flex-col items-center gap-1 mb-2">
                  <ctrl.icon size={10} className={`${ctrl.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-sans font-medium">{ctrl.label}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 hover:border-teal-500/30 transition-all duration-300">
                  <button 
                    onClick={() => {
                      if (ctrl.value > ctrl.min) {
                        ctrl.setter(ctrl.value - 1);
                        vibrate(10);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  
                  <div key={ctrl.value} className="w-5 text-center font-sans font-bold text-white text-xs value-pop">
                    {ctrl.value}
                  </div>

                  <button 
                    onClick={() => {
                      if (ctrl.value < ctrl.max) {
                        ctrl.setter(ctrl.value + 1);
                        vibrate(10);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full flex flex-col items-center gap-4 z-20 pb-4 shrink-0">
        <button
          onClick={() => onComplete({ inhale, hold, exhale })}
          className={`px-8 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium tracking-wide transition-all duration-700 hover:bg-white/20 hover:scale-105 ${cycles > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          Continue to Mood Check
        </button>
      </div>
    </div>
  );
}
