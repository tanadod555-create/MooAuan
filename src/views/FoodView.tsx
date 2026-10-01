import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
  Target,
  BookOpen,
  Bot,
  MessageCircle,
  Leaf,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { NumberTicker } from '../components/ui/NumberTicker';
import { PigMascot } from '../components/ui/PigMascot';
import { GoalSetupModal } from '../components/goals/GoalSetupModal';
import { FoodDatabaseModal } from '../components/food/FoodDatabaseModal';
import { AiTrainerModal } from '../components/ai/AiTrainerModal';

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
  } = useApp();

  // Quick Food Reference & AI Trainer Modal state
  const [showFoodDbModal, setShowFoodDbModal] = useState(false);
  const [showAiTrainerModal, setShowAiTrainerModal] = useState(false);

  // User Selection: Track food per person separately (default to active profile)
  const [selectedUserKey, setSelectedUserKey] = useState<'primary' | 'partner'>(activeProfileKey);

  useEffect(() => {
    setSelectedUserKey(activeProfileKey);
  }, [activeProfileKey]);

  const activeTargetProfile = selectedUserKey === 'partner' ? partnerProfile : primaryProfile;

  // Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);

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

  // Filter food logs for selected date & selected user ONLY (no combined food)
  const todayLogs = (allFoodLogs || []).filter(
    (l) => l.date === selectedDate && (l.user_id || 'primary') === selectedUserKey
  );

  // Count logs for switcher pills
  const magnumDayCount = (allFoodLogs || []).filter(
    (l) => l.date === selectedDate && (l.user_id || 'primary') === 'primary'
  ).length;
  const manowDayCount = (allFoodLogs || []).filter(
    (l) => l.date === selectedDate && l.user_id === 'partner'
  ).length;

  // Calculate daily totals for selected user
  const totalKcal = todayLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);
  const totalProtein = todayLogs.reduce((sum, l) => sum + (l.protein_g || 0), 0);
  const totalCarb = todayLogs.reduce((sum, l) => sum + (l.carb_g || 0), 0);
  const totalFat = todayLogs.reduce((sum, l) => sum + (l.fat_g || 0), 0);
  const totalSodium = todayLogs.reduce((sum, l) => sum + (l.sodium_mg || 0), 0);
  const totalFiber = todayLogs.reduce((sum, l) => sum + (l.fiber_g || 0), 0);
  const totalSugar = todayLogs.reduce((sum, l) => sum + (l.sugar_g || 0), 0);
  const totalVitC = todayLogs.reduce((sum, l) => sum + (l.micros?.vitC_mg || 0), 0);
  const totalIron = todayLogs.reduce((sum, l) => sum + (l.micros?.iron_mg || 0), 0);
  const totalCalcium = todayLogs.reduce((sum, l) => sum + (l.micros?.calcium_mg || 0), 0);
  const totalPotassium = todayLogs.reduce((sum, l) => sum + (l.micros?.potassium_mg || 0), 0);

  // Thai DRI (Dietary Reference Intake for Thais 2020) Reference Standards
  const THAI_DRI = {
    fiber_g: 25,
    sodium_mg: 2000,
    sugar_g: 24,
    vitC_mg: 100,
    calcium_mg: 1000,
    iron_mg: selectedUserKey === 'partner' ? 15 : 12,
    potassium_mg: 3000,
  };

  // Targets strictly for selected user
  const targetKcal = activeTargetProfile.kcal_target || (selectedUserKey === 'primary' ? 2400 : 1750);
  const targetProtein = activeTargetProfile.protein_target_g || (selectedUserKey === 'primary' ? 150 : 110);
  const targetCarb = activeTargetProfile.carb_target_g || (selectedUserKey === 'primary' ? 260 : 180);
  const targetFat = activeTargetProfile.fat_target_g || (selectedUserKey === 'primary' ? 65 : 45);

  // Search Results across all dates for selected user
  const searchResults = foodSearchQuery.trim()
    ? (allFoodLogs || []).filter((l) => {
        const matchesUser = (l.user_id || 'primary') === selectedUserKey;
        const q = foodSearchQuery.toLowerCase();
        return (
          matchesUser &&
          (l.name.toLowerCase().includes(q) ||
            l.meal.toLowerCase().includes(q) ||
            l.date.includes(q))
        );
      })
    : [];

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
  const [baseAiItems, setBaseAiItems] = useState<GeminiFoodItem[]>([]); // Stored original before multiplier
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [showAiResultModal, setShowAiResultModal] = useState(false);

  // Photo Note Flow: Holds the captured photo so user can add notes BEFORE analyzing
  const [pendingPhoto, setPendingPhoto] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [showPhotoNoteModal, setShowPhotoNoteModal] = useState(false);

  // Custom User Note for AI Prompt (เช่น กินแค่ครึ่งเดียว, ไม่กินผัก)
  const [aiUserNote, setAiUserNote] = useState<string>('');

  // Manual Add Modal State (With Micronutrients & Note)
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
  const [manualNote, setManualNote] = useState('');

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
    note: string;
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
    note: '',
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
      note: log.note || '',
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
      note: editForm.note.trim() || undefined,
    });

    setShowEditModal(false);
    setEditingLogId(null);
  };

  // Step 1: User selects or captures a photo -> Open photo preview & note prompt dialog FIRST
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { base64, mimeType } = await resizeImageToMaxDimension(file, 1024, 0.85);
      const previewUrl = `data:${mimeType};base64,${base64}`;
      setPreviewImage(previewUrl);
      setPendingPhoto({ base64, mimeType, previewUrl });
      setShowPhotoNoteModal(true); // Open note & photo preview modal immediately!
    } catch (err: any) {
      console.error(err);
      setAnalysisError('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Step 2: User confirms note and clicks "Send to AI for analysis"
  const handleStartAnalysis = async () => {
    if (!pendingPhoto) return;

    setShowPhotoNoteModal(false);
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeFoodImage({
        base64Image: pendingPhoto.base64,
        mimeType: pendingPhoto.mimeType,
        apiKey: settings.geminiApiKey || effectiveGeminiKey,
        proxyUrl: settings.geminiProxyUrl,
        useProxy: settings.useProxy,
        userNotes: aiUserNote,
      });

      if (!result.items || result.items.length === 0) {
        throw new Error('ไม่พบรายการอาหารในภาพ กรุณาลองใหม่อีกครั้ง');
      }

      setAiResultItems(result.items);
      setBaseAiItems(result.items);
      setPortionMultiplier(1.0);
      setAiNotes(result.notes || '');
      setShowAiResultModal(true);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(
        err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ภาพ กรุณาตรวจสอบ Gemini API Key ในการตั้งค่า'
      );
    } finally {
      setAnalyzing(false);
      setPendingPhoto(null);
    }
  };

  // Apply portion multiplier (e.g. 0.5x, 0.75x, 1x, 1.5x)
  const handleApplyPortionMultiplier = (factor: number) => {
    setPortionMultiplier(factor);
    setAiResultItems(
      baseAiItems.map((item) => ({
        ...item,
        grams: Math.round(item.grams * factor),
        kcal: Math.round(item.kcal * factor),
        protein_g: Math.round(item.protein_g * factor * 10) / 10,
        carb_g: Math.round(item.carb_g * factor * 10) / 10,
        fat_g: Math.round(item.fat_g * factor * 10) / 10,
        fiber_g: typeof item.fiber_g === 'number' ? Math.round(item.fiber_g * factor * 10) / 10 : undefined,
        sugar_g: typeof item.sugar_g === 'number' ? Math.round(item.sugar_g * factor * 10) / 10 : undefined,
        sodium_mg: typeof item.sodium_mg === 'number' ? Math.round(item.sodium_mg * factor) : undefined,
      }))
    );
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
        user_id: selectedUserKey,
        note: aiUserNote.trim() || undefined,
      });
    }

    setShowAiResultModal(false);
    setPreviewImage(null);
    setAiResultItems([]);
    setBaseAiItems([]);
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
      user_id: selectedUserKey,
      note: manualNote.trim() || undefined,
    });

    setShowManualModal(false);
    setManualName('');
    setManualNote('');
    setManualFiber(0);
    setManualSugar(0);
    setManualSodium(0);
    setManualVitC(0);
    setManualIron(0);
    setManualCalcium(0);
    setManualPotassium(0);
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Cute Pig Mascot Kitchen Greeting Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 border border-pink-200/70 shadow-sm shadow-pink-100/40 flex items-center gap-3.5">
        <PigMascot size="lg" expression="eating" className="shrink-0 drop-shadow-xs" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200/60 shadow-2xs">
              ครัวหมูอ้วน 🍓
            </span>
            <span className="text-xs text-slate-500 font-medium">
              โภชนาการของ {activeTargetProfile.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1 leading-snug">
            "กินให้อิ่มอย่างถูกหลักสารอาหาร กินให้ฟิน ไม่ต้องอดนะหมูอ้วน 🥗🐽"
          </p>
        </div>
      </div>

      {/* User Switcher Pills: Clean 2-person toggle (NO combined data) */}
      <div className="flex items-center p-1.5 bg-white/90 rounded-2xl border border-pink-200/70 gap-1.5 shadow-2xs">
        <button
          onClick={() => setSelectedUserKey('primary')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            selectedUserKey === 'primary'
              ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 hover:bg-pink-50/50'
          }`}
        >
          <span>🏋️‍♂️ บันทึกของแม็กนั่ม ({magnumDayCount})</span>
        </button>
        <button
          onClick={() => setSelectedUserKey('partner')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            selectedUserKey === 'partner'
              ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 hover:bg-pink-50/50'
          }`}
        >
          <span>🌸 บันทึกของมะนาว (Manow) ({manowDayCount})</span>
        </button>
      </div>

      {/* Quick Access Banner: 1) Quick Food Database & 2) AI Trainer Live Chat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Quick Food Database */}
        <button
          type="button"
          onClick={() => setShowFoodDbModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50/60 to-pink-50 hover:from-pink-100/70 hover:to-rose-100/60 border border-pink-200/90 text-left transition active:scale-[0.99] shadow-xs group cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-slate-800">
                  ตารางโภชนาการด่วน & อาหารไทย 📖
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                  <Leaf size={10} /> ไฟเบอร์ครบ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                เช็กแคล ไข่ต้ม, อกไก่, ข้าวสวย, กะเพรา + แตะลงมื้อทันที
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-pink-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        {/* AI Trainer Chat */}
        <button
          type="button"
          onClick={() => setShowAiTrainerModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50/60 to-rose-50 hover:from-rose-100/70 hover:to-pink-100/60 border border-pink-200/90 text-left transition active:scale-[0.99] shadow-xs group cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-slate-800">
                  คุยกับโค้ชหมูอ้วน AI (คุยสด) 💬
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-600 flex items-center gap-0.5">
                  <Sparkles size={9} /> Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                วิเคราะห์การกินวันนี้ แนะนำเมนูถัดไป ปรึกษาฟอร์มและอาการล้า
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-rose-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>
      </div>

      {/* Date Navigation & Search Controls */}
      <div className="p-3 bg-white/90 rounded-2xl border border-pink-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-700 border border-pink-200/70 transition active:scale-95"
            title="ดูวันก่อนหน้า (ย้อนหลัง)"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2 bg-pink-50/50 px-3 py-1.5 rounded-xl border border-pink-200/60">
            <Calendar size={15} className="text-pink-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-700 border border-pink-200/70 transition active:scale-95"
            title="ดูวันถัดไป"
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-xl bg-pink-100/70 text-pink-700 border border-pink-200/70 text-xs font-bold hover:bg-pink-100 transition active:scale-95"
            >
              กลับสู่วันนี้
            </button>
          )}
        </div>

        {/* Search Past Meals Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={`ค้นหาอาหารของ ${activeTargetProfile.name}...`}
            value={foodSearchQuery}
            onChange={(e) => setFoodSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-pink-50/40 border border-pink-200/70 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-300 focus:bg-white transition"
          />
          {foodSearchQuery && (
            <button
              onClick={() => setFoodSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Historical Search Results Panel */}
      {foodSearchQuery.trim() && (
        <div className="p-4 bg-white/95 rounded-2xl border border-pink-200 space-y-3 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search size={14} className="text-pink-400" />
              ผลการค้นหาสำหรับ "{foodSearchQuery}" ({searchResults.length} รายการ)
            </h4>
            <button
              onClick={() => setFoodSearchQuery('')}
              className="text-xs text-pink-600 hover:text-pink-700 font-semibold"
            >
              ปิดผลค้นหา
            </button>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">ไม่พบรายการที่ตรงกับคำค้นหา</p>
          ) : (
            <div className="divide-y divide-pink-100 max-h-60 overflow-y-auto pr-1 space-y-1">
              {searchResults.map((item) => (
                <div
                  key={item.log_id}
                  className="pt-2 pb-1.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      {item.note && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          📝 {item.note}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      วันที่: <strong className="text-slate-700">{item.date}</strong> ({item.time}) ·{' '}
                      {item.grams}g · {item.meal}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-pink-600">{item.kcal} kcal</span>
                    <button
                      onClick={() => {
                        setSelectedDate(item.date);
                        setFoodSearchQuery('');
                      }}
                      className="block text-[10px] text-pink-500 hover:underline mt-0.5 font-semibold"
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

      {/* Top Header & Daily Macro Tracker for Selected User */}
      <MagicCard spotlightColor="rgba(244, 114, 182, 0.08)" className="p-5 sm:p-6 bg-white/90 border-pink-200/70 shadow-sm shadow-pink-100/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Animated Circular Progress Ring */}
          <div className="flex items-center gap-5 sm:gap-6">
            <CircularProgress
              value={totalKcal}
              max={targetKcal}
              size={130}
              strokeWidth={11}
              color={totalKcal > targetKcal ? '#f472b6' : '#f472b6'}
              bgColor="#fce7f3"
              label={`${Math.round(totalKcal)}`}
              sublabel={isToday ? 'kcal วันนี้' : `kcal (${selectedDate})`}
              labelClassName="text-slate-700 font-black"
              sublabelClassName="text-slate-400 font-medium"
            />
            <div>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100/80 px-2.5 py-0.5 rounded-full border border-pink-200/70 uppercase tracking-wider">
                เป้าหมายของ {activeTargetProfile.name}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-700 mt-1">เป้าหมายพลังงาน</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-500">
                  เป้าหมาย: <strong className="text-slate-700">{targetKcal.toLocaleString()} kcal</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(true)}
                  className="px-2 py-0.5 rounded-full bg-pink-100/70 hover:bg-pink-200 text-pink-700 border border-pink-200/70 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                  title="คำนวณเป้าหมายและสารอาหารอัตโนมัติ"
                >
                  <Sparkles size={11} className="text-pink-400" />
                  <span>คำนวณ Goal</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500">คงเหลือ:</span>
                <span className="text-sm font-black text-pink-600 font-mono">
                  {Math.max(0, targetKcal - totalKcal).toLocaleString()} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Right: Macro Breakdown Pills (Protein, Carbs, Fat, Fiber) */}
          <div className="flex flex-col gap-2.5 w-full sm:w-56">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              {/* Protein */}
              <div className="bg-sky-50/60 p-2 rounded-2xl border border-sky-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-sky-700">โปรตีน</span>
                  <span className="text-slate-700 font-bold font-mono">
                    <NumberTicker value={Math.round(totalProtein)} /> / {targetProtein}g
                  </span>
                </div>
                <div className="w-full h-1.5 bg-sky-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-amber-50/60 p-2 rounded-2xl border border-amber-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-700">คาร์บ</span>
                  <span className="text-slate-700 font-bold font-mono">
                    <NumberTicker value={Math.round(totalCarb)} /> / {targetCarb}g
                  </span>
                </div>
                <div className="w-full h-1.5 bg-amber-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalCarb / targetCarb) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="bg-rose-50/60 p-2 rounded-2xl border border-rose-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-600">ไขมัน</span>
                  <span className="text-slate-700 font-bold font-mono">
                    <NumberTicker value={Math.round(totalFat)} /> / {targetFat}g
                  </span>
                </div>
                <div className="w-full h-1.5 bg-rose-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fiber (ใยอาหาร) */}
              <div className="bg-emerald-50/70 p-2 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Leaf size={11} className="text-emerald-600" /> ไฟเบอร์
                  </span>
                  <span className="text-slate-700 font-bold font-mono">
                    <NumberTicker value={Math.round(totalFiber * 10) / 10} /> / 25g
                  </span>
                </div>
                <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalFiber / 25) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="w-full py-1.5 px-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-pink-200/70 transition active:scale-95"
            >
              <Target size={13} className="text-pink-500" />
              <span>🎯 ปรับคำนวณ Goal โภชนาการ</span>
            </button>
          </div>
        </div>

        {/* Thai DRI Micronutrients Dashboard */}
        <div className="mt-5 pt-4 border-t border-pink-100/90 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-500" />
                <span>สารอาหารรอง & วิตามิน แร่ธาตุ</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                🇹🇭 เกณฑ์ Thai DRI 2020
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              (คำนวณตาม Dietary Reference Intake สำหรับคนไทย)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {/* Sodium (Limit 2000mg) */}
            <div className={`p-2.5 rounded-2xl border transition-all ${
              totalSodium > THAI_DRI.sodium_mg
                ? 'bg-rose-50/80 border-rose-200 shadow-2xs'
                : totalSodium > 1500
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🧂 โซเดียม
                </span>
                <span className={`font-mono font-black ${
                  totalSodium > THAI_DRI.sodium_mg ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {Math.round(totalSodium)} / {THAI_DRI.sodium_mg} mg
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalSodium > THAI_DRI.sodium_mg
                      ? 'bg-rose-500'
                      : totalSodium > 1500
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalSodium / THAI_DRI.sodium_mg) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">
                  {totalSodium > THAI_DRI.sodium_mg ? '⚠️ เกินเกณฑ์แนะนำ' : 'เกณฑ์: ไม่เกิน 2,000mg'}
                </span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalSodium / THAI_DRI.sodium_mg) * 100)}%
                </span>
              </div>
            </div>

            {/* Fiber (Target 25g) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🌿 ใยอาหาร
                </span>
                <span className="font-mono font-black text-emerald-600">
                  {Math.round(totalFiber * 10) / 10} / {THAI_DRI.fiber_g} g
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalFiber / THAI_DRI.fiber_g) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">เป้าหมาย Thai DRI: 25g</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {Math.round((totalFiber / THAI_DRI.fiber_g) * 100)}%
                </span>
              </div>
            </div>

            {/* Sugar (Limit 24g / 6 tsp) */}
            <div className={`p-2.5 rounded-2xl border transition-all ${
              totalSugar > THAI_DRI.sugar_g
                ? 'bg-rose-50/80 border-rose-200 shadow-2xs'
                : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🍯 น้ำตาล
                </span>
                <span className={`font-mono font-black ${
                  totalSugar > THAI_DRI.sugar_g ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {Math.round(totalSugar * 10) / 10} / {THAI_DRI.sugar_g} g
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalSugar > THAI_DRI.sugar_g ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalSugar / THAI_DRI.sugar_g) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">
                  {totalSugar > THAI_DRI.sugar_g ? '⚠️ เกิน 6 ช้อนชา' : 'เกณฑ์: ไม่เกิน 24g'}
                </span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalSugar / THAI_DRI.sugar_g) * 100)}%
                </span>
              </div>
            </div>

            {/* Vitamin C (Target 100mg) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🍊 วิตามินซี
                </span>
                <span className="font-mono font-black text-amber-600">
                  {Math.round(totalVitC)} / {THAI_DRI.vitC_mg} mg
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalVitC / THAI_DRI.vitC_mg) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">เป้าหมาย Thai DRI: 100mg</span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalVitC / THAI_DRI.vitC_mg) * 100)}%
                </span>
              </div>
            </div>

            {/* Calcium (Target 1000mg) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🥛 แคลเซียม
                </span>
                <span className="font-mono font-black text-sky-600">
                  {Math.round(totalCalcium)} / {THAI_DRI.calcium_mg} mg
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalCalcium / THAI_DRI.calcium_mg) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">เป้าหมาย: 1,000mg</span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalCalcium / THAI_DRI.calcium_mg) * 100)}%
                </span>
              </div>
            </div>

            {/* Iron (Target 12mg / 15mg) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🥩 ธาตุเหล็ก
                </span>
                <span className="font-mono font-black text-rose-600">
                  {Math.round(totalIron * 10) / 10} / {THAI_DRI.iron_mg} mg
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalIron / THAI_DRI.iron_mg) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">เป้าหมาย: {THAI_DRI.iron_mg}mg</span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalIron / THAI_DRI.iron_mg) * 100)}%
                </span>
              </div>
            </div>

            {/* Potassium (Target 3000mg) */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  🍌 โพแทสเซียม
                </span>
                <span className="font-mono font-black text-purple-600">
                  {Math.round(totalPotassium)} / {THAI_DRI.potassium_mg} mg
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalPotassium / THAI_DRI.potassium_mg) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] mt-1">
                <span className="text-slate-400">เป้าหมาย: 3,000mg</span>
                <span className="font-bold text-slate-500 font-mono">
                  {Math.round((totalPotassium / THAI_DRI.potassium_mg) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </MagicCard>

      {/* Gemini AI API Connection Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/90 border border-pink-200/70 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              effectiveGeminiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-300'
            }`}
          />
          <span className={effectiveGeminiKey ? 'text-slate-700 font-bold' : 'text-amber-700 font-medium'}>
            {effectiveGeminiKey
              ? '✨ Gemini Multimodal AI: พร้อมสแกนวิเคราะห์ภาพอาหารทันที'
              : 'ยังไม่ได้ระบุ Gemini API Key (จำเป็นสำหรับการสแกนรูป)'}
          </span>
        </div>
        <button
          onClick={() => {
            setApiKeyInput(effectiveGeminiKey);
            setShowApiKeyModal(true);
          }}
          className="text-xs text-pink-600 hover:text-pink-700 font-bold underline"
        >
          {effectiveGeminiKey ? 'ตั้งค่า Key' : 'เชื่อมต่อ Key ด่วน'}
        </button>
      </div>

      {/* Action Buttons: Camera / Gallery / Quick Food DB / Manual Add */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          className="p-4 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold flex items-center justify-center gap-3 shadow-sm shadow-pink-200/50 active:scale-[0.98] transition group cursor-pointer"
        >
          <Camera size={22} className="stroke-[2.5]" />
          <div className="text-left">
            <span className="text-sm font-bold block">ถ่ายรูปอาหาร</span>
            <span className="text-[10px] text-white/90 font-normal block">
              เปิดกล้องถ่ายสด → AI วิเคราะห์
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
          className="p-4 rounded-2xl bg-white/90 hover:bg-pink-50/70 border border-pink-200/70 text-slate-700 font-bold flex items-center justify-center gap-3 shadow-2xs active:scale-[0.98] transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition">
            <Upload size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">อัปโหลดจากอัลบั้ม</span>
            <span className="text-[10px] text-slate-400 font-normal block">
              เลือกรูปจากคลังภาพ / ไฟล์
            </span>
          </div>
        </button>

        {/* Quick Food Database Reference Button */}
        <button
          onClick={() => setShowFoodDbModal(true)}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100/80 hover:to-teal-100/80 border border-emerald-200/80 text-slate-800 font-bold flex items-center justify-center gap-3 shadow-2xs active:scale-[0.98] transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <BookOpen size={18} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold block text-slate-800">ตารางอาหารด่วน</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-800">
                ไฟเบอร์
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal block">
              ไข่, ไก่, ข้าว, กะเพรา + แตะลงมื้อ
            </span>
          </div>
        </button>

        {/* Manual Add Button */}
        <button
          onClick={() => setShowManualModal(true)}
          className="p-4 rounded-2xl bg-white/90 hover:bg-pink-50/70 border border-pink-200/70 text-slate-700 font-bold flex items-center justify-center gap-3 shadow-2xs active:scale-[0.98] transition group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">กรอกรายการเอง</span>
            <span className="text-[10px] text-slate-400 font-normal block">
              พิมพ์แคลอรี่ & Micro nutrients
            </span>
          </div>
        </button>
      </div>

      {/* Analyzing Indicator */}
      {analyzing && (
        <div className="p-6 rounded-3xl bg-white/95 border border-pink-200 text-center space-y-3 shadow-sm animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-pink-500 animate-spin">
            <Sparkles size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-700">กำลังวิเคราะห์อาหารด้วย Gemini Multimodal...</h4>
          <p className="text-xs text-slate-500">
            {aiUserNote ? `คำนวณตามหมายเหตุ: "${aiUserNote}"` : 'กำลังประเมินขนาดจาน ส่วนประกอบ และโภชนาการ'}
          </p>
        </div>
      )}

      {/* Error alert */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs shadow-2xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-bold">เกิดข้อผิดพลาดในการวิเคราะห์</p>
            <p className="mt-0.5">{analysisError}</p>
          </div>
        </div>
      )}

      {/* Today's Logged Food List */}
      <div className="bg-white/90 p-5 rounded-3xl border border-pink-200/70 shadow-sm shadow-pink-100/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div>
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-pink-400" />
              รายการอาหารของ {activeTargetProfile.name} ({todayLogs.length} รายการ)
            </h3>
            <p className="text-xs text-slate-400">
              วันที่ {selectedDate} {isToday ? '(วันนี้)' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/70 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus size={14} />
            <span>เพิ่มอาหาร</span>
          </button>
        </div>

        {todayLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <PigMascot size="md" expression="eating" className="mx-auto opacity-70" />
            <p className="text-xs font-medium">ยังไม่มีรายการอาหารของ {activeTargetProfile.name} ในวันนี้</p>
            <p className="text-[11px] text-slate-400">
              กดถ่ายรูปอาหารด้วย AI หรือกด "เพิ่มอาหาร" เพื่อเริ่มบันทึกได้เลย
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-200/60 flex items-center justify-between gap-3 text-xs hover:border-pink-300 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700 text-sm truncate">{log.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100/70 text-pink-700 border border-pink-200/60 font-semibold capitalize">
                      {log.meal}
                    </span>
                    {log.source === 'ai' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200/60 font-medium">
                        ✨ AI
                      </span>
                    )}
                    {log.note && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 font-medium">
                        📝 {log.note}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                    <span>⏰ {log.time}</span>
                    <span>·</span>
                    <span>⚖️ {log.grams}g</span>
                    <span>·</span>
                    <span>🥩 P: {log.protein_g}g</span>
                    <span>·</span>
                    <span>🍚 C: {log.carb_g}g</span>
                    <span>·</span>
                    <span>🥑 F: {log.fat_g}g</span>
                    {log.sodium_mg && log.sodium_mg > 0 ? (
                      <>
                        <span>·</span>
                        <span>🧂 Na: {log.sodium_mg}mg</span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-pink-600 text-sm">{log.kcal} kcal</span>
                  <button
                    onClick={() => handleOpenEdit(log)}
                    className="p-1.5 rounded-lg bg-white hover:bg-pink-100 text-slate-500 hover:text-slate-700 border border-pink-200/70 transition"
                    title="แก้ไขรายการ"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`ต้องการลบรายการ "${log.name}" หรือไม่?`)) {
                        deleteFoodLog(log.log_id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-pink-200/70 transition"
                    title="ลบรายการ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Photo Preview & Note Modal (Appears immediately AFTER taking or uploading a photo) */}
      {showPhotoNoteModal && pendingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-pink-500" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">ระบุหมายเหตุให้ AI (รูปอาหาร)</h3>
                  <p className="text-[11px] text-slate-500">บันทึกลงโปรไฟล์ของ {activeTargetProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPhotoNoteModal(false);
                  setPendingPhoto(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo Preview */}
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-pink-50 relative border border-pink-100">
              <img
                src={pendingPhoto.previewUrl}
                alt="Captured Food"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                📸 รูปที่เพิ่งถ่าย/เลือก
              </span>
            </div>

            {/* Meal Selector */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">เลือกมื้ออาหาร:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setSelectedMeal(meal)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      selectedMeal === meal
                        ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                        : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100 border border-pink-200/70'
                    }`}
                  >
                    {meal === 'breakfast'
                      ? 'มื้อเช้า'
                      : meal === 'lunch'
                      ? 'กลางวัน'
                      : meal === 'dinner'
                      ? 'มื้อเย็น'
                      : 'ของว่าง'}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Custom Prompt / Food Notes Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-pink-500" />
                  <span>หมายเหตุอาหารให้ AI รู้ (ช่วยคำนวณแม่นยำขึ้น):</span>
                </label>
                {aiUserNote && (
                  <button
                    type="button"
                    onClick={() => setAiUserNote('')}
                    className="text-[11px] text-pink-500 hover:text-pink-600 font-semibold cursor-pointer"
                  >
                    ล้าง
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="เช่น กินแค่ครึ่งเดียว (50%), ไม่กินผัก, ไม่เอาหนัง, ไม่ซดน้ำซุป, ข้าวครึ่งทัพพี..."
                value={aiUserNote}
                onChange={(e) => setAiUserNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200/70 rounded-2xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-300 focus:bg-white transition"
              />

              {/* Quick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {[
                  { label: '🍽️ กินแค่ครึ่งเดียว (50%)', text: 'กินแค่ครึ่งเดียว (50%)' },
                  { label: '🥗 ไม่กินผัก', text: 'ไม่กินผัก' },
                  { label: '🍗 ไม่กินหนังและมัน', text: 'ไม่กินหนังและมัน' },
                  { label: '🥣 ไม่ซดน้ำซุป', text: 'ไม่ซดน้ำซุป' },
                  { label: '🍚 ข้าวครึ่งจาน', text: 'ข้าวครึ่งจาน' },
                  { label: '🍳 เพิ่มไข่ดาว 1 ฟอง', text: 'เพิ่มไข่ดาว 1 ฟอง' },
                ].map((chip) => {
                  const isSelected = aiUserNote.includes(chip.text);
                  return (
                    <button
                      key={chip.text}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setAiUserNote((prev) =>
                            prev
                              .replace(chip.text, '')
                              .replace(/,\s*,/g, ',')
                              .replace(/^,\s*|,\s*$/g, '')
                              .trim()
                          );
                        } else {
                          setAiUserNote((prev) => (prev ? `${prev}, ${chip.text}` : chip.text));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl transition active:scale-95 font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-pink-200 text-slate-800 border border-pink-300 shadow-2xs'
                          : 'bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/60'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoNoteModal(false);
                  setPendingPhoto(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
              >
                ยกเลิก / ถ่ายใหม่
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>ส่งให้ AI วิเคราะห์ภาพนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Food Analysis Result Modal */}
      {showAiResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[92vh] bg-white border border-pink-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-pink-100 bg-pink-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-pink-500" />
                <div>
                  <h3 className="font-bold text-slate-700 text-base">ผลการวิเคราะห์อาหาร (AI)</h3>
                  <p className="text-[11px] text-slate-500">บันทึกลงโปรไฟล์ของ {activeTargetProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="w-7 h-7 rounded-full bg-white hover:bg-pink-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs border border-pink-200/70"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Preview Image */}
              {previewImage && (
                <div className="w-full h-40 rounded-2xl overflow-hidden bg-pink-50 relative border border-pink-100">
                  <img src={previewImage} alt="Food Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Active User Notes Context */}
              {aiUserNote && (
                <div className="p-2.5 rounded-xl bg-pink-50/80 border border-pink-200/70 text-[11px] text-slate-600">
                  <span className="font-bold text-pink-600">📝 หมายเหตุที่ส่งให้ AI:</span> "{aiUserNote}"
                </div>
              )}

              {/* Quick Portion Multiplier (กินครึ่งเดียว, 3/4, เต็มจาน) */}
              <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-200/70 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  🍽️ ปรับสัดส่วนจานด่วน (คำนวณใหม่ทันที):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { factor: 0.5, label: '0.5x (ครึ่งจาน)' },
                    { factor: 0.75, label: '0.75x (3/4 จาน)' },
                    { factor: 1.0, label: '1.0x (เต็มจาน)' },
                    { factor: 1.5, label: '1.5x (จานใหญ่)' },
                  ].map((p) => (
                    <button
                      key={p.factor}
                      type="button"
                      onClick={() => handleApplyPortionMultiplier(p.factor)}
                      className={`py-1.5 rounded-xl font-bold text-[11px] transition active:scale-95 ${
                        portionMultiplier === p.factor
                          ? 'bg-pink-300 text-slate-800 border border-pink-400 shadow-2xs'
                          : 'bg-white text-slate-600 border border-pink-200/70 hover:bg-pink-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">เลือกมื้ออาหาร:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                        selectedMeal === meal
                          ? 'bg-gradient-to-r from-pink-400 to-rose-300 text-white shadow-xs'
                          : 'bg-pink-50/60 text-slate-600 hover:bg-pink-100 border border-pink-200/70'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Items */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  รายการอาหารที่ตรวจพบ (แก้ไขตัวเลขได้):
                </span>
                {aiResultItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-pink-50/40 p-3.5 rounded-2xl border border-pink-200/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateAiItem(idx, 'name', e.target.value)}
                        className="bg-white border border-pink-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 flex-1"
                      />
                      <span className="text-[10px] text-pink-600 font-bold bg-pink-100/70 px-2 py-0.5 rounded border border-pink-200/60">
                        แม่นยำ {Math.round((item.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">กรัม (g)</span>
                        <input
                          type="number"
                          value={item.grams}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'grams', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-pink-600 font-bold block mb-0.5">kcal</span>
                        <input
                          type="number"
                          value={item.kcal}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'kcal', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-pink-600"
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
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-sky-700"
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
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-amber-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-pink-100">
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block mb-0.5">ไขมัน (g)</span>
                        <input
                          type="number"
                          value={item.fat_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fat_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-rose-600"
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
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700"
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
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {aiNotes && (
                <p className="text-xs text-slate-600 bg-pink-50/70 p-3 rounded-2xl border border-pink-200/70">
                  💡 หมายเหตุจาก AI: {aiNotes}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pink-100 bg-pink-50/60 flex items-center gap-3">
              <button
                onClick={handleConfirmAiFood}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
              >
                <CheckCircle2 size={16} />
                บันทึกลงโปรไฟล์ของ {activeTargetProfile.name}
              </button>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-pink-100 text-slate-600 border border-pink-200/70 text-xs font-bold"
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
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-700 text-base">
                  กรอกข้อมูลอาหาร ({activeTargetProfile.name})
                </h3>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อกไก่ย่าง ข้าวกล้อง สลัดแซลมอน"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">มื้ออาหาร</label>
                  <select
                    value={manualMeal}
                    onChange={(e) => setManualMeal(e.target.value as MealType)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-pink-300 font-bold"
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ปริมาณ (กรัม)</label>
                  <input
                    type="number"
                    value={manualGrams}
                    onChange={(e) => setManualGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-600 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={manualKcal}
                    onChange={(e) => setManualKcal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-pink-600 font-black focus:outline-none focus:border-pink-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-700 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-sky-700 font-bold focus:outline-none focus:border-pink-300"
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
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-amber-700 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
              </div>

              {/* Micronutrients Section */}
              <div className="pt-2 border-t border-pink-100">
                <span className="block font-bold text-slate-700 mb-2">
                  สารอาหารรอง & วิตามิน (Micronutrients)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 mb-1">โซเดียม (mg)</label>
                    <input
                      type="number"
                      value={manualSodium}
                      onChange={(e) => setManualSodium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      value={manualFiber}
                      onChange={(e) => setManualFiber(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      value={manualSugar}
                      onChange={(e) => setManualSugar(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Vit C (mg)</label>
                    <input
                      type="number"
                      value={manualVitC}
                      onChange={(e) => setManualVitC(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">เหล็ก (mg)</label>
                    <input
                      type="number"
                      value={manualIron}
                      onChange={(e) => setManualIron(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">แคลเซียม</label>
                    <input
                      type="number"
                      value={manualCalcium}
                      onChange={(e) => setManualCalcium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">โพแทสเซียม</label>
                    <input
                      type="number"
                      value={manualPotassium}
                      onChange={(e) => setManualPotassium(parseFloat(e.target.value) || 0)}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Note / Remarks for Manual Food */}
              <div className="space-y-1.5 pt-2 border-t border-pink-100">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-pink-400" />
                  <span>หมายเหตุอาหาร (เช่น กินครึ่งเดียว, ไม่กินผัก):</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น กินแค่ครึ่งเดียว (50%), ไม่กินผัก, ไม่เอาหนัง, ข้าวครึ่งทัพพี..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white"
                />
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  {[
                    { label: '🍽️ กินแค่ครึ่งเดียว', text: 'กินแค่ครึ่งเดียว (50%)' },
                    { label: '🥗 ไม่กินผัก', text: 'ไม่กินผัก' },
                    { label: '🍗 ไม่กินหนัง/มัน', text: 'ไม่กินหนังและมัน' },
                    { label: '🥣 ไม่ซดน้ำซุป', text: 'ไม่ซดน้ำซุป' },
                  ].map((chip) => (
                    <button
                      key={chip.text}
                      type="button"
                      onClick={() => {
                        setManualNote((prev) => (prev ? `${prev}, ${chip.text}` : chip.text));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-slate-600 border border-pink-200/60 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/70 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-xs"
                >
                  บันทึกอาหาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-700 text-base">แก้ไขรายการอาหาร</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">มื้ออาหาร</label>
                  <select
                    value={editForm.meal}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, meal: e.target.value as MealType }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-pink-300 font-bold"
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ปริมาณ (กรัม)</label>
                  <input
                    type="number"
                    value={editForm.grams}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        grams: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-600 mb-1">พลังงาน (kcal) *</label>
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
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-pink-600 font-black focus:outline-none focus:border-pink-300 text-sm"
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
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-sky-700 font-bold focus:outline-none focus:border-pink-300"
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
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-amber-700 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={editForm.fat_g}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fat_g: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-bold focus:outline-none focus:border-pink-300"
                  />
                </div>
              </div>

              {/* Micronutrients Section in Edit Modal */}
              <div className="pt-2 border-t border-pink-100">
                <span className="block font-bold text-slate-700 mb-2">
                  สารอาหารรอง & วิตามิน (Micronutrients)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 mb-1">โซเดียม (mg)</label>
                    <input
                      type="number"
                      value={editForm.sodium_mg}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sodium_mg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      value={editForm.fiber_g}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          fiber_g: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      value={editForm.sugar_g}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sugar_g: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Edit Note */}
              <div className="space-y-1.5 pt-2 border-t border-pink-100">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-pink-400" />
                  <span>หมายเหตุอาหาร (Note):</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น กินแค่ครึ่งเดียว (50%), ไม่กินผัก, ไม่เอาหนัง..."
                  value={editForm.note}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/70 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-xs"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-700 text-base">การเชื่อมต่อ Gemini API</h3>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                ระบบได้เชื่อมต่อ Gemini Multimodal AI อัตโนมัติให้แล้ว
                หากต้องการใช้ API Key ส่วนตัว สามารถวางคีย์ด้านล่างได้เลยครับ
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gemini API Key:</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 font-mono focus:outline-none focus:border-pink-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setApiKeyInput(getDefaultGeminiApiKey())}
                  className="text-pink-600 hover:underline font-semibold"
                >
                  คืนค่าเริ่มต้นอัตโนมัติ
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:underline"
                >
                  รับ API Key ฟรี ↗
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-pink-50/70 text-xs font-bold text-slate-600 hover:bg-pink-100 border border-pink-200/70"
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                บันทึกและเชื่อมต่อ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Goal Setup & Nutrition Calculator Modal */}
      <GoalSetupModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        targetUserKey={selectedUserKey}
      />

      {/* Quick Food Database & Nutrition Reference Modal */}
      <FoodDatabaseModal
        isOpen={showFoodDbModal}
        onClose={() => setShowFoodDbModal(false)}
        onAddFood={addFoodLog}
        selectedUserKey={selectedUserKey}
        targetDate={selectedDate}
      />

      {/* Interactive AI Personal Trainer Modal */}
      <AiTrainerModal
        isOpen={showAiTrainerModal}
        onClose={() => setShowAiTrainerModal(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
};
