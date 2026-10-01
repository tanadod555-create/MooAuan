import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PigMascot } from '../components/ui/PigMascot';
import { chatWithTrainer } from '../services/gemini';
import {
  calculatePigEvolution,
  getMascotScene,
  getUserAvatar,
  PigEvolutionLevel,
  PIG_10_LEVELS,
} from '../utils/mascotLevels';
import {
  Trophy,
  Flame,
  Dumbbell,
  Sparkles,
  MessageCircle,
  Volume2,
  RefreshCw,
  TrendingUp,
  Award,
  Zap,
  Swords,
  ChevronRight,
  Sliders,
  AlertTriangle,
  Crown,
  Heart,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { MascotSceneStage } from '../components/mascot/MascotSceneStage';

export const MascotBattleView: React.FC = () => {
  const {
    allWorkoutHistory,
    allFoodLogs,
    activeWorkout,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
    settings,
  } = useApp();

  // Simulation override state (Level 1..10)
  const [overrideMagnumLevel, setOverrideMagnumLevel] = useState<PigEvolutionLevel | null>(null);
  const [overrideManowLevel, setOverrideManowLevel] = useState<PigEvolutionLevel | null>(null);
  const [showSimControls, setShowSimControls] = useState(false);

  // Magnum Stats & Evolution
  const magnumHistory = allWorkoutHistory.filter(
    (s) => (s.user_id || 'primary') === 'primary'
  );
  const magnumEvolution = calculatePigEvolution(
    magnumHistory,
    activeWorkout !== null && activeProfileKey === 'primary'
  );

  // Manow Stats & Evolution
  const manowHistory = allWorkoutHistory.filter((s) => s.user_id === 'partner');
  const manowEvolution = calculatePigEvolution(
    manowHistory,
    activeWorkout !== null && activeProfileKey === 'partner'
  );

  const magnumLevel = overrideMagnumLevel ?? magnumEvolution.level;
  const manowLevel = overrideManowLevel ?? manowEvolution.level;

  const magnumConfig = PIG_10_LEVELS[magnumLevel];
  const manowConfig = PIG_10_LEVELS[manowLevel];

  // 4 Background Scene Conditions
  const today = new Date().toISOString().split('T')[0];
  const todayFoodCount = (allFoodLogs || []).filter((l) => l.date === today).length;
  const sceneInfo = getMascotScene(activeWorkout !== null, todayFoodCount);

  // Speech bubble states
  const [magnumSpeech, setMagnumSpeech] = useState<string>(
    'ฮึบๆ! วันนี้ใครจะซ้อมหนักกว่ากัน มาลุยกันเลย! 🏋️‍♂️'
  );
  const [manowSpeech, setManowSpeech] = useState<string>(
    'สู้ไม่ถอยอยู่แล้ว! วันนี้จะปั้นหุ่นให้แซงหน้าเลยคอยดู 🌸🐽'
  );
  const [isBanterLoading, setIsBanterLoading] = useState(false);

  // Winner calculation
  const leader =
    magnumEvolution.recentWeekCount > manowEvolution.recentWeekCount
      ? 'magnum'
      : manowEvolution.recentWeekCount > magnumEvolution.recentWeekCount
      ? 'manow'
      : 'tie';

  // Interactive dynamic dialogues on tap
  const handleTapMagnumPig = () => {
    if (magnumLevel > manowLevel) {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "อาทิตย์นี้เค้าซ้อมไป ${magnumEvolution.recentWeekCount} ครั้งแล้วนะ! มะนาวอ้วนแล้วไม่ไปยิมเลย อู๊ดๆ รีบตามมาไวๆ นะ 🐷💨"`
      );
      setManowSpeech(
        `หมูมะนาว: "แงงงง! กำลังสะสมแรงอยู่ต่างหากล่ะ! เดี๋ยวพรุ่งนี้จะจัดหนักให้ดูเลยคอยดู! 😤🐽"`
      );
    } else if (magnumLevel < manowLevel) {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ฮึ่ม! มะนาวแอบฟิตแซงไป ${manowEvolution.recentWeekCount} เซสชันแล้ว วันนี้ต้องรีบไปยกเวทปั๊มกล้ามตามให้ทันแล้ว! 💪🔥"`
      );
      setManowSpeech(
        `หมูมะนาว: "ฮิๆ ตามมาให้ทันน้าาา หมูฟิตตัวจริงอยู่นี่แล้วจ้าา 🌸✨"`
      );
    } else {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ตอนนี้เราเสมออยู่ที่ ${magnumEvolution.recentWeekCount} เซสชัน! วันนี้ใครจะเปิดเซสชันก่อนกัน? 🏋️‍♂️"`
      );
      setManowSpeech(
        `หมูมะนาว: "พร้อมเสมอจ้าาา วันนี้จัดเต็มแน่นอน ลุยไปด้วยกันนะหมูอ้วน 🐽"`
      );
    }
  };

  const handleTapManowPig = () => {
    if (manowLevel > magnumLevel) {
      setManowSpeech(
        `หมูมะนาว: "หมูแม็กนั่มอย่ามัวแต่นอนอืดน้าาา! เค้าฟิตไป ${manowEvolution.recentWeekCount} วันแล้ว เอวเอสก้นเด้งแล้วเนี่ย 🌸💅"`
      );
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ยอมไม่ได้แล้ว! เดี๋ยวเย็นนี้ไปปั๊มอกกับไหล่ให้แน่นเปรี๊ยะเลย! 🏋️‍♂️🔥"`
      );
    } else if (manowLevel < magnumLevel) {
      setManowSpeech(
        `หมูมะนาว: "งือออ วันนี้ขี้เกียจนิดหน่อยยย แต่เห็นหมูแม็กนั่มซิกแพกเริ่มมาแล้ว ยอมไม่ได้ พรุ่งนี้ไปยิมแน่! 🐽💨"`
      );
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ไปยิมด้วยกันนะหมูอ้วน เดี๋ยวเป็นเทรนเนอร์ช่วยเซฟให้เอง! 💪"`
      );
    } else {
      setManowSpeech(
        `หมูมะนาว: "หมูคู่หูฟิตไปด้วยกัน! อาทิตย์นี้ ${manowEvolution.recentWeekCount} เซสชันเท่ากันเป๊ะ แข่งกันแบบน่ารักๆ 🌸🐽"`
      );
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ใช่เลย! หมูอ้วนอย่างเราสองคนก็ฟิตแอนด์เฟิร์มได้ 🏋️‍♂️✨"`
      );
    }
  };

  // Generate live AI banter using Gemini
  const handleGenerateLiveBanter = async () => {
    setIsBanterLoading(true);
    try {
      const prompt = `
คุณเป็นกรรมการและผู้พากย์เสียงเกมหมูอ้วนฟิตเนสสุดน่ารักและกวนๆ ระหว่างคู่รัก 2 คน:
1. แม็กนั่ม (Magnum - ผู้ชาย): ซ้อมสัปดาห์นี้ ${magnumEvolution.recentWeekCount} ครั้ง, ซ้อมทั้งหมด ${magnumEvolution.totalCount} ครั้ง, เลเวลปัจจุบัน Lv.${magnumLevel} (${magnumConfig.titleTh}), สตรีค ${magnumEvolution.streakWeeks} สัปดาห์
2. มะนาว (Manow - ผู้หญิง): ซ้อมสัปดาห์นี้ ${manowEvolution.recentWeekCount} ครั้ง, ซ้อมทั้งหมด ${manowEvolution.totalCount} ครั้ง, เลเวลปัจจุบัน Lv.${manowLevel} (${manowConfig.titleTh}), สตรีค ${manowEvolution.streakWeeks} สัปดาห์

กรุณาสร้างบทสนทนาบลัฟกันแบบน่ารักๆ สั้นๆ 2 ประโยค:
- ประโยคแรกของแม็กนั่ม
- ประโยคที่สองของมะนาวตอบกลับ
(เน้นขิงกันเรื่องไปยิม ยกเวท หุ่นซิกแพก ก้นเด้ง และการกินอาหารคลีนหรือแอบกินขนม)
ตอบกลับในรูปแบบ JSON: {"magnum": "...", "manow": "..."}
`;
      const response = await chatWithTrainer({
        userMessage: prompt,
        apiKey: settings.geminiApiKey,
        context: {
          userName: 'แม็กนั่ม & มะนาว',
          goal: 'Fitness & Hypertrophy',
          kcalTarget: 2400,
          proteinTarget: 150,
          todayKcal: 0,
          todayProtein: 0,
          todayCarb: 0,
          todayFat: 0,
          todayFiber: 0,
          todayMeals: [],
          todayWorkouts: [],
        },
      });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.magnum) setMagnumSpeech(`หมูแม็กนั่ม: "${parsed.magnum}"`);
        if (parsed.manow) setManowSpeech(`หมูมะนาว: "${parsed.manow}"`);
      } else {
        setMagnumSpeech('หมูแม็กนั่ม: "ฟิตทุกวันไม่มีแผ่วแน่นอน! 🔥"');
        setManowSpeech('หมูมะนาว: "เดี๋ยวก็รู้ว่าใครจะกล้ามสวยกว่ากัน! 🌸"');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBanterLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. Main Stage Card: 4-Condition Background Scene with Real-time Animation */}
      <MascotSceneStage
        overrideLevel={{
          magnum: overrideMagnumLevel ?? undefined,
          manow: overrideManowLevel ?? undefined,
        }}
      />

      {/* 2. Versus Header Bar & AI Banter Generator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/95 rounded-3xl border border-pink-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-xs">
            <Swords size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
              สนามประลองหมูอ้วน 10 เลเวล ⚔️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              สตรีคต่อเนื่องยิ่งสูง เลเวลยิ่งอัป! ไม่ซ้อมเกิน 7 วัน เลเวลจะลดลง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleGenerateLiveBanter}
            disabled={isBanterLoading}
            className="btn-candy-yellow px-3.5 py-2 text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            title="ให้ AI หมูอ้วนสร้างบทสนทนาบลัฟกันสดๆ"
          >
            <RefreshCw
              size={13}
              className={isBanterLoading ? 'animate-spin text-amber-600' : 'text-amber-600'}
            />
            <span>{isBanterLoading ? 'กำลังคิดมุก...' : 'ให้ AI บลัฟกัน 💬'}</span>
          </button>

          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className={`px-3 py-2 text-xs font-bold rounded-2xl border transition flex items-center gap-1.5 ${
              showSimControls
                ? 'bg-pink-100 text-pink-700 border-pink-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="เปิดตัวทดลองปรับเลเวล 1..10"
          >
            <Sliders size={14} />
            <span>ลองปรับ Lv. 1-10</span>
          </button>
        </div>
      </div>

      {/* 3. Level 1..10 Simulation Controls (Optional Panel) */}
      {showSimControls && (
        <div className="p-5 bg-gradient-to-r from-pink-50/90 via-purple-50/80 to-sky-50/90 rounded-3xl border-2 border-dashed border-pink-300 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" />
              <h4 className="text-xs sm:text-sm font-black text-slate-800">
                🎛️ จำลองการเติบโต 10 เลเวล (Evolution Simulator)
              </h4>
            </div>
            <button
              onClick={() => {
                setOverrideMagnumLevel(null);
                setOverrideManowLevel(null);
              }}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              รีเซ็ตตามจริง
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Magnum Simulator Slider */}
            <div className="p-3.5 bg-white/90 rounded-2xl border border-sky-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                <span className="flex items-center gap-1.5">
                  <img src={getUserAvatar('male')} className="w-5 h-5 rounded-full" />
                  แม็กนั่ม: Lv.{magnumLevel} ({magnumConfig.titleTh})
                </span>
                <span className="font-mono text-sky-600">{magnumConfig.bodyFatLabel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={magnumLevel}
                onChange={(e) =>
                  setOverrideMagnumLevel(Number(e.target.value) as PigEvolutionLevel)
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Lv.1 (Chonky)</span>
                <span>Lv.5 (Fit)</span>
                <span>Lv.10 (Chad God)</span>
              </div>
            </div>

            {/* Manow Simulator Slider */}
            <div className="p-3.5 bg-white/90 rounded-2xl border border-pink-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-pink-800">
                <span className="flex items-center gap-1.5">
                  <img src={getUserAvatar('female')} className="w-5 h-5 rounded-full" />
                  มะนาว: Lv.{manowLevel} ({manowConfig.titleTh})
                </span>
                <span className="font-mono text-pink-600">{manowConfig.bodyFatLabel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={manowLevel}
                onChange={(e) =>
                  setOverrideManowLevel(Number(e.target.value) as PigEvolutionLevel)
                }
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Lv.1 (Chonky)</span>
                <span>Lv.5 (Fit)</span>
                <span>Lv.10 (Chad God)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Side-by-Side Character Battle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CHARACTER 1: MAGNUM (MALE) */}
        <div
          onClick={handleTapMagnumPig}
          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 bg-white/95 shadow-md cursor-pointer hover:scale-[1.01] ${
            magnumConfig.borderGlow
          }`}
        >
          {/* Winner Crown Tag */}
          {leader === 'magnum' && (
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 animate-bounce">
              <Crown size={13} />
              <span>ผู้นำสัปดาห์นี้! 🔥</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-300 shadow-sm shrink-0 bg-sky-50">
              <img
                src={getUserAvatar('male')}
                alt="Magnum"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-800 truncate">
                  {primaryProfile.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Gym Hero
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                เป้าหมาย: สร้างกล้ามเนื้อ & ความแข็งแกร่ง
              </p>
            </div>
          </div>

          {/* Animated Mascot Preview */}
          <div className="relative h-44 rounded-2xl bg-gradient-to-b from-sky-50/80 to-blue-50/40 border border-sky-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
            <PigMascot level={magnumLevel} gender="male" size="xl" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-sky-200 text-[10px] font-black text-sky-700 font-mono">
              Lv.{magnumLevel} / 10
            </div>
          </div>

          {/* Evolution Title & Body Fat */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{magnumConfig.emoji}</span>
                <span>{magnumConfig.titleTh}</span>
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${magnumConfig.badgeColor}`}>
                {magnumConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {magnumConfig.description}
            </p>
          </div>

          {/* Streak & Sessions Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-sky-700">
                {magnumEvolution.recentWeekCount} วัน
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สตรีค</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-0.5">
                <Flame size={12} /> {magnumEvolution.streakWeeks} วีค
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {magnumEvolution.totalCount} รอบ
              </span>
            </div>
          </div>

          {/* Inactivity Warning */}
          {magnumEvolution.decayWarningMsg && (
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {magnumEvolution.decayWarningMsg}
            </p>
          )}
        </div>

        {/* CHARACTER 2: MANOW (FEMALE) */}
        <div
          onClick={handleTapManowPig}
          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 bg-white/95 shadow-md cursor-pointer hover:scale-[1.01] ${
            manowConfig.borderGlow
          }`}
        >
          {/* Winner Crown Tag */}
          {leader === 'manow' && (
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-pink-400 to-rose-300 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-pink-200 animate-bounce">
              <Crown size={13} />
              <span>ผู้นำสัปดาห์นี้! 🌸</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-sm shrink-0 bg-pink-50">
              <img
                src={getUserAvatar('female')}
                alt="Manow"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-800 truncate">
                  {partnerProfile.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Cozy Fit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                เป้าหมาย: หุ่นกระชับ & ปั้นก้นกลม
              </p>
            </div>
          </div>

          {/* Animated Mascot Preview */}
          <div className="relative h-44 rounded-2xl bg-gradient-to-b from-pink-50/80 to-rose-50/40 border border-pink-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
            <PigMascot level={manowLevel} gender="female" size="xl" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-200 text-[10px] font-black text-pink-700 font-mono">
              Lv.{manowLevel} / 10
            </div>
          </div>

          {/* Evolution Title & Body Fat */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{manowConfig.emoji}</span>
                <span>{manowConfig.titleTh}</span>
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${manowConfig.badgeColor}`}>
                {manowConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {manowConfig.description}
            </p>
          </div>

          {/* Streak & Sessions Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-pink-700">
                {manowEvolution.recentWeekCount} วัน
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สตรีค</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-0.5">
                <Flame size={12} /> {manowEvolution.streakWeeks} วีค
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {manowEvolution.totalCount} รอบ
              </span>
            </div>
          </div>

          {/* Inactivity Warning */}
          {manowEvolution.decayWarningMsg && (
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {manowEvolution.decayWarningMsg}
            </p>
          )}
        </div>
      </div>

      {/* 5. 10 Levels Roadmap Progression Guide */}
      <div className="p-6 bg-white/95 rounded-3xl border border-pink-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          <h3 className="font-extrabold text-base text-slate-800">
            เส้นทางวิวัฒนาการหมูอ้วน 10 ระดับ (10 Levels Roadmap) 🗺️
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          เลเวลคำนวณจาก **ความต่อเนื่อง (Streak)** และ **จำนวนเซสชันในรอบ 7-30 วัน**
          หากขาดซ้อมเกิน 7 วัน เลเวลจะค่อยๆ ลดลงตามธรรมชาติเพื่อสะท้อนความฟิตจริงของร่างกายครับ!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as PigEvolutionLevel[]).map((lv) => {
            const cfg = PIG_10_LEVELS[lv];
            const isMagnumReached = magnumLevel >= lv;
            const isManowReached = manowLevel >= lv;
            return (
              <div
                key={lv}
                className={`p-3 rounded-2xl border text-center transition ${
                  isMagnumReached || isManowReached
                    ? 'bg-gradient-to-b from-pink-50/60 to-white border-pink-300 shadow-2xs'
                    : 'bg-slate-50/50 border-slate-200/80 opacity-60'
                }`}
              >
                <div className="text-xs font-black text-rose-600 mb-1">
                  Lv.{lv} {cfg.emoji}
                </div>
                <div className="text-[11px] font-bold text-slate-800 truncate mb-1">
                  {cfg.titleTh}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {cfg.bodyFatLabel}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {isMagnumReached && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700 font-bold" title="แม็กนั่มปลดล็อกแล้ว">
                      M 🏋️‍♂️
                    </span>
                  )}
                  {isManowReached && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-700 font-bold" title="มะนาวปลดล็อกแล้ว">
                      N 🌸
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
