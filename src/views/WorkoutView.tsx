import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise, WorkoutSet, Program } from '../types';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import {
  Play,
  Pause,
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
  ListPlus,
  X,
  Search,
  Edit2,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { RestTimer } from '../components/workout/RestTimer';
import { RoutineEditModal } from '../components/workout/RoutineEditModal';
import { WorkoutHistorySection } from '../components/workout/WorkoutHistorySection';
import { PigMascot } from '../components/ui/PigMascot';

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
    addProgram,
    updateProgram,
    deleteProgram,
    workoutHistory,
    allWorkoutHistory,
    activeProfileKey,
    currentProfile,
    openUnifiedSpreadsheet,
  } = useApp();

  const [workoutTab, setWorkoutTab] = useState<'workout' | 'history'>('workout');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerMuscle, setDrawerMuscle] = useState<string>('all');
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerInitial, setRestTimerInitial] = useState(90);
  const [restTimerPaused, setRestTimerPaused] = useState(false);
  const [restTimerSound, setRestTimerSound] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Standard Rest Time Selector State (e.g. 45s, 60s, 90s, 120s, 180s)
  const [standardRestSeconds, setStandardRestSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mooauan_standard_rest');
      if (saved) return Number(saved);
    }
    return 90;
  });

  const handleSelectStandardRest = (sec: number) => {
    setStandardRestSeconds(sec);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mooauan_standard_rest', String(sec));
    }
  };

  // Routine search and editing state
  const [routineSearchQuery, setRoutineSearchQuery] = useState('');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // Rest Timer Interval
  useEffect(() => {
    if (restTimerSeconds === null || restTimerPaused || restTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestTimerSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerSeconds, restTimerPaused]);

  const startRestTimer = (seconds: number) => {
    setRestTimerInitial(seconds);
    setRestTimerSeconds(seconds);
    setRestTimerPaused(false);
    // On mobile, keep floating notification unless user opens full panel
  };

  const handleAddSeconds = (delta: number) => {
    setRestTimerSeconds((prev) => {
      const current = prev ?? restTimerInitial;
      return Math.max(0, current + delta);
    });
  };

  const handleResetTimer = () => {
    setRestTimerSeconds(restTimerInitial);
    setRestTimerPaused(false);
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

  const filteredPrograms = programs.filter((p) => {
    if (!routineSearchQuery.trim()) return true;
    const q = routineSearchQuery.toLowerCase().trim();
    const matchName = p.name.toLowerCase().includes(q);
    const matchNote = (p.note || '').toLowerCase().includes(q);
    const matchDay = (p.day_of_week || '').toLowerCase().includes(q);
    const matchExercise = p.items?.some((it) => {
      const ex = exercises.find((e) => e.exercise_id === it.exercise_id);
      return (
        Boolean(ex?.name_en.toLowerCase().includes(q)) ||
        Boolean(ex?.name_th.includes(q))
      );
    });
    return matchName || matchNote || matchDay || matchExercise;
  });

  const MUSCLE_FILTER_CHIPS = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'chest', label: 'อก' },
    { key: 'back', label: 'หลัง' },
    { key: 'shoulders', label: 'ไหล่' },
    { key: 'legs', label: 'ขา / ก้น' },
    { key: 'biceps', label: 'หน้าแขน' },
    { key: 'triceps', label: 'หลังแขน' },
    { key: 'core', label: 'หน้าท้อง' },
  ];

  const drawerFilteredExercises = exercises.filter((ex) => {
    const q = drawerSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name_en.toLowerCase().includes(q) ||
      ex.name_th.toLowerCase().includes(q) ||
      ex.muscle_primary.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q);

    let matchesMuscle = true;
    if (drawerMuscle === 'legs') {
      matchesMuscle = ['quads', 'hamstrings', 'glutes', 'calves', 'legs'].includes(
        ex.muscle_primary
      );
    } else if (drawerMuscle === 'core') {
      matchesMuscle = ['abs', 'core', 'obliques'].includes(ex.muscle_primary);
    } else if (drawerMuscle !== 'all') {
      matchesMuscle =
        ex.muscle_primary.toLowerCase() === drawerMuscle ||
        Boolean(ex.muscle_secondary?.some((m) => m.toLowerCase().includes(drawerMuscle)));
    }

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Top Tab Switcher: Workout vs History (Pastel Pink) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/95 border border-pink-200/90 rounded-2xl shadow-xs">
        <button
          onClick={() => setWorkoutTab('workout')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            workoutTab === 'workout'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200'
              : 'text-pink-900/70 hover:text-slate-700 hover:bg-pink-50/60'
          }`}
        >
          <Dumbbell size={16} />
          <span>ออกกำลังกาย / ซ้อม</span>
          {activeWorkout && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping ml-1" />
          )}
        </button>

        <button
          onClick={() => setWorkoutTab('history')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            workoutTab === 'history'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200'
              : 'text-pink-900/70 hover:text-slate-700 hover:bg-pink-50/60'
          }`}
        >
          <Clock size={16} />
          <span>ประวัติการฝึกซ้อม</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-mono font-bold">
            {allWorkoutHistory.length}
          </span>
        </button>
      </div>

      {/* Active Workout Notification Bar while on History Tab */}
      {activeWorkout && workoutTab === 'history' && (
        <div className="p-3 bg-pink-50 border border-pink-300 rounded-2xl flex items-center justify-between gap-3 animate-pulse shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-700 font-bold">กำลังฝึก: {activeWorkout.name}</span>
            <span className="text-rose-600 font-mono font-bold">
              ({formatSeconds(activeWorkout.elapsedSeconds)})
            </span>
          </div>
          <button
            onClick={() => setWorkoutTab('workout')}
            className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-xl hover:from-rose-600 hover:to-pink-600 transition"
          >
            กลับสู่การซ้อม →
          </button>
        </div>
      )}

      {workoutTab === 'history' ? (
        <WorkoutHistorySection
          onStartRoutineWithExercises={(name, exs) => {
            setWorkoutTab('workout');
            startWorkout(name, exs);
          }}
        />
      ) : activeWorkout ? (
        <div className="space-y-4">
          {/* Active Workout Top Banner (Pastel Pink & Soft Cream) */}
          <div className="relative bg-white/95 border border-pink-300 rounded-3xl p-5 shadow-sm shadow-pink-100 backdrop-blur-xl sticky top-16 z-30 overflow-hidden">
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    กำลังฝึกซ้อมอยู่ (Active Session)
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-700 mt-1">{activeWorkout.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Rest Timer Button in header */}
                <button
                  onClick={() => setShowRestTimer((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold transition active:scale-95 ${
                    restTimerSeconds !== null && restTimerSeconds > 0
                      ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200'
                      : showRestTimer
                      ? 'bg-pink-100 border-rose-300 text-rose-700'
                      : 'bg-pink-50/80 border-pink-200 text-pink-900 hover:bg-pink-100'
                  }`}
                  title="เปิด/ปิดนาฬิกาจับเวลาพัก"
                >
                  <Timer
                    size={16}
                    className={
                      restTimerSeconds !== null && !restTimerPaused && restTimerSeconds > 0
                        ? 'animate-spin text-rose-500'
                        : 'text-rose-500'
                    }
                  />
                  <span>
                    {restTimerSeconds !== null ? formatSeconds(restTimerSeconds) : 'จับเวลาพัก'}
                  </span>
                </button>

                <div className="bg-pink-50 px-3 py-2 rounded-xl border border-pink-200 flex items-center gap-1.5 text-sm font-mono font-bold text-slate-700">
                  <Clock size={16} className="text-rose-500" />
                  {formatSeconds(activeWorkout.elapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Standard Rest Time Selector Card requested by user */}
            <div className="mt-3.5 pt-3 border-t border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Timer size={15} className="text-rose-500" />
                <span className="text-xs font-bold text-slate-700">
                  เวลาพักมาตรฐาน (จะเริ่มนับถอยหลังทันทีเมื่อติ๊กเสร็จเซ็ต):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '45 วิ', sec: 45 },
                  { label: '60 วิ', sec: 60 },
                  { label: '90 วิ (แนะนำ)', sec: 90 },
                  { label: '2 นาที', sec: 120 },
                  { label: '3 นาที', sec: 180 },
                ].map((p) => (
                  <button
                    key={p.sec}
                    onClick={() => handleSelectStandardRest(p.sec)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                      standardRestSeconds === p.sec
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rest Timer Panel (Expanded or Active) */}
            {showRestTimer && (
              <div className="mt-4 pt-3 border-t border-pink-200 animate-fadeIn">
                <RestTimer
                  seconds={restTimerSeconds}
                  initialSeconds={restTimerInitial}
                  isPaused={restTimerPaused}
                  soundEnabled={restTimerSound}
                  onStart={startRestTimer}
                  onPauseToggle={() => setRestTimerPaused((p) => !p)}
                  onAddSeconds={handleAddSeconds}
                  onReset={handleResetTimer}
                  onClose={() => {
                    setRestTimerSeconds(null);
                    setShowRestTimer(false);
                  }}
                  onSoundToggle={() => setRestTimerSound((s) => !s)}
                />
              </div>
            )}

            {/* Session Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-pink-100">
              <button
                onClick={finishWorkout}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-200 active:scale-[0.98] transition cursor-pointer"
              >
                <CheckCircle2 size={18} />
                เสร็จสิ้นการฝึก (บันทึกลง Sheet)
              </button>
              <button
                onClick={cancelWorkout}
                className="py-3 px-3.5 rounded-xl bg-pink-50 hover:bg-rose-100 text-pink-800 hover:text-rose-700 font-bold text-xs border border-pink-200 transition cursor-pointer"
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
                className="bg-white/95 rounded-3xl border border-pink-200/90 overflow-hidden shadow-sm shadow-pink-100/50"
              >
                {/* Exercise Header */}
                <div className="p-4 bg-pink-50/70 border-b border-pink-200/80 flex items-center justify-between">
                  <button
                    onClick={() => exerciseData && setActiveExerciseModal(exerciseData)}
                    className="text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        #{exIdx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-700 group-hover:text-rose-600 transition">
                        {exerciseData?.name_en || item.exercise_id}
                      </h3>
                    </div>
                    <span className="text-xs text-pink-800/70 mt-0.5 block">
                      {exerciseData?.name_th} · <span className="capitalize">{exerciseData?.equipment}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => removeExerciseFromWorkout(item.exercise_id)}
                    className="p-2 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer active:scale-95"
                    title="ลบท่านี้ออกจากเซสชัน"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Sets Table (Mobile-friendly generous touch targets) */}
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-12 text-xs font-bold text-pink-900/80 px-2 py-1 mb-1.5">
                    <span className="col-span-2 text-center">เซ็ต</span>
                    <span className="col-span-4 text-center">กก. (kg)</span>
                    <span className="col-span-3 text-center">ครั้ง (Reps)</span>
                    <span className="col-span-3 text-center">สำเร็จ</span>
                  </div>

                  {item.sets.map((set, setIdx) => (
                    <div
                      key={set.set_id || setIdx}
                      className={`grid grid-cols-12 items-center gap-2 px-2 py-2 rounded-2xl mb-2 transition ${
                        set.done
                          ? 'bg-rose-50/80 border border-rose-300'
                          : 'bg-pink-50/40 border border-pink-200/70'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                            set.done
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-pink-100 text-pink-900'
                          }`}
                        >
                          {setIdx + 1}
                        </span>
                      </div>

                      {/* Weight (kg) - 44px min height for touch */}
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
                          className="w-full max-w-[90px] h-11 bg-white border border-pink-200 rounded-xl px-2 text-center text-base font-bold font-mono text-slate-700 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Reps - 44px min height for touch */}
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
                          className="w-full max-w-[75px] h-11 bg-white border border-pink-200 rounded-xl px-2 text-center text-base font-bold font-mono text-slate-700 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Done Checkmark & Delete - 44px touch target */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            const newDone = !set.done;
                            updateSet(item.exercise_id, setIdx, { done: newDone });
                            if (newDone) {
                              startRestTimer(standardRestSeconds);
                            }
                          }}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition active:scale-90 cursor-pointer ${
                            set.done
                              ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-200'
                              : 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200'
                          }`}
                          title={set.done ? 'เซ็ตนี้เสร็จแล้ว (แตะเพื่อยกเลิก)' : 'แตะเพื่อติ๊กเสร็จเซ็ตและเริ่มพัก'}
                        >
                          <Check size={20} className="stroke-[3]" />
                        </button>
                        {item.sets.length > 1 && (
                          <button
                            onClick={() => removeSetFromExercise(item.exercise_id, setIdx)}
                            className="p-1.5 text-pink-400 hover:text-rose-600"
                            title="ลบเซ็ตนี้"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Set Button (Clean & prominent, quick rest sub-buttons removed as requested) */}
                  <div className="mt-2.5 flex items-center justify-between pt-1">
                    <button
                      onClick={() => addSetToExercise(item.exercise_id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition active:scale-95 cursor-pointer"
                    >
                      <Plus size={16} />
                      เพิ่มเซ็ต
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Exercise into Active Workout */}
          <button
            onClick={() => setShowAddExerciseDrawer(true)}
            className="w-full py-4 rounded-3xl bg-white hover:bg-pink-50/80 border-2 border-dashed border-pink-300 text-slate-700 hover:text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus size={18} />
            เพิ่มท่าออกกำลังกายในเซสชันนี้
          </button>

          {/* Floating Sticky Rest Timer Widget (Prominent Cancel/Skip Button) */}
          {restTimerSeconds !== null && !showRestTimer && (
            <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white/98 border-2 border-rose-400 rounded-3xl p-3.5 shadow-2xl shadow-rose-200/60 backdrop-blur-xl animate-fadeIn">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div
                  onClick={() => setShowRestTimer(true)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <Timer
                    size={22}
                    className={`text-rose-500 ${
                      !restTimerPaused && restTimerSeconds > 0 ? 'animate-spin' : ''
                    }`}
                  />
                  <div>
                    <span className="text-[10px] text-pink-700 font-bold block uppercase tracking-wider">
                      เวลาพักระหว่างเซ็ต 🐷
                    </span>
                    <span
                      className={`text-2xl font-black font-mono leading-none ${
                        restTimerSeconds === 0 ? 'text-rose-600 animate-bounce' : 'text-slate-700'
                      }`}
                    >
                      {restTimerSeconds === 0 ? 'ลุยต่อเลย!' : formatSeconds(restTimerSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddSeconds(30)}
                    className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 active:scale-90 text-xs font-bold text-pink-900 border border-pink-200 rounded-xl"
                    title="เพิ่ม 30 วินาที"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setRestTimerPaused((p) => !p)}
                    className="p-2 bg-pink-50 hover:bg-pink-100 active:scale-90 text-pink-900 border border-pink-200 rounded-xl"
                    title={restTimerPaused ? 'ทำงานต่อ' : 'พักชั่วคราว'}
                  >
                    {restTimerPaused ? (
                      <Play size={14} className="fill-current text-rose-500" />
                    ) : (
                      <Pause size={14} className="fill-current text-pink-800" />
                    )}
                  </button>
                </div>
              </div>

              {/* Large Skip Rest Button as requested by user */}
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-200 active:scale-[0.98] transition cursor-pointer"
              >
                <span>ข้ามการพัก / พร้อมลุยต่อเลย ⚡</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* If No Active Workout: Show Quick Start & Routine Programs */
        <div className="space-y-6">
          {/* Cute Pig Mascot Welcome Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-100/90 via-pink-50/80 to-rose-100/90 border border-pink-200/90 shadow-sm shadow-pink-200/40 flex items-center gap-3.5">
            <PigMascot size="lg" expression="workout" className="shrink-0 drop-shadow-sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                  หมูอ้วนฟิตเนส 🐷
                </span>
                <span className="text-xs text-rose-700 font-bold">
                  สวัสดีคุณ {activeProfileKey === 'partner' ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1 leading-snug">
                "หมูอ้วนอย่างเราก็ฟิตเฟิร์มได้! วันนี้พร้อมเบิร์นหรือยัง ลุยไปด้วยกันนะ 🐽✨"
              </p>
            </div>
          </div>

          {/* Quick Start Card with MagicCard */}
          <MagicCard spotlightColor="rgba(244, 63, 94, 0.15)" className="p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Flame size={140} className="text-rose-500" />
            </div>
            <div className="relative z-10 max-w-md">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                พร้อมฝึกซ้อมหรือยัง?
              </span>
              <h2 className="text-2xl font-black text-slate-700 mt-2">
                เริ่มเซสชันแบบเปิด (Empty Workout)
              </h2>
              <p className="text-xs text-pink-800/80 mt-1.5 leading-relaxed font-medium">
                เริ่มยกเวททันที แล้วเลือกท่าฝึกที่ต้องการแบบยืดหยุ่น ติ๊กเซ็ตและน้ำหนักเรียลไทม์
              </p>
              <div className="mt-5">
                <button
                  onClick={() => startWorkout('การฝึกวันนี้')}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-rose-200 active:scale-95 transition cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  <span>เริ่มเซสชันใหม่เดี๋ยวนี้</span>
                </button>
              </div>
            </div>
          </MagicCard>

          {/* Routine Programs (Push / Pull / Legs / Glutes) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Dumbbell size={18} className="text-rose-500" />
                    โปรแกรมการฝึกประจำสัปดาห์ (Routines)
                  </h3>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      activeProfileKey === 'partner'
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-pink-100 text-pink-800 border border-pink-200'
                    }`}
                  >
                    {activeProfileKey === 'partner' ? '🌸 ของมะนาว' : '🏋️‍♂️ ของแม็กนั่ม'}
                  </span>
                </div>
                <p className="text-xs text-pink-800/70 mt-0.5">
                  ตารางฝึกที่ตั้งค่าเฉพาะของแต่ละคน สามารถค้นหา ปรับเซ็ต/ครั้ง และแก้ไขท่าฝึกได้อิสระ
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProgram(null);
                  setShowRoutineModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus size={15} />
                + สร้าง Routine ใหม่
              </button>
            </div>

            {/* Routine Search Input Bar */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none"
              />
              <input
                type="text"
                value={routineSearchQuery}
                onChange={(e) => setRoutineSearchQuery(e.target.value)}
                placeholder="ค้นหาโปรแกรม Routine (เช่น Push, Glute, ก้น, ขา, อก, Hip Thrust)..."
                className="w-full bg-white border border-pink-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-pink-400 focus:outline-none focus:border-rose-400 transition shadow-xs"
              />
              {routineSearchQuery && (
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="p-8 text-center bg-white/95 rounded-3xl border border-pink-200 space-y-2 shadow-xs">
                <Dumbbell size={28} className="mx-auto text-pink-300" />
                <p className="text-sm text-slate-700 font-bold">
                  ไม่พบโปรแกรม Routine ที่ตรงกับ "{routineSearchQuery}"
                </p>
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="px-3 py-1 bg-pink-50 text-xs text-rose-600 rounded-lg hover:bg-pink-100 font-bold"
                >
                  ล้างการค้นหา
                </button>
              </div>
            ) : (
              <BentoGrid>
                {filteredPrograms.map((prog) => (
                  <BentoCard
                    key={prog.program_id}
                    title={prog.name}
                    subtitle={prog.note}
                    badge={prog.day_of_week || 'ตาราง'}
                    icon={<Dumbbell size={16} />}
                  >
                    <div className="space-y-3 mt-1">
                      {/* Preview exercises in routine */}
                      <div className="space-y-1 bg-pink-50/60 p-2.5 rounded-2xl border border-pink-200/80">
                        {prog.items?.slice(0, 3).map((item, idx) => {
                          const ex = exercises.find((e) => e.exercise_id === item.exercise_id);
                          return (
                            <div
                              key={idx}
                              className="text-xs text-slate-700 flex items-center gap-1.5 truncate font-medium"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span className="truncate">{ex?.name_th || item.exercise_id}</span>
                              <span className="text-pink-700/60 font-mono font-bold">
                                ({item.target_sets}x{item.target_reps})
                              </span>
                            </div>
                          );
                        })}
                        {prog.items && prog.items.length > 3 && (
                          <span className="text-[11px] text-pink-700/60 block pl-3 font-medium">
                            +{prog.items.length - 3} ท่าเพิ่มเติม
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleStartProgram(prog.program_id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                        >
                          <Play size={13} fill="currentColor" />
                          เริ่มเล่น
                        </button>
                        <button
                          onClick={() => {
                            setEditingProgram(prog);
                            setShowRoutineModal(true);
                          }}
                          className="py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          title="แก้ไขโปรแกรมนี้"
                        >
                          <Edit2 size={13} />
                          <span>แก้ไข</span>
                        </button>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </BentoGrid>
            )}
          </div>

          {/* Recent Workout History Quick Preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Clock size={18} className="text-rose-500" />
                ประวัติการฝึกซ้อมล่าสุด ({workoutHistory.length})
              </h3>
              <button
                onClick={() => setWorkoutTab('history')}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition"
              >
                ดูประวัติทั้งหมด ({allWorkoutHistory.length}) →
              </button>
            </div>

            {workoutHistory.length === 0 ? (
              <div className="bg-white/95 p-6 rounded-3xl border border-pink-200 text-center space-y-2 shadow-xs">
                <Dumbbell size={28} className="mx-auto text-pink-300" />
                <p className="text-sm text-slate-700 font-bold">ยังไม่มีประวัติการฝึกซ้อม</p>
                <p className="text-xs text-pink-700/70">
                  กดเริ่มฝึกเพื่อบันทึกประวัติ หรือดูประวัติรวมของคู่ของคุณ
                </p>
                <button
                  onClick={() => setWorkoutTab('history')}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 text-rose-600 text-xs font-bold hover:bg-pink-100 border border-pink-200 transition"
                >
                  ไปที่หน้าประวัติทั้งหมด
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {workoutHistory.slice(0, 3).map((sess) => {
                  const completedSets = sess.sets?.filter((s) => s.done) || [];
                  const exerciseCount = Array.from(
                    new Set(sess.sets?.map((s) => s.exercise_id) || [])
                  ).length;
                  const maxWeight = Math.max(
                    ...(sess.sets?.filter((s) => s.done).map((s) => s.weight_kg) || [0])
                  );
                  return (
                    <div
                      key={sess.session_id}
                      onClick={() => setWorkoutTab('history')}
                      className="bg-white/95 hover:bg-pink-50/50 p-4 rounded-3xl border border-pink-200 hover:border-pink-300 flex items-center justify-between cursor-pointer transition group shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600 transition">
                            {sess.program_name || 'เซสชันการฝึก'}
                          </span>
                          <span className="text-[11px] text-pink-800 bg-pink-50 px-2 py-0.5 rounded font-mono font-bold border border-pink-200">
                            {sess.date}
                          </span>
                        </div>
                        <p className="text-xs text-pink-800/70 font-medium">
                          {sess.start_time
                            ? `เวลา: ${sess.start_time} - ${sess.end_time || 'เสร็จสิ้น'} · `
                            : ''}
                          {completedSets.length} เซ็ต ({exerciseCount} ท่า)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-pink-700 block uppercase font-bold">
                          {maxWeight > 0 ? 'ยกหนักสุด' : 'ท่าฝึก'}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black font-mono ${
                            maxWeight > 0 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {maxWeight > 0 ? `${maxWeight} kg` : `${exerciseCount} ท่า`}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setWorkoutTab('history')}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Clock size={14} />
                  <span>เปิดดูประวัติแบบละเอียดทั้งหมด ({allWorkoutHistory.length} เซสชัน) →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Exercise Modal / Drawer */}
      {showAddExerciseDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowAddExerciseDrawer(false)} />
          <div className="relative w-full max-w-lg max-h-[88vh] bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col z-10 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-pink-200 flex items-center justify-between bg-pink-50/80">
              <div>
                <h3 className="font-bold text-slate-700 text-base">ค้นหา & เลือกท่าออกกำลังกาย</h3>
                <p className="text-xs text-pink-800/70">เลือกท่าเพื่อเพิ่มลงในเซสชันการฝึกของคุณ</p>
              </div>
              <button
                onClick={() => setShowAddExerciseDrawer(false)}
                className="p-1.5 rounded-lg text-pink-400 hover:text-pink-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 bg-pink-50/40 border-b border-pink-200 space-y-2.5">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="ค้นหาชื่อท่า (Bench Press, อก, ดัมเบล)..."
                  className="w-full bg-white border border-pink-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-700 placeholder-pink-400 focus:outline-none focus:border-rose-400 transition"
                  autoFocus
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Muscle Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {MUSCLE_FILTER_CHIPS.map((chip) => {
                  const isSelected = drawerMuscle === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => setDrawerMuscle(chip.key)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-95 ${
                        isSelected
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white text-pink-900 hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exercises List */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1 max-h-[50vh]">
              <div className="text-[11px] font-bold text-pink-800 px-1 flex items-center justify-between">
                <span>ผลลัพธ์ ({drawerFilteredExercises.length} ท่า)</span>
                {drawerSearch && (
                  <span className="text-rose-600 truncate max-w-[180px]">คำค้น: "{drawerSearch}"</span>
                )}
              </div>

              {drawerFilteredExercises.length === 0 ? (
                <div className="p-8 text-center space-y-2 bg-pink-50/50 rounded-2xl border border-pink-200">
                  <p className="text-sm text-slate-700 font-bold">ไม่พบท่าออกกำลังกายที่ตรงกับการค้นหา</p>
                  <p className="text-xs text-pink-700/70">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดกล้ามเนื้ออื่น</p>
                  <button
                    onClick={() => {
                      setDrawerSearch('');
                      setDrawerMuscle('all');
                    }}
                    className="mt-2 px-3 py-1 bg-white border border-pink-200 text-xs text-rose-600 font-bold rounded-lg hover:bg-pink-100"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              ) : (
                drawerFilteredExercises.map((ex) => {
                  const isInSession = activeWorkout?.exercises.some(
                    (e) => e.exercise_id === ex.exercise_id
                  );
                  return (
                    <div
                      key={ex.exercise_id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                        isInSession
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-white hover:bg-pink-50/50 border-pink-200'
                      }`}
                    >
                      <button
                        onClick={() => setActiveExerciseModal(ex)}
                        className="text-left flex-1 pr-2 group"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-700 group-hover:text-rose-600 transition">
                            {ex.name_en}
                          </h4>
                          {isInSession && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                              อยู่ในเซสชันแล้ว
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-pink-800/70 mt-0.5">
                          {ex.name_th} · <span className="capitalize">{ex.muscle_primary}</span> ·{' '}
                          <span className="text-pink-600/70 capitalize">{ex.equipment}</span>
                        </p>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            addExerciseToWorkout(ex);
                            setShowAddExerciseDrawer(false);
                            setDrawerSearch('');
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 active:scale-95 transition ${
                            isInSession
                              ? 'bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-xs'
                          }`}
                        >
                          <Plus size={14} />
                          {isInSession ? 'เพิ่มอีก' : 'เพิ่ม'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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

      {/* Routine Edit Modal */}
      {showRoutineModal && (
        <RoutineEditModal
          isOpen={showRoutineModal}
          onClose={() => {
            setShowRoutineModal(false);
            setEditingProgram(null);
          }}
          program={editingProgram}
          availableExercises={exercises}
          ownerName={activeProfileKey === 'partner' ? 'มะนาว' : 'แม็กนั่ม'}
          onSave={(saved) => {
            if (editingProgram) {
              updateProgram(saved.program_id, saved);
            } else {
              addProgram(saved);
            }
          }}
          onDelete={(id) => deleteProgram(id)}
        />
      )}
    </div>
  );
};
