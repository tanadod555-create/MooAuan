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
  RefreshCw,
  TrendingUp,
  Award,
  Zap,
  Swords,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Crown,
  Heart,
  Gamepad2,
  Coins,
  ShoppingBag,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { MascotSceneStage } from '../components/mascot/MascotSceneStage';
import { PiggyRunModal } from '../components/game/PiggyRunModal';
import {
  loadPiggySaveData,
  subscribeToCoinUpdates,
  PiggyRunSaveData,
} from '../services/piggyGameService';

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


  // Maxnum Stats & Evolution
  const maxnumHistory = allWorkoutHistory.filter(
    (s) => (s.user_id || 'primary') === 'primary'
  );
  const maxnumEvolution = calculatePigEvolution(
    maxnumHistory,
    activeWorkout !== null && activeProfileKey === 'primary'
  );

  // Manow Stats & Evolution
  const manowHistory = allWorkoutHistory.filter((s) => s.user_id === 'partner');
  const manowEvolution = calculatePigEvolution(
    manowHistory,
    activeWorkout !== null && activeProfileKey === 'partner'
  );

  const maxnumLevel = maxnumEvolution.level;
  const manowLevel = manowEvolution.level;

  const maxnumConfig = PIG_10_LEVELS[maxnumLevel];
  const manowConfig = PIG_10_LEVELS[manowLevel];

  // 4 Background Scene Conditions
  const today = new Date().toISOString().split('T')[0];
  const todayFoodCount = (allFoodLogs || []).filter((l) => l.date === today).length;
  const sceneInfo = getMascotScene(activeWorkout !== null, todayFoodCount);

  // Speech bubble states
  const [maxnumSpeech, setMaxnumSpeech] = useState<string>(
    'ฮึบๆ! วันนี้ใครจะซ้อมหนักกว่ากัน มาลุยกันเลย! 🏋️‍♂️'
  );
  const [manowSpeech, setManowSpeech] = useState<string>(
    'สู้ไม่ถอยอยู่แล้ว! วันนี้จะปั้นหุ่นให้แซงหน้าเลยคอยดู 🌸🐽'
  );
  const [isBanterLoading, setIsBanterLoading] = useState(false);

  // Piggy Run Minigame Modal States
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [showLevelRoadmap, setShowLevelRoadmap] = useState(false);
  const [gameInitialTab, setGameInitialTab] = useState<'game' | 'shop'>('game');
  const [gameSaveData, setGameSaveData] = useState<PiggyRunSaveData>(() => loadPiggySaveData());

  React.useEffect(() => {
    const unsubscribe = subscribeToCoinUpdates(() => {
      setGameSaveData(loadPiggySaveData());
    });
    return unsubscribe;
  }, []);

  // Winner calculation
  const leader =
    maxnumEvolution.recentWeekCount > manowEvolution.recentWeekCount
      ? 'maxnum'
      : manowEvolution.recentWeekCount > maxnumEvolution.recentWeekCount
      ? 'manow'
      : 'tie';

  // Interactive dynamic dialogues on tap
  const handleTapMaxnumPig = () => {
    if (maxnumLevel > manowLevel) {
      setMaxnumSpeech(
        `หมูแม็กนั่ม: "อาทิตย์นี้เค้าซ้อมไป ${maxnumEvolution.recentWeekCount} ครั้งแล้วนะ! มะนาวอ้วนแล้วไม่ไปยิมเลย อู๊ดๆ รีบตามมาไวๆ นะ 🐷💨"`
      );
      setManowSpeech(
        `หมูมะนาว: "แงงงง! กำลังสะสมแรงอยู่ต่างหากล่ะ! เดี๋ยวพรุ่งนี้จะจัดหนักให้ดูเลยคอยดู! 😤🐽"`
      );
    } else if (maxnumLevel < manowLevel) {
      setMaxnumSpeech(
        `หมูแม็กนั่ม: "ฮึ่ม! มะนาวแอบฟิตแซงไป ${manowEvolution.recentWeekCount} เซสชันแล้ว วันนี้ต้องรีบไปยกเวทปั๊มกล้ามตามให้ทันแล้ว! 💪🔥"`
      );
      setManowSpeech(
        `หมูมะนาว: "ฮิๆ ตามมาให้ทันน้าาา หมูฟิตตัวจริงอยู่นี่แล้วจ้าา 🌸✨"`
      );
    } else {
      setMaxnumSpeech(
        `หมูแม็กนั่ม: "ตอนนี้เราเสมออยู่ที่ ${maxnumEvolution.recentWeekCount} เซสชัน! วันนี้ใครจะเปิดเซสชันก่อนกัน? 🏋️‍♂️"`
      );
      setManowSpeech(
        `หมูมะนาว: "พร้อมเสมอจ้าาา วันนี้จัดเต็มแน่นอน ลุยไปด้วยกันนะหมูอ้วน 🐽"`
      );
    }
  };

  const handleTapManowPig = () => {
    if (manowLevel > maxnumLevel) {
      setManowSpeech(
        `หมูมะนาว: "หมูแม็กนั่มอย่ามัวแต่นอนอืดน้าาา! เค้าฟิตไป ${manowEvolution.recentWeekCount} วันแล้ว เอวเอสก้นเด้งแล้วเนี่ย 🌸💅"`
      );
      setMaxnumSpeech(
        `หมูแม็กนั่ม: "ยอมไม่ได้แล้ว! เดี๋ยวเย็นนี้ไปปั๊มอกกับไหล่ให้แน่นเปรี๊ยะเลย! 🏋️‍♂️🔥"`
      );
    } else if (manowLevel < maxnumLevel) {
      setManowSpeech(
        `หมูมะนาว: "งือออ วันนี้ขี้เกียจนิดหน่อยยย แต่เห็นหมูแม็กนั่มซิกแพกเริ่มมาแล้ว ยอมไม่ได้ พรุ่งนี้ไปยิมแน่! 🐽💨"`
      );
      setMaxnumSpeech(
        `หมูแม็กนั่ม: "ไปยิมด้วยกันนะหมูอ้วน เดี๋ยวเป็นเทรนเนอร์ช่วยเซฟให้เอง! 💪"`
      );
    } else {
      setManowSpeech(
        `หมูมะนาว: "หมูคู่หูฟิตไปด้วยกัน! อาทิตย์นี้ ${manowEvolution.recentWeekCount} เซสชันเท่ากันเป๊ะ แข่งกันแบบน่ารักๆ 🌸🐽"`
      );
      setMaxnumSpeech(
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
1. แม็กนั่ม (Maxnum - ผู้ชาย): ซ้อมสัปดาห์นี้ ${maxnumEvolution.recentWeekCount} ครั้ง, ซ้อมทั้งหมด ${maxnumEvolution.totalCount} ครั้ง, เลเวลปัจจุบัน Lv.${maxnumLevel} (${maxnumConfig.titleTh}), สตรีค ${maxnumEvolution.streakWeeks} สัปดาห์
2. มะนาว (Manow - ผู้หญิง): ซ้อมสัปดาห์นี้ ${manowEvolution.recentWeekCount} ครั้ง, ซ้อมทั้งหมด ${manowEvolution.totalCount} ครั้ง, เลเวลปัจจุบัน Lv.${manowLevel} (${manowConfig.titleTh}), สตรีค ${manowEvolution.streakWeeks} สัปดาห์

กรุณาสร้างบทสนทนาบลัฟกันแบบน่ารักๆ สั้นๆ 2 ประโยค:
- ประโยคแรกของแม็กนั่ม
- ประโยคที่สองของมะนาวตอบกลับ
(เน้นขิงกันเรื่องไปยิม ยกเวท หุ่นซิกแพก ก้นเด้ง และการกินอาหารคลีนหรือแอบกินขนม)
ตอบกลับในรูปแบบ JSON: {"maxnum": "...", "manow": "..."}
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
        if (parsed.maxnum) setMaxnumSpeech(`หมูแม็กนั่ม: "${parsed.maxnum}"`);
        if (parsed.manow) setManowSpeech(`หมูมะนาว: "${parsed.manow}"`);
      } else {
        setMaxnumSpeech('หมูแม็กนั่ม: "ฟิตทุกวันไม่มีแผ่วแน่นอน! 🔥"');
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
      <MascotSceneStage />

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
        </div>
      </div>

      {/* 3. Piggy Run Minigame Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-1 shadow-lg shadow-pink-200">
        <div className="bg-slate-950/95 rounded-[22px] p-4 sm:p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl">
                🏃💨
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  MooAuan Piggy Run! 🐷✨
                </h3>
                <span className="text-[10px] bg-pink-500/30 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/40">
                  มินิเกมวิ่งเก็บเหรียญ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                วิ่งหลบดัมเบลล์ สไลด์มุดบาร์เบลล์ และสะสมเหรียญจากการยกเวทมาอัปเกรดสกิล!
              </p>

              {/* Mini Stats row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-yellow-400/30">
                  <Coins size={13} className="text-yellow-400" />
                  <span>{gameSaveData.totalCoins.toLocaleString()} เหรียญ</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-rose-500/30">
                  <Trophy size={13} className="text-amber-400" />
                  <span>High Score: {gameSaveData.highScore.toLocaleString()}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  ตัวละคร: {gameSaveData.selectedCharacter === 'manow' ? 'หมูมะนาว 🌸' : 'หมูแม็กนั่ม 🏋️‍♂️'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={() => {
                setGameInitialTab('shop');
                setIsGameModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-400/30 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <ShoppingBag size={15} />
              <span>ร้านค้าสกิล</span>
            </button>
            <button
              onClick={() => {
                setGameInitialTab('game');
                setIsGameModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 transition active:scale-95 cursor-pointer"
            >
              <Gamepad2 size={16} />
              <span>เริ่มวิ่งเลย! 🕹️</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Character Battle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CHARACTER 1: MAXNUM (MALE) */}
        <div
          onClick={handleTapMaxnumPig}
          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 bg-white/95 shadow-md cursor-pointer hover:scale-[1.01] ${
            maxnumConfig.borderGlow
          }`}
        >
          {/* Winner Crown Tag */}
          {leader === 'maxnum' && (
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-200 animate-bounce">
              <Crown size={13} />
              <span>ผู้นำสัปดาห์นี้! 🔥</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-300 shadow-sm shrink-0 bg-sky-50">
              <img
                src={getUserAvatar('male')}
                alt="Maxnum"
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
          <div className="relative h-56 rounded-2xl bg-gradient-to-b from-sky-50/80 to-blue-50/40 border border-sky-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
            <PigMascot level={maxnumLevel} gender="male" size="xl" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-sky-200 text-[10px] font-black text-sky-700 font-mono">
              Lv.{maxnumLevel} / 10
            </div>
          </div>

          {/* Evolution Title & Body Fat */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>{maxnumConfig.emoji}</span>
                <span>{maxnumConfig.titleTh}</span>
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${maxnumConfig.badgeColor}`}>
                {maxnumConfig.bodyFatLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {maxnumConfig.description}
            </p>
          </div>

          {/* Streak & Sessions Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สัปดาห์นี้</span>
              <span className="text-sm font-black text-sky-700">
                {maxnumEvolution.recentWeekCount} วัน
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">สตรีค</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-0.5">
                <Flame size={12} /> {maxnumEvolution.streakWeeks} วีค
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">ทั้งหมด</span>
              <span className="text-sm font-black text-slate-700">
                {maxnumEvolution.totalCount} รอบ
              </span>
            </div>
          </div>

          {/* Inactivity Warning */}
          {maxnumEvolution.decayWarningMsg && (
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {maxnumEvolution.decayWarningMsg}
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
          <div className="relative h-56 rounded-2xl bg-gradient-to-b from-pink-50/80 to-rose-50/40 border border-pink-100 flex items-center justify-center p-2 mb-4 overflow-hidden">
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

      {/* 5. 10 Levels Roadmap Progression Guide (Collapsible) */}
      <div className="bg-white/95 rounded-3xl border border-pink-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLevelRoadmap(!showLevelRoadmap)}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-pink-50/50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Trophy size={18} className="text-yellow-500" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                แผนที่วิวัฒนาการ 10 เลเวล 🗺️
              </h3>
              <p className="text-[11px] text-slate-400">
                แตะเพื่อ{showLevelRoadmap ? 'ซ่อน' : 'ดู'}เกณฑ์ปลดล็อกเลเวลทั้งหมด
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>{showLevelRoadmap ? 'ซ่อน' : 'ดูทั้งหมด'}</span>
            {showLevelRoadmap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showLevelRoadmap && (
          <div className="p-5 pt-0 border-t border-pink-100/80 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              เลเวลคำนวณจาก **ความต่อเนื่อง (Streak)** และ **จำนวนเซสชันในรอบ 7-30 วัน**
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as PigEvolutionLevel[]).map((lv) => {
                const cfg = PIG_10_LEVELS[lv];
                const isMaxnumReached = maxnumLevel >= lv;
                const isManowReached = manowLevel >= lv;
                return (
                  <div
                    key={lv}
                    className={`p-3 rounded-2xl border text-center transition ${
                      isMaxnumReached || isManowReached
                        ? 'bg-gradient-to-b from-pink-50/60 to-white border-pink-300 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="text-xs font-black text-rose-600 mb-0.5">
                      Lv.{lv} {cfg.emoji}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 truncate mb-0.5">
                      {cfg.titleTh}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {cfg.bodyFatLabel}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      {isMaxnumReached && (
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
        )}
      </div>

      {/* Piggy Run Modal */}
      <PiggyRunModal
        isOpen={isGameModalOpen}
        onClose={() => {
          setIsGameModalOpen(false);
          setGameSaveData(loadPiggySaveData());
        }}
        initialTab={gameInitialTab}
        selectedCharacter={gameSaveData.selectedCharacter}
      />
    </div>
  );
};
