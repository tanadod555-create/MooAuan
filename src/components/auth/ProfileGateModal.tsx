import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Heart, Sparkles, Check, Dumbbell, Flame } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';
import { ShimmerButton } from '../ui/ShimmerButton';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <BorderBeam size={220} duration={6} colorFrom="#f472b6" colorTo="#fb7185" />

        {/* Mascot & Header */}
        <div className="text-center relative z-10 space-y-2 mb-6">
          <div className="flex justify-center -mt-1 mb-1">
            <PigMascot size="lg" expression="cheer" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200">
            <Sparkles size={13} className="text-pink-500" />
            <span>หมูอ้วน · MooAuan 🐷</span>
          </div>
          <h2 className="text-2xl font-black text-pink-950">ยินดีต้อนรับครับ! 🐽</h2>
          <p className="text-xs text-pink-900/60">
            วันนี้ใครเป็นคนฟิต? เลือกโปรไฟล์ของคุณเพื่อเริ่มลุยกันเลย
          </p>
        </div>

        {/* 2 Person Cards */}
        <div className="grid grid-cols-1 gap-3.5 relative z-10">
          {/* แม็กนั่ม (Magnum) */}
          <button
            onClick={() => handleSelectProfile('primary')}
            className={`group relative p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
              activeProfileKey === 'primary'
                ? 'bg-gradient-to-r from-sky-50 to-pink-50 border-sky-300 shadow-md shadow-sky-200/50'
                : 'bg-pink-50/40 border-pink-100 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-sky-400/30 font-black text-xl">
                  🏋️‍♂️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800 group-hover:text-pink-600 transition">
                      {primaryProfile.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                      TRAINER 🐷
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {primaryProfile.goal} · {primaryProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                  activeProfileKey === 'primary'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'border border-pink-200 text-transparent'
                }`}
              >
                <Check size={14} className="stroke-[3]" />
              </div>
            </div>
          </button>

          {/* มะนาว (Manao) */}
          <button
            onClick={() => handleSelectProfile('partner')}
            className={`group relative p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
              activeProfileKey === 'partner'
                ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md shadow-pink-200/50'
                : 'bg-pink-50/40 border-pink-100 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-300 flex items-center justify-center text-white shadow-md shadow-pink-400/30 font-black text-xl">
                  🌸
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800 group-hover:text-pink-600 transition">
                      {partnerProfile.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      แฟนสาว 💖
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {partnerProfile.goal} · {partnerProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                  activeProfileKey === 'partner'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'border border-pink-200 text-transparent'
                }`}
              >
                <Check size={14} className="stroke-[3]" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Options */}
        <div className="mt-5 pt-4 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500 relative z-10">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="rounded bg-pink-50 border-pink-300 text-pink-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] text-slate-600">จำคำตอบไว้สำหรับรอบถัดไป</span>
          </label>

          <span className="text-[11px] text-pink-400 font-medium">
            สลับคนได้ตลอดเวลา 🐽
          </span>
        </div>
      </div>
    </div>
  );
};
