import React from 'react';
import { Exercise } from '../../types';
import { MUSCLE_GROUPS } from '../../data/muscles';
import { StickmanExerciseAnimation } from './StickmanExerciseAnimation';
import { X, Plus, Dumbbell, Sparkles, AlertCircle, Wind, HeartPulse, CheckCircle2 } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onAddToWorkout,
}) => {
  if (!exercise) return null;

  const primaryMuscle = MUSCLE_GROUPS[exercise.muscle_primary];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 animate-slideUp">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-200 bg-pink-50/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 capitalize">
              {exercise.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 capitalize">
              {exercise.pattern}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-pink-900 border border-pink-200 capitalize">
              {exercise.equipment}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-pink-400 hover:text-pink-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Muscle Headline */}
          <div>
            <h2 className="text-2xl font-black text-pink-950 tracking-tight">{exercise.name_en}</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg text-rose-600 font-bold">{exercise.name_th}</span>
              <span className="text-xs text-pink-700/70 italic">· {primaryMuscle?.latinName}</span>
            </div>
          </div>

          {/* Interactive Stickman Animation & Custom Media Slot */}
          <div className="space-y-2">
            <StickmanExerciseAnimation exercise={exercise} />
            <div className="flex items-center justify-between text-xs px-1 text-slate-500 flex-wrap gap-1">
              <span>
                มัดหลัก: <strong className="text-rose-600 font-bold">{primaryMuscle?.nameTh}</strong> ({exercise.muscle_primary})
              </span>
              {exercise.muscle_secondary && exercise.muscle_secondary.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  มัดรอง: {exercise.muscle_secondary.map((m) => MUSCLE_GROUPS[m]?.nameTh || m).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-pink-950 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-rose-500" />
                วิธีฝึกและขั้นตอนการเล่น
              </h3>
              <p className="text-sm text-pink-900/90 leading-relaxed bg-pink-50/60 p-4 rounded-2xl border border-pink-200">
                {exercise.instructions}
              </p>
            </div>
          )}

          {/* Technique */}
          {exercise.technique && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-pink-950 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                เทคนิคการเกร็ง & ล็อกท่า
              </h3>
              <p className="text-sm text-pink-900/90 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                {exercise.technique}
              </p>
            </div>
          )}

          {/* Feeling & Breathing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercise.feeling && (
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200">
                <h4 className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mb-1">
                  <HeartPulse size={14} />
                  ฟีลลิ่งที่ควรรู้สึก
                </h4>
                <p className="text-xs text-pink-900 leading-relaxed">{exercise.feeling}</p>
              </div>
            )}
            {exercise.breathing && (
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200">
                <h4 className="text-xs font-bold text-sky-700 flex items-center gap-1.5 mb-1">
                  <Wind size={14} />
                  การหายใจ (Breathing)
                </h4>
                <p className="text-xs text-pink-900 leading-relaxed">{exercise.breathing}</p>
              </div>
            )}
          </div>

          {/* Common Mistakes */}
          {exercise.mistakes && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                <AlertCircle size={16} />
                ข้อผิดพลาดที่พบบ่อย (Common Mistakes)
              </h3>
              <p className="text-sm text-rose-950 leading-relaxed bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
                {exercise.mistakes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-pink-200 bg-pink-50/80 backdrop-blur-md flex items-center gap-3">
          {onAddToWorkout && (
            <button
              onClick={() => {
                onAddToWorkout(exercise);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-200 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus size={18} />
              เพิ่มเข้าโปรแกรมวันนี้
            </button>
          )}
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-white hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold text-sm transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
