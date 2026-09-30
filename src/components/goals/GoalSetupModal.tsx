import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Target,
  Sparkles,
  Flame,
  Dumbbell,
  Scale,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Info,
  Heart,
  Droplet,
  Moon,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PigMascot, PigExpression } from '../ui/PigMascot';

export type GoalKey =
  | 'lean_bulk'
  | 'hard_bulk'
  | 'cut'
  | 'recomp'
  | 'maintenance';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'heavy'
  | 'athlete';

interface GoalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserKey?: 'primary' | 'partner';
}

export const GoalSetupModal: React.FC<GoalSetupModalProps> = ({
  isOpen,
  onClose,
  targetUserKey,
}) => {
  const {
    currentProfile,
    primaryProfile,
    partnerProfile,
    activeProfileKey,
    updateProfile,
    bodyMetrics,
  } = useApp();

  const profileKey = targetUserKey || activeProfileKey;
  const targetProfile = profileKey === 'partner' ? partnerProfile : primaryProfile;

  // Latest weight from metrics or fallback
  const latestMetric = useMemo(() => {
    const userMetrics = bodyMetrics.filter(
      (m) => (m.user_id || 'primary') === profileKey
    );
    if (userMetrics.length === 0) return null;
    return [...userMetrics].sort((a, b) => a.date.localeCompare(b.date))[userMetrics.length - 1];
  }, [bodyMetrics, profileKey]);

  // Form State
  const [selectedGoal, setSelectedGoal] = useState<GoalKey>('lean_bulk');
  const [gender, setGender] = useState<'male' | 'female'>(
    targetProfile.sex === 'female' ? 'female' : 'male'
  );
  const [age, setAge] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    return targetProfile.birth_year ? currentYear - targetProfile.birth_year : 26;
  });
  const [weightKg, setWeightKg] = useState<number>(
    latestMetric?.weight_kg || (profileKey === 'partner' ? 52 : 72)
  );
  const [heightCm, setHeightCm] = useState<number>(targetProfile.height_cm || 170);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [showReferences, setShowReferences] = useState(false);
  const [customSurplusDeficit, setCustomSurplusDeficit] = useState<number | null>(null);

  // Goal Definitions
  const GOAL_OPTIONS: Record<
    GoalKey,
    {
      title: string;
      subtitle: string;
      icon: string;
      mascot: PigExpression;
      calorieAdjustmentPct: number; // percentage of TDEE
      calorieAdjustmentFixed: number; // fixed kcal offset
      proteinPerKg: number; // g per kg
      fatPerKg: number; // g per kg
      focusDescription: string;
      targetWeeklyChange: string;
      trainingFocus: string;
      nutritionTip: string;
    }
  > = {
    lean_bulk: {
      title: 'เพิ่มกล้ามเนื้อแบบลีน (Lean Bulk)',
      subtitle: 'สร้างกล้ามเนื้อเน้นๆ เพิ่มไขมันให้น้อยที่สุด',
      icon: '🥩',
      mascot: 'strong',
      calorieAdjustmentPct: 12,
      calorieAdjustmentFixed: 280,
      proteinPerKg: 2.0,
      fatPerKg: 0.9,
      focusDescription:
        'รับพลังงาน Caloric Surplus เล็กน้อย (+10-15%) เพื่อกระตุ้นการสังเคราะห์โปรตีนของกล้ามเนื้อ (MPS) อย่างต่อเนื่อง โดยไม่สะสมไขมันส่วนเกินที่หน้าท้องหรือเอว',
      targetWeeklyChange: 'น้ำหนักเพิ่มขึ้น ~0.25 - 0.5% ต่อสัปดาห์ (ประมาณ 0.5 - 1.0 kg ต่อเดือน)',
      trainingFocus:
        'เน้น Progressive Overload ยกหนักขึ้นหรือเพิ่มจำนวนครั้งในแต่ละสัปดาห์ โฟกัส RIR 1-2 (ห่างจากหมดแรง 1-2 ครั้ง)',
      nutritionTip:
        'กระจายโปรตีน 25-40g ต่อมื้อทุก 3-4 ชั่วโมง และเติมคาร์โบไฮเดรตเชิงซ้อนก่อนและหลังเล่นเวทเพื่อเติมเต็มไกลโคเจน',
    },
    hard_bulk: {
      title: 'เพิ่มน้ำหนัก & พละกำลัง (Power Bulk)',
      subtitle: 'สำหรับคนผอม เพิ่มน้ำหนักยาก ต้องการแรงยกสูงสุด',
      icon: '🏋️‍♂️',
      mascot: 'eating',
      calorieAdjustmentPct: 18,
      calorieAdjustmentFixed: 450,
      proteinPerKg: 1.9,
      fatPerKg: 1.0,
      focusDescription:
        'รับพลังงานเกินกว่าที่ร่างกายใช้ (+15-20%) เหมาะกับคนที่น้ำหนักขึ้นยาก (Hardgainer) หรือผู้ที่ต้องการเพิ่มแรงยกอย่างรวดเร็ว',
      targetWeeklyChange: 'น้ำหนักเพิ่มขึ้น ~0.5 - 0.8% ต่อสัปดาห์ (ประมาณ 1.2 - 2.0 kg ต่อเดือน)',
      trainingFocus:
        'เน้นท่า Compound หลัก (Squat, Deadlift, Bench Press, Overhead Press) พักระหว่างเซ็ต 2-3 นาทีเพื่อฟื้นกำลังระบบประสาท',
      nutritionTip:
        'หากกินข้าวไม่ทันหรืออิ่มง่าย ให้เลือกอาหารแคลอรี่แน่นที่มีประโยชน์ เช่น ข้าวโอ๊ต เนยถั่ว ถั่วเปลือกแข็ง ไข่ทั้งฟอง นม และกล้วยหอม',
    },
    cut: {
      title: 'ลดไขมัน & รีดลีน (Fat Loss / Cut)',
      subtitle: 'ดึงไขมันสะสมมาใช้ พร้อมรักษามวลกล้ามเนื้อ',
      icon: '✂️',
      mascot: 'workout',
      calorieAdjustmentPct: -20,
      calorieAdjustmentFixed: -450,
      proteinPerKg: 2.3, // Higher protein to spare lean tissue
      fatPerKg: 0.8,
      focusDescription:
        'รับพลังงานต่ำกว่าที่ใช้ (Caloric Deficit 20-25%) โดยเพิ่มโปรตีนให้สูงเป็นพิเศษ (2.2-2.4 g/kg) เพื่อป้องกันไม่ให้ร่างกายสลายเนื้อเยื่อกล้ามเนื้อ',
      targetWeeklyChange: 'น้ำหนักลดลง ~0.5 - 1.0% ต่อสัปดาห์ (ประมาณ 0.3 - 0.7 kg ต่อสัปดาห์)',
      trainingFocus:
        'ยังคงยกเวทด้วยความหนัก (Intensity) เท่าเดิม เพื่อส่งสัญญาณบอกร่างกายว่าจำเป็นต้องเก็บกล้ามเนื้อไว้ ไม่ลดน้ำหนักที่ยกลง',
      nutritionTip:
        'เน้นไฟเบอร์ ผักใบเขียว ดื่มน้ำ 3 ลิตร/วัน และเลือกโปรตีนไขมันต่ำ เช่น อกไก่ ปลากะพง กุ้ง ไข่ขาว เต้าหู้ เพื่อให้อิ่มท้องนาน',
    },
    recomp: {
      title: 'ปั้นหุ่นกระชับ & รีคอมพ์ (Body Recomposition)',
      subtitle: 'ลดไขมันพร้อมเพิ่มกล้ามเนื้อ เหมาะสำหรับผู้หญิง & มือใหม่',
      icon: '⏳',
      mascot: 'cheer',
      calorieAdjustmentPct: -5,
      calorieAdjustmentFixed: -100,
      proteinPerKg: 2.1,
      fatPerKg: 0.85,
      focusDescription:
        'รักษาสมดุลพลังงานเกือบเท่ากับ TDEE (หรือติดลบเพียงเล็กน้อย 5%) ร่วมกับการฝึกเวทเทรนนิ่งที่เข้มข้น ร่างกายจะดึงไขมันส่วนเกินมาเป็นพลังงานในการสร้างกล้ามเนื้อ',
      targetWeeklyChange:
        'น้ำหนักตัวบนตาชั่งอาจแทบไม่เปลี่ยน (±0.2 kg) แต่วัดสัดส่วนรอบเอวจะลดลง ขณะที่สะโพก ก้น และแขนกระชับแน่นขึ้นชัดเจน',
      trainingFocus:
        'เน้นกล้ามเนื้อมัดใหญ่และสัดส่วนที่ต้องการ เช่น สะโพก ก้น ขา (Hip Thrust, RDL, Squats) ทำเซ็ต 8-12 ครั้งด้วยฟอร์มที่ถูกต้อง',
      nutritionTip:
        'อย่ากลัวการกินโปรตีน! โปรตีนไม่ทำให้อ้วน แต่ช่วยกระชับเนื้อเยื่อผิวหนังและกล้ามเนื้อให้เฟิร์มสวย ไม่ย้วย',
    },
    maintenance: {
      title: 'รักษารูปร่าง & สุขภาพ (Maintenance & Health)',
      subtitle: 'รักษาน้ำหนักให้คงที่ สุขภาพฮอร์โมนและร่างกายสมดุล',
      icon: '⚖️',
      mascot: 'happy',
      calorieAdjustmentPct: 0,
      calorieAdjustmentFixed: 0,
      proteinPerKg: 1.7,
      fatPerKg: 0.9,
      focusDescription:
        'รับพลังงานเท่ากับ TDEE 100% เพื่อรักษาสมดุลของระบบเผาผลาญ ฮอร์โมนสืบพันธุ์ และระบบภูมิคุ้มกัน เหมาะสำหรับช่วงพักฟื้นหรือผู้ที่พอใจในรูปร่างแล้ว',
      targetWeeklyChange: 'น้ำหนักคงที่เสถียร (อยู่ในช่วง ±0.5 kg)',
      trainingFocus:
        'ฝึกซ้อมสม่ำเสมอ 3-4 วัน/สัปดาห์ เพื่อรักษามวลกล้ามเนื้อ ความหนาแน่นของกระดูก และสุขภาพหัวใจหลอดเลือด',
      nutritionTip:
        'ทานอาหารให้ครบ 5 หมู่ตามหลักโภชนาการที่หลากหลาย เน้นผัก ผลไม้ ธัญพืชไม่ขัดสี และไขมันดี เช่น น้ำมันมะกอก อะโวคาโด',
    },
  };

  const currentGoalConfig = GOAL_OPTIONS[selectedGoal];

  // Activity Multipliers
  const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; multiplier: number; desc: string }> = {
    sedentary: {
      label: 'นั่งโต๊ะทำงานเป็นหลัก',
      multiplier: 1.2,
      desc: 'ขยับตัวน้อย ไม่ออกกำลังกาย',
    },
    light: {
      label: 'กิจกรรมเบาๆ (1-2 วัน/สัปดาห์)',
      multiplier: 1.375,
      desc: 'เดินบ่อย หรือออกกำลังกายเบาๆ',
    },
    moderate: {
      label: 'ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)',
      multiplier: 1.55,
      desc: 'ยกเวทหรือคาร์ดิโอสม่ำเสมอ (แนะนำ)',
    },
    heavy: {
      label: 'ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)',
      multiplier: 1.725,
      desc: 'ฝึกซ้อมเข้มข้น ทำงานที่ต้องใช้แรง',
    },
    athlete: {
      label: 'นักกีฬา / ซ้อมวันละ 2 ครั้ง',
      multiplier: 1.9,
      desc: 'ซ้อมเพื่อแข่งขัน ร่างกายใช้พลังงานมหาศาล',
    },
  };

  // Scientific Calculations (Mifflin-St Jeor Formula)
  const calculation = useMemo(() => {
    // 1. BMR (Mifflin-St Jeor)
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.round(bmr);

    // 2. TDEE
    const tdeeMultiplier = ACTIVITY_MULTIPLIERS[activity].multiplier;
    const tdee = Math.round(bmr * tdeeMultiplier);

    // 3. Target Calories based on Goal
    const offset =
      customSurplusDeficit !== null
        ? customSurplusDeficit
        : currentGoalConfig.calorieAdjustmentFixed;
    const targetKcal = Math.max(1200, Math.round(tdee + offset));

    // 4. Protein calculation (g/kg)
    const targetProteinG = Math.round(weightKg * currentGoalConfig.proteinPerKg);
    const proteinKcal = targetProteinG * 4;

    // 5. Fat calculation (g/kg, min 20% of target kcal)
    let targetFatG = Math.round(weightKg * currentGoalConfig.fatPerKg);
    const minFatG = Math.round((targetKcal * 0.2) / 9);
    if (targetFatG < minFatG) targetFatG = minFatG;
    const fatKcal = targetFatG * 9;

    // 6. Carb calculation (Remainder of calories)
    const remainingKcal = Math.max(0, targetKcal - proteinKcal - fatKcal);
    const targetCarbG = Math.round(remainingKcal / 4);
    const carbKcal = targetCarbG * 4;

    // Percentages
    const totalMacroKcal = proteinKcal + fatKcal + carbKcal || targetKcal;
    const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
    const fatPct = Math.round((fatKcal / totalMacroKcal) * 100);
    const carbPct = Math.max(0, 100 - proteinPct - fatPct);

    return {
      bmr,
      tdee,
      offset,
      targetKcal,
      targetProteinG,
      proteinPerKgActual: (targetProteinG / weightKg).toFixed(1),
      targetFatG,
      fatPerKgActual: (targetFatG / weightKg).toFixed(1),
      targetCarbG,
      carbPerKgActual: (targetCarbG / weightKg).toFixed(1),
      proteinPct,
      fatPct,
      carbPct,
    };
  }, [
    weightKg,
    heightCm,
    age,
    gender,
    activity,
    selectedGoal,
    customSurplusDeficit,
    currentGoalConfig,
  ]);

  if (!isOpen) return null;

  // Save and Apply to Profile
  const handleApplyToProfile = () => {
    updateProfile(
      {
        goal: currentGoalConfig.title,
        height_cm: heightCm,
        kcal_target: calculation.targetKcal,
        protein_target_g: calculation.targetProteinG,
        carb_target_g: calculation.targetCarbG,
        fat_target_g: calculation.targetFatG,
      },
      profileKey === 'partner'
    );

    alert(
      `🎉 บันทึกเป้าหมาย "${currentGoalConfig.title}" ของ ${targetProfile.name} เรียบร้อยแล้ว!\n\n` +
        `• แคลอรี่: ${calculation.targetKcal} kcal/วัน\n` +
        `• โปรตีน: ${calculation.targetProteinG}g (${calculation.proteinPerKgActual} g/kg)\n` +
        `• คาร์บ: ${calculation.targetCarbG}g (${calculation.carbPerKgActual} g/kg)\n` +
        `• ไขมัน: ${calculation.targetFatG}g (${calculation.fatPerKgActual} g/kg)`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-pink-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-pink-200 bg-pink-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PigMascot size="sm" expression={currentGoalConfig.mascot} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-pink-950 text-base sm:text-lg">
                  คำนวณเป้าหมาย & สารอาหาร (Smart Goal Setup) 🎯
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold">
                  {targetProfile.name}
                </span>
              </div>
              <p className="text-xs text-pink-800/80">
                คำนวณอัตโนมัติตามหลักวิทยาศาสตร์การกีฬา ISSN & ACSM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-pink-400 hover:text-pink-700 hover:bg-pink-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: Select Goal */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-pink-950 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={15} className="text-rose-500" />
                ขั้นที่ 1: เลือกเป้าหมายรูปร่างที่ต้องการ
              </span>
              <span className="text-[11px] text-rose-600 font-bold">เลือก 1 ข้อ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(GOAL_OPTIONS) as GoalKey[]).map((key) => {
                const opt = GOAL_OPTIONS[key];
                const isSelected = selectedGoal === key;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedGoal(key);
                      setCustomSurplusDeficit(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 shadow-sm ring-2 ring-rose-200'
                        : 'bg-pink-50/40 hover:bg-pink-50/80 border-pink-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs sm:text-sm font-black truncate ${
                            isSelected ? 'text-rose-700' : 'text-pink-950'
                          }`}
                        >
                          {opt.title.split(' (')[0]}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-rose-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-pink-800/70 mt-0.5 leading-snug">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Body Stats & Activity */}
          <div className="space-y-3 p-4 rounded-3xl bg-pink-50/50 border border-pink-200/90">
            <span className="text-xs font-black text-pink-950 uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={15} className="text-rose-500" />
              ขั้นที่ 2: สรีระและระดับกิจกรรมของ {targetProfile.name}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-pink-900 mb-1">เพศ</label>
                <div className="flex rounded-xl bg-white border border-pink-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      gender === 'male' ? 'bg-rose-500 text-white shadow-xs' : 'text-pink-800'
                    }`}
                  >
                    ชาย 👨
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      gender === 'female' ? 'bg-rose-500 text-white shadow-xs' : 'text-pink-800'
                    }`}
                  >
                    หญิง 👩
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-[11px] font-bold text-pink-900 mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-pink-950 font-bold font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-[11px] font-bold text-pink-900 mb-1">
                  น้ำหนัก (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-rose-600 font-black font-mono focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-[11px] font-bold text-pink-900 mb-1">
                  ส่วนสูง (cm) *
                </label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 165)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-pink-950 font-bold font-mono focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-pink-900 mb-1.5">
                ระดับกิจกรรมประจำวัน (Activity Level):
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs font-bold text-pink-950 focus:outline-none focus:border-rose-400 cursor-pointer shadow-xs"
              >
                {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((actKey) => (
                  <option key={actKey} value={actKey}>
                    {ACTIVITY_MULTIPLIERS[actKey].label} — {ACTIVITY_MULTIPLIERS[actKey].desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 3: Live Scientific Calculation Result Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-amber-50/80 border-2 border-rose-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-rose-500" />
                <h4 className="text-sm font-black text-pink-950">
                  ผลลัพธ์คำนวณเป้าหมายประจำวัน (Nutrition Blueprint)
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-pink-800">
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-pink-200">
                  BMR: {calculation.bmr}
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-pink-200">
                  TDEE: {calculation.tdee}
                </span>
              </div>
            </div>

            {/* Calories Banner */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-pink-700 block uppercase">
                  พลังงานเป้าหมายแนะนำ (Target Calories)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-rose-600">
                    {calculation.targetKcal}
                  </span>
                  <span className="text-xs font-bold text-pink-800">kcal / วัน</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                    calculation.offset > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : calculation.offset < 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {calculation.offset > 0
                    ? `Surplus +${calculation.offset} kcal`
                    : calculation.offset < 0
                    ? `Deficit ${calculation.offset} kcal`
                    : 'Maintenance (0 kcal)'}
                </span>
                <span className="text-[10px] text-pink-700/80 block mt-1">
                  เทียบกับ TDEE ({calculation.tdee})
                </span>
              </div>
            </div>

            {/* Macros Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Protein */}
              <div className="p-3 rounded-2xl bg-white border border-sky-200 shadow-xs text-center">
                <span className="text-[11px] font-black text-sky-700 block">โปรตีน (Protein)</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-sky-950 mt-1 block">
                  {calculation.targetProteinG}g
                </span>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded-md border border-sky-100 inline-block mt-0.5">
                  {calculation.proteinPerKgActual} g/kg
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {calculation.proteinPct}% ({calculation.targetProteinG * 4} kcal)
                </span>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs text-center">
                <span className="text-[11px] font-black text-amber-700 block">คาร์บ (Carbs)</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-950 mt-1 block">
                  {calculation.targetCarbG}g
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-100 inline-block mt-0.5">
                  {calculation.carbPerKgActual} g/kg
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {calculation.carbPct}% ({calculation.targetCarbG * 4} kcal)
                </span>
              </div>

              {/* Fat */}
              <div className="p-3 rounded-2xl bg-white border border-rose-200 shadow-xs text-center">
                <span className="text-[11px] font-black text-rose-700 block">ไขมัน (Fat)</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-rose-950 mt-1 block">
                  {calculation.targetFatG}g
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-100 inline-block mt-0.5">
                  {calculation.fatPerKgActual} g/kg
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {calculation.fatPct}% ({calculation.targetFatG * 9} kcal)
                </span>
              </div>
            </div>

            {/* Macro Ratio Proportion Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-pink-100">
                <div
                  style={{ width: `${calculation.proteinPct}%` }}
                  className="h-full bg-sky-500"
                  title={`โปรตีน ${calculation.proteinPct}%`}
                />
                <div
                  style={{ width: `${calculation.carbPct}%` }}
                  className="h-full bg-amber-400"
                  title={`คาร์โบไฮเดรต ${calculation.carbPct}%`}
                />
                <div
                  style={{ width: `${calculation.fatPct}%` }}
                  className="h-full bg-rose-500"
                  title={`ไขมัน ${calculation.fatPct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-pink-800 font-bold px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> โปรตีน {calculation.proteinPct}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> คาร์บ {calculation.carbPct}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> ไขมัน {calculation.fatPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations & Scientific Citations */}
          <div className="space-y-3">
            {/* Recommendations Box */}
            <div className="p-4 rounded-3xl bg-pink-50/70 border border-pink-200 space-y-2.5">
              <h4 className="text-xs font-black text-pink-950 flex items-center gap-1.5">
                <Award size={15} className="text-rose-500" />
                คำแนะนำในการปฏิบัติตามเป้าหมายนี้:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-pink-200/80">
                  <span className="font-bold text-rose-600 block mb-0.5 flex items-center gap-1">
                    <TrendingUp size={13} /> อัตราเป้าหมายรายสัปดาห์
                  </span>
                  <p className="text-[11px] text-pink-950 font-medium">
                    {currentGoalConfig.targetWeeklyChange}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-pink-200/80">
                  <span className="font-bold text-sky-700 block mb-0.5 flex items-center gap-1">
                    <Dumbbell size={13} /> แนวทางการฝึกซ้อม (Training)
                  </span>
                  <p className="text-[11px] text-pink-950 font-medium">
                    {currentGoalConfig.trainingFocus}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-pink-200/80 text-xs">
                <span className="font-bold text-amber-700 block mb-0.5 flex items-center gap-1">
                  <Flame size={13} /> เคล็ดลับโภชนาการ (Nutrition Tip)
                </span>
                <p className="text-[11px] text-pink-950 font-medium leading-relaxed">
                  {currentGoalConfig.nutritionTip}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-pink-900 pt-1">
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-pink-200">
                  <Droplet size={13} className="text-sky-500 shrink-0" />
                  ดื่มน้ำวันละ 2.5 - 3.5 ลิตร
                </span>
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-pink-200">
                  <Moon size={13} className="text-indigo-500 shrink-0" />
                  นอนหลับพักผ่อน 7 - 8 ชม./คืน
                </span>
              </div>
            </div>

            {/* Scientific References Toggle Button */}
            <div className="border border-pink-200 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowReferences((prev) => !prev)}
                className="w-full p-3 bg-pink-50/50 hover:bg-pink-100 flex items-center justify-between text-xs font-bold text-pink-900 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={15} className="text-rose-500" />
                  หลักฐานและเอกสารวิจัยอ้างอิงทางวิทยาศาสตร์ (Scientific Evidence & Citations)
                </span>
                <ChevronRight
                  size={16}
                  className={`text-pink-600 transition-transform ${
                    showReferences ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {showReferences && (
                <div className="p-4 space-y-3 text-xs bg-white border-t border-pink-200 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="font-bold text-rose-600 block">
                      1. Morton et al. (2018) — British Journal of Sports Medicine
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-2 border-l-2 border-rose-300">
                      งานวิจัย Meta-analysis รวบรวม 49 การทดลองทางคลินิก (1,863 คน) สรุปว่า การรับประทานโปรตีนที่ <strong>1.62 - 2.2 g/kg/วัน</strong> ร่วมกับการฝึกเวทเทรนนิ่ง ให้การเพิ่มขึ้นของมวลกล้ามเนื้อและแรงยกสูงสุดอย่างมีนัยสำคัญที่สุด
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-rose-600 block">
                      2. Helms et al. (2014) & Aragon et al. (2017) — JISSN Position Stand
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-2 border-l-2 border-rose-300">
                      สมาคมโภชนาการการกีฬานานาชาติ (ISSN) แนะนำว่า ในสภาวะแคลอรี่ติดลบ (Caloric Deficit เพื่อลดไขมัน) ผู้ฝึกควรเพิ่มโปรตีนเป็น <strong>2.0 - 2.4 g/kg</strong> (หรือ 2.3 - 3.1 g/kg FFM) เพื่อปกป้องมวลกล้ามเนื้อไม่ให้สลายตัว
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-rose-600 block">
                      3. ACSM, AND & Dietitians of Canada Joint Position (2016)
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-2 border-l-2 border-rose-300">
                      การบริโภคไขมันไม่ควรต่ำกว่า <strong>20% ของพลังงานทั้งหมด</strong> (ประมาณ 0.8-1.0 g/kg) เพื่อรักษาระดับฮอร์โมนเพศ Testosterone, Estrogen และการดูดซึมวิตามิน A, D, E, K
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-rose-600 block">
                      4. Mifflin et al. (1990) — American Journal of Clinical Nutrition
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-2 border-l-2 border-rose-300">
                      สมการ Mifflin-St Jeor Equation ได้รับการยืนยันจาก Academy of Nutrition and Dietetics ว่าเป็นสมการคำนวณ BMR ที่มีความคลาดเคลื่อนต่ำที่สุดและน่าเชื่อถือสูงสุด
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 border-t border-pink-200 bg-pink-50/80 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-bold transition cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleApplyToProfile}
            className="flex-1 sm:flex-initial py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 active:scale-95 transition cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>ปรับใช้เป็นเป้าหมายของ {targetProfile.name} ทันที 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
