import React from 'react';

interface BorderBeamProps {
  duration?: number;
  borderWidth?: number;
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  duration = 6,
  borderWidth = 1.5,
  size = 150,
  colorFrom = '#10b981',
  colorTo = '#38bdf8',
  className = '',
}) => {
  return (
    <div
      style={
        {
          '--duration': `${duration}s`,
          '--border-width': `${borderWidth}px`,
          '--size': `${size}px`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] [animation:border-beam_var(--duration)_infinite_linear] [background:radial-gradient(ellipse_at_center,var(--color-from)_0%,var(--color-to)_50%,transparent_70%)]"
        style={{
          offsetPath: 'rect(0 auto auto 0 round inherit)',
        }}
      />
    </div>
  );
};
