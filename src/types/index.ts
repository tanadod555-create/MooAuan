export type MuscleKey =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'lats'
  | 'lowback';

export type MovementPattern =
  | 'press'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'curl'
  | 'raise'
  | 'core'
  | 'calf';

export type ExerciseCategory = 'warmup' | 'cooldown' | 'strength';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MuscleInfo {
  key: MuscleKey;
  nameTh: string;
  latinName: string;
  submuscles: string[];
  view: 'front' | 'back' | 'both';
  description?: string;
}

export interface Exercise {
  exercise_id: string;
  name_en: string;
  name_th: string;
  category: ExerciseCategory;
  muscle_primary: MuscleKey;
  muscle_secondary?: MuscleKey[];
  pattern: MovementPattern;
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other';
  is_custom?: boolean;
  instructions?: string;
  technique?: string;
  feeling?: string;
  breathing?: string;
  mistakes?: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  avatar?: string;
  sex: 'male' | 'female' | 'other';
  birth_year: number;
  height_cm: number;
  goal: string;
  kcal_target: number;
  protein_target_g: number;
  carb_target_g?: number;
  fat_target_g?: number;
  created_at: string;
}

export interface BodyMetric {
  id?: string;
  date: string; // YYYY-MM-DD
  weight_kg: number;
  body_fat_pct?: number;
  waist_cm?: number;
  note?: string;
}

export interface ProgramItem {
  item_id?: string;
  program_id: string;
  order: number;
  exercise_id: string;
  target_sets: number;
  target_reps: number;
  target_weight_kg: number;
}

export interface Program {
  program_id: string;
  name: string;
  day_of_week?: string; // 'Monday', 'Leg Day', etc.
  note?: string;
  items?: ProgramItem[];
}

export interface WorkoutSet {
  set_id: string;
  session_id: string;
  exercise_id: string;
  set_no: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
  done: boolean;
  is_warmup?: boolean;
}

export interface WorkoutSession {
  session_id: string;
  date: string; // YYYY-MM-DD
  program_id?: string;
  program_name?: string;
  start_time: string; // HH:mm:ss or ISO
  end_time?: string;
  note?: string;
  sets?: WorkoutSet[];
}

export interface Micronutrients {
  vitC_mg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  potassium_mg?: number;
  [key: string]: number | undefined;
}

export interface FoodLog {
  log_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  meal: MealType;
  name: string;
  image_ref?: string;
  grams: number;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  micros?: Micronutrients;
  source: 'ai' | 'manual';
  confidence?: number;
}

export interface AppSettings {
  activeProfileKey: 'primary' | 'partner';
  googleClientId: string;
  googleAccessToken?: string;
  primarySpreadsheetId?: string;
  partnerSpreadsheetId?: string;
  appsScriptUrl?: string;
  geminiApiKey?: string;
  geminiProxyUrl?: string;
  useProxy?: boolean;
  autoSyncGoogleSheets: boolean;
}
