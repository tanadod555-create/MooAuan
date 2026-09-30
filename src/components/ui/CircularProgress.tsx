import React from 'react';

interface CircularProgressProps {
  value: number; // Current value
  max: number; // Target max
  size?: number; // Outer diameter
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  labelClassName?: string;
  sublabelClassName?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 140,
  strokeWidth = 10,
  color = '#f472b6',
  bgColor = '#fce7f3',
  label,
  sublabel,
  className = '',
  labelClassName = 'text-slate-700',
  sublabelClassName = 'text-slate-400',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}50)`,
          }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        {label && <span className={`text-xl font-black leading-none ${labelClassName}`}>{label}</span>}
        {sublabel && <span className={`text-[10px] mt-1 font-semibold ${sublabelClassName}`}>{sublabel}</span>}
      </div>
    </div>
  );
};
