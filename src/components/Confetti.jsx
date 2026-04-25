import React, { useEffect, useState } from 'react';

export default function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 6 + 4,
      color: ['#6B7D5C', '#A3B18A', '#F7F8F4', '#EEF1E8'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 0.5,
      duration: Math.random() * 1 + 1,
      angle: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 10
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            animation: `fall ${p.duration}s ease-in ${p.delay}s forwards`
          }}
        />
      ))}
    </div>
  );
}
