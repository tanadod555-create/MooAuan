import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PigMascot } from '../components/ui/PigMascot';
import { chatWithTrainer } from '../services/gemini';
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
  Image as ImageIcon,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';

export type PigEvolutionLevel = 1 | 2 | 3 | 4;

interface PigState {
  level: PigEvolutionLevel;
  title: string;
  subtitle: string;
  bodyFatLabel: string;
  badgeColor: string;
  description: string;
  emoji: string;
}

const PIG_LEVELS: Record<PigEvolutionLevel, PigState> = {
  1: {
    level: 1,
    title: 'หมูกลมตัวตึง (Chonky Pig)',
    subtitle: 'ไม่ออกกำลังกายเลย พุงย้วยแก้มย้อย 🍩',
    bodyFatLabel: '~38% Body Fat',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    description: 'ช่วงนี้ไม่ค่อยได้ขยับร่าง นอนเล่นกินขนมเพลินจนพุงนำนมแล้วนะหมูอ้วน! รีบไปยิมด่วน 🐽',
    emoji: '🍩🐷',
  },
  2: {
    level: 2,
    title: 'หมูอวบเริ่มฟิต (Starting Out)',
    subtitle: 'ซ้อม 1-2 วัน/สัปดาห์ ร่างเริ่มตื่นตัว 💦',
    bodyFatLabel: '~28% Body Fat',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'เริ่มกลับมาขยับแขนขา เหงื่อเริ่มออก ไขมันเริ่มสะเทือน รักษาความต่อเนื่องไว้นะ!',
    emoji: '🏃‍♂️🐽',
  },
  3: {
    level: 3,
    title: 'หมูฟิตหุ่นลีน (Fit & Toned)',
    subtitle: 'ซ้อม 3-4 วัน/สัปดาห์ สมส่วนเฟิร์มกระชับ 💪',
    bodyFatLabel: '~18% Body Fat',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    description: 'หุ่นลีนสวย กล้ามเนื้อกระชับชัดเจน เดินไปไหนก็มีความมั่นใจ หมูตัวนี้มีวินัยสุดๆ!',
    emoji: '✨💪',
  },
  4: {
    level: 4,
    title: 'หมูกล้ามซิกแพก (Buff Chad Pig)',
    subtitle: 'ซ้อม 5+ วัน/สัปดาห์ กล้ามแน่น ซิกแพกเปรี๊ยะ 🔥',
    bodyFatLabel: '~12% Body Fat',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'ร่างทองระดับตำนาน! ซิกแพกเป็นลอน แขนแน่น อกแน่น เป็นยอดหมูนักกล้ามแห่ง MooAuan!',
    emoji: '🏆🏋️‍♂️',
  },
};

