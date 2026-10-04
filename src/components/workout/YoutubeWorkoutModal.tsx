import React, { useState } from 'react';
import {
  YoutubeWorkoutAnalysis,
  analyzeYoutubeWorkoutVideo,
  extractYouTubeId,
  getDefaultGeminiApiKey,
} from '../../services/gemini';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Play,
  CheckCircle2,
  Flame,
  Clock,
  ExternalLink,
  RotateCcw,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  Award,
  Zap,
  Activity,
  ChevronRight,
  Heart,
  Save,
} from 'lucide-react';
import { getUserAvatar } from '../../utils/mascotLevels';

interface YoutubeWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLiveSession: (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => void;
  onSaveFinishedSession: (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => Promise<void>;
  selectedUserKey?: 'primary' | 'partner';
}

const PRESET_CLIPS = [
  {
    label: '🌸 พิลาทิสปั้นร่อง 11 (15 นาที)',
    url: 'https://www.youtube.com/watch?v=2pLT-ulgUGo',
    note: 'เน้นเกร็งหน้าท้อง ร่อง 11 เอวคอด',
  },
  {
    label: '🔥 Dance Cardio เบิร์นไว (20 นาที)',
    url: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8',
    note: 'เต้นตามเพลงสนุกๆ คาร์ดิโอเบิร์นไขมัน',
  },
  {
    label: '🍑 ปั้นก้นกลมเด้ง & ต้นขา (15 นาที)',
    url: 'https://www.youtube.com/watch?v=i1ZzdBgPBZg',
    note: 'เน้นบั้นท้ายและสะโพก ไม่ปวดเข่า',
  },
  {
    label: '🧘 ยืดเหยียดผ่อนคลาย & แก้ออฟฟิศซินโดรม',
    url: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
    note: 'ยืดเหยียดคลายกล้ามเนื้อทั่วร่าง',
  },
];

export const YoutubeWorkoutModal: React.FC<YoutubeWorkoutModalProps> = ({
  isOpen,
  onClose,
  onStartLiveSession,
  onSaveFinishedSession,
  selectedUserKey = 'partner',
}) => {
  const { primaryProfile, partnerProfile, settings } = useApp();
  const currentProfile = selectedUserKey === 'partner' ? partnerProfile : primaryProfile;
  const isMaxnum = selectedUserKey === 'primary';

  const [inputUrl, setInputUrl] = useState('');
  const [userNote, setUserNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [analyzedData, setAnalyzedData] = useState<{
    analysis: YoutubeWorkoutAnalysis;
    youtubeId: string | null;
    originalUrl: string;
  } | null>(null);

  // Editable fields after analysis
  const [customDuration, setCustomDuration] = useState<number>(20);
  const [customCalories, setCustomCalories] = useState<number>(150);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    if (!inputUrl.trim()) {
      setAnalysisError('กรุณาแปะลิงก์ YouTube หรือพิมพ์ชื่อคลิปที่ต้องการออกกำลังกาย');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeYoutubeWorkoutVideo(
        {
          urlOrText: inputUrl.trim(),
          userNote: userNote.trim() || undefined,
          userName: currentProfile.name,
          userGoal: currentProfile.goal,
        },
        settings.geminiApiKey || getDefaultGeminiApiKey()
      );

      setAnalyzedData({
        analysis: result.analysis,
        youtubeId: result.youtubeId,
        originalUrl: inputUrl.trim(),
      });

      setCustomDuration(result.analysis.estimatedDurationMinutes || 20);
      setCustomCalories(result.analysis.estimatedCalories || 150);
      setCustomTitle(result.analysis.title || 'ออกกำลังกายตามคลิป YouTube');
    } catch (err: any) {
      console.error('YouTube analysis error:', err);
      setAnalysisError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์คลิป กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_CLIPS[0]) => {
    setInputUrl(preset.url);
    setUserNote(preset.note);
    setAnalysisError(null);
  };

  const handleReset = () => {
    setAnalyzedData(null);
    setAnalysisError(null);
  };

  const handleTriggerLiveSession = () => {
    if (!analyzedData) return;
    const finalData = {
      title: customTitle || analyzedData.analysis.title,
      youtubeId: analyzedData.youtubeId,
      youtubeUrl: analyzedData.originalUrl,
      durationMinutes: customDuration,
      caloriesKcal: customCalories,
      targetMuscles: analyzedData.analysis.targetMuscles || [],
      benefits: analyzedData.analysis.benefits || [],
      note: [
        `คลิป: ${analyzedData.analysis.title}`,
        analyzedData.analysis.category ? `ประเภท: ${analyzedData.analysis.category}` : null,
        userNote ? `โน้ต: ${userNote}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
    };

    onStartLiveSession(finalData);
    onClose();
  };

  const handleTriggerSaveFinished = async () => {
    if (!analyzedData || isSaving) return;
    setIsSaving(true);

    const finalData = {
      title: customTitle || analyzedData.analysis.title,
      youtubeId: analyzedData.youtubeId,
      youtubeUrl: analyzedData.originalUrl,
      durationMinutes: customDuration,
      caloriesKcal: customCalories,
      targetMuscles: analyzedData.analysis.targetMuscles || [],
      benefits: analyzedData.analysis.benefits || [],
      note: [
        `คลิป: ${analyzedData.analysis.title}`,
        analyzedData.analysis.category ? `ประเภท: ${analyzedData.analysis.category}` : null,
        userNote ? `โน้ต: ${userNote}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
    };

    // Close modal and fire callback immediately without hanging
    try {
      // Fire and handle safely
      const savePromise = onSaveFinishedSession(finalData);
      // Wait at most 300ms so UI updates smoothly, then close modal
      await Promise.race([
        savePromise,
        new Promise((resolve) => setTimeout(resolve, 250)),
      ]);
    } catch (err) {
      console.error('Save session error:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88vh] bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 animate-slideUp">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-xs shrink-0 font-black text-lg">
              ▶
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                  ออกกำลังกายตามคลิป YouTube
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/20 text-white font-bold backdrop-blur-xs">
                  AI Workout Coach
                </span>
              </div>
              <p className="text-[11px] text-white/90">
                สำหรับ {currentProfile.name} • วิเคราะห์ประโยชน์ & บันทึกเซสชันอัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {!analyzedData ? (
            /* STEP 1: Input URL / Search + Presets */
            <div className="space-y-4">
              {/* Profile Greeting Tag */}
              <div className="p-3 rounded-2xl bg-pink-50/80 border border-pink-200/80 flex items-center gap-3">
                <img
                  src={getUserAvatar(selectedUserKey)}
                  alt={currentProfile.name}
                  className="w-10 h-10 rounded-xl object-cover border border-pink-300 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700">
                    {selectedUserKey === 'partner' ? 'น้องมะนาวชอบเต้น & เล่นพิลาทิส 🌸' : 'ออกกำลังกายตามคลิป 🏋️‍♂️'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    แปะลิงก์คลิปจาก YouTube หรือพิมพ์ชื่อคลิป/ท่า แล้วให้ AI สรุปสิ่งที่ได้และเตรียมเซสชันให้ทันที!
                  </p>
                </div>
              </div>

              {/* YouTube URL / Search Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  🔗 ลิงก์คลิป YouTube หรือชื่อคลิป:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://youtu.be/... หรือ Chloe Ting 15 mins abs..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:bg-white transition"
                  />
                  {inputUrl && (
                    <button
                      type="button"
                      onClick={() => setInputUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Optional User Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  📝 โน้ตเพิ่มเติม (ถ้ามี):
                </label>
                <input
                  type="text"
                  placeholder="เช่น เน้นกระชับร่อง 11, วันนี้แรงเยอะ, ปรับเป็นไม่กระโดด..."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-300 focus:bg-white transition"
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  ✨ คลิปตัวอย่างยอดฮิต (แตะเพื่อลอง):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PRESET_CLIPS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-2xl text-left border transition active:scale-95 cursor-pointer text-xs font-semibold ${
                        inputUrl === p.url
                          ? 'bg-red-50 border-red-300 text-red-700 shadow-xs'
                          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{p.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{p.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {analysisError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 text-rose-500" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Action Button: Analyze */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing || !inputUrl.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-red-200/50 transition active:scale-98 cursor-pointer min-h-[48px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>AI กำลังดูคลิปและวิเคราะห์สิ่งที่ได้... ⚡</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>วิเคราะห์คลิปด้วย AI ⚡ (ดูสิ่งที่ได้ & แคลอรี่)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Analysis Results View & Session Actions */
            <div className="space-y-4 animate-fadeIn">
              {/* Back / Re-analyze Button */}
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>เปลี่ยนคลิป / วิเคราะห์ใหม่</span>
                </button>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ✓ วิเคราะห์สำเร็จโดย Gemini AI
                </span>
              </div>

              {/* Embedded YouTube Player */}
              {analyzedData.youtubeId && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video w-full shadow-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${analyzedData.youtubeId}?enablejsapi=1&rel=0`}
                    title={analyzedData.analysis.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {/* Video Title & Category Header */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                    📺 {analyzedData.analysis.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ระดับ: {analyzedData.analysis.intensity}
                  </span>
                  {analyzedData.analysis.channelName && (
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      โดย {analyzedData.analysis.channelName}
                    </span>
                  )}
                </div>

                {/* Editable Title */}
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full font-black text-sm sm:text-base text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-red-400 pb-0.5"
                  placeholder="ชื่อคลิปหรือชื่อเซสชัน"
                />
              </div>

              {/* Quick Steppers: Duration & Calories */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Duration Stepper */}
                <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-sky-800 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      ระยะเวลา
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCustomDuration((prev) => Math.max(5, prev - 5))}
                        className="w-5 h-5 rounded-md bg-white border border-sky-300 text-sky-700 flex items-center justify-center font-bold text-xs active:scale-90"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDuration((prev) => prev + 5)}
                        className="w-5 h-5 rounded-md bg-white border border-sky-300 text-sky-700 flex items-center justify-center font-bold text-xs active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-black text-sky-950">
                    {customDuration} <span className="text-xs font-normal text-sky-700">นาที</span>
                  </div>
                </div>

                {/* Calories Stepper */}
                <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-orange-800 font-bold">
                    <span className="flex items-center gap-1">
                      <Flame size={13} />
                      เผาผลาญประมาณ
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCustomCalories((prev) => Math.max(20, prev - 20))}
                        className="w-5 h-5 rounded-md bg-white border border-orange-300 text-orange-700 flex items-center justify-center font-bold text-xs active:scale-90"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCalories((prev) => prev + 20)}
                        className="w-5 h-5 rounded-md bg-white border border-orange-300 text-orange-700 flex items-center justify-center font-bold text-xs active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-black text-orange-950">
                    {customCalories} <span className="text-xs font-normal text-orange-700">kcal</span>
                  </div>
                </div>
              </div>

              {/* 🌟 KEY BENEFITS: สิ่งที่ได้จากคลิปนี้ */}
              {analyzedData.analysis.benefits && analyzedData.analysis.benefits.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Award size={15} className="text-emerald-600" />
                    <span>สิ่งที่ได้จากการออกกำลังกายคลิปนี้ (Benefits):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {analyzedData.analysis.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/90 border border-emerald-100 flex items-start gap-1.5 text-xs text-emerald-950"
                      >
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-semibold leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🎯 Target Muscles */}
              {analyzedData.analysis.targetMuscles && analyzedData.analysis.targetMuscles.length > 0 && (
                <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/70 space-y-1.5">
                  <div className="text-xs font-bold text-pink-950 flex items-center gap-1.5">
                    <Activity size={14} className="text-pink-500" />
                    <span>กล้ามเนื้อและสัดส่วนที่เน้นโฟกัส:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {analyzedData.analysis.targetMuscles.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-pink-700 border border-pink-200 shadow-2xs"
                      >
                        ✨ {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 💡 Coaching Cues & Tips */}
              {analyzedData.analysis.coachingTips && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>คำแนะนำโฟกัสจากโค้ช AI:</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {analyzedData.analysis.coachingTips}
                  </p>
                </div>
              )}

              {/* Action Buttons: Live Session vs Quick Save */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Start Live Session in App */}
                <button
                  type="button"
                  onClick={handleTriggerLiveSession}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-200/50 transition active:scale-98 cursor-pointer min-h-[46px]"
                >
                  <Play size={16} fill="currentColor" />
                  <span>เริ่มซ้อมตามคลิปสดๆ (Live)</span>
                </button>

                {/* 2. Quick Log Finished Session */}
                <button
                  type="button"
                  onClick={handleTriggerSaveFinished}
                  disabled={isSaving}
                  className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-emerald-400 text-emerald-700 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer min-h-[46px]"
                >
                  <Save size={16} />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกว่าเล่นเสร็จแล้วทันที'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
