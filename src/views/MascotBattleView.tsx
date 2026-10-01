import React from 'react';
import { useApp } from '../context/AppContext';
import { PigMascot } from '../components/ui/PigMascot';
import {
  calculatePigEvolution,
  getUserAvatar,
  PIG_10_LEVELS,
} from '../utils/mascotLevels';
import {
  Flame,
  Swords,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { MascotSceneStage } from '../components/mascot/MascotSceneStage';

export const MascotBattleView: React.FC = () => {
  const {
    allWorkoutHistory,
    activeWorkout,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
  } = useApp();

  // Maxnum Stats & Evolution
  const maxnumHistory = allWorkoutHistory.filter(
    (s) => (s.user_id || 'primary') === 'primary'
  );
  const maxnumEvolution = calculatePigEvolution(
    maxnumHistory,
    activeWorkout !== null && activeProfileKey === 'primary'
  );

  // Manow Stats & Evolution
  const manowHistory = allWorkoutHistory.filter((s) => s.user_id === 'partner');
  const manowEvolution = calculatePigEvolution(
    manowHistory,
    activeWorkout !== null && activeProfileKey === 'partner'
  );

  const maxnumLevel = maxnumEvolution.level;
  const manowLevel = manowEvolution.level;

  const maxnumConfig = PIG_10_LEVELS[maxnumLevel];
  const manowConfig = PIG_10_LEVELS[manowLevel];

  // Winner calculation
  const leader =
    maxnumEvolution.recentWeekCount > manowEvolution.recentWeekCount
      ? 'maxnum'
      : manowEvolution.recentWeekCount > maxnumEvolution.recentWeekCount
      ? 'manow'
      : 'tie';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. Main Stage Card: 4-Condition Background Scene with Real-time Animation */}
      <MascotSceneStage />

      {/* 2. Versus Header Bar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white/95 rounded-3xl border border-pink-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-xs">
            <Swords size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
              สนามประลองหมูอ้วน 10 เลเวล ⚔️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              สตรีคต่อเนื่องยิ่งสูง เลเวลยิ่งอัป! ไม่ซ้อมเกิน 7 วัน เลเวลจะลดลง
            </p>
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side Character Battle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CHARACTER 1: MAXNUM (MALE) */}
        <div
          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 bg-white/95 shadow-md ${
            maxnumConfig.borderGlow
          }`}
        >
          {/* Winner Crown Tag */}
          {leader === 'maxnum' && (
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 animate-bounce">
              <Crown size={13} />
              <span>ผู้นำสัปดาห์นี้! 🔥</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-300 shadow-sm shrink-0 bg-sky-50">
              <img
                src={getUserAvatar('male')}
                alt="Maxnum"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-800 truncate">
                  {primaryProfile.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Gym Hero
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                เป้าหมาย: สร้างกล้ามเนื้อ & ความแข็งแกร่ง
              </p>
            </div>
          </div>

          {/* Animated Mascot Preview */}
          <div className="relative h-56 rounded-2xl bg-gradient-to-b from-sky-50/80 to-blue-50/40 border border-sky-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
            <PigMascot level={maxnumLevel} gender="male" size="xl" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-sky-200 text-[10px] font-black text-sky-700 font-mono">
              Lv.{maxnumLevel} / 10
            </div>
          </div>

          {/* Evolution Title & Body Fat */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{maxnumConfig.emoji}</span>
                <span>{maxnumConfig.titleTh}</span>
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${maxnumConfig.badgeColor}`}>
                {maxnumConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {maxnumConfig.description}
            </p>
          </div>

          {/* Streak & Sessions Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-sky-700">
                {maxnumEvolution.recentWeekCount} วัน
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สตรีค</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-0.5">
                <Flame size={12} /> {maxnumEvolution.streakWeeks} วีค
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {maxnumEvolution.totalCount} รอบ
              </span>
            </div>
          </div>

          {/* Inactivity Warning */}
          {maxnumEvolution.decayWarningMsg && (
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {maxnumEvolution.decayWarningMsg}
            </p>
          )}
        </div>

        {/* CHARACTER 2: MANOW (FEMALE) */}
        <div
          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 bg-white/95 shadow-md ${
            manowConfig.borderGlow
          }`}
        >
          {/* Winner Crown Tag */}
          {leader === 'manow' && (
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-pink-400 to-rose-300 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-pink-200 animate-bounce">
              <Crown size={13} />
              <span>ผู้นำสัปดาห์นี้! 🌸</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-sm shrink-0 bg-pink-50">
              <img
                src={getUserAvatar('female')}
                alt="Manow"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-800 truncate">
                  {partnerProfile.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Cozy Fit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                เป้าหมาย: หุ่นกระชับ & ปั้นก้นกลม
              </p>
            </div>
          </div>

          {/* Animated Mascot Preview */}
          <div className="relative h-56 rounded-2xl bg-gradient-to-b from-pink-50/80 to-rose-50/40 border border-pink-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
            <PigMascot level={manowLevel} gender="female" size="xl" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-200 text-[10px] font-black text-pink-700 font-mono">
              Lv.{manowLevel} / 10
            </div>
          </div>

          {/* Evolution Title & Body Fat */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{manowConfig.emoji}</span>
                <span>{manowConfig.titleTh}</span>
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${manowConfig.badgeColor}`}>
                {manowConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {manowConfig.description}
            </p>
          </div>

          {/* Streak & Sessions Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-pink-700">
                {manowEvolution.recentWeekCount} วัน
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สตรีค</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-0.5">
                <Flame size={12} /> {manowEvolution.streakWeeks} วีค
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {manowEvolution.totalCount} รอบ
              </span>
            </div>
          </div>

          {/* Inactivity Warning */}
          {manowEvolution.decayWarningMsg && (
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {manowEvolution.decayWarningMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
