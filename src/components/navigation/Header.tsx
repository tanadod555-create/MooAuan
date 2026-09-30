import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    partnerProfile,
    isSyncing,
    syncAllToGoogleSheets,
    settings,
  } = useApp();

  const otherProfileName = activeProfileKey === 'primary' ? partnerProfile.name : 'เจ้าของ (Me)';

  const handleQuickSync = async () => {
    const res = await syncAllToGoogleSheets();
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* App Title & Active Profile Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-black text-sm tracking-tighter">FT</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">FitTrack</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              โปรไฟล์: <strong className="text-slate-200">{currentProfile.name}</strong>
            </p>
          </div>
        </div>

        {/* Right Actions: Switch Profile Pill + Sync + Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Partner Switch Pill */}
          <button
            onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition active:scale-95 shadow-sm"
            title={`สลับไปที่โปรไฟล์ ${otherProfileName}`}
          >
            <Users size={14} className={activeProfileKey === 'primary' ? 'text-blue-400' : 'text-pink-400'} />
            <span className="hidden xs:inline">สลับเป็น:</span>
            <span className="text-emerald-400 font-bold">{otherProfileName}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition ${
              isSyncing ? 'animate-spin text-emerald-400' : ''
            }`}
            title="ซิงค์ข้อมูลกับ Google Sheet"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
