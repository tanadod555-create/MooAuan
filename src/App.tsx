import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/navigation/Header';
import { BottomNav, TabKey } from './components/navigation/BottomNav';
import { WorkoutView } from './views/WorkoutView';
import { AnatomyView } from './views/AnatomyView';
import { ExercisesView } from './views/ExercisesView';
import { FoodView } from './views/FoodView';
import { ProfileView } from './views/ProfileView';
import { MascotBattleView } from './views/MascotBattleView';
import { PiggyRunView } from './views/PiggyRunView';
import { ProfileGateModal } from './components/auth/ProfileGateModal';
import { AiTrainerModal } from './components/ai/AiTrainerModal';
import { PigMascot } from './components/ui/PigMascot';
import { PiggyRunModal } from './components/game/PiggyRunModal';
import { Timer, Play, Pause, Plus, X, ChevronRight, Volume2, VolumeX, Gamepad2, Loader2, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';

export const MainContent: React.FC = () => {
  const {
    activeProfileKey,
    restTimerSeconds,
    restTimerPaused,
    restTimerSound,
    addRestTimerSeconds,
    toggleRestTimerPause,
    toggleRestTimerSound,
    clearRestTimer,
    isFoodScanning,
    foodScanStatus,
    foodScanResult,
    foodScanError,
    dismissFoodScanResult,
  } = useApp();
  const isMaxnum = activeProfileKey === 'primary';

  const [activeTab, setActiveTab] = useState<TabKey>('workout');
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showAiTrainer, setShowAiTrainer] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState<boolean>(() => {
    // Show on entering website unless previously confirmed in this session
    return !sessionStorage.getItem('ft_profile_selected_session');
  });

  const handleCloseGate = () => {
    sessionStorage.setItem('ft_profile_selected_session', 'true');
    setShowProfileGate(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync theme class to document body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = isMaxnum ? 'theme-maxnum' : 'theme-manow';
    }
  }, [isMaxnum]);

  // Auto-dismiss scan completion/error toast after 8 seconds
  useEffect(() => {
    if (foodScanResult || foodScanError) {
      const timer = setTimeout(() => {
        dismissFoodScanResult();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [foodScanResult, foodScanError, dismissFoodScanResult]);

  return (
    <div
      className={`min-h-screen ${
        isMaxnum ? 'theme-maxnum' : 'theme-manow'
      } flex flex-col font-sans relative transition-colors duration-300`}
    >
      {/* Top Header */}
      <Header
        onOpenSettings={() => setActiveTab('stats')}
        onOpenProfileModal={() => setShowProfileGate(true)}
        onOpenAiTrainer={() => setShowAiTrainer(true)}
      />

      {/* Global Floating AI Food Scan Notification (Visible across all tabs) */}
      {(isFoodScanning || foodScanResult || foodScanError) && (
        <div className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slideDown">
          <div
            className={`rounded-2xl border-2 backdrop-blur-md shadow-2xl p-3 flex items-center justify-between gap-2.5 transition-all ${
              foodScanError
                ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-950/40'
                : foodScanResult
                ? 'bg-emerald-950/95 border-emerald-500 text-white shadow-emerald-950/40'
                : 'bg-slate-900/95 border-amber-400 text-white shadow-slate-950/40'
            }`}
          >
            {/* Status / Content */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  foodScanError
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    : foodScanResult
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {foodScanError ? (
                  <AlertCircle size={20} className="text-rose-400" />
                ) : foodScanResult ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <Loader2 size={20} className="animate-spin text-amber-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black truncate">
                    {foodScanError
                      ? 'สแกนอาหารไม่สำเร็จ'
                      : foodScanResult
                      ? `บันทึกอาหารแล้ว (${foodScanResult.length} รายการ)`
                      : 'AI กำลังสแกนอาหารในพื้นหลัง...'}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 truncate">
                  {foodScanError
                    ? foodScanError
                    : foodScanResult
                    ? foodScanResult.map((f) => f.name).join(', ')
                    : foodScanStatus || 'คุณสามารถสลับหน้าอื่นได้ ระบบจะบันทึกให้อัตโนมัติ'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {foodScanResult && activeTab !== 'food' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('food');
                    dismissFoodScanResult();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Utensils size={12} />
                  <span>ดูบันทึก</span>
                </button>
              )}
              {(foodScanResult || foodScanError) && (
                <button
                  type="button"
                  onClick={dismissFoodScanResult}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white active:scale-95 transition cursor-pointer"
                  title="ปิดการแจ้งเตือน"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Selection Gate on Enter */}
      <ProfileGateModal isOpen={showProfileGate} onClose={handleCloseGate} />

      {/* AI Personal Trainer Interactive Modal */}
      <AiTrainerModal isOpen={showAiTrainer} onClose={() => setShowAiTrainer(false)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-28">
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'mascot' && <MascotBattleView />}
        {activeTab === 'game' && <PiggyRunView />}
        {activeTab === 'anatomy' && <AnatomyView />}
        {activeTab === 'exercises' && <ExercisesView />}
        {activeTab === 'food' && <FoodView />}
        {activeTab === 'stats' && <ProfileView />}
      </main>

      {/* Global Floating Rest Timer Widget (Visible across all tabs & persistent) */}
      {restTimerSeconds !== null && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-slideUp">
          <div
            className={`rounded-2xl border-2 backdrop-blur-md shadow-2xl p-3 flex items-center justify-between gap-2.5 transition-all ${
              isMaxnum
                ? 'bg-sky-900/95 border-sky-400 text-white shadow-sky-950/40'
                : 'bg-pink-900/95 border-pink-400 text-white shadow-pink-950/40'
            }`}
          >
            {/* Left: Clickable to jump to Workout Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('workout')}
              className="flex items-center gap-2.5 text-left flex-1 min-w-0 group cursor-pointer"
              title="แตะเพื่อกลับไปที่หน้าออกกำลังกาย"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  restTimerPaused
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : restTimerSeconds <= 5
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/15 text-white'
                }`}
              >
                <Timer
                  size={20}
                  className={!restTimerPaused && restTimerSeconds > 0 ? 'animate-spin' : ''}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black font-mono tracking-tight leading-none text-white drop-shadow-xs">
                    {formatSeconds(restTimerSeconds)}
                  </span>
                  {restTimerPaused && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40">
                      หยุดชั่วคราว
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-white/80 truncate flex items-center gap-1 group-hover:text-white transition">
                  <span>พักระหว่างเซ็ต</span>
                  {activeTab !== 'workout' && (
                    <span className="text-[10px] font-bold text-white/90 underline underline-offset-2 flex items-center">
                      กลับไปดู <ChevronRight size={12} />
                    </span>
                  )}
                </p>
              </div>
            </button>

            {/* Right: Quick Timer Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Play Minigame Button */}
              <button
                type="button"
                onClick={() => setIsGameOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:opacity-90 active:scale-95 text-slate-950 font-black text-xs transition cursor-pointer border border-yellow-300 shadow-xs flex items-center gap-1"
                title="เล่นมินิเกมหมูอ้วนรันระหว่างพัก"
              >
                <Gamepad2 size={14} className="animate-bounce" />
                <span className="hidden sm:inline">เล่นเกม 🎮</span>
              </button>

              {/* +30s */}
              <button
                type="button"
                onClick={() => addRestTimerSeconds(30)}
                className="px-2 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white transition cursor-pointer flex items-center gap-0.5 border border-white/20"
                title="เพิ่มเวลาพัก +30 วินาที"
              >
                <Plus size={12} />
                <span>30s</span>
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={toggleRestTimerPause}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition cursor-pointer border border-white/20"
                title={restTimerPaused ? 'จับเวลาต่อ' : 'หยุดเวลาชั่วคราว'}
              >
                {restTimerPaused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleRestTimerSound}
                className={`p-2 rounded-xl active:scale-95 transition cursor-pointer border ${
                  restTimerSound
                    ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}
                title={restTimerSound ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
              >
                {restTimerSound ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Skip / Close */}
              <button
                type="button"
                onClick={clearRestTimer}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white/70 hover:text-white active:scale-95 transition cursor-pointer border border-white/10"
                title="ข้าม / ปิดการพัก"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive AI Trainer Mascot Bubble (Kawaii Game Animated Button) */}
      <div
        className={`fixed right-4 sm:right-7 z-30 transition-all duration-300 ${
          restTimerSeconds !== null ? 'bottom-36' : 'bottom-24'
        }`}
      >
        <button
          onClick={() => setShowAiTrainer(true)}
          className={`group relative flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border-2 transition-all active:translate-y-1 active:shadow-xs cursor-pointer shadow-lg ${
            isMaxnum
              ? 'bg-white border-sky-300 text-slate-800 shadow-sky-200/60 hover:border-sky-400'
              : 'bg-white border-pink-300 text-slate-800 shadow-pink-200/60 hover:border-pink-400'
          }`}
          title="แตะเพื่อคุยกับโค้ชหมูอ้วน AI"
        >
          <div className="relative animate-wiggle">
            <PigMascot size="sm" expression={isMaxnum ? 'workout' : 'cheer'} className="drop-shadow-xs" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
              โค้ช AI <span className="animate-sparkle text-xs">✨</span>
            </span>
            <span
              className={`block text-[10px] font-bold leading-tight ${
                isMaxnum ? 'text-sky-600' : 'text-pink-600'
              }`}
            >
              {isMaxnum ? 'หมูอ้วนสายเวท 🏋️‍♂️' : 'หมูอ้วนเทรนเนอร์ 🌸'}
            </span>
          </div>
        </button>
      </div>

      {/* Global Piggy Run Modal (when opened from floating timer) */}
      <PiggyRunModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        restSeconds={restTimerSeconds}
        initialRestSeconds={restTimerSeconds ?? undefined}
      />

      {/* Floating Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

