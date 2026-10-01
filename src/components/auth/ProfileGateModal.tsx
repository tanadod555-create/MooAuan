import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Check, Play } from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface ProfileGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileGateModal: React.FC<ProfileGateModalProps> = ({ isOpen, onClose }) => {
  const { activeProfileKey, setActiveProfileKey, primaryProfile, partnerProfile } = useApp();
  const [rememberChoice, setRememberChoice] = useState(true);

  if (!isOpen) return null;

  const handleSelectProfile = (key: 'primary' | 'partner') => {
    setActiveProfileKey(key);
    if (rememberChoice) {
      localStorage.setItem('ft_profile_selected', 'true');
      localStorage.setItem('ft_active_profile', key);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-pink-200 rounded-[32px] p-6 shadow-2xl overflow-hidden animate-candy-pop">
        {/* Mascot & Header */}
        <div className="text-center relative z-10 space-y-2 mb-6">
          <div className="flex justify-center -mt-1 mb-2">
            <div className="animate-wiggle cursor-pointer">
              <PigMascot size="lg" expression="cheer" className="drop-shadow-sm" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black border border-pink-200">
            <Sparkles size={13} className="animate-sparkle text-pink-500" />
            <span>เลือกตัวละคร · Player Select 🎮</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ยินดีต้อนรับครับ! 🐽✨</h2>
          <p className="text-xs text-slate-500 font-medium">
            วันนี้ใครเป็นคนฟิต? เลือกตัวละครเพื่อเริ่มลุยเควสต์กันเลย
          </p>
        </div>

        {/* 2 Character Select Cards */}
        <div className="grid grid-cols-1 gap-3.5 relative z-10">
          {/* Player 1: แม็กนั่ม (Maxnum) */}
          <button
            onClick={() => handleSelectProfile('primary')}
            className={`group relative p-4 rounded-[24px] border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
              activeProfileKey === 'primary'
                ? 'bg-sky-50/80 border-sky-400 shadow-[0_5px_0_#38bdf8]'
                : 'bg-slate-50/60 border-slate-200 hover:border-sky-300 shadow-[0_4px_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-400 flex items-center justify-center text-white shadow-md font-black text-2xl group-hover:scale-110 transition-transform">
                  🏋️‍♂️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800">
                      {primaryProfile.name}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                      PLAYER 1 🎮
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {primaryProfile.goal} · {primaryProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  activeProfileKey === 'primary'
                    ? 'bg-sky-500 text-white shadow-sm scale-110'
                    : 'border-2 border-slate-300 text-transparent'
                }`}
              >
                <Check size={16} className="stroke-[3]" />
              </div>
            </div>
          </button>

          {/* Player 2: มะนาว (Manow) */}
          <button
            onClick={() => handleSelectProfile('partner')}
            className={`group relative p-4 rounded-[24px] border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
              activeProfileKey === 'partner'
                ? 'bg-pink-50/80 border-pink-400 shadow-[0_5px_0_#ff6584]'
                : 'bg-slate-50/60 border-slate-200 hover:border-pink-300 shadow-[0_4px_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-400 flex items-center justify-center text-white shadow-md font-black text-2xl group-hover:scale-110 transition-transform">
                  🌸
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800">
                      {partnerProfile.name}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      PLAYER 2 🌸
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {partnerProfile.goal} · {partnerProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  activeProfileKey === 'partner'
                    ? 'bg-pink-500 text-white shadow-sm scale-110'
                    : 'border-2 border-slate-300 text-transparent'
                }`}
              >
                <Check size={16} className="stroke-[3]" />
              </div>
            </div>
          </button>
        </div>

        {/* Enter Game Button */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => handleSelectProfile(activeProfileKey)}
            className={`w-full py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeProfileKey === 'partner' ? 'btn-candy-pink' : 'btn-candy-blue'
            }`}
          >
            <Play size={16} fill="currentColor" />
            <span>เข้าสู่เกมฟิตเนส (Enter Game) ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
