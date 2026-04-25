import React, { useState } from 'react';

export default function ScatterPlot({ sessions = [], width = 300, height = 300, small = false }) {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const padding = small ? 10 : 40;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const mapX = (valence) => padding + ((valence + 1) / 2) * plotWidth;
  const mapY = (arousal) => padding + ((1 - arousal) / 2) * plotHeight;

  const getQuadrantColor = (v, a) => {
    if (v >= 0 && a >= 0) return '#A3B18A'; // Peaceful Sage
    if (v < 0 && a >= 0) return '#6B7D5C'; // Deep Olive
    if (v < 0 && a < 0) return '#8D99AE'; // Cool Gray-Blue
    if (v >= 0 && a < 0) return '#E9EDC9'; // Warm Sand
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
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#6B7D5C" strokeWidth="0.5" strokeDasharray="4" opacity="0.2" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#6B7D5C" strokeWidth="0.5" strokeDasharray="4" opacity="0.2" />

        {!small && (
          <>
            <text x={width - padding + 5} y={height / 2 + 4} fontSize="8" fill="#6B7D5C" opacity="0.4" className="font-bold tracking-tighter uppercase">Pos</text>
            <text x={padding - 22} y={height / 2 + 4} fontSize="8" fill="#6B7D5C" opacity="0.4" className="font-bold tracking-tighter uppercase">Neg</text>
            <text x={width / 2 - 10} y={padding - 10} fontSize="8" fill="#6B7D5C" opacity="0.4" className="font-bold tracking-tighter uppercase">High</text>
            <text x={width / 2 - 8} y={height - padding + 18} fontSize="8" fill="#6B7D5C" opacity="0.4" className="font-bold tracking-tighter uppercase">Low</text>
          </>
        )}

        {sortedSessions.length > 1 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="rgba(107, 125, 92, 0.1)" 
            strokeWidth="1" 
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
            r={i === sortedSessions.length - 1 ? (small ? 4 : 8) : (small ? 2.5 : 5)}
            fill={getQuadrantColor(s.mood.valence, s.mood.arousal)}
            stroke={i === sortedSessions.length - 1 ? "rgba(107, 125, 92, 0.4)" : "white"}
            strokeWidth={i === sortedSessions.length - 1 ? "3" : "1.5"}
            onMouseEnter={(e) => {
              if (small) return;
              setHoveredSession(s);
              setTooltipPos({ x: mapX(s.mood.valence), y: mapY(s.mood.arousal) });
            }}
            onMouseLeave={() => setHoveredSession(null)}
            className={`cursor-pointer transition-all duration-300 ${i === sortedSessions.length - 1 ? 'animate-pulse' : ''} hover:scale-125 ${!small ? 'animate-[fadeIn_0.5s_ease-out_forwards]' : ''}`}
            style={{ animationDelay: `${i * 0.1}s`, opacity: small ? 1 : 0 }}
          />
        ))}
      </svg>

      {hoveredSession && !small && (
        <div 
          className="absolute z-50 bg-white/90 backdrop-blur-md p-4 text-[10px] pointer-events-none fade-in min-w-[140px] rounded-2xl border border-[#6B7D5C]/10 shadow-xl"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y - 12}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-[var(--color-text-muted)] opacity-40 mb-1 font-bold uppercase tracking-widest">
            {new Date(hoveredSession.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-[var(--color-text-main)] font-bold mb-2">
            VALENCE: {hoveredSession.mood.valence.toFixed(1)} | ENERGY: {hoveredSession.mood.arousal.toFixed(1)}
          </div>
          {hoveredSession.journal && (
            <div className="text-[#6B7D5C] italic line-clamp-2 opacity-60">
              "{hoveredSession.journal}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
