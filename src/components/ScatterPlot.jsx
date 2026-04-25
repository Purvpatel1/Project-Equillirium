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
    if (v >= 0 && a >= 0) return '#FFD700'; // Top-Right
    if (v < 0 && a >= 0) return '#FF4444'; // Top-Left
    if (v < 0 && a < 0) return '#4169E1'; // Bottom-Left
    if (v >= 0 && a < 0) return '#90EE90'; // Bottom-Right
    return '#ffffff';
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
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#333" strokeWidth="1" strokeDasharray="4" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#333" strokeWidth="1" strokeDasharray="4" />

        {!small && (
          <>
            <text x={width - padding + 5} y={height / 2 + 4} fontSize="10" fill="#666">Pos</text>
            <text x={padding - 25} y={height / 2 + 4} fontSize="10" fill="#666">Neg</text>
            <text x={width / 2 - 12} y={padding - 10} fontSize="10" fill="#666">High</text>
            <text x={width / 2 - 10} y={height - padding + 20} fontSize="10" fill="#666">Low</text>
          </>
        )}

        {sortedSessions.length > 1 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2" 
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
            r={i === sortedSessions.length - 1 ? (small ? 4 : 8) : (small ? 2.5 : 6)}
            fill={getQuadrantColor(s.mood.valence, s.mood.arousal)}
            stroke={i === sortedSessions.length - 1 ? "rgba(255,255,255,0.8)" : "var(--color-cosmic-base)"}
            strokeWidth={i === sortedSessions.length - 1 ? "2" : "1.5"}
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
          className="absolute z-50 glass-panel p-3 text-[10px] pointer-events-none fade-in min-w-[120px] backdrop-blur-md border-white/20"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y - 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-white/40 mb-1 font-sans uppercase tracking-tighter">
            {new Date(hoveredSession.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-white font-medium mb-1">
            V: {hoveredSession.mood.valence.toFixed(1)} A: {hoveredSession.mood.arousal.toFixed(1)}
          </div>
          {hoveredSession.journal && (
            <div className="text-teal-200/60 italic line-clamp-2">
              "{hoveredSession.journal}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
