import React, { useRef, useEffect, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

export default function VirtualJoystick({ onMove, onStop }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const maxDist = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    setPosition({ x: dx, y: dy });
    
    // Normalize to -1 to 1
    onMove(dx / maxDist, dy / maxDist);
  };

  return (
    <div 
      ref={containerRef}
      className="w-32 h-32 bg-white/20 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center touch-none shadow-xl"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        ref={knobRef}
        className="w-12 h-12 bg-white/80 rounded-full shadow-lg pointer-events-none transition-transform duration-75"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </div>
  );
}
