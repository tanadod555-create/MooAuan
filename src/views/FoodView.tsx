import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FoodLog, MealType } from '../types';
import {
  resizeImageToMaxDimension,
  analyzeFoodImage,
  getDefaultGeminiApiKey,
  GeminiFoodItem,
} from '../services/gemini';
import {
  UtensilsCrossed,
  Camera,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  PieChart,
  Edit2,
  AlertTriangle,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Search,
  FileSpreadsheet,
  ExternalLink,
  Users,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { NumberTicker } from '../components/ui/NumberTicker';
import { PigMascot } from '../components/ui/PigMascot';

export const FoodView: React.FC = () => {
  const {
    currentProfile,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
    foodLogs,
    allFoodLogs,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    settings,
    updateSettings,
    openUnifiedSpreadsheet,
  } = useApp();

  const [viewFilter, setViewFilter] = useState<'all' | 'primary' | 'partner'>('all');

  // Date Navigator state (Default to today)
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');

  const isToday = selectedDate === today;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(today);
  };

  // Filter food logs for selected date
  const allSelectedLogs = (allFoodLogs || []).filter((l) => l.date === selectedDate);
  const magnumSelectedLogs = allSelectedLogs.filter((l) => (l.user_id || 'primary') === 'primary');
  const manaoSelectedLogs = allSelectedLogs.filter((l) => l.user_id === 'partner');

  const todayLogs =
    viewFilter === 'all'
      ? allSelectedLogs
      : viewFilter === 'primary'
      ? magnumSelectedLogs
      : manaoSelectedLogs;

  // Calculate daily totals for current view
  const totalKcal = todayLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);
  const totalProtein = todayLogs.reduce((sum, l) => sum + (l.protein_g || 0), 0);
  const totalCarb = todayLogs.reduce((sum, l) => sum + (l.carb_g || 0), 0);
  const totalFat = todayLogs.reduce((sum, l) => sum + (l.fat_g || 0), 0);
  const totalSodium = todayLogs.reduce((sum, l) => sum + (l.sodium_mg || 0), 0);
  const totalFiber = todayLogs.reduce((sum, l) => sum + (l.fiber_g || 0), 0);
  const totalSugar = todayLogs.reduce((sum, l) => sum + (l.sugar_g || 0), 0);

  // Totals for individual breakdown on selected date
  const magnumKcal = magnumSelectedLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);
  const manaoKcal = manaoSelectedLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);

  // Search Results across all dates
  const searchResults = foodSearchQuery.trim()
    ? (allFoodLogs || []).filter((l) => {
        const q = foodSearchQuery.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          l.meal.toLowerCase().includes(q) ||
          l.date.includes(q)
        );
      })
    : [];

  // Targets based on viewFilter
  const targetKcal =
    viewFilter === 'all'
      ? (primaryProfile.kcal_target || 2400) + (partnerProfile.kcal_target || 1750)
      : viewFilter === 'primary'
      ? primaryProfile.kcal_target || 2400
      : partnerProfile.kcal_target || 1750;
  const targetProtein = currentProfile.protein_target_g || 140;
  const targetCarb = currentProfile.carb_target_g || 240;
  const targetFat = currentProfile.fat_target_g || 60;

  // Image Upload & AI Analysis State
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const effectiveGeminiKey = settings.geminiApiKey || getDefaultGeminiApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(effectiveGeminiKey);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiResultItems, setAiResultItems] = useState<GeminiFoodItem[]>([]);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [showAiResultModal, setShowAiResultModal] = useState(false);

  // Manual Add Modal State (With Micronutrients)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualMeal, setManualMeal] = useState<MealType>('lunch');
  const [manualGrams, setManualGrams] = useState(200);
  const [manualKcal, setManualKcal] = useState(350);
  const [manualProtein, setManualProtein] = useState(25);
  const [manualCarb, setManualCarb] = useState(40);
  const [manualFat, setManualFat] = useState(10);
  const [manualFiber, setManualFiber] = useState(0);
  const [manualSugar, setManualSugar] = useState(0);
  const [manualSodium, setManualSodium] = useState(0);
  const [manualVitC, setManualVitC] = useState(0);
  const [manualIron, setManualIron] = useState(0);
  const [manualCalcium, setManualCalcium] = useState(0);
  const [manualPotassium, setManualPotassium] = useState(0);

  // Edit Food Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    meal: MealType;
    grams: number;
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
    vitC_mg: number;
    iron_mg: number;
    calcium_mg: number;
    potassium_mg: number;
  }>({
    name: '',
    meal: 'lunch',
    grams: 200,
    kcal: 350,
    protein_g: 25,
    carb_g: 40,
    fat_g: 10,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
    vitC_mg: 0,
    iron_mg: 0,
    calcium_mg: 0,
    potassium_mg: 0,
  });

  // Open Edit Modal
  const handleOpenEdit = (log: FoodLog) => {
    setEditingLogId(log.log_id);
    setEditForm({
      name: log.name || '',
      meal: log.meal || 'lunch',
      grams: log.grams || 0,
      kcal: log.kcal || 0,
      protein_g: log.protein_g || 0,
      carb_g: log.carb_g || 0,
      fat_g: log.fat_g || 0,
      fiber_g: log.fiber_g || 0,
      sugar_g: log.sugar_g || 0,
      sodium_mg: log.sodium_mg || 0,
      vitC_mg: log.micros?.vitC_mg || 0,
      iron_mg: log.micros?.iron_mg || 0,
      calcium_mg: log.micros?.calcium_mg || 0,
      potassium_mg: log.micros?.potassium_mg || 0,
    });
    setShowEditModal(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogId) return;

    await updateFoodLog(editingLogId, {
      name: editForm.name.trim(),
      meal: editForm.meal,
      grams: editForm.grams,
      kcal: editForm.kcal,
      protein_g: editForm.protein_g,
      carb_g: editForm.carb_g,
      fat_g: editForm.fat_g,
      fiber_g: editForm.fiber_g,
      sugar_g: editForm.sugar_g,
      sodium_mg: editForm.sodium_mg,
      micros: {
        vitC_mg: editForm.vitC_mg,
        iron_mg: editForm.iron_mg,
        calcium_mg: editForm.calcium_mg,
        potassium_mg: editForm.potassium_mg,
      },
    });

    setShowEditModal(false);
    setEditingLogId(null);
  };

  // Handle file select & Gemini analysis
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const { base64, mimeType } = await resizeImageToMaxDimension(file, 1024, 0.85);
      setPreviewImage(`data:${mimeType};base64,${base64}`);

      const result = await analyzeFoodImage({
        base64Image: base64,
        mimeType: mimeType,
        apiKey: settings.geminiApiKey || effectiveGeminiKey,
        proxyUrl: settings.geminiProxyUrl,
        useProxy: settings.useProxy,
      });

      if (!result.items || result.items.length === 0) {
        throw new Error('ไม่พบรายการอาหารในภาพ กรุณาลองใหม่อีกครั้ง');
      }

      setAiResultItems(result.items);
      setAiNotes(result.notes || '');
      setShowAiResultModal(true);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(
        err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ภาพ กรุณาตรวจสอบ Gemini API Key ในการตั้งค่า'
      );
    } finally {
      setAnalyzing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Confirm and save AI detected items
  const handleConfirmAiFood = async () => {
    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    for (const item of aiResultItems) {
      await addFoodLog({
        date: selectedDate,
        time: nowTime,
        meal: selectedMeal,
        name: item.name,
        grams: item.grams,
        kcal: item.kcal,
        protein_g: item.protein_g,
        carb_g: item.carb_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        sugar_g: item.sugar_g,
        sodium_mg: item.sodium_mg,
        micros: item.micros,
        source: 'ai',
        confidence: item.confidence,
      });
    }

    setShowAiResultModal(false);
    setPreviewImage(null);
    setAiResultItems([]);
  };

  // Update item in AI modal before confirming
  const handleUpdateAiItem = (index: number, field: keyof GeminiFoodItem, value: any) => {
    setAiResultItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle Manual Add with micronutrients
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await addFoodLog({
      date: selectedDate,
      time: nowTime,
      meal: manualMeal,
      name: manualName.trim(),
      grams: manualGrams,
      kcal: manualKcal,
      protein_g: manualProtein,
      carb_g: manualCarb,
      fat_g: manualFat,
      fiber_g: manualFiber,
      sugar_g: manualSugar,
      sodium_mg: manualSodium,
      micros: {
        vitC_mg: manualVitC,
        iron_mg: manualIron,
        calcium_mg: manualCalcium,
        potassium_mg: manualPotassium,
      },
      source: 'manual',
      confidence: 1.0,
    });

    setShowManualModal(false);
    setManualName('');
    setManualFiber(0);
    setManualSugar(0);
    setManualSodium(0);
    setManualVitC(0);
    setManualIron(0);
    setManualCalcium(0);
    setManualPotassium(0);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Cute Pig Mascot Kitchen Greeting Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-100/90 via-pink-50/80 to-rose-100/90 border border-pink-200 shadow-sm shadow-pink-100 flex items-center gap-3.5">
        <PigMascot size="lg" expression="eating" className="shrink-0 drop-shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
              ครัวหมูอ้วน 🍓
            </span>
            <span className="text-xs text-rose-700 font-bold">
              โภชนาการวันนี้ของ {currentProfile.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-pink-950 font-bold mt-1 leading-snug">
            "กินให้อิ่มอย่างถูกหลักสารอาหาร กินให้ฟิน ไม่ต้องอดนะหมูอ้วน 🥗🐽"
          </p>
        </div>
      </div>

      {/* Unified Google Sheet Direct Access Card (Pastel Pink & Cream) */}
      <div className="p-4 rounded-3xl bg-white/95 border border-pink-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-pink-100/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-pink-950">Google Sheets รวมข้อมูล</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-200 font-bold">
                แม็กนั่ม & มะนาว
              </span>
            </div>
            <p className="text-xs text-pink-800/70 mt-0.5">
              ข้อมูลทั้ง 2 คนบันทึกลงใน Spreadsheet เดียวกันอัตโนมัติ เปิดดูตารางรวมได้ทันที
            </p>
          </div>
        </div>
        <button
          onClick={openUnifiedSpreadsheet}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-sm shadow-rose-200 active:scale-95 transition"
        >
          <span>📊 เปิด Google Sheets รวม</span>
          <ExternalLink size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {/* View Filter Pill Switcher (รวมทั้งสองคน / แม็กนั่ม / มะนาว) */}
      <div className="flex items-center p-1.5 bg-white/95 rounded-2xl border border-pink-200/90 gap-1.5 shadow-xs">
        <button
          onClick={() => setViewFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewFilter === 'all'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-pink-900/70 hover:text-pink-950 hover:bg-pink-50/60'
          }`}
        >
          <Users size={14} />
          <span>รวมทั้งสองคน ({allSelectedLogs.length})</span>
        </button>
        <button
          onClick={() => setViewFilter('primary')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewFilter === 'primary'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-pink-900/70 hover:text-pink-950 hover:bg-pink-50/60'
          }`}
        >
          <span>🏋️‍♂️ แม็กนั่ม ({magnumSelectedLogs.length})</span>
        </button>
        <button
          onClick={() => setViewFilter('partner')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewFilter === 'partner'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-pink-900/70 hover:text-pink-950 hover:bg-pink-50/60'
          }`}
        >
          <span>🌸 มะนาว ({manaoSelectedLogs.length})</span>
        </button>
      </div>

      {/* Dual Progress Comparison Bar when in 'all' view */}
      {viewFilter === 'all' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-pink-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-pink-900 flex items-center gap-1">
                🏋️‍♂️ แม็กนั่ม
              </span>
              <span className="font-mono text-pink-950 font-bold">
                {Math.round(magnumKcal)} / {primaryProfile.kcal_target || 2400} kcal
              </span>
            </div>
            <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (magnumKcal / (primaryProfile.kcal_target || 2400)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-pink-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-rose-700 flex items-center gap-1">
                🌸 มะนาว
              </span>
              <span className="font-mono text-pink-950 font-bold">
                {Math.round(manaoKcal)} / {partnerProfile.kcal_target || 1750} kcal
              </span>
            </div>
            <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (manaoKcal / (partnerProfile.kcal_target || 1750)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Date Navigation & Search Controls */}
      <div className="p-3 bg-white/95 rounded-2xl border border-pink-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 transition active:scale-95"
            title="ดูวันก่อนหน้า (ย้อนหลัง)"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2 bg-pink-50/80 px-3 py-1.5 rounded-xl border border-pink-200">
            <Calendar size={16} className="text-rose-500 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-pink-950 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 transition active:scale-95"
            title="ดูวันถัดไป"
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition active:scale-95"
            >
              กลับสู่วันนี้
            </button>
          )}
        </div>

        {/* Search Past Meals Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="ค้นหาเมนูย้อนหลังทุกวัน..."
            value={foodSearchQuery}
            onChange={(e) => setFoodSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-pink-50/60 border border-pink-200 rounded-xl text-xs text-pink-950 placeholder-pink-400 focus:outline-none focus:border-rose-400 focus:bg-white"
          />
          {foodSearchQuery && (
            <button
              onClick={() => setFoodSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Historical Search Results Panel */}
      {foodSearchQuery.trim() && (
        <div className="p-4 bg-white/95 rounded-2xl border border-pink-300 space-y-3 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
              <Search size={14} /> ผลการค้นหาย้อนหลังสำหรับ "{foodSearchQuery}" ({searchResults.length}{' '}
              รายการ)
            </h4>
            <button
              onClick={() => setFoodSearchQuery('')}
              className="text-xs text-pink-700 hover:text-rose-600"
            >
              ปิดผลค้นหา
            </button>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-xs text-pink-700/60 text-center py-3">ไม่พบรายการที่ตรงกับคำค้นหา</p>
          ) : (
            <div className="divide-y divide-pink-100 max-h-60 overflow-y-auto pr-1 space-y-1">
              {searchResults.map((item) => (
                <div
                  key={item.log_id}
                  className="pt-2 pb-1.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-pink-950">{item.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          item.user_id === 'partner'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {item.user_id === 'partner' ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                      </span>
                    </div>
                    <p className="text-[11px] text-pink-800/70 mt-0.5">
                      วันที่: <strong className="text-pink-950">{item.date}</strong> ({item.time}) ·{' '}
                      {item.grams}g · {item.meal}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600">{item.kcal} kcal</span>
                    <button
                      onClick={() => {
                        setSelectedDate(item.date);
                        setFoodSearchQuery('');
                      }}
                      className="block text-[10px] text-rose-500 hover:underline mt-0.5"
                    >
                      ดูวันนี้นี้ →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Header & Daily Macro Tracker using MagicCard & CircularProgress */}
      <MagicCard spotlightColor="rgba(244, 63, 94, 0.12)" className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Animated Circular Progress Ring */}
          <div className="flex items-center gap-6">
            <CircularProgress
              value={totalKcal}
              max={targetKcal}
              size={130}
              strokeWidth={11}
              color={totalKcal > targetKcal ? '#e11d48' : '#f43f5e'}
              bgColor="#ffe4e6"
              label={`${Math.round(totalKcal)}`}
              sublabel={isToday ? 'kcal วันนี้' : `kcal (${selectedDate})`}
            />
            <div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
                โภชนาการประจำวันที่ {selectedDate} {isToday ? '(วันนี้)' : ''}
              </span>
              <h2 className="text-xl font-black text-pink-950 mt-1">เป้าหมายพลังงาน</h2>
              <p className="text-xs text-pink-800/70 mt-1">
                เป้าหมายรายวัน: <strong className="text-pink-950">{targetKcal.toLocaleString()} kcal</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-pink-800/70">คงเหลือ:</span>
                <span className="text-sm font-black text-rose-600 font-mono">
                  {Math.max(0, targetKcal - totalKcal).toLocaleString()} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Right: Macro Breakdown Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-2.5 w-full sm:w-48">
            {/* Protein */}
            <div className="bg-sky-50/70 p-2.5 rounded-2xl border border-sky-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-sky-700">โปรตีน</span>
                <span className="text-sky-950 font-bold font-mono">
                  <NumberTicker value={Math.round(totalProtein)} /> / {targetProtein}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-sky-200/60 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-700">คาร์บ</span>
                <span className="text-amber-950 font-bold font-mono">
                  <NumberTicker value={Math.round(totalCarb)} /> / {targetCarb}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/60 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalCarb / targetCarb) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="bg-rose-50/70 p-2.5 rounded-2xl border border-rose-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-rose-700">ไขมัน</span>
                <span className="text-rose-950 font-bold font-mono">
                  <NumberTicker value={Math.round(totalFat)} /> / {targetFat}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-rose-200/60 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Micronutrients Summary Bar if present */}
        {(totalSodium > 0 || totalFiber > 0 || totalSugar > 0) && (
          <div className="mt-4 pt-3 border-t border-pink-100 flex items-center gap-2 flex-wrap text-xs font-semibold text-pink-900">
            <span className="text-[11px] text-pink-700 font-bold">สารอาหารรอง (Micros รวม):</span>
            {totalSodium > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-100/70 text-amber-800 border border-amber-200">
                โซเดียม: {Math.round(totalSodium)} mg
              </span>
            )}
            {totalFiber > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                ใยอาหาร: {Math.round(totalFiber)} g
              </span>
            )}
            {totalSugar > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-100/70 text-rose-800 border border-rose-200">
                น้ำตาล: {Math.round(totalSugar)} g
              </span>
            )}
          </div>
        )}
      </MagicCard>

      {/* Gemini AI API Connection Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/95 border border-pink-200 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              effectiveGeminiKey ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className={effectiveGeminiKey ? 'text-pink-950 font-bold' : 'text-amber-700 font-medium'}>
            {effectiveGeminiKey
              ? '✨ Gemini Multimodal AI: เชื่อมต่อระบบอัตโนมัติแล้ว (พร้อมสแกนทันที)'
              : 'ยังไม่ได้ระบุ Gemini API Key (จำเป็นสำหรับการสแกนรูป)'}
          </span>
        </div>
        <button
          onClick={() => {
            setApiKeyInput(effectiveGeminiKey);
            setShowApiKeyModal(true);
          }}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold underline"
        >
          {effectiveGeminiKey ? 'ตั้งค่า Key' : 'เชื่อมต่อ Key ด่วน'}
        </button>
      </div>

      {/* Action Buttons: Camera / Gallery / Manual Add */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Camera Hidden Input */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Gallery Hidden Input */}
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Take Photo Button */}
        <button
          onClick={() => {
            if (!effectiveGeminiKey) {
              setApiKeyInput(getDefaultGeminiApiKey());
              setShowApiKeyModal(true);
              return;
            }
            cameraInputRef.current?.click();
          }}
          disabled={analyzing}
          className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold flex items-center justify-center gap-3 shadow-md shadow-rose-200 active:scale-[0.98] transition group cursor-pointer"
        >
          <Camera size={22} className="stroke-[2.5]" />
          <div className="text-left">
            <span className="text-sm font-black block">ถ่ายรูปอาหาร</span>
            <span className="text-[10px] text-white/90 font-medium block">
              เปิดกล้องถ่ายสด → AI วิเคราะห์ทันที
            </span>
          </div>
        </button>

        {/* Choose from Gallery / Files */}
        <button
          onClick={() => {
            if (!effectiveGeminiKey) {
              setApiKeyInput(getDefaultGeminiApiKey());
              setShowApiKeyModal(true);
              return;
            }
            galleryInputRef.current?.click();
          }}
          disabled={analyzing}
          className="p-4 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-950 font-bold flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
            <Upload size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">อัปโหลดจากอัลบั้ม</span>
            <span className="text-[10px] text-pink-700/70 font-normal block">
              เลือกรูปจากคลังภาพ / ไฟล์
            </span>
          </div>
        </button>

        {/* Manual Add Button */}
        <button
          onClick={() => setShowManualModal(true)}
          className="p-4 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-950 font-bold flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">กรอกรายการเอง</span>
            <span className="text-[10px] text-pink-700/70 font-normal block">
              พิมพ์แคลอรี่ & Micro nutrients
            </span>
          </div>
        </button>
      </div>

      {/* Analyzing Indicator */}
      {analyzing && (
        <div className="p-6 rounded-3xl bg-white/95 border border-pink-300 text-center space-y-3 shadow-md animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-rose-500 animate-spin">
            <Sparkles size={24} />
          </div>
          <h4 className="text-sm font-bold text-pink-950">กำลังวิเคราะห์อาหารด้วย Gemini Multimodal...</h4>
          <p className="text-xs text-pink-800/70">
            ย่อขนาดภาพและประเมินขนาดจาน ส่วนประกอบ แคลอรี่ และโภชนาการ
          </p>
        </div>
      )}

      {/* Error alert */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs shadow-xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
          <div>
            <span className="font-bold block">เกิดข้อผิดพลาด:</span>
            <span>{analysisError}</span>
          </div>
        </div>
      )}

      {/* Today's Meals Grouped by Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-950 flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-rose-500" />
          บันทึกอาหารวันนี้ ({todayLogs.length} รายการ)
        </h3>

        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
          const mealLogs = todayLogs.filter((l) => l.meal === mealType);
          const mealKcal = mealLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);

          const mealTitleTh = {
            breakfast: 'มื้อเช้า (Breakfast)',
            lunch: 'มื้อกลางวัน (Lunch)',
            dinner: 'มื้อเย็น (Dinner)',
            snack: 'ของว่าง / ขนม (Snack)',
          }[mealType];

          return (
            <div
              key={mealType}
              className="bg-white/95 rounded-3xl border border-pink-200/90 overflow-hidden shadow-sm"
            >
              <div className="p-3.5 bg-pink-50/70 border-b border-pink-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-pink-950 capitalize">
                  {mealTitleTh}
                </span>
                <span className="text-xs font-mono font-bold text-rose-600">
                  {mealKcal} kcal
                </span>
              </div>

              {mealLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-pink-700/60">ยังไม่มีรายการในมื้อนี้</div>
              ) : (
                <div className="divide-y divide-pink-100">
                  {mealLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="p-3.5 flex items-center justify-between hover:bg-pink-50/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-pink-950">{log.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              log.user_id === 'partner'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-pink-100 text-pink-800 border border-pink-200'
                            }`}
                          >
                            {log.user_id === 'partner' ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                          </span>
                          {log.source === 'ai' && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 font-semibold flex items-center gap-0.5">
                              <Sparkles size={10} /> AI ({Math.round((log.confidence || 0.8) * 100)}%)
                            </span>
                          )}
                        </div>

                        {/* Macros summary */}
                        <p className="text-xs text-pink-800/80 font-medium">
                          {log.time} · {log.grams}g · P: {log.protein_g}g | C: {log.carb_g}g | F: {log.fat_g}g
                        </p>

                        {/* Micronutrients Badges if present */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {Boolean(log.sodium_mg) && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 font-semibold">
                              โซเดียม {log.sodium_mg}mg
                            </span>
                          )}
                          {Boolean(log.fiber_g) && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                              ไฟเบอร์ {log.fiber_g}g
                            </span>
                          )}
                          {Boolean(log.sugar_g) && (
                            <span className="text-[10px] bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded border border-rose-200 font-semibold">
                              น้ำตาล {log.sugar_g}g
                            </span>
                          )}
                          {Boolean(log.micros?.vitC_mg) && (
                            <span className="text-[10px] bg-orange-50 text-orange-800 px-1.5 py-0.2 rounded border border-orange-200 font-semibold">
                              Vit C {log.micros?.vitC_mg}mg
                            </span>
                          )}
                          {Boolean(log.micros?.iron_mg) && (
                            <span className="text-[10px] bg-red-50 text-red-800 px-1.5 py-0.2 rounded border border-red-200 font-semibold">
                              ธาตุเหล็ก {log.micros?.iron_mg}mg
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-rose-600 font-mono">
                          {log.kcal} kcal
                        </span>

                        {/* Edit Button requested by user */}
                        <button
                          onClick={() => handleOpenEdit(log)}
                          className="p-2 text-pink-700 hover:text-rose-600 hover:bg-pink-100 rounded-xl transition cursor-pointer active:scale-95"
                          title="แก้ไขรายการอาหารนี้"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteFoodLog(log.log_id)}
                          className="p-2 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer active:scale-95"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Analysis Confirmation Modal */}
      {showAiResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-pink-200 bg-pink-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-rose-500" />
                <h3 className="font-bold text-pink-950 text-base">ผลการวิเคราะห์จากภาพ (ตรวจสอบ & แก้ไข)</h3>
              </div>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="text-pink-400 hover:text-pink-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Preview image if available */}
              {previewImage && (
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-pink-200 bg-pink-50 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meal Selector */}
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1.5">
                  เลือกมื้ออาหาร:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                        selectedMeal === meal
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Items */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-pink-900 block">
                  รายการอาหารที่ตรวจพบ (แก้ไขตัวเลขได้):
                </span>
                {aiResultItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateAiItem(idx, 'name', e.target.value)}
                        className="bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-sm font-bold text-pink-950 flex-1"
                      />
                      <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        แม่นยำ {Math.round((item.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-pink-800 font-bold block mb-0.5">ปริมาณ (g)</span>
                        <input
                          type="number"
                          value={item.grams}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'grams', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-pink-950"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block mb-0.5">พลังงาน (kcal)</span>
                        <input
                          type="number"
                          value={item.kcal}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'kcal', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-rose-600"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-sky-700 font-bold block mb-0.5">โปรตีน (g)</span>
                        <input
                          type="number"
                          value={item.protein_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'protein_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-sky-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold block mb-0.5">คาร์บ (g)</span>
                        <input
                          type="number"
                          value={item.carb_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'carb_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-amber-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-pink-100">
                      <div>
                        <span className="text-[10px] text-rose-700 font-bold block mb-0.5">ไขมัน (g)</span>
                        <input
                          type="number"
                          value={item.fat_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fat_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-rose-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold block mb-0.5">โซเดียม (mg)</span>
                        <input
                          type="number"
                          value={item.sodium_mg || 0}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'sodium_mg', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-amber-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">ไฟเบอร์ (g)</span>
                        <input
                          type="number"
                          value={item.fiber_g || 0}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fiber_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-center font-bold text-emerald-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {aiNotes && (
                <p className="text-xs text-pink-800 bg-pink-50 p-3 rounded-2xl border border-pink-200">
                  💡 หมายเหตุจาก AI: {aiNotes}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pink-200 bg-pink-50/80 flex items-center gap-3">
              <button
                onClick={handleConfirmAiFood}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-200 active:scale-95 transition"
              >
                <CheckCircle2 size={18} />
                ยืนยันและบันทึกลง Sheet
              </button>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="py-3 px-4 rounded-xl bg-white hover:bg-pink-100 text-pink-800 border border-pink-200 text-xs font-bold"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal (With Micronutrients) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-rose-500" />
                <h3 className="font-bold text-pink-950 text-base">กรอกข้อมูลอาหาร</h3>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-pink-400 hover:text-pink-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-pink-900 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อกไก่ย่าง ข้าวกล้อง สลัดแซลมอน"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-sm text-pink-950 focus:outline-none focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-900 mb-1">มื้ออาหาร</label>
                  <select
                    value={manualMeal}
                    onChange={(e) => setManualMeal(e.target.value as MealType)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-pink-950 focus:outline-none focus:border-rose-400 font-bold"
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-pink-900 mb-1">ปริมาณ (กรัม)</label>
                  <input
                    type="number"
                    value={manualGrams}
                    onChange={(e) => setManualGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-pink-950 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-rose-600 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={manualKcal}
                    onChange={(e) => setManualKcal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-black focus:outline-none focus:border-rose-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-700 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-sky-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-700 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    value={manualCarb}
                    onChange={(e) => setManualCarb(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-amber-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-700 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-rose-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Micronutrients Section */}
              <div className="pt-2 border-t border-pink-100">
                <span className="block font-bold text-pink-950 mb-2">
                  สารอาหารรอง & วิตามิน (Micronutrients)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">โซเดียม (mg)</label>
                    <input
                      type="number"
                      value={manualSodium}
                      onChange={(e) => setManualSodium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      value={manualFiber}
                      onChange={(e) => setManualFiber(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-800 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      value={manualSugar}
                      onChange={(e) => setManualSugar(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">Vit C (mg)</label>
                    <input
                      type="number"
                      value={manualVitC}
                      onChange={(e) => setManualVitC(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">ธาตุเหล็ก (mg)</label>
                    <input
                      type="number"
                      value={manualIron}
                      onChange={(e) => setManualIron(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">แคลเซียม (mg)</label>
                    <input
                      type="number"
                      value={manualCalcium}
                      onChange={(e) => setManualCalcium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">โพแทสเซียม</label>
                    <input
                      type="number"
                      value={manualPotassium}
                      onChange={(e) => setManualPotassium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold shadow-md shadow-rose-200"
                >
                  บันทึกอาหาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Modal requested by user */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-rose-500" />
                <h3 className="font-bold text-pink-950 text-base">แก้ไขรายการอาหาร</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-pink-400 hover:text-pink-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-pink-900 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-sm text-pink-950 focus:outline-none focus:border-rose-400 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-900 mb-1">มื้ออาหาร</label>
                  <select
                    value={editForm.meal}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, meal: e.target.value as MealType }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-pink-950 focus:outline-none focus:border-rose-400 font-bold"
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-pink-900 mb-1">ปริมาณ (กรัม)</label>
                  <input
                    type="number"
                    value={editForm.grams}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        grams: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-pink-950 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-rose-600 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.kcal}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        kcal: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-black focus:outline-none focus:border-rose-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-700 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    value={editForm.protein_g}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        protein_g: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-sky-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-700 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    value={editForm.carb_g}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        carb_g: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-amber-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-700 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={editForm.fat_g}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fat_g: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2 text-rose-800 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Micronutrients Section in Edit Modal */}
              <div className="pt-2 border-t border-pink-100">
                <span className="block font-bold text-pink-950 mb-2">
                  สารอาหารรอง & วิตามิน (Micronutrients)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">โซเดียม (mg)</label>
                    <input
                      type="number"
                      value={editForm.sodium_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sodium_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      value={editForm.fiber_g}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          fiber_g: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-800 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      value={editForm.sugar_g}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sugar_g: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1.5 text-pink-950 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">Vit C (mg)</label>
                    <input
                      type="number"
                      value={editForm.vitC_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          vitC_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">ธาตุเหล็ก (mg)</label>
                    <input
                      type="number"
                      value={editForm.iron_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          iron_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">แคลเซียม (mg)</label>
                    <input
                      type="number"
                      value={editForm.calcium_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          calcium_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">โพแทสเซียม</label>
                    <input
                      type="number"
                      value={editForm.potassium_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          potassium_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/60 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-950 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold shadow-md shadow-rose-200"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini API Key Config Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-pink-950">ตั้งค่า Gemini API Key</h3>
                  <p className="text-xs text-pink-700/70">สำหรับวิเคราะห์อาหารจากภาพ</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-pink-400 hover:text-pink-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1.5">
                  Gemini API Key ของคุณ:
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="วาง API Key ที่นี่..."
                  className="w-full bg-pink-50/60 border border-pink-200 rounded-xl px-3 py-2.5 text-xs text-pink-950 focus:outline-none focus:border-rose-400 font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200 text-[11px] text-pink-900 space-y-1">
                <p className="text-rose-600 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> คีย์ระบบเชื่อมต่อให้อัตโนมัติแล้ว
                </p>
                <p className="text-xs text-pink-900/80 leading-relaxed">
                  ระบบได้เชื่อมต่อ Gemini API Key ประจำเว็บให้เรียบร้อยแล้ว สามารถถ่ายรูปหรืออัปโหลดสแกนสารอาหารได้ทันทีโดยไม่ต้องใส่คีย์เพิ่ม หรือจะเปลี่ยนเป็นคีย์ส่วนตัวของคุณเองก็ได้
                </p>
                <button
                  type="button"
                  onClick={() => setApiKeyInput(getDefaultGeminiApiKey())}
                  className="text-rose-600 hover:underline text-left font-bold block mt-1"
                >
                  🔄 คืนค่าเป็นคีย์อัตโนมัติของระบบ
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-200">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-pink-50 text-xs font-bold text-pink-800 hover:bg-pink-100 border border-pink-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleaned = apiKeyInput.trim();
                  updateSettings({ geminiApiKey: cleaned });
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('fittrack_gemini_key', cleaned);
                  }
                  setShowApiKeyModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 active:scale-95 transition"
              >
                บันทึกและเชื่อมต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
