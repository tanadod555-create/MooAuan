import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FoodLog, MealType } from '../types';
import {
  resizeImageToMaxDimension,
  analyzeFoodImage,
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
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';

export const FoodView: React.FC = () => {
  const { currentProfile, foodLogs, addFoodLog, deleteFoodLog, settings, updateSettings } = useApp();

  // Filter food logs for today
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = foodLogs.filter((l) => l.date === today);

  // Calculate daily totals
  const totalKcal = todayLogs.reduce((sum, l) => sum + (l.kcal || 0), 0);
  const totalProtein = todayLogs.reduce((sum, l) => sum + (l.protein_g || 0), 0);
  const totalCarb = todayLogs.reduce((sum, l) => sum + (l.carb_g || 0), 0);
  const totalFat = todayLogs.reduce((sum, l) => sum + (l.fat_g || 0), 0);

  // Targets from profile
  const targetKcal = currentProfile.kcal_target || 2000;
  const targetProtein = currentProfile.protein_target_g || 140;
  const targetCarb = currentProfile.carb_target_g || 240;
  const targetFat = currentProfile.fat_target_g || 60;

  // Image Upload & AI Analysis State
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    settings.geminiApiKey || localStorage.getItem('fittrack_gemini_key') || ''
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiResultItems, setAiResultItems] = useState<GeminiFoodItem[]>([]);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [showAiResultModal, setShowAiResultModal] = useState(false);

  // Manual Add Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualMeal, setManualMeal] = useState<MealType>('lunch');
  const [manualGrams, setManualGrams] = useState(200);
  const [manualKcal, setManualKcal] = useState(350);
  const [manualProtein, setManualProtein] = useState(25);
  const [manualCarb, setManualCarb] = useState(40);
  const [manualFat, setManualFat] = useState(10);

  // Handle file select & Gemini analysis
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // 1. Client-side resize
      const { base64, mimeType } = await resizeImageToMaxDimension(file, 1024, 0.85);
      setPreviewImage(`data:${mimeType};base64,${base64}`);

      // 2. Call Gemini
      const result = await analyzeFoodImage({
        base64Image: base64,
        mimeType: mimeType,
        apiKey: settings.geminiApiKey,
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
        date: today,
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

  // Handle Manual Add
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await addFoodLog({
      date: today,
      time: nowTime,
      meal: manualMeal,
      name: manualName.trim(),
      grams: manualGrams,
      kcal: manualKcal,
      protein_g: manualProtein,
      carb_g: manualCarb,
      fat_g: manualFat,
      source: 'manual',
      confidence: 1.0,
    });

    setShowManualModal(false);
    setManualName('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Daily Macro Tracker using 21st.dev MagicCard & CircularProgress */}
      <MagicCard spotlightColor="rgba(16, 185, 129, 0.12)" className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Animated Circular Progress Ring */}
          <div className="flex items-center gap-6">
            <CircularProgress
              value={totalKcal}
              max={targetKcal}
              size={130}
              strokeWidth={11}
              color={totalKcal > targetKcal ? '#f43f5e' : '#10b981'}
              bgColor="#1e293b"
              label={`${Math.round(totalKcal)}`}
              sublabel="kcal วันนี้"
            />
            <div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                โภชนาการวันนี้ ({today})
              </span>
              <h2 className="text-xl font-black text-white mt-1">เป้าหมายพลังงาน</h2>
              <p className="text-xs text-slate-400 mt-1">
                เป้าหมายรายวัน: <strong className="text-white">{targetKcal.toLocaleString()} kcal</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">คงเหลือ:</span>
                <span className="text-sm font-black text-emerald-300 font-mono">
                  {Math.max(0, targetKcal - totalKcal).toLocaleString()} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Right: Macro Pills Breakdown */}
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-2.5 w-full sm:w-48">
            {/* Protein */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-blue-400">โปรตีน</span>
                <span className="text-slate-300 font-bold">
                  <NumberTicker value={Math.round(totalProtein)} /> / {targetProtein}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-400">คาร์บ</span>
                <span className="text-slate-300 font-bold">
                  <NumberTicker value={Math.round(totalCarb)} /> / {targetCarb}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalCarb / targetCarb) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-rose-400">ไขมัน</span>
                <span className="text-slate-300 font-bold">
                  <NumberTicker value={Math.round(totalFat)} /> / {targetFat}g
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </MagicCard>

      {/* Gemini AI API Connection Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              settings.geminiApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className={settings.geminiApiKey ? 'text-emerald-400 font-bold' : 'text-amber-400 font-medium'}>
            {settings.geminiApiKey
              ? 'Gemini Multimodal AI: พร้อมใช้งาน (เชื่อมต่อ API สำเร็จ)'
              : 'ยังไม่ได้ระบุ Gemini API Key (จำเป็นสำหรับการสแกนรูป)'}
          </span>
        </div>
        <button
          onClick={() => {
            setApiKeyInput(settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '');
            setShowApiKeyModal(true);
          }}
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline"
        >
          {settings.geminiApiKey ? 'ตั้งค่า Key' : 'เชื่อมต่อ Key ด่วน'}
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
            if (!settings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
              setApiKeyInput(import.meta.env.VITE_GEMINI_API_KEY || '');
              setShowApiKeyModal(true);
              return;
            }
            cameraInputRef.current?.click();
          }}
          disabled={analyzing}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition group"
        >
          <Camera size={22} className="stroke-[2.5]" />
          <div className="text-left">
            <span className="text-sm block">ถ่ายรูปอาหาร</span>
            <span className="text-[10px] text-slate-950/80 font-semibold block">
              เปิดกล้องถ่ายสด → AI วิเคราะห์ทันที
            </span>
          </div>
        </button>

        {/* Choose from Gallery / Files */}
        <button
          onClick={() => {
            if (!settings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
              setApiKeyInput(import.meta.env.VITE_GEMINI_API_KEY || '');
              setShowApiKeyModal(true);
              return;
            }
            galleryInputRef.current?.click();
          }}
          disabled={analyzing}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
            <Upload size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm block">อัปโหลดจากอัลบั้ม</span>
            <span className="text-[10px] text-slate-400 font-normal block">
              เลือกรูปจากคลังภาพ / ไฟล์
            </span>
          </div>
        </button>

        {/* Manual Add Button */}
        <button
          onClick={() => setShowManualModal(true)}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
            <Plus size={18} />
          </div>
          <div className="text-left">
            <span className="text-sm block">กรอกรายการเอง</span>
            <span className="text-[10px] text-slate-400 font-normal block">
              พิมพ์แคลอรี่และสารอาหารด้วยตนเอง
            </span>
          </div>
        </button>
      </div>


      {/* Analyzing Indicator */}
      {analyzing && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-spin">
            <Sparkles size={24} />
          </div>
          <h4 className="text-sm font-bold text-white">กำลังวิเคราะห์อาหารด้วย Gemini Multimodal...</h4>
          <p className="text-xs text-slate-400">
            ย่อขนาดภาพและประเมินขนาดจาน ส่วนประกอบ แคลอรี่ และโภชนาการ
          </p>
        </div>
      )}

      {/* Error alert */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold block">เกิดข้อผิดพลาด:</span>
            <span>{analysisError}</span>
          </div>
        </div>
      )}

      {/* Today's Meals Grouped by Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-emerald-400" />
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
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
            >
              <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 capitalize">
                  {mealTitleTh}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {mealKcal} kcal
                </span>
              </div>

              {mealLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">ยังไม่มีรายการในมื้อนี้</div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {mealLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{log.name}</span>
                          {log.source === 'ai' && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium flex items-center gap-0.5">
                              <Sparkles size={10} /> AI ({Math.round((log.confidence || 0.8) * 100)}%)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {log.time} · {log.grams}g · P: {log.protein_g}g | C: {log.carb_g}g | F: {log.fat_g}g
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {log.kcal} kcal
                        </span>
                        <button
                          onClick={() => deleteFoodLog(log.log_id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={15} />
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

      {/* AI Analysis Confirmation Modal (Fully Editable before saving!) */}
      {showAiResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">ผลการวิเคราะห์จากภาพ (ตรวจสอบ & แก้ไข)</h3>
              </div>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Preview image if available */}
              {previewImage && (
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meal Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เลือกมื้ออาหาร:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition ${
                        selectedMeal === meal
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Items */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">
                  รายการอาหารที่ตรวจพบ (แก้ไขตัวเลขได้):
                </span>
                {aiResultItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateAiItem(idx, 'name', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-bold text-white w-2/3"
                      />
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                        ความแม่นยำ {Math.round((item.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">ปริมาณ (g)</span>
                        <input
                          type="number"
                          value={item.grams}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'grams', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-bold text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 block mb-0.5">พลังงาน (kcal)</span>
                        <input
                          type="number"
                          value={item.kcal}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'kcal', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-bold text-amber-300"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-400 block mb-0.5">โปรตีน (g)</span>
                        <input
                          type="number"
                          value={item.protein_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'protein_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-bold text-blue-300"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 block mb-0.5">ไขมัน (g)</span>
                        <input
                          type="number"
                          value={item.fat_g}
                          onChange={(e) =>
                            handleUpdateAiItem(idx, 'fat_g', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-bold text-rose-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {aiNotes && (
                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  💡 หมายเหตุจาก AI: {aiNotes}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
              <button
                onClick={handleConfirmAiFood}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                <CheckCircle2 size={18} />
                ยืนยันและบันทึกลง Sheet
              </button>
              <button
                onClick={() => setShowAiResultModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">กรอกข้อมูลอาหาร</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ชื่ออาหาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อกไก่ย่าง ข้าวกล้อง"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">มื้ออาหาร</label>
                  <select
                    value={manualMeal}
                    onChange={(e) => setManualMeal(e.target.value as MealType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">ปริมาณ (กรัม)</label>
                  <input
                    type="number"
                    value={manualGrams}
                    onChange={(e) => setManualGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-400 mb-1">พลังงาน (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={manualKcal}
                    onChange={(e) => setManualKcal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-400 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-300 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    value={manualCarb}
                    onChange={(e) => setManualCarb(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-rose-400 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  บันทึกอาหาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini API Key Config Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ตั้งค่า Gemini API Key</h3>
                  <p className="text-xs text-slate-400">สำหรับวิเคราะห์อาหารจากภาพ</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gemini API Key ของคุณ:
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="วาง API Key ที่นี่..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-300 font-semibold">💡 วิธีการเชื่อมต่อ:</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  นำ Gemini API Key จาก Google AI Studio มาวางในช่องด้านบน แล้วกด "บันทึกและเชื่อมต่อ" กุญแจจะถูกบันทึกในอุปกรณ์ของคุณอย่างปลอดภัย
                </p>
                {import.meta.env.VITE_GEMINI_API_KEY && (
                  <button
                    type="button"
                    onClick={() => setApiKeyInput(import.meta.env.VITE_GEMINI_API_KEY || '')}
                    className="text-emerald-400 hover:underline text-left font-mono block mt-1"
                  >
                    คลิกเพื่อนำเข้าคีย์จากไฟล์ระบบ (.env)
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
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
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition"
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
