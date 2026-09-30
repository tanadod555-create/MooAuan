import React from 'react';

export type PigExpression = 'happy' | 'workout' | 'eating' | 'cheer' | 'strong' | 'sleep';

interface PigMascotProps {
  expression?: PigExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const PigMascot: React.FC<PigMascotProps> = ({
  expression = 'happy',
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${
        animate ? 'animate-bounce-subtle' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="pigBodyGrad" x1="20" y1="10" x2="80" y2="90">
            <stop offset="0%" stopColor="#ffd1dc" />
            <stop offset="60%" stopColor="#ffb6c1" />
            <stop offset="100%" stopColor="#f48fb1" />
          </linearGradient>
          <linearGradient id="pigEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9ebb" />
            <stop offset="100%" stopColor="#f06292" />
          </linearGradient>
          <linearGradient id="pigSnoutGrad" x1="30" y1="50" x2="70" y2="75">
            <stop offset="0%" stopColor="#ffc0cb" />
            <stop offset="100%" stopColor="#f48fb1" />
          </linearGradient>
          <linearGradient id="headbandGrad" x1="0" y1="0" x2="100" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>

        {/* Left Ear */}
        <path
          d="M 22 28 C 15 15, 28 8, 38 18 C 38 25, 28 32, 22 28 Z"
          fill="url(#pigBodyGrad)"
          stroke="#f06292"
          strokeWidth="2"
        />
        <path
          d="M 24 25 C 20 17, 28 13, 34 20"
          fill="url(#pigEarGrad)"
          opacity="0.8"
        />

        {/* Right Ear */}
        <path
          d="M 78 28 C 85 15, 72 8, 62 18 C 62 25, 72 32, 78 28 Z"
          fill="url(#pigBodyGrad)"
          stroke="#f06292"
          strokeWidth="2"
        />
        <path
          d="M 76 25 C 80 17, 72 13, 66 20"
          fill="url(#pigEarGrad)"
          opacity="0.8"
        />

        {/* Main Chubby Head / Body */}
        <ellipse
          cx="50"
          cy="52"
          rx="38"
          ry="34"
          fill="url(#pigBodyGrad)"
          stroke="#f06292"
          strokeWidth="2.5"
        />

        {/* Cute Rosy Blushes */}
        <ellipse cx="23" cy="56" rx="6" ry="4" fill="#ff4081" opacity="0.35" />
        <ellipse cx="77" cy="56" rx="6" ry="4" fill="#ff4081" opacity="0.35" />

        {/* Workout Headband (if workout expression) */}
        {expression === 'workout' && (
          <g>
            <path
              d="M 16 38 C 30 33, 70 33, 84 38 L 83 44 C 70 39, 30 39, 17 44 Z"
              fill="url(#headbandGrad)"
              stroke="#be123c"
              strokeWidth="1.2"
            />
            {/* Cute bow knot on headband */}
            <circle cx="81" cy="38" r="4" fill="#f43f5e" />
            <path d="M 83 38 Q 90 35, 92 42 Q 86 42, 83 40" fill="#f43f5e" />
          </g>
        )}

        {/* Eyes */}
        {expression === 'sleep' ? (
          // Sleeping curved eyes
          <g stroke="#4a154b" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 31 44 Q 36 49, 41 44" />
            <path d="M 59 44 Q 64 49, 69 44" />
          </g>
        ) : (
          // Cute Anime Eyes with Sparkles
          <g>
            {/* Left Eye */}
            <ellipse cx="36" cy="44" rx="4.5" ry="5.5" fill="#3b1633" />
            <circle cx="34.5" cy="42" r="1.8" fill="#ffffff" />
            <circle cx="38" cy="46" r="0.8" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="64" cy="44" rx="4.5" ry="5.5" fill="#3b1633" />
            <circle cx="62.5" cy="42" r="1.8" fill="#ffffff" />
            <circle cx="66" cy="46" r="0.8" fill="#ffffff" />

            {/* Cheerful Eyebrows */}
            <path
              d="M 32 36 Q 36 34, 40 36"
              stroke="#e91e63"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M 60 36 Q 64 34, 68 36"
              stroke="#e91e63"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Big Cute Piggy Snout */}
        <ellipse
          cx="50"
          cy="60"
          rx="15"
          ry="11"
          fill="url(#pigSnoutGrad)"
          stroke="#e91e63"
          strokeWidth="2"
        />
        {/* Nostrils */}
        <ellipse cx="44.5" cy="60" rx="3" ry="4.5" fill="#c2185b" opacity="0.8" />
        <ellipse cx="55.5" cy="60" rx="3" ry="4.5" fill="#c2185b" opacity="0.8" />
        <circle cx="44" cy="58.5" r="1" fill="#ff80ab" />
        <circle cx="55" cy="58.5" r="1" fill="#ff80ab" />

        {/* Cute Mouth */}
        {expression === 'eating' ? (
          <path
            d="M 44 72 Q 50 78, 56 72 Z"
            fill="#d81b60"
            stroke="#ad1457"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M 45 72 Q 50 76, 55 72"
            stroke="#ad1457"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Floating Heart / Sparkle for cheer & happy */}
        {(expression === 'cheer' || expression === 'happy') && (
          <g className="animate-pulse">
            <path
              d="M 80 16 C 77 12, 72 13, 72 17 C 72 22, 80 26, 80 26 C 80 26, 88 22, 88 17 C 88 13, 83 12, 80 16 Z"
              fill="#ff4081"
            />
          </g>
        )}

        {/* Mini Dumbbell for workout or strong */}
        {(expression === 'workout' || expression === 'strong') && (
          <g transform="translate(68, 62) rotate(-20)">
            <rect x="6" y="2" width="14" height="2.5" rx="1.2" fill="#94a3b8" />
            <rect x="2" y="-1" width="5" height="8.5" rx="2" fill="#fb7185" stroke="#e11d48" strokeWidth="0.8" />
            <rect x="19" y="-1" width="5" height="8.5" rx="2" fill="#fb7185" stroke="#e11d48" strokeWidth="0.8" />
          </g>
        )}

        {/* Strawberry for eating */}
        {expression === 'eating' && (
          <g transform="translate(18, 65) scale(0.7)">
            <path
              d="M 10 5 C 16 0, 20 5, 18 14 C 16 19, 10 24, 10 24 C 10 24, 4 19, 2 14 C 0 5, 4 0, 10 5 Z"
              fill="#f43f5e"
            />
            {/* Seeds */}
            <circle cx="7" cy="8" r="0.8" fill="#fde047" />
            <circle cx="13" cy="8" r="0.8" fill="#fde047" />
            <circle cx="10" cy="13" r="0.8" fill="#fde047" />
            <circle cx="6" cy="16" r="0.8" fill="#fde047" />
            <circle cx="14" cy="16" r="0.8" fill="#fde047" />
            {/* Leaves */}
            <path d="M 6 4 C 10 6, 14 6, 14 4 C 12 1, 8 1, 6 4 Z" fill="#22c55e" />
          </g>
        )}
      </svg>
    </div>
  );
};
