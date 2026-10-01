import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculatePigEvolution,
  getMascotScene,
  getUserAvatar,
  PigEvolutionLevel,
  PIG_10_LEVELS,
} from '../../utils/mascotLevels';
import { PigMascot } from '../ui/PigMascot';
import {
  Flame,
  Trophy,
  Zap,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Volume2,
  RefreshCw,
  Clock,
  Dumbbell,
  Crown,
} from 'lucide-react';

interface MascotSceneStageProps {
  onTapPig?: () => void;
  overrideLevel?: {
    maxnum?: PigEvolutionLevel;
    manow?: PigEvolutionLevel;
  };
}

export const MascotSceneStage: React.FC<MascotSceneStageProps> = ({
  overrideLevel,
}) => {
  const {
    allWorkoutHistory,
    allFoodLogs,
    activeWorkout,
    activeProfileKey,
    primaryProfile,
    partnerProfile,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';
  const currentProfile = isMaxnum ? primaryProfile : partnerProfile;
  const currentGender = isMaxnum ? 'male' : 'female';

  // Filter history for current user
  const userHistory = allWorkoutHistory.filter(
    (s) => (s.user_id || 'primary') === activeProfileKey
  );

  // Today food count
  const today = new Date().toISOString().split('T')[0];
  const todayFoodCount = (allFoodLogs || []).filter(
    (l) => l.date === today && (l.user_id || 'primary') === activeProfileKey
  ).length;

  // Real-time evolution calculation
  const evolution = calculatePigEvolution(userHistory, activeWorkout !== null);
  const activeLevel =
    (isMaxnum ? overrideLevel?.maxnum : overrideLevel?.manow) ?? evolution.level;
  const levelConfig = PIG_10_LEVELS[activeLevel];

  // Real-time 4-condition scene
  const sceneInfo = getMascotScene(activeWorkout !== null, todayFoodCount);

  // Speech bubble dynamic dialog
  const [speech, setSpeech] = useState<string>(() => {
    if (activeWorkout) return 'ฮึบๆ! กำลังอยู่ในเซสชันฝึกวันนี้ ยกให้สุดแรงเลยนะหมูอ้วน! 🔥💪';
    if (evolution.isDecaying) return `งือออ... ไม่ได้เข้ายิมมาหลายวันแล้ว เลเวลตกเหลือ Lv.${activeLevel} แล้วนะ! รีบไปยิมกันเถอะ 🍩🐽`;
    if (activeLevel >= 8) return 'ร่างทองระดับตำนาน! ความมีวินัยของคุณยอดเยี่ยมที่สุดในจักรวาล MooAuan 👑✨';
    return `ยินดีต้อนรับ! ตอนนี้เราอยู่ Lv.${activeLevel} (${levelConfig.titleTh}) สัปดาห์นี้ซ้อมไป ${evolution.recentWeekCount} ครั้งแล้วนะ 🌸🐽`;
  });

  const handleMascotClick = () => {
    if (activeWorkout) {
      setSpeech('สู้ๆ! โฟกัสกล้ามเนื้อให้ตรงจุด ฟอร์มเป๊ะ ปั๊มให้แน่นเปรี๊ยะ! 🏋️‍♂️🔥');
    } else if (activeLevel >= 8) {
      setSpeech(`ซิกแพกเป็นลอน แขนแน่นเปรี๊ยะ! ซ้อมต่อเนื่อง ${evolution.streakWeeks} สัปดาห์แล้ว สุดยอดดด! 🏆✨`);
    } else if (evolution.recentWeekCount === 0) {
      setSpeech('หมูอ้วนตัวนี้ยังไม่ได้เข้ายิมเลยสัปดาห์นี้! รีบไปเปิดเซสชันด่วนๆ อู๊ดๆ 🍩🐽');
    } else {
      setSpeech(`ซ้อมไปแล้ว ${evolution.recentWeekCount} ครั้งในสัปดาห์นี้! ซ้อมอีกนิดเพื่อเลเวลอัปนะหมูอ้วน! 💖✨`);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-pink-200/90 shadow-lg shadow-pink-100/50 bg-slate-900 transition-all duration-300">
      {/* Background Image Stage with 4 dynamic conditions */}
      <div className="relative w-full h-96 sm:h-[28rem] overflow-hidden">
        <img
          src={sceneInfo.imageSrc}
          alt={sceneInfo.label}
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] transition-all duration-700 hover:scale-105"
        />
        {/* Subtle Bottom Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Floating Badges: Scene Condition & Streak Status */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
          {/* 4-Condition Scene Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-md">
            <Sparkles size={13} className="text-yellow-300 animate-sparkle" />
            <span className="text-[11px] font-bold tracking-wide">
              {sceneInfo.badge}
            </span>
          </div>

          {/* Dynamic Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/90 to-rose-500/90 backdrop-blur-md border border-orange-300/60 text-white shadow-md">
            <Flame size={14} className="text-yellow-200 animate-bounce" />
            <span className="text-xs font-black tracking-tight">
              Streak: {evolution.streakWeeks} สัปดาห์
            </span>
          </div>
        </div>

        {/* Dynamic Speech Bubble */}
        <div
          onClick={handleMascotClick}
          className="absolute top-14 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-pink-200 shadow-md cursor-pointer hover:bg-white transition active:scale-[0.99] group"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-300 shrink-0 bg-pink-50">
              <img
                src={getUserAvatar(currentGender)}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[11px] font-black text-rose-600 flex items-center gap-1">
                  {currentProfile.name} (Lv.{activeLevel})
                </span>
                <span className="text-[10px] text-slate-400 font-semibold group-hover:text-pink-500 transition">
                  แตะเพื่อคุย 💬
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">
                "{speech}"
              </p>
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-pink-200" />
        </div>

        {/* Mascot Character Standing on Stage */}
        <div
          onClick={handleMascotClick}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
          title="แตะหมูอ้วนเพื่อดูปฏิกิริยา"
        >
          <PigMascot
            level={activeLevel}
            gender={currentGender}
            size="2xl"
            className="filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Level Tag on Bottom Corner */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-white flex items-center gap-1.5 shadow-md">
          <Crown size={14} className="text-yellow-400" />
          <span className="text-xs font-black">
            Lv.{activeLevel} / 10
          </span>
        </div>
      </div>

      {/* Stage Bottom Info Panel: Level Title, XP Progress & Inactivity Alert */}
      <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-pink-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800 flex items-center gap-1.5">
                <span>{levelConfig.emoji}</span>
                <span>{levelConfig.titleTh}</span>
                <span className="text-xs text-slate-400 font-normal font-mono">
                  ({levelConfig.titleEn})
                </span>
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${levelConfig.badgeColor}`}
              >
                {levelConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {levelConfig.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-rose-600">
                {evolution.recentWeekCount} เซสชัน
              </span>
            </div>
            <div className="w-px h-7 bg-pink-100" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {evolution.totalCount} รอบ
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar to Next Level */}
        <div className="space-y-1.5 bg-pink-50/50 p-3 rounded-2xl border border-pink-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1 text-slate-600">
              <TrendingUp size={13} className="text-rose-500" />
              ความก้าวหน้าเลเวลถัดไป:
            </span>
            <span className="font-mono text-rose-600">
              {evolution.nextLevelProgressPct}%
            </span>
          </div>
          <div className="w-full h-3 bg-pink-200/50 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-yellow-400 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(100, Math.max(8, evolution.nextLevelProgressPct))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            💡 {evolution.nextLevelRequirementText}
          </p>
        </div>

        {/* Inactivity Decay Warning Banner */}
        {evolution.decayWarningMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold animate-pulse">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <span>{evolution.decayWarningMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
