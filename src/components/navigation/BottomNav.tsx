import React from 'react';
import { Dumbbell, Activity, BookOpen, UtensilsCrossed, BarChart3, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey = 'workout' | 'mascot' | 'food' | 'exercises' | 'anatomy' | 'stats';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { activeWorkout } = useApp();

  const navItems = [
    { key: 'workout' as TabKey, label: 'ฝึกซ้อม', icon: Dumbbell, hasBadge: !!activeWorkout },
    { key: 'mascot' as TabKey, label: 'หมูอ้วน 🐷', icon: Trophy, hasBadge: false },
    { key: 'food' as TabKey, label: 'อาหาร', icon: UtensilsCrossed },
    { key: 'exercises' as TabKey, label: 'คลังท่า', icon: BookOpen },
    { key: 'anatomy' as TabKey, label: 'กายวิภาค', icon: Activity },
    { key: 'stats' as TabKey, label: 'โปรไฟล์', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-pink-200/80 pb-safe shadow-[0_-4px_20px_rgba(244,114,182,0.12)]">
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-pink-600 font-bold' : 'text-pink-900/40 hover:text-pink-700'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${isActive ? 'scale-115 text-pink-500' : ''}`}
                />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-[3px] bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
