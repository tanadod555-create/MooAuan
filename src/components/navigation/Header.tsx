import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, RefreshCw, FileSpreadsheet, Sparkles } from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfileModal?: () => void;
  onOpenAiTrainer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenProfileModal,
  onOpenAiTrainer,
}) => {
  const {
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    partnerProfile,
    primaryProfile,
    isSyncing,
    syncAllToGoogleSheets,
    settings,
    openUnifiedSpreadsheet,
  } = useApp();

  const otherProfileName = activeProfileKey === 'primary' ? 'มะนาว (Manow) 🌸' : 'แม็กนั่ม 🏋️‍♂️';

  const handleQuickSync = async () => {
    const res = await syncAllToGoogleSheets();
    if (!res.success) {
      alert(res.message);
    }
  };

  const isMagnum = activeProfileKey === 'primary';

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b px-4 py-2.5 transition-colors duration-300 ${
        isMagnum ? 'border-sky-200/90 shadow-sm shadow-sky-100/50' : 'border-pink-200/80 shadow-sm shadow-pink-100/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* App Title with Pig Mascot & Profile Selector */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfileModal}
            className={`relative flex items-center justify-center p-0.5 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition ${
              isMagnum
                ? 'bg-gradient-to-tr from-sky-400 via-blue-400 to-sky-200 shadow-sky-300/40'
                : 'bg-gradient-to-tr from-pink-300 via-rose-300 to-pink-200 shadow-pink-300/30'
            }`}
            title="กดเพื่อเลือกโปรไฟล์หรือเปลี่ยนคนใช้งาน"
          >
            <PigMascot
              size="sm"
              expression={isMagnum ? 'workout' : 'happy'}
              className="drop-shadow-sm"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1">
                หมูอ้วน
                <span className={`text-[11px] font-normal font-mono ${isMagnum ? 'text-sky-500' : 'text-pink-400'}`}>
                  MooAuan
                </span>
              </h1>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border flex items-center gap-0.5 ${
                  isMagnum
                    ? 'bg-sky-100 text-sky-700 border-sky-200/80'
                    : 'bg-pink-100 text-pink-700 border-pink-200/70'
                }`}
              >
                <Sparkles size={9} className={isMagnum ? 'text-sky-500' : 'text-pink-400'} />
                <span>{isMagnum ? 'ธีมฟ้า 🏋️‍♂️' : 'ธีมชมพู 🌸'}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span>กำลังดูแล:</span>
              <strong className={isMagnum ? 'text-sky-600' : 'text-rose-500'}>
                {isMagnum ? '🏋️‍♂️ แม็กนั่ม (Magnum)' : '🌸 มะนาว (Manow)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Right Actions: AI Coach + Switch Profile Pill + Sync */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Trainer Button */}
          {onOpenAiTrainer && (
            <button
              onClick={onOpenAiTrainer}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer ${
                isMagnum
                  ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-300 text-sky-600'
                  : 'bg-gradient-to-r from-rose-500/10 via-pink-400/10 to-rose-500/10 hover:from-rose-500/20 hover:to-pink-500/20 border-rose-300/80 text-rose-600'
              }`}
              title="เปิดแชทกับโค้ชหมูอ้วน AI (คุยสด)"
            >
              <Sparkles size={12} className={isMagnum ? 'text-sky-500' : 'text-rose-500'} />
              <span>โค้ช AI 🐷</span>
            </button>
          )}

          {/* Quick Partner Switch Pill */}
          <button
            onClick={() => setActiveProfileKey(isMagnum ? 'partner' : 'primary')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer ${
              isMagnum
                ? 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700'
            }`}
            title={`คลิกเพื่อสลับโปรไฟล์เป็น ${otherProfileName}`}
          >
            <Users size={13} className={isMagnum ? 'text-pink-500' : 'text-sky-500'} />
            <span className="font-bold">{otherProfileName}</span>
          </button>

          {/* Direct Google Sheets Link Button */}
          <button
            onClick={openUnifiedSpreadsheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-400/40 text-emerald-800 text-xs font-bold transition active:scale-95 shadow-sm cursor-pointer"
            title="เปิด Google Sheets รวม (แม็กนั่ม & มะนาว) ทันที"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">ชีทรวม 🐷</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className={`p-2 rounded-2xl border transition active:scale-95 cursor-pointer ${
              isMagnum
                ? 'bg-sky-100/70 hover:bg-sky-200/80 border-sky-200 text-sky-700 hover:text-sky-900'
                : 'bg-pink-100/70 hover:bg-pink-200/80 border-pink-200 text-pink-700 hover:text-pink-900'
            } ${isSyncing ? (isMagnum ? 'animate-spin text-sky-500' : 'animate-spin text-pink-500') : ''}`}
            title="ซิงค์ข้อมูลกับ Google Sheet"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
