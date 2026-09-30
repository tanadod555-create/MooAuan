import React from 'react';
import { Exercise } from '../../types';
import { MUSCLE_GROUPS } from '../../data/muscles';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 animate-slideUp">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
              {exercise.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
              {exercise.pattern}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
              {exercise.equipment}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Muscle Headline */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{exercise.name_en}</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg text-emerald-400 font-medium">{exercise.name_th}</span>
              <span className="text-xs text-slate-400 italic">· {primaryMuscle?.latinName}</span>
            </div>
          </div>

          {/* Posture Art / Line Diagram Simulation */}
          <div className="w-full h-36 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-center relative overflow-hidden p-4">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="flex flex-col items-center justify-center text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 text-emerald-400 glow-emerald">
                <Dumbbell size={28} />
              </div>
              <span className="text-xs font-medium text-slate-400">
                มัดหลัก: <strong className="text-white">{primaryMuscle?.nameTh}</strong> ({exercise.muscle_primary})
              </span>
              {exercise.muscle_secondary && exercise.muscle_secondary.length > 0 && (
                <span className="text-[11px] text-slate-500 mt-0.5">
                  มัดรอง: {exercise.muscle_secondary.map(m => MUSCLE_GROUPS[m]?.nameTh || m).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" />
                วิธีฝึกและขั้นตอนการเล่น
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                {exercise.instructions}
              </p>
            </div>
          )}

          {/* Technique */}
          {exercise.technique && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400" />
                เทคนิคการเกร็ง & ล็อกท่า
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20">
                {exercise.technique}
              </p>
            </div>
          )}

          {/* Feeling & Breathing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercise.feeling && (
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-pink-400 flex items-center gap-1.5 mb-1">
                  <HeartPulse size={14} />
                  ฟีลลิ่งที่ควรรู้สึก
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{exercise.feeling}</p>
              </div>
            )}
            {exercise.breathing && (
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                  <Wind size={14} />
                  การหายใจ (Breathing)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{exercise.breathing}</p>
              </div>
            )}
          </div>

          {/* Common Mistakes */}
          {exercise.mistakes && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={16} />
                ข้อผิดพลาดที่พบบ่อย (Common Mistakes)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/20">
                {exercise.mistakes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center gap-3">
          {onAddToWorkout && (
            <button
              onClick={() => {
                onAddToWorkout(exercise);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
            >
              <Plus size={18} />
              เพิ่มเข้าโปรแกรมวันนี้
            </button>
          )}
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
