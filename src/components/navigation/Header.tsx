import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Sparkles, User } from 'lucide-react';
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
    currentProfile,
    currentAccount,
    isSpecialPair,
    loginWithCredentials,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-pink-100/90 shadow-xs px-3 sm:px-6 py-2.5 transition-all duration-300 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Clean Profile Avatar & User Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            onClick={onOpenProfileModal}
            className={`flex items-center justify-center p-0.5 rounded-2xl border-2 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs shrink-0 ${
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
          </button>
          <div
            className="cursor-pointer min-w-0"
            onClick={onOpenProfileModal}
            title="แตะเพื่อเข้าสู่ระบบ หรือ สลับบัญชี"
          >
            <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-slate-800 tracking-tight flex items-center gap-1 leading-tight truncate">
              หมูอ้วน 🐷
            </h1>
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1 truncate">
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

        {/* Right Action Controls: AI Coach, Character Switch & Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Trainer Button */}
          {onOpenAiTrainer && (
            <button
              onClick={onOpenAiTrainer}
              className="btn-candy-yellow px-2.5 sm:px-3.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              title="เปิดคุยกับโค้ชหมูอ้วน AI"
            >
              <Sparkles size={13} className="animate-sparkle" />
              <span className="hidden sm:inline">โค้ช AI 💬</span>
              <span className="sm:hidden">โค้ช AI</span>
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
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isMaxnum ? 'btn-candy-pink' : 'btn-candy-blue'
              }`}
              title={`คลิกเพื่อสลับเป็น ${isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}`}
            >
              <Users size={13} />
              <span className="hidden sm:inline">สลับเป็น</span>
              <span>{isMaxnum ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}</span>
            </button>
          )}

          {/* Account / Switcher Button */}
          <button
            onClick={onOpenProfileModal}
            className={`p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-2xl border transition-all ${
              !isSpecialPair
                ? isMaxnum
                  ? 'btn-candy-pink'
                  : 'btn-candy-blue'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="เข้าสู่ระบบ / สลับบัญชีผู้ใช้"
          >
            <User size={14} />
            <span className={isSpecialPair ? 'hidden md:inline' : 'inline'}>
              {currentAccount ? 'สลับบัญชี' : 'เข้าสู่ระบบ'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
