import React, { useEffect, useState } from 'react';

interface ReadingRulerProps {
  enabled: boolean;
}

export const ReadingRuler: React.FC<ReadingRulerProps> = ({ enabled }) => {
  const [mouseY, setMouseY] = useState(200);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMouseY(e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="focus-ruler-overlay transition-all duration-75"
      style={{
        top: `${Math.max(0, mouseY - 25)}px`,
        height: '50px',
      }}
      aria-hidden="true"
    >
      <div className="absolute right-4 top-1 text-[11px] font-bold text-amber-800/90 bg-amber-100/90 px-2.5 py-0.5 rounded-full shadow-sm border border-amber-300">
        סרגל מיקוד קריאה 👁️
      </div>
    </div>
  );
};
