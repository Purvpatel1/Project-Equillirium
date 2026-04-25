import React, { useState, useRef, useEffect } from 'react';
import { Zap, Sun, CloudRain, Wind } from 'lucide-react';
import { vibrate } from '../../utils/haptics';

export default function MoodScreen({ onComplete, setAppBgColor }) {
  const [position, setPosition] = useState({ x: 0, y: 0 }); // -1 to 1
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef(null);
  const rafRef = useRef(null);
  
  const markerRef = useRef(null);
  const targetColorRef = useRef({ h: 180, s: 30, l: 20 });
  const currentColorRef = useRef({ h: 180, s: 30, l: 20 });

  // Shortest-path Hue Interpolator
  const lerpHue = (h1, h2, t) => {
    let d = h2 - h1;
    if (d > 180) h1 += 360;
    else if (d < -180) h2 += 360;
    return (h1 + (h2 - h1) * t) % 360;
  };

  const getComputedColor = (x, y) => {
    const tx = (x + 1) / 2; // 0 to 1
    const ty = (y + 1) / 2; // 0 to 1
    
    // Interpolate bottom edge: Sad(260) -> Calm(180)
    const hueBottom = lerpHue(260, 180, tx);
    // Interpolate top edge: Soft Red/Stressed(355) -> Happy(45)
    const hueTop = lerpHue(355, 45, tx);
    
    // Interpolate between edges based on Y
    const finalHue = lerpHue(hueBottom, hueTop, ty);
    
    // Calculate radius (0 to 1) for intensity scaling
    const radius = Math.min(1, Math.sqrt(x*x + y*y));
    
    // Strict limits: Saturation 40-55%, Lightness 22-32%
    const sat = 40 + (15 * radius);
    const light = 22 + (10 * radius);

    return { h: finalHue, s: sat, l: light };
  };

  // Main UI Color synchronization
  useEffect(() => {
    const target = getComputedColor(position.x, position.y);
    targetColorRef.current = target;

    // Render soft, translucent ambient overlay 
    setAppBgColor(`hsla(${target.h.toFixed(1)}, ${target.s.toFixed(1)}%, ${target.l.toFixed(1)}%, 0.7)`);
  }, [position, setAppBgColor]);

  // requestAnimationFrame continuous lerp loop for the marker
  useEffect(() => {
    let animationFrame;
    const loop = () => {
      const current = currentColorRef.current;
      const target = targetColorRef.current;
      
      // Lerp hue shortest path
      let dh = target.h - current.h;
      if (dh > 180) current.h += 360;
      else if (dh < -180) current.h -= 360;
      
      current.h = current.h + (target.h - current.h) * 0.1;
      // Normalize bounds
      current.h %= 360;
      if (current.h < 0) current.h += 360;
      
      current.s = current.s + (target.s - current.s) * 0.1;
      current.l = current.l + (target.l - current.l) * 0.1;

      if (markerRef.current) {
         // Apply slightly brighter saturation/lightness for the marker
         const markerSat = Math.min(55, current.s + 10);
         const markerLight = Math.min(40, current.l + 10);
         
         markerRef.current.style.backgroundColor = `hsl(${current.h.toFixed(1)}, ${markerSat.toFixed(1)}%, ${markerLight.toFixed(1)}%)`;
         markerRef.current.style.boxShadow = `0 0 15px hsla(${current.h.toFixed(1)}, ${markerSat.toFixed(1)}%, ${markerLight.toFixed(1)}%, 0.4)`;
      }
      
      animationFrame = requestAnimationFrame(loop);
    };
    
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updatePositionImmediate(e);
    vibrate(10);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !gridRef.current) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) return;

    // Use requestAnimationFrame to throttle state updates for the grid math
    rafRef.current = requestAnimationFrame(() => {
      const rect = gridRef.current.getBoundingClientRect();
      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;
      
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      setPosition({
        x: (x * 2) - 1,
        y: 1 - (y * 2)
      });
      rafRef.current = null;
    });
  };

  const handlePointerUp = () => {
    if (isDragging) vibrate(15);
    setIsDragging(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const updatePositionImmediate = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;
    
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    setPosition({
      x: (x * 2) - 1,
      y: 1 - (y * 2)
    });
  };

  const markerLeft = `${((position.x + 1) / 2) * 100}%`;
  const markerTop = `${((1 - position.y) / 2) * 100}%`;

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl fade-in min-h-screen relative z-10">
      <h2 className="text-4xl font-serif font-medium mb-12 text-center text-[#2F2F2F] tracking-tight">How are you feeling?</h2>
      
      <div className="relative w-full aspect-square max-w-md glass-panel mb-12 touch-none overflow-hidden shadow-sm"
           ref={gridRef}
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
      >
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#6B7D5C]/10 pointer-events-none"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#6B7D5C]/10 pointer-events-none"></div>
        
        <div className="absolute top-5 left-5 flex items-center gap-2 text-[10px] font-semibold text-[#6E6E6E] select-none tracking-widest uppercase">
          <Zap size={14} className="text-[#6B7D5C]/40" />
          Stressed
        </div>
        <div className="absolute top-5 right-5 flex items-center gap-2 text-[10px] font-semibold text-[#6E6E6E] select-none tracking-widest uppercase">
          Excited
          <Sun size={14} className="text-[#6B7D5C]/40" />
        </div>
        <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[10px] font-semibold text-[#6E6E6E] select-none tracking-widest uppercase">
          <CloudRain size={14} className="text-[#6B7D5C]/40" />
          Sad
        </div>
        <div className="absolute bottom-5 right-5 flex items-center gap-2 text-[10px] font-semibold text-[#6E6E6E] select-none tracking-widest uppercase">
          Relaxed
          <Wind size={14} className="text-[#6B7D5C]/40" />
        </div>

        <div 
          ref={markerRef}
          className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-[3px] border-white cursor-grab active:cursor-grabbing shadow-md"
          style={{ 
            left: markerLeft, 
            top: markerTop,
            transform: isDragging ? 'scale(1.2)' : 'scale(1)',
            transition: 'background-color 0.4s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      </div>

      <div className="glass-panel px-10 py-4 rounded-3xl text-[11px] font-semibold tracking-[0.2em] text-[#6E6E6E] mb-14 uppercase">
        Valence: {position.x.toFixed(2)} &nbsp;|&nbsp; Arousal: {position.y.toFixed(2)}
      </div>

      <button
        onClick={() => onComplete({ valence: position.x, arousal: position.y })}
        className="px-14 py-5 rounded-[24px] bg-[#6B7D5C] text-white font-medium tracking-widest uppercase text-[11px] shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Next Phase
      </button>
    </div>
  );
}
