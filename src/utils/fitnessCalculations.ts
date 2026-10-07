import { WorkoutSession, WorkoutSet, MuscleKey } from '../types';

/**
 * 1RM (One-Rep Max) Calculation using Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 * For 1 rep, it returns the exact weight.
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  // Standard Epley Formula
  const oneRm = weightKg * (1 + reps / 30);
  return Math.round(oneRm * 10) / 10;
}

/**
 * Barbell Plate Calculator (Plate Math)
 * Given target weight and bar weight (default 20kg),
 * returns required plates for EACH side.
 */
export interface PlateCalculation {
  barWeight: number;
  perSideWeight: number;
  platesPerSide: { weight: number; count: number }[];
  exactMatch: boolean;
  totalCalculated: number;
}

export function calculateBarbellPlates(
  targetWeightKg: number,
  barWeightKg: number = 20,
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
): PlateCalculation {
  if (targetWeightKg <= barWeightKg) {
    return {
      barWeight: barWeightKg,
      perSideWeight: 0,
      platesPerSide: [],
      exactMatch: targetWeightKg === barWeightKg,
      totalCalculated: barWeightKg,
    };
  }

  let remainingPerSide = (targetWeightKg - barWeightKg) / 2;
  const targetPerSide = remainingPerSide;
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);
  const platesPerSide: { weight: number; count: number }[] = [];

  for (const plate of sortedPlates) {
    if (remainingPerSide >= plate) {
      const count = Math.floor(remainingPerSide / plate);
      platesPerSide.push({ weight: plate, count });
      remainingPerSide = Math.round((remainingPerSide - count * plate) * 100) / 100;
    }
  }

  const loadedPerSide = targetPerSide - remainingPerSide;
  const totalCalculated = barWeightKg + loadedPerSide * 2;

  return {
    barWeight: barWeightKg,
    perSideWeight: loadedPerSide,
    platesPerSide,
    exactMatch: remainingPerSide < 0.01,
    totalCalculated,
  };
}

/**
 * Finds the previous performance for a specific exercise from past history.
 * Looks for the most recent session that includes this exercise.
 */
export interface PreviousExercisePerformance {
  date: string;
  sessionName: string;
  sets: {
    set_no: number;
    weight_kg: number;
    reps: number;
    done: boolean;
    set_type?: string;
  }[];
  best1RM: number;
}

export function findPreviousExercisePerformance(
  exerciseId: string,
  history: WorkoutSession[]
): PreviousExercisePerformance | null {
  if (!history || history.length === 0) return null;

  for (const session of history) {
    if (!session.sets || session.sets.length === 0) continue;

    const matchedSets = session.sets.filter((s) => s.exercise_id === exerciseId && s.done);
    if (matchedSets.length > 0) {
      let max1RM = 0;
      matchedSets.forEach((s) => {
        const est = calculate1RM(s.weight_kg, s.reps);
        if (est > max1RM) max1RM = est;
      });

      return {
        date: session.date,
        sessionName: session.program_name || 'เซสชันก่อนหน้า',
        sets: matchedSets.map((s) => ({
          set_no: s.set_no,
          weight_kg: s.weight_kg,
          reps: s.reps,
          done: s.done,
          set_type: s.set_type,
        })),
        best1RM: max1RM,
      };
    }
  }

  return null;
}

/**
 * Finds all-time PR (Personal Record) for an exercise.
 */
export function findExercisePR(
  exerciseId: string,
  history: WorkoutSession[]
): { maxWeight: number; best1RM: number } {
  let maxWeight = 0;
  let best1RM = 0;

  if (!history) return { maxWeight: 0, best1RM: 0 };

  history.forEach((session) => {
    if (!session.sets) return;
    session.sets.forEach((s) => {
      if (s.exercise_id === exerciseId && s.done) {
        if (s.weight_kg > maxWeight) maxWeight = s.weight_kg;
        const est = calculate1RM(s.weight_kg, s.reps);
        if (est > best1RM) best1RM = est;
      }
    });
  });

  return { maxWeight, best1RM };
}

