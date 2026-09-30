import React, { useState } from 'react';
import { MuscleKey, Exercise, SubMuscleDetail } from '../types';
import { MUSCLE_GROUPS } from '../data/muscles';
import { AnatomyDiagram } from '../components/anatomy/AnatomyDiagram';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import { useApp } from '../context/AppContext';
import {
  Dumbbell,
  Sparkles,
  ChevronRight,
  Plus,
  Compass,
  Activity,
  Layers,
  HelpCircle,
  X,
  Target,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const AnatomyView: React.FC = () => {
  const { exercises, addExerciseToWorkout } = useApp();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey>('chest');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleKey | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);

  const activeMuscleInfo = MUSCLE_GROUPS[selectedMuscle];
  const hoveredInfo = hoveredMuscle ? MUSCLE_GROUPS[hoveredMuscle] : null;

  // Active subdivision or first subdivision
  const currentSubdivisions = activeMuscleInfo?.subdivisions || [];
  const activeSubdivision: SubMuscleDetail | undefined =
    currentSubdivisions.find((s) => s.id === selectedSubId) || currentSubdivisions[0];

  // Exercises targeting this muscle
  const targetedExercises = exercises.filter(
    (ex) => ex.muscle_primary === selectedMuscle || ex.muscle_secondary?.includes(selectedMuscle)
  );

  const handleSelectMuscle = (key: MuscleKey) => {
    setSelectedMuscle(key);
    const targetGroup = MUSCLE_GROUPS[key];
    if (targetGroup?.subdivisions && targetGroup.subdivisions.length > 0) {
      setSelectedSubId(targetGroup.subdivisions[0].id);
    } else {
      setSelectedSubId(null);
    }
  };

  const getPlaneColor = (plane?: string) => {
    switch (plane) {
      case 'Sagittal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Frontal':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'Transverse':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-pink-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                แผนผังกายวิภาค & ชีวกลศาสตร์การเคลื่อนไหว
              </h2>
              <p className="text-xs text-slate-500">
                วิเคราะห์กล้ามเนื้อแบบเจาะลึกส่วนย่อย (Sub-divisions), ระนาบการเคลื่อนไหว (Planes) และคำศัพท์ Biomechanics
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Glossary Button & Front/Back Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGlossary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition cursor-pointer active:scale-95"
            title="เปิดพจนานุกรมศัพท์การเคลื่อนไหว (Movement Glossary)"
          >
            <BookOpen size={14} />
            <span>คู่มือการเคลื่อนไหว</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setView('front')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                view === 'front'
                  ? 'bg-white text-pink-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ด้านหน้า
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                view === 'back'
                  ? 'bg-white text-pink-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ด้านหลัง
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Anatomy Diagram / Right Muscle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Diagram Card */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/80 p-4 flex flex-col items-center relative shadow-sm">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fce7f320_1px,transparent_1px),linear-gradient(to_bottom,#fce7f320_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-2xl" />

          {/* Hover indicator tooltip */}
          <div className="h-7 mb-1 flex items-center justify-center text-center z-10">
            {hoveredInfo ? (
              <span className="text-xs font-bold text-pink-600 animate-fadeIn bg-pink-50 px-3 py-0.5 rounded-full border border-pink-200">
                ชี้อยู่ที่: {hoveredInfo.nameTh} ({hoveredInfo.latinName})
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                แตะมัดกล้ามเนื้อในหุ่น หรือเลือกจากปุ่มด้านล่าง
              </span>
            )}
          </div>

          {/* Diagram Component */}
          <div className="relative z-10 w-full flex justify-center py-2">
            <AnatomyDiagram
              view={view}
              selectedMuscle={selectedMuscle}
              hoveredMuscle={hoveredMuscle}
              onSelectMuscle={handleSelectMuscle}
              onHoverMuscle={(m) => setHoveredMuscle(m)}
            />
          </div>

          {/* Quick Muscle Pills bar for easy mobile selection */}
          <div className="w-full mt-3 pt-3 border-t border-pink-100 flex flex-wrap gap-1.5 justify-center z-10">
            {Object.values(MUSCLE_GROUPS)
              .filter((m) => m.view === view || m.view === 'both')
              .map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleSelectMuscle(m.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    selectedMuscle === m.key
                      ? 'bg-pink-500 text-white border-pink-500 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-600'
                  }`}
                >
                  {m.nameTh}
                </button>
              ))}
          </div>
        </div>

        {/* Selected Muscle Details & Exercises Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Muscle Header Card */}
          <div className="bg-white/95 rounded-2xl border border-pink-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 inline-block">
                  กลุ่มกล้ามเนื้อหลัก (Primary Muscle Group)
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {activeMuscleInfo?.nameTh}
                </h3>
                <p className="text-xs font-medium text-slate-400 italic">
                  {activeMuscleInfo?.nameEn} · {activeMuscleInfo?.latinName}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-medium">ท่าในระบบ</span>
                <span className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center font-black text-sm">
                  {targetedExercises.length}
                </span>
              </div>
            </div>

            {activeMuscleInfo?.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                {activeMuscleInfo.description}
              </p>
            )}

            {/* Sub-divisions Selection Tabs */}
            {currentSubdivisions.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers size={14} className="text-pink-500" />
                    เลือกส่วนย่อยเพื่อดูชีวกลศาสตร์ (Sub-divisions):
                  </span>
                  <span className="text-[10px] text-slate-400">คลิกเพื่อสลับมัดย่อย</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {currentSubdivisions.map((sub) => {
                    const isSelected = activeSubdivision?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50 hover:text-pink-600'
                        }`}
                      >
                        {sub.nameTh}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Deep Kinesiology & Biomechanics Card for the selected subdivision */}
          {activeSubdivision && (
            <div className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/20 rounded-2xl border border-rose-200 p-4 sm:p-5 shadow-sm space-y-4">
              {/* Subdivision Header with Medical Latin Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Target size={18} className="text-rose-500" />
                      {activeSubdivision.nameTh}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPlaneColor(
                        activeSubdivision.planeOfMotion
                      )}`}
                    >
                      🧭 {activeSubdivision.planeOfMotion} Plane
                    </span>
                  </div>
                  <p className="text-xs font-medium text-rose-600 mt-0.5">
                    {activeSubdivision.nameEn}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    ชื่อทางการแพทย์: {activeSubdivision.latinName}
                  </p>
                </div>
              </div>

              {/* Origin & Insertion (จุดเกาะ) */}
              {activeSubdivision.originInsertion && (
                <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    📍 จุดเกาะต้น - จุดเกาะปลาย (Origin & Insertion):
                  </span>
                  <span className="text-slate-600 leading-relaxed">
                    {activeSubdivision.originInsertion}
                  </span>
                </div>
              )}

              {/* Fiber Line of Pull & Alignment */}
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass size={14} className="text-rose-500" />
                  แนวเส้นใย & ทิศทางแรงต้าน (Fiber Orientation & Line of Pull):
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {activeSubdivision.fiberOrientation}
                </p>
              </div>

              {/* Primary Joint Actions & Movements */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={14} className="text-rose-500" />
                  การเคลื่อนไหวของข้อต่อหลัก (Primary Joint Actions & Movements):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeSubdivision.primaryActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biomechanical Explanation Note */}
              <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 text-xs space-y-1.5">
                <span className="font-bold text-rose-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-600" />
                  หลักการชีวกลศาสตร์ (Biomechanical Rationale):
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {activeSubdivision.biomechanicsNote}
                </p>
              </div>

              {/* Kinesiology Cues & Form Tips */}
              {activeSubdivision.kinesiologyCues && activeSubdivision.kinesiologyCues.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    💡 เทคนิคการโฟกัส & จัดมุมข้อต่อ (Kinesiology Cues):
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    {activeSubdivision.kinesiologyCues.map((cue, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-600 flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-rose-50"
                      >
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Exercises for this Sub-division */}
              {activeSubdivision.recommendedExercises && (
                <div className="pt-2 border-t border-rose-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Dumbbell size={14} className="text-rose-500" />
                    ท่าฝึกที่ตรงกับมัดย่อยนี้ที่สุด (Best Targeted Hypertrophy Exercises):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSubdivision.recommendedExercises.map((exName, idx) => {
                      // Check if matching exercise in system
                      const matchedEx = exercises.find(
                        (e) =>
                          e.name_en.toLowerCase().includes(exName.toLowerCase()) ||
                          e.name_th.includes(exName)
                      );

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs shadow-2xs"
                        >
                          <span className="font-semibold text-slate-700">{exName}</span>
                          {matchedEx && (
                            <button
                              onClick={() => {
                                addExerciseToWorkout(matchedEx);
                                alert(`เพิ่ม "${matchedEx.name_th}" เข้าโปรแกรมฝึกแล้ว!`);
                              }}
                              className="text-[10px] bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 font-bold px-1.5 py-0.5 rounded-md transition cursor-pointer border border-rose-200"
                              title="เพิ่มเข้าโปรแกรมวันนี้"
                            >
                              + เพิ่ม
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Targeted Exercise List for this Muscle Group */}
          <div className="bg-white/95 rounded-2xl border border-pink-200/80 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Dumbbell size={16} className="text-pink-500" />
                ท่าฝึกทั้งหมดในหมวด {activeMuscleInfo?.nameTh} ({targetedExercises.length} ท่า)
              </h4>
              <span className="text-[11px] text-slate-400">แตะเพื่อดูคลิป & วิธีเล่น</span>
            </div>

            {targetedExercises.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                ยังไม่มีท่าฝึกในกลุ่มนี้
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {targetedExercises.map((exercise) => {
                  const isPrimary = exercise.muscle_primary === selectedMuscle;
                  return (
                    <div
                      key={exercise.exercise_id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-pink-50/50 border border-slate-200/80 hover:border-pink-300 transition"
                    >
                      {/* Left: Clickable Info to open Modal */}
                      <button
                        onClick={() => setActiveExerciseModal(exercise)}
                        className="flex-1 text-left pr-2 flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                          <Dumbbell size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition">
                              {exercise.name_en}
                            </span>
                            {isPrimary ? (
                              <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold">
                                มัดหลัก
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                มัดรอง
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
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
                          className="px-2.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                          title="เพิ่มเข้าโปรแกรมวันนี้"
                        >
                          <Plus size={14} />
                          <span className="hidden sm:inline">เพิ่มเข้าเซสชัน</span>
                        </button>
                        <button
                          onClick={() => setActiveExerciseModal(exercise)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
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

      {/* Movement & Kinesiology Glossary Modal */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 border border-pink-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    คู่มือศัพท์ชีวกลศาสตร์ (Kinesiology & Movement Glossary)
                  </h3>
                  <p className="text-xs text-slate-500">
                    รวมคำศัพท์การเคลื่อนไหว ระนาบกายวิภาค และทิศทางการทำงานของกล้ามเนื้อ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGlossary(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Section 1: Planes of Motion */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-1 rounded inline-block">
                1. ระนาบการเคลื่อนไหวของร่างกาย (Planes of Motion)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block">
                    🧭 Sagittal Plane
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    ระนาบหน้า-หลัง
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    การเคลื่อนไหวก้ม-เงย ยกขึ้นหน้า ดึงไปหลัง (Flexion & Extension) เช่น ท่า Squat, Bicep Curl, Deadlift, Lunge
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
                  <span className="text-xs font-bold text-sky-800 block">
                    📐 Frontal (Coronal) Plane
                  </span>
                  <span className="text-[11px] text-sky-700 font-medium block">
                    ระนาบข้าง (ซ้าย-ขวา)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    การกางแขน/ขาออกด้านข้าง หรือหุบเข้าหากึ่งกลาง (Abduction & Adduction) เช่น Lateral Raise, Hip Abduction
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="text-xs font-bold text-purple-800 block">
                    🔄 Transverse (Horizontal)
                  </span>
                  <span className="text-[11px] text-purple-700 font-medium block">
                    ระนาบตัดขวาง / หมุน
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    การหมุนตัว บิดลำตัว หรือหุบแขนขนานพื้น (Horizontal Adduction/Abduction) เช่น Bench Press, Chest Fly, Reverse Pec Deck
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Joint Movement Dictionary */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-1 rounded inline-block">
                2. พจนานุกรมการเคลื่อนไหวข้อต่อ (Joint Actions)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Abduction (แอบดัคชัน):
                  </span>
                  <span className="text-slate-600">
                    <strong>การกางออก</strong> จากแนวกึ่งกลางตัว เช่น กางแขนออกข้าง (Lateral Raise), กางสะโพกออก (Hip Abduction)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Adduction (แอดดัคชัน):
                  </span>
                  <span className="text-slate-600">
                    <strong>การหุบเข้า</strong> หากึ่งกลางตัว เช่น ดึงแขนลงแนบลำตัว (Lat Pulldown), บีบขาเข้าหากัน (Hip Adduction)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Horizontal Adduction:
                  </span>
                  <span className="text-slate-600">
                    <strong>การหุบแขนในระนาบแนวนอน</strong> เช่น ท่าดันอก (Bench Press) หรือ บีบแขนเข้าหากึ่งกลาง (Pec Fly)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Horizontal Abduction:
                  </span>
                  <span className="text-slate-600">
                    <strong>การกางแขนไปข้างหลังในแนวราบ</strong> เช่น ท่าฝึกไหล่หลัง (Reverse Pec Deck Fly / Face Pull)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Flexion (เฟลกชัน):
                  </span>
                  <span className="text-slate-600">
                    <strong>การงอข้อต่อ</strong> หรือยกไปข้างหน้า เช่น ยกแขนขึ้นหน้า (Front Raise), งอข้อศอก (Bicep Curl), งอเข่า (Leg Curl)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Extension (เอ็กซ์เทนชัน):
                  </span>
                  <span className="text-slate-600">
                    <strong>การเหยียดข้อต่อ</strong> ให้ตรงหรือดึงไปข้างหลัง เช่น เหยียดศอก (Tricep Pushdown), เหยียดเข่า (Leg Extension), ถีบสะโพก (Hip Thrust)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Scapular Retraction:
                  </span>
                  <span className="text-slate-600">
                    <strong>การหนีบหรือบีบกระดูกสะบักเข้าหากัน</strong> ที่กลางหลัง เช่น จังหวะดึงท่า Row หรือเซ็ตสะบักตอน Bench Press
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="font-bold text-pink-600 shrink-0 w-32">
                    Scapular Depression:
                  </span>
                  <span className="text-slate-600">
                    <strong>การกดกระดูกสะบักลงด้านล่าง</strong> (หนีหู) ช่วยโฟกัสปีกหลัง (Lats) และช่วยเซฟหัวไหล่
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGlossary(false)}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
              >
                เข้าใจแล้ว ปิดหน้าต่างนี้
              </button>
            </div>
          </div>
        </div>
      )}

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
