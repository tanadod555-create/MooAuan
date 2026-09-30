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
  Sparkles
} from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

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

  // Sound synthesis via Web Audio API
  const playBeep = (freq = 550, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignored if user hasn't interacted or audio is blocked
    }
  };

  // Trigger beep on countdown 3, 2, 1 and finished 0
  useEffect(() => {
    if (seconds === null || isPaused) return;

    if (seconds !== lastSecondRef.current) {
      lastSecondRef.current = seconds;

      if (seconds === 3 || seconds === 2 || seconds === 1) {
        playBeep(520, 0.12);
        if (navigator.vibrate) navigator.vibrate(80);
      } else if (seconds === 0) {
        // High double-chime for finish
        playBeep(880, 0.3);
        setTimeout(() => playBeep(1046, 0.4), 200);
        if (navigator.vibrate) navigator.vibrate([150, 80, 150, 80, 300]);
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
          <div className="flex items-center justify-between bg-slate-950/80 rounded-xl p-3 border border-slate-800">
            {/* Big Countdown Number */}
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black font-mono tracking-tight ${
                  isFinished
                    ? 'text-emerald-400 animate-bounce'
                    : seconds <= 5
                    ? 'text-rose-400 animate-pulse'
                    : 'text-sky-400'
                }`}
              >
                {formatTime(seconds)}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {formatTime(initialSeconds)}
              </span>
            </div>

            {/* Quick adjust buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddSeconds(-15)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-xs font-semibold"
                title="ลด 15 วินาที"
              >
                -15s
              </button>
              <button
                onClick={() => onAddSeconds(30)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-xs font-semibold"
                title="เพิ่ม 30 วินาที"
              >
                +30s
              </button>
              <button
                onClick={() => onAddSeconds(60)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-xs font-semibold"
                title="เพิ่ม 60 วินาที"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-sky-400 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Play / Pause / Reset Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPauseToggle}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                isPaused
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
              }`}
            >
              {isPaused ? (
                <>
                  <Play size={14} className="fill-current" /> ทำงานต่อ (Resume)
                </>
              ) : (
                <>
                  <Pause size={14} className="fill-current" /> พักชั่วคราว (Pause)
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
              title="เริ่มนับใหม่"
            >
              <RotateCcw size={14} /> เริ่มใหม่
            </button>
          </div>
        </div>
      ) : null}

      {/* Preset Quick Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>เลือกเวลาพักด่วน:</span>
          {seconds !== null && <span className="text-[10px] text-sky-400 font-mono">กดเพื่อเริ่มนับใหม่ทันที</span>}
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESETS.map((p) => {
            const isSelected = initialSeconds === p.sec && seconds !== null;
            return (
              <button
                key={p.sec}
                onClick={() => onStart(p.sec)}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold transition active:scale-90 text-center ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/40'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-sky-500/30'
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
