import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Sparkles } from 'lucide-react';
import { getUserAvatar } from '../../utils/mascotLevels';

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

  const isMaxnum = activeProfileKey === 'primary';
  const otherName = isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-pink-100/90 shadow-xs px-3.5 sm:px-6 py-2.5 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Clean Profile Avatar & User Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfileModal}
            className={`flex items-center justify-center p-0.5 rounded-2xl border-2 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
              isMaxnum
                ? 'bg-sky-100/80 border-sky-300'
                : 'bg-pink-100/80 border-pink-300'
            }`}
            title="แตะเพื่อดูโปรไฟล์"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-white/90">
              <img
                src={getUserAvatar(activeProfileKey)}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </button>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight flex items-center gap-1 leading-tight">
              หมูอ้วน 🐷
            </h1>
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <span className={isMaxnum ? 'text-sky-600' : 'text-pink-600'}>
                {currentProfile.name}
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
            onClick={() => setActiveProfileKey(isMaxnum ? 'partner' : 'primary')}
            className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isMaxnum ? 'btn-candy-pink' : 'btn-candy-blue'
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
