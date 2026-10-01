import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise, ExerciseCategory, MuscleKey, MovementPattern } from '../types';
import { MUSCLE_GROUPS } from '../data/muscles';
import { ExerciseDetailModal } from '../components/exercises/ExerciseDetailModal';
import { Search, Plus, Dumbbell, Filter, Sparkles, ChevronRight, X } from 'lucide-react';

export const ExercisesView: React.FC = () => {
  const { exercises, addCustomExercise, addExerciseToWorkout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // New Custom Exercise Form State
  const [newExNameEn, setNewExNameEn] = useState('');
  const [newExNameTh, setNewExNameTh] = useState('');
  const [newExCategory, setNewExCategory] = useState<ExerciseCategory>('strength');
  const [newExMusclePrimary, setNewExMusclePrimary] = useState<MuscleKey>('chest');
  const [newExPattern, setNewExPattern] = useState<MovementPattern>('press');
  const [newExEquipment, setNewExEquipment] = useState<'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other'>('dumbbell');
  const [newExInstructions, setNewExInstructions] = useState('');
  const [newExTechnique, setNewExTechnique] = useState('');

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_primary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || ex.category === selectedCategory;

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.muscle_primary === selectedMuscle ||
      ex.muscle_secondary?.includes(selectedMuscle as MuscleKey);

    const matchesEquipment =
      selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesCategory && matchesMuscle && matchesEquipment;
  });

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExNameEn.trim() || !newExNameTh.trim()) {
      alert('กรุณากรอกชื่อท่าทั้งภาษาไทยและอังกฤษ');
      return;
    }

    const custom: Exercise = {
      exercise_id: 'custom_' + Date.now(),
      name_en: newExNameEn.trim(),
      name_th: newExNameTh.trim(),
      category: newExCategory,
      muscle_primary: newExMusclePrimary,
      pattern: newExPattern,
      equipment: newExEquipment,
      is_custom: true,
      instructions: newExInstructions.trim(),
      technique: newExTechnique.trim(),
    };

    addCustomExercise(custom);
    setShowAddCustomModal(false);
    // Reset form
    setNewExNameEn('');
    setNewExNameTh('');
    setNewExInstructions('');
    setNewExTechnique('');
    alert(`เพิ่มท่า "${custom.name_th}" ลงในคลังท่าเรียบร้อยแล้ว!`);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-pink-200/80 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-pink-100 text-rose-600 flex items-center justify-center shrink-0">
                <Dumbbell size={18} />
              </span>
              คลังท่าออกกำลังกาย (Exercise Library)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              รวมท่าเวทเทรนนิ่ง พร้อมวิดีโอ YouTube Shorts สอนวิธีเล่นจริง และคำแนะนำชีวกลศาสตร์ ({exercises.length} ท่า)
            </p>
          </div>
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-200 transition active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>สร้างท่าใหม่</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อท่า (เช่น Bench Press, อกบน, สควอท, Cable, Barbell)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-pink-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-pink-100 shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills: Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'strength', label: 'Strength' },
            { id: 'warmup', label: 'Warm Up' },
            { id: 'cooldown', label: 'Cool Down' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200/80 hover:bg-pink-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Pills: Muscle */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedMuscle('all')}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer font-bold ${
              selectedMuscle === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-50'
            }`}
          >
            ทุกมัดกล้ามเนื้อ
          </button>
          {Object.values(MUSCLE_GROUPS).map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMuscle(m.key)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer font-medium ${
                selectedMuscle === m.key
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-50'
              }`}
            >
              {m.nameTh}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>พบ {filteredExercises.length} รายการ</span>
          <span className="text-[11px] text-pink-500 font-medium">แตะเพื่อดูคลิป YouTube Shorts & เทคนิคฝึก</span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="bg-white/80 p-10 rounded-2xl border border-pink-200 text-center space-y-2 shadow-xs">
            <Dumbbell size={32} className="mx-auto text-pink-300" />
            <p className="text-sm font-semibold text-slate-600">ไม่พบท่าที่ตรงกับเงื่อนไขการค้นหา</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMuscle('all');
                setSelectedEquipment('all');
              }}
              className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => {
              const muscleInfo = MUSCLE_GROUPS[ex.muscle_primary];
              return (
                <div
                  key={ex.exercise_id}
                  className="group bg-white/95 hover:bg-pink-50/40 p-3.5 sm:p-4 rounded-2xl border border-pink-200/80 hover:border-pink-300 transition flex items-center justify-between shadow-xs"
                >
                  <button
                    onClick={() => setActiveExerciseModal(ex)}
                    className="flex-1 text-left pr-2 flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 group-hover:scale-105 group-hover:bg-pink-100 transition shrink-0 mt-0.5 shadow-2xs">
                      <Dumbbell size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-rose-600 transition truncate leading-tight">
                          {ex.name_en}
                        </span>
                        {ex.is_custom && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-pink-700/90 mt-0.5 line-clamp-1">{ex.name_th}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-bold bg-pink-100 text-rose-700 px-2 py-0.5 rounded-lg border border-pink-200">
                          {muscleInfo?.nameTh || ex.muscle_primary}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 capitalize">
                          {ex.equipment}
                        </span>
                        <span className="text-[10px] font-medium bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg border border-rose-200 capitalize">
                          {ex.pattern}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        addExerciseToWorkout(ex);
                        alert(`เพิ่ม "${ex.name_th}" เข้าเซสชันการฝึกแล้ว!`);
                      }}
                      className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-pink-200 transition active:scale-90 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="เพิ่มเข้าการฝึกวันนี้"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => setActiveExerciseModal(ex)}
                      className="p-1.5 text-slate-400 group-hover:text-rose-500 transition cursor-pointer"
                      title="ดูรายละเอียดและแอนิเมชัน"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-rose-500" />
                สร้างท่าออกกำลังกายใหม่ (Custom)
              </h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อภาษาอังกฤษ (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Cable Fly"
                    value={newExNameEn}
                    onChange={(e) => setNewExNameEn(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อภาษาไทย (Thai) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เคเบิลฟลายอกบน"
                    value={newExNameTh}
                    onChange={(e) => setNewExNameTh(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value as ExerciseCategory)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  >
                    <option value="strength">Strength</option>
                    <option value="warmup">Warm Up</option>
                    <option value="cooldown">Cool Down</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    กล้ามเนื้อมัดหลัก
                  </label>
                  <select
                    value={newExMusclePrimary}
                    onChange={(e) => setNewExMusclePrimary(e.target.value as MuscleKey)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  >
                    {Object.values(MUSCLE_GROUPS).map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.nameTh} ({m.key})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อุปกรณ์</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value as any)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="cable">Cable</option>
                    <option value="machine">Machine</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Movement Pattern</label>
                  <select
                    value={newExPattern}
                    onChange={(e) => setNewExPattern(e.target.value as MovementPattern)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                  >
                    <option value="press">Press</option>
                    <option value="pull">Pull</option>
                    <option value="squat">Squat</option>
                    <option value="hinge">Hinge</option>
                    <option value="curl">Curl</option>
                    <option value="raise">Raise</option>
                    <option value="core">Core</option>
                    <option value="calf">Calf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายวิธีเล่น
                </label>
                <textarea
                  rows={2}
                  placeholder="ขั้นตอนการจัดระเบียบร่างกายและการเคลื่อนไหว..."
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-pink-200 cursor-pointer active:scale-95"
                >
                  บันทึกลงคลังท่า
                </button>
              </div>
            </form>
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
            alert(`เพิ่ม "${ex.name_th}" เข้าเซสชันการฝึกแล้ว!`);
          }}
        />
      )}
    </div>
  );
};
