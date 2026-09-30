import React, { useState, useEffect } from 'react';
import { Program, ProgramItem, Exercise } from '../../types';
import { X, Plus, Trash2, Dumbbell, Save, Search, Check, AlertCircle } from 'lucide-react';

interface RoutineEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
  onSave: (savedProgram: Program) => void;
  onDelete?: (programId: string) => void;
  availableExercises: Exercise[];
  ownerName: string;
}

export const RoutineEditModal: React.FC<RoutineEditModalProps> = ({
  isOpen,
  onClose,
  program,
  onSave,
  onDelete,
  availableExercises,
  ownerName,
}) => {
  const [name, setName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [searchEx, setSearchEx] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  useEffect(() => {
    if (program) {
      setName(program.name || '');
      setDayOfWeek(program.day_of_week || '');
      setNote(program.note || '');
      setItems(program.items ? [...program.items] : []);
    } else {
      // New program defaults
      setName('');
      setDayOfWeek('จันทร์');
      setNote('');
      setItems([]);
    }
  }, [program, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof ProgramItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Number(value) || value };
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExerciseToRoutine = (ex: Exercise) => {
    const newItem: ProgramItem = {
      program_id: program?.program_id || 'prog_' + Date.now(),
      order: items.length + 1,
      exercise_id: ex.exercise_id,
      target_sets: 3,
      target_reps: 10,
      target_weight_kg: 20,
    };
    setItems((prev) => [...prev, newItem]);
    setShowAddExerciseDrawer(false);
    setSearchEx('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณาระบุชื่อโปรแกรมการฝึก');
      return;
    }

    const savedProg: Program = {
      program_id:
        program?.program_id ||
        'prog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      day_of_week: dayOfWeek.trim() || 'ตาราง',
      note: note.trim(),
      items: items.map((it, idx) => ({ ...it, order: idx + 1 })),
    };

    onSave(savedProg);
    onClose();
  };

  const filteredAvailableExercises = availableExercises.filter((ex) => {
    const q = searchEx.toLowerCase().trim();
    const matchQuery = !q || ex.name_en.toLowerCase().includes(q) || ex.name_th.includes(q);
    const matchMuscle = selectedMuscle === 'all' || ex.muscle_primary === selectedMuscle;
    return matchQuery && matchMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-pink-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-pink-200 bg-pink-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-pink-950 text-base">
                  {program ? 'แก้ไขโปรแกรม Routine' : 'สร้างโปรแกรม Routine ใหม่'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold">
                  {ownerName}
                </span>
              </div>
              <p className="text-xs text-pink-800/70">
                ตั้งค่าและปรับเปลี่ยนท่าฝึก เซ็ต และน้ำหนักเป้าหมายเฉพาะบุคคล
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-pink-400 hover:text-pink-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-pink-900 mb-1">
                ชื่อโปรแกรม (Program Name) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Push Day (อก ไหล่ หลังแขน) หรือ Glute & Hamstring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-pink-950 font-bold focus:outline-none focus:border-rose-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-900 mb-1">
                วันฝึก (Day / Tag)
              </label>
              <input
                type="text"
                placeholder="เช่น จันทร์, Day 1"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-pink-950 font-bold focus:outline-none focus:border-rose-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-900 mb-1">
              คำแนะนำ / โฟกัส (Notes / Focus)
            </label>
            <input
              type="text"
              placeholder="เช่น เน้นก้นบน บีบค้าง 2 วิ และคุมเวลาพัก 60-90 วิ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-pink-950 focus:outline-none focus:border-rose-400 focus:bg-white"
            />
          </div>

          {/* List of Exercises in this Routine */}
          <div className="pt-2 border-t border-pink-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-pink-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Dumbbell size={14} className="text-rose-500" />
                รายการท่าออกกำลังกายในตาราง ({items.length} ท่า)
              </h4>
              <button
                type="button"
                onClick={() => setShowAddExerciseDrawer(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                เพิ่มท่าฝึก
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center bg-pink-50/50 rounded-2xl border border-pink-200 space-y-2">
                <Dumbbell size={28} className="mx-auto text-pink-300" />
                <p className="text-xs text-pink-800 font-medium">ยังไม่มีท่าฝึกในโปรแกรมนี้</p>
                <button
                  type="button"
                  onClick={() => setShowAddExerciseDrawer(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-xs font-bold shadow-xs hover:from-rose-600 hover:to-pink-600 transition cursor-pointer"
                >
                  + เพิ่มท่าฝึกแรก
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const ex = availableExercises.find((e) => e.exercise_id === item.exercise_id);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-pink-50/60 rounded-2xl border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-pink-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-pink-950 truncate">
                            {ex?.name_en || item.exercise_id}
                          </h5>
                          <p className="text-[11px] text-pink-800/70 truncate">
                            {ex?.name_th} · <span className="capitalize">{ex?.equipment}</span>
                          </p>
                        </div>
                      </div>

                      {/* Sets / Reps / Weight Inputs */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-pink-200">
                          <span className="text-[10px] text-pink-700 font-bold">เซ็ต:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.target_sets}
                            onChange={(e) => handleItemChange(idx, 'target_sets', e.target.value)}
                            className="w-10 bg-transparent text-xs text-center font-bold text-pink-950 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-pink-200">
                          <span className="text-[10px] text-pink-700 font-bold">ครั้ง:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.target_reps}
                            onChange={(e) => handleItemChange(idx, 'target_reps', e.target.value)}
                            className="w-10 bg-transparent text-xs text-center font-bold text-pink-950 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-pink-200">
                          <span className="text-[10px] text-pink-700 font-bold">กก.:</span>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="0.5"
                            value={item.target_weight_kg}
                            onChange={(e) =>
                              handleItemChange(idx, 'target_weight_kg', e.target.value)
                            }
                            className="w-12 bg-transparent text-xs text-center font-bold text-rose-600 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-pink-400 hover:text-rose-600 transition cursor-pointer"
                          title="ลบท่านี้ออกจากโปรแกรม"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-pink-100 flex items-center justify-between gap-3">
            {program && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`คุณต้องการลบโปรแกรม "${program.name}" ใช่หรือไม่?`)) {
                    onDelete(program.program_id);
                    onClose();
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 size={14} />
                ลบโปรแกรม
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-bold transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200 transition active:scale-95 cursor-pointer"
              >
                <Save size={15} />
                บันทึกโปรแกรม
              </button>
            </div>
          </div>
        </form>

        {/* Nested Add Exercise Picker Drawer */}
        {showAddExerciseDrawer && (
          <div className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md flex flex-col p-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200">
              <div>
                <h4 className="font-bold text-pink-950 text-sm">เลือกท่าฝึกเพื่อใส่ในตาราง</h4>
                <p className="text-xs text-pink-800/70">
                  คลิกที่ท่าเพื่อเพิ่มเข้าโปรแกรม {name || 'Routine'}
                </p>
              </div>
              <button
                onClick={() => setShowAddExerciseDrawer(false)}
                className="p-1.5 text-pink-400 hover:text-pink-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3 space-y-2">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"
                />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อท่า (Hip Thrust, Squat, Bench)..."
                  value={searchEx}
                  onChange={(e) => setSearchEx(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-pink-50/60 border border-pink-200 rounded-xl text-xs text-pink-950 focus:outline-none focus:border-rose-400 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Muscle Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { key: 'all', label: 'ทั้งหมด' },
                  { key: 'glutes', label: 'ก้น' },
                  { key: 'quads', label: 'หน้าขา' },
                  { key: 'hamstrings', label: 'หลังขา' },
                  { key: 'chest', label: 'อก' },
                  { key: 'back', label: 'หลัง' },
                  { key: 'shoulders', label: 'ไหล่' },
                  { key: 'core', label: 'ท้อง' },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setSelectedMuscle(chip.key)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                      selectedMuscle === chip.key
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-pink-50 text-pink-900 hover:bg-pink-100 border border-pink-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredAvailableExercises.map((ex) => (
                <div
                  key={ex.exercise_id}
                  onClick={() => handleAddExerciseToRoutine(ex)}
                  className="p-3 bg-white hover:bg-pink-50/70 hover:border-pink-300 border border-pink-200 rounded-2xl cursor-pointer flex items-center justify-between group transition shadow-xs"
                >
                  <div>
                    <h5 className="text-xs font-bold text-pink-950 group-hover:text-rose-600 transition">
                      {ex.name_en}
                    </h5>
                    <p className="text-[11px] text-pink-800/70">
                      {ex.name_th} · <span className="capitalize">{ex.muscle_primary}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-xl bg-pink-100 text-rose-700 border border-pink-200 text-xs font-bold group-hover:bg-rose-500 group-hover:text-white transition"
                  >
                    + เลือก
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
