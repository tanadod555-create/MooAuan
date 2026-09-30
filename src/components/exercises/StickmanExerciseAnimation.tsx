import React, { useState, useEffect } from 'react';
import { Exercise, MovementPattern } from '../../types';
import { Play, Pause, Video, Sparkles, X, Check, ExternalLink, RefreshCw, Eye } from 'lucide-react';

interface StickmanProps {
  exercise: Exercise;
}

export const StickmanExerciseAnimation: React.FC<StickmanProps> = ({ exercise }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaInput, setMediaInput] = useState('');
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'stickman' | 'custom'>('stickman');
  const [phaseText, setPhaseText] = useState<'concentric' | 'eccentric'>('concentric');

  const storageKey = `ft_custom_media_${exercise.exercise_id}`;

  // Load custom media if user pasted one before
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setActiveMediaUrl(saved);
      setViewMode('custom');
    } else {
      setActiveMediaUrl('');
      setViewMode('stickman');
    }
  }, [exercise.exercise_id]);

  // Phase indicator toggler synced with animation loop (approx 3s cycle)
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = (1500 / speed);
    const interval = setInterval(() => {
      setPhaseText((prev) => (prev === 'concentric' ? 'eccentric' : 'concentric'));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaInput.trim()) {
      localStorage.removeItem(storageKey);
      setActiveMediaUrl('');
      setViewMode('stickman');
    } else {
      localStorage.setItem(storageKey, mediaInput.trim());
      setActiveMediaUrl(mediaInput.trim());
      setViewMode('custom');
    }
    setShowMediaModal(false);
  };

  const handleRemoveMedia = () => {
    localStorage.removeItem(storageKey);
    setActiveMediaUrl('');
    setViewMode('stickman');
    setShowMediaModal(false);
  };

  // Determine exercise archetype for stickman biomechanics
  const name = exercise.name_en.toLowerCase();
  const pattern = exercise.pattern;

  let archetype:
    | 'bench_press'
    | 'squat'
    | 'deadlift'
    | 'overhead_press'
    | 'lat_pulldown'
    | 'row'
    | 'bicep_curl'
    | 'tricep_extension'
    | 'lateral_raise'
    | 'crunch'
    | 'calf_raise'
    | 'hip_thrust' = 'squat';

  if (name.includes('bench') || name.includes('push-up') || name.includes('chest press') || name.includes('dip')) {
    archetype = 'bench_press';
  } else if (name.includes('deadlift') || name.includes('rdl') || name.includes('good morning')) {
    archetype = 'deadlift';
  } else if (name.includes('hip thrust') || name.includes('glute bridge')) {
    archetype = 'hip_thrust';
  } else if (name.includes('pulldown') || name.includes('pull-up') || name.includes('chin-up')) {
    archetype = 'lat_pulldown';
  } else if (name.includes('row')) {
    archetype = 'row';
  } else if (name.includes('overhead') || name.includes('shoulder press') || name.includes('military') || name.includes('arnold')) {
    archetype = 'overhead_press';
  } else if (name.includes('lateral raise') || name.includes('side raise')) {
    archetype = 'lateral_raise';
  } else if (name.includes('curl') || pattern === 'curl') {
    archetype = 'bicep_curl';
  } else if (name.includes('tricep') || name.includes('pushdown') || name.includes('skullcrusher') || name.includes('kickback')) {
    archetype = 'tricep_extension';
  } else if (name.includes('crunch') || name.includes('plank') || name.includes('leg raise') || name.includes('ab') || pattern === 'core') {
    archetype = 'crunch';
  } else if (name.includes('calf') || pattern === 'calf') {
    archetype = 'calf_raise';
  } else if (name.includes('squat') || name.includes('lunge') || name.includes('leg press') || pattern === 'squat') {
    archetype = 'squat';
  } else if (pattern === 'press') {
    archetype = 'bench_press';
  } else if (pattern === 'pull') {
    archetype = 'row';
  } else if (pattern === 'hinge') {
    archetype = 'deadlift';
  }

  // Animation cycle duration based on speed
  const animDuration = `${3 / speed}s`;
  const animState = isPlaying ? 'running' : 'paused';

  // Helper for YouTube embed
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
    return url;
  };

  const isVideoUrl =
    activeMediaUrl.match(/\.(mp4|webm|ogg)$/i) ||
    activeMediaUrl.includes('streamable.com') ||
    activeMediaUrl.includes('blob:');

  const isYouTube = activeMediaUrl.includes('youtube.com') || activeMediaUrl.includes('youtu.be');

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col">
      {/* Top Bar: Mode Switcher & Custom Clip Trigger */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('stickman')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'stickman'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <span>🏃‍♂️ Stickman จำลองท่า</span>
          </button>

          {activeMediaUrl && (
            <button
              onClick={() => setViewMode('custom')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'custom'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🎬 คลิปของฉัน</span>
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setMediaInput(activeMediaUrl);
            setShowMediaModal(true);
          }}
          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/30 transition cursor-pointer"
        >
          <Video size={13} />
          <span>{activeMediaUrl ? 'แก้ไขคลิป/รูป' : '+ แปะคลิป/GIF ของตัวเอง'}</span>
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {viewMode === 'custom' && activeMediaUrl ? (
          /* Custom Video / Image View */
          <div className="w-full h-full flex items-center justify-center p-2">
            {isYouTube ? (
              <iframe
                src={getEmbedUrl(activeMediaUrl)}
                title="Exercise Demonstration"
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isVideoUrl ? (
              <video
                src={activeMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            ) : (
              <img
                src={activeMediaUrl}
                alt="Exercise Demonstration"
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            )}
          </div>
        ) : (
          /* Stickman Vector Animation */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Phase Badge Floating Overlay */}
            <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                  phaseText === 'concentric'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs shadow-emerald-500/20'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20'
                }`}
              >
                {phaseText === 'concentric'
                  ? '⚡ Concentric (ออกแรงดัน/ดึง)'
                  : '🛡️ Eccentric (ต้านลงช้าๆ)'}
              </span>
            </div>

            {/* Render Specific Stickman Archetype SVG */}
            <svg
              viewBox="0 0 300 200"
              className="w-full h-full max-w-sm drop-shadow-md select-none"
              style={{
                animationDuration: animDuration,
              }}
            >
              <defs>
                <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="barbell-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>

              {/* Floor / Platform Line */}
              <line x1="20" y1="175" x2="280" y2="175" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

              {/* Dynamic Archetype Graphics */}
              {archetype === 'squat' && (
                <g className="stickman-squat">
                  <style>{`
                    @keyframes squatAnim {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(32px); }
                    }
                    @keyframes squatKneeL {
                      0%, 100% { d: path("M 135 110 L 125 145 L 125 175"); }
                      50% { d: path("M 135 142 L 105 158 L 125 175"); }
                    }
                    @keyframes squatKneeR {
                      0%, 100% { d: path("M 165 110 L 175 145 L 175 175"); }
                      50% { d: path("M 165 142 L 195 158 L 175 175"); }
                    }
                    .stickman-squat-torso {
                      animation: squatAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-squat-legL {
                      animation: squatKneeL ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-squat-legR {
                      animation: squatKneeR ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Legs */}
                  <path className="stickman-squat-legL" d="M 135 110 L 125 145 L 125 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-squat-legR" d="M 165 110 L 175 145 L 175 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Upper Body (Torso, Head, Arms & Barbell) moving together */}
                  <g className="stickman-squat-torso">
                    {/* Head */}
                    <circle cx="150" cy="40" r="13" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    {/* Torso Spine */}
                    <line x1="150" y1="53" x2="150" y2="110" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Glute / Hip Joint highlight */}
                    <circle cx="150" cy="110" r="6" fill="#f43f5e" filter="url(#glow-rose)" />

                    {/* Barbell on upper traps */}
                    <rect x="70" y="55" width="160" height="4" rx="2" fill="url(#barbell-grad)" />
                    {/* Plates */}
                    <rect x="75" y="44" width="8" height="26" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="217" y="44" width="8" height="26" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />

                    {/* Arms holding barbell */}
                    <path d="M 150 62 L 130 68 L 105 57" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 150 62 L 170 68 L 195 57" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}

              {archetype === 'bench_press' && (
                <g className="stickman-bench">
                  <style>{`
                    @keyframes benchBarAnim {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(30px); }
                    }
                    @keyframes benchArmL {
                      0%, 100% { d: path("M 125 125 L 120 90 L 120 70"); }
                      50% { d: path("M 125 125 L 98 128 L 120 100"); }
                    }
                    @keyframes benchArmR {
                      0%, 100% { d: path("M 175 125 L 180 90 L 180 70"); }
                      50% { d: path("M 175 125 L 202 128 L 180 100"); }
                    }
                    .stickman-bench-bar {
                      animation: benchBarAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-bench-armL {
                      animation: benchArmL ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-bench-armR {
                      animation: benchArmR ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Workout Bench Structure */}
                  <rect x="75" y="132" width="150" height="10" rx="3" fill="#334155" />
                  <rect x="90" y="142" width="10" height="33" fill="#1e293b" />
                  <rect x="200" y="142" width="10" height="33" fill="#1e293b" />

                  {/* Stickman Lying on Bench */}
                  {/* Head */}
                  <circle cx="95" cy="122" r="10" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2" />
                  {/* Torso lying down */}
                  <line x1="105" y1="125" x2="190" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Chest Highlight */}
                  <circle cx="140" cy="125" r="7" fill="#f43f5e" filter="url(#glow-rose)" />

                  {/* Bent legs touching ground */}
                  <path d="M 190 125 L 220 135 L 230 175" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Arms */}
                  <path className="stickman-bench-armL" d="M 125 125 L 120 90 L 120 70" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-bench-armR" d="M 160 125 L 160 90 L 160 70" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Barbell Pressed Up and Down */}
                  <g className="stickman-bench-bar">
                    <line x1="80" y1="70" x2="220" y2="70" stroke="url(#barbell-grad)" strokeWidth="4" strokeLinecap="round" />
                    <rect x="85" y="58" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="207" y="58" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                </g>
              )}

              {archetype === 'deadlift' && (
                <g className="stickman-deadlift">
                  <style>{`
                    @keyframes dlHinge {
                      0%, 100% { transform: rotate(0deg); transform-origin: 150px 115px; }
                      50% { transform: rotate(45deg); transform-origin: 150px 115px; }
                    }
                    @keyframes dlBar {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(40px); }
                    }
                    .stickman-dl-torso {
                      animation: dlHinge ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-dl-bar {
                      animation: dlBar ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Legs soft knee */}
                  <path d="M 150 115 L 140 145 L 140 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 155 115 L 165 145 L 165 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Torso hinged */}
                  <g className="stickman-dl-torso">
                    <circle cx="150" cy="40" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    <line x1="150" y1="52" x2="150" y2="115" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="150" cy="115" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                    {/* Arm extending straight down to bar */}
                    <line x1="150" y1="65" x2="160" y2="115" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
                  </g>

                  {/* Barbell moving vertically */}
                  <g className="stickman-dl-bar">
                    <line x1="90" y1="115" x2="220" y2="115" stroke="url(#barbell-grad)" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="95" cy="115" r="15" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                    <circle cx="215" cy="115" r="15" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                  </g>
                </g>
              )}

              {archetype === 'overhead_press' && (
                <g className="stickman-ohp">
                  <style>{`
                    @keyframes ohpBarAnim {
                      0%, 100% { transform: translateY(-40px); }
                      50% { transform: translateY(0px); }
                    }
                    @keyframes ohpArmAnim {
                      0%, 100% { d: path("M 150 70 L 135 45 L 125 15"); }
                      50% { d: path("M 150 70 L 125 75 L 125 55"); }
                    }
                    .stickman-ohp-bar {
                      animation: ohpBarAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-ohp-arm {
                      animation: ohpArmAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Legs */}
                  <line x1="140" y1="120" x2="135" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="120" x2="165" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

                  {/* Torso & Head */}
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="120" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />

                  {/* Shoulders Highlight */}
                  <circle cx="138" cy="70" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <circle cx="162" cy="70" r="5" fill="#f43f5e" filter="url(#glow-rose)" />

                  {/* Arms */}
                  <path className="stickman-ohp-arm" d="M 150 70 L 135 45 L 125 15" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Barbell Pressed Overhead */}
                  <g className="stickman-ohp-bar">
                    <line x1="75" y1="55" x2="225" y2="55" stroke="url(#barbell-grad)" strokeWidth="4" strokeLinecap="round" />
                    <rect x="80" y="43" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="212" y="43" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                </g>
              )}

              {archetype === 'lat_pulldown' && (
                <g className="stickman-lat">
                  <style>{`
                    @keyframes latBarAnim {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(32px); }
                    }
                    @keyframes latArmAnim {
                      0%, 100% { d: path("M 150 90 L 120 60 L 95 30"); }
                      50% { d: path("M 150 90 L 125 105 L 95 62"); }
                    }
                    .stickman-lat-bar {
                      animation: latBarAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-lat-arm {
                      animation: latArmAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Lat Pulldown Bench / Seat */}
                  <rect x="130" y="145" width="40" height="8" rx="2" fill="#334155" />
                  <rect x="145" y="153" width="10" height="22" fill="#1e293b" />

                  {/* Cables from top pulley */}
                  <line x1="150" y1="10" x2="150" y2="28" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Seated Stickman */}
                  {/* Legs */}
                  <path d="M 150 145 L 175 145 L 180 175" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Torso arched slightly back */}
                  <circle cx="145" cy="72" r="11" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="145" y1="83" x2="150" y2="145" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />

                  {/* Lat Muscle Glow */}
                  <circle cx="146" cy="105" r="7" fill="#f43f5e" filter="url(#glow-rose)" />

                  {/* Arms Pulling Bar Down */}
                  <path className="stickman-lat-arm" d="M 150 90 L 120 60 L 95 30" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* Wide Lat Bar */}
                  <g className="stickman-lat-bar">
                    <path d="M 75 35 L 90 28 L 210 28 L 225 35" stroke="url(#barbell-grad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}

              {archetype === 'bicep_curl' && (
                <g className="stickman-curl">
                  <style>{`
                    @keyframes curlAnim {
                      0%, 100% { d: path("M 145 75 L 145 105 L 145 138"); }
                      50% { d: path("M 145 75 L 145 105 L 135 75"); }
                    }
                    @keyframes bicepGlow {
                      0%, 100% { opacity: 0.3; transform: scale(0.8); }
                      50% { opacity: 1; transform: scale(1.2); }
                    }
                    .stickman-curl-arm {
                      animation: curlAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-curl-glow {
                      animation: bicepGlow ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                      transform-origin: 142px 90px;
                    }
                  `}</style>

                  {/* Legs */}
                  <line x1="145" y1="125" x2="140" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="155" y1="125" x2="160" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

                  {/* Torso & Head */}
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />

                  {/* Bicep Muscle Peak Highlight */}
                  <circle className="stickman-curl-glow" cx="142" cy="90" r="6" fill="#f43f5e" filter="url(#glow-rose)" />

                  {/* Curled Arm with Dumbbell */}
                  <path className="stickman-curl-arm" d="M 145 75 L 145 105 L 145 138" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              )}

              {archetype === 'lateral_raise' && (
                <g className="stickman-latraise">
                  <style>{`
                    @keyframes latRaiseL {
                      0%, 100% { d: path("M 145 75 L 135 110 L 130 135"); }
                      50% { d: path("M 145 75 L 105 75 L 75 75"); }
                    }
                    @keyframes latRaiseR {
                      0%, 100% { d: path("M 155 75 L 165 110 L 170 135"); }
                      50% { d: path("M 155 75 L 195 75 L 225 75"); }
                    }
                    .stickman-latraise-L {
                      animation: latRaiseL ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-latraise-R {
                      animation: latRaiseR ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>

                  {/* Legs */}
                  <line x1="145" y1="125" x2="135" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="155" y1="125" x2="165" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

                  {/* Torso & Head */}
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />

                  {/* Side Delts Glow */}
                  <circle cx="138" cy="73" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <circle cx="162" cy="73" r="5" fill="#f43f5e" filter="url(#glow-rose)" />

                  {/* Arms Raising Out in Scapular Plane */}
                  <path className="stickman-latraise-L" d="M 145 75 L 135 110 L 130 135" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-latraise-R" d="M 155 75 L 165 110 L 170 135" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              )}

              {/* Fallback for other patterns: Dynamic Multi-joint Skeleton */}
              {(archetype === 'row' || archetype === 'tricep_extension' || archetype === 'crunch' || archetype === 'calf_raise' || archetype === 'hip_thrust') && (
                <g className="stickman-generic">
                  <style>{`
                    @keyframes genericCycle {
                      0%, 100% { transform: translateY(0px) scale(1); }
                      50% { transform: translateY(18px) scale(0.97); }
                    }
                    .stickman-gen {
                      animation: genericCycle ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                      transform-origin: 150px 175px;
                    }
                  `}</style>
                  <g className="stickman-gen">
                    {/* Head */}
                    <circle cx="150" cy="50" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    {/* Spine */}
                    <line x1="150" y1="62" x2="150" y2="120" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Primary Muscle Glow */}
                    <circle cx="150" cy="85" r="8" fill="#f43f5e" filter="url(#glow-rose)" />
                    {/* Arms */}
                    <path d="M 150 72 L 125 95 L 110 120" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 150 72 L 175 95 L 190 120" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    {/* Legs */}
                    <path d="M 150 120 L 135 150 L 130 175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 150 120 L 165 150 L 170 175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}
            </svg>

            {/* Bottom Controls Bar (Play/Pause, Speed) */}
            <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
                title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <div className="w-px h-3.5 bg-slate-800" />

              {/* Speed Buttons */}
              {[0.75, 1, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    speed === s
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media Edit Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-800 text-base">
                  แปะลิงก์คลิปหรือรูปท่านี้
                </h3>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              ใส่ URL วิดีโอ (YouTube, MP4) หรือรูปภาพ/GIF ที่คุณบันทึกไว้ เพื่อใช้ดูแทน Stickman ได้ทุกเมื่อ
            </p>

            <form onSubmit={handleSaveMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL วิดีโอ / รูปภาพ / GIF:
                </label>
                <input
                  type="url"
                  placeholder="https://youtu.be/... หรือ https://.../exercise.gif หรือ .mp4"
                  value={mediaInput}
                  onChange={(e) => setMediaInput(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-300 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {activeMediaUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                  >
                    ลบลิงก์ออก
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    บันทึกลิงก์
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
