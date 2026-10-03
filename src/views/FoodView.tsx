import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodLog, MealType } from '../types';
import {
  resizeImageToMaxDimension,
  analyzeFoodImage,
  analyzeFoodText,
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
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  ExternalLink,
  BookOpen,
  Bot,
  MessageCircle,
  Leaf,
  Droplets,
  Sliders,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { NumberTicker } from '../components/ui/NumberTicker';
import { PigMascot } from '../components/ui/PigMascot';
import { FoodDatabaseModal } from '../components/food/FoodDatabaseModal';
import { AiTrainerModal } from '../components/ai/AiTrainerModal';
import { getUserAvatar, calculatePigEvolution } from '../utils/mascotLevels';

export const FoodView: React.FC = () => {
  const {
    currentProfile,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
    updateProfile,
    foodLogs,
    allFoodLogs,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    startFoodScan,
    isFoodScanning,
    foodScanStatus,
    foodScanResult,
    foodScanError,
    dismissFoodScanResult,
    waterLogs,
    allWaterLogs,
    addWaterLog,
    deleteWaterLog,
    settings,
    updateSettings,
  } = useApp();

  // Quick Food Reference & AI Trainer Modal state
  const [showFoodDbModal, setShowFoodDbModal] = useState(false);
  const [showAiTrainerModal, setShowAiTrainerModal] = useState(false);
  const [showMicronutrients, setShowMicronutrients] = useState(false);
  const [showWaterTracker, setShowWaterTracker] = useState(false);

  // User Selection: Track food per person separately (default to active profile)
  const [selectedUserKey, setSelectedUserKey] = useState<'primary' | 'partner'>(activeProfileKey);

  useEffect(() => {
    setSelectedUserKey(activeProfileKey);
  }, [activeProfileKey]);

  const activeTargetProfile = selectedUserKey === 'partner' ? partnerProfile : primaryProfile;

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
  const maxnumDayCount = (allFoodLogs || []).filter(
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

  // Thai DRI & Custom Nutrient Limits for selected user
  const THAI_DRI = {
    fiber_g: activeTargetProfile.fiber_target_g || 25,
    sodium_mg: activeTargetProfile.sodium_limit_mg || 2000,
    sugar_g: activeTargetProfile.sugar_limit_g || 24,
    vitC_mg: activeTargetProfile.vitC_target_mg || 100,
    calcium_mg: activeTargetProfile.calcium_target_mg || 1000,
    iron_mg: activeTargetProfile.iron_target_mg || (selectedUserKey === 'partner' ? 15 : 12),
    potassium_mg: activeTargetProfile.potassium_target_mg || 3000,
  };

  // Targets strictly for selected user
  const targetKcal = activeTargetProfile.kcal_target || (selectedUserKey === 'primary' ? 2400 : 1750);
  const targetProtein = activeTargetProfile.protein_target_g || (selectedUserKey === 'primary' ? 150 : 110);
  const targetCarb = activeTargetProfile.carb_target_g || (selectedUserKey === 'primary' ? 260 : 180);
  const targetFat = activeTargetProfile.fat_target_g || (selectedUserKey === 'primary' ? 65 : 45);
  const targetFiber = activeTargetProfile.fiber_target_g || 25;

  // Water intake calculations for selected user & date
  const todayWaterLogs = (allWaterLogs || []).filter(
    (w) => w.date === selectedDate && (w.user_id || 'primary') === selectedUserKey
  );
  const totalWaterMl = todayWaterLogs.reduce((sum, w) => sum + (w.amount_ml || 0), 0);
  const targetWaterMl = activeTargetProfile.water_target_ml || (selectedUserKey === 'primary' ? 2500 : 2000);
  const waterPct = Math.min(100, Math.round((totalWaterMl / targetWaterMl) * 100));

  const [showCustomWaterModal, setShowCustomWaterModal] = useState(false);
  const [customWaterMl, setCustomWaterMl] = useState<number | ''>(300);

  // Adjust Nutrition Limits Modal state
  const [showAdjustNutritionModal, setShowAdjustNutritionModal] = useState(false);
  const [adjustKcal, setAdjustKcal] = useState<number | ''>(targetKcal);
  const [adjustProtein, setAdjustProtein] = useState<number | ''>(targetProtein);
  const [adjustCarb, setAdjustCarb] = useState<number | ''>(targetCarb);
  const [adjustFat, setAdjustFat] = useState<number | ''>(targetFat);
  const [adjustFiber, setAdjustFiber] = useState<number | ''>(targetFiber);
  const [adjustWater, setAdjustWater] = useState<number | ''>(targetWaterMl);
  const [adjustSodium, setAdjustSodium] = useState<number | ''>(THAI_DRI.sodium_mg);
  const [adjustSugar, setAdjustSugar] = useState<number | ''>(THAI_DRI.sugar_g);
  const [adjustVitC, setAdjustVitC] = useState<number | ''>(THAI_DRI.vitC_mg);
  const [adjustCalcium, setAdjustCalcium] = useState<number | ''>(THAI_DRI.calcium_mg);
  const [adjustIron, setAdjustIron] = useState<number | ''>(THAI_DRI.iron_mg);
  const [adjustPotassium, setAdjustPotassium] = useState<number | ''>(THAI_DRI.potassium_mg);

  const handleOpenAdjustModal = () => {
    setAdjustKcal(activeTargetProfile.kcal_target || (selectedUserKey === 'primary' ? 2400 : 1750));
    setAdjustProtein(activeTargetProfile.protein_target_g || (selectedUserKey === 'primary' ? 150 : 110));
    setAdjustCarb(activeTargetProfile.carb_target_g || (selectedUserKey === 'primary' ? 260 : 180));
    setAdjustFat(activeTargetProfile.fat_target_g || (selectedUserKey === 'primary' ? 65 : 45));
    setAdjustFiber(activeTargetProfile.fiber_target_g || 25);
    setAdjustWater(activeTargetProfile.water_target_ml || (selectedUserKey === 'primary' ? 2500 : 2000));
    setAdjustSodium(activeTargetProfile.sodium_limit_mg || 2000);
    setAdjustSugar(activeTargetProfile.sugar_limit_g || 24);
    setAdjustVitC(activeTargetProfile.vitC_target_mg || 100);
    setAdjustCalcium(activeTargetProfile.calcium_target_mg || 1000);
    setAdjustIron(activeTargetProfile.iron_target_mg || (selectedUserKey === 'partner' ? 15 : 12));
    setAdjustPotassium(activeTargetProfile.potassium_target_mg || 3000);
    setShowAdjustNutritionModal(true);
  };

  const handleSaveAdjustNutrition = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      {
        kcal_target: Number(adjustKcal) || 2000,
        protein_target_g: Number(adjustProtein) || 150,
        carb_target_g: Number(adjustCarb) || 200,
        fat_target_g: Number(adjustFat) || 60,
        fiber_target_g: Number(adjustFiber) || 25,
        water_target_ml: Number(adjustWater) || 2500,
        sodium_limit_mg: Number(adjustSodium) || 2000,
        sugar_limit_g: Number(adjustSugar) || 24,
        vitC_target_mg: Number(adjustVitC) || 100,
        calcium_target_mg: Number(adjustCalcium) || 1000,
        iron_target_mg: Number(adjustIron) || (selectedUserKey === 'partner' ? 15 : 12),
        potassium_target_mg: Number(adjustPotassium) || 3000,
      },
      selectedUserKey === 'partner'
    );
    setShowAdjustNutritionModal(false);
  };

  const handleResetAdjustNutrition = () => {
    setAdjustFiber(25);
    setAdjustWater(selectedUserKey === 'primary' ? 2500 : 2000);
    setAdjustSodium(2000);
    setAdjustSugar(24);
    setAdjustVitC(100);
    setAdjustCalcium(1000);
    setAdjustIron(selectedUserKey === 'partner' ? 15 : 12);
    setAdjustPotassium(3000);
  };

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
  const [isSubmittingAi, setIsSubmittingAi] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiResultItems, setAiResultItems] = useState<GeminiFoodItem[]>([]);
  const [baseAiItems, setBaseAiItems] = useState<GeminiFoodItem[]>([]); // Stored original before multiplier
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [showAiResultModal, setShowAiResultModal] = useState(false);

  // Photo Note Flow: Holds the captured photo(s) so user can add notes BEFORE analyzing
  const [pendingPhotos, setPendingPhotos] = useState<
    {
      id: string;
      base64: string;
      mimeType: string;
      previewUrl: string;
    }[]
  >([]);
  const [showPhotoNoteModal, setShowPhotoNoteModal] = useState(false);

  // Custom User Note for AI Prompt (เช่น กินแค่ครึ่งเดียว, ไม่กินผัก)
  const [aiUserNote, setAiUserNote] = useState<string>('');

  // Manual Add Modal State (With Micronutrients & Note)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualMeal, setManualMeal] = useState<MealType>('lunch');
  const [manualGrams, setManualGrams] = useState<number | ''>(200);
  const [manualKcal, setManualKcal] = useState<number | ''>(350);
  const [manualProtein, setManualProtein] = useState<number | ''>(25);
  const [manualCarb, setManualCarb] = useState<number | ''>(40);
  const [manualFat, setManualFat] = useState<number | ''>(10);
  const [manualFiber, setManualFiber] = useState<number | ''>('');
  const [manualSugar, setManualSugar] = useState<number | ''>('');
  const [manualSodium, setManualSodium] = useState<number | ''>('');
  const [manualVitC, setManualVitC] = useState<number | ''>('');
  const [manualIron, setManualIron] = useState<number | ''>('');
  const [manualCalcium, setManualCalcium] = useState<number | ''>('');
  const [manualPotassium, setManualPotassium] = useState<number | ''>('');
  const [manualNote, setManualNote] = useState('');

  // AI Text Food Search & Add State
  const [showAiTextModal, setShowAiTextModal] = useState(false);
  const [aiTextQuery, setAiTextQuery] = useState('');
  const [aiTextNote, setAiTextNote] = useState('');
  const [aiTextMeal, setAiTextMeal] = useState<MealType>('lunch');
  const [aiTextUserId, setAiTextUserId] = useState<'primary' | 'partner'>(activeProfileKey);
  const [isAiTextSearching, setIsAiTextSearching] = useState(false);
  const [aiTextError, setAiTextError] = useState<string | null>(null);
  const [aiTextItems, setAiTextItems] = useState<GeminiFoodItem[]>([]);
  const [baseAiTextItems, setBaseAiTextItems] = useState<GeminiFoodItem[]>([]);
  const [aiTextMultiplier, setAiTextMultiplier] = useState<number>(1.0);
  const [aiTextAiNotes, setAiTextAiNotes] = useState<string>('');
  const [isSubmittingAiText, setIsSubmittingAiText] = useState(false);

  // Edit Food Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    meal: MealType;
    grams: number | '';
    kcal: number | '';
    protein_g: number | '';
    carb_g: number | '';
    fat_g: number | '';
    fiber_g: number | '';
    sugar_g: number | '';
    sodium_mg: number | '';
    vitC_mg: number | '';
    iron_mg: number | '';
    calcium_mg: number | '';
    potassium_mg: number | '';
    note: string;
  }>({
    name: '',
    meal: 'lunch',
    grams: 200,
    kcal: 350,
    protein_g: 25,
    carb_g: 40,
    fat_g: 10,
    fiber_g: '',
    sugar_g: '',
    sodium_mg: '',
    vitC_mg: '',
    iron_mg: '',
    calcium_mg: '',
    potassium_mg: '',
    note: '',
  });

  // Open Edit Modal
  const handleOpenEdit = (log: FoodLog) => {
    setEditingLogId(log.log_id);
    setEditForm({
      name: log.name || '',
      meal: log.meal || 'lunch',
      grams: log.grams ?? '',
      kcal: log.kcal ?? '',
      protein_g: log.protein_g ?? '',
      carb_g: log.carb_g ?? '',
      fat_g: log.fat_g ?? '',
      fiber_g: log.fiber_g ?? '',
      sugar_g: log.sugar_g ?? '',
      sodium_mg: log.sodium_mg ?? '',
      vitC_mg: log.micros?.vitC_mg ?? '',
      iron_mg: log.micros?.iron_mg ?? '',
      calcium_mg: log.micros?.calcium_mg ?? '',
      potassium_mg: log.micros?.potassium_mg ?? '',
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
      grams: Number(editForm.grams) || 0,
      kcal: Number(editForm.kcal) || 0,
      protein_g: Number(editForm.protein_g) || 0,
      carb_g: Number(editForm.carb_g) || 0,
      fat_g: Number(editForm.fat_g) || 0,
      fiber_g: editForm.fiber_g === '' ? undefined : Number(editForm.fiber_g),
      sugar_g: editForm.sugar_g === '' ? undefined : Number(editForm.sugar_g),
      sodium_mg: editForm.sodium_mg === '' ? undefined : Number(editForm.sodium_mg),
      micros: {
        vitC_mg: editForm.vitC_mg === '' ? undefined : Number(editForm.vitC_mg),
        iron_mg: editForm.iron_mg === '' ? undefined : Number(editForm.iron_mg),
        calcium_mg: editForm.calcium_mg === '' ? undefined : Number(editForm.calcium_mg),
        potassium_mg: editForm.potassium_mg === '' ? undefined : Number(editForm.potassium_mg),
      },
      note: editForm.note.trim() || undefined,
    });

    setShowEditModal(false);
    setEditingLogId(null);
  };

  // Step 1: User selects or captures photo(s) -> Open photo preview & note prompt dialog FIRST
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newItems: { id: string; base64: string; mimeType: string; previewUrl: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { base64, mimeType } = await resizeImageToMaxDimension(file, 1024, 0.85);
        const previewUrl = `data:${mimeType};base64,${base64}`;
        newItems.push({
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) + '_' + i,
          base64,
          mimeType,
          previewUrl,
        });
      }

      if (newItems.length > 0) {
        setPreviewImage(newItems[0].previewUrl);
        setPendingPhotos((prev) => [...prev, ...newItems]);
        setShowPhotoNoteModal(true); // Open note & photo preview modal immediately!
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemovePendingPhoto = (id: string) => {
    setPendingPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (updated.length === 0) {
        setShowPhotoNoteModal(false);
      }
      return updated;
    });
  };

  // Step 2: User confirms note and clicks "Send to AI for analysis"
  const handleStartAnalysis = async () => {
    if (pendingPhotos.length === 0) return;

    const photosToSend = [...pendingPhotos];
    const currentNote = aiUserNote;

    setShowPhotoNoteModal(false);
    setPendingPhotos([]);
    setAiUserNote('');
    setAnalysisError(null);

    // Run global background scan in AppContext so navigating away or closing never loses progress
    startFoodScan({
      base64Images: photosToSend.map((p) => ({ base64: p.base64, mimeType: p.mimeType })),
      base64Image: photosToSend[0].base64,
      mimeType: photosToSend[0].mimeType,
      targetUserId: selectedUserKey,
      targetDate: selectedDate,
      targetMeal: selectedMeal,
      userNote: currentNote,
    });
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
    if (isSubmittingAi) return;
    setIsSubmittingAi(true);

    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsToSave = [...aiResultItems];
    const userNoteToSave = aiUserNote.trim() || undefined;

    // Immediately close modal and reset preview so user cannot double-tap
    setShowAiResultModal(false);
    setPreviewImage(null);
    setAiResultItems([]);
    setBaseAiItems([]);
    setAiUserNote('');

    try {
      for (const item of itemsToSave) {
        await addFoodLog({
          date: selectedDate,
          time: nowTime,
          meal: selectedMeal,
          name: item.name,
          grams: Number(item.grams) || 0,
          kcal: Number(item.kcal) || 0,
          protein_g: Number(item.protein_g) || 0,
          carb_g: Number(item.carb_g) || 0,
          fat_g: Number(item.fat_g) || 0,
          fiber_g: typeof item.fiber_g === 'number' ? item.fiber_g : (item.fiber_g ? Number(item.fiber_g) : undefined),
          sugar_g: typeof item.sugar_g === 'number' ? item.sugar_g : (item.sugar_g ? Number(item.sugar_g) : undefined),
          sodium_mg: typeof item.sodium_mg === 'number' ? item.sodium_mg : (item.sodium_mg ? Number(item.sodium_mg) : undefined),
          micros: item.micros,
          source: 'ai',
          confidence: item.confidence,
          user_id: selectedUserKey,
          note: userNoteToSave,
        });
      }
    } catch (err) {
      console.error('Error saving AI food items:', err);
    } finally {
      setIsSubmittingAi(false);
    }
  };

  // Water intake quick add handler
  const handleAddWater = async (amount: number) => {
    if (!amount || amount <= 0) return;
    await addWaterLog(amount, selectedDate, selectedUserKey);
  };

  // Update item in AI modal before confirming
  const handleUpdateAiItem = (index: number, field: keyof GeminiFoodItem, value: any) => {
    setAiResultItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Start AI Text Search & Calculation
  const handleStartAiTextSearch = async () => {
    if (!aiTextQuery.trim()) return;

    if (!effectiveGeminiKey) {
      setApiKeyInput(getDefaultGeminiApiKey());
      setShowApiKeyModal(true);
      return;
    }

    setIsAiTextSearching(true);
    setAiTextError(null);

    try {
      const response = await analyzeFoodText({
        query: aiTextQuery.trim(),
        userNotes: aiTextNote.trim() || undefined,
        apiKey: effectiveGeminiKey,
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('ไม่พบข้อมูลอาหารจากข้อความที่ระบุ กรุณาลองใหม่อีกครั้ง');
      }

      setAiTextItems(response.items);
      setBaseAiTextItems(response.items);
      setAiTextMultiplier(1.0);
      setAiTextAiNotes(response.notes || '');
    } catch (err: any) {
      console.error('AI Text Search error:', err);
      setAiTextError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์อาหารด้วย AI');
    } finally {
      setIsAiTextSearching(false);
    }
  };

  // Apply portion multiplier to AI Text items
  const handleApplyAiTextMultiplier = (factor: number) => {
    setAiTextMultiplier(factor);
    setAiTextItems(
      baseAiTextItems.map((item) => ({
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

  // Update item field in AI Text modal
  const handleUpdateAiTextItem = (index: number, field: keyof GeminiFoodItem, value: any) => {
    setAiTextItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Delete item from AI Text modal
  const handleDeleteAiTextItem = (index: number) => {
    setAiTextItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Confirm and save AI Text items to food log
  const handleConfirmAiTextFood = async () => {
    if (isSubmittingAiText || aiTextItems.length === 0) return;
    setIsSubmittingAiText(true);

    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsToSave = [...aiTextItems];
    const userNoteToSave = [aiTextQuery.trim(), aiTextNote.trim()].filter(Boolean).join(' | ');

    try {
      for (const item of itemsToSave) {
        await addFoodLog({
          date: selectedDate,
          time: nowTime,
          meal: aiTextMeal,
          name: item.name,
          grams: Number(item.grams) || 0,
          kcal: Number(item.kcal) || 0,
          protein_g: Number(item.protein_g) || 0,
          carb_g: Number(item.carb_g) || 0,
          fat_g: Number(item.fat_g) || 0,
          fiber_g: typeof item.fiber_g === 'number' ? item.fiber_g : (item.fiber_g ? Number(item.fiber_g) : undefined),
          sugar_g: typeof item.sugar_g === 'number' ? item.sugar_g : (item.sugar_g ? Number(item.sugar_g) : undefined),
          sodium_mg: typeof item.sodium_mg === 'number' ? item.sodium_mg : (item.sodium_mg ? Number(item.sodium_mg) : undefined),
          micros: item.micros,
          source: 'ai',
          confidence: item.confidence ?? 0.9,
          user_id: aiTextUserId,
          note: userNoteToSave || undefined,
        });
      }

      setShowAiTextModal(false);
      setAiTextQuery('');
      setAiTextNote('');
      setAiTextItems([]);
      setBaseAiTextItems([]);
    } catch (err: any) {
      console.error('Error saving AI text food items:', err);
      setAiTextError(err.message || 'เกิดข้อผิดพลาดในการบันทึกอาหาร');
    } finally {
      setIsSubmittingAiText(false);
    }
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
      grams: Number(manualGrams) || 0,
      kcal: Number(manualKcal) || 0,
      protein_g: Number(manualProtein) || 0,
      carb_g: Number(manualCarb) || 0,
      fat_g: Number(manualFat) || 0,
      fiber_g: manualFiber === '' ? 0 : Number(manualFiber),
      sugar_g: manualSugar === '' ? 0 : Number(manualSugar),
      sodium_mg: manualSodium === '' ? 0 : Number(manualSodium),
      micros: {
        vitC_mg: manualVitC === '' ? 0 : Number(manualVitC),
        iron_mg: manualIron === '' ? 0 : Number(manualIron),
        calcium_mg: manualCalcium === '' ? 0 : Number(manualCalcium),
        potassium_mg: manualPotassium === '' ? 0 : Number(manualPotassium),
      },
      source: 'manual',
      confidence: 1.0,
      user_id: selectedUserKey,
      note: manualNote.trim() || undefined,
    });

    setShowManualModal(false);
    setManualName('');
    setManualNote('');
    setManualGrams(200);
    setManualKcal(350);
    setManualProtein(25);
    setManualCarb(40);
    setManualFat(10);
    setManualFiber('');
    setManualSugar('');
    setManualSodium('');
    setManualVitC('');
    setManualIron('');
    setManualCalcium('');
    setManualPotassium('');
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Cute Pig Mascot Kitchen Greeting Card */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-white/90 border border-pink-200/70 shadow-sm shadow-pink-100/40 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-pink-200 shadow-2xs shrink-0 bg-pink-50 flex items-center justify-center">
          <img
            src={getUserAvatar(selectedUserKey)}
            alt={activeTargetProfile.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
              ครัวหมูอ้วน 🍓
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {activeTargetProfile.name}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            บันทึกโภชนาการและแคลอรีประจำวัน
          </p>
        </div>
      </div>

      {/* User Switcher Pills: Clean 2-person toggle with avatars */}
      <div className="flex items-center p-1 bg-white/90 rounded-2xl border border-pink-200/70 gap-1.5 shadow-2xs">
        <button
          onClick={() => setSelectedUserKey('primary')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            selectedUserKey === 'primary'
              ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 hover:bg-sky-50/50'
          }`}
        >
          <img src={getUserAvatar('primary')} className="w-4 h-4 rounded-full object-cover border border-white/60" />
          <span>แม็กนั่ม ({maxnumDayCount})</span>
        </button>
        <button
          onClick={() => setSelectedUserKey('partner')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            selectedUserKey === 'partner'
              ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 hover:bg-pink-50/50'
          }`}
        >
          <img src={getUserAvatar('partner')} className="w-4 h-4 rounded-full object-cover border border-white/60" />
          <span>มะนาว ({manowDayCount})</span>
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
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <p className="text-xs text-slate-500">
                  เป้าหมาย: <strong className="text-slate-700">{targetKcal.toLocaleString()} kcal</strong>
                </p>
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
                    <NumberTicker value={Math.round(totalFiber * 10) / 10} /> / {targetFiber}g
                  </span>
                </div>
                <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalFiber / targetFiber) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Single Unified Adjust Limit & Target Button */}
            <button
              type="button"
              onClick={handleOpenAdjustModal}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs shadow-pink-200/50 transition active:scale-95 cursor-pointer"
              title="ปรับเป้าหมายพลังงานและ Limit สารอาหารทั้งหมด"
            >
              <Sliders size={14} className="text-white" />
              <span>ปรับ Limit & สารอาหาร ({activeTargetProfile.name})</span>
            </button>
          </div>
        </div>

        {/* Thai DRI Micronutrients Dashboard (Collapsible) */}
        <div className="mt-5 pt-3 border-t border-pink-100/90">
          <button
            type="button"
            onClick={() => setShowMicronutrients(!showMicronutrients)}
            className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-500" />
                <span>วิตามิน & แร่ธาตุ (Thai DRI)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                โซเดียม, ใยอาหาร ฯลฯ
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-slate-800">
              <span>{showMicronutrients ? 'ซ่อน' : 'ดูรายละเอียด'}</span>
              {showMicronutrients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {showMicronutrients && (
            <div className="pt-3 space-y-3">
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
          )}
        </div>
      </MagicCard>

      {/* Water Intake Tracker Card (Collapsible) */}
      <div className="rounded-3xl bg-white/95 border border-sky-100/90 shadow-sm shadow-sky-100/40 overflow-hidden transition-all">
        {/* Collapsible Header */}
        <button
          type="button"
          onClick={() => setShowWaterTracker(!showWaterTracker)}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-sky-50/40 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-xs shadow-sky-300/50 shrink-0">
              <Droplets size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-800 text-sm sm:text-base">
                  บันทึกการดื่มน้ำ 💧
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  {activeTargetProfile.name}
                </span>
                <span className="text-xs font-black font-mono text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/70">
                  {totalWaterMl.toLocaleString()} / {targetWaterMl.toLocaleString()} ml ({waterPct}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                เป้าหมายวันละ {targetWaterMl.toLocaleString()} ml ({waterPct >= 100 ? '🎉 ครบแล้ว' : `ขาดอีก ${(Math.max(0, targetWaterMl - totalWaterMl)).toLocaleString()} ml`})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 shrink-0">
            <span className="hidden sm:inline">{showWaterTracker ? 'พับเก็บ' : 'บันทึกน้ำ'}</span>
            {showWaterTracker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Expanded Water Tracker Body */}
        {showWaterTracker && (
          <div className="p-4 sm:p-5 pt-0 border-t border-sky-100/60 space-y-4 animate-fadeIn">
            {/* Animated Water Progress Bar */}
            <div className="space-y-1.5 pt-3">
              <div className="w-full h-3.5 bg-sky-50 rounded-full p-0.5 border border-sky-100 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 transition-all duration-500 shadow-xs relative overflow-hidden"
                  style={{ width: `${waterPct}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>0 ml</span>
                <span className="text-sky-600 font-mono">{waterPct}%</span>
                <span>{targetWaterMl.toLocaleString()} ml</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: '+250 ml', icon: '🥛', desc: 'แก้วเล็ก', amount: 250 },
                { label: '+500 ml', icon: '💧', desc: 'ขวดเล็ก', amount: 500 },
                { label: '+750 ml', icon: '🧋', desc: 'กระบอกน้ำ', amount: 750 },
                { label: '+1,000 ml', icon: '🍶', desc: 'ขวดใหญ่', amount: 1000 },
              ].map((btn) => (
                <button
                  key={btn.amount}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWater(btn.amount);
                  }}
                  className="p-2.5 rounded-2xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/70 text-slate-700 transition active:scale-95 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs group"
                >
                  <span className="text-base group-hover:scale-110 transition">{btn.icon}</span>
                  <span className="text-xs font-black text-sky-700">{btn.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{btn.desc}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomWaterModal(true);
                }}
                className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 transition active:scale-95 text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs col-span-2 sm:col-span-1"
              >
                <Plus size={16} className="text-sky-500 mb-0.5" />
                <span className="text-xs font-black text-slate-700">กำหนดเอง</span>
                <span className="text-[10px] text-slate-400 font-medium">กรอก ml</span>
              </button>
            </div>

            {/* Today's Water Log History */}
            {todayWaterLogs.length > 0 && (
              <div className="pt-2 border-t border-sky-100/60">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  ประวัติการดื่มน้ำวันนี้ ({todayWaterLogs.length} ครั้ง):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {todayWaterLogs.map((log) => (
                    <div
                      key={log.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50/80 border border-sky-200/80 text-xs text-slate-700 shadow-2xs"
                    >
                      <span className="text-sky-500 text-[11px]">💧</span>
                      <span className="font-bold text-sky-800">{log.amount_ml} ml</span>
                      {log.time && <span className="text-[10px] text-slate-400">({log.time})</span>}
                      <button
                        type="button"
                        onClick={() => deleteWaterLog(log.id)}
                        className="text-slate-300 hover:text-rose-500 transition ml-0.5 p-0.5"
                        title="ลบรายการนี้"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Action Buttons: Camera / Gallery / AI Text Search / Quick Food DB / Manual Add */}
      {/* Action Buttons: Camera / Gallery / AI Text Search / Quick Food DB / Manual Add */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
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
          multiple
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
          disabled={isFoodScanning}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-2xs shadow-pink-200/50 active:scale-95 transition group cursor-pointer min-h-[52px] ${
            isFoodScanning ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          title="ถ่ายรูปอาหาร (เปิดกล้องถ่ายสด → AI วิเคราะห์)"
        >
          <Camera size={18} className={`stroke-[2.5] shrink-0 ${isFoodScanning ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] sm:text-xs font-bold truncate max-w-full text-center">
            {isFoodScanning ? 'สแกน...' : 'ถ่ายรูป'}
          </span>
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
          disabled={isFoodScanning}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-2xl bg-white/95 hover:bg-pink-50/70 border border-pink-200/80 text-pink-600 font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-2xs active:scale-95 transition group cursor-pointer min-h-[52px] ${
            isFoodScanning ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          title="อัปโหลดรูปจากคลังภาพ / ไฟล์"
        >
          <Upload size={17} className="shrink-0 group-hover:scale-110 transition" />
          <span className="text-[10px] sm:text-xs font-bold truncate max-w-full text-center">
            คลังภาพ
          </span>
        </button>

        {/* AI Text Search & Calculate Button */}
        <button
          onClick={() => {
            if (!effectiveGeminiKey) {
              setApiKeyInput(getDefaultGeminiApiKey());
              setShowApiKeyModal(true);
              return;
            }
            setAiTextUserId(selectedUserKey);
            setShowAiTextModal(true);
          }}
          className="py-2 px-1 sm:py-2.5 sm:px-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 text-white font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-2xs shadow-purple-200/50 active:scale-95 transition group cursor-pointer min-h-[52px]"
          title="พิมพ์สั่ง AI ค้นหาแคลและสารอาหาร"
        >
          <Sparkles size={17} className="animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold truncate max-w-full text-center">
            สั่ง AI
          </span>
        </button>

        {/* Quick Food Database Reference Button */}
        <button
          onClick={() => setShowFoodDbModal(true)}
          className="py-2 px-1 sm:py-2.5 sm:px-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100/80 hover:to-teal-100/80 border border-emerald-200/80 text-emerald-800 font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-2xs active:scale-95 transition group cursor-pointer min-h-[52px]"
          title="เปิดตารางอาหารด่วน แตะลงมื้อทันที"
        >
          <BookOpen size={17} className="text-emerald-600 shrink-0 group-hover:scale-110 transition" />
          <span className="text-[10px] sm:text-xs font-bold truncate max-w-full text-center">
            ตารางด่วน
          </span>
        </button>

        {/* Manual Add Button */}
        <button
          onClick={() => setShowManualModal(true)}
          className="py-2 px-1 sm:py-2.5 sm:px-2 rounded-2xl bg-white/95 hover:bg-pink-50/70 border border-pink-200/80 text-slate-700 font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-2xs active:scale-95 transition group cursor-pointer min-h-[52px]"
          title="กรอกรายการและสารอาหารเอง"
        >
          <Plus size={18} className="text-pink-500 shrink-0 group-hover:scale-110 transition" />
          <span className="text-[10px] sm:text-xs font-bold truncate max-w-full text-center">
            กรอกเอง
          </span>
        </button>
      </div>

      {/* Non-blocking Background Analyzing Indicator */}
      {isFoodScanning && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 border border-pink-200/80 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-pink-300/50">
              <Sparkles size={18} className="animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{foodScanStatus || 'กำลังวิเคราะห์รูปอาหารในพื้นหลัง...'}</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 animate-pulse">
                  Background
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ระบบกำลังคำนวณแคลอรีและบันทึกอัตโนมัติ คุณสามารถสลับไปหน้าอื่นหรือปิดแอปได้โดยข้อมูลไม่หาย
              </p>
            </div>
          </div>
          <span className="text-xs text-pink-600 font-bold hidden sm:inline">ประมวลผลอยู่ ⚡</span>
        </div>
      )}

      {/* Background Scan Error Alert */}
      {foodScanError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{foodScanError}</span>
          </div>
          <button
            type="button"
            onClick={dismissFoodScanResult}
            className="text-slate-400 hover:text-rose-700 font-bold p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error alert */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs shadow-2xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">เกิดข้อผิดพลาดในการวิเคราะห์</p>
            <p className="mt-0.5">{analysisError}</p>
          </div>
          <button
            type="button"
            onClick={() => setAnalysisError(null)}
            className="text-rose-400 hover:text-rose-700 p-1"
          >
            <X size={14} />
          </button>
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


      {/* Photo Preview & Note Modal (Appears immediately AFTER taking or uploading photo(s)) */}
      {showPhotoNoteModal && pendingPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border-t sm:border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))] overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 shrink-0">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-pink-500" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ระบุหมายเหตุให้ AI (รูปอาหาร {pendingPhotos.length} รูป)
                  </h3>
                  <p className="text-[11px] text-slate-500">บันทึกลงโปรไฟล์ของ {activeTargetProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPhotoNoteModal(false);
                  setPendingPhotos([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo Gallery Grid with Multi-Angle Support */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 text-xs">
                  รูปอาหารที่เลือก ({pendingPhotos.length} รูป — ถ่ายหลายมุมได้):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 bg-pink-100/80 hover:bg-pink-200 text-pink-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Camera size={13} />
                    <span>+ ถ่ายมุมเพิ่ม</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200/70 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Upload size={13} />
                    <span>+ คลังรูป</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {pendingPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="relative h-28 sm:h-32 rounded-2xl overflow-hidden bg-pink-50 border border-pink-200/80 shadow-2xs group"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Food Angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold backdrop-blur-xs">
                      📸 มุมที่ {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingPhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition cursor-pointer shadow-xs backdrop-blur-xs"
                      title="ลบรูปนี้"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add more angle tile */}
                <div className="h-28 sm:h-32 rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-300 bg-pink-50/30 hover:bg-pink-50/60 flex flex-col items-center justify-center p-2 text-center transition gap-1.5">
                  <span className="text-[10px] font-bold text-slate-600">+ เพิ่มมุม/รูป</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-1.5 rounded-xl bg-white hover:bg-pink-100 text-pink-600 border border-pink-200 shadow-2xs cursor-pointer"
                      title="ถ่ายมุมอื่นเพิ่ม"
                    >
                      <Camera size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-1.5 rounded-xl bg-white hover:bg-pink-100 text-pink-600 border border-pink-200 shadow-2xs cursor-pointer"
                      title="เลือกรูปเพิ่มจากคลัง"
                    >
                      <Upload size={14} />
                    </button>
                  </div>
                </div>
              </div>
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
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer min-h-[38px] ${
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

            {/* AI Custom Prompt / Food Notes Section (Expanded for easy typing) */}
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

              <textarea
                rows={3}
                placeholder="พิมพ์หมายเหตุอาหาร เช่น กินแค่ครึ่งเดียว (50%), ไม่กินผัก, ไม่เอาหนัง/มัน, ไม่ซดน้ำซุป, ข้าวครึ่งทัพพี, ชามนี้มีอกไก่ประมาณ 150g..."
                value={aiUserNote}
                onChange={(e) => setAiUserNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200/70 rounded-2xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-300 focus:bg-white transition resize-y min-h-[76px]"
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
                      className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 font-medium cursor-pointer min-h-[32px] flex items-center ${
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
            <div className="pt-2 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoNoteModal(false);
                  setPendingPhotos([]);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer min-h-[44px]"
              >
                ยกเลิก / ปิด
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Sparkles size={15} />
                <span>ส่งให้ AI วิเคราะห์ ({pendingPhotos.length} รูป)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Food Analysis Result Modal */}
      {showAiResultModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] bg-white border-t sm:border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Header */}
            <div className="p-4 border-b border-pink-100 bg-pink-50/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-pink-500" />
                <div>
                  <h3 className="font-bold text-slate-700 text-base">ผลการวิเคราะห์อาหาร (AI)</h3>
                  <p className="text-[11px] text-slate-500">บันทึกลงโปรไฟล์ของ {activeTargetProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-pink-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs border border-pink-200/70 cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs overscroll-contain">
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
                      className={`py-2 rounded-xl font-bold text-[11px] transition active:scale-95 min-h-[38px] ${
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
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition min-h-[38px] ${
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
                        className="bg-white border border-pink-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 flex-1 min-h-[38px]"
                      />
                      <span className="text-[10px] text-pink-600 font-bold bg-pink-100/70 px-2 py-0.5 rounded border border-pink-200/60 shrink-0">
                        แม่นยำ {Math.round((item.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">กรัม (g)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.grams === 0 ? '' : item.grams}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'grams', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-slate-700 min-h-[36px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-pink-600 font-bold block mb-0.5">kcal</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.kcal === 0 ? '' : item.kcal}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'kcal', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-pink-600 min-h-[36px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-sky-700 font-bold block mb-0.5">โปรตีน (g)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.protein_g === 0 ? '' : item.protein_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'protein_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-sky-700 min-h-[36px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold block mb-0.5">คาร์บ (g)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.carb_g === 0 ? '' : item.carb_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'carb_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-amber-700 min-h-[36px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-pink-100">
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block mb-0.5">ไขมัน (g)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.fat_g === 0 ? '' : item.fat_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fat_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-rose-600 min-h-[36px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold block mb-0.5">โซเดียม (mg)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.sodium_mg ?? ''}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'sodium_mg', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-slate-700 min-h-[36px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">ไฟเบอร์ (g)</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.fiber_g ?? ''}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fiber_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                          }
                          className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-emerald-700 min-h-[36px]"
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
            <div className="p-4 border-t border-pink-100 bg-pink-50/60 flex items-center gap-3 shrink-0">
              <button
                onClick={handleConfirmAiFood}
                disabled={isSubmittingAi}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition min-h-[44px] cursor-pointer"
              >
                <CheckCircle2 size={16} />
                {isSubmittingAi ? 'กำลังบันทึก...' : `บันทึกลงโปรไฟล์ของ ${activeTargetProfile.name}`}
              </button>
              <button
                onClick={() => {
                  setShowAiResultModal(false);
                  setAiUserNote('');
                }}
                className="py-3 px-4 rounded-xl bg-white hover:bg-pink-100 text-slate-600 border border-pink-200/70 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Text Food Search & Add Modal */}
      {showAiTextModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] bg-white border-t sm:border border-purple-200 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Modal Header */}
            <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                    <span>พิมพ์สั่ง AI คำนวณอาหาร</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Smart AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    พิมพ์ชื่อเมนูไทย/เทศ → AI ประมาณการกรัม แคลอรี และสารอาหารให้อัตโนมัติ
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiTextModal(false);
                  setAiTextError(null);
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-purple-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs border border-purple-200 transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs overscroll-contain">
              {/* Profile & Meal Picker */}
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">บันทึกลงโปรไฟล์:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAiTextUserId('primary')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[38px] ${
                        aiTextUserId === 'primary'
                          ? 'bg-sky-500 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <img src={getUserAvatar('primary')} className="w-4 h-4 rounded-full object-cover" />
                      <span>แม็กนั่ม</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiTextUserId('partner')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[38px] ${
                        aiTextUserId === 'partner'
                          ? 'bg-pink-500 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-pink-50'
                      }`}
                    >
                      <img src={getUserAvatar('partner')} className="w-4 h-4 rounded-full object-cover" />
                      <span>มะนาว</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">เลือกมื้ออาหาร:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setAiTextMeal(meal)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition min-h-[38px] ${
                          aiTextMeal === meal
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-purple-200/70 hover:bg-purple-100/50'
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
              </div>

              {/* Mode A: Input Query (Before Analysis or Searching New) */}
              {aiTextItems.length === 0 ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      พิมพ์ชื่ออาหาร หรือ เมนูที่ทาน *
                    </label>
                    <textarea
                      rows={3}
                      value={aiTextQuery}
                      onChange={(e) => setAiTextQuery(e.target.value)}
                      placeholder="เช่น ข้าวมันไก่พิเศษไม่เอาหนัง + ไข่ต้ม 2 ฟอง หรือ สเต็กแซลมอนย่าง 150g กับข้าวกล้องและบรอกโคลี..."
                      className="w-full px-3.5 py-2.5 bg-purple-50/30 border border-purple-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white transition resize-none text-base sm:text-xs"
                    />
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">แตะเพื่อใส่เมนูด่วน:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        'ข้าวมันไก่พิเศษไม่เอาหนัง',
                        'ข้าวกะเพราหมูสับไข่ดาว',
                        'สลัดอกไก่ + ไข่ต้ม 2 ฟอง',
                        'ก๋วยเตี๋ยวเส้นเล็กเนื้อน้ำตก',
                        'ชาไทยหวานน้อย 25%',
                        'แซลมอนย่างซีอิ๊ว 150g กับข้าวกล้อง',
                        'เวย์โปรตีน 1 สกู๊ป ผสมนมจืด 200ml',
                        'ไข่ต้ม 2 ฟอง + กล้วยหอม 1 ลูก',
                      ].map((dish) => (
                        <button
                          key={dish}
                          type="button"
                          onClick={() =>
                            setAiTextQuery((prev) => (prev ? `${prev} + ${dish}` : dish))
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-[11px] font-medium transition active:scale-95 cursor-pointer min-h-[34px] flex items-center"
                        >
                          + {dish}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Custom Note */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      หมายเหตุเพิ่มเติมให้ AI (เช่น กินครึ่งเดียว, ไม่ซดน้ำซุป):
                    </label>
                    <input
                      type="text"
                      value={aiTextNote}
                      onChange={(e) => setAiTextNote(e.target.value)}
                      placeholder="เช่น กินแค่ 50%, ใช้น้ำมันมะกอกน้อย, ไม่ใส่น้ำตาล..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-300 focus:bg-white transition text-base sm:text-xs"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        'กินแค่ครึ่งเดียว (50%)',
                        'ไม่เอาหนังและมัน',
                        'ไม่ซดน้ำซุป',
                        'ข้าวครึ่งทัพพี',
                        'หวานน้อยมาก',
                      ].map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() =>
                            setAiTextNote((prev) => (prev ? `${prev}, ${note}` : note))
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium min-h-[30px] flex items-center"
                        >
                          + {note}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {aiTextError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-rose-500" />
                        <span>{aiTextError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiTextError(null)}
                        className="text-slate-400 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleStartAiTextSearch}
                      disabled={isAiTextSearching || !aiTextQuery.trim()}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-200/50 transition active:scale-98 cursor-pointer min-h-[48px]"
                    >
                      {isAiTextSearching ? (
                        <>
                          <Sparkles size={16} className="animate-spin" />
                          <span>AI กำลังค้นหาข้อมูลและคำนวณแคลอรี... ⚡</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>ค้นหาและคำนวณด้วย AI ✨</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode B: Display Results and Allow Editing */
                <div className="space-y-4 animate-fadeIn">
                  {/* Notes from AI */}
                  {aiTextAiNotes && (
                    <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/70 text-[11px] text-purple-900 flex items-start gap-2">
                      <Sparkles size={14} className="shrink-0 text-purple-500 mt-0.5" />
                      <span>{aiTextAiNotes}</span>
                    </div>
                  )}

                  {/* Portion Multipliers */}
                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-1.5">
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
                          onClick={() => handleApplyAiTextMultiplier(p.factor)}
                          className={`py-2 rounded-xl font-bold text-[11px] transition active:scale-95 min-h-[38px] ${
                            aiTextMultiplier === p.factor
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 border border-purple-200/70 hover:bg-purple-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Nutrients Summary Card */}
                  <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200 flex items-center justify-around text-center">
                    <div>
                      <span className="text-[10px] text-pink-600 font-bold block">พลังงานรวม</span>
                      <span className="text-base font-black text-pink-600">
                        {aiTextItems.reduce((sum, item) => sum + (item.kcal || 0), 0)} kcal
                      </span>
                    </div>
                    <div className="h-6 w-px bg-pink-200" />
                    <div>
                      <span className="text-[10px] text-sky-600 font-bold block">โปรตีน</span>
                      <span className="text-xs font-black text-sky-700">
                        {Math.round(aiTextItems.reduce((sum, item) => sum + (item.protein_g || 0), 0) * 10) / 10}g
                      </span>
                    </div>
                    <div className="h-6 w-px bg-pink-200" />
                    <div>
                      <span className="text-[10px] text-amber-600 font-bold block">คาร์บ</span>
                      <span className="text-xs font-black text-amber-700">
                        {Math.round(aiTextItems.reduce((sum, item) => sum + (item.carb_g || 0), 0) * 10) / 10}g
                      </span>
                    </div>
                    <div className="h-6 w-px bg-pink-200" />
                    <div>
                      <span className="text-[10px] text-rose-600 font-bold block">ไขมัน</span>
                      <span className="text-xs font-black text-rose-700">
                        {Math.round(aiTextItems.reduce((sum, item) => sum + (item.fat_g || 0), 0) * 10) / 10}g
                      </span>
                    </div>
                  </div>

                  {/* Editable Items */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      รายการอาหาร ({aiTextItems.length} รายการ - แก้ไขตัวเลขได้):
                    </span>
                    {aiTextItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-200/70 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateAiTextItem(idx, 'name', e.target.value)}
                            className="bg-white border border-purple-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 flex-1 min-h-[38px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteAiTextItem(idx)}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">กรัม (g)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.grams === 0 ? '' : item.grams}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'grams', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-purple-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-slate-700 min-h-[36px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-pink-600 font-bold block mb-0.5">พลังงาน (kcal)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.kcal === 0 ? '' : item.kcal}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'kcal', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-pink-200 rounded-lg px-1.5 py-1.5 text-center font-black text-pink-600 min-h-[36px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-sky-700 font-bold block mb-0.5">โปรตีน (g)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.protein_g === 0 ? '' : item.protein_g}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'protein_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-sky-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-sky-700 min-h-[36px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-700 font-bold block mb-0.5">คาร์บ (g)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.carb_g === 0 ? '' : item.carb_g}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'carb_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-amber-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-amber-700 min-h-[36px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-purple-100">
                          <div>
                            <span className="text-[10px] text-rose-600 font-bold block mb-0.5">ไขมัน (g)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.fat_g === 0 ? '' : item.fat_g}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'fat_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-rose-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-rose-600 min-h-[36px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-700 font-bold block mb-0.5">โซเดียม (mg)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.sodium_mg ?? ''}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'sodium_mg', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-slate-700 min-h-[36px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">ไฟเบอร์ (g)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={item.fiber_g ?? ''}
                              onChange={(e) =>
                                handleUpdateAiTextItem(idx, 'fiber_g', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-white border border-emerald-200 rounded-lg px-1.5 py-1.5 text-center font-bold text-emerald-700 min-h-[36px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reset / Search another query button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAiTextItems([]);
                        setBaseAiTextItems([]);
                        setAiTextAiNotes('');
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer min-h-[38px]"
                    >
                      <span>← พิมพ์ค้นหาใหม่อีกรอบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (When results are ready) */}
            {aiTextItems.length > 0 && (
              <div className="p-4 border-t border-purple-100 bg-purple-50/60 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirmAiTextFood}
                  disabled={isSubmittingAiText}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {isSubmittingAiText
                      ? 'กำลังบันทึก...'
                      : `บันทึกลงโปรไฟล์ของ ${aiTextUserId === 'partner' ? 'มะนาว' : 'แม็กนั่ม'} (${aiTextItems.length} รายการ)`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAiTextModal(false);
                    setAiTextItems([]);
                    setBaseAiTextItems([]);
                  }}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-purple-100 text-slate-600 border border-purple-200/70 text-xs font-bold transition min-h-[44px]"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry Modal (With Micronutrients) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[85vh] bg-white border-t sm:border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 shrink-0">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-700 text-base">
                  กรอกข้อมูลอาหาร ({activeTargetProfile.name})
                </h3>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 mt-4 text-xs overflow-y-auto pr-1 flex-1 overscroll-contain">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อกไก่ย่าง ข้าวกล้อง สลัดแซลมอน"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white min-h-[38px] text-base sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">มื้ออาหาร</label>
                  <select
                    value={manualMeal}
                    onChange={(e) => setManualMeal(e.target.value as MealType)}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-pink-300 font-bold min-h-[38px]"
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
                    inputMode="decimal"
                    value={manualGrams}
                    placeholder="200"
                    onChange={(e) => setManualGrams(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-600 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    required
                    value={manualKcal}
                    placeholder="350"
                    onChange={(e) => setManualKcal(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-pink-600 font-black focus:outline-none focus:border-pink-300 text-sm min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-700 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={manualProtein}
                    placeholder="25"
                    onChange={(e) => setManualProtein(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-sky-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-700 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={manualCarb}
                    placeholder="40"
                    onChange={(e) => setManualCarb(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-amber-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={manualFat}
                    placeholder="10"
                    onChange={(e) => setManualFat(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
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
                      inputMode="decimal"
                      value={manualSodium}
                      placeholder="0"
                      onChange={(e) => setManualSodium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualFiber}
                      placeholder="0"
                      onChange={(e) => setManualFiber(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualSugar}
                      placeholder="0"
                      onChange={(e) => setManualSugar(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Vit C (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualVitC}
                      placeholder="0"
                      onChange={(e) => setManualVitC(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">เหล็ก (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualIron}
                      placeholder="0"
                      onChange={(e) => setManualIron(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">แคลเซียม</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualCalcium}
                      placeholder="0"
                      onChange={(e) => setManualCalcium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">โพแทสเซียม</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={manualPotassium}
                      placeholder="0"
                      onChange={(e) => setManualPotassium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-lg px-1.5 py-1 text-center font-bold text-slate-700 text-xs min-h-[36px]"
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
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white min-h-[38px] text-base sm:text-xs"
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
                      className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-slate-600 border border-pink-200/60 cursor-pointer min-h-[30px] flex items-center"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/70 font-bold min-h-[44px]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-xs min-h-[44px] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[85vh] bg-white border-t sm:border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-pink-500" />
                <h3 className="font-bold text-slate-700 text-base">แก้ไขรายการอาหาร</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs overflow-y-auto pr-1 flex-1 overscroll-contain">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white font-bold min-h-[38px] text-base sm:text-xs"
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
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-pink-300 font-bold min-h-[38px]"
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
                    inputMode="decimal"
                    value={editForm.grams}
                    placeholder="200"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        grams: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-600 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    required
                    value={editForm.kcal}
                    placeholder="350"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        kcal: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-pink-600 font-black focus:outline-none focus:border-pink-300 text-sm min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-700 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editForm.protein_g}
                    placeholder="25"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        protein_g: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-sky-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-700 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editForm.carb_g}
                    placeholder="40"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        carb_g: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-amber-700 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editForm.fat_g}
                    placeholder="10"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fat_g: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-rose-600 font-bold focus:outline-none focus:border-pink-300 min-h-[38px]"
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
                      inputMode="decimal"
                      value={editForm.sodium_mg}
                      placeholder="0"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sodium_mg: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">ไฟเบอร์ (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editForm.fiber_g}
                      placeholder="0"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          fiber_g: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 mb-1">น้ำตาล (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editForm.sugar_g}
                      placeholder="0"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          sugar_g: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold min-h-[36px]"
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
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white min-h-[38px] text-base sm:text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-pink-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-slate-600 border border-pink-200/70 font-bold min-h-[44px]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-300 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-xs min-h-[44px] cursor-pointer"
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

      {/* Custom Water Intake Modal */}
      {showCustomWaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Droplets size={18} className="text-sky-500" />
                <h3 className="font-bold text-slate-800 text-base">บันทึกการดื่มน้ำ</h3>
              </div>
              <button
                onClick={() => setShowCustomWaterModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customWaterMl && customWaterMl > 0) {
                  handleAddWater(Number(customWaterMl));
                  setShowCustomWaterModal(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ระบุปริมาณน้ำที่ดื่ม (มิลลิลิตร / ml):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    step="10"
                    required
                    placeholder="เช่น 350, 600..."
                    value={customWaterMl}
                    onChange={(e) =>
                      setCustomWaterMl(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-2xl px-4 py-3 text-lg font-black text-sky-700 focus:outline-none focus:border-sky-400 focus:bg-white transition"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ml
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons inside modal */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[150, 250, 350, 500, 600, 750, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomWaterMl(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      customWaterMl === preset
                        ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                        : 'bg-sky-50/60 text-slate-600 border-sky-200/80 hover:bg-sky-100'
                    }`}
                  >
                    {preset} ml
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowCustomWaterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  บันทึกการดื่มน้ำ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Nutrition Targets & Limits Adjustment Modal (Bottom Sheet on mobile) */}
      {showAdjustNutritionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowAdjustNutritionModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-pink-200 shadow-2xl z-10 max-h-[92dvh] flex flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">ปรับเป้าหมาย & Limit สารอาหาร</h3>
                  <p className="text-xs text-pink-700 font-medium">สำหรับ {activeTargetProfile.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustNutritionModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-pink-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition border border-pink-200/60 cursor-pointer min-h-[36px]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveAdjustNutrition} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {/* Section 1: Macronutrients */}
              <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-200/70 space-y-2.5">
                <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-500" />
                  <span>พลังงาน & สารอาหารหลัก (Macronutrients)</span>
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <label className="block font-bold text-amber-800 mb-1">แคลอรี่เป้าหมายต่อวัน (kcal)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustKcal}
                      placeholder="2000"
                      onChange={(e) => setAdjustKcal(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-800 font-black text-sm focus:outline-none focus:border-amber-400 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-800 mb-1">โปรตีน (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustProtein}
                      placeholder="150"
                      onChange={(e) => setAdjustProtein(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-sky-400 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-800 mb-1">คาร์โบไฮเดรต (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustCarb}
                      placeholder="200"
                      onChange={(e) => setAdjustCarb(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-amber-400 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-rose-800 mb-1">ไขมัน (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustFat}
                      placeholder="60"
                      onChange={(e) => setAdjustFat(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-rose-400 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">ไฟเบอร์ / ใยอาหาร (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustFiber}
                      placeholder="25"
                      onChange={(e) => setAdjustFiber(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-400 min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Water Target */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200/70 space-y-2">
                <span className="font-black text-sky-900 text-xs flex items-center gap-1.5">
                  <Droplets size={14} className="text-sky-500" />
                  <span>เป้าหมายน้ำดื่ม (Daily Hydration)</span>
                </span>
                <div>
                  <label className="block font-bold text-sky-800 mb-1">ปริมาณน้ำดื่มต่อวัน (มิลลิลิตร - ml)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={adjustWater}
                    placeholder="2500"
                    onChange={(e) => setAdjustWater(e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-sky-400 min-h-[40px]"
                  />
                  <span className="text-[10px] text-sky-600 font-medium block mt-1">
                    แนะนำ: 2,000 - 3,000 ml ตามน้ำหนักตัวและกิจกรรม
                  </span>
                </div>
              </div>

              {/* Section 3: Limits (Sodium & Sugar) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
                <span className="font-black text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-500" />
                  <span>ขีดจำกัดสารอาหารที่ควรควบคุม (Limit ไม่ควรเกิน)</span>
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">🧂 โซเดียม Limit (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustSodium}
                      placeholder="2000"
                      onChange={(e) => setAdjustSodium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-amber-400 min-h-[40px]"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">มาตรฐาน: ไม่เกิน 2,000 mg</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">🍯 น้ำตาล Limit (g)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustSugar}
                      placeholder="24"
                      onChange={(e) => setAdjustSugar(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-amber-400 min-h-[40px]"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">มาตรฐาน: ไม่เกิน 24 g (6 ช้อนชา)</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Micronutrients (Thai DRI) */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Leaf size={14} className="text-emerald-500" />
                  <span>วิตามิน & แร่ธาตุเป้าหมาย (Micronutrients)</span>
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">🍊 วิตามินซี (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustVitC}
                      placeholder="100"
                      onChange={(e) => setAdjustVitC(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-pink-300 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">🥛 แคลเซียม (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustCalcium}
                      placeholder="1000"
                      onChange={(e) => setAdjustCalcium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-pink-300 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">🥩 ธาตุเหล็ก (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustIron}
                      placeholder="15"
                      onChange={(e) => setAdjustIron(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-pink-300 min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">🍌 โพแทสเซียม (mg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={adjustPotassium}
                      placeholder="3000"
                      onChange={(e) => setAdjustPotassium(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-pink-300 min-h-[38px]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-pink-100 shrink-0">
                <button
                  type="button"
                  onClick={handleResetAdjustNutrition}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition active:scale-95 text-xs min-h-[44px]"
                  title="รีเซ็ตเป็นค่ามาตรฐาน Thai DRI"
                >
                  🔄 ค่ามาตรฐาน
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjustNutritionModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-600 font-bold border border-pink-200/70 transition active:scale-95 min-h-[44px]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold shadow-xs active:scale-95 transition cursor-pointer min-h-[44px]"
                  >
                    💾 บันทึกเป้าหมาย
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
