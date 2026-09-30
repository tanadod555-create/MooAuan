import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Heart, Sparkles, Check, Dumbbell, Flame } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';
import { ShimmerButton } from '../ui/ShimmerButton';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <BorderBeam size={220} duration={6} colorFrom="#10b981" colorTo="#ec4899" />

        {/* Header */}
        <div className="text-center relative z-10 space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles size={14} />
            <span>FitTrack · MooAuan</span>
          </div>
          <h2 className="text-2xl font-black text-white">ยินดีต้อนรับครับ</h2>
          <p className="text-xs text-slate-400">
            วันนี้ใครเป็นคนเข้าใช้งาน? เลือกโปรไฟล์เพื่อเริ่มบันทึก
          </p>
        </div>

        {/* 2 Person Cards */}
        <div className="grid grid-cols-1 gap-3.5 relative z-10">
          {/* แม็กนั่ม (Magnum) */}
          <button
            onClick={() => handleSelectProfile('primary')}
            className={`group relative p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
              activeProfileKey === 'primary'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30 font-black text-xl">
                  🏋️‍♂️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                      {primaryProfile.name}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      TRAINER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {primaryProfile.goal} · {primaryProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                  activeProfileKey === 'primary'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-slate-700 text-transparent'
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
                ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-slate-950 shadow-md shadow-pink-500/30 font-black text-xl">
                  🌸
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white group-hover:text-pink-400 transition">
                      {partnerProfile.name}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                      แฟนสาว
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {partnerProfile.goal} · {partnerProfile.kcal_target} kcal
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                  activeProfileKey === 'partner'
                    ? 'bg-pink-500 text-slate-950'
                    : 'border border-slate-700 text-transparent'
                }`}
              >
                <Check size={14} className="stroke-[3]" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Options */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] text-slate-300">จำคำตอบไว้สำหรับรอบถัดไป</span>
          </label>

          <span className="text-[11px] text-slate-500">
            (สลับคนได้ที่ปุ่มบนขวาเสมอ)
          </span>
        </div>
      </div>
    </div>
  );
};
