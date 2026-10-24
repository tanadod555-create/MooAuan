import React from 'react';
import { Dumbbell, Activity, BookOpen, UtensilsCrossed, BarChart3, Trophy, Gamepad2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey = 'workout' | 'mascot' | 'game' | 'food' | 'exercises' | 'anatomy' | 'stats';

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
    { key: 'game' as TabKey, label: 'เกม', icon: Gamepad2, hasBadge: false, emoji: '🎮' },
    { key: 'food' as TabKey, label: 'อาหาร', icon: UtensilsCrossed, emoji: '🍱' },
    { key: 'exercises' as TabKey, label: 'ท่าฝึก', icon: BookOpen, emoji: '📖' },
    { key: 'anatomy' as TabKey, label: 'กล้ามเนื้อ', icon: Activity, emoji: '✨' },
    { key: 'stats' as TabKey, label: 'โปรไฟล์', icon: BarChart3, emoji: '⭐' },
  ];

  return (
    <div className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-lg z-40 pb-safe pointer-events-none">
      <nav
        className={`rounded-[28px] p-1.5 shadow-2xl border-2 pointer-events-auto backdrop-blur-2xl transition-all duration-300 ${
          isMaxnum
            ? 'bg-white/95 border-sky-300 shadow-sky-300/30'
            : 'bg-white/95 border-pink-300 shadow-pink-300/30'
        }`}
      >
        <div className="grid grid-cols-7 items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`group relative flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-95 min-h-[48px] ${
                  isActive
                    ? isMaxnum
                      ? 'bg-gradient-to-b from-sky-400 to-blue-500 text-white shadow-md shadow-sky-300/60 font-black'
                      : 'bg-gradient-to-b from-pink-400 to-rose-400 text-white shadow-md shadow-pink-300/60 font-black'
                    : isMaxnum
                    ? 'text-slate-500 hover:text-sky-600 hover:bg-sky-50/70'
                    : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50/70'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.6] animate-wiggle' : 'stroke-[2] group-hover:scale-105'
                    }`}
                  />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
                  )}
                </div>
                <span className={`text-[9px] sm:text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-full ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/90" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
