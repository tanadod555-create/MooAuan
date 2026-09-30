import React, { useEffect, useState } from 'react';

interface NumberTickerProps {
  value: number;
  duration?: number; // milliseconds
  className?: string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  duration = 800,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const initial = displayValue;
    const diff = value - initial;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.round(initial + diff * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className={`tabular-nums ${className}`}>{displayValue.toLocaleString()}</span>;
};
