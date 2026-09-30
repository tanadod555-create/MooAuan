import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/navigation/Header';
import { BottomNav, TabKey } from './components/navigation/BottomNav';
import { WorkoutView } from './views/WorkoutView';
import { AnatomyView } from './views/AnatomyView';
import { ExercisesView } from './views/ExercisesView';
import { FoodView } from './views/FoodView';
import { ProfileView } from './views/ProfileView';

export const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('workout');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header */}
      <Header onOpenSettings={() => setActiveTab('stats')} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-5 pt-4">
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'anatomy' && <AnatomyView />}
        {activeTab === 'exercises' && <ExercisesView />}
        {activeTab === 'food' && <FoodView />}
        {activeTab === 'stats' && <ProfileView />}
      </main>

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
