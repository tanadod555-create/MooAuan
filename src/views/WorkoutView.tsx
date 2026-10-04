import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise, WorkoutSet, Program, CardioActivity, CardioType } from '../types';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import {
  Play,
  Pause,
  Check,
  Plus,
  Minus,
  Trash2,
  Clock,
  Timer,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Flame,
  Dumbbell,
  CheckCircle2,
  ListPlus,
  X,
  Search,
  Edit2,
  ExternalLink,
  Footprints,
  TrendingUp,
  Zap,
  Heart,
  Activity,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { RestTimer } from '../components/workout/RestTimer';
import { RoutineEditModal } from '../components/workout/RoutineEditModal';
import { WorkoutHistorySection } from '../components/workout/WorkoutHistorySection';
import { YoutubeWorkoutModal } from '../components/workout/YoutubeWorkoutModal';
import { CardioVideoTab } from '../components/workout/CardioVideoTab';
import { PigMascot } from '../components/ui/PigMascot';
import { calculatePigEvolution, getUserAvatar, PIG_10_LEVELS } from '../utils/mascotLevels';
import {
  playGymAlertSound,
  triggerMobileVibrate,
  sendBackgroundNotification,
  requestNotificationPermission,
} from '../utils/backgroundTimer';

const CARDIO_TYPE_PRESETS: {
  type: CardioType;
  label: string;
  emoji: string;
  defaultSpeed: number;
  defaultIncline: number;
  defaultDuration: number;
}[] = [
  { type: 'incline_treadmill', label: 'เดินชันลู่วิ่ง', emoji: '⛰️', defaultSpeed: 4.5, defaultIncline: 10, defaultDuration: 30 },
  { type: 'treadmill_run', label: 'วิ่งลู่วิ่ง', emoji: '🏃‍♂️', defaultSpeed: 8.0, defaultIncline: 1, defaultDuration: 20 },
  { type: 'stationary_bike', label: 'ปั่นจักรยาน', emoji: '🚴', defaultSpeed: 18.0, defaultIncline: 0, defaultDuration: 30 },
  { type: 'stairmaster', label: 'สเต็ปมาสเตอร์', emoji: '🪜', defaultSpeed: 6.0, defaultIncline: 0, defaultDuration: 15 },
  { type: 'elliptical', label: 'เครื่องเดินวงรี', emoji: '🔄', defaultSpeed: 5.5, defaultIncline: 5, defaultDuration: 25 },
  { type: 'outdoor_walk', label: 'เดินเร็วกลางแจ้ง', emoji: '🚶‍♂️', defaultSpeed: 5.0, defaultIncline: 0, defaultDuration: 35 },
  { type: 'outdoor_run', label: 'วิ่งกลางแจ้ง', emoji: '🏃', defaultSpeed: 9.0, defaultIncline: 0, defaultDuration: 25 },
];

export const WorkoutView: React.FC = () => {
  const {
    activeWorkout,
    startWorkout,
    startCardioSession,
    startWorkoutTimer,
    pauseWorkoutTimer,
    toggleWorkoutTimer,
    cancelWorkout,
    finishWorkout,
    setSessionNote,
    setExerciseNote,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    addCardioToWorkout,
    updateCardioInWorkout,
    removeCardioFromWorkout,
    exercises,
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    resetProgramsToDefault,
    workoutHistory,
    allWorkoutHistory,
    deleteWorkoutSession,
    saveDirectWorkoutSession,
    activeProfileKey,
    currentProfile,
    // Global Rest Timer from AppContext
    restTimerSeconds,
    restTimerInitial,
    restTimerPaused,
    restTimerSound,
    startRestTimer,
    addRestTimerSeconds,
    resetRestTimer,
    clearRestTimer,
    toggleRestTimerPause,
    toggleRestTimerSound,
  } = useApp();

  const [workoutTab, setWorkoutTab] = useState<'workout' | 'cardio_vdo' | 'history'>('workout');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerMuscle, setDrawerMuscle] = useState<string>('all');
  const [showRestTimer, setShowRestTimer] = useState(false);

  // YouTube Workout Modal State
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);

  const handleStartLiveYoutubeWorkout = (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => {
    const cardioActivity: CardioActivity = {
      type: 'video_workout',
      machine_name: `คลิป: ${data.title}`,
      duration_minutes: data.durationMinutes,
      calories_kcal: data.caloriesKcal,
      note: data.note,
      youtube_id: data.youtubeId || undefined,
      youtube_url: data.youtubeUrl || undefined,
      target_muscles: data.targetMuscles,
      benefits: data.benefits,
    };
    startCardioSession(`📺 ${data.title}`, 'video_workout', cardioActivity, true);
  };

  const handleSaveFinishedYoutubeWorkout = async (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => {
    const cardioActivity: CardioActivity = {
      id: 'cardio_' + Math.random().toString(36).substring(2, 9),
      type: 'video_workout',
      machine_name: `คลิป: ${data.title}`,
      duration_minutes: data.durationMinutes,
      calories_kcal: data.caloriesKcal,
      note: data.note,
      youtube_id: data.youtubeId || undefined,
      youtube_url: data.youtubeUrl || undefined,
      target_muscles: data.targetMuscles,
      benefits: data.benefits,
    };

    await saveDirectWorkoutSession({
      user_id: activeProfileKey,
      user_name: currentProfile.name,
      date: new Date().toISOString().split('T')[0],
      program_name: `📺 ${data.title}`,
      start_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      end_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      note: data.note,
      sets: [],
      cardio: [cardioActivity],
    });
  };

  // Cardio Setup Modal State (Choose activity & target before starting)
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [cardioModalMode, setCardioModalMode] = useState<'new_session' | 'add_to_active'>('new_session');
  const [selectedCardioType, setSelectedCardioType] = useState<CardioType>('incline_treadmill');
  const [cardioDuration, setCardioDuration] = useState<number | ''>(30);
  const [cardioIncline, setCardioIncline] = useState<number | ''>(10);
  const [cardioSpeed, setCardioSpeed] = useState<number | ''>(4.5);
  const [cardioDistance, setCardioDistance] = useState<number | ''>(2.25);
  const [cardioCalories, setCardioCalories] = useState<number | ''>(190);
  const [cardioNote, setCardioNote] = useState('');

  const handleSelectPresetType = (type: CardioType) => {
    setSelectedCardioType(type);
    const preset = CARDIO_TYPE_PRESETS.find((p) => p.type === type);
    if (preset) {
      setCardioIncline(preset.defaultIncline);
      setCardioSpeed(preset.defaultSpeed);
      setCardioDuration(preset.defaultDuration);
      const estDistance = Math.round(((preset.defaultSpeed * preset.defaultDuration) / 60) * 100) / 100;
      setCardioDistance(estDistance);
      const estCals = Math.round(preset.defaultDuration * (type === 'incline_treadmill' ? 6.5 : type === 'treadmill_run' ? 10 : 7));
      setCardioCalories(estCals);
    }
  };

  const handleConfirmCardio = () => {
    const preset = CARDIO_TYPE_PRESETS.find((p) => p.type === selectedCardioType);
    const machineName = preset ? preset.label : 'คาร์ดิโอ (Cardio)';
    const cardioData: Partial<CardioActivity> = {
      type: selectedCardioType,
      machine_name: machineName,
      duration_minutes: Number(cardioDuration) || 30,
      incline_pct: cardioIncline === '' ? 0 : Number(cardioIncline),
      speed_kmh: cardioSpeed === '' ? 0 : Number(cardioSpeed),
      distance_km: cardioDistance === '' ? undefined : Number(cardioDistance),
      calories_kcal: cardioCalories === '' ? undefined : Number(cardioCalories),
      note: cardioNote.trim() || undefined,
    };

    if (cardioModalMode === 'new_session') {
      startCardioSession(`คาร์ดิโอ / ${machineName}`, selectedCardioType, cardioData, false);
    } else {
      addCardioToWorkout({
        type: selectedCardioType,
        machine_name: machineName,
        duration_minutes: Number(cardioDuration) || 30,
        incline_pct: cardioIncline === '' ? 0 : Number(cardioIncline),
        speed_kmh: cardioSpeed === '' ? 0 : Number(cardioSpeed),
        distance_km: cardioDistance === '' ? undefined : Number(cardioDistance),
        calories_kcal: cardioCalories === '' ? undefined : Number(cardioCalories),
        note: cardioNote.trim() || undefined,
      });
    }
    setShowCardioModal(false);
    setCardioNote('');
  };

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

  // Stepper increment step size state
  const [weightStep, setWeightStep] = useState<number>(2.5);
  const [repsStep, setRepsStep] = useState<number>(1);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  // Active Set Navigation Map (Horizontal Set Flow: One active set per exercise)
  const [activeSetIdxMap, setActiveSetIdxMap] = useState<Record<string, number>>({});

  const setActiveSetForExercise = (exerciseId: string, setIdx: number) => {
    setActiveSetIdxMap((prev) => ({
      ...prev,
      [exerciseId]: setIdx,
    }));
  };

  // Exercise card accordion collapse state
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});

  const toggleExerciseCollapse = (exerciseId: string) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // Routine search and editing state
  const [routineSearchQuery, setRoutineSearchQuery] = useState('');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

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
      {/* Top Tab Switcher: Apple Segmented Control */}
      <div className="flex items-center p-1 bg-zinc-200/60 backdrop-blur-md rounded-full max-w-lg mx-auto shadow-inner border border-black/[0.04]">
        <button
          onClick={() => setWorkoutTab('workout')}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            workoutTab === 'workout'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Dumbbell size={14} />
          <span>ออกกำลังกาย</span>
          {activeWorkout && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setWorkoutTab('cardio_vdo')}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            workoutTab === 'cardio_vdo'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span className="text-red-500 text-xs font-black">▶</span>
          <span>Cardio VDO</span>
        </button>

        <button
          onClick={() => setWorkoutTab('history')}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            workoutTab === 'history'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Clock size={14} />
          <span>ประวัติ</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-700 font-mono font-bold">
            {workoutHistory.length}
          </span>
        </button>
      </div>

      {/* Active Workout Notification Bar while on History or Cardio VDO Tab */}
      {activeWorkout && workoutTab !== 'workout' && (
        <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 animate-pulse shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="text-slate-700 font-bold">กำลังฝึก: {activeWorkout.name}</span>
            <span className="text-rose-500 font-mono font-bold">
              ({formatSeconds(activeWorkout.elapsedSeconds)})
            </span>
          </div>
          <button
            onClick={() => setWorkoutTab('workout')}
            className="px-3 py-1 bg-gradient-to-r from-pink-400 to-rose-300 text-white text-xs font-bold rounded-xl hover:opacity-95 transition"
          >
            กลับสู่การซ้อม →
          </button>
        </div>
      )}

      {workoutTab === 'cardio_vdo' ? (
        <CardioVideoTab
          onStartLiveSession={(data) => {
            handleStartLiveYoutubeWorkout(data);
            setWorkoutTab('workout');
          }}
          onSaveFinishedSession={handleSaveFinishedYoutubeWorkout}
        />
      ) : workoutTab === 'history' ? (
        <WorkoutHistorySection
          onStartRoutineWithExercises={(name, exs) => {
            setWorkoutTab('workout');
            startWorkout(name, exs);
          }}
        />
      ) : activeWorkout ? (
        <div className="space-y-4">
          {/* Active Workout Top Banner (Compact, Ergonomic, Background-Safe Timer) */}
          <div className="bg-white/95 border border-pink-300/80 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-xl sticky top-16 z-30 overflow-hidden space-y-2">
            {/* Top Compact Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    activeWorkout.is_timer_running
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block leading-tight px-1.5 py-0.2 rounded-md ${
                        activeWorkout.is_timer_running
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {activeWorkout.is_timer_running ? '🟢 กำลังจับเวลาสด' : '⏸️ พักจับเวลา / พร้อมเริ่ม'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      เริ่ม {activeWorkout.start_time}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-800 truncate leading-tight mt-0.5">
                    {activeWorkout.name}
                  </h2>
                </div>
              </div>

              {/* Action Buttons & Timers Row */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {/* Interactive Workout Timer (Tap to Start / Pause) */}
                <button
                  type="button"
                  onClick={toggleWorkoutTimer}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                    activeWorkout.is_timer_running
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-emerald-200'
                      : activeWorkout.elapsedSeconds > 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={activeWorkout.is_timer_running ? 'แตะเพื่อพักการจับเวลา' : 'แตะเพื่อเริ่ม/จับเวลาต่อ'}
                >
                  {activeWorkout.is_timer_running ? (
                    <Pause size={13} className="fill-current text-white animate-pulse" />
                  ) : (
                    <Play size={13} className="fill-current text-emerald-600" />
                  )}
                  <span>{formatSeconds(activeWorkout.elapsedSeconds)}</span>
                </button>

                {/* Rest Timer Button in header */}
                <button
                  type="button"
                  onClick={() => setShowRestTimer((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-mono font-bold transition active:scale-95 cursor-pointer ${
                    restTimerSeconds !== null && restTimerSeconds > 0
                      ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200'
                      : showRestTimer
                      ? 'bg-pink-100 border-rose-300 text-rose-700'
                      : 'bg-pink-50/80 border-pink-200 text-pink-900 hover:bg-pink-100'
                  }`}
                  title="เปิด/ปิดนาฬิกาจับเวลาพัก"
                >
                  <Timer
                    size={14}
                    className={
                      restTimerSeconds !== null && !restTimerPaused && restTimerSeconds > 0
                        ? 'animate-spin text-rose-500'
                        : 'text-rose-500'
                    }
                  />
                  <span>
                    {restTimerSeconds !== null ? formatSeconds(restTimerSeconds) : 'พัก'}
                  </span>
                </button>

                {/* Compact Finish Workout Button */}
                <button
                  type="button"
                  onClick={finishWorkout}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                  title="เสร็จสิ้นการฝึกและบันทึก"
                >
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                  <span>เสร็จสิ้น</span>
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={cancelWorkout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="ยกเลิกเซสชัน"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sub-bar: Compact Quick Note / Rest Settings Accordion Toggle */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-pink-100/90 text-slate-500">
              <button
                type="button"
                onClick={() => setShowSessionDetails((prev) => !prev)}
                className="flex items-center gap-1.5 text-pink-600 hover:text-rose-600 font-bold transition cursor-pointer text-left"
              >
                <span>⚙️ พัก {standardRestSeconds}วิ</span>
                <span>•</span>
                <span className="truncate max-w-[170px] sm:max-w-xs font-normal">
                  {activeWorkout.note ? `📝 ${activeWorkout.note}` : '📝 เพิ่มหมายเหตุ...'}
                </span>
                <ChevronRight
                  size={12}
                  className={`transition-transform duration-200 ${showSessionDetails ? 'rotate-90 text-rose-600' : ''}`}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowSessionDetails((prev) => !prev)}
                className="text-[10px] text-slate-400 hover:text-pink-600 font-medium cursor-pointer"
              >
                {showSessionDetails ? 'ย่อ' : 'ตั้งค่า'}
              </button>
            </div>

            {/* Collapsible Session Details (Rest Selector + Note input) */}
            {showSessionDetails && (
              <div className="pt-2 border-t border-pink-100 space-y-2 animate-fadeIn">
                {/* Standard Rest Time Selector */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Timer size={12} className="text-rose-500" />
                    <span>เริ่มพักอัตโนมัติ:</span>
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { label: '45วิ', sec: 45 },
                      { label: '60วิ', sec: 60 },
                      { label: '90วิ', sec: 90 },
                      { label: '2น.', sec: 120 },
                      { label: '3น.', sec: 180 },
                    ].map((p) => (
                      <button
                        key={p.sec}
                        type="button"
                        onClick={() => handleSelectStandardRest(p.sec)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition active:scale-95 cursor-pointer ${
                          standardRestSeconds === p.sec
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'bg-pink-50 hover:bg-pink-100 text-slate-600 border border-pink-200/80'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Note */}
                <input
                  type="text"
                  value={activeWorkout.note || ''}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="บันทึกความรู้สึกเซสชันนี้..."
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition"
                />
              </div>
            )}

            {/* Rest Timer Panel (Expanded or Active) */}
            {showRestTimer && (
              <div className="pt-2 border-t border-pink-200 animate-fadeIn">
                <RestTimer
                  seconds={restTimerSeconds}
                  initialSeconds={restTimerInitial}
                  isPaused={restTimerPaused}
                  soundEnabled={restTimerSound}
                  onStart={startRestTimer}
                  onPauseToggle={toggleRestTimerPause}
                  onAddSeconds={addRestTimerSeconds}
                  onReset={resetRestTimer}
                  onClose={() => {
                    clearRestTimer();
                    setShowRestTimer(false);
                  }}
                  onSoundToggle={toggleRestTimerSound}
                />
              </div>
            )}
          </div>

          {/* Active YouTube Video Player Card (If following a video workout) */}
          {(() => {
            const videoCardio = activeWorkout.cardio?.find((c) => c.youtube_id || c.type === 'video_workout');
            if (!videoCardio || !videoCardio.youtube_id) return null;
            return (
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white rounded-3xl border border-red-500/40 shadow-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-red-500 font-black text-lg">▶</span>
                    <h3 className="font-bold text-xs sm:text-sm truncate text-white">
                      {videoCardio.machine_name || 'คลิปออกกำลังกาย YouTube'}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold shrink-0">
                    Live Video Follow
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black shadow-inner">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoCardio.youtube_id}?enablejsapi=1&rel=0`}
                    title={videoCardio.machine_name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {videoCardio.benefits && videoCardio.benefits.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-white/80">
                    <span className="text-emerald-400 font-bold">✨ สิ่งที่ได้:</span>
                    {videoCardio.benefits.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-white/90">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Exercise Cards in Workout (Collapsible & Horizontal Set Carousel) */}
          {activeWorkout.exercises.map((item, exIdx) => {
            const exerciseData = exercises.find((e) => e.exercise_id === item.exercise_id);
            const isCollapsed = Boolean(collapsedExercises[item.exercise_id]);
            const completedSetsCount = item.sets.filter((s) => s.done).length;
            const allSetsDone = completedSetsCount === item.sets.length && item.sets.length > 0;
            const maxWeight = Math.max(...item.sets.map((s) => s.weight_kg || 0), 0);

            return (
              <div
                key={item.exercise_id}
                className={`bg-white/95 rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  allSetsDone
                    ? 'border-emerald-200/90 shadow-emerald-100/40'
                    : 'border-pink-200/90 shadow-pink-100/50'
                }`}
              >
                {/* Exercise Header (Click to Toggle Collapse / Expand) */}
                <div className="p-3.5 sm:p-4 bg-pink-50/70 border-b border-pink-200/80 flex items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleExerciseCollapse(item.exercise_id)}
                    className="flex-1 text-left flex items-center gap-3 min-w-0 cursor-pointer group"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 shrink-0 ${
                        isCollapsed ? 'bg-pink-100 text-slate-500' : 'bg-rose-100 text-rose-600 rotate-180'
                      }`}
                      title={isCollapsed ? 'แตะเพื่อขยาย' : 'แตะเพื่อย่อเก็บ'}
                    >
                      <ChevronDown size={18} className="stroke-[2.5]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-rose-300 shadow-2xs shrink-0">
                          #{exIdx + 1}
                        </span>
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 group-hover:text-rose-600 transition truncate leading-snug">
                          {exerciseData?.name_en || item.exercise_id}
                        </h3>
                        {allSetsDone && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                            <Check size={12} className="stroke-[3]" /> ครบ {item.sets.length} เซ็ต
                          </span>
                        )}
                        {isCollapsed && !allSetsDone && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 shrink-0">
                            เสร็จ {completedSetsCount}/{item.sets.length}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 block truncate">
                        <span className="capitalize">{exerciseData?.muscle_primary}</span> · <span className="capitalize">{exerciseData?.equipment}</span>
                        {isCollapsed && maxWeight > 0 && ` · สูงสุด ${maxWeight} kg`}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => exerciseData && setActiveExerciseModal(exerciseData)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition cursor-pointer active:scale-95"
                      title="ดูวิธีเล่น"
                    >
                      <Sparkles size={16} className="text-amber-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExerciseFromWorkout(item.exercise_id)}
                      className="p-2 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer active:scale-95"
                      title="ลบท่านี้"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Collapsed Summary Pill Bar (When Folded) */}
                {isCollapsed && (
                  <div
                    onClick={() => toggleExerciseCollapse(item.exercise_id)}
                    className="p-2.5 bg-slate-50/70 hover:bg-pink-50/50 flex items-center justify-between text-xs text-slate-500 font-bold cursor-pointer transition px-4"
                  >
                    <span>
                      {allSetsDone
                        ? '🎉 เล่นครบทุกเซ็ตแล้ว'
                        : `ทำไปแล้ว ${completedSetsCount}/${item.sets.length} เซ็ต`}
                    </span>
                    <span className="text-rose-500 text-[11px] font-black">ขยาย ▾</span>
                  </div>
                )}

                {/* Expanded Body: Note + Horizontal Sets Carousel */}
                {!isCollapsed && (
                  <div className="animate-fadeIn">
                    {/* Exercise Note Input */}
                    <div className="px-3.5 sm:px-4 py-2 bg-pink-50/40 border-b border-pink-100 flex items-center gap-2">
                      <Edit2 size={12} className="text-rose-400 shrink-0" />
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => setExerciseNote(item.exercise_id, e.target.value)}
                        placeholder="หมายเหตุท่านี้..."
                        className="flex-1 bg-white border border-pink-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 placeholder-pink-300 focus:outline-none focus:border-rose-400 shadow-2xs"
                      />
                      {item.note && (
                        <button
                          type="button"
                          onClick={() => setExerciseNote(item.exercise_id, '')}
                          className="text-[10px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer shrink-0"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>

                    {/* Horizontal Set Navigation Tabs & Active Set Card */}
                    {(() => {
                      const activeSetIdx = Math.min(
                        item.sets.length - 1,
                        Math.max(
                          0,
                          activeSetIdxMap[item.exercise_id] !== undefined
                            ? activeSetIdxMap[item.exercise_id]
                            : item.sets.findIndex((s) => !s.done) !== -1
                            ? item.sets.findIndex((s) => !s.done)
                            : 0
                        )
                      );
                      const currentSet = item.sets[activeSetIdx] || item.sets[0];

                      return (
                        <div className="p-3 sm:p-4 pt-2 space-y-3">
                          {/* Set Selection Header Pills */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-700">
                                เซ็ต ({completedSetsCount}/{item.sets.length})
                              </span>
                            </div>

                            {/* Set Navigation Pills (Click to switch active set) */}
                            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                              {item.sets.map((s, sIdx) => {
                                const isSelected = sIdx === activeSetIdx;
                                return (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => setActiveSetForExercise(item.exercise_id, sIdx)}
                                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1 border min-h-[32px] ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-pink-300'
                                        : s.done
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                        : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50'
                                    }`}
                                    title={`ไปที่เซ็ต ${sIdx + 1}`}
                                  >
                                    {s.done ? (
                                      <Check
                                        size={12}
                                        className={isSelected ? 'text-white stroke-[3]' : 'text-emerald-600 stroke-[3]'}
                                      />
                                    ) : null}
                                    <span>เซ็ต {sIdx + 1}</span>
                                  </button>
                                );
                              })}

                              {/* Quick + Add Set Pill */}
                              <button
                                type="button"
                                onClick={() => {
                                  addSetToExercise(item.exercise_id);
                                  setActiveSetForExercise(item.exercise_id, item.sets.length);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-rose-600 border border-pink-200 text-xs font-black flex items-center gap-0.5 transition active:scale-95 cursor-pointer min-h-[32px]"
                                title="เพิ่มเซ็ตใหม่"
                              >
                                <Plus size={13} className="stroke-[3]" />
                                <span>เซ็ต</span>
                              </button>
                            </div>
                          </div>

                          {/* Active Single Set Card */}
                          {currentSet && (
                            <div
                              key={currentSet.set_id || activeSetIdx}
                              className={`w-full p-3.5 sm:p-4 rounded-3xl border transition-all ${
                                currentSet.done
                                  ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                                  : 'bg-white border-pink-200/90 shadow-xs'
                              }`}
                            >
                              {/* Set Card Header */}
                              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-pink-100">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide ${
                                      currentSet.done
                                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs'
                                        : 'bg-pink-100 text-pink-700'
                                    }`}
                                  >
                                    เซ็ตที่ {activeSetIdx + 1} จาก {item.sets.length}
                                  </span>
                                  {currentSet.done && (
                                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                                      <Check size={13} className="stroke-[3]" /> เสร็จแล้ว
                                    </span>
                                  )}
                                </div>

                                {item.sets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      removeSetFromExercise(item.exercise_id, activeSetIdx);
                                      setActiveSetForExercise(
                                        item.exercise_id,
                                        Math.max(0, activeSetIdx - 1)
                                      );
                                    }}
                                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition active:scale-95 cursor-pointer"
                                    title="ลบเซ็ตนี้"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>

                              {/* Weight & Reps Stepper Controllers */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                {/* 1. Weight (kg) Stepper */}
                                <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-100/90 space-y-2">
                                  <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-slate-600">น้ำหนัก</span>
                                    <span className="text-sm font-black text-rose-600 font-mono">
                                      {currentSet.weight_kg} kg
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = Math.max(
                                          0,
                                          Math.round(((currentSet.weight_kg || 0) - weightStep) * 100) / 100
                                        );
                                        updateSet(item.exercise_id, activeSetIdx, { weight_kg: next });
                                      }}
                                      className="w-12 h-12 rounded-2xl bg-white border-2 border-pink-200 text-slate-700 hover:bg-pink-50 flex items-center justify-center shadow-xs active:scale-90 transition cursor-pointer shrink-0"
                                    >
                                      <Minus size={20} className="stroke-[2.5]" />
                                    </button>

                                    <div className="flex-1 min-w-[70px]">
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={currentSet.weight_kg === 0 ? '' : currentSet.weight_kg}
                                        placeholder="0"
                                        onChange={(e) =>
                                          updateSet(item.exercise_id, activeSetIdx, {
                                            weight_kg: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full h-12 text-center font-black font-mono text-xl text-slate-800 bg-white border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-rose-400 shadow-inner"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = Math.round(((currentSet.weight_kg || 0) + weightStep) * 100) / 100;
                                        updateSet(item.exercise_id, activeSetIdx, { weight_kg: next });
                                      }}
                                      className="w-12 h-12 rounded-2xl bg-white border-2 border-pink-200 text-slate-700 hover:bg-pink-50 flex items-center justify-center shadow-xs active:scale-90 transition cursor-pointer shrink-0"
                                    >
                                      <Plus size={20} className="stroke-[2.5]" />
                                    </button>
                                  </div>

                                  {/* Weight Step Size Selector (Including ±0.5) */}
                                  <div className="flex items-center justify-between gap-1 pt-0.5 px-0.5">
                                    <span className="text-[10px] font-bold text-slate-400">ปรับทีละ:</span>
                                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                                      {[0.5, 1, 1.25, 2.5, 5, 10].map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => setWeightStep(s)}
                                          className={`text-xs font-bold px-2 py-0.5 rounded-xl border transition cursor-pointer active:scale-95 min-h-[26px] ${
                                            weightStep === s
                                              ? 'bg-rose-500 text-white border-rose-500 shadow-2xs font-extrabold'
                                              : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-200'
                                          }`}
                                        >
                                          ±{s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Reps Stepper */}
                                <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-100/90 space-y-2">
                                  <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-slate-600">จำนวนครั้ง</span>
                                    <span className="text-sm font-black text-rose-600 font-mono">
                                      {currentSet.reps} ครั้ง
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = Math.max(0, (currentSet.reps || 0) - repsStep);
                                        updateSet(item.exercise_id, activeSetIdx, { reps: next });
                                      }}
                                      className="w-12 h-12 rounded-2xl bg-white border-2 border-pink-200 text-slate-700 hover:bg-pink-50 flex items-center justify-center shadow-xs active:scale-90 transition cursor-pointer shrink-0"
                                    >
                                      <Minus size={20} className="stroke-[2.5]" />
                                    </button>

                                    <div className="flex-1 min-w-[70px]">
                                      <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={currentSet.reps === 0 ? '' : currentSet.reps}
                                        placeholder="0"
                                        onChange={(e) =>
                                          updateSet(item.exercise_id, activeSetIdx, {
                                            reps: parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="w-full h-12 text-center font-black font-mono text-xl text-slate-800 bg-white border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-rose-400 shadow-inner"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = (currentSet.reps || 0) + repsStep;
                                        updateSet(item.exercise_id, activeSetIdx, { reps: next });
                                      }}
                                      className="w-12 h-12 rounded-2xl bg-white border-2 border-pink-200 text-slate-700 hover:bg-pink-50 flex items-center justify-center shadow-xs active:scale-90 transition cursor-pointer shrink-0"
                                    >
                                      <Plus size={20} className="stroke-[2.5]" />
                                    </button>
                                  </div>

                                  {/* Reps Step Size Selector */}
                                  <div className="flex items-center justify-between gap-1 pt-0.5 px-0.5">
                                    <span className="text-[10px] font-bold text-slate-400">ปรับทีละ:</span>
                                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                                      {[1, 2, 5].map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => setRepsStep(s)}
                                          className={`text-xs font-bold px-2.5 py-0.5 rounded-xl border transition cursor-pointer active:scale-95 min-h-[26px] ${
                                            repsStep === s
                                              ? 'bg-rose-500 text-white border-rose-500 shadow-2xs font-extrabold'
                                              : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-200'
                                          }`}
                                        >
                                          ±{s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Prominent Tactile Finish Set Button (Triggers Rest Timer and Auto-Advances to Next Set) */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newDone = !currentSet.done;
                                  updateSet(item.exercise_id, activeSetIdx, { done: newDone });
                                  if (newDone) {
                                    startRestTimer(standardRestSeconds);
                                    // Auto-advance to next set if available!
                                    if (activeSetIdx < item.sets.length - 1) {
                                      setActiveSetForExercise(item.exercise_id, activeSetIdx + 1);
                                    }
                                  }
                                }}
                                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md min-h-[48px] ${
                                  currentSet.done
                                    ? 'bg-rose-100/90 hover:bg-rose-100 text-rose-800 border-2 border-rose-300'
                                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-200'
                                }`}
                              >
                                {currentSet.done ? (
                                  <>
                                    <Check size={18} className="stroke-[3] text-rose-600" />
                                    <span>
                                      เซ็ต {activeSetIdx + 1} เสร็จแล้ว ({currentSet.weight_kg} kg × {currentSet.reps})
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-mono font-bold">
                                      {activeSetIdx + 1}
                                    </span>
                                    <span>
                                      เสร็จเซ็ต {activeSetIdx + 1} (พัก {standardRestSeconds}s ⏱️)
                                    </span>
                                  </>
                                )}
                              </button>

                              {/* Horizontal Set Flow Navigation Controls */}
                              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-pink-100">
                                <button
                                  type="button"
                                  disabled={activeSetIdx === 0}
                                  onClick={() => setActiveSetForExercise(item.exercise_id, activeSetIdx - 1)}
                                  className="py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer min-h-[36px]"
                                >
                                  <span>← เซ็ตก่อนหน้า</span>
                                </button>

                                {activeSetIdx < item.sets.length - 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveSetForExercise(item.exercise_id, activeSetIdx + 1)}
                                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs min-h-[36px]"
                                  >
                                    <span>เซ็ตถัดไป ({activeSetIdx + 2}) →</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addSetToExercise(item.exercise_id);
                                      setActiveSetForExercise(item.exercise_id, item.sets.length);
                                    }}
                                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs min-h-[36px]"
                                  >
                                    <Plus size={14} className="stroke-[3]" />
                                    <span>เพิ่มเซ็ต {item.sets.length + 1} →</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Quick Button to Collapse after finishing */}
                    <div className="px-4 pb-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleExerciseCollapse(item.exercise_id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>ย่อเก็บ</span>
                        <ChevronDown size={14} className="rotate-180" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Cardio Activities Section in Active Workout */}
          <div className="space-y-3">
            {activeWorkout.cardio && activeWorkout.cardio.length > 0 && (
              <div className="space-y-3">
                {activeWorkout.cardio.map((c, cIdx) => (
                  <div
                    key={c.id || cIdx}
                    className="bg-white/95 rounded-3xl border border-pink-200/90 overflow-hidden shadow-sm shadow-pink-100/50 p-4 sm:p-5 space-y-3.5"
                  >
                    {/* Header of Cardio Item */}
                    <div className="flex items-center justify-between gap-2 border-b border-pink-100/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-300 text-white flex items-center justify-center text-base shadow-xs shrink-0">
                          🏃‍♂️
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-slate-800">
                              {c.machine_name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-rose-600">
                              Cardio #{cIdx + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {c.type === 'incline_treadmill'
                              ? 'เดินชันเน้นเบิร์นไขมัน ถนอมข้อต่อเข่า'
                              : 'คาร์ดิโอกระตุ้นระบบไหลเวียนโลหิตและเบิร์นแคลอรี'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCardioFromWorkout(cIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="ลบกิจกรรมคาร์ดิโอนี้"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quick Activity Selector Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {CARDIO_TYPE_PRESETS.map((preset) => {
                        const isSelected = c.type === preset.type;
                        return (
                          <button
                            key={preset.type}
                            type="button"
                            onClick={() =>
                              updateCardioInWorkout(cIdx, {
                                type: preset.type,
                                machine_name: preset.label,
                                incline_pct: preset.defaultIncline,
                                speed_kmh: preset.defaultSpeed,
                                duration_minutes: preset.defaultDuration,
                              })
                            }
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                                : 'bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/70'
                            }`}
                          >
                            <span className="mr-1">{preset.emoji}</span>
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* 3 Steppers: Incline (ความชัน), Speed (ความเร็ว), Duration (ระยะเวลา) - Ultra Compact 3-col Grid */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {/* Incline (ความชัน %) */}
                      <div className="bg-pink-50/50 rounded-xl p-2 border border-pink-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-0.5 truncate">
                            <TrendingUp size={11} className="text-rose-400 shrink-0" /> ชัน
                          </span>
                          <span className="text-xs font-black text-rose-600 font-mono">
                            {c.incline_pct ?? 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(
                                0,
                                Math.round(((c.incline_pct ?? 0) - 1) * 10) / 10
                              );
                              updateCardioInWorkout(cIdx, { incline_pct: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="ลดความชัน 1%"
                          >
                            <Minus size={13} className="stroke-[2.5]" />
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="30"
                            value={c.incline_pct ?? 0}
                            onChange={(e) =>
                              updateCardioInWorkout(cIdx, {
                                incline_pct: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full min-w-0 h-7 sm:h-8 text-center font-black font-mono text-xs sm:text-sm text-slate-800 bg-white border border-pink-200 rounded-lg focus:outline-none focus:border-rose-400 p-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.round(((c.incline_pct ?? 0) + 1) * 10) / 10;
                              updateCardioInWorkout(cIdx, { incline_pct: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="เพิ่มความชัน 1%"
                          >
                            <Plus size={13} className="stroke-[2.5]" />
                          </button>
                        </div>
                        {/* Quick Incline Chips */}
                        <div className="flex items-center justify-center gap-1 mt-1.5 flex-wrap">
                          {[0, 8, 12, 15].map((inc) => (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => updateCardioInWorkout(cIdx, { incline_pct: inc })}
                              className={`text-[9px] font-bold px-1 py-0.2 rounded border transition active:scale-95 cursor-pointer ${
                                c.incline_pct === inc
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-white text-slate-600 border-pink-200/70 hover:bg-pink-50'
                              }`}
                            >
                              {inc}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Speed (ความเร็ว km/h) */}
                      <div className="bg-pink-50/50 rounded-xl p-2 border border-pink-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-0.5 truncate">
                            <Zap size={11} className="text-rose-400 shrink-0" /> สปีด
                          </span>
                          <span className="text-xs font-black text-rose-600 font-mono">
                            {c.speed_kmh ?? 4.5}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(
                                0,
                                Math.round(((c.speed_kmh ?? 4.5) - 0.5) * 10) / 10
                              );
                              updateCardioInWorkout(cIdx, { speed_kmh: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="ลดความเร็ว 0.5 km/h"
                          >
                            <Minus size={13} className="stroke-[2.5]" />
                          </button>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="25"
                            value={c.speed_kmh ?? 4.5}
                            onChange={(e) =>
                              updateCardioInWorkout(cIdx, {
                                speed_kmh: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full min-w-0 h-7 sm:h-8 text-center font-black font-mono text-xs sm:text-sm text-slate-800 bg-white border border-pink-200 rounded-lg focus:outline-none focus:border-rose-400 p-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.round(((c.speed_kmh ?? 4.5) + 0.5) * 10) / 10;
                              updateCardioInWorkout(cIdx, { speed_kmh: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="เพิ่มความเร็ว 0.5 km/h"
                          >
                            <Plus size={13} className="stroke-[2.5]" />
                          </button>
                        </div>
                        {/* Quick Speed Chips */}
                        <div className="flex items-center justify-center gap-1 mt-1.5 flex-wrap">
                          {[3.5, 4.5, 5.5, 7.0].map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              onClick={() => updateCardioInWorkout(cIdx, { speed_kmh: spd })}
                              className={`text-[9px] font-bold px-1 py-0.2 rounded border transition active:scale-95 cursor-pointer ${
                                c.speed_kmh === spd
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-white text-slate-600 border-pink-200/70 hover:bg-pink-50'
                              }`}
                            >
                              {spd}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration (ระยะเวลา นาที) */}
                      <div className="bg-pink-50/50 rounded-xl p-2 border border-pink-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-0.5 truncate">
                            <Clock size={11} className="text-rose-400 shrink-0" /> เวลา
                          </span>
                          <span className="text-xs font-black text-rose-600 font-mono">
                            {c.duration_minutes}น.
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(5, (c.duration_minutes || 30) - 5);
                              updateCardioInWorkout(cIdx, { duration_minutes: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="ลดเวลา 5 นาที"
                          >
                            <Minus size={13} className="stroke-[2.5]" />
                          </button>
                          <input
                            type="number"
                            step="5"
                            min="1"
                            max="180"
                            value={c.duration_minutes || 30}
                            onChange={(e) =>
                              updateCardioInWorkout(cIdx, {
                                duration_minutes: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full min-w-0 h-7 sm:h-8 text-center font-black font-mono text-xs sm:text-sm text-slate-800 bg-white border border-pink-200 rounded-lg focus:outline-none focus:border-rose-400 p-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (c.duration_minutes || 30) + 5;
                              updateCardioInWorkout(cIdx, { duration_minutes: next });
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-pink-200 text-slate-600 hover:bg-pink-100 flex items-center justify-center active:scale-90 transition cursor-pointer"
                            title="เพิ่มเวลา 5 นาที"
                          >
                            <Plus size={13} className="stroke-[2.5]" />
                          </button>
                        </div>
                        {/* Quick Duration Chips */}
                        <div className="flex items-center justify-center gap-1 mt-1.5 flex-wrap">
                          {[15, 20, 30, 45].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => updateCardioInWorkout(cIdx, { duration_minutes: dur })}
                              className={`text-[9px] font-bold px-1 py-0.2 rounded border transition active:scale-95 cursor-pointer ${
                                c.duration_minutes === dur
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-white text-slate-600 border-pink-200/70 hover:bg-pink-50'
                              }`}
                            >
                              {dur}น.
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metric Estimates & Note */}
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-pink-50/60 rounded-xl border border-pink-100 text-[11px] flex-wrap">
                      <span className="text-slate-600">
                        🏃 ระยะทาง: <strong className="text-slate-800 font-mono">{((c.speed_kmh ?? 4.5) * (c.duration_minutes / 60)).toFixed(2)} km</strong>
                      </span>
                      <span className="text-slate-600">
                        🔥 เผาผลาญ: <strong className="text-rose-600 font-mono">{Math.round((c.duration_minutes * 6.5) * (1 + (c.incline_pct ?? 0) * 0.05))} kcal</strong>
                      </span>
                    </div>

                    {/* Note Input for Cardio */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={c.note || ''}
                        onChange={(e) => updateCardioInWorkout(cIdx, { note: e.target.value })}
                        placeholder="📝 บันทึกคาร์ดิโอ เช่น เดินชัน 10% สปีด 4.5 เหงื่อท่วม หัวใจโซน 2..."
                        className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 placeholder-pink-300 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Cardio Button */}
            <button
              type="button"
              onClick={() => {
                setCardioModalMode('add_to_active');
                setShowCardioModal(true);
              }}
              className="w-full py-3.5 px-4 rounded-3xl bg-pink-50/70 hover:bg-pink-100/80 border-2 border-dashed border-pink-300 text-slate-700 hover:text-rose-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Footprints size={17} className="text-rose-400" />
              <span>+ เพิ่มกิจกรรมคาร์ดิโอ / เดินชัน (Cardio Activity)</span>
            </button>
          </div>

          {/* Add Exercise into Active Workout */}
          <button
            onClick={() => setShowAddExerciseDrawer(true)}
            className="w-full py-4 rounded-3xl bg-white hover:bg-pink-50/80 border-2 border-dashed border-pink-300 text-slate-700 hover:text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus size={18} />
            เพิ่มท่าออกกำลังกายในเซสชันนี้
          </button>
        </div>
      ) : (
        /* If No Active Workout: Show Quick Start & Routine Programs */
        <div className="space-y-6">
          {/* Cute Pig Mascot Interactive Speech Bubble (Kawaii Game Dialogue) */}
          {(() => {
            const userHistory = workoutHistory || [];
            const evolution = calculatePigEvolution(userHistory, false);
            const isFemale = activeProfileKey === 'partner';
            const cfg = PIG_10_LEVELS[evolution.level];
            return (
              <div
                className={`relative p-4 sm:p-5 rounded-[28px] bg-white border-2 flex items-center gap-4 transition-all duration-300 ${
                  activeProfileKey === 'partner'
                    ? 'border-pink-200 shadow-[0_6px_0_#fecdd3]'
                    : 'border-sky-200 shadow-[0_6px_0_#bae6fd]'
                }`}
              >
                {/* Mascot with Animated GIF */}
                <div className="relative shrink-0">
                  <div className="cursor-pointer hover:scale-105 transition active:scale-95">
                    <PigMascot
                      level={evolution.level}
                      gender={isFemale ? 'female' : 'male'}
                      size="lg"
                      className="drop-shadow-xs"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-full border border-white">
                    Lv.{evolution.level}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full text-white shadow-2xs ${
                        activeProfileKey === 'partner' ? 'bg-pink-400' : 'bg-sky-400'
                      }`}
                    >
                      Lv.{evolution.level}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {activeProfileKey === 'partner' ? 'มะนาว 🌸' : 'แม็กนั่ม 🏋️‍♂️'}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-0.5">
                      <Flame size={11} className="text-orange-500" />
                      {evolution.streakWeeks} วีค
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                    {evolution.recentWeekCount === 0
                      ? 'สัปดาห์นี้ยังไม่ได้ซ้อม มาเริ่มกันเลย! 🏋️'
                      : `สัปดาห์นี้ซ้อมไปแล้ว ${evolution.recentWeekCount} เซสชัน ฟิตมาก! 🔥`}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Quick Start Card */}
          <div
            className={`p-5 sm:p-6 rounded-3xl bg-white border-2 relative overflow-hidden transition-all duration-300 ${
              activeProfileKey === 'partner'
                ? 'border-pink-200 shadow-[0_6px_0_#fecdd3]'
                : 'border-sky-200 shadow-[0_6px_0_#bae6fd]'
            }`}
          >
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                เริ่มการฝึกซ้อม ⚡
              </h2>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => startWorkout('การฝึกวันนี้')}
                  className={`py-2.5 px-5 text-sm flex items-center gap-2 cursor-pointer ${
                    activeProfileKey === 'partner' ? 'btn-candy-pink' : 'btn-candy-blue'
                  }`}
                >
                  <Play size={16} fill="currentColor" />
                  <span>ยกเวทอิสระ</span>
                </button>
                <button
                  onClick={() => {
                    setCardioModalMode('new_session');
                    setShowCardioModal(true);
                  }}
                  className="btn-candy-white py-2.5 px-4 text-sm flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Footprints size={16} className={activeProfileKey === 'partner' ? 'text-pink-500' : 'text-sky-500'} />
                  <span>คาร์ดิโอ / เดินชัน 🏃</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowYoutubeModal(true)}
                  className="py-2.5 px-4 text-sm flex items-center gap-2 cursor-pointer shadow-md rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold transition active:scale-95"
                >
                  <span className="text-base">▶️</span>
                  <span>ออกกำลังกายตามคลิป (YouTube) 🌸</span>
                </button>
              </div>
            </div>
          </div>

          {/* Routine Programs */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
                  <Dumbbell size={18} className={activeProfileKey === 'partner' ? 'text-pink-400' : 'text-sky-400'} />
                  <span>โปรแกรมการฝึก</span>
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-black border ${
                    activeProfileKey === 'partner'
                      ? 'bg-pink-100 text-pink-700 border-pink-200'
                      : 'bg-sky-100 text-sky-700 border-sky-200'
                  }`}
                >
                  {activeProfileKey === 'partner' ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'ต้องการโหลดตารางฝึกแนะนำตามโค้ช (4 วันหลัก + เสาร์ Optional) แทนที่ Routine ปัจจุบันใช่หรือไม่?'
                      )
                    ) {
                      resetProgramsToDefault();
                    }
                  }}
                  className="btn-candy-white px-2.5 py-1 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="รีเซ็ตโปรแกรมกลับสู่ตารางฝึกมาตรฐาน"
                >
                  <RotateCcw size={12} />
                  <span>ตารางแนะนำ</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProgram(null);
                    setShowRoutineModal(true);
                  }}
                  className={`px-3 py-1 text-xs flex items-center justify-center gap-1 cursor-pointer ${
                    activeProfileKey === 'partner' ? 'btn-candy-pink' : 'btn-candy-blue'
                  }`}
                >
                  <Plus size={14} />
                  <span>+ สร้าง Routine</span>
                </button>
              </div>
            </div>

            {/* Routine Search Input Bar */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={routineSearchQuery}
                onChange={(e) => setRoutineSearchQuery(e.target.value)}
                placeholder="ค้นหาโปรแกรม Routine (เช่น Push, Glute, ก้น, ขา, อก, Hip Thrust)..."
                className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-400 transition shadow-2xs"
              />
              {routineSearchQuery && (
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-200 space-y-2 shadow-xs">
                <Dumbbell size={28} className="mx-auto text-slate-300" />
                <p className="text-sm text-slate-700 font-bold">
                  ไม่พบโปรแกรม Routine ที่ตรงกับ "{routineSearchQuery}"
                </p>
                <button
                  onClick={() => setRoutineSearchQuery('')}
                  className="px-3 py-1 bg-slate-100 text-xs text-slate-600 rounded-lg hover:bg-slate-200 font-bold"
                >
                  ล้างการค้นหา
                </button>
              </div>
            ) : (
              <BentoGrid>
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.program_id}
                    className={`rounded-[28px] p-5 border-2 bg-white flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                      activeProfileKey === 'partner'
                        ? 'border-pink-200 shadow-[0_5px_0_#fecdd3]'
                        : 'border-sky-200 shadow-[0_5px_0_#bae6fd]'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm">
                            ⭐
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">{prog.name}</h4>
                            {prog.note && <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">{prog.note}</p>}
                          </div>
                        </div>
                        {prog.day_of_week && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {prog.day_of_week}
                          </span>
                        )}
                      </div>

                      {/* Preview exercises in routine */}
                      <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 mb-4">
                        {prog.items?.slice(0, 3).map((item, idx) => {
                          const ex = exercises.find((e) => e.exercise_id === item.exercise_id);
                          return (
                            <div
                              key={idx}
                              className="text-xs text-slate-700 flex items-center gap-1.5 truncate font-semibold"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span className="truncate">{ex?.name_en || item.exercise_id}</span>
                              <span className="text-slate-400 font-mono font-bold text-[11px]">
                                ({item.target_sets}x{item.target_reps})
                              </span>
                            </div>
                          );
                        })}
                        {prog.items && prog.items.length > 3 && (
                          <span className="text-[11px] text-slate-400 block pl-3 font-semibold">
                            +{prog.items.length - 3} ท่าเพิ่มเติม
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleStartProgram(prog.program_id)}
                        className={`flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeProfileKey === 'partner' ? 'btn-candy-pink' : 'btn-candy-blue'
                        }`}
                      >
                        <Play size={13} fill="currentColor" />
                        <span>เริ่มเล่น 🎮</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingProgram(prog);
                          setShowRoutineModal(true);
                        }}
                        className="btn-candy-white py-2 px-3 text-xs flex items-center gap-1 cursor-pointer"
                        title="แก้ไขโปรแกรมนี้"
                      >
                        <Edit2 size={13} />
                        <span>แก้ไข</span>
                      </button>
                    </div>
                  </div>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-slate-800 group-hover:text-rose-600 transition">
                            {ex.name_en}
                          </h4>
                          {isInSession && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                              อยู่ในเซสชันแล้ว
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="capitalize">{ex.muscle_primary}</span> · <span className="capitalize">{ex.equipment}</span>
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

      {/* Cardio Activity Setup Modal */}
      {showCardioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border-2 border-pink-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white flex items-center justify-center text-xl shadow-xs">
                  🏃‍♀️
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    {cardioModalMode === 'new_session'
                      ? 'เลือกประเภทคาร์ดิโอที่ต้องการฝึก'
                      : '+ เพิ่มกิจกรรมคาร์ดิโอในเซสชันนี้'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    เลือกเครื่องเล่นและปรับความชัน / ความเร็ว / เวลาเป้าหมาย
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCardioModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cardio Machine / Type Selector Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                1. เลือกเครื่องเล่น / กิจกรรม (Cardio Type):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CARDIO_TYPE_PRESETS.map((preset) => {
                  const isSelected = selectedCardioType === preset.type;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => handleSelectPresetType(preset.type)}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-pink-50 to-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-xs'
                          : 'bg-white hover:bg-pink-50/50 border-pink-200/80 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{preset.emoji}</span>
                      <span className="text-xs font-black text-slate-800 leading-tight">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Parameters Section */}
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                2. ปรับตั้งค่าเริ่มต้น (ปรับเปลี่ยนระหว่างซ้อมได้ตลอดเวลา):
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Duration */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-rose-500" />
                    <span>เวลา (นาที)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={cardioDuration}
                    placeholder="30"
                    onChange={(e) =>
                      setCardioDuration(e.target.value === '' ? '' : (parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-center font-black font-mono text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Incline */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <TrendingUp size={12} className="text-rose-500" />
                    <span>ความชัน (%)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={cardioIncline}
                    placeholder="10"
                    onChange={(e) =>
                      setCardioIncline(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                    }
                    className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-center font-black font-mono text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Speed */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Zap size={12} className="text-amber-500" />
                    <span>ความเร็ว (km/h)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={cardioSpeed}
                    placeholder="4.5"
                    onChange={(e) =>
                      setCardioSpeed(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                    }
                    className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-2 text-center font-black font-mono text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className="font-bold text-slate-500">เป้าหมายเร็ว:</span>
                {[
                  { label: '🔥 เดินชันเบิร์น 20น.', inc: 12, spd: 4.5, dur: 20 },
                  { label: '🔥 เดินชันเบิร์น 30น.', inc: 10, spd: 4.8, dur: 30 },
                  { label: '🚴 ปั่นจักรยาน 30น.', inc: 0, spd: 18, dur: 30 },
                  { label: '🪜 StairMaster 15น.', inc: 0, spd: 6, dur: 15 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCardioIncline(item.inc);
                      setCardioSpeed(item.spd);
                      setCardioDuration(item.dur);
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-pink-200 text-slate-700 hover:bg-pink-100 font-bold transition active:scale-95 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมายเหตุเพิ่มเติม (ถ้ามี):
              </label>
              <input
                type="text"
                value={cardioNote}
                onChange={(e) => setCardioNote(e.target.value)}
                placeholder="เช่น เดินชันท้ายเซสชัน, เหนื่อยกำลังดี, HR 135 bpm..."
                className="w-full bg-pink-50/30 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setShowCardioModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCardio}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-pink-200 cursor-pointer active:scale-95 transition"
              >
                <Play size={15} className="fill-current" />
                <span>
                  {cardioModalMode === 'new_session'
                    ? 'เริ่มเซสชันคาร์ดิโอ 🏃'
                    : '+ เพิ่มกิจกรรมลงในเซสชัน'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Workout Video AI Analysis & Session Modal */}
      <YoutubeWorkoutModal
        isOpen={showYoutubeModal}
        onClose={() => setShowYoutubeModal(false)}
        onStartLiveSession={handleStartLiveYoutubeWorkout}
        onSaveFinishedSession={handleSaveFinishedYoutubeWorkout}
        selectedUserKey={activeProfileKey}
      />
    </div>
  );
};