/**
 * Muscle recovery status calculation based on workout history in last 7 days.
 */
export type RecoveryLevel = 'fatigued' | 'recovering' | 'ready';

export interface MuscleRecoveryState {
  muscle: MuscleKey;
  label: string;
  daysAgo: number | null; // null means not trained in 7+ days
  level: RecoveryLevel;
  percentage: number; // 0 to 100% recovered
  lastTrainedDate?: string;
  totalSetsLast7Days: number;
}

const MUSCLE_RECOVERY_HOURS: Record<MuscleKey, number> = {
  chest: 48,
  lats: 48,
  traps: 48,
  lowback: 72,
  shoulders: 48,
  biceps: 36,
  triceps: 36,
  forearms: 36,
  abs: 24,
  quads: 72,
  hamstrings: 72,
  glutes: 48,
  calves: 36,
};

const MUSCLE_LABELS: Record<MuscleKey, string> = {
  chest: 'หน้าอก (Chest)',
  shoulders: 'หัวไหล่ (Shoulders)',
  biceps: 'หน้าแขน (Biceps)',
  triceps: 'หลังแขน (Triceps)',
  forearms: 'ปลายแขน (Forearms)',
  abs: 'หน้าท้อง (Core/Abs)',
  quads: 'ต้นขาหน้า (Quads)',
  hamstrings: 'ต้นขาหลัง (Hamstrings)',
  glutes: 'บั้นท้าย/ก้น (Glutes)',
  calves: 'น่อง (Calves)',
  traps: 'บ่า (Traps)',
  lats: 'ปีก/หลังส่วนบน (Lats)',
  lowback: 'หลังส่วนล่าง (Lower Back)',
};

export function calculateMuscleRecoveryStates(
  history: WorkoutSession[],
  exerciseMuscleMap: Record<string, MuscleKey>
): Record<MuscleKey, MuscleRecoveryState> {
  const result: Partial<Record<MuscleKey, MuscleRecoveryState>> = {};
  const now = new Date();

  const allMuscles: MuscleKey[] = [
    'chest',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'abs',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
    'traps',
    'lats',
    'lowback',
  ];

  // Initialize
  allMuscles.forEach((m) => {
    result[m] = {
      muscle: m,
      label: MUSCLE_LABELS[m],
      daysAgo: null,
      level: 'ready',
      percentage: 100,
      totalSetsLast7Days: 0,
    };
  });

  if (!history || history.length === 0) {
    return result as Record<MuscleKey, MuscleRecoveryState>;
  }

  // Iterate over history to find the most recent training date and sets volume for each muscle
  history.forEach((session) => {
    if (!session.sets || !session.date) return;
    const sessionDate = new Date(session.date + 'T12:00:00');
    const diffHours = Math.max(0, (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return; // Only care about last 7 days

    session.sets.forEach((set) => {
      if (!set.done) return;
      const muscle = exerciseMuscleMap[set.exercise_id];
      if (muscle && result[muscle]) {
        result[muscle]!.totalSetsLast7Days += 1;

        if (result[muscle]!.daysAgo === null || diffDays < result[muscle]!.daysAgo!) {
          result[muscle]!.daysAgo = diffDays;
          result[muscle]!.lastTrainedDate = session.date;

          const recHoursNeeded = MUSCLE_RECOVERY_HOURS[muscle] || 48;
          const pct = Math.min(100, Math.round((diffHours / recHoursNeeded) * 100));
          result[muscle]!.percentage = pct;

          if (diffHours < 24) {
            result[muscle]!.level = 'fatigued';
          } else if (diffHours < recHoursNeeded) {
            result[muscle]!.level = 'recovering';
          } else {
            result[muscle]!.level = 'ready';
          }
        }
      }
    });
  });

  return result as Record<MuscleKey, MuscleRecoveryState>;
}
