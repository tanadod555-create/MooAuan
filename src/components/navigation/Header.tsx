import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

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
    setActiveProfileKey,
    currentProfile,
    isFirebaseConnected,
  } = useApp();

  const isMagnum = activeProfileKey === 'primary';
  const otherName = isMagnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-pink-100/90 shadow-xs px-3.5 sm:px-6 py-2.5 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Mascot & Profile Avatar with Cute Bouncy Wiggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfileModal}
            className={`relative flex items-center justify-center p-1 rounded-2xl border-2 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-xs ${
              isMagnum
                ? 'bg-sky-100/80 border-sky-300'
                : 'bg-pink-100/80 border-pink-300'
            }`}
            title="แตะเพื่อเลือกโปรไฟล์หรือเปลี่ยนตัวละคร"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-white">
              <img
                src={isMagnum ? './mascots/magnum_icon.png' : './mascots/manow_icon.png'}
                alt={currentProfile.name}
                className="w-full h-full object-cover animate-bounce-subtle"
                onError={(e) => {
                  // Fallback
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -top-1 -right-1 text-xs animate-sparkle">✨</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight flex items-center gap-1">
                หมูอ้วน 🐷
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded-md ${
                    isMagnum ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {isMagnum ? 'Gym Hero' : 'Cozy Fit'}
                </span>
              </h1>
              {/* Cloud Sync Status Indicator */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isFirebaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
                title={isFirebaseConnected ? 'ซิงค์ข้อมูลสด Real-time สำเร็จ' : 'โหมด Offline'}
              >
                {isFirebaseConnected ? <Wifi size={11} className="text-emerald-500 animate-pulse" /> : <WifiOff size={11} />}
                <span className="hidden sm:inline">{isFirebaseConnected ? 'Live Sync' : 'Offline'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
              <span>กำลังเล่น:</span>
              <strong className={isMagnum ? 'text-sky-600' : 'text-pink-600'}>
                {currentProfile.name}
              </strong>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                {isMagnum ? 'P1 🎮' : 'P2 🌸'}
              </span>
            </p>
          </div>
        </div>

        {/* Right Action Controls: 3D Candy AI Button & Character Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Trainer Button with Candy Star */}
          {onOpenAiTrainer && (
            <button
              onClick={onOpenAiTrainer}
              className="btn-candy-yellow px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              title="เปิดคุยกับโค้ชหมูอ้วน AI"
            >
              <Sparkles size={13} className="animate-sparkle" />
              <span>โค้ช AI 💬</span>
            </button>
          )}

          {/* 3D Character Switcher Button */}
          <button
            onClick={() => setActiveProfileKey(isMagnum ? 'partner' : 'primary')}
            className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isMagnum ? 'btn-candy-pink' : 'btn-candy-blue'
            }`}
            title={`คลิกเพื่อสลับตัวละครเป็น ${otherName}`}
          >
            <Users size={13} />
            <span className="hidden sm:inline">สลับเป็น</span>
            <span>{otherName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
