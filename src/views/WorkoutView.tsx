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
import { BorderBeam } from '../components/ui/BorderBeam';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { MagicCard } from '../components/ui/MagicCard';
import { RestTimer } from '../components/workout/RestTimer';
import { RoutineEditModal } from '../components/workout/RoutineEditModal';

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
    activeProfileKey,
    currentProfile,
    openUnifiedSpreadsheet,
  } = useApp();

  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerMuscle, setDrawerMuscle] = useState<string>('all');
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerInitial, setRestTimerInitial] = useState(90);
  const [restTimerPaused, setRestTimerPaused] = useState(false);
  const [restTimerSound, setRestTimerSound] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);

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
    setShowRestTimer(true);
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
      matchesMuscle = ['quads', 'hamstrings', 'glutes', 'calves', 'legs'].includes(ex.muscle_primary);
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
                {/* Rest Timer Button in header */}
                <button
                  onClick={() => setShowRestTimer((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold transition active:scale-95 ${
                    restTimerSeconds !== null && restTimerSeconds > 0
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-500/30'
                      : showRestTimer
                      ? 'bg-slate-800 border-sky-500/50 text-sky-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="เปิด/ปิดนาฬิกาจับเวลาพัก"
                >
                  <Timer
                    size={16}
                    className={
                      restTimerSeconds !== null && !restTimerPaused && restTimerSeconds > 0
                        ? 'animate-spin text-sky-400'
                        : 'text-sky-400'
                    }
                  />
                  <span>
                    {restTimerSeconds !== null ? formatSeconds(restTimerSeconds) : 'จับเวลาพัก'}
                  </span>
                </button>

                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-sm font-mono font-bold text-emerald-400">
                  <Clock size={16} />
                  {formatSeconds(activeWorkout.elapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Rest Timer Panel (Expanded or Active) */}
            {showRestTimer && (
              <div className="mt-4 pt-3 border-t border-slate-800 animate-fadeIn">
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
                        onClick={() => startRestTimer(30)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        30s
                      </button>
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

          {/* Floating Sticky Rest Timer Widget */}
          {restTimerSeconds !== null && !showRestTimer && (
            <div className="fixed bottom-20 right-4 z-40 bg-slate-950/95 border-2 border-sky-500/80 rounded-2xl p-2 px-3 shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-fadeIn ring-4 ring-sky-950/50">
              <button
                onClick={() => setShowRestTimer(true)}
                className="flex items-center gap-1.5 text-sky-400 font-mono font-bold text-sm hover:underline"
                title="คลิกเพื่อเปิดนาฬิกาเต็มรูปแบบ"
              >
                <Timer size={16} className={!restTimerPaused && restTimerSeconds > 0 ? 'animate-spin' : ''} />
                <span className={restTimerSeconds === 0 ? 'text-emerald-400 font-black animate-pulse' : ''}>
                  {restTimerSeconds === 0 ? 'หมดเวลา!' : formatSeconds(restTimerSeconds)}
                </span>
              </button>
              <button
                onClick={() => handleAddSeconds(30)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-90 text-[11px] font-bold text-white rounded-lg"
                title="เพิ่ม 30 วินาที"
              >
                +30s
              </button>
              <button
                onClick={() => setRestTimerPaused((p) => !p)}
                className="p-1 text-slate-300 hover:text-white active:scale-90"
                title={restTimerPaused ? 'ทำงานต่อ' : 'พักชั่วคราว'}
              >
                {restTimerPaused ? (
                  <Play size={14} className="fill-current text-sky-400" />
                ) : (
                  <Pause size={14} className="fill-current text-slate-300" />
                )}
              </button>
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="p-1 text-slate-400 hover:text-rose-400 active:scale-90"
                title="ปิดนาฬิกา"
              >
                <X size={14} />
              </button>
            </div>
          )}
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

          {/* Routine Programs (Push / Pull / Legs / Glutes) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Dumbbell size={18} className="text-emerald-400" />
                    โปรแกรมการฝึกประจำสัปดาห์ (Routines)
                  </h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    activeProfileKey === 'partner'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {activeProfileKey === 'partner' ? '🌸 ของมะนาว' : '🏋️‍♂️ ของแม็กนั่ม'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ตารางฝึกที่ตั้งค่าเฉพาะของแต่ละคน สามารถค้นหา ปรับเซ็ต/ครั้ง และแก้ไขท่าฝึกได้อิสระ
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProgram(null);
                  setShowRoutineModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95 shrink-0"
              >
                <Plus size={15} />
                + สร้าง Routine ใหม่
              </button>
            </div>

            {/* Routine Search Input Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={routineSearchQuery}
                onChange={(e) => setRoutineSearchQuery(e.target.value)}
                placeholder="ค้นหาโปรแกรม Routine (เช่น Push, Glute, ก้น, ขา, อก, Hip Thrust)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {routineSearchQuery && (
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <Dumbbell size={28} className="mx-auto text-slate-600" />
                <p className="text-sm text-slate-300 font-bold">ไม่พบโปรแกรม Routine ที่ตรงกับ "{routineSearchQuery}"</p>
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="px-3 py-1 bg-slate-800 text-xs text-emerald-400 rounded-lg hover:bg-slate-700"
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

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleStartProgram(prog.program_id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <Play size={13} fill="currentColor" />
                          เริ่มเล่น
                        </button>
                        <button
                          onClick={() => {
                            setEditingProgram(prog);
                            setShowRoutineModal(true);
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 border border-slate-750 font-semibold text-xs flex items-center gap-1 transition active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowAddExerciseDrawer(false)} />
          <div className="relative w-full max-w-lg max-h-[88vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col z-10 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div>
                <h3 className="font-bold text-white text-base">ค้นหา & เลือกท่าออกกำลังกาย</h3>
                <p className="text-xs text-slate-400">เลือกท่าเพื่อเพิ่มลงในเซสชันการฝึกของคุณ</p>
              </div>
              <button
                onClick={() => setShowAddExerciseDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 space-y-2.5">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="ค้นหาชื่อท่า (Bench Press, อก, ดัมเบล)..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  autoFocus
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                          ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
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
              <div className="text-[11px] font-semibold text-slate-400 px-1 flex items-center justify-between">
                <span>ผลลัพธ์ ({drawerFilteredExercises.length} ท่า)</span>
                {drawerSearch && (
                  <span className="text-emerald-400 truncate max-w-[180px]">คำค้น: "{drawerSearch}"</span>
                )}
              </div>

              {drawerFilteredExercises.length === 0 ? (
                <div className="p-8 text-center space-y-2 bg-slate-950/40 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 font-bold">ไม่พบท่าออกกำลังกายที่ตรงกับการค้นหา</p>
                  <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดกล้ามเนื้ออื่น</p>
                  <button
                    onClick={() => {
                      setDrawerSearch('');
                      setDrawerMuscle('all');
                    }}
                    className="mt-2 px-3 py-1 bg-slate-800 text-xs text-emerald-400 rounded-lg hover:bg-slate-700"
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
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isInSession
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800/80'
                      }`}
                    >
                      <button
                        onClick={() => setActiveExerciseModal(ex)}
                        className="text-left flex-1 pr-2 group"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                            {ex.name_en}
                          </h4>
                          {isInSession && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                              อยู่ในเซสชันแล้ว
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ex.name_th} · <span className="capitalize">{ex.muscle_primary}</span> ·{' '}
                          <span className="text-slate-500 capitalize">{ex.equipment}</span>
                        </p>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            addExerciseToWorkout(ex);
                            setShowAddExerciseDrawer(false);
                            setDrawerSearch('');
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition ${
                            isInSession
                              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
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
