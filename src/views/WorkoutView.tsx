import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise, WorkoutSet } from '../types';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import {
  Play,
  Check,
  Plus,
  Trash2,
  Clock,
  Timer,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Flame,
  Dumbbell,
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import { BorderBeam } from '../components/ui/BorderBeam';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { MagicCard } from '../components/ui/MagicCard';

export const WorkoutView: React.FC = () => {
  const {
    activeWorkout,
    startWorkout,
    cancelWorkout,
    finishWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    exercises,
    programs,
    workoutHistory,
  } = useApp();

  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerInitial, setRestTimerInitial] = useState(90);

  // Rest Timer Interval
  useEffect(() => {
    if (restTimerSeconds === null || restTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestTimerSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestTimerInitial(seconds);
    setRestTimerSeconds(seconds);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Launch a workout from routine template
  const handleStartProgram = (progId: string) => {
    const prog = programs.find((p) => p.program_id === progId);
    if (!prog) return;

    const matchedExercises: Exercise[] = [];
    if (prog.items) {
      prog.items.forEach((item) => {
        const found = exercises.find((e) => e.exercise_id === item.exercise_id);
        if (found) matchedExercises.push(found);
      });
    }

    startWorkout(prog.name, matchedExercises);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* If Active Workout is in progress: Show Hevy-style Session Logger */}
      {activeWorkout ? (
        <div className="space-y-4">
          {/* Active Workout Top Banner with 21st.dev BorderBeam */}
          <div className="relative bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl sticky top-16 z-30 overflow-hidden">
            <BorderBeam size={200} duration={5} colorFrom="#10b981" colorTo="#38bdf8" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    กำลังฝึกซ้อมอยู่ (Active)
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">{activeWorkout.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-sm font-mono font-bold text-emerald-400">
                  <Clock size={16} />
                  {formatSeconds(activeWorkout.elapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Rest Timer Floating Pill if active */}
            {restTimerSeconds !== null && restTimerSeconds > 0 && (
              <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-sky-500/40 flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Timer size={16} className="animate-spin text-sky-400" />
                  <span>เวลาพักระหว่างเซ็ต:</span>
                  <span className="text-base font-mono font-black text-white">
                    {formatSeconds(restTimerSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRestTimerSeconds((s) => (s ? s + 30 : 30))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setRestTimerSeconds(null)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-rose-400 hover:text-rose-300"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}

            {/* Session Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={finishWorkout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition"
              >
                <CheckCircle2 size={18} />
                เสร็จสิ้นการฝึก (บันทึก)
              </button>
              <button
                onClick={cancelWorkout}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 font-medium text-xs transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>

          {/* Exercise Cards in Workout */}
          {activeWorkout.exercises.map((item, exIdx) => {
            const exerciseData = exercises.find((e) => e.exercise_id === item.exercise_id);
            return (
              <div
                key={item.exercise_id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg"
              >
                {/* Exercise Header */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => exerciseData && setActiveExerciseModal(exerciseData)}
                    className="text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">#{exIdx + 1}</span>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                        {exerciseData?.name_en || item.exercise_id}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      {exerciseData?.name_th} · <span className="capitalize">{exerciseData?.equipment}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => removeExerciseFromWorkout(item.exercise_id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="ลบท่านี้ออกจากเซสชัน"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Sets Table */}
                <div className="p-3">
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 px-2 py-1 mb-1">
                    <span className="col-span-2 text-center">เซ็ต</span>
                    <span className="col-span-4 text-center">กก. (kg)</span>
                    <span className="col-span-3 text-center">ครั้ง (Reps)</span>
                    <span className="col-span-3 text-center">เสร็จ</span>
                  </div>

                  {item.sets.map((set, setIdx) => (
                    <div
                      key={set.set_id || setIdx}
                      className={`grid grid-cols-12 items-center gap-2 px-2 py-2 rounded-xl mb-1.5 transition ${
                        set.done
                          ? 'bg-emerald-500/10 border border-emerald-500/25'
                          : 'bg-slate-950/40 border border-slate-800/80'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            set.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {setIdx + 1}
                        </span>
                      </div>

                      {/* Weight (kg) */}
                      <div className="col-span-4 flex items-center justify-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weight_kg}
                          onChange={(e) =>
                            updateSet(item.exercise_id, setIdx, {
                              weight_kg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full max-w-[80px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* Reps */}
                      <div className="col-span-3 flex items-center justify-center">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(item.exercise_id, setIdx, {
                              reps: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full max-w-[65px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* Done Checkmark & Delete */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            const newDone = !set.done;
                            updateSet(item.exercise_id, setIdx, { done: newDone });
                            if (newDone) {
                              startRestTimer(restTimerInitial);
                            }
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90 ${
                            set.done
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Check size={16} />
                        </button>
                        {item.sets.length > 1 && (
                          <button
                            onClick={() => removeSetFromExercise(item.exercise_id, setIdx)}
                            className="p-1 text-slate-600 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <button
                      onClick={() => addSetToExercise(item.exercise_id)}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                    >
                      <Plus size={14} />
                      เพิ่มเซ็ต
                    </button>

                    {/* Quick Rest presets */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>พัก:</span>
                      <button
                        onClick={() => startRestTimer(60)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        60s
                      </button>
                      <button
                        onClick={() => startRestTimer(90)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        90s
                      </button>
                      <button
                        onClick={() => startRestTimer(120)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        2m
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Exercise into Active Workout */}
          <button
            onClick={() => setShowAddExerciseDrawer(true)}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus size={18} />
            เพิ่มท่าออกกำลังกายในเซสชันนี้
          </button>
        </div>
      ) : (
        /* If No Active Workout: Show Quick Start & Routine Programs */
        <div className="space-y-6">
          {/* Quick Start Card with 21st.dev MagicCard */}
          <MagicCard spotlightColor="rgba(16, 185, 129, 0.2)" className="p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Flame size={140} className="text-emerald-400" />
            </div>
            <div className="relative z-10 max-w-md">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                พร้อมฝึกซ้อมหรือยัง?
              </span>
              <h2 className="text-2xl font-black text-white mt-2">เริ่มเซสชันแบบเปิด (Empty Workout)</h2>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                เริ่มยกเวททันที แล้วเลือกท่าฝึกที่ต้องการแบบยืดหยุ่น ติ๊กเซ็ตและน้ำหนักเรียลไทม์
              </p>
              <div className="mt-5">
                <ShimmerButton
                  onClick={() => startWorkout('การฝึกวันนี้')}
                  shimmerColor="#34d399"
                  className="py-1"
                >
                  <Play size={16} fill="currentColor" />
                  <span className="font-bold">เริ่มเซสชันใหม่เดี๋ยวนี้</span>
                </ShimmerButton>
              </div>
            </div>
          </MagicCard>

          {/* Routine Programs (Push / Pull / Legs) using 21st.dev BentoGrid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-emerald-400" />
                โปรแกรมการฝึกประจำสัปดาห์ (Routines)
              </h3>
              <span className="text-xs text-slate-400">{programs.length} โปรแกรม</span>
            </div>

            <BentoGrid>
              {programs.map((prog) => (
                <BentoCard
                  key={prog.program_id}
                  title={prog.name}
                  subtitle={prog.note}
                  badge={prog.day_of_week || 'ตาราง'}
                  icon={<Dumbbell size={16} />}
                >
                  <div className="space-y-3 mt-1">
                    {/* Preview exercises in routine */}
                    <div className="space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                      {prog.items?.slice(0, 3).map((item, idx) => {
                        const ex = exercises.find((e) => e.exercise_id === item.exercise_id);
                        return (
                          <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="truncate">{ex?.name_th || item.exercise_id}</span>
                            <span className="text-slate-500 font-mono">
                              ({item.target_sets}x{item.target_reps})
                            </span>
                          </div>
                        );
                      })}
                      {prog.items && prog.items.length > 3 && (
                        <span className="text-[11px] text-slate-500 block pl-3">
                          +{prog.items.length - 3} ท่าเพิ่มเติม
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartProgram(prog.program_id)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Play size={14} fill="currentColor" />
                      เริ่มเล่นตามโปรแกรมนี้
                    </button>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </div>

          {/* Past Workout History List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              ประวัติการฝึกซ้อมที่ผ่านมา ({workoutHistory.length})
            </h3>

            {workoutHistory.length === 0 ? (
              <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                <Dumbbell size={32} className="mx-auto text-slate-600" />
                <p className="text-sm text-slate-400">ยังไม่มีประวัติการฝึกซ้อม</p>
                <p className="text-xs text-slate-500">กดเริ่มฝึกเพื่อบันทึกประวัติลง Google Sheet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutHistory.map((sess) => {
                  const completedSets = sess.sets?.filter((s) => s.done) || [];
                  const totalVolumeKg = completedSets.reduce(
                    (sum, s) => sum + s.weight_kg * s.reps,
                    0
                  );
                  return (
                    <div
                      key={sess.session_id}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {sess.program_name || 'เซสชันการฝึก'}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {sess.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          เวลา: {sess.start_time} - {sess.end_time || 'เสร็จสิ้น'} · {completedSets.length} เซ็ตสำเร็จ
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Volume</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {totalVolumeKg.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Exercise Modal / Drawer */}
      {showAddExerciseDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowAddExerciseDrawer(false)} />
          <div className="relative w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base">เลือกท่าออกกำลังกาย</h3>
              <button
                onClick={() => setShowAddExerciseDrawer(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ปิด
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {exercises.map((ex) => (
                <div
                  key={ex.exercise_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{ex.name_en}</h4>
                    <p className="text-xs text-slate-400">
                      {ex.name_th} · <span className="capitalize">{ex.muscle_primary}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addExerciseToWorkout(ex);
                      setShowAddExerciseDrawer(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={14} />
                    เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <ExerciseDetailModal
          exercise={activeExerciseModal}
          onClose={() => setActiveExerciseModal(null)}
          onAddToWorkout={(ex) => addExerciseToWorkout(ex)}
        />
      )}
    </div>
  );
};
