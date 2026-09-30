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
} from 'lucide-react';
import { MagicCard } from '../ui/MagicCard';
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
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

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
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    return diff > 0 && diff < 360 ? diff : 60;
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins} นาที`;
    if (mins === 0) return `${hours} ชม.`;
    return `${hours} ชม. ${mins} น.`;
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
        };
        grouped.push(g);
      }
      g.sets.push(set);
      if (set.done && set.weight_kg > g.maxWeight) {
        g.maxWeight = set.weight_kg;
      }
    });

    return grouped;
  };

  const currentUserName =
    activeProfileKey === 'partner' ? partnerProfile.name : primaryProfile.name;
  const partnerUserName =
    activeProfileKey === 'partner' ? primaryProfile.name : partnerProfile.name;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner with Mascot */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/80 to-pink-100/90 border border-pink-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <PigMascot size="md" expression="workout" className="shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-500 text-white shadow-xs">
                ประวัติการออกกำลังกาย 📜
              </span>
              <span className="text-xs text-pink-700 font-bold">
                หมูอ้วน Fit Record
              </span>
            </div>
            <p className="text-xs text-pink-900 font-medium mt-1">
              บันทึกทุกหยาดเหงื่อ เซ็ต และน้ำหนักที่ยกได้ ย้อนดูความก้าวหน้าของคุณกับแฟน
            </p>
          </div>
        </div>

        <button
          onClick={openUnifiedSpreadsheet}
          className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 ml-auto"
          title="เปิด Spreadsheet ดูข้อมูลทั้งหมด"
        >
          <FileSpreadsheet size={15} className="text-emerald-600" />
          <span>ดูใน Google Sheets</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">จำนวนครั้งที่ซ้อม</span>
            <Dumbbell size={15} className="text-pink-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{totalWorkouts}</span>
            <span className="text-xs text-slate-400">เซสชัน</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">เวลาซ้อมสะสม</span>
            <Clock size={15} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatHoursMinutes(totalMinutes)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              เฉลี่ย ~{avgMinutes} นาที/ครั้ง
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">เซ็ตที่สำเร็จ</span>
            <CheckCircle2 size={15} className="text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-400 font-mono">
              {totalCompletedSets}
            </span>
            <span className="text-xs text-slate-400">เซ็ต</span>
          </div>
        </div>
      </div>

      {/* Scope Filter Tabs & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setScope('mine')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              scope === 'mine'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{activeProfileKey === 'partner' ? '🌸 ของมะนาว' : '🏋️‍♂️ ของแม็กนั่ม'}</span>
            <span className="text-[10px] opacity-80">
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
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              scope === 'partner'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{activeProfileKey === 'partner' ? '🏋️‍♂️ ของแม็กนั่ม' : '🌸 ของมะนาว'}</span>
            <span className="text-[10px] opacity-80">
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

          <button
            onClick={() => setScope('all')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              scope === 'all'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>รวม 2 คน</span>
            <span className="text-[10px] opacity-80">({allWorkoutHistory.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโปรแกรม, ท่าฝึก (เช่น Bench Press, Hip Thrust, อก, ขา)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900/60 p-10 rounded-3xl border border-slate-800 text-center space-y-3">
          <PigMascot size="lg" expression="sleep" className="mx-auto opacity-70" />
          <h4 className="text-base font-bold text-white">ยังไม่มีประวัติการฝึกซ้อมตามที่ค้นหา</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `ไม่พบรายการที่ตรงกับ "${searchQuery}" ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา`
              : 'เริ่มฝึกซ้อมวันนี้เพื่อบันทึกประวัติและสะสมสถิติไปด้วยกันนะหมูอ้วน!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 bg-slate-800 text-pink-400 font-semibold text-xs rounded-xl hover:bg-slate-700"
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
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg transition"
              >
                {/* Session Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isPartner
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isPartner ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        {sess.date}
                      </span>
                      {sess.start_time && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={12} />
                          {sess.start_time} - {sess.end_time || 'เสร็จสิ้น'} ({sessionDurationMins} น.)
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      {sess.program_name || 'เซสชันการฝึกซ้อม'}
                    </h4>

                    {sess.note && (
                      <p className="text-xs text-slate-400 italic">
                        "{sess.note}"
                      </p>
                    )}
                  </div>

                  {/* Summary Metric Badges (Duration, Top Weight, Completed Sets) */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        ระยะเวลา
                      </span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {sessionDurationMins} นาที
                      </span>
                    </div>

                    {sessionMaxWeight > 0 && (
                      <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                        <span className="text-[10px] text-amber-500/80 block uppercase font-bold">
                          ยกหนักสุด
                        </span>
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {sessionMaxWeight} kg
                        </span>
                      </div>
                    )}

                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        เซ็ตสำเร็จ
                      </span>
                      <span className="text-sm font-black text-sky-400 font-mono">
                        {completedSets.length} เซ็ต
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exercise Pills Preview (Collapsed) */}
                {!isExpanded && groupedExercises.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {groupedExercises.map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 font-medium"
                      >
                        {g.exercise_name.split(' (')[0]} ({g.sets.length} เซ็ต)
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell size={14} className="text-pink-400" />
                      รายละเอียดท่าฝึกและเซ็ตทั้งหมด ({groupedExercises.length} ท่า)
                    </h5>

                    <div className="space-y-3">
                      {groupedExercises.map((group, exIdx) => {
                        const exObj = exercises.find((e) => e.exercise_id === group.exercise_id);
                        return (
                          <div
                            key={exIdx}
                            className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-400" />
                                <span className="text-sm font-bold text-white">
                                  {group.exercise_name}
                                </span>
                                {exObj?.muscle_primary && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                                    {exObj.muscle_primary}
                                  </span>
                                )}
                              </div>

                              {group.maxWeight > 0 && (
                                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 font-mono">
                                  <Award size={13} />
                                  Top: {group.maxWeight} kg
                                </span>
                              )}
                            </div>

                            {/* Sets Table */}
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div className="text-[11px] text-slate-500 font-semibold py-1 bg-slate-900 rounded-lg">
                                เซ็ต
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold py-1 bg-slate-900 rounded-lg">
                                น้ำหนัก
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold py-1 bg-slate-900 rounded-lg">
                                จำนวนครั้ง
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold py-1 bg-slate-900 rounded-lg">
                                สถานะ
                              </div>

                              {group.sets.map((s, sIdx) => {
                                const isTop = s.done && s.weight_kg === group.maxWeight && group.maxWeight > 0;
                                return (
                                  <React.Fragment key={s.set_id || sIdx}>
                                    <div className="py-1 text-slate-300 font-mono font-bold flex items-center justify-center">
                                      #{s.set_no || sIdx + 1}
                                    </div>
                                    <div
                                      className={`py-1 font-mono font-bold ${
                                        isTop ? 'text-amber-400' : 'text-white'
                                      }`}
                                    >
                                      {s.weight_kg} kg
                                    </div>
                                    <div className="py-1 text-slate-200 font-mono font-bold">
                                      {s.reps} ครั้ง
                                    </div>
                                    <div className="py-1 flex items-center justify-center">
                                      {s.done ? (
                                        <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-bold">
                                          <CheckCircle2 size={13} /> สำเร็จ
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 text-[11px]">ข้าม</span>
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
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => toggleExpand(sess.session_id)}
                    className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 transition"
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
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                      title="เริ่มการฝึกใหม่โดยดึงท่าจากเซสชันนี้"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>เล่นซ้ำเซสชันนี้</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบประวัติเซสชัน "${sess.program_name || 'นี้'}" วันที่ ${sess.date} ใช่หรือไม่?`)) {
                          deleteWorkoutSession(sess.session_id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
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
