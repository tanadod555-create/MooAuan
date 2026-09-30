import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, RefreshCw, FileSpreadsheet, Sparkles } from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenProfileModal }) => {
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

  const otherProfileName = activeProfileKey === 'primary' ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️';

  const handleQuickSync = async () => {
    const res = await syncAllToGoogleSheets();
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-pink-200/80 px-4 py-2.5 shadow-sm shadow-pink-100/40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* App Title with Pig Mascot & Profile Selector */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfileModal}
            className="relative flex items-center justify-center p-0.5 rounded-2xl bg-gradient-to-tr from-pink-300 via-rose-300 to-pink-200 shadow-md shadow-pink-300/30 hover:scale-105 active:scale-95 transition"
            title="กดเพื่อเลือกโปรไฟล์หรือเปลี่ยนคนใช้งาน"
          >
            <PigMascot
              size="sm"
              expression={activeProfileKey === 'partner' ? 'happy' : 'workout'}
              className="drop-shadow-sm"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base sm:text-lg text-pink-950 tracking-tight flex items-center gap-1">
                หมูอ้วน
                <span className="text-xs font-normal text-pink-500 font-mono">MooAuan</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-black border border-pink-200 flex items-center gap-0.5">
                <Sparkles size={10} className="text-pink-500" />
                <span>คิ้วท์</span>
              </span>
            </div>
            <p className="text-[11px] text-pink-900/70 flex items-center gap-1 font-medium">
              <span>กำลังดูแล:</span>
              <strong className={activeProfileKey === 'primary' ? 'text-pink-700' : 'text-rose-600'}>
                {activeProfileKey === 'primary' ? '🏋️‍♂️ แม็กนั่ม' : '🌸 มะนาว'}
              </strong>
            </p>
          </div>
        </div>

        {/* Right Actions: Switch Profile Pill + Sync */}
        <div className="flex items-center gap-2">
          {/* Quick Partner Switch Pill */}
          <button
            onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition active:scale-95 shadow-sm bg-pink-50 hover:bg-pink-100/80 border-pink-200 text-pink-800"
            title={`คลิกเพื่อสลับเป็น ${otherProfileName}`}
          >
            <Users size={14} className="text-pink-500" />
            <span className="hidden xs:inline">สลับเป็น:</span>
            <span className="text-rose-600 font-extrabold">{otherProfileName}</span>
          </button>

          {/* Direct Google Sheets Link Button */}
          <button
            onClick={openUnifiedSpreadsheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-400/40 text-emerald-800 text-xs font-bold transition active:scale-95 shadow-sm"
            title="เปิด Google Sheets รวม (แม็กนั่ม & มะนาว) ทันที"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">ชีทรวม 🐷</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className={`p-2 rounded-2xl bg-pink-100/70 hover:bg-pink-200/80 border border-pink-200 text-pink-700 hover:text-pink-900 transition active:scale-95 ${
              isSyncing ? 'animate-spin text-pink-500' : ''
            }`}
            title="ซิงค์ข้อมูลกับ Google Sheet"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
