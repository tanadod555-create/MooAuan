import React, { useState, useMemo } from 'react';
import { PREDEFINED_FOODS, PredefinedFood } from '../../data/foodDatabase';
import { MealType, FoodLog } from '../../types';
import {
  X,
  Search,
  Plus,
  Check,
  Sparkles,
  Flame,
  Leaf,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface FoodDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (foodLog: Omit<FoodLog, 'log_id'>) => void;
  selectedUserKey: 'primary' | 'partner';
  targetDate: string;
}

export const FoodDatabaseModal: React.FC<FoodDatabaseModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
  selectedUserKey,
  targetDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});
  const [addedFoodIds, setAddedFoodIds] = useState<Record<string, boolean>>({});

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return PREDEFINED_FOODS.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name_th.toLowerCase().includes(q) ||
        item.name_en.toLowerCase().includes(q) ||
        item.category_label_th.toLowerCase().includes(q) ||
        Boolean(item.note?.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const getMultiplier = (id: string) => multipliers[id] || 1;

  const setMultiplier = (id: string, factor: number) => {
    setMultipliers((prev) => ({ ...prev, [id]: Math.max(0.25, Math.min(10, factor)) }));
  };

  const handleAddFoodItem = (item: PredefinedFood) => {
    const factor = getMultiplier(item.id);
    const nowTime = new Date().toTimeString().substring(0, 5);

    const log: Omit<FoodLog, 'log_id'> = {
      date: targetDate,
      time: nowTime,
      meal: selectedMeal,
      name: `${item.name_th}${factor !== 1 ? ` (${factor}x)` : ''}`,
      grams: Math.round(item.grams * factor),
      kcal: Math.round(item.kcal * factor),
      protein_g: Math.round(item.protein_g * factor * 10) / 10,
      carb_g: Math.round(item.carb_g * factor * 10) / 10,
      fat_g: Math.round(item.fat_g * factor * 10) / 10,
      fiber_g: Math.round(item.fiber_g * factor * 10) / 10,
      sugar_g: 0,
      sodium_mg: 0,
      source: 'manual',
      confidence: 1.0,
      user_id: selectedUserKey,
    };

    onAddFood(log);

    // Show temporary checkmark animation
    setAddedFoodIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedFoodIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-pink-200/90 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 bg-gradient-to-r from-pink-50/90 via-rose-50/60 to-pink-50/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PigMascot size="sm" expression="eating" className="drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
                  ตารางโภชนาการด่วน & คลังอาหารไทย 📖
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {selectedUserKey === 'partner' ? '🌸 ของมะนาว (Manow)' : '🏋️‍♂️ ของแม็กนั่ม (Maxnum)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ดูแคลอรี่ โปรตีน คาร์บ ไขมัน และไฟเบอร์ พร้อมกดเพิ่มเข้ามื้ออาหารได้ทันที
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Controls: Search + Target Meal Selector */}
        <div className="p-4 border-b border-pink-100/80 bg-pink-50/30 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่ออาหาร เช่น ไข่ต้ม, อกไก่, ข้าวสวย, กะเพรา, บรอกโคลี..."
                className="w-full bg-white border border-pink-200 rounded-2xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 transition shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Target Meal Selector */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <span className="text-xs font-bold text-slate-600 shrink-0">ลงมื้อ:</span>
              <div className="flex items-center bg-white p-1 rounded-xl border border-pink-200 shadow-2xs">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMeal(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedMeal === m
                        ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {m === 'breakfast' && 'เช้า'}
                    {m === 'lunch' && 'กลางวัน'}
                    {m === 'dinner' && 'เย็น'}
                    {m === 'snack' && 'ของว่าง'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: 'ทั้งหมด' },
              { key: 'protein', label: '🥩 แหล่งโปรตีน' },
              { key: 'carb', label: '🍚 ข้าว & คาร์บ' },
              { key: 'thai_dish', label: '🍲 อาหารจานเดียวไทย' },
              { key: 'veg_fruit', label: '🥦 ผัก & ผลไม้ (ไฟเบอร์)' },
              { key: 'snack_drink', label: '🥛 เวย์ & เครื่องดื่ม' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                    : 'bg-white hover:bg-pink-50 text-slate-600 border border-pink-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredFoods.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <PigMascot size="md" expression="sleep" className="mx-auto opacity-70" />
              <p className="text-sm font-bold text-slate-600">ไม่พบอาหารที่ตรงกับการค้นหา</p>
              <p className="text-xs text-slate-400">ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา</p>
            </div>
          ) : (
            filteredFoods.map((item) => {
              const factor = getMultiplier(item.id);
              const isAdded = Boolean(addedFoodIds[item.id]);
              const scaledKcal = Math.round(item.kcal * factor);
              const scaledProtein = Math.round(item.protein_g * factor * 10) / 10;
              const scaledCarb = Math.round(item.carb_g * factor * 10) / 10;
              const scaledFat = Math.round(item.fat_g * factor * 10) / 10;
              const scaledFiber = Math.round(item.fiber_g * factor * 10) / 10;

              return (
                <div
                  key={item.id}
                  className="bg-white/95 border border-pink-200/80 hover:border-pink-300 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition space-y-1.5"
                >
                  {/* Row 1: Name, Category, Multipliers */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700 border border-pink-200 shrink-0">
                        {item.category_label_th}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {item.name_th}
                        <span className="text-[11px] text-slate-400 font-normal ml-1 hidden sm:inline">
                          ({item.name_en})
                        </span>
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        • {item.serving_size}
                      </span>
                    </div>

                    {/* Multiplier Pills */}
                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                      {[0.5, 1, 1.5, 2].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setMultiplier(item.id, f)}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer ${
                            factor === f
                              ? 'bg-rose-500 text-white shadow-2xs'
                              : 'bg-pink-50/80 text-slate-600 hover:bg-pink-100 border border-pink-200/60'
                          }`}
                        >
                          {f}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Compact Inline Macros & Add Button */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Inline Macros */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/70 font-black">
                        🔥 {scaledKcal} <span className="text-[9px] font-normal font-sans">kcal</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/70 font-bold">
                        P: {scaledProtein}g
                      </span>
                      <span className="px-1.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 font-medium">
                        C: {scaledCarb}g
                      </span>
                      <span className="px-1.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/70 font-medium">
                        F: {scaledFat}g
                      </span>
                      <span className="px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                        🌿 ไฟเบอร์ {scaledFiber}g
                      </span>
                    </div>

                    {/* Add to Meal Button */}
                    <button
                      type="button"
                      onClick={() => handleAddFoodItem(item)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:opacity-95 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={13} className="stroke-[3]" />
                          <span>บันทึกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} className="stroke-[3]" />
                          <span>
                            + เพิ่มลงมื้อ{selectedMeal === 'breakfast' && 'เช้า'}
                            {selectedMeal === 'lunch' && 'กลางวัน'}
                            {selectedMeal === 'dinner' && 'เย็น'}
                            {selectedMeal === 'snack' && 'ของว่าง'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-pink-100 bg-pink-50/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>รายการอาหารทั้งหมด {PREDEFINED_FOODS.length} เมนู</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Leaf size={12} /> มีข้อมูลไฟเบอร์และสารอาหารครบถ้วน
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs border border-pink-200 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
