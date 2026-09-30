import React from 'react';
import { Dumbbell, Activity, BookOpen, UtensilsCrossed, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey = 'workout' | 'anatomy' | 'exercises' | 'food' | 'stats';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { activeWorkout } = useApp();

  const navItems = [
    { key: 'workout' as TabKey, label: 'ฝึกซ้อม', icon: Dumbbell, hasBadge: !!activeWorkout },
    { key: 'anatomy' as TabKey, label: 'กายวิภาค', icon: Activity },
    { key: 'exercises' as TabKey, label: 'คลังท่า', icon: BookOpen },
    { key: 'food' as TabKey, label: 'อาหาร', icon: UtensilsCrossed },
    { key: 'stats' as TabKey, label: 'โปรไฟล์', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-950" />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
