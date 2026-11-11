import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Sparkles, User, Flame } from 'lucide-react';
import { getUserAvatar, calculatePigEvolution } from '../../utils/mascotLevels';
import { loadPiggySaveData, subscribeToCoinUpdates } from '../../services/piggyGameService';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfileModal?: () => void;
  onOpenAiTrainer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfileModal,
  onOpenAiTrainer,
}) => {
  const {
    activeProfileKey,
    currentProfile,
    currentAccount,
    isSpecialPair,
    workoutHistory,
    activeWorkout,
    loginWithCredentials,
    activeWorld,
    setActiveWorld,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';
  const evolution = calculatePigEvolution(workoutHistory || [], activeWorkout !== null);

  // Real-time Coin Balance
  const [coins, setCoins] = useState<number>(() => {
    try {
      return loadPiggySaveData().totalCoins;
    } catch {
      return 50;
    }
  });

  useEffect(() => {
    return subscribeToCoinUpdates((newTotal) => {
      setCoins(newTotal);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-pink-100/90 shadow-xs px-3 sm:px-6 py-2 transition-all duration-300 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Clean Profile Avatar, Level & User Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            onClick={onOpenProfileModal}
            className={`relative flex items-center justify-center p-0.5 rounded-2xl border-2 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs shrink-0 ${
              isMaxnum
                ? 'bg-sky-100/80 border-sky-300'
                : 'bg-pink-100/80 border-pink-300'
            }`}
            title="แตะเพื่อเข้าสู่ระบบ หรือ สลับบัญชี"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-white/90">
              <img
                src={getUserAvatar(activeProfileKey)}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Level Mini-Badge on Avatar */}
            <span
              className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1 rounded-full text-white ring-2 ring-white shadow-2xs ${
                isMaxnum ? 'bg-sky-500' : 'bg-pink-500'
              }`}
            >
              L{evolution.level}
            </span>
          </button>

          <div
            className="cursor-pointer min-w-0"
            onClick={onOpenProfileModal}
            title="แตะเพื่อเข้าสู่ระบบ หรือ สลับบัญชี"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1 leading-tight truncate">
                หมูอ้วน 🐷
              </h1>
              {/* Streak Tag */}
              {evolution.streakWeeks > 0 && (
                <span className="hidden xs:inline-flex sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-orange-100/90 border border-orange-200 text-orange-700 text-[10px] font-black">
                  <Flame size={10} className="text-orange-500" />
                  {evolution.streakWeeks} วีค
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1 truncate mt-0.5">
              <span className={`truncate ${isMaxnum ? 'text-sky-600' : 'text-pink-600'}`}>
                {currentAccount ? currentAccount.name : currentProfile.name}
              </span>
              {currentAccount && (
                <span className="hidden sm:inline text-[10px] text-slate-400 font-normal shrink-0">
                  (@{currentAccount.username})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Coins, AI Coach, World Switch, Character Switch & Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick World Switcher (Fit ↔️ Setthi) & Portal Button */}
          {activeWorld !== 'portal' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveWorld(activeWorld === 'fit' ? 'setthi' : 'fit')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-black rounded-xl border flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                  activeWorld === 'fit'
                    ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                    : isMaxnum
                    ? 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200'
                    : 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200'
                }`}
                title={activeWorld === 'fit' ? 'สลับไปหน้า หมูอ้วนเศรษฐี' : 'สลับไปหน้า หมูอ้วนฟิต'}
              >
                <span>{activeWorld === 'fit' ? '💰' : '🏋️'}</span>
                <span className="hidden xs:inline sm:inline text-[11px]">
                  {activeWorld === 'fit' ? 'เศรษฐี' : 'ฟิต'}
                </span>
              </button>

              <button
                onClick={() => setActiveWorld('portal')}
                className="p-1 sm:px-2 py-1 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-0.5 cursor-pointer shadow-2xs"
                title="กลับหน้า Portal ประตูกลาง"
              >
                <span>🏠</span>
                <span className="hidden md:inline text-[11px]">หน้ารวม</span>
              </button>
            </div>
          )}

          {/* Gym Coins Badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-black shadow-xs transition select-none cursor-default"
            title={`เหรียญหมูอ้วน: ${coins} เหรียญ (ได้จากการยกเวทและคาร์ดิโอ)`}
          >
            <span className="text-xs sm:text-sm animate-wiggle">🪙</span>
            <span className="font-mono text-xs font-black">{coins}</span>
          </div>

          {/* AI Trainer Button */}
          {onOpenAiTrainer && (
            <button
              onClick={onOpenAiTrainer}
              className="btn-candy-yellow px-2.5 sm:px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              title="เปิดคุยกับโค้ชหมูอ้วน AI"
            >
              <Sparkles size={12} className="animate-sparkle" />
              <span className="hidden sm:inline">โค้ช AI</span>
              <span className="sm:hidden text-[11px]">AI</span>
            </button>
          )}

          {/* Quick Switch for Special Pair (Maxnum & Manow only) */}
          {isSpecialPair && (
            <button
              onClick={() => {
                const targetKey = isMaxnum ? 'partner' : 'primary';
                const targetUser = targetKey === 'partner' ? 'manow' : 'maxnum';
                loginWithCredentials(targetUser, targetUser);
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isMaxnum ? 'btn-candy-pink' : 'btn-candy-blue'
              }`}
              title={`คลิกเพื่อสลับเป็น ${isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}`}
            >
              <Users size={12} />
              <span className="hidden sm:inline">สลับ</span>
              <span>{isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}</span>
            </button>
          )}

          {/* Account / Switcher Button */}
          <button
            onClick={onOpenProfileModal}
            className={`p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold flex items-center gap-1 cursor-pointer rounded-2xl border transition-all ${
              !isSpecialPair
                ? isMaxnum
                  ? 'btn-candy-pink'
                  : 'btn-candy-blue'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="เข้าสู่ระบบ / สลับบัญชีผู้ใช้"
          >
            <User size={13} />
            <span className={isSpecialPair ? 'hidden md:inline text-[11px]' : 'inline text-[11px]'}>
              {currentAccount ? 'สลับบัญชี' : 'เข้าสู่ระบบ'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
