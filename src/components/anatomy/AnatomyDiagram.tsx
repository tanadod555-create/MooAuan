import React from 'react';
import { MuscleKey } from '../../types';

interface AnatomyDiagramProps {
  view: 'front' | 'back';
  selectedMuscle: MuscleKey | null;
  hoveredMuscle: MuscleKey | null;
  onSelectMuscle: (muscle: MuscleKey) => void;
  onHoverMuscle: (muscle: MuscleKey | null) => void;
}

export const AnatomyDiagram: React.FC<AnatomyDiagramProps> = ({
  view,
  selectedMuscle,
  hoveredMuscle,
  onSelectMuscle,
  onHoverMuscle,
}) => {
  const getFill = (key: MuscleKey) => {
    if (selectedMuscle === key) return '#ec4899'; // Vibrant Pink
    if (hoveredMuscle === key) return '#fb7185'; // Soft Rose
    return '#334155'; // Sleek dark slate body
  };

  const getStroke = (key: MuscleKey) => {
    if (selectedMuscle === key) return '#f472b6';
    if (hoveredMuscle === key) return '#fda4af';
    return '#475569';
  };

  const getFilter = (key: MuscleKey) => {
    if (selectedMuscle === key) return 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.7))';
    if (hoveredMuscle === key) return 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.6))';
    return 'none';
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto aspect-[1/2] select-none flex items-center justify-center p-2">
      <svg
        viewBox="0 0 320 600"
        className="w-full h-full drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="body-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Silhouette Base Frame / Head & Joints */}
        <g opacity="0.25">
          {/* Head */}
          <path
            d="M160 30 C145 30 135 45 135 65 C135 85 145 98 160 100 C175 98 185 85 185 65 C185 45 175 30 160 30 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Neck */}
          <path d="M150 95 L150 115 L170 115 L170 95 Z" fill="#334155" />
          {/* Hands */}
          <ellipse cx="65" cy="355" rx="9" ry="14" fill="#334155" />
          <ellipse cx="255" cy="355" rx="9" ry="14" fill="#334155" />
          {/* Feet */}
          <ellipse cx="125" cy="565" rx="14" ry="8" fill="#334155" />
          <ellipse cx="195" cy="565" rx="14" ry="8" fill="#334155" />
        </g>

        {view === 'front' ? (
          /* ================= FRONT VIEW ================= */
          <g className="transition-all duration-300">
            {/* CHEST (Pectoralis Major) */}
            <g
              data-k="chest"
              className="muscle-path"
              onClick={() => onSelectMuscle('chest')}
              onMouseEnter={() => onHoverMuscle('chest')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('chest') }}
            >
              {/* Left Pectoral */}
              <path
                d="M158 132 C145 132 120 138 108 152 C104 165 110 182 124 186 C138 189 154 184 158 180 Z"
                fill={getFill('chest')}
                stroke={getStroke('chest')}
                strokeWidth="1.5"
              />
              {/* Right Pectoral */}
              <path
                d="M162 132 C175 132 200 138 212 152 C216 165 210 182 196 186 C182 189 166 184 162 180 Z"
                fill={getFill('chest')}
                stroke={getStroke('chest')}
                strokeWidth="1.5"
              />
            </g>

            {/* SHOULDERS FRONT (Anterior Deltoids) */}
            <g
              data-k="shoulders"
              className="muscle-path"
              onClick={() => onSelectMuscle('shoulders')}
              onMouseEnter={() => onHoverMuscle('shoulders')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('shoulders') }}
            >
              {/* Left Shoulder */}
              <path
                d="M106 142 C96 146 88 160 88 174 C88 186 94 195 100 198 C105 188 108 170 108 150 Z"
                fill={getFill('shoulders')}
                stroke={getStroke('shoulders')}
                strokeWidth="1.5"
              />
              {/* Right Shoulder */}
              <path
                d="M214 142 C224 146 232 160 232 174 C232 186 226 195 220 198 C215 188 212 170 212 150 Z"
                fill={getFill('shoulders')}
                stroke={getStroke('shoulders')}
                strokeWidth="1.5"
              />
            </g>

            {/* BICEPS (Biceps Brachii) */}
            <g
              data-k="biceps"
              className="muscle-path"
              onClick={() => onSelectMuscle('biceps')}
              onMouseEnter={() => onHoverMuscle('biceps')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('biceps') }}
            >
              {/* Left Bicep */}
              <path
                d="M98 200 C92 208 85 224 86 242 C92 245 98 240 101 228 C103 216 102 205 98 200 Z"
                fill={getFill('biceps')}
                stroke={getStroke('biceps')}
                strokeWidth="1.5"
              />
              {/* Right Bicep */}
              <path
                d="M222 200 C228 208 235 224 234 242 C228 245 222 240 219 228 C217 216 218 205 222 200 Z"
                fill={getFill('biceps')}
                stroke={getStroke('biceps')}
                strokeWidth="1.5"
              />
            </g>

            {/* FOREARMS (Brachioradialis / Flexors) */}
            <g
              data-k="forearms"
              className="muscle-path"
              onClick={() => onSelectMuscle('forearms')}
              onMouseEnter={() => onHoverMuscle('forearms')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('forearms') }}
            >
              {/* Left Forearm */}
              <path
                d="M87 248 C78 260 70 286 68 322 C72 326 77 325 80 318 C86 295 93 268 95 248 Z"
                fill={getFill('forearms')}
                stroke={getStroke('forearms')}
                strokeWidth="1.5"
              />
              {/* Right Forearm */}
              <path
                d="M233 248 C242 260 250 286 252 322 C248 326 243 325 240 318 C234 295 227 268 225 248 Z"
                fill={getFill('forearms')}
                stroke={getStroke('forearms')}
                strokeWidth="1.5"
              />
            </g>

            {/* ABS & OBLIQUES */}
            <g
              data-k="abs"
              className="muscle-path"
              onClick={() => onSelectMuscle('abs')}
              onMouseEnter={() => onHoverMuscle('abs')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('abs') }}
            >
              {/* Rectus Abdominis (Upper) */}
              <rect
                x="142"
                y="190"
                width="16"
                height="18"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              <rect
                x="162"
                y="190"
                width="16"
                height="18"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              {/* Middle */}
              <rect
                x="142"
                y="212"
                width="16"
                height="18"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              <rect
                x="162"
                y="212"
                width="16"
                height="18"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              {/* Lower */}
              <rect
                x="143"
                y="234"
                width="15"
                height="22"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              <rect
                x="162"
                y="234"
                width="15"
                height="22"
                rx="4"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.5"
              />
              {/* Obliques Left */}
              <path
                d="M136 195 C130 205 125 225 126 248 C132 254 138 252 140 246 C138 230 138 210 138 195 Z"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.2"
              />
              {/* Obliques Right */}
              <path
                d="M184 195 C190 205 195 225 194 248 C188 254 182 252 180 246 C182 230 182 210 182 195 Z"
                fill={getFill('abs')}
                stroke={getStroke('abs')}
                strokeWidth="1.2"
              />
            </g>

            {/* QUADS (Quadriceps Femoris) */}
            <g
              data-k="quads"
              className="muscle-path"
              onClick={() => onSelectMuscle('quads')}
              onMouseEnter={() => onHoverMuscle('quads')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('quads') }}
            >
              {/* Left Quad Outer / Middle */}
              <path
                d="M120 280 C114 300 110 340 120 395 C128 402 136 398 140 380 C146 345 148 305 142 276 C132 274 125 275 120 280 Z"
                fill={getFill('quads')}
                stroke={getStroke('quads')}
                strokeWidth="1.5"
              />
              <path
                d="M136 360 C134 375 137 392 143 398 C149 398 152 385 151 370 C148 358 142 355 136 360 Z"
                fill={getFill('quads')}
                stroke={getStroke('quads')}
                strokeWidth="1.2"
              />

              {/* Right Quad Outer / Middle */}
              <path
                d="M200 280 C206 300 210 340 200 395 C192 402 184 398 180 380 C174 345 172 305 178 276 C188 274 195 275 200 280 Z"
                fill={getFill('quads')}
                stroke={getStroke('quads')}
                strokeWidth="1.5"
              />
              <path
                d="M184 360 C186 375 183 392 177 398 C171 398 168 385 169 370 C172 358 178 355 184 360 Z"
                fill={getFill('quads')}
                stroke={getStroke('quads')}
                strokeWidth="1.2"
              />
            </g>

            {/* CALVES FRONT / TIBIALIS */}
            <g
              data-k="calves"
              className="muscle-path"
              onClick={() => onSelectMuscle('calves')}
              onMouseEnter={() => onHoverMuscle('calves')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('calves') }}
            >
              {/* Left Calf */}
              <path
                d="M120 415 C114 430 112 460 120 520 C126 530 134 528 136 505 C140 470 142 435 136 415 Z"
                fill={getFill('calves')}
                stroke={getStroke('calves')}
                strokeWidth="1.5"
              />
              {/* Right Calf */}
              <path
                d="M200 415 C206 430 208 460 200 520 C194 530 186 528 184 505 C180 470 178 435 184 415 Z"
                fill={getFill('calves')}
                stroke={getStroke('calves')}
                strokeWidth="1.5"
              />
            </g>
          </g>
        ) : (
          /* ================= BACK VIEW ================= */
          <g className="transition-all duration-300">
            {/* TRAPS (Trapezius) */}
            <g
              data-k="traps"
              className="muscle-path"
              onClick={() => onSelectMuscle('traps')}
              onMouseEnter={() => onHoverMuscle('traps')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('traps') }}
            >
              <path
                d="M148 108 L112 142 L138 152 L160 185 L182 152 L208 142 L172 108 Z"
                fill={getFill('traps')}
                stroke={getStroke('traps')}
                strokeWidth="1.5"
              />
            </g>

            {/* SHOULDERS BACK (Posterior Deltoids) */}
            <g
              data-k="shoulders"
              className="muscle-path"
              onClick={() => onSelectMuscle('shoulders')}
              onMouseEnter={() => onHoverMuscle('shoulders')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('shoulders') }}
            >
              <path
                d="M106 142 C94 148 88 162 88 176 C88 188 95 196 102 196 C105 186 110 166 112 146 Z"
                fill={getFill('shoulders')}
                stroke={getStroke('shoulders')}
                strokeWidth="1.5"
              />
              <path
                d="M214 142 C226 148 232 162 232 176 C232 188 225 196 218 196 C215 186 210 166 208 146 Z"
                fill={getFill('shoulders')}
                stroke={getStroke('shoulders')}
                strokeWidth="1.5"
              />
            </g>

            {/* LATS (Latissimus Dorsi & Rhomboids) */}
            <g
              data-k="lats"
              className="muscle-path"
              onClick={() => onSelectMuscle('lats')}
              onMouseEnter={() => onHoverMuscle('lats')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('lats') }}
            >
              {/* Left Lat */}
              <path
                d="M156 186 C144 186 116 195 110 216 C114 240 128 250 144 252 L156 220 Z"
                fill={getFill('lats')}
                stroke={getStroke('lats')}
                strokeWidth="1.5"
              />
              {/* Right Lat */}
              <path
                d="M164 186 C176 186 204 195 210 216 C206 240 192 250 176 252 L164 220 Z"
                fill={getFill('lats')}
                stroke={getStroke('lats')}
                strokeWidth="1.5"
              />
            </g>

            {/* TRICEPS (Triceps Brachii) */}
            <g
              data-k="triceps"
              className="muscle-path"
              onClick={() => onSelectMuscle('triceps')}
              onMouseEnter={() => onHoverMuscle('triceps')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('triceps') }}
            >
              <path
                d="M96 202 C90 210 84 226 86 244 C92 246 98 242 101 230 C103 218 101 206 96 202 Z"
                fill={getFill('triceps')}
                stroke={getStroke('triceps')}
                strokeWidth="1.5"
              />
              <path
                d="M224 202 C230 210 236 226 234 244 C228 246 222 242 219 230 C217 218 219 206 224 202 Z"
                fill={getFill('triceps')}
                stroke={getStroke('triceps')}
                strokeWidth="1.5"
              />
            </g>

            {/* FOREARMS BACK (Extensors) */}
            <g
              data-k="forearms"
              className="muscle-path"
              onClick={() => onSelectMuscle('forearms')}
              onMouseEnter={() => onHoverMuscle('forearms')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('forearms') }}
            >
              <path
                d="M87 248 C78 260 70 286 68 322 C72 326 77 325 80 318 C86 295 93 268 95 248 Z"
                fill={getFill('forearms')}
                stroke={getStroke('forearms')}
                strokeWidth="1.5"
              />
              <path
                d="M233 248 C242 260 250 286 252 322 C248 326 243 325 240 318 C234 295 227 268 225 248 Z"
                fill={getFill('forearms')}
                stroke={getStroke('forearms')}
                strokeWidth="1.5"
              />
            </g>

            {/* LOW BACK (Erector Spinae) */}
            <g
              data-k="lowback"
              className="muscle-path"
              onClick={() => onSelectMuscle('lowback')}
              onMouseEnter={() => onHoverMuscle('lowback')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('lowback') }}
            >
              <path
                d="M146 225 C144 245 142 260 148 274 L158 274 L158 225 Z"
                fill={getFill('lowback')}
                stroke={getStroke('lowback')}
                strokeWidth="1.2"
              />
              <path
                d="M174 225 C176 245 178 260 172 274 L162 274 L162 225 Z"
                fill={getFill('lowback')}
                stroke={getStroke('lowback')}
                strokeWidth="1.2"
              />
            </g>

            {/* GLUTES (Gluteus Maximus) */}
            <g
              data-k="glutes"
              className="muscle-path"
              onClick={() => onSelectMuscle('glutes')}
              onMouseEnter={() => onHoverMuscle('glutes')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('glutes') }}
            >
              {/* Left Glute */}
              <path
                d="M120 280 C114 300 116 325 130 338 C144 345 156 340 158 310 L158 280 Z"
                fill={getFill('glutes')}
                stroke={getStroke('glutes')}
                strokeWidth="1.5"
              />
              {/* Right Glute */}
              <path
                d="M200 280 C206 300 204 325 190 338 C176 345 164 340 162 310 L162 280 Z"
                fill={getFill('glutes')}
                stroke={getStroke('glutes')}
                strokeWidth="1.5"
              />
            </g>

            {/* HAMSTRINGS (Biceps femoris, Semitendinosus) */}
            <g
              data-k="hamstrings"
              className="muscle-path"
              onClick={() => onSelectMuscle('hamstrings')}
              onMouseEnter={() => onHoverMuscle('hamstrings')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('hamstrings') }}
            >
              {/* Left Hamstring */}
              <path
                d="M126 345 C122 360 120 380 126 400 C134 404 144 400 148 385 C152 365 154 350 152 342 Z"
                fill={getFill('hamstrings')}
                stroke={getStroke('hamstrings')}
                strokeWidth="1.5"
              />
              {/* Right Hamstring */}
              <path
                d="M194 345 C198 360 200 380 194 400 C186 404 176 400 172 385 C168 365 166 350 168 342 Z"
                fill={getFill('hamstrings')}
                stroke={getStroke('hamstrings')}
                strokeWidth="1.5"
              />
            </g>

            {/* CALVES BACK (Gastrocnemius & Soleus) */}
            <g
              data-k="calves"
              className="muscle-path"
              onClick={() => onSelectMuscle('calves')}
              onMouseEnter={() => onHoverMuscle('calves')}
              onMouseLeave={() => onHoverMuscle(null)}
              style={{ filter: getFilter('calves') }}
            >
              {/* Left Calf */}
              <path
                d="M118 415 C112 432 110 460 122 510 C128 522 136 515 138 495 C142 465 142 432 136 415 Z"
                fill={getFill('calves')}
                stroke={getStroke('calves')}
                strokeWidth="1.5"
              />
              {/* Right Calf */}
              <path
                d="M202 415 C208 432 210 460 198 510 C192 522 184 515 182 495 C178 465 178 432 184 415 Z"
                fill={getFill('calves')}
                stroke={getStroke('calves')}
                strokeWidth="1.5"
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
