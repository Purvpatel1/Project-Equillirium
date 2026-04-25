import React, { useState } from 'react';

export default function ScatterPlot({ sessions = [], width = 300, height = 300, small = false, light = false }) {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const padding = small ? 10 : 40;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const mapX = (valence) => padding + ((valence + 1) / 2) * plotWidth;
  const mapY = (arousal) => padding + ((1 - arousal) / 2) * plotHeight;

  const getQuadrantColor = (v, a) => {
    if (v >= 0 && a >= 0) return '#6B7D5C'; // Positive
    if (v < 0 && a >= 0) return '#A3B18A'; // Stressed
    if (v < 0 && a < 0) return '#8B9B7E'; // Low valence
    if (v >= 0 && a < 0) return '#C2D1B2'; // Relaxed
    return '#6B7D5C';
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

  const pathD = sortedSessions.map((s, i) => {
    const x = mapX(s.mood.valence);
    const y = mapY(s.mood.arousal);
    return (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }).join(' ');

  return (
    <div className="relative fade-in" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={light ? "rgba(107,125,92,0.1)" : "#333"} strokeWidth="1" strokeDasharray="4" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke={light ? "rgba(107,125,92,0.1)" : "#333"} strokeWidth="1" strokeDasharray="4" />

        {!small && (
          <>
            <text x={width - padding + 5} y={height / 2 + 4} fontSize="9" fill={light ? "rgba(107,125,92,0.4)" : "#666"} fontWeight="600" textAnchor="start">POS</text>
            <text x={padding - 35} y={height / 2 + 4} fontSize="9" fill={light ? "rgba(107,125,92,0.4)" : "#666"} fontWeight="600">NEG</text>
            <text x={width / 2} y={padding - 15} fontSize="9" fill={light ? "rgba(107,125,92,0.4)" : "#666"} fontWeight="600" textAnchor="middle">HIGH</text>
            <text x={width / 2} y={height - padding + 25} fontSize="9" fill={light ? "rgba(107,125,92,0.4)" : "#666"} fontWeight="600" textAnchor="middle">LOW</text>
          </>
        )}

        {sortedSessions.length > 1 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke={light ? "rgba(107,125,92,0.2)" : "rgba(255,255,255,0.3)"} 
            strokeWidth="2.5" 
            strokeLinejoin="round"
            strokeLinecap="round"
            className="animate-[fadeIn_2s_ease-out_forwards]" 
          />
        )}

        {sortedSessions.map((s, i) => (
          <circle
            key={i}
            cx={mapX(s.mood.valence)}
            cy={mapY(s.mood.arousal)}
            r={i === sortedSessions.length - 1 ? (small ? 4.5 : 9) : (small ? 3 : 6.5)}
            fill={getQuadrantColor(s.mood.valence, s.mood.arousal)}
            stroke={i === sortedSessions.length - 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.5)"}
            strokeWidth={i === sortedSessions.length - 1 ? "3" : "2"}
            onMouseEnter={(e) => {
              if (small) return;
              setHoveredSession(s);
              setTooltipPos({ x: mapX(s.mood.valence), y: mapY(s.mood.arousal) });
            }}
            onMouseLeave={() => setHoveredSession(null)}
            className={`cursor-pointer transition-all duration-300 ${i === sortedSessions.length - 1 ? 'animate-pulse' : ''} hover:scale-125 hover:filter hover:drop-shadow-[0_0_8px_${getQuadrantColor(s.mood.valence, s.mood.arousal)}] ${!small ? 'animate-[fadeIn_0.5s_ease-out_forwards]' : ''}`}
            style={{ animationDelay: `${i * 0.1}s`, opacity: small ? 1 : 0 }}
          />
        ))}
      </svg>

      {hoveredSession && !small && (
        <div 
          className={`absolute z-50 glass-panel p-5 text-[10px] pointer-events-none fade-in min-w-[150px] shadow-2xl ${light ? 'bg-white/90 border-theme-olive/10' : 'backdrop-blur-md border-white/20'}`}
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y - 12}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className={`${light ? 'text-theme-olive/40' : 'text-white/40'} mb-1.5 font-sans font-bold uppercase tracking-[0.1em]`}>
            {new Date(hoveredSession.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className={`${light ? 'text-theme-olive' : 'text-white'} font-semibold mb-2 flex justify-between`}>
            <span>V: {hoveredSession.mood.valence.toFixed(1)}</span>
            <span>A: {hoveredSession.mood.arousal.toFixed(1)}</span>
          </div>
          {hoveredSession.journal && (
            <div className={`${light ? 'text-theme-olive/60' : 'text-teal-200/60'} italic line-clamp-2 leading-relaxed border-t ${light ? 'border-theme-olive/5' : 'border-white/5'} pt-2 mt-1`}>
              "{hoveredSession.journal}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
