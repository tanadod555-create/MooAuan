import React, { useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  Bell,
} from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';
import {
  playGymAlertSound,
  triggerMobileVibrate,
  sendBackgroundNotification,
  requestNotificationPermission,
} from '../../utils/backgroundTimer';

interface RestTimerProps {
  seconds: number | null;
  initialSeconds: number;
  isPaused: boolean;
  soundEnabled: boolean;
  onStart: (seconds: number) => void;
  onPauseToggle: () => void;
  onAddSeconds: (delta: number) => void;
  onReset: () => void;
  onClose: () => void;
  onSoundToggle: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  seconds,
  initialSeconds,
  isPaused,
  soundEnabled,
  onStart,
  onPauseToggle,
  onAddSeconds,
  onReset,
  onClose,
  onSoundToggle,
}) => {
  const lastSecondRef = useRef<number | null>(null);

  // Trigger beep on countdown 3, 2, 1 and finished 0
  useEffect(() => {
    if (seconds === null || isPaused) return;

    if (seconds !== lastSecondRef.current) {
      lastSecondRef.current = seconds;

      if (seconds === 3 || seconds === 2 || seconds === 1) {
        if (soundEnabled) playGymAlertSound('warning');
        triggerMobileVibrate([80]);
      } else if (seconds === 0) {
        if (soundEnabled) playGymAlertSound('finish');
        triggerMobileVibrate([200, 100, 200, 100, 400]);
        sendBackgroundNotification(
          '⏰ หมดเวลาพักแล้วหมูอ้วน! ยกเซตต่อไปได้เลย 💪',
          'พักครบตามเวลาแล้ว ลุยต่อเลย!'
        );
      }
    }
  }, [seconds, isPaused, soundEnabled]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const PRESETS = [
    { label: '30 วิ', sec: 30 },
    { label: '45 วิ', sec: 45 },
    { label: '60 วิ', sec: 60 },
    { label: '90 วิ', sec: 90 },
    { label: '2 นาที', sec: 120 },
    { label: '3 นาที', sec: 180 },
  ];

  const progressPercent =
    seconds !== null && initialSeconds > 0
      ? Math.max(0, Math.min(100, ((initialSeconds - seconds) / initialSeconds) * 100))
      : 0;

  const isFinished = seconds === 0;

  return (
    <div className="bg-white/95 border border-pink-300 rounded-3xl p-4 shadow-xl shadow-pink-200/50 backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <PigMascot
            size="sm"
            expression={isFinished ? 'cheer' : isPaused ? 'sleep' : 'workout'}
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>เวลาพักหมูอ้วน (Rest Timer) 🐷</span>
              {isFinished && (
                <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200 animate-pulse">
                  ลุยต่อเลยหมูอ้วน! 🔥
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500">พักให้กล้ามเนื้อฟื้นตัวแล้วจัดเซ็ตต่อไป</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onSoundToggle}
            className={`p-1.5 rounded-lg text-xs transition ${
              soundEnabled ? 'text-sky-400 hover:bg-sky-500/10' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          {seconds !== null && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="ปิดนาฬิกา"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Countdown Display */}
      {seconds !== null ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-pink-50/80 rounded-2xl p-3.5 border border-pink-200">
            {/* Big Countdown Number */}
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                  isFinished
                    ? 'text-rose-600 animate-bounce'
                    : seconds <= 5
                    ? 'text-rose-600 animate-pulse'
                    : 'text-rose-500'
                }`}
              >
                {formatTime(seconds)}
              </span>
              <span className="text-xs text-pink-700/60 font-mono font-bold">
                / {formatTime(initialSeconds)}
              </span>
            </div>

            {/* Quick adjust buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onAddSeconds(-15)}
                className="px-3 py-2 bg-white border border-pink-200 hover:bg-pink-100 active:scale-90 text-pink-900 rounded-xl text-xs font-black shadow-xs min-h-[40px] flex items-center justify-center cursor-pointer"
                title="ลด 15 วินาที"
              >
                -15s
              </button>
              <button
                onClick={() => onAddSeconds(30)}
                className="px-3 py-2 bg-white border border-pink-200 hover:bg-pink-100 active:scale-90 text-pink-900 rounded-xl text-xs font-black shadow-xs min-h-[40px] flex items-center justify-center cursor-pointer"
                title="เพิ่ม 30 วินาที"
              >
                +30s
              </button>
              <button
                onClick={() => onAddSeconds(60)}
                className="px-3 py-2 bg-white border border-pink-200 hover:bg-pink-100 active:scale-90 text-pink-900 rounded-xl text-xs font-black shadow-xs min-h-[40px] flex items-center justify-center cursor-pointer"
                title="เพิ่ม 60 วินาที"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-pink-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFinished ? 'bg-rose-500' : 'bg-gradient-to-r from-pink-400 to-rose-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Prominent Skip Rest Button requested by user */}
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 active:scale-[0.98] transition cursor-pointer"
          >
            <Sparkles size={18} />
            <span>ข้ามการพัก / พร้อมลุยต่อเลย ⚡</span>
          </button>

          {/* Play / Pause / Reset Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPauseToggle}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
                isPaused
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-white hover:bg-pink-50 text-pink-900 border-pink-200'
              }`}
            >
              {isPaused ? (
                <>
                  <Play size={16} className="fill-current" /> ทำงานต่อ (Resume)
                </>
              ) : (
                <>
                  <Pause size={16} className="fill-current" /> พักชั่วคราว (Pause)
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="min-h-[44px] py-2.5 px-3.5 bg-white hover:bg-pink-50 active:scale-95 text-pink-800 border border-pink-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              title="เริ่มนับใหม่"
            >
              <RotateCcw size={16} /> เริ่มใหม่
            </button>
          </div>
        </div>
      ) : null}

      {/* Preset Quick Buttons */}
      <div className="mt-3 pt-3 border-t border-pink-200">
        <div className="text-[11px] font-bold text-pink-800 mb-2 flex items-center justify-between">
          <span>เลือกเวลาพักด่วน:</span>
          {seconds !== null && <span className="text-[10px] text-rose-500 font-bold">กดเพื่อเริ่มนับใหม่ทันที</span>}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const isSelected = initialSeconds === p.sec && seconds !== null;
            return (
              <button
                key={p.sec}
                onClick={() => {
                  requestNotificationPermission();
                  onStart(p.sec);
                }}
                className={`min-h-[44px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-black transition active:scale-95 text-center cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300'
                    : 'bg-pink-50/80 hover:bg-pink-100 text-pink-900 border border-pink-200 shadow-2xs'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
