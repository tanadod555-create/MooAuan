import { WorkoutSession } from '../types';

export type PigEvolutionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PigLevelConfig {
  level: PigEvolutionLevel;
  titleTh: string;
  titleEn: string;
  subtitle: string;
  bodyFatLabel: string;
  badgeColor: string;
  borderGlow: string;
  description: string;
  emoji: string;
  minWeekSessions: number;
  minTotalSessions: number;
  minStreakWeeks: number;
}

export const PIG_10_LEVELS: Record<PigEvolutionLevel, PigLevelConfig> = {
  1: {
    level: 1,
    titleTh: 'หมูกลมพุงย้วย',
    titleEn: 'Chonky Piggy',
    subtitle: 'ยังไม่ได้เริ่มซ้อม นอนกินขนมพุงกระเพื่อม 🍩',
    bodyFatLabel: '~38% Body Fat',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    borderGlow: 'shadow-rose-100/60 border-rose-200',
    description: 'ช่วงนี้นอนเล่นกินขนมเพลินจนพุงนำนมแล้วนะหมูอ้วน! รีบไปยิมด่วน 🐽',
    emoji: '🍩🐷',
    minWeekSessions: 0,
    minTotalSessions: 0,
    minStreakWeeks: 0,
  },
  2: {
    level: 2,
    titleTh: 'หมูเริ่มขยับร่าง',
    titleEn: 'Warming Up',
    subtitle: 'ซ้อม 1 ครั้ง/สัปดาห์ ร่างกายเริ่มตื่นตัว 💦',
    bodyFatLabel: '~34% Body Fat',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    borderGlow: 'shadow-orange-100/60 border-orange-200',
    description: 'เริ่มกลับมาขยับแขนขา เหงื่อเริ่มออก ไขมันเริ่มสะเทือน รักษาความต่อเนื่องไว้นะ!',
    emoji: '🏃‍♂️🐽',
    minWeekSessions: 1,
    minTotalSessions: 1,
    minStreakWeeks: 0,
  },
  3: {
    level: 3,
    titleTh: 'หมูตื่นตัวเข้าที่',
    titleEn: 'Active Piggy',
    subtitle: 'ซ้อม 2 ครั้ง/สัปดาห์ กล้ามเนื้อเริ่มจำฟอร์ม 🎯',
    bodyFatLabel: '~30% Body Fat',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    borderGlow: 'shadow-amber-100/60 border-amber-200',
    description: 'ฟอร์มเริ่มเข้าที่ เริ่มชอบความรู้สึกปวดตึงกล้ามเนื้อหลังซ้อมแล้วสิ!',
    emoji: '🎯🐷',
    minWeekSessions: 2,
    minTotalSessions: 3,
    minStreakWeeks: 0,
  },
  4: {
    level: 4,
    titleTh: 'หมูฟิตเริ่มมีวินัย',
    titleEn: 'Gym Regular',
    subtitle: 'ซ้อม 3 ครั้ง/สัปดาห์ หุ่นเริ่มเปลี่ยนชัด ⚡',
    bodyFatLabel: '~26% Body Fat',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    borderGlow: 'shadow-yellow-100/60 border-yellow-200',
    description: 'เริ่มมีวินัยเข้ายิมสม่ำเสมอ พุงเริ่มยุบ ก้นกับไหล่เริ่มมา!',
    emoji: '⚡💪',
    minWeekSessions: 3,
    minTotalSessions: 6,
    minStreakWeeks: 1,
  },
  5: {
    level: 5,
    titleTh: 'หมูกระชับสมส่วน',
    titleEn: 'Toned & Fit',
    subtitle: 'ซ้อม 3-4 ครั้ง + ต่อเนื่อง 2 สัปดาห์ 🔥',
    bodyFatLabel: '~22% Body Fat',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-200',
    borderGlow: 'shadow-lime-100/60 border-lime-200',
    description: 'หุ่นลีนสวย กล้ามเนื้อกระชับชัดเจน ความฟิตพุ่งพรวด หมูตัวนี้ไม่ธรรมดาแล้ว!',
    emoji: '✨🐷',
    minWeekSessions: 3,
    minTotalSessions: 10,
    minStreakWeeks: 2,
  },
  6: {
    level: 6,
    titleTh: 'หมูนักกีฬาพันธุ์แกร่ง',
    titleEn: 'Athletic Beast',
    subtitle: 'ซ้อม 4 ครั้ง/สัปดาห์ + ต่อเนื่อง 3 สัปดาห์ 🏋️‍♂️',
    bodyFatLabel: '~19% Body Fat',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderGlow: 'shadow-emerald-100/60 border-emerald-200',
    description: 'ยกหนักขึ้น อึดขึ้น ลีนขึ้น เริ่มมีลายกล้ามเนื้อชัดเจนในกระจก!',
    emoji: '🏋️‍♂️✨',
    minWeekSessions: 4,
    minTotalSessions: 15,
    minStreakWeeks: 3,
  },
  7: {
    level: 7,
    titleTh: 'หมูพลังม้ากล้ามแน่น',
    titleEn: 'Powerhouse Pig',
    subtitle: 'ซ้อม 4-5 ครั้ง/สัปดาห์ + ต่อเนื่อง 4 สัปดาห์ 💎',
    bodyFatLabel: '~16% Body Fat',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    borderGlow: 'shadow-cyan-100/60 border-cyan-200',
    description: 'กล้ามเนื้อระดับแอดวานซ์! พลังล้นเหลือ อกแน่น หลังกว้าง เอวคอด ก้นเด้ง!',
    emoji: '💎🔥',
    minWeekSessions: 4,
    minTotalSessions: 20,
    minStreakWeeks: 4,
  },
  8: {
    level: 8,
    titleTh: 'หมูลีนระดับโปร',
    titleEn: 'Iron Master',
    subtitle: 'ซ้อม 5 ครั้ง/สัปดาห์ + ต่อเนื่อง 5 สัปดาห์ 🏆',
    bodyFatLabel: '~14% Body Fat',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    borderGlow: 'shadow-sky-100/60 border-sky-200',
    description: 'ร่างระดับเทพแห่งการเพาะกาย! ร่องซิกแพกชัดเปรี๊ยะ กล้ามเนื้อทุกมัดคมกริบ!',
    emoji: '🏆✨',
    minWeekSessions: 5,
    minTotalSessions: 26,
    minStreakWeeks: 5,
  },
  9: {
    level: 9,
    titleTh: 'หมูซิกแพกทองคำ',
    titleEn: 'Gold 6-Pack Legend',
    subtitle: 'ซ้อม 5+ ครั้ง/สัปดาห์ + ต่อเนื่อง 6 สัปดาห์ 👑',
    bodyFatLabel: '~12% Body Fat',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    borderGlow: 'shadow-indigo-100/60 border-indigo-200',
    description: 'ตำนานหมูร่างทอง! วินัยเหล็กกล้า ไม่มีอะไรหยุดยั้งหมูตัวนี้ได้อีกต่อไป!',
    emoji: '👑🔥',
    minWeekSessions: 5,
    minTotalSessions: 32,
    minStreakWeeks: 6,
  },
  10: {
    level: 10,
    titleTh: 'มหาเทพหมูชาดร่างทอง',
    titleEn: 'Supreme Chad God',
    subtitle: 'ซ้อมต่อเนื่อง 8+ สัปดาห์ ร่างสุดยอดในจักรวาล 🌌',
    bodyFatLabel: '~10% Body Fat (God Mode)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    borderGlow: 'shadow-purple-200/80 border-purple-400 ring-2 ring-purple-300',
    description: 'สุดยอดมหาเทพหมูชาดแห่ง MooAuan! พลังระดับจักรวาล ซิกแพก 8 ลูก อกหนา ไหล่ 3D!',
    emoji: '🌌🏆💥',
    minWeekSessions: 5,
    minTotalSessions: 40,
    minStreakWeeks: 8,
  },
};

