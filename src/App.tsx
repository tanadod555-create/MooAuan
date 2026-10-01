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
      document.body.className = isMagnum ? 'theme-magnum' : 'theme-manow';
    }
  }, [isMagnum]);

  return (
    <div
      className={`min-h-screen ${
        isMagnum ? 'theme-magnum' : 'theme-manow'
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

      {/* Floating Interactive AI Trainer Mascot Bubble (Apple-style frosted chip) */}
      <div className="fixed bottom-24 right-4 sm:right-7 z-30">
        <button
          onClick={() => setShowAiTrainer(true)}
          className="group relative flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 cursor-pointer"
          title="แตะเพื่อคุยกับโค้ชหมูอ้วน AI"
        >
          <div className="relative">
            <PigMascot size="sm" expression={isMagnum ? 'workout' : 'cheer'} className="drop-shadow-2xs" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 ring-2 ring-white rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 ring-2 ring-white rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold text-zinc-900 leading-tight">โค้ช AI</span>
            <span className={`block text-[9px] font-medium leading-tight ${isMagnum ? 'text-blue-600' : 'text-rose-600'}`}>
              {isMagnum ? 'สายเวท' : 'เทรนเนอร์'}
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
