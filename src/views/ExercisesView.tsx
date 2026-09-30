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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell size={20} className="text-emerald-400" />
              คลังท่าออกกำลังกาย (Exercise Library)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              รวมท่าเวทเทรนนิ่ง วอร์มอัพ และยืดกล้ามเนื้อ ({exercises.length} ท่า)
            </p>
          </div>
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus size={16} />
            สร้างท่าใหม่
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อท่า (เช่น Bench Press, อก, สควอท)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
            className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
              selectedMuscle === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            ทุกมัดกล้ามเนื้อ
          </button>
          {Object.values(MUSCLE_GROUPS).map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMuscle(m.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                selectedMuscle === m.key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m.nameTh}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>พบ {filteredExercises.length} รายการ</span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="bg-slate-900/60 p-10 rounded-2xl border border-slate-800 text-center space-y-2">
            <Dumbbell size={32} className="mx-auto text-slate-600" />
            <p className="text-sm text-slate-400">ไม่พบท่าที่ตรงกับเงื่อนไขการค้นหา</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMuscle('all');
                setSelectedEquipment('all');
              }}
              className="text-xs text-emerald-400 font-semibold hover:underline"
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
                  className="group bg-slate-900 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition flex items-center justify-between shadow-sm"
                >
                  <button
                    onClick={() => setActiveExerciseModal(ex)}
                    className="flex-1 text-left pr-3 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition shrink-0 mt-0.5">
                      <Dumbbell size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                          {ex.name_en}
                        </span>
                        {ex.is_custom && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-medium border border-purple-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ex.name_th}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded capitalize">
                          {muscleInfo?.nameTh || ex.muscle_primary}
                        </span>
                        <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded capitalize">
                          {ex.equipment}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        addExerciseToWorkout(ex);
                        alert(`เพิ่ม "${ex.name_th}" เข้าเซสชันการฝึกแล้ว!`);
                      }}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition active:scale-95"
                      title="เพิ่มเข้าการฝึกวันนี้"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => setActiveExerciseModal(ex)}
                      className="p-2 text-slate-500 hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                สร้างท่าออกกำลังกายใหม่ (Custom)
              </h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อภาษาอังกฤษ (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Cable Fly"
                    value={newExNameEn}
                    onChange={(e) => setNewExNameEn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อภาษาไทย (Thai) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เคเบิลฟลายอกบน"
                    value={newExNameTh}
                    onChange={(e) => setNewExNameTh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value as ExerciseCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="strength">Strength</option>
                    <option value="warmup">Warm Up</option>
                    <option value="cooldown">Cool Down</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    กล้ามเนื้อมัดหลัก
                  </label>
                  <select
                    value={newExMusclePrimary}
                    onChange={(e) => setNewExMusclePrimary(e.target.value as MuscleKey)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">อุปกรณ์</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Movement Pattern</label>
                  <select
                    value={newExPattern}
                    onChange={(e) => setNewExPattern(e.target.value as MovementPattern)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  คำอธิบายวิธีเล่น
                </label>
                <textarea
                  rows={2}
                  placeholder="ขั้นตอนการจัดระเบียบร่างกายและการเคลื่อนไหว..."
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
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