export const MascotBattleView: React.FC = () => {
  const {
    allWorkoutHistory,
    allBodyMetrics,
    primaryProfile,
    partnerProfile,
    settings,
  } = useApp();

  // Simulation override state (for testing & previewing transformations)
  const [overrideMagnumLevel, setOverrideMagnumLevel] = useState<PigEvolutionLevel | null>(null);
  const [overrideManowLevel, setOverrideManowLevel] = useState<PigEvolutionLevel | null>(null);
  const [showSimControls, setShowSimControls] = useState(false);

  // Custom animation/image slot (as requested: "เดียวผมจะ generate aniamtion หมูรหือภาพมาทีหลัง")
  const [customMagnumImg, setCustomMagnumImg] = useState<string>(() => {
    return localStorage.getItem('ft_custom_pig_magnum') || '';
  });
  const [customManowImg, setCustomManowImg] = useState<string>(() => {
    return localStorage.getItem('ft_custom_pig_manow') || '';
  });
  const [showCustomSlotModal, setShowCustomSlotModal] = useState(false);

  // Speech bubble states
  const [magnumSpeech, setMagnumSpeech] = useState<string>('ฮึบๆ! วันนี้ใครจะซ้อมหนักกว่ากัน มาลุยกันเลย! 🏋️‍♂️');
  const [manowSpeech, setManowSpeech] = useState<string>('สู้ไม่ถอยอยู่แล้ว! วันนี้จะปั้นหุ่นให้แซงหน้าเลยคอยดู 🌸🐽');
  const [isBanterLoading, setIsBanterLoading] = useState(false);

  // Calculate stats for the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

  // Magnum Stats
  const magnumHistory = allWorkoutHistory.filter((s) => (s.user_id || 'primary') === 'primary');
  const magnumRecentSessions = magnumHistory.filter((s) => s.date >= sevenDaysStr);
  const magnumWeekCount = magnumRecentSessions.length;
  const magnumTotalCount = magnumHistory.length;
  const magnumMetric = allBodyMetrics
    .filter((m) => (m.user_id || 'primary') === 'primary')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  // Manow Stats
  const manowHistory = allWorkoutHistory.filter((s) => s.user_id === 'partner');
  const manowRecentSessions = manowHistory.filter((s) => s.date >= sevenDaysStr);
  const manowWeekCount = manowRecentSessions.length;
  const manowTotalCount = manowHistory.length;
  const manowMetric = allBodyMetrics
    .filter((m) => (m.user_id || 'primary') === 'partner')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  // Compute Pig Evolution Level based on sessions this week
  const computePigLevel = (sessionsCount: number): PigEvolutionLevel => {
    if (sessionsCount >= 5) return 4;
    if (sessionsCount >= 3) return 3;
    if (sessionsCount >= 1) return 2;
    return 1;
  };

  const magnumLevel: PigEvolutionLevel =
    overrideMagnumLevel !== null ? overrideMagnumLevel : computePigLevel(magnumWeekCount);
  const manowLevel: PigEvolutionLevel =
    overrideManowLevel !== null ? overrideManowLevel : computePigLevel(manowWeekCount);

  const magnumState = PIG_LEVELS[magnumLevel];
  const manowState = PIG_LEVELS[manowLevel];

  // Winner calculation
  const leader =
    magnumWeekCount > manowWeekCount
      ? 'magnum'
      : manowWeekCount > magnumWeekCount
      ? 'manow'
      : 'tie';

  // Interactive dynamic dialogues on tap
  const handleTapMagnumPig = () => {
    if (magnumLevel > manowLevel) {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "อาทิตย์นี้เค้าซ้อมไป ${magnumWeekCount} ครั้งแล้วนะ! มะนาวอ้วนแล้วไม่ไปยิมเลย อู๊ดๆ รีบตามมาไวๆ นะ 🐷💨"`
      );
      setManowSpeech(
        `หมูมะนาว: "แงงงง! กำลังสะสมแรงอยู่ต่างหากล่ะ! เดี๋ยวพรุ่งนี้จะจัดหนักให้ดูเลยคอยดู! 😤🐽"`
      );
    } else if (magnumLevel < manowLevel) {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ฮึ่ม! มะนาวแอบฟิตแซงไป ${manowWeekCount} เซสชันแล้ว วันนี้ต้องรีบไปยกเวทปั๊มกล้ามตามให้ทันแล้ว! 💪🔥"`
      );
      setManowSpeech(
        `หมูมะนาว: "ฮิๆ ตามมาให้ทันน้าาา หมูฟิตตัวจริงอยู่นี่แล้วจ้าา 🌸✨"`
      );
    } else {
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ตอนนี้เราเสมออยู่ที่ ${magnumWeekCount} เซสชัน! วันนี้ใครจะเปิดเซสชันก่อนกัน? 🏋️‍♂️"`
      );
      setManowSpeech(
        `หมูมะนาว: "พร้อมเสมอจ้าาา วันนี้จัดเต็มแน่นอน ลุยไปด้วยกันนะหมูอ้วน 🐽"`
      );
    }
  };

  const handleTapManowPig = () => {
    if (manowLevel > magnumLevel) {
      setManowSpeech(
        `หมูมะนาว: "หมูแม็กนั่มอย่ามัวแต่นอนอืดน้าาา! เค้าฟิตไป ${manowWeekCount} วันแล้ว เอวเอสก้นเด้งแล้วเนี่ย 🌸💅"`
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
        `หมูมะนาว: "หมูคู่หูฟิตไปด้วยกัน! อาทิตย์นี้ ${manowWeekCount} เซสชันเท่ากันเป๊ะ แข่งกันแบบน่ารักๆ 🌸🐽"`
      );
      setMagnumSpeech(
        `หมูแม็กนั่ม: "ใช่เลย! หมูอ้วนอย่างเราสองคนก็ฟิตแอนด์เฟิร์มได้ 🏋️‍♂️✨"`
      );
    }
  };

  // AI Live Banter Generation via Gemini (NO EXTRA API NEEDED!)
  const handleGenerateAiBanter = async () => {
    setIsBanterLoading(true);
    try {
      const prompt = `เขียนบทสนทนาสั้นๆ น่ารักๆ ปนกวนและแซวกัน ระหว่าง "หมูแม็กนั่ม" (ผู้ชาย สายยกเวท) กับ "หมูมะนาว" (ผู้หญิง สายปั้นก้นกระชับหุ่น)
ข้อมูลจริงปัจจุบัน:
- หมูแม็กนั่ม: อาทิตย์นี้ซ้อมไป ${magnumWeekCount} เซสชัน (หุ่น: ${magnumState.title}, น้ำหนัก: ${magnumMetric?.weight_kg || 71.9} kg)
- หมูมะนาว: อาทิตย์นี้ซ้อมไป ${manowWeekCount} เซสชัน (หุ่น: ${manowState.title}, น้ำหนัก: ${manowMetric?.weight_kg || 49.0} kg)

เงื่อนไข:
- ให้หมูสองตัวยืนแซวกันเรื่องหุ่นและการไปยิม เช่น ถ้ามะนาวซ้อมน้อยกว่าให้แม็กนั่มแซวว่า "หมูมะนาวอ้วนแล้วไม่ยอมไปยิมเลย อู๊ดๆ" แล้วให้มะนาวเถียงกลับน่ารักๆ
- หรือถ้าใครซ้อมเยอะกว่าให้คุยข่มแบบน่ารัก ให้ฟีลคู่รักฟิตเนส มีเสียง "อู๊ดๆ / 🐽"
- ตอบในรูปแบบ JSON เท่านั้น:
{"magnum": "คำพูดหมูแม็กนั่ม", "manow": "คำพูดหมูมะนาว"}`;

      const reply = await chatWithTrainer({
        userMessage: prompt,
        context: {
          userName: 'แม็กนั่ม & มะนาว (Manow)',
          goal: 'แข่งขันฟิตเนสหมูอ้วน',
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
        apiKey: settings.geminiApiKey,
      });

      const cleaned = reply.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.magnum && parsed.manow) {
        setMagnumSpeech(`หมูแม็กนั่ม: "${parsed.magnum}"`);
        setManowSpeech(`หมูมะนาว: "${parsed.manow}"`);
      }
    } catch (e) {
      // Fallback charming dialogue if API unavailable
      if (magnumWeekCount >= manowWeekCount) {
        setMagnumSpeech(
          `หมูแม็กนั่ม: "หมูมะนาวอ้วนแล้วนะ ไม่ยอมไปยิมเลย อู๊ดๆ! พุงเริ่มย้วยแล้วน้า รีบไปลุยกันเถอะ 🐷💨"`
        );
        setManowSpeech(
          `หมูมะนาว: "อย่ามาล้อพุงเค้านะ! พรุ่งนี้จะไปเล่น Hip Thrust แซงหน้าให้ดูเลยคอยดู! 😤🐽"`
        );
      } else {
        setMagnumSpeech(
          `หมูแม็กนั่ม: "ยอมรับเลยว่าหมูมะนาวขยันมากอาทิตย์นี้! เดี๋ยวผมต้องรีบไปปั๊มกล้ามตามแล้ว 💪"`
        );
        setManowSpeech(
          `หมูมะนาว: "บอกแล้วว่าหมูมะนาวสายโหด! ไปวิ่งตามเค้าให้ทันนะจ๊ะ 🌸✨"`
        );
      }
    } finally {
      setIsBanterLoading(false);
    }
  };

  const handleSaveCustomImages = () => {
    localStorage.setItem('ft_custom_pig_magnum', customMagnumImg.trim());
    localStorage.setItem('ft_custom_pig_manow', customManowImg.trim());
    setShowCustomSlotModal(false);
    alert('บันทึกรูปภาพ/แอนิเมชันเรียบร้อยแล้ว!');
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 border border-pink-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <PigMascot size="lg" expression="cheer" className="drop-shadow-xs" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs">
                MooAuan Battle Arena 🥊
              </span>
              <span className="text-xs text-rose-500 font-bold">
                แม็กนั่ม VS มะนาว (Manow)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 mt-1">
              แบทเทิลหุ่นน้องหมูอ้วน · ซ้อมบ่อยหมูก็ฟิต ไม่ซ้อมหมูก็อ้วน! 🐷🔥
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              รูปร่างของน้องหมูจะพัฒนาตามจำนวนเซสชันที่ซ้อมจริง แตะตัวหมูเพื่อฟังเสียงพูดแซวกันได้เลย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test/Preview Simulator Slider Toggle */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Sliders size={14} />
            <span>{showSimControls ? 'ซ่อนตัวจำลอง' : 'จำลองหุ่นหมู'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Controls if toggled */}
      {showSimControls && (
        <div className="p-4 bg-white/95 rounded-2xl border border-pink-200 space-y-3 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders size={14} className="text-pink-400" />
              แผงจำลองทดสอบวิวัฒนาการหุ่นหมู (4 ระดับ: อ้วนกลม → อวบ → ลีนเฟิร์ม → ซิกแพก)
            </h4>
            <button
              onClick={() => {
                setOverrideMagnumLevel(null);
                setOverrideManowLevel(null);
              }}
              className="text-xs text-pink-600 font-bold hover:underline"
            >
              รีเซ็ตกลับตามสถิติจริง
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Magnum Simulator */}
            <div className="space-y-1.5 bg-pink-50/40 p-3 rounded-xl border border-pink-100">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">🏋️‍♂️ หมูแม็กนั่ม:</span>
                <span className="font-mono text-rose-500 font-bold">
                  ระดับ {magnumLevel} ({magnumState.title.split(' ')[0]})
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={magnumLevel}
                onChange={(e) => setOverrideMagnumLevel(Number(e.target.value) as PigEvolutionLevel)}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Manow Simulator */}
            <div className="space-y-1.5 bg-pink-50/40 p-3 rounded-xl border border-pink-100">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">🌸 หมูมะนาว:</span>
                <span className="font-mono text-rose-500 font-bold">
                  ระดับ {manowLevel} ({manowState.title.split(' ')[0]})
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={manowLevel}
                onChange={(e) => setOverrideManowLevel(Number(e.target.value) as PigEvolutionLevel)}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* VS Battle Score Banner */}
      <div className="p-3.5 bg-white/95 rounded-2xl border border-pink-200/90 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-rose-500" />
          <span className="text-xs sm:text-sm font-black text-slate-800">
            สถานะสัปดาห์นี้:
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              leader === 'magnum'
                ? 'bg-sky-100 text-sky-800 border-sky-200'
                : leader === 'manow'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-pink-100 text-pink-800 border-pink-200'
            }`}
          >
            {leader === 'magnum' && `🏋️‍♂️ แม็กนั่มนำอยู่ (${magnumWeekCount} ต่อ ${manowWeekCount} เซสชัน)`}
            {leader === 'manow' && `🌸 มะนาวนำอยู่ (${manowWeekCount} ต่อ ${magnumWeekCount} เซสชัน)`}
            {leader === 'tie' && `🔥 เสมอกัน (${magnumWeekCount} เซสชันเท่ากัน)`}
          </span>
        </div>

        {/* AI Banter Button */}
        <button
          onClick={handleGenerateAiBanter}
          disabled={isBanterLoading}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isBanterLoading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>หมูกำลังคิดมุกแซว...</span>
            </>
          ) : (
            <>
              <MessageCircle size={14} />
              <span>🗣️ ให้หมูสองตัวคุยแซวกันสดๆ (AI)</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================
          COZY MOOAUAN LIVING ROOM & GYM HOME
          หมูสองตัวยืนอยู่ด้วยกันข้างกันเหมือนในบ้าน
          ========================================= */}
      <div className="relative rounded-3xl border-2 border-pink-300/80 bg-gradient-to-b from-[#fff5f7] via-[#ffeef2] to-[#fedfe7] p-4 sm:p-6 shadow-md overflow-hidden">
        {/* Room Header Frame on the Wall */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-pink-200 shadow-2xs">
            <span className="text-sm">🏠</span>
            <span className="text-xs font-black text-slate-800">
              บ้านหมูอ้วนคู่หู (MooAuan Cozy Home)
            </span>
          </div>
          <span className="text-[11px] font-bold text-pink-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-pink-200">
            แตะตัวน้องหมูเพื่อฟังเสียงแซวกัน 🐽
          </span>
        </div>

        {/* Room Wall Decorations */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-40 pointer-events-none">
          <div className="w-16 h-10 border border-pink-300 rounded-md bg-white/60 flex items-center justify-center text-[9px] font-bold text-pink-600 shadow-2xs">
            🖼️ Magnum & Manow
          </div>
          <div className="w-7 h-7 rounded-full border border-pink-300 bg-white/60 flex items-center justify-center text-[10px]">
            ⏰
          </div>
        </div>

        {/* Room Floor Base (Warm Rug & Wooden Floor Styling) */}
        <div className="relative z-10">
          {/* Side-by-Side Speech Bubbles on Wall */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Magnum Speech Bubble */}
            <div
              onClick={handleTapMagnumPig}
              className="bg-sky-50/95 border border-sky-200/90 rounded-2xl p-2.5 sm:p-3 text-xs shadow-xs cursor-pointer hover:bg-sky-100/80 transition relative"
            >
              <div className="flex items-center gap-1 font-bold text-sky-700 text-[11px] mb-0.5">
                <span>🏋️‍♂️ แม็กนั่ม:</span>
              </div>
              <p className="font-medium text-slate-700 leading-snug italic line-clamp-3">
                "{magnumSpeech.replace(/^หมูแม็กนั่ม:\s*"?/, '').replace(/"?$/, '')}"
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-50 border-b border-r border-sky-200/90 rotate-45" />
            </div>

            {/* Manow Speech Bubble */}
            <div
              onClick={handleTapManowPig}
              className="bg-rose-50/95 border border-pink-200/90 rounded-2xl p-2.5 sm:p-3 text-xs shadow-xs cursor-pointer hover:bg-rose-100/80 transition relative"
            >
              <div className="flex items-center gap-1 font-bold text-rose-600 text-[11px] mb-0.5">
                <span>🌸 มะนาว:</span>
              </div>
              <p className="font-medium text-slate-700 leading-snug italic line-clamp-3">
                "{manowSpeech.replace(/^หมูมะนาว:\s*"?/, '').replace(/"?$/, '')}"
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-50 border-b border-r border-pink-200/90 rotate-45" />
            </div>
          </div>

          {/* Living Room Floor / Workout Mat with BOTH PIGS STANDING SIDE BY SIDE */}
          <div className="relative bg-gradient-to-r from-sky-50/60 via-pink-100/70 to-rose-50/60 border-2 border-pink-200/90 rounded-[32px] p-4 sm:p-6 shadow-inner">
            {/* Mat border stitch effect */}
            <div className="absolute inset-2 border border-dashed border-pink-300/60 rounded-[26px] pointer-events-none" />

            {/* Two Pigs Standing Side by Side */}
            <div className="grid grid-cols-2 gap-4 items-end justify-center py-2 sm:py-4">
              {/* MAGNUM PIG (Left) */}
              <div
                onClick={handleTapMagnumPig}
                className="flex flex-col items-center justify-center cursor-pointer group transition active:scale-95"
              >
                <div className="relative">
                  {customMagnumImg ? (
                    <img
                      src={customMagnumImg}
                      alt="Magnum Custom Pig"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md animate-bounce-subtle"
                    />
                  ) : (
                    <PigEvolutionVisual level={magnumLevel} expression="workout" gender="male" />
                  )}
                  {/* Subtle ground shadow */}
                  <div className="w-24 h-4 bg-pink-900/10 rounded-full mx-auto blur-[2px] mt-1" />
                </div>

                {/* Name & Evolution Badge */}
                <div className="text-center mt-2 space-y-0.5">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 inline-block shadow-2xs">
                    🏋️‍♂️ หมูแม็กนั่ม
                  </span>
                  <div className="text-xs font-bold text-slate-700">
                    {magnumState.title.split(' ')[0]}
                  </div>
                  <span className="text-[10px] font-mono text-sky-700 bg-white/80 px-2 py-0.2 rounded-md border border-sky-100">
                    {magnumState.bodyFatLabel}
                  </span>
                </div>
              </div>

              {/* MANOW PIG (Right) */}
              <div
                onClick={handleTapManowPig}
                className="flex flex-col items-center justify-center cursor-pointer group transition active:scale-95"
              >
                <div className="relative">
                  {customManowImg ? (
                    <img
                      src={customManowImg}
                      alt="Manow Custom Pig"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md animate-bounce-subtle"
                    />
                  ) : (
                    <PigEvolutionVisual level={manowLevel} expression="happy" gender="female" />
                  )}
                  {/* Subtle ground shadow */}
                  <div className="w-24 h-4 bg-pink-900/10 rounded-full mx-auto blur-[2px] mt-1" />
                </div>

                {/* Name & Evolution Badge */}
                <div className="text-center mt-2 space-y-0.5">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-200 inline-block shadow-2xs">
                    🌸 หมูมะนาว
                  </span>
                  <div className="text-xs font-bold text-slate-700">
                    {manowState.title.split(' ')[0]}
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 bg-white/80 px-2 py-0.2 rounded-md border border-pink-100">
                    {manowState.bodyFatLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Room Props: Dumbbell & Yoga Mat on the sides */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-3 pt-2">
              <span className="flex items-center gap-1 font-medium text-[11px] text-slate-500">
                <span>🏋️ มินิยิมแม็กนั่ม</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-[11px] text-slate-500">
                <span>🌸 โซนปั้นหุ่นมะนาว</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Side-by-Side Comparison Scoreboard */}
      <div className="bg-white/95 rounded-3xl border border-pink-200/90 p-4 sm:p-5 shadow-xs">
        <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-500" />
          ตารางเปรียบเทียบสถิติการฝึกของทั้งคู่
        </h4>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Magnum Column */}
          <div className="bg-sky-50/50 rounded-2xl p-3 sm:p-4 border border-sky-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-800">แม็กนั่ม (Magnum)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                Lv.{magnumLevel}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ซ้อมสัปดาห์นี้:</span>
                <strong className="font-mono text-slate-800">{magnumWeekCount} วัน</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>รวมทั้งหมด:</span>
                <strong className="font-mono text-slate-800">{magnumTotalCount} ครั้ง</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>น้ำหนักตัว:</span>
                <strong className="font-mono text-slate-800">{magnumMetric?.weight_kg || 71.9} kg</strong>
              </div>
            </div>
          </div>

          {/* Manow Column */}
          <div className="bg-rose-50/50 rounded-2xl p-3 sm:p-4 border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-700">มะนาว (Manow)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-rose-700">
                Lv.{manowLevel}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ซ้อมสัปดาห์นี้:</span>
                <strong className="font-mono text-slate-800">{manowWeekCount} วัน</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>รวมทั้งหมด:</span>
                <strong className="font-mono text-slate-800">{manowTotalCount} ครั้ง</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>น้ำหนักตัว:</span>
                <strong className="font-mono text-slate-800">{manowMetric?.weight_kg || 49.0} kg</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Rules Guide Card */}
      <MagicCard spotlightColor="rgba(244, 114, 182, 0.1)" className="p-5 sm:p-6 bg-white/90 border-pink-200/80 rounded-3xl shadow-xs">
        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-rose-500" />
          เกณฑ์การแปลงร่างของน้องหมูอ้วน (อิงตามจำนวนเซสชันใน 7 วันล่าสุด)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-1">
            <div className="flex items-center justify-between font-bold text-rose-700">
              <span>Lv.1 หมูกลมตัวตึง</span>
              <span>0 วัน/สัปดาห์</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ไม่ออกกำลังกายเลย หมูจะนอนอืดกินขนม แก้มย้อย พุงกลม 🍩
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-700">
              <span>Lv.2 หมูอวบเริ่มฟิต</span>
              <span>1-2 วัน/สัปดาห์</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              เริ่มขยับร่าง สวมที่คาดผม เหงื่อเริ่มไหล ร่างกายเริ่มเผาผลาญ 💦
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-1">
            <div className="flex items-center justify-between font-bold text-sky-700">
              <span>Lv.3 หมูฟิตหุ่นลีน</span>
              <span>3-4 วัน/สัปดาห์</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              หุ่นลีนเฟิร์มสมส่วน กล้ามเนื้อกระชับ ถือดัมเบลล์อย่างมั่นใจ 💪
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-1">
            <div className="flex items-center justify-between font-bold text-purple-700">
              <span>Lv.4 หมูกล้ามซิกแพก</span>
              <span>5+ วัน/สัปดาห์</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ร่างทองระดับแชมป์เปี้ยน! กล้ามแน่นเปรี๊ยะ ซิกแพกชัดเจน 🏆🔥
            </p>
          </div>
        </div>
      </MagicCard>

      {/* Custom Animation/Image Slot Modal */}
      {showCustomSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-pink-200 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <ImageIcon size={18} className="text-pink-500" />
                ช่องใส่ภาพ / แอนิเมชันของตัวเอง 🎨
              </h3>
              <button
                onClick={() => setShowCustomSlotModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              คุณสามารถวางลิงก์ URL ของภาพวาด ภาพถ่าย หรือแอนิเมชัน (เช่น GIF, PNG, WebP) ที่คุณ Generate มาทีหลัง เพื่อใช้แทนตัวหมูเริ่มต้นได้เลยครับ!
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🏋️‍♂️ ลิงก์ภาพหมูแม็กนั่ม (Image / GIF URL):
                </label>
                <input
                  type="text"
                  value={customMagnumImg}
                  onChange={(e) => setCustomMagnumImg(e.target.value)}
                  placeholder="https://... หรือ /images/magnum_pig.gif"
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🌸 ลิงก์ภาพหมูมะนาว (Image / GIF URL):
                </label>
                <input
                  type="text"
                  value={customManowImg}
                  onChange={(e) => setCustomManowImg(e.target.value)}
                  placeholder="https://... หรือ /images/manow_pig.gif"
                  className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
              <button
                onClick={() => {
                  setCustomMagnumImg('');
                  setCustomManowImg('');
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600"
              >
                ล้างกลับเป็นหมูระบบ
              </button>
              <button
                onClick={handleSaveCustomImages}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Pig Evolution Stage Visual Component
 * Renders the body shape based on level (1 = Fat round, 2 = Chubby sweat, 3 = Fit toned, 4 = Muscular 6-pack)
 */
const PigEvolutionVisual: React.FC<{
  level: PigEvolutionLevel;
  expression: string;
  gender: 'male' | 'female';
}> = ({ level, gender }) => {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Level 1: Extra Fat Chonky Pig */}
      {level === 1 && (
        <div className="relative animate-bounce-subtle">
          <div className="w-36 h-36 relative flex items-center justify-center">
            {/* Donut / Snack accessory */}
            <span className="absolute -top-2 -right-1 text-2xl z-10 animate-pulse">🍩</span>
            <span className="absolute bottom-0 -left-2 text-2xl z-10">🍟</span>
            {/* Chonky Pig SVG with extra belly scale */}
            <div className="scale-125 transform">
              <PigMascot size="lg" expression="sleep" animate={false} />
            </div>
          </div>
          {/* Double belly badge */}
          <div className="mt-1 text-center">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200/90 text-rose-800">
              พุงย้วย 3 ชั้น 🐽
            </span>
          </div>
        </div>
      )}

      {/* Level 2: Chubby Pig Starting Out */}
      {level === 2 && (
        <div className="relative animate-bounce-subtle">
          <div className="w-36 h-36 relative flex items-center justify-center">
            {/* Sweat drop accessory */}
            <span className="absolute -top-1 right-2 text-xl z-10 animate-bounce">💦</span>
            <div className="scale-110 transform">
              <PigMascot size="lg" expression="workout" animate={false} />
            </div>
          </div>
          <div className="mt-1 text-center">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-800">
              เริ่มขยับร่าง ฟิตขึ้นทีละนิด 🏃
            </span>
          </div>
        </div>
      )}

      {/* Level 3: Fit & Toned Athletic Pig */}
      {level === 3 && (
        <div className="relative animate-bounce-subtle">
          <div className="w-36 h-36 relative flex items-center justify-center">
            {/* Dumbbell / Sparkle accessory */}
            <span className="absolute -top-2 right-1 text-xl z-10">✨</span>
            <span className="absolute -bottom-1 -right-1 text-xl z-10">💪</span>
            <div className="scale-100 transform">
              <PigMascot size="lg" expression={gender === 'female' ? 'cheer' : 'strong'} animate={false} />
            </div>
          </div>
          <div className="mt-1 text-center">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-200/90 text-sky-800">
              {gender === 'female' ? 'เอวเอส ก้นเด้งกระชับ 🌸' : 'หุ่นลีน แขนแน่นสมส่วน 💪'}
            </span>
          </div>
        </div>
      )}

      {/* Level 4: Muscular Buff Chad Pig (6-pack) */}
      {level === 4 && (
        <div className="relative animate-bounce-subtle">
          {/* Champion Aura Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 via-pink-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse" />
          <div className="w-36 h-36 relative flex items-center justify-center">
            <span className="absolute -top-3 text-2xl z-10 animate-bounce">👑</span>
            <span className="absolute -left-3 bottom-2 text-2xl z-10">🔥</span>
            <span className="absolute -right-3 bottom-2 text-2xl z-10">🏋️‍♂️</span>
            <div className="scale-105 transform">
              <PigMascot size="lg" expression="strong" animate={false} />
            </div>
          </div>
          <div className="mt-1 text-center">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-xs">
              ⚡ ซิกแพกแน่น ร่างทองระดับเทพ 🔥
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
