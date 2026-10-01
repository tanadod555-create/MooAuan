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
    <header className="sticky top-0 z-40 glass-apple-header px-4 py-2.5 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfileModal}
            className="relative flex items-center justify-center p-1 rounded-2xl bg-zinc-100 border border-black/[0.06] hover:scale-105 active:scale-95 transition shadow-2xs cursor-pointer"
            title="กดเพื่อเลือกโปรไฟล์"
          >
            <PigMascot
              size="sm"
              expression={isMagnum ? 'workout' : 'happy'}
              className="drop-shadow-xs"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-zinc-900 tracking-tight flex items-center gap-1.5">
                หมูอ้วน
                <span className="text-[11px] font-medium text-zinc-400 font-mono">MooAuan</span>
              </h1>
              {/* Cloud Sync Status Indicator */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  isFirebaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                }`}
                title={isFirebaseConnected ? 'ซิงค์ข้อมูล Real-time สำเร็จ' : 'โหมด Offline'}
              >
                {isFirebaseConnected ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} />}
                <span className="hidden sm:inline">{isFirebaseConnected ? 'Cloud Live' : 'Offline'}</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              กำลังดูแล: <strong className={isMagnum ? 'text-blue-600 font-bold' : 'text-rose-600 font-bold'}>{currentProfile.name}</strong>
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Trainer Button */}
          {onOpenAiTrainer && (
            <button
              onClick={onOpenAiTrainer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                isMagnum
                  ? 'bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-700'
                  : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
              }`}
              title="เปิดคุยกับโค้ชหมูอ้วน AI"
            >
              <Sparkles size={13} className={isMagnum ? 'text-blue-500' : 'text-rose-500'} />
              <span>โค้ช AI</span>
            </button>
          )}

          {/* Apple-style Profile Switcher Segmented Pill */}
          <button
            onClick={() => setActiveProfileKey(isMagnum ? 'partner' : 'primary')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all active:scale-95 shadow-sm cursor-pointer"
            title={`คลิกเพื่อสลับโปรไฟล์เป็น ${otherName}`}
          >
            <Users size={13} className="text-zinc-400" />
            <span className="hidden sm:inline">สลับเป็น</span>
            <span>{otherName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
