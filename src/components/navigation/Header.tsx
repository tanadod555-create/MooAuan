import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Flame } from 'lucide-react';
import { getUserAvatar, calculatePigEvolution } from '../../utils/mascotLevels';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfileModal?: () => void;
  onOpenAiTrainer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfileModal,
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-pink-100/90 shadow-2xs px-3 sm:px-6 py-2.5 transition-all duration-300 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Avatar & MooAuan Brand (Tap to go to Home Portal) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenProfileModal}
            className={`relative flex items-center justify-center p-0.5 rounded-2xl border-2 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs shrink-0 ${
              isMaxnum
                ? 'bg-sky-100/80 border-sky-300'
                : 'bg-pink-100/80 border-pink-300'
            }`}
            title="แตะเพื่อจัดการโปรไฟล์ หรือ สลับบัญชี"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-white/90">
              <img
                src={getUserAvatar(activeProfileKey)}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1 rounded-full text-white ring-2 ring-white shadow-2xs ${
                isMaxnum ? 'bg-sky-500' : 'bg-pink-500'
              }`}
            >
              L{evolution.level}
            </span>
          </button>

          {/* Logo & Name: Tap to return to Home Portal */}
          <button
            type="button"
            onClick={() => setActiveWorld('portal')}
            className="text-left cursor-pointer min-w-0 group hover:opacity-85 transition"
            title="แตะเพื่อกลับไปหน้าเลือกระบบ (Home)"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-black text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1 leading-tight truncate">
                <span>หมูอ้วน 🐷</span>
              </h1>
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
            </p>
          </button>
        </div>

        {/* Right: Clean, Dedicated World Switcher (ฟิต ↔️ เศรษฐี) + Quick Persona Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Segmented World Switcher: 🏋️ ฟิต | 💰 เศรษฐี */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveWorld('fit')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                activeWorld === 'fit'
                  ? isMaxnum
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="สลับไป หมูอ้วนฟิต (ออกกำลังกาย & อาหาร)"
            >
              <span>🏋️</span>
              <span className="text-[12px] sm:text-xs">ฟิต</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorld('setthi')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                activeWorld === 'setthi'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="สลับไป หมูอ้วนเศรษฐี (รายรับ-รายจ่าย & สแกนสลิป)"
            >
              <span>💰</span>
              <span className="text-[12px] sm:text-xs">เศรษฐี</span>
            </button>
          </div>

          {/* Quick Switch Persona for Special Pair (Maxnum & Manow) */}
          {isSpecialPair && (
            <button
              type="button"
              onClick={() => {
                const targetKey = isMaxnum ? 'partner' : 'primary';
                const targetUser = targetKey === 'partner' ? 'manow' : 'maxnum';
                loginWithCredentials(targetUser, targetUser);
              }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer border shadow-2xs transition-all active:scale-95 ${
                isMaxnum
                  ? 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
                  : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              }`}
              title={`คลิกเพื่อสลับเป็น ${isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}`}
            >
              <Users size={13} />
              <span className="hidden sm:inline font-black">{isMaxnum ? 'มะนาว' : 'แม็กนั่ม'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
