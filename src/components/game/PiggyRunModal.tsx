import React, { useState } from 'react';
import { PiggyRunCanvas } from './PiggyRunCanvas';
import { PiggyRunShop } from './PiggyRunShop';
import { X, Volume2, VolumeX, Timer, Bell, Sparkles } from 'lucide-react';
import { setGameSoundMuted, getGameSoundMuted } from './gameAudio';
import { CharacterType } from './gameTypes';

interface PiggyRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional Rest Timer Props (when playing during gym workout rest)
  restSeconds?: number | null;
  initialRestSeconds?: number;
  selectedCharacter?: CharacterType;
  initialTab?: 'game' | 'shop';
}

export const PiggyRunModal: React.FC<PiggyRunModalProps> = ({
  isOpen,
  onClose,
  restSeconds,
  initialRestSeconds,
  selectedCharacter,
  initialTab = 'game',
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'shop'>(initialTab);
  const [isMuted, setIsMuted] = useState(getGameSoundMuted());

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setGameSoundMuted(next);
  };

  const formatRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRestFinished = restSeconds === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-pink-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Gym Rest Timer Notification Banner (If active) */}
        {restSeconds !== undefined && restSeconds !== null && (
          <div
            className={`w-full px-4 py-2 text-xs flex items-center justify-between font-bold border-b transition-colors ${
              isRestFinished
                ? 'bg-amber-400 text-amber-950 border-amber-300 animate-pulse'
                : 'bg-slate-800 text-pink-300 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isRestFinished ? (
                <>
                  <Bell size={14} className="animate-bounce" />
                  <span>⏰ หมดเวลาพักแล้วหมูอ้วน! ไปยกเซตต่อไปได้เลย 💪</span>
                </>
              ) : (
                <>
                  <Timer size={14} className="text-pink-400 animate-spin" />
                  <span>เวลานับถอยหลังพักเซต: {formatRest(restSeconds)}</span>
                </>
              )}
            </div>

            {initialRestSeconds && !isRestFinished && (
              <span className="text-[10px] text-slate-400">
                (เต็ม {formatRest(initialRestSeconds)})
              </span>
            )}
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'game'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎮 วิ่งหมูอ้วน (Play)
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'shop'
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛍️ ร้านค้าสกิล (Shop)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-all"
              title="ปิดเกม"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-2 sm:p-4 overflow-y-auto">
          {activeTab === 'game' ? (
            <PiggyRunCanvas
              onOpenShop={() => setActiveTab('shop')}
              character={selectedCharacter}
            />
          ) : (
            <PiggyRunShop onBackToGame={() => setActiveTab('game')} />
          )}
        </div>
      </div>
    </div>
  );
};
