import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkoutSession, Exercise } from '../../types';
import {
  Clock,
  Dumbbell,
  Search,
  X,
  Trash2,
  Play,
  ChevronDown,
  ChevronUp,
  Flame,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  Activity,
  Footprints,
} from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface WorkoutHistorySectionProps {
  onStartRoutineWithExercises?: (name: string, exercises: Exercise[]) => void;
}

export const WorkoutHistorySection: React.FC<WorkoutHistorySectionProps> = ({
  onStartRoutineWithExercises,
}) => {
  const {
    allWorkoutHistory,
    deleteWorkoutSession,
    activeProfileKey,
    primaryProfile,
    partnerProfile,
    exercises,
    startWorkout,
    openUnifiedSpreadsheet,
  } = useApp();

  const [scope, setScope] = useState<'mine' | 'partner' | 'all'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});

  // Filter based on scope
  const scopedHistory = allWorkoutHistory.filter((sess) => {
    if (scope === 'all') return true;
    if (scope === 'mine') return (sess.user_id || 'primary') === activeProfileKey;
    if (scope === 'partner') {
      const partnerKey = activeProfileKey === 'primary' ? 'partner' : 'primary';
      return (sess.user_id || 'primary') === partnerKey;
    }
    return true;
  });

  // Filter based on search query
  const filteredHistory = scopedHistory.filter((sess) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = (sess.program_name || '').toLowerCase().includes(q);
    const matchUser = (sess.user_name || '').toLowerCase().includes(q);
    const matchDate = (sess.date || '').toLowerCase().includes(q);
    const matchNote = (sess.note || '').toLowerCase().includes(q);
    const matchExercise = sess.sets?.some((s) => {
      const exName = (s.exercise_name || '').toLowerCase();
      const exObj = exercises.find((e) => e.exercise_id === s.exercise_id);
      return (
        exName.includes(q) ||
        Boolean(exObj?.name_th.toLowerCase().includes(q)) ||
        Boolean(exObj?.name_en.toLowerCase().includes(q))
      );
    });
    return matchName || matchUser || matchDate || matchNote || matchExercise;
  });

  // Toggle expand/collapse of a session
  const toggleExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Repeat a workout session
  const handleRepeatSession = (sess: WorkoutSession) => {
    if (!sess.sets || sess.sets.length === 0) {
      startWorkout(sess.program_name || 'การฝึกซ้อม');
      return;
    }

    const uniqueExerciseIds = Array.from(new Set(sess.sets.map((s) => s.exercise_id)));
    const matchedExercises: Exercise[] = [];
    uniqueExerciseIds.forEach((id) => {
      const found = exercises.find((e) => e.exercise_id === id);
      if (found) matchedExercises.push(found);
    });

    if (onStartRoutineWithExercises && matchedExercises.length > 0) {
      onStartRoutineWithExercises(sess.program_name || 'การฝึกซ้อม', matchedExercises);
    } else {
      startWorkout(sess.program_name || 'การฝึกซ้อม', matchedExercises);
    }
  };

  // Calculate duration in minutes from HH:mm
  const calculateDurationMinutes = (start?: string, end?: string): number => {
    if (!start || !end) return 60;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 60;
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    return diff > 0 && diff < 360 ? diff : 60;
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins} นาที`;
    if (mins === 0) return `${hours} ชม.`;
    return `${hours}ชม. ${mins}น.`;
  };

  // Calculate statistics across scoped sessions
  const totalWorkouts = scopedHistory.length;
  const totalMinutes = scopedHistory.reduce((sum, sess) => {
    return sum + calculateDurationMinutes(sess.start_time, sess.end_time);
  }, 0);
  const avgMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
  const totalCompletedSets = scopedHistory.reduce((sum, sess) => {
    return sum + (sess.sets?.filter((s) => s.done)?.length || 0);
  }, 0);

  // Group sets by exercise for a session
  const groupSetsByExercise = (sets: WorkoutSession['sets']) => {
    if (!sets) return [];
    const grouped: {
      exercise_id: string;
      exercise_name: string;
      sets: typeof sets;
      maxWeight: number;
      exerciseNote?: string;
    }[] = [];

    sets.forEach((set) => {
      let g = grouped.find((item) => item.exercise_id === set.exercise_id);
      if (!g) {
        const exObj = exercises.find((e) => e.exercise_id === set.exercise_id);
        const displayName = exObj
          ? `${exObj.name_th} (${exObj.name_en})`
          : set.exercise_name || set.exercise_id;

        g = {
          exercise_id: set.exercise_id,
          exercise_name: displayName,
          sets: [],
          maxWeight: 0,
          exerciseNote: set.note,
        };
        grouped.push(g);
      }
      g.sets.push(set);
      if (set.note && !g.exerciseNote) {
        g.exerciseNote = set.note;
      }
      if (set.done && set.weight_kg > g.maxWeight) {
        g.maxWeight = set.weight_kg;
      }
    });

    return grouped;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner with Mascot (Pastel Pink) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/80 to-pink-100/90 border border-pink-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <PigMascot size="md" expression="workout" className="shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs">
                ประวัติการออกกำลังกาย 📜
              </span>
              <span className="text-xs text-rose-500 font-bold">
                หมูอ้วน Fit Record
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              บันทึกทุกหยาดเหงื่อ เซ็ต และน้ำหนักที่ยกได้ ย้อนดูความก้าวหน้าของคุณกับแฟน
            </p>
          </div>
        </div>

        <button
          onClick={openUnifiedSpreadsheet}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 ml-auto cursor-pointer"
          title="เปิด Spreadsheet ดูข้อมูลทั้งหมด"
        >
          <FileSpreadsheet size={15} className="text-rose-400" />
          <span>ดูใน Google Sheets รวม</span>
        </button>
      </div>

      {/* Stats Summary Cards (Pastel Pink & Cream) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white/95 border border-pink-200/90 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold">จำนวนครั้ง</span>
            <Dumbbell size={14} className="text-rose-400 shrink-0" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-black text-slate-800">{totalWorkouts}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">ครั้ง</span>
          </div>
        </div>

        <div className="bg-white/95 border border-pink-200/90 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold">เวลารวม</span>
            <Clock size={14} className="text-rose-400 shrink-0" />
          </div>
          <div className="mt-1.5 flex flex-col">
            <span className="text-xs sm:text-base md:text-lg font-black text-rose-500 font-mono truncate">
              {formatHoursMinutes(totalMinutes)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-medium truncate">
              เฉลี่ย ~{avgMinutes}น./ครั้ง
            </span>
          </div>
        </div>

        <div className="bg-white/95 border border-pink-200/90 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold">เซ็ตสำเร็จ</span>
            <CheckCircle2 size={14} className="text-rose-400 shrink-0" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-black text-slate-800 font-mono">
              {totalCompletedSets}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">เซ็ต</span>
          </div>
        </div>
      </div>

      {/* Scope Filter Tabs & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 p-1.5 bg-white/95 border border-pink-200/90 rounded-2xl shadow-xs">
          <button
            onClick={() => setScope('mine')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              scope === 'mine'
                ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-pink-50/60'
            }`}
          >
            <span>{activeProfileKey === 'partner' ? '🌸 ของมะนาว (Manow)' : '🏋️‍♂️ ของแม็กนั่ม'}</span>
            <span className="text-[10px] opacity-80 font-mono">
              (
              {
                allWorkoutHistory.filter(
                  (s) => (s.user_id || 'primary') === activeProfileKey
                ).length
              }
              )
            </span>
          </button>

          <button
            onClick={() => setScope('partner')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              scope === 'partner'
                ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-pink-50/60'
            }`}
          >
            <span>{activeProfileKey === 'partner' ? '🏋️‍♂️ ของแม็กนั่ม' : '🌸 ของมะนาว (Manow)'}</span>
            <span className="text-[10px] opacity-80 font-mono">
              (
              {
                allWorkoutHistory.filter(
                  (s) =>
                    (s.user_id || 'primary') ===
                    (activeProfileKey === 'primary' ? 'partner' : 'primary')
                ).length
              }
              )
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโปรแกรม, ท่าฝึก (เช่น Bench Press, Hip Thrust, อก, ขา)..."
            className="w-full bg-white border border-pink-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-pink-950 placeholder-pink-400 focus:outline-none focus:border-rose-400 transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-700"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white/95 p-10 rounded-3xl border border-pink-200 text-center space-y-3 shadow-xs">
          <PigMascot size="lg" expression="sleep" className="mx-auto opacity-70" />
          <h4 className="text-base font-bold text-pink-950">ยังไม่มีประวัติการฝึกซ้อมตามที่ค้นหา</h4>
          <p className="text-xs text-pink-800/70 max-w-sm mx-auto font-medium">
            {searchQuery
              ? `ไม่พบรายการที่ตรงกับ "${searchQuery}" ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา`
              : 'เริ่มฝึกซ้อมวันนี้เพื่อบันทึกประวัติและสะสมสถิติไปด้วยกันนะหมูอ้วน!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 bg-pink-50 text-rose-600 font-bold text-xs rounded-xl hover:bg-pink-100 border border-pink-200"
            >
              ล้างการค้นหา
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((sess) => {
            const isPartner = sess.user_id === 'partner';
            const completedSets = sess.sets?.filter((s) => s.done) || [];
            const sessionDurationMins = calculateDurationMinutes(sess.start_time, sess.end_time);
            const sessionMaxWeight = Math.max(
              ...completedSets.map((s) => s.weight_kg),
              0
            );
            const isExpanded = Boolean(expandedSessionIds[sess.session_id]);
            const groupedExercises = groupSetsByExercise(sess.sets);

            return (
              <div
                key={sess.session_id}
                className="bg-white/95 border border-pink-200 hover:border-pink-300 rounded-3xl p-4 sm:p-5 shadow-xs transition"
              >
                {/* Session Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isPartner
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-pink-100 text-pink-800 border border-pink-200'
                        }`}
                      >
                        {isPartner ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                      </span>
                      <span className="text-xs text-pink-800/80 font-medium flex items-center gap-1">
                        <Calendar size={13} className="text-pink-400" />
                        {sess.date}
                      </span>
                      {sess.start_time && (
                        <span className="text-xs text-pink-700/80 flex items-center gap-1 font-mono font-medium">
                          <Clock size={12} />
                          {sess.start_time} - {sess.end_time || 'เสร็จสิ้น'} ({sessionDurationMins} น.)
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                      {sess.program_name || 'เซสชันการฝึกซ้อม'}
                    </h4>

                    {sess.note && (
                      <p className="text-xs text-slate-600 italic font-medium bg-pink-50/60 px-2.5 py-1 rounded-xl border border-pink-100 inline-block">
                        📝 "{sess.note}"
                      </p>
                    )}
                  </div>

                  {/* Summary Metric Badges (Duration, Cardio, Top Weight, Completed Sets) */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    <div className="bg-pink-50 px-3 py-1.5 rounded-2xl border border-pink-200 text-right">
                      <span className="text-[10px] text-pink-700 block uppercase font-bold">
                        ระยะเวลา
                      </span>
                      <span className="text-sm font-black text-slate-800 font-mono">
                        {sessionDurationMins} นาที
                      </span>
                    </div>

                    {sess.cardio && sess.cardio.length > 0 && (
                      <div className="bg-rose-50 px-3 py-1.5 rounded-2xl border border-rose-200 text-right">
                        <span className="text-[10px] text-rose-600 block uppercase font-bold flex items-center gap-0.5 justify-end">
                          <Footprints size={11} /> คาร์ดิโอ
                        </span>
                        <span className="text-sm font-black text-rose-600 font-mono">
                          {sess.cardio.reduce((acc, c) => acc + (c.duration_minutes || 0), 0)} น.
                        </span>
                      </div>
                    )}

                    {sessionMaxWeight > 0 && (
                      <div className="bg-rose-50 px-3 py-1.5 rounded-2xl border border-rose-200 text-right">
                        <span className="text-[10px] text-rose-700 block uppercase font-bold">
                          ยกหนักสุด
                        </span>
                        <span className="text-sm font-black text-rose-600 font-mono">
                          {sessionMaxWeight} kg
                        </span>
                      </div>
                    )}

                    <div className="bg-sky-50 px-3 py-1.5 rounded-2xl border border-sky-200 text-right">
                      <span className="text-[10px] text-sky-700 block uppercase font-bold">
                        เซ็ตสำเร็จ
                      </span>
                      <span className="text-sm font-black text-sky-800 font-mono">
                        {completedSets.length} เซ็ต
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsed Preview: Exercise & Cardio Pills */}
                {!isExpanded && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {groupedExercises.map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-pink-50/70 border border-pink-200 text-slate-700 font-medium"
                      >
                        {g.exercise_name.split(' (')[0]} ({g.sets.length} เซ็ต)
                      </span>
                    ))}

                    {/* Cardio Activity Pills */}
                    {sess.cardio &&
                      sess.cardio.map((c, cIdx) => (
                        <span
                          key={`c-${cIdx}`}
                          className="text-[11px] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Footprints size={12} className="text-rose-500" />
                          <span>{c.machine_name || 'คาร์ดิโอ'}</span>
                          <span className="font-mono text-slate-700">{c.duration_minutes}น.</span>
                          {c.incline_pct !== undefined && c.incline_pct > 0 && (
                            <span className="text-[10px] text-rose-500 font-mono font-normal">
                              ({c.incline_pct}% ชัน)
                            </span>
                          )}
                        </span>
                      ))}
                  </div>
                )}

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-pink-100 space-y-4 animate-fadeIn">
                    {/* Cardio Detailed Section (if any) */}
                    {sess.cardio && sess.cardio.length > 0 && (
                      <div className="bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-pink-50/70 p-3.5 rounded-2xl border border-pink-200/90 space-y-2.5">
                        <h5 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity size={14} className="text-rose-500" />
                          กิจกรรมคาร์ดิโอ / เดินชัน ({sess.cardio.length} รายการ)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {sess.cardio.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-white/95 p-3 rounded-2xl border border-pink-200 shadow-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <Footprints size={14} className="text-rose-500" />
                                  {c.machine_name || 'คาร์ดิโอ'}
                                </span>
                                <span className="text-xs font-black text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                                  {c.duration_minutes} นาที
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono flex-wrap">
                                {c.incline_pct !== undefined && (
                                  <span className="bg-pink-50 px-2 py-0.5 rounded-md text-pink-700 font-bold">
                                    ความชัน {c.incline_pct}%
                                  </span>
                                )}
                                {c.speed_kmh !== undefined && (
                                  <span className="bg-pink-50 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                                    ความเร็ว {c.speed_kmh} km/h
                                  </span>
                                )}
                                {c.speed_kmh !== undefined && (
                                  <span className="text-slate-500">
                                    ~{((c.speed_kmh * (c.duration_minutes / 60))).toFixed(1)} km
                                  </span>
                                )}
                              </div>
                              {c.note && (
                                <p className="text-[11px] text-slate-600 italic bg-pink-50/50 p-2 rounded-xl border border-pink-100">
                                  📝 {c.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weight Training Exercises Section */}
                    {groupedExercises.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Dumbbell size={14} className="text-rose-500" />
                          รายละเอียดท่าฝึกและเซ็ตทั้งหมด ({groupedExercises.length} ท่า)
                        </h5>

                        {groupedExercises.map((group, exIdx) => {
                          const exObj = exercises.find((e) => e.exercise_id === group.exercise_id);
                          return (
                            <div
                              key={exIdx}
                              className="bg-pink-50/50 p-3.5 rounded-2xl border border-pink-200/80 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span className="text-sm font-bold text-slate-800">
                                    {group.exercise_name}
                                  </span>
                                  {exObj?.muscle_primary && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-700 font-bold border border-pink-200">
                                      {exObj.muscle_primary}
                                    </span>
                                  )}
                                </div>

                                {group.maxWeight > 0 && (
                                  <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 font-mono">
                                    <Award size={13} />
                                    Top: {group.maxWeight} kg
                                  </span>
                                )}
                              </div>

                              {/* Exercise Note if any */}
                              {group.exerciseNote && (
                                <div className="text-xs text-rose-600 bg-white/90 px-3 py-1.5 rounded-xl border border-pink-200 flex items-center gap-1.5">
                                  <span className="font-bold text-slate-500">📝 หมายเหตุ:</span>
                                  <span className="italic">{group.exerciseNote}</span>
                                </div>
                              )}

                              {/* Sets Table */}
                              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div className="text-[11px] text-slate-600 font-bold py-1 bg-white rounded-lg border border-pink-200">
                                  เซ็ต
                                </div>
                                <div className="text-[11px] text-slate-600 font-bold py-1 bg-white rounded-lg border border-pink-200">
                                  น้ำหนัก
                                </div>
                                <div className="text-[11px] text-slate-600 font-bold py-1 bg-white rounded-lg border border-pink-200">
                                  จำนวนครั้ง
                                </div>
                                <div className="text-[11px] text-slate-600 font-bold py-1 bg-white rounded-lg border border-pink-200">
                                  สถานะ
                                </div>

                                {group.sets.map((s, sIdx) => {
                                  const isTop =
                                    s.done && s.weight_kg === group.maxWeight && group.maxWeight > 0;
                                  return (
                                    <React.Fragment key={s.set_id || sIdx}>
                                      <div className="py-1 text-slate-700 font-mono font-bold flex items-center justify-center">
                                        #{s.set_no || sIdx + 1}
                                      </div>
                                      <div
                                        className={`py-1 font-mono font-bold ${
                                          isTop ? 'text-rose-600 font-black' : 'text-slate-800'
                                        }`}
                                      >
                                        {s.weight_kg} kg
                                      </div>
                                      <div className="py-1 text-slate-700 font-mono font-bold">
                                        {s.reps} ครั้ง
                                      </div>
                                      <div className="py-1 flex items-center justify-center">
                                        {s.done ? (
                                          <span className="text-rose-600 flex items-center gap-0.5 text-[11px] font-bold">
                                            <CheckCircle2 size={13} /> สำเร็จ
                                          </span>
                                        ) : (
                                          <span className="text-pink-400 text-[11px]">ข้าม</span>
                                        )}
                                      </div>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="mt-3.5 pt-3 border-t border-pink-100 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => toggleExpand(sess.session_id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={14} /> ซ่อนรายละเอียดเซ็ต
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> ดูรายละเอียดแต่ละเซ็ต ({groupedExercises.length} ท่า)
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRepeatSession(sess)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                      title="เริ่มการฝึกใหม่โดยดึงท่าจากเซสชันนี้"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>เล่นซ้ำเซสชันนี้</span>
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `คุณต้องการลบประวัติเซสชัน "${sess.program_name || 'นี้'}" วันที่ ${
                              sess.date
                            } ใช่หรือไม่?`
                          )
                        ) {
                          deleteWorkoutSession(sess.session_id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-pink-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="ลบประวัติเซสชันนี้"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
