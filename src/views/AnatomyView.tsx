import React, { useState } from 'react';
import { MuscleKey, Exercise } from '../types';
import { MUSCLE_GROUPS } from '../data/muscles';
import { AnatomyDiagram } from '../components/anatomy/AnatomyDiagram';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import { useApp } from '../context/AppContext';
import { Plus, Info, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';

export const AnatomyView: React.FC = () => {
  const { exercises, addExerciseToWorkout } = useApp();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey>('chest');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleKey | null>(null);
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  const activeMuscleInfo = MUSCLE_GROUPS[selectedMuscle];
  const hoveredInfo = hoveredMuscle ? MUSCLE_GROUPS[hoveredMuscle] : null;

  // Filter exercises targeting this muscle
  const targetedExercises = exercises.filter(
    (ex) => ex.muscle_primary === selectedMuscle || ex.muscle_secondary?.includes(selectedMuscle)
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Top Controls: Front / Back Toggle & Current Muscle Headline */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-400" />
              แผนผังกายวิภาค (Interactive Anatomy)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              แตะกล้ามเนื้อในหุ่นจำลอง เพื่อดูชื่อทางการแพทย์และท่าฝึกเฉพาะมัด
            </p>
          </div>

          {/* Front / Back Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setView('front')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                view === 'front'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ด้านหน้า
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                view === 'back'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ด้านหลัง
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Anatomy Diagram / Right Muscle Info & Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Diagram Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center relative overflow-hidden shadow-xl">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Hover indicator tooltip */}
          <div className="h-7 mb-1 flex items-center justify-center text-center">
            {hoveredInfo ? (
              <span className="text-xs font-bold text-sky-400 animate-fadeIn">
                ชี้อยู่ที่: {hoveredInfo.nameTh} ({hoveredInfo.latinName})
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                แตะหรือเลื่อนเมาส์บนกล้ามเนื้อมัดที่ต้องการ
              </span>
            )}
          </div>

          {/* Diagram Component */}
          <AnatomyDiagram
            view={view}
            selectedMuscle={selectedMuscle}
            hoveredMuscle={hoveredMuscle}
            onSelectMuscle={(m) => setSelectedMuscle(m)}
            onHoverMuscle={(m) => setHoveredMuscle(m)}
          />

          {/* Quick Muscle Pills bar for easy mobile selection */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5 justify-center">
            {Object.values(MUSCLE_GROUPS)
              .filter((m) => m.view === view || m.view === 'both')
              .map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMuscle(m.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    selectedMuscle === m.key
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {m.nameTh}
                </button>
              ))}
          </div>
        </div>

        {/* Selected Muscle Details & Exercises Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Muscle Header Card */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  กล้ามเนื้อที่เลือก
                </span>
                <h3 className="text-2xl font-black text-white mt-1.5">{activeMuscleInfo?.nameTh}</h3>
                <p className="text-sm font-medium text-slate-400 italic">
                  {activeMuscleInfo?.latinName}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                {targetedExercises.length}
              </div>
            </div>

            {activeMuscleInfo?.description && (
              <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                {activeMuscleInfo.description}
              </p>
            )}

            {/* Sub-muscles tags */}
            {activeMuscleInfo?.submuscles && (
              <div className="mt-3.5">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  กล้ามเนื้อย่อยทางการแพทย์ (Sub-muscles):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMuscleInfo.submuscles.map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Targeted Exercise List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Dumbbell size={16} className="text-emerald-400" />
                ท่าฝึกสำหรับ {activeMuscleInfo?.nameTh} ({targetedExercises.length} ท่า)
              </h4>
              <span className="text-[11px] text-slate-400">แตะที่ชื่อเพื่อดูวิธีเล่น</span>
            </div>

            {targetedExercises.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                ยังไม่มีท่าฝึกในกลุ่มนี้
              </div>
            ) : (
              <div className="space-y-2">
                {targetedExercises.map((exercise) => {
                  const isPrimary = exercise.muscle_primary === selectedMuscle;
                  return (
                    <div
                      key={exercise.exercise_id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      {/* Left: Clickable Info to open Modal */}
                      <button
                        onClick={() => setActiveExerciseModal(exercise)}
                        className="flex-1 text-left pr-2 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition">
                          <Dumbbell size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                              {exercise.name_en}
                            </span>
                            {isPrimary ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium">
                                มัดหลัก
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                มัดรอง
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {exercise.name_th} · <span className="capitalize">{exercise.equipment}</span>
                          </span>
                        </div>
                      </button>

                      {/* Right: Quick Add Button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            addExerciseToWorkout(exercise);
                            alert(`เพิ่ม "${exercise.name_th}" เข้าโปรแกรมฝึกเรียบร้อยแล้ว!`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition active:scale-95"
                          title="เพิ่มเข้าโปรแกรมวันนี้"
                        >
                          <Plus size={14} />
                          <span className="hidden sm:inline">เพิ่มเข้าเซสชัน</span>
                        </button>
                        <button
                          onClick={() => setActiveExerciseModal(exercise)}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Detail Sheet / Modal */}
      {activeExerciseModal && (
        <ExerciseDetailModal
          exercise={activeExerciseModal}
          onClose={() => setActiveExerciseModal(null)}
          onAddToWorkout={(ex) => {
            addExerciseToWorkout(ex);
            alert(`เพิ่ม "${ex.name_th}" เข้าโปรแกรมฝึกแล้ว!`);
          }}
        />
      )}
    </div>
  );
};
