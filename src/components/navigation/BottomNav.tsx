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
  const isMagnum = activeProfileKey === 'primary';

  const navItems = [
    { key: 'workout' as TabKey, label: 'ฝึกซ้อม', icon: Dumbbell, hasBadge: !!activeWorkout },
    { key: 'mascot' as TabKey, label: 'หมูอ้วน', icon: Trophy, hasBadge: false },
    { key: 'food' as TabKey, label: 'อาหาร', icon: UtensilsCrossed },
    { key: 'exercises' as TabKey, label: 'คลังท่า', icon: BookOpen },
    { key: 'anatomy' as TabKey, label: 'กายวิภาค', icon: Activity },
    { key: 'stats' as TabKey, label: 'โปรไฟล์', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md z-40 pb-safe pointer-events-none">
      <nav className="glass-apple-nav rounded-full p-1.5 shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12)] border border-black/[0.08] pointer-events-auto">
        <div className="grid grid-cols-6 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer select-none active:scale-90 ${
                  isActive
                    ? isMagnum
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.04]'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                  />
                  {item.hasBadge && (
                    <span
                      className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                        isMagnum ? 'bg-sky-400' : 'bg-rose-400'
                      }`}
                    />
                  )}
                </div>
                <span className={`text-[10px] leading-tight tracking-tight mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>
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
