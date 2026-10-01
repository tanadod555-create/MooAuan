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
import { ProfileGateModal } from './components/auth/ProfileGateModal';
import { AiTrainerModal } from './components/ai/AiTrainerModal';
import { PigMascot } from './components/ui/PigMascot';

export const MainContent: React.FC = () => {
  const { activeProfileKey } = useApp();
  const isMagnum = activeProfileKey === 'primary';

  const [activeTab, setActiveTab] = useState<TabKey>('workout');
  const [showAiTrainer, setShowAiTrainer] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState<boolean>(() => {
    // Show on entering website unless previously confirmed in this session
    return !sessionStorage.getItem('ft_profile_selected_session');
  });

  const handleCloseGate = () => {
    sessionStorage.setItem('ft_profile_selected_session', 'true');
    setShowProfileGate(false);
  };

  // Sync theme class to document body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = isMagnum ? 'theme-maxnum' : 'theme-manow';
    }
  }, [isMagnum]);

  return (
    <div
      className={`min-h-screen ${
        isMagnum ? 'theme-maxnum' : 'theme-manow'
      } flex flex-col font-sans relative transition-colors duration-300`}
    >
      {/* Top Header */}
      <Header
        onOpenSettings={() => setActiveTab('stats')}
        onOpenProfileModal={() => setShowProfileGate(true)}
        onOpenAiTrainer={() => setShowAiTrainer(true)}
      />

      {/* Profile Selection Gate on Enter */}
      <ProfileGateModal isOpen={showProfileGate} onClose={handleCloseGate} />

      {/* AI Personal Trainer Interactive Modal */}
      <AiTrainerModal isOpen={showAiTrainer} onClose={() => setShowAiTrainer(false)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-28">
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'mascot' && <MascotBattleView />}
        {activeTab === 'anatomy' && <AnatomyView />}
        {activeTab === 'exercises' && <ExercisesView />}
        {activeTab === 'food' && <FoodView />}
        {activeTab === 'stats' && <ProfileView />}
      </main>

      {/* Floating Interactive AI Trainer Mascot Bubble (Kawaii Game Animated Button) */}
      <div className="fixed bottom-24 right-4 sm:right-7 z-30">
        <button
          onClick={() => setShowAiTrainer(true)}
          className={`group relative flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border-2 transition-all active:translate-y-1 active:shadow-xs cursor-pointer shadow-lg ${
            isMagnum
              ? 'bg-white border-sky-300 text-slate-800 shadow-sky-200/60 hover:border-sky-400'
              : 'bg-white border-pink-300 text-slate-800 shadow-pink-200/60 hover:border-pink-400'
          }`}
          title="แตะเพื่อคุยกับโค้ชหมูอ้วน AI"
        >
          <div className="relative animate-wiggle">
            <PigMascot size="sm" expression={isMagnum ? 'workout' : 'cheer'} className="drop-shadow-xs" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
              โค้ช AI <span className="animate-sparkle text-xs">✨</span>
            </span>
            <span
              className={`block text-[10px] font-bold leading-tight ${
                isMagnum ? 'text-sky-600' : 'text-pink-600'
              }`}
            >
              {isMagnum ? 'หมูอ้วนสายเวท 🏋️‍♂️' : 'หมูอ้วนเทรนเนอร์ 🌸'}
            </span>
          </div>
        </button>
      </div>

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
