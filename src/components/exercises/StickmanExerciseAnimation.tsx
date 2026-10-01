import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types';
import { Play, Pause, Video, ExternalLink, Search } from 'lucide-react';
import { getExerciseVideo, ExerciseVideoInfo } from '../../data/exerciseVideos';

interface StickmanProps {
  exercise: Exercise;
}

export const StickmanExerciseAnimation: React.FC<StickmanProps> = ({ exercise }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaInput, setMediaInput] = useState('');
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'video' | 'stickman'>('video');
  const [phaseText, setPhaseText] = useState<'concentric' | 'eccentric'>('concentric');
  const [currentVideo, setCurrentVideo] = useState<ExerciseVideoInfo>(() =>
    getExerciseVideo(exercise.exercise_id, exercise.youtube_id || exercise.youtube_short_url)
  );

  const storageKey = `ft_custom_media_${exercise.exercise_id}`;

  // Load custom media or default YouTube short for exercise
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setActiveMediaUrl(saved);
      setCurrentVideo(getExerciseVideo(exercise.exercise_id, saved));
    } else {
      setActiveMediaUrl('');
      setCurrentVideo(
        getExerciseVideo(exercise.exercise_id, exercise.youtube_id || exercise.youtube_short_url)
      );
    }
    setViewMode('video');
  }, [exercise.exercise_id, exercise.youtube_id, exercise.youtube_short_url]);

  // Phase indicator toggler synced with animation loop (approx 3s cycle)
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1500 / speed;
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
      setCurrentVideo(getExerciseVideo(exercise.exercise_id));
    } else {
      localStorage.setItem(storageKey, mediaInput.trim());
      setActiveMediaUrl(mediaInput.trim());
      setCurrentVideo(getExerciseVideo(exercise.exercise_id, mediaInput.trim()));
    }
    setViewMode('video');
    setShowMediaModal(false);
  };

  const handleRemoveMedia = () => {
    localStorage.removeItem(storageKey);
    setActiveMediaUrl('');
    setCurrentVideo(getExerciseVideo(exercise.exercise_id));
    setViewMode('video');
    setShowMediaModal(false);
  };

  // Determine exercise archetype for stickman biomechanics
  const name = (exercise.name_en + ' ' + (exercise.name_th || '')).toLowerCase();
  const pattern = exercise.pattern;
  const id = exercise.exercise_id;

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
    | 'hip_thrust'
    | 'stretch' = 'squat';

  if (id.includes('stretch') || id.includes('pose') || name.includes('stretch') || name.includes('pose') || name.includes('ยืด') || name.includes('cat_cow')) {
    archetype = 'stretch';
  } else if (id.includes('bench_press') || id.includes('chest_press') || id.includes('push_up') || id.includes('cable_fly') || id.includes('dips') || name.includes('bench') || name.includes('push-up') || name.includes('fly') || name.includes('chest press') || name.includes('dip')) {
    archetype = 'bench_press';
  } else if (id.includes('hip_thrust') || id.includes('glute_bridge') || id.includes('kickback') || id.includes('abduction') || name.includes('hip thrust') || name.includes('kickback') || name.includes('abduction')) {
    archetype = 'hip_thrust';
  } else if (id.includes('deadlift') || id.includes('rdl') || id.includes('good_morning') || id.includes('rack_pull') || id.includes('back_extension') || name.includes('deadlift') || name.includes('rdl') || name.includes('good morning') || name.includes('hyperextension')) {
    archetype = 'deadlift';
  } else if (id.includes('lat_pulldown') || id.includes('pull_up') || name.includes('pulldown') || name.includes('pull-up') || name.includes('chin-up')) {
    archetype = 'lat_pulldown';
  } else if (id.includes('row') || id.includes('face_pull') || id.includes('rear_delt') || name.includes('row') || name.includes('face pull') || name.includes('rear delt')) {
    archetype = 'row';
  } else if (id.includes('overhead_press') || id.includes('shoulder_press') || name.includes('overhead') || name.includes('shoulder press') || name.includes('military') || name.includes('arnold')) {
    archetype = 'overhead_press';
  } else if (id.includes('lateral_raise') || id.includes('shrug') || id.includes('jumping_jack') || id.includes('arm_circle') || name.includes('lateral raise') || name.includes('shrug') || name.includes('jumping')) {
    archetype = 'lateral_raise';
  } else if (id.includes('tricep') || id.includes('skull_crusher') || name.includes('tricep') || name.includes('pushdown') || name.includes('skull')) {
    archetype = 'tricep_extension';
  } else if (id.includes('curl') || id.includes('wrist') || name.includes('curl') || pattern === 'curl') {
    archetype = 'bicep_curl';
  } else if (id.includes('crunch') || id.includes('plank') || id.includes('leg_raise') || id.includes('farmers_walk') || name.includes('crunch') || name.includes('plank') || name.includes('leg raise') || pattern === 'core') {
    archetype = 'crunch';
  } else if (id.includes('calf') || name.includes('calf') || pattern === 'calf') {
    archetype = 'calf_raise';
  } else if (id.includes('squat') || id.includes('leg_press') || id.includes('leg_extension') || id.includes('lunge') || name.includes('squat') || name.includes('leg press') || name.includes('leg extension') || pattern === 'squat') {
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

  const isCustomDirectVideo =
    activeMediaUrl &&
    (activeMediaUrl.match(/\.(mp4|webm|ogg)$/i) ||
      activeMediaUrl.includes('streamable.com') ||
      activeMediaUrl.includes('blob:'));

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    exercise.name_en + ' exercise tutorial shorts form'
  )}`;

  return (
    <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
      {/* Top Bar: Mode Switcher & Custom Clip Trigger */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setViewMode('video')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs ${
              viewMode === 'video'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <span>🎬 วิดีโอ Shorts</span>
          </button>

          <button
            onClick={() => setViewMode('stickman')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs ${
              viewMode === 'stickman'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <span>🏃 ท่าจำลอง Stickman</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-700 transition"
            title="ค้นหาคลิปสอนท่านี้ใน YouTube"
          >
            <Search size={12} />
            <span className="hidden sm:inline">ค้นหาบน YouTube</span>
          </a>

          <button
            onClick={() => {
              setMediaInput(activeMediaUrl || currentVideo.shortUrl);
              setShowMediaModal(true);
            }}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            <Video size={13} />
            <span>{activeMediaUrl ? 'แก้ไขคลิป' : 'เปลี่ยนคลิป/ใส่ลิงก์'}</span>
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      {viewMode === 'video' ? (
        /* YouTube Shorts Player View */
        <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-950">
          {isCustomDirectVideo ? (
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] max-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-rose-500/20 bg-black flex items-center justify-center">
              <video
                src={activeMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] max-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-rose-500/20 bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                title={exercise.name_en}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {/* Video Footer Info & Direct Link */}
          <div className="flex items-center justify-between w-full max-w-[310px] mt-2.5 px-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="truncate font-medium">{currentVideo.channelName || 'YouTube Shorts'}</span>
            </div>
            <a
              href={currentVideo.shortUrl || youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition shrink-0 active:scale-95"
            >
              <span>เปิดดูใน YouTube</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ) : (
        /* Stickman Vector Animation View */
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

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

              {/* 1. SQUAT ARCHETYPE */}
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
                  <path className="stickman-squat-legL" d="M 135 110 L 125 145 L 125 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-squat-legR" d="M 165 110 L 175 145 L 175 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-squat-torso">
                    <circle cx="150" cy="40" r="13" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    <line x1="150" y1="53" x2="150" y2="110" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="150" cy="110" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                    <rect x="70" y="55" width="160" height="4" rx="2" fill="url(#barbell-grad)" />
                    <rect x="75" y="44" width="8" height="26" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="217" y="44" width="8" height="26" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <path d="M 150 62 L 130 68 L 105 57" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 150 62 L 170 68 L 195 57" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}

              {/* 2. BENCH PRESS ARCHETYPE */}
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
                  <rect x="75" y="132" width="150" height="10" rx="3" fill="#334155" />
                  <rect x="90" y="142" width="10" height="33" fill="#1e293b" />
                  <rect x="200" y="142" width="10" height="33" fill="#1e293b" />
                  <circle cx="95" cy="122" r="10" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="105" y1="125" x2="190" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="140" cy="125" r="7" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path d="M 190 125 L 220 135 L 230 175" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-bench-armL" d="M 125 125 L 120 90 L 120 70" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-bench-armR" d="M 160 125 L 160 90 L 160 70" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-bench-bar">
                    <line x1="80" y1="70" x2="220" y2="70" stroke="url(#barbell-grad)" strokeWidth="4" strokeLinecap="round" />
                    <rect x="85" y="58" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="207" y="58" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                </g>
              )}

              {/* 3. DEADLIFT ARCHETYPE */}
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
                  <path d="M 150 115 L 140 145 L 140 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 155 115 L 165 145 L 165 175" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-dl-torso">
                    <circle cx="150" cy="40" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    <line x1="150" y1="52" x2="150" y2="115" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="150" cy="115" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                    <line x1="150" y1="65" x2="160" y2="115" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                  <g className="stickman-dl-bar">
                    <line x1="90" y1="115" x2="220" y2="115" stroke="url(#barbell-grad)" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="95" cy="115" r="15" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                    <circle cx="215" cy="115" r="15" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                  </g>
                </g>
              )}

              {/* 4. OVERHEAD PRESS ARCHETYPE */}
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
                  <line x1="140" y1="120" x2="135" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="120" x2="165" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="120" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="138" cy="70" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <circle cx="162" cy="70" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path className="stickman-ohp-arm" d="M 150 70 L 135 45 L 125 15" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-ohp-bar">
                    <line x1="75" y1="55" x2="225" y2="55" stroke="url(#barbell-grad)" strokeWidth="4" strokeLinecap="round" />
                    <rect x="80" y="43" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <rect x="212" y="43" width="8" height="24" rx="2" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                </g>
              )}

              {/* 5. LAT PULLDOWN ARCHETYPE */}
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
                  <rect x="130" y="145" width="40" height="8" rx="2" fill="#334155" />
                  <rect x="145" y="153" width="10" height="22" fill="#1e293b" />
                  <line x1="150" y1="10" x2="150" y2="28" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 150 145 L 175 145 L 180 175" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="145" cy="72" r="11" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="145" y1="83" x2="150" y2="145" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="146" cy="105" r="7" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path className="stickman-lat-arm" d="M 150 90 L 120 60 L 95 30" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-lat-bar">
                    <path d="M 75 35 L 90 28 L 210 28 L 225 35" stroke="url(#barbell-grad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}

              {/* 6. ROW ARCHETYPE */}
              {archetype === 'row' && (
                <g className="stickman-row">
                  <style>{`
                    @keyframes rowPullArm {
                      0%, 100% { d: path("M 135 85 L 135 125 L 135 145"); }
                      50% { d: path("M 135 85 L 110 95 L 125 110"); }
                    }
                    @keyframes rowBar {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-30px); }
                    }
                    .stickman-row-arm {
                      animation: rowPullArm ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                    .stickman-row-bar {
                      animation: rowBar ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>
                  {/* Bent knees */}
                  <path d="M 175 125 L 185 150 L 180 175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 165 125 L 170 150 L 165 175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" fill="none" />
                  {/* Bent Torso (45 deg) */}
                  <line x1="170" y1="125" x2="120" y2="80" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="110" cy="72" r="11" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  {/* Lats highlight */}
                  <circle cx="145" cy="100" r="7" fill="#f43f5e" filter="url(#glow-rose)" />
                  {/* Row Arm */}
                  <path className="stickman-row-arm" d="M 135 85 L 135 125 L 135 145" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Barbell / Handle */}
                  <g className="stickman-row-bar">
                    <line x1="90" y1="145" x2="180" y2="145" stroke="url(#barbell-grad)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="95" cy="145" r="8" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                    <circle cx="175" cy="145" r="8" fill="#e11d48" stroke="#f43f5e" strokeWidth="1" />
                  </g>
                </g>
              )}

              {/* 7. BICEP CURL ARCHETYPE */}
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
                  <line x1="145" y1="125" x2="140" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="155" y1="125" x2="160" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle className="stickman-curl-glow" cx="142" cy="90" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path className="stickman-curl-arm" d="M 145 75 L 145 105 L 145 138" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              )}

              {/* 8. TRICEP EXTENSION ARCHETYPE */}
              {archetype === 'tricep_extension' && (
                <g className="stickman-tricep">
                  <style>{`
                    @keyframes tricepPushAnim {
                      0%, 100% { d: path("M 145 75 L 145 100 L 130 90"); }
                      50% { d: path("M 145 75 L 145 100 L 145 135"); }
                    }
                    .stickman-tricep-arm {
                      animation: tricepPushAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>
                  <line x1="145" y1="125" x2="140" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="155" y1="125" x2="160" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Tricep Highlight */}
                  <circle cx="152" cy="85" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path className="stickman-tricep-arm" d="M 145 75 L 145 100 L 130 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <line x1="125" y1="20" x2="130" y2="90" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                </g>
              )}

              {/* 9. LATERAL RAISE ARCHETYPE */}
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
                  <line x1="145" y1="125" x2="135" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <line x1="155" y1="125" x2="165" y2="175" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="150" cy="45" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="150" y1="57" x2="150" y2="125" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="138" cy="73" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <circle cx="162" cy="73" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  <path className="stickman-latraise-L" d="M 145 75 L 135 110 L 130 135" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path className="stickman-latraise-R" d="M 155 75 L 165 110 L 170 135" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              )}

              {/* 10. CRUNCH / CORE ARCHETYPE */}
              {archetype === 'crunch' && (
                <g className="stickman-crunch">
                  <style>{`
                    @keyframes crunchAnim {
                      0%, 100% { transform: rotate(0deg); transform-origin: 160px 165px; }
                      50% { transform: rotate(-28deg); transform-origin: 160px 165px; }
                    }
                    .stickman-crunch-torso {
                      animation: crunchAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>
                  {/* Floor mat */}
                  <rect x="60" y="168" width="180" height="6" rx="2" fill="#334155" />
                  {/* Lower body & bent knees */}
                  <path d="M 160 165 L 195 165 L 215 140 L 225 170" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <g className="stickman-crunch-torso">
                    <line x1="160" y1="165" x2="100" y2="165" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="90" cy="162" r="10" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2" />
                    {/* Abs highlight */}
                    <circle cx="135" cy="165" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
                    {/* Hands behind head */}
                    <path d="M 105 165 L 90 152 L 85 160" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                </g>
              )}

              {/* 11. CALF RAISE ARCHETYPE */}
              {archetype === 'calf_raise' && (
                <g className="stickman-calf">
                  <style>{`
                    @keyframes calfRaise {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-22px); }
                    }
                    .stickman-calf-body {
                      animation: calfRaise ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>
                  {/* Step platform */}
                  <rect x="110" y="165" width="80" height="10" rx="2" fill="#334155" />
                  <g className="stickman-calf-body">
                    <circle cx="150" cy="40" r="12" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2.5" />
                    <line x1="150" y1="52" x2="150" y2="115" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Legs */}
                    <line x1="145" y1="115" x2="140" y2="165" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                    <line x1="155" y1="115" x2="160" y2="165" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                    {/* Calves glow */}
                    <circle cx="140" cy="145" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                    <circle cx="160" cy="145" r="5" fill="#f43f5e" filter="url(#glow-rose)" />
                  </g>
                </g>
              )}

              {/* 12. HIP THRUST ARCHETYPE */}
              {archetype === 'hip_thrust' && (
                <g className="stickman-thrust">
                  <style>{`
                    @keyframes thrustAnim {
                      0%, 100% { d: path("M 100 135 L 140 155 L 180 155 L 195 175"); }
                      50% { d: path("M 100 135 L 140 120 L 180 120 L 180 175"); }
                    }
                    .stickman-thrust-body {
                      animation: thrustAnim ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                    }
                  `}</style>
                  {/* Bench */}
                  <rect x="70" y="130" width="35" height="40" rx="3" fill="#334155" />
                  {/* Head & shoulders resting on bench */}
                  <circle cx="85" cy="120" r="9" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2" />
                  {/* Body thrusting */}
                  <path className="stickman-thrust-body" d="M 100 135 L 140 155 L 180 155 L 195 175" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Glute highlight */}
                  <circle cx="140" cy="135" r="7" fill="#f43f5e" filter="url(#glow-rose)" />
                </g>
              )}

              {/* 13. STRETCH / YOGA ARCHETYPE */}
              {archetype === 'stretch' && (
                <g className="stickman-stretch">
                  <style>{`
                    @keyframes stretchGentle {
                      0%, 100% { transform: scaleY(1); }
                      50% { transform: scaleY(0.95); }
                    }
                    .stickman-stretch-figure {
                      animation: stretchGentle ${animDuration} ease-in-out infinite;
                      animation-play-state: ${animState};
                      transform-origin: 150px 170px;
                    }
                  `}</style>
                  {/* Yoga Mat */}
                  <rect x="50" y="170" width="200" height="5" rx="2.5" fill="#f43f5e" opacity="0.6" />
                  <g className="stickman-stretch-figure">
                    {/* Seated forward fold stretch */}
                    <circle cx="110" cy="140" r="10" fill="#f8fafc" stroke="#f43f5e" strokeWidth="2" />
                    <path d="M 115 145 L 150 160 L 210 168" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    {/* Arms reaching for toes */}
                    <path d="M 120 148 L 165 158 L 205 165" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="160" cy="155" r="6" fill="#f43f5e" filter="url(#glow-rose)" />
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
        </div>
      )}

      {/* Media Edit Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-800 text-base">
                  เปลี่ยนคลิปวิดีโอท่านี้ (YouTube Shorts)
                </h3>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              ใส่ลิงก์ YouTube Shorts เช่น <code className="bg-pink-50 text-rose-600 px-1 py-0.5 rounded font-mono text-[11px]">https://www.youtube.com/shorts/...</code> หรือ URL วิดีโอเพื่อแสดงคลิปเล่นในเว็บได้ทันที
            </p>

            <form onSubmit={handleSaveMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL YouTube Shorts หรือ วิดีโอ:
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/shorts/..."
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
