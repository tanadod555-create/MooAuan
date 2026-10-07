import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MuscleKey } from '../../types';
import { calculateMuscleRecoveryStates, MuscleRecoveryState } from '../../utils/fitnessCalculations';
import { Activity, Sparkles, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MuscleRecoveryMapProps {
  onSelectMuscle?: (muscleKey: MuscleKey) => void;
}

export const VisualMuscleRecoveryMap: React.FC<MuscleRecoveryMapProps> = ({ onSelectMuscle }) => {
  const { workoutHistory, exercises, activeProfileKey, primaryProfile, partnerProfile } = useApp();
  const currentProfile = activeProfileKey === 'partner' ? partnerProfile : primaryProfile;

  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey>('chest');
  const [viewTab, setViewTab] = useState<'front' | 'back'>('front');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Map exerciseId -> MuscleKey
  const exerciseMuscleMap: Record<string, MuscleKey> = {};
  exercises.forEach((ex) => {
    exerciseMuscleMap[ex.exercise_id] = ex.muscle_primary;
  });

  const recoveryStates = calculateMuscleRecoveryStates(workoutHistory || [], exerciseMuscleMap);
  const currentMuscleState = recoveryStates[selectedMuscle];

  // Helper colors
  const getStatusColor = (level: MuscleRecoveryState['level']) => {
    switch (level) {
      case 'fatigued':
        return {
          fill: '#f43f5e', // rose-500
          text: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          badge: 'เพิ่งซ้อมไป (พักผ่อน)',
          icon: '🔴',
        };
      case 'recovering':
        return {
          fill: '#f59e0b', // amber-500
          text: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          badge: 'กำลังฟื้นฟู (~50-80%)',
          icon: '🟡',
        };
      case 'ready':
      default:
        return {
          fill: '#10b981', // emerald-500
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          badge: 'ฟื้นตัวพร้อมซ้อม! (Ready)',
          icon: '🟢',
        };
    }
  };

  const frontMuscles: { key: MuscleKey; label: string; x: number; y: number; r: number }[] = [
    { key: 'chest', label: 'อก', x: 100, y: 70, r: 24 },
    { key: 'shoulders', label: 'ไหล่', x: 50, y: 65, r: 16 },
    { key: 'shoulders', label: 'ไหล่', x: 150, y: 65, r: 16 },
    { key: 'biceps', label: 'หน้าแขน', x: 40, y: 105, r: 14 },
    { key: 'biceps', label: 'หน้าแขน', x: 160, y: 105, r: 14 },
    { key: 'abs', label: 'หน้าท้อง', x: 100, y: 115, r: 22 },
    { key: 'quads', label: 'ต้นขาหน้า', x: 75, y: 180, r: 22 },
    { key: 'quads', label: 'ต้นขาหน้า', x: 125, y: 180, r: 22 },
    { key: 'calves', label: 'น่อง', x: 75, y: 245, r: 14 },
    { key: 'calves', label: 'น่อง', x: 125, y: 245, r: 14 },
  ];

  const backMuscles: { key: MuscleKey; label: string; x: number; y: number; r: number }[] = [
    { key: 'traps', label: 'บ่า', x: 100, y: 48, r: 18 },
    { key: 'lats', label: 'ปีก/หลัง', x: 100, y: 88, r: 24 },
    { key: 'triceps', label: 'หลังแขน', x: 40, y: 105, r: 14 },
    { key: 'triceps', label: 'หลังแขน', x: 160, y: 105, r: 14 },
    { key: 'lowback', label: 'หลังล่าง', x: 100, y: 130, r: 18 },
    { key: 'glutes', label: 'ก้น/สะโพก', x: 100, y: 165, r: 26 },
    { key: 'hamstrings', label: 'ต้นขาหลัง', x: 75, y: 215, r: 20 },
    { key: 'hamstrings', label: 'ต้นขาหลัง', x: 125, y: 215, r: 20 },
    { key: 'calves', label: 'น่องหลัง', x: 75, y: 260, r: 14 },
    { key: 'calves', label: 'น่องหลัง', x: 125, y: 260, r: 14 },
  ];

  const currentMuscles = viewTab === 'front' ? frontMuscles : backMuscles;

  return (
    <div className="bg-white/95 rounded-3xl border-2 border-pink-200/90 p-4 sm:p-5 shadow-xs space-y-4 transition">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                แผนผังฟื้นตัวของกล้ามเนื้อ (Muscle Recovery Map)
              </h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200">
                openGym Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              วิเคราะห์ความพร้อมกล้ามเนื้อของ {currentProfile.name} จากประวัติการซ้อม 7 วันล่าสุด
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          {/* Legend and Front/Back View Toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            {/* View Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewTab('front')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  viewTab === 'front'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ด้านหน้า (Front)
              </button>
              <button
                type="button"
                onClick={() => setViewTab('back')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                  viewTab === 'back'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ด้านหลัง (Back)
              </button>
            </div>

            {/* Color Status Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> พร้อมเล่น
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ฟื้นฟูอยู่
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> เพิ่งซ้อม
              </span>
            </div>
          </div>

          {/* Interactive Visual Map & Detail Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* SVG Visual Body Graphic (Left) */}
            <div className="md:col-span-6 flex justify-center py-2 bg-gradient-to-b from-slate-50 to-pink-50/30 rounded-3xl border border-pink-100 relative overflow-hidden">
              <svg
                viewBox="0 0 200 300"
                className="w-48 h-72 sm:w-56 sm:h-80 drop-shadow-md select-none"
              >
                {/* Silhouette Skeleton Guides */}
                {/* Head */}
                <circle cx="100" cy="22" r="14" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                {/* Neck */}
                <rect x="94" y="34" width="12" height="12" rx="3" fill="#e2e8f0" />
                {/* Torso outline */}
                <path
                  d="M 60 55 Q 100 50 140 55 L 132 145 Q 100 150 68 145 Z"
                  fill="#f1f5f9"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
                {/* Arms outline */}
                <path
                  d="M 55 58 L 30 115 L 20 165 M 145 58 L 170 115 L 180 165"
                  stroke="#cbd5e1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Legs outline */}
                <path
                  d="M 75 150 L 70 230 L 70 285 M 125 150 L 130 230 L 130 285"
                  stroke="#cbd5e1"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Interactive Muscle Nodes */}
                {currentMuscles.map((m, idx) => {
                  const state = recoveryStates[m.key];
                  const cfg = getStatusColor(state?.level || 'ready');
                  const isSelected = selectedMuscle === m.key;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      onClick={() => {
                        setSelectedMuscle(m.key);
                        if (onSelectMuscle) onSelectMuscle(m.key);
                      }}
                    >
                      <circle
                        cx={m.x}
                        cy={m.y}
                        r={m.r}
                        fill={cfg.fill}
                        opacity={isSelected ? '0.95' : '0.8'}
                        stroke={isSelected ? '#1e293b' : '#ffffff'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        className="transition-all duration-200"
                      />
                      <text
                        x={m.x}
                        y={m.y + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={m.r > 20 ? '10' : '8'}
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Helper Tip */}
              <div className="absolute bottom-2 inset-x-0 text-center">
                <span className="text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  แตะที่กล้ามเนื้อเพื่อดูข้อมูลการฟื้นตัว
                </span>
              </div>
            </div>

            {/* Selected Muscle Recovery Details (Right) */}
            <div className="md:col-span-6 space-y-3">
              {currentMuscleState && (() => {
                const cfg = getStatusColor(currentMuscleState.level);
                return (
                  <div
                    className={`p-4 rounded-3xl border ${cfg.border} ${cfg.bg} space-y-3 transition`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          มัดกล้ามเนื้อที่เลือก
                        </span>
                        <h4 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span>{currentMuscleState.label}</span>
                        </h4>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full bg-white ${cfg.text} border ${cfg.border} shadow-2xs`}
                      >
                        {cfg.badge}
                      </span>
                    </div>

                    {/* Progress Bar of Recovery */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>ความพร้อมในการรับแรง:</span>
                        <span className="font-mono">{currentMuscleState.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-200 p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${currentMuscleState.percentage}%`,
                            backgroundColor: cfg.fill,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats details */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white/80 p-2.5 rounded-2xl border border-pink-100 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block font-bold">
                          ซ้อมล่าสุดเมื่อ
                        </span>
                        <span className="font-bold text-slate-700">
                          {currentMuscleState.daysAgo === null
                            ? 'ไม่ได้ซ้อมใน 7 วัน'
                            : currentMuscleState.daysAgo === 0
                            ? 'วันนี้'
                            : `${currentMuscleState.daysAgo} วันที่แล้ว`}
                        </span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-2xl border border-pink-100 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block font-bold">
                          เซ็ตรวมใน 7 วัน
                        </span>
                        <span className="font-bold text-slate-700 font-mono">
                          {currentMuscleState.totalSetsLast7Days} เซ็ต
                        </span>
                      </div>
                    </div>

                    {/* Suggestion coaching cue */}
                    <div className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white/90 p-2.5 rounded-2xl border border-pink-100 flex items-start gap-1.5">
                      <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        {currentMuscleState.level === 'ready'
                          ? `กล้ามเนื้อ ${currentMuscleState.label} พักฟื้นเต็มที่แล้ว! เหมาะสำหรับจัดเป็นกล้ามเนื้อมัดหลักในเซสชันวันนี้`
                          : currentMuscleState.level === 'recovering'
                          ? `กล้ามเนื้อ ${currentMuscleState.label} กำลังซ่อมแซมเส้นใย สามารถเล่นแบบเบาๆ หรือเล่นมัดอื่นก่อนเพื่อประสิทธิภาพสูงสุด`
                          : `กล้ามเนื้อ ${currentMuscleState.label} เพิ่งถูกใช้งานหนัก แนะนำให้พักผ่อนหรือเน้นมัดตรงข้าม`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Muscle Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {(viewTab === 'front'
                  ? (['chest', 'shoulders', 'biceps', 'abs', 'quads', 'calves'] as MuscleKey[])
                  : (['lats', 'traps', 'triceps', 'lowback', 'glutes', 'hamstrings'] as MuscleKey[])
                ).map((mKey) => {
                  const isSel = selectedMuscle === mKey;
                  const st = recoveryStates[mKey];
                  const dot = st.level === 'ready' ? '🟢' : st.level === 'recovering' ? '🟡' : '🔴';
                  return (
                    <button
                      key={mKey}
                      type="button"
                      onClick={() => setSelectedMuscle(mKey)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1 border ${
                        isSel
                          ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                          : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-200'
                      }`}
                    >
                      <span className="text-[10px]">{dot}</span>
                      <span>{st.label.split(' (')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
