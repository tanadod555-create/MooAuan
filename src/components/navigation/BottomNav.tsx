import React from 'react';
import { Dumbbell, Activity, BookOpen, UtensilsCrossed, BarChart3, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey = 'workout' | 'mascot' | 'food' | 'exercises' | 'anatomy' | 'stats';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { activeWorkout, activeProfileKey } = useApp();
  const isMaxnum = activeProfileKey === 'primary';

  const navItems = [
    { key: 'workout' as TabKey, label: 'ฝึกซ้อม', icon: Dumbbell, hasBadge: !!activeWorkout, emoji: '🏋️' },
    { key: 'mascot' as TabKey, label: 'หมูอ้วน', icon: Trophy, hasBadge: false, emoji: '🐷' },
    { key: 'food' as TabKey, label: 'อาหาร', icon: UtensilsCrossed, emoji: '🍱' },
    { key: 'exercises' as TabKey, label: 'คลังท่า', icon: BookOpen, emoji: '📖' },
    { key: 'anatomy' as TabKey, label: 'กายวิภาค', icon: Activity, emoji: '✨' },
    { key: 'stats' as TabKey, label: 'โปรไฟล์', icon: BarChart3, emoji: '⭐' },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md z-40 pb-safe pointer-events-none">
      <nav
        className={`rounded-3xl p-1.5 shadow-xl border-2 pointer-events-auto backdrop-blur-2xl transition-all duration-300 ${
          isMaxnum
            ? 'bg-white/95 border-sky-300 shadow-sky-200/50'
            : 'bg-white/95 border-pink-300 shadow-pink-200/50'
        }`}
      >
        <div className="grid grid-cols-6 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-90 ${
                  isActive
                    ? isMaxnum
                      ? 'bg-sky-400 text-white shadow-md shadow-sky-300/60 font-black scale-105'
                      : 'bg-pink-400 text-white shadow-md shadow-pink-300/60 font-black scale-105'
                    : isMaxnum
                    ? 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                    : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.6] animate-wiggle' : 'stroke-[2] group-hover:scale-110'
                    }`}
                  />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
                  )}
                </div>
                <span className={`text-[10px] leading-tight tracking-tight mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