export interface PigEvolutionResult {
  level: PigEvolutionLevel;
  config: PigLevelConfig;
  recentWeekCount: number;
  past30DaysCount: number;
  totalCount: number;
  streakWeeks: number;
  streakDays: number;
  daysSinceLastWorkout: number;
  isDecaying: boolean;
  decayDaysLeft: number;
  decayWarningMsg?: string;
  nextLevelProgressPct: number;
  nextLevelRequirementText: string;
}

/**
 * Calculates dynamic level, streak, XP progress, and inactivity decay
 */
export function calculatePigEvolution(
  history: WorkoutSession[],
  activeWorkoutRunning: boolean = false
): PigEvolutionResult {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Unique dates of workouts sorted descending
  const workoutDates = Array.from(
    new Set(
      history
        .filter((s) => s.date && s.date <= todayStr)
        .map((s) => s.date)
    )
  ).sort((a, b) => b.localeCompare(a));

  const totalCount = history.length;

  // 7-day rolling count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];
  const recentWeekSessions = history.filter((s) => s.date >= sevenDaysStr);
  const recentWeekCount = recentWeekSessions.length + (activeWorkoutRunning ? 1 : 0);

  // 30-day rolling count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];
  const past30DaysCount = history.filter((s) => s.date >= thirtyDaysStr).length;

  // Days since last workout
  let daysSinceLastWorkout = 999;
  if (workoutDates.length > 0) {
    const lastDate = new Date(workoutDates[0]);
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    daysSinceLastWorkout = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } else if (activeWorkoutRunning) {
    daysSinceLastWorkout = 0;
  }

  // Calculate Streak in Days
  let streakDays = 0;
  let checkDate = new Date(now);
  if (activeWorkoutRunning) {
    streakDays = 1;
  }
  for (let i = 0; i < 60; i++) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (workoutDates.includes(dStr)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0 && !workoutDates.includes(dStr)) {
      // Today not yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Streak in Weeks (consecutive weeks with at least 2 workouts)
  let streakWeeks = 0;
  for (let w = 0; w < 12; w++) {
    const wStart = new Date(now);
    wStart.setDate(now.getDate() - (w + 1) * 7);
    const wEnd = new Date(now);
    wEnd.setDate(now.getDate() - w * 7);
    const wStartStr = wStart.toISOString().split('T')[0];
    const wEndStr = wEnd.toISOString().split('T')[0];

    const weekCount = history.filter((s) => s.date >= wStartStr && s.date <= wEndStr).length;
    if (weekCount >= 2 || (w === 0 && weekCount >= 1)) {
      streakWeeks++;
    } else {
      break;
    }
  }

  // Dynamic Level Evaluation
  let rawLevel: PigEvolutionLevel = 1;

  if (recentWeekCount >= 5 && streakWeeks >= 8 && past30DaysCount >= 18) {
    rawLevel = 10;
  } else if (recentWeekCount >= 5 && streakWeeks >= 6 && past30DaysCount >= 15) {
    rawLevel = 9;
  } else if (recentWeekCount >= 4 && streakWeeks >= 5 && past30DaysCount >= 12) {
    rawLevel = 8;
  } else if (recentWeekCount >= 4 && streakWeeks >= 4 && past30DaysCount >= 10) {
    rawLevel = 7;
  } else if (recentWeekCount >= 4 && streakWeeks >= 3) {
    rawLevel = 6;
  } else if (recentWeekCount >= 3 && streakWeeks >= 2) {
    rawLevel = 5;
  } else if (recentWeekCount >= 3) {
    rawLevel = 4;
  } else if (recentWeekCount >= 2) {
    rawLevel = 3;
  } else if (recentWeekCount >= 1) {
    rawLevel = 2;
  } else {
    rawLevel = 1;
  }

  // Dynamic Inactivity Decay:
  // If user hasn't worked out in > 7 days, reduce level by 1 for every 5 days inactive
  let finalLevel = rawLevel;
  let isDecaying = false;
  let decayWarningMsg: string | undefined = undefined;
  const decayDaysLeft = Math.max(0, 7 - daysSinceLastWorkout);

  if (daysSinceLastWorkout >= 7 && finalLevel > 1) {
    const penaltyLevels = Math.min(finalLevel - 1, Math.floor((daysSinceLastWorkout - 5) / 5));
    finalLevel = Math.max(1, (finalLevel - penaltyLevels) as PigEvolutionLevel) as PigEvolutionLevel;
    isDecaying = true;
    decayWarningMsg = `⚠️ ไม่ได้เข้ายิมมา ${daysSinceLastWorkout} วันแล้ว! เลเวลลดลงเหลือ Lv.${finalLevel} (รีบเข้ายิมด่วนเพื่อกู้เลเวล)`;
  } else if (daysSinceLastWorkout >= 5 && finalLevel > 1) {
    decayWarningMsg = `⏳ ไม่ได้เข้ายิมมา ${daysSinceLastWorkout} วันแล้ว! ระวังเลเวลตกในอีก ${decayDaysLeft} วัน`;
  }

  // Next level requirement progress
  const currentConfig = PIG_10_LEVELS[finalLevel];
  const nextLevel = Math.min(10, finalLevel + 1) as PigEvolutionLevel;
  const nextConfig = PIG_10_LEVELS[nextLevel];

  let nextLevelProgressPct = 100;
  let nextLevelRequirementText = 'เลเวลสูงสุดแล้ว! ร่างเทพสูงสุด 🏆';

  if (finalLevel < 10) {
    const neededWeek = nextConfig.minWeekSessions;
    const progressSessions = Math.min(1, recentWeekCount / Math.max(1, neededWeek));
    const progressStreak = Math.min(1, (streakWeeks + 1) / Math.max(1, nextConfig.minStreakWeeks + 1));
    nextLevelProgressPct = Math.round(((progressSessions * 0.7) + (progressStreak * 0.3)) * 100);
    const sessionsNeeded = Math.max(1, neededWeek - recentWeekCount);
    nextLevelRequirementText = `ซ้อมอีก ${sessionsNeeded} ครั้งในสัปดาห์นี้เพื่อขึ้น Lv.${nextLevel} (${nextConfig.titleTh})`;
  }

  return {
    level: finalLevel,
    config: currentConfig,
    recentWeekCount,
    past30DaysCount,
    totalCount,
    streakWeeks,
    streakDays,
    daysSinceLastWorkout,
    isDecaying,
    decayDaysLeft,
    decayWarningMsg,
    nextLevelProgressPct,
    nextLevelRequirementText,
  };
}

export type MascotSceneCondition = 'normal' | 'gym' | 'cardio_food' | 'night';

export interface MascotSceneInfo {
  sceneKey: MascotSceneCondition;
  imageSrc: string;
  label: string;
  badge: string;
  description: string;
}

/**
 * Returns the 4 background scene based on real-time activity and time
 */
export function getMascotScene(
  activeWorkoutRunning: boolean = false,
  todayFoodCount: number = 0,
  date: Date = new Date()
): MascotSceneInfo {
  const hour = date.getHours();

  // 1. Gym Workout Scene: If active workout running or started
  if (activeWorkoutRunning) {
    return {
      sceneKey: 'gym',
      imageSrc: './mascots/scene_gym_session.jpg',
      label: 'ในยิมฟิตเนส (Gym Session) 🏋️‍♂️',
      badge: 'กำลังยกเวทฟิตหุ่น 🔥',
      description: 'กำลังอยู่ในเซสชันการฝึก กำลังปั๊มกล้ามเนื้อให้แน่นเปรี๊ยะ!',
    };
  }

  // 2. Night Rest Scene: After 10:00 PM (22:00) to 05:00 AM
  if (hour >= 22 || hour < 5) {
    return {
      sceneKey: 'night',
      imageSrc: './mascots/scene_night_rest.jpg',
      label: 'ห้องนอนพักผ่อน (Night Rest) 🌙',
      badge: 'เวลาฟื้นฟูกล้ามเนื้อ 💤',
      description: 'หลัง 4 ทุ่มแล้ว เป็นเวลาพักผ่อนนอนหลับให้ร่างกายซ่อมแซมกล้ามเนื้อ',
    };
  }

  // 3. Cardio & Food Kitchen Scene: If food is logged today or cardio activity
  if (todayFoodCount > 0) {
    return {
      sceneKey: 'cardio_food',
      imageSrc: './mascots/scene_cardio_food.jpg',
      label: 'คาเฟ่ & ครัวโภชนาการ (Cardio & Food) 🥗',
      badge: 'เติมพลังงาน & คาร์ดิโอ 🍓',
      description: 'ทานอาหารครบโภชนาการและคาร์ดิโอเบิร์นไขมันสดชื่นแจ่มใส',
    };
  }

  // 4. Normal Day Scene: Default idle
  return {
    sceneKey: 'normal',
    imageSrc: './mascots/scene_normal_day.jpg',
    label: 'วันปกติสดใส (Cozy Day) ☀️',
    badge: 'พร้อมลุยทุกเป้าหมาย 🐽',
    description: 'วันสบายๆ ชิลๆ พร้อมออกไปสร้างหุ่นเฟิร์มกระชับ',
  };
}

export function getMascotGif(gender: 'male' | 'female', level: PigEvolutionLevel): string {
  const prefix = gender === 'female' ? 'manow' : 'magnum';
  return `./mascots/${prefix}_lv${level}.gif`;
}

export function getMascotPng(gender: 'male' | 'female', level: PigEvolutionLevel): string {
  const prefix = gender === 'female' ? 'manow' : 'magnum';
  return `./mascots/${prefix}_lv${level}.png`;
}

export function getUserAvatar(gender: 'male' | 'female' | 'primary' | 'partner'): string {
  const isFemale = gender === 'female' || gender === 'partner';
  return isFemale ? './mascots/manow_icon.png' : './mascots/magnum_icon.png';
}
