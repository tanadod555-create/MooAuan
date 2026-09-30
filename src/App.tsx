import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/navigation/Header';
import { BottomNav, TabKey } from './components/navigation/BottomNav';
import { WorkoutView } from './views/WorkoutView';
import { AnatomyView } from './views/AnatomyView';
import { ExercisesView } from './views/ExercisesView';
import { FoodView } from './views/FoodView';
import { ProfileView } from './views/ProfileView';
import { ProfileGateModal } from './components/auth/ProfileGateModal';
import { AiTrainerModal } from './components/ai/AiTrainerModal';
import { PigMascot } from './components/ui/PigMascot';

export const MainContent: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-[#fff5f8] text-slate-700 flex flex-col font-sans selection:bg-pink-200 selection:text-slate-800 relative">
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-5 pt-4">
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'anatomy' && <AnatomyView />}
        {activeTab === 'exercises' && <ExercisesView />}
        {activeTab === 'food' && <FoodView />}
        {activeTab === 'stats' && <ProfileView />}
      </main>

      {/* Floating Interactive AI Trainer Mascot Bubble (Quick Access) */}
      <div className="fixed bottom-20 right-3.5 sm:right-6 z-30">
        <button
          onClick={() => setShowAiTrainer(true)}
          className="group relative flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-300/50 active:scale-95 transition cursor-pointer border-2 border-white/90"
          title="แตะเพื่อคุยกับโค้ชหมูอ้วน AI ได้ทุกเมื่อ"
        >
          <div className="relative">
            <PigMascot size="sm" expression="cheer" className="drop-shadow-xs" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black leading-tight">โค้ช AI 💬</span>
            <span className="block text-[9px] text-pink-100 font-medium leading-tight">หมูอ้วนเทรนเนอร์</span>
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
