import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  Exercise,
  WorkoutSession,
  WorkoutSet,
  CardioActivity,
  CardioType,
  FoodLog,
  BodyMetric,
  Program,
  AppSettings,
  FirebaseConfig,
} from '../types';
import { SEED_EXERCISES } from '../data/exercises';
import { PREDEFINED_FOODS, PredefinedFood } from '../data/foodDatabase';
import { GoogleSheetsService } from '../services/googleSheets';
import { getDefaultGeminiApiKey } from '../services/gemini';
import {
  initFirebase,
  getFirestoreInstance,
  subscribeToFoodLogs,
  subscribeToWorkoutHistory,
  subscribeToBodyMetrics,
  subscribeToCustomExercises,
  subscribeToProfiles,
  cloudSaveFoodLog,
  cloudDeleteFoodLog,
  cloudSaveWorkout,
  cloudDeleteWorkout,
  cloudSaveBodyMetric,
  cloudDeleteBodyMetric,
  cloudSaveCustomExercise,
  cloudSaveProfile,
  migrateAllDataToCloud,
} from '../services/firebase';
import { Firestore, doc, getDoc } from 'firebase/firestore';


export interface ActiveWorkoutExercise {
  exercise_id: string;
  note?: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  session_id: string;
  name: string;
  start_time: string;
  elapsedSeconds: number;
  note?: string;
  cardio?: CardioActivity[];
  exercises: ActiveWorkoutExercise[];
}

interface AppContextType {
  activeProfileKey: 'primary' | 'partner';
  setActiveProfileKey: (key: 'primary' | 'partner') => void;
  currentProfile: UserProfile;
  primaryProfile: UserProfile;
  partnerProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>, isPartner?: boolean) => void;
  
  exercises: Exercise[];
  addCustomExercise: (exercise: Exercise) => void;

  activeWorkout: ActiveWorkout | null;
  startWorkout: (name?: string, initialExercises?: Exercise[]) => void;
  startCardioSession: (name?: string, defaultType?: CardioType) => void;
  cancelWorkout: () => void;
  finishWorkout: () => Promise<void>;
  setSessionNote: (note: string) => void;
  setExerciseNote: (exercise_id: string, note: string) => void;
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exercise_id: string) => void;
  addSetToExercise: (exercise_id: string) => void;
  removeSetFromExercise: (exercise_id: string, setIndex: number) => void;
  updateSet: (exercise_id: string, setIndex: number, updates: Partial<WorkoutSet>) => void;
  addCardioToWorkout: (cardio: CardioActivity) => void;
  updateCardioInWorkout: (cardioIndex: number, updates: Partial<CardioActivity>) => void;
  removeCardioFromWorkout: (cardioIndex: number) => void;

  workoutHistory: WorkoutSession[];
  allWorkoutHistory: WorkoutSession[];
  deleteWorkoutSession: (sessionId: string) => void;
  
  foodLogs: FoodLog[];
  allFoodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, 'log_id'>) => Promise<void>;
  updateFoodLog: (log_id: string, updates: Partial<FoodLog>) => Promise<void>;
  deleteFoodLog: (log_id: string) => void;
  
  bodyMetrics: BodyMetric[];
  allBodyMetrics: BodyMetric[];
  addBodyMetric: (metric: Omit<BodyMetric, 'id'>) => Promise<void>;
  deleteBodyMetric: (metricIdOrDate: string) => void;
  clearAllBodyMetrics: () => void;

  programs: Program[];
  addProgram: (program: Program) => void;
  updateProgram: (programId: string, updates: Partial<Program>) => void;
  deleteProgram: (programId: string) => void;
  resetProgramsToDefault: () => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  isSyncing: boolean;
  sheetsService: GoogleSheetsService;
  syncAllToGoogleSheets: () => Promise<{ success: boolean; message: string }>;
  syncFoodDatabaseToSheets: (foods?: PredefinedFood[]) => Promise<{ success: boolean; message: string }>;
  unifiedSpreadsheetUrl: string;
  openUnifiedSpreadsheet: () => void;

  // Real-time Cloud (Firebase Firestore)
  isFirebaseConnected: boolean;
  firebaseError: string | null;
  migrateLocalDataToFirebase: (onProgress?: (msg: string) => void) => Promise<{ success: boolean; count: number }>;
  testFirebaseConnection: (config?: FirebaseConfig) => Promise<{ success: boolean; message: string }>;
}


const DEFAULT_PRIMARY_PROFILE: UserProfile = {
  user_id: 'user_primary',
  email: 'magnum@example.com',
  name: 'แม็กนั่ม (Magnum)',
  sex: 'male',
  birth_year: 1998,
  height_cm: 175,
  goal: 'Hypertrophy & Strength (สร้างกล้ามเนื้อ)',
  kcal_target: 2400,
  protein_target_g: 150,
  carb_target_g: 270,
  fat_target_g: 70,
  waist_cm: 79,
  chest_cm: 102,
  shoulders_cm: 118,
  thigh_cm: 58,
  hips_cm: 94,
  arm_cm: 36,
  calf_cm: 37,
  neck_cm: 38,
  created_at: new Date().toISOString(),
};

const DEFAULT_PARTNER_PROFILE: UserProfile = {
  user_id: 'user_partner',
  email: 'manao@example.com',
  name: 'มะนาว (Manow)',
  sex: 'female',
  birth_year: 2000,
  height_cm: 162,
  goal: 'Toning & Healthy (หุ่นกระชับ & สุขภาพ)',
  kcal_target: 1750,
  protein_target_g: 110,
  carb_target_g: 190,
  fat_target_g: 50,
  waist_cm: 63,
  chest_cm: 82,
  shoulders_cm: 95,
  thigh_cm: 51,
  hips_cm: 92,
  arm_cm: 25,
  calf_cm: 32,
  neck_cm: 31,
  created_at: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  activeProfileKey: 'primary',
  googleClientId: '',
  googleAccessToken: '',
  primarySpreadsheetId: '1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A',
  partnerSpreadsheetId: '1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A',
  appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwueoU7u4P84GwE2PXeAlp_c3iEGE9UFGeWcJmxuOt_BxKXd3tGWQbzJ7DBnT6C1gN7/exec',
  geminiApiKey: getDefaultGeminiApiKey(),
  geminiProxyUrl: '',
  useProxy: false,
  autoSyncGoogleSheets: false,
};

const DEFAULT_PROGRAMS: Program[] = [
  {
    program_id: 'prog_mon_push_quad',
    name: 'จันทร์ — Push + Quad',
    day_of_week: 'จันทร์',
    note: 'เป้าหมาย 60kg: อยากตัวใหญ่ขึ้น / อกเต็ม / ไหล่แน่น / แขนใหญ่',
    items: [
      { program_id: 'prog_mon_push_quad', order: 1, exercise_id: 'ex_machine_incline_press', target_sets: 3, target_reps: 8, target_weight_kg: 40 },
      { program_id: 'prog_mon_push_quad', order: 2, exercise_id: 'ex_machine_chest_press', target_sets: 3, target_reps: 10, target_weight_kg: 45 },
      { program_id: 'prog_mon_push_quad', order: 3, exercise_id: 'ex_machine_shoulder_press', target_sets: 3, target_reps: 10, target_weight_kg: 35 },
      { program_id: 'prog_mon_push_quad', order: 4, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, target_weight_kg: 10 },
      { program_id: 'prog_mon_push_quad', order: 5, exercise_id: 'ex_leg_extension', target_sets: 3, target_reps: 12, target_weight_kg: 45 },
      { program_id: 'prog_mon_push_quad', order: 6, exercise_id: 'ex_db_overhead_triceps_ext', target_sets: 3, target_reps: 12, target_weight_kg: 14 },
    ]
  },
  {
    program_id: 'prog_tue_pull_ham',
    name: 'อังคาร — Pull + Hamstring',
    day_of_week: 'อังคาร',
    note: 'เน้นความกว้างหลัง ความหนา และต้นขาหลัง (*ถ้าคอนโดไม่มี Leg Curl ใช้ RDL/ท่าอื่นแทนได้)',
    items: [
      { program_id: 'prog_tue_pull_ham', order: 1, exercise_id: 'ex_lat_pulldown', target_sets: 3, target_reps: 10, target_weight_kg: 50 },
      { program_id: 'prog_tue_pull_ham', order: 2, exercise_id: 'ex_seated_cable_row', target_sets: 3, target_reps: 10, target_weight_kg: 45 },
      { program_id: 'prog_tue_pull_ham', order: 3, exercise_id: 'ex_db_romanian_deadlift', target_sets: 3, target_reps: 10, target_weight_kg: 24 },
      { program_id: 'prog_tue_pull_ham', order: 4, exercise_id: 'ex_lying_leg_curl', target_sets: 3, target_reps: 12, target_weight_kg: 35 },
      { program_id: 'prog_tue_pull_ham', order: 5, exercise_id: 'ex_db_biceps_curl', target_sets: 3, target_reps: 10, target_weight_kg: 12 },
      { program_id: 'prog_tue_pull_ham', order: 6, exercise_id: 'ex_hammer_curl', target_sets: 3, target_reps: 12, target_weight_kg: 12 },
    ]
  },
  {
    program_id: 'prog_thu_legs_shoulder',
    name: 'พฤหัส — Legs + Shoulder',
    day_of_week: 'พฤหัสบดี',
    note: 'สร้างฐานขาและหัวไหล่ 3 มิติ (หน้า-ข้าง-หลัง)',
    items: [
      { program_id: 'prog_thu_legs_shoulder', order: 1, exercise_id: 'ex_leg_press', target_sets: 3, target_reps: 10, target_weight_kg: 80 },
      { program_id: 'prog_thu_legs_shoulder', order: 2, exercise_id: 'ex_db_romanian_deadlift', target_sets: 3, target_reps: 10, target_weight_kg: 24 },
      { program_id: 'prog_thu_legs_shoulder', order: 3, exercise_id: 'ex_leg_extension', target_sets: 3, target_reps: 12, target_weight_kg: 45 },
      { program_id: 'prog_thu_legs_shoulder', order: 4, exercise_id: 'ex_machine_shoulder_press', target_sets: 3, target_reps: 10, target_weight_kg: 35 },
      { program_id: 'prog_thu_legs_shoulder', order: 5, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, target_weight_kg: 10 },
      { program_id: 'prog_thu_legs_shoulder', order: 6, exercise_id: 'ex_db_rear_delt_fly', target_sets: 3, target_reps: 15, target_weight_kg: 8 },
    ]
  },
  {
    program_id: 'prog_fri_upper_arms',
    name: 'ศุกร์ — Upper + Arms (วันสำคัญมาก 🔥)',
    day_of_week: 'ศุกร์',
    note: 'วันที่สำคัญมากสำหรับคุณ! เน้นอกบน หลัง แขน และไหล่',
    items: [
      { program_id: 'prog_fri_upper_arms', order: 1, exercise_id: 'ex_machine_incline_press', target_sets: 3, target_reps: 8, target_weight_kg: 40 },
      { program_id: 'prog_fri_upper_arms', order: 2, exercise_id: 'ex_machine_chest_press', target_sets: 3, target_reps: 10, target_weight_kg: 45 },
      { program_id: 'prog_fri_upper_arms', order: 3, exercise_id: 'ex_lat_pulldown', target_sets: 3, target_reps: 10, target_weight_kg: 50 },
      { program_id: 'prog_fri_upper_arms', order: 4, exercise_id: 'ex_seated_cable_row', target_sets: 3, target_reps: 10, target_weight_kg: 45 },
      { program_id: 'prog_fri_upper_arms', order: 5, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, target_weight_kg: 10 },
      { program_id: 'prog_fri_upper_arms', order: 6, exercise_id: 'ex_db_biceps_curl', target_sets: 3, target_reps: 10, target_weight_kg: 12 },
      { program_id: 'prog_fri_upper_arms', order: 7, exercise_id: 'ex_db_overhead_triceps_ext', target_sets: 3, target_reps: 12, target_weight_kg: 14 },
    ]
  },
  {
    program_id: 'prog_sat_arms_shoulder_optional',
    name: 'เสาร์ — Optional (แขน + ไหล่ Pump ⭐)',
    day_of_week: 'เสาร์',
    note: 'ถ้ารู้สึกสด เล่นแขน + ไหล่ เพิ่มได้เพื่อเพิ่ม volume ให้แขนและไหล่ แต่ถ้าเหนื่อยให้พักได้เลย',
    items: [
      { program_id: 'prog_sat_arms_shoulder_optional', order: 1, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 18, target_weight_kg: 8 },
      { program_id: 'prog_sat_arms_shoulder_optional', order: 2, exercise_id: 'ex_db_rear_delt_fly', target_sets: 3, target_reps: 18, target_weight_kg: 8 },
      { program_id: 'prog_sat_arms_shoulder_optional', order: 3, exercise_id: 'ex_db_biceps_curl', target_sets: 3, target_reps: 12, target_weight_kg: 10 },
      { program_id: 'prog_sat_arms_shoulder_optional', order: 4, exercise_id: 'ex_hammer_curl', target_sets: 3, target_reps: 12, target_weight_kg: 10 },
      { program_id: 'prog_sat_arms_shoulder_optional', order: 5, exercise_id: 'ex_db_overhead_triceps_ext', target_sets: 3, target_reps: 12, target_weight_kg: 12 },
    ]
  }
];

const DEFAULT_PARTNER_PROGRAMS: Program[] = [
  {
    program_id: 'prog_glute_ham',
    name: 'Glute & Hamstring Focus (ปั้นก้นกลม & ต้นขาหลัง)',
    day_of_week: 'จันทร์',
    note: 'เน้น Hip Thrust และ RDL โฟกัสบีบก้นช้าๆ คุมเวลาพัก',
    items: [
      { program_id: 'prog_glute_ham', order: 1, exercise_id: 'ex_hip_thrust', target_sets: 4, target_reps: 12, target_weight_kg: 35 },
      { program_id: 'prog_glute_ham', order: 2, exercise_id: 'ex_romanian_deadlift', target_sets: 4, target_reps: 10, target_weight_kg: 30 },
      { program_id: 'prog_glute_ham', order: 3, exercise_id: 'ex_bulgarian_split_squat', target_sets: 3, target_reps: 10, target_weight_kg: 8 },
      { program_id: 'prog_glute_ham', order: 4, exercise_id: 'ex_lying_leg_curl', target_sets: 3, target_reps: 12, target_weight_kg: 20 },
      { program_id: 'prog_glute_ham', order: 5, exercise_id: 'ex_hip_abduction', target_sets: 3, target_reps: 15, target_weight_kg: 25 },
    ]
  },
  {
    program_id: 'prog_upper_tone',
    name: 'Upper Body & Core Toning (หลังกระชับ ไหล่สวย & เอวเอส)',
    day_of_week: 'พุธ',
    note: 'เน้นปีกหลังและไหล่ข้าง ปรับบุคลิกภาพสง่างาม ลดไขมันหลังแขน',
    items: [
      { program_id: 'prog_upper_tone', order: 1, exercise_id: 'ex_lat_pulldown', target_sets: 4, target_reps: 10, target_weight_kg: 25 },
      { program_id: 'prog_upper_tone', order: 2, exercise_id: 'ex_incline_db_press', target_sets: 3, target_reps: 10, target_weight_kg: 8 },
      { program_id: 'prog_upper_tone', order: 3, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, target_weight_kg: 4 },
      { program_id: 'prog_upper_tone', order: 4, exercise_id: 'ex_face_pull', target_sets: 3, target_reps: 15, target_weight_kg: 15 },
      { program_id: 'prog_upper_tone', order: 5, exercise_id: 'ex_hanging_leg_raise', target_sets: 3, target_reps: 12, target_weight_kg: 0 },
    ]
  },
  {
    program_id: 'prog_glute_pump',
    name: 'Glute Pump & Quad Shape (ก้นเด้ง & ขาเพรียวกระชับ)',
    day_of_week: 'ศุกร์',
    note: 'เน้นซูโม่สควอท ขาใน และเคเบิลคิกแบ็กเน้นก้นบน',
    items: [
      { program_id: 'prog_glute_pump', order: 1, exercise_id: 'ex_db_sumo_squat', target_sets: 4, target_reps: 12, target_weight_kg: 16 },
      { program_id: 'prog_glute_pump', order: 2, exercise_id: 'ex_leg_press', target_sets: 3, target_reps: 12, target_weight_kg: 50 },
      { program_id: 'prog_glute_pump', order: 3, exercise_id: 'ex_cable_kickback', target_sets: 3, target_reps: 15, target_weight_kg: 10 },
      { program_id: 'prog_glute_pump', order: 4, exercise_id: 'ex_romanian_deadlift', target_sets: 3, target_reps: 12, target_weight_kg: 25 },
      { program_id: 'prog_glute_pump', order: 5, exercise_id: 'ex_hip_abduction', target_sets: 3, target_reps: 20, target_weight_kg: 20 },
    ]
  }
];

const DEFAULT_WORKOUT_HISTORY: WorkoutSession[] = [
  {
    session_id: 'hist_manao_1',
    user_id: 'partner',
    user_name: 'มะนาว (Manow)',
    date: '2026-09-30',
    program_name: 'Glute & Hamstring Focus (ปั้นก้นกลม & ต้นขาหลัง)',
    start_time: '17:30',
    end_time: '18:45',
    note: 'เน้นโฟกัสบีบก้นช้าๆ คุมเวลาพัก 90 วินาที ฟีลก้นดีมาก',
    sets: [
      {
        set_id: 's_m1',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_hip_thrust',
        exercise_name: 'บาร์เบล ฮิปทรัสต์ (Barbell Hip Thrust)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 35,
        reps: 12,
        done: true,
      },
      {
        set_id: 's_m2',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_hip_thrust',
        exercise_name: 'บาร์เบล ฮิปทรัสต์ (Barbell Hip Thrust)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 40,
        reps: 12,
        done: true,
      },
      {
        set_id: 's_m3',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_hip_thrust',
        exercise_name: 'บาร์เบล ฮิปทรัสต์ (Barbell Hip Thrust)',
        user_name: 'มะนาว (Manow)',
        set_no: 3,
        weight_kg: 45,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_m4',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_romanian_deadlift',
        exercise_name: 'โรมาเนียน เดดลิฟต์ (Romanian Deadlift)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 30,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_m5',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_romanian_deadlift',
        exercise_name: 'โรมาเนียน เดดลิฟต์ (Romanian Deadlift)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 35,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_m6',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_bulgarian_split_squat',
        exercise_name: 'บัลแกเรียน สปลิท สควอท (Bulgarian Split Squat)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 8,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_m7',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_bulgarian_split_squat',
        exercise_name: 'บัลแกเรียน สปลิท สควอท (Bulgarian Split Squat)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 8,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_m8',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_hip_abduction',
        exercise_name: 'แมชชีน ฮิปแอบดักชัน (Hip Abduction Machine)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 30,
        reps: 15,
        done: true,
      },
      {
        set_id: 's_m9',
        session_id: 'hist_manao_1',
        exercise_id: 'ex_hip_abduction',
        exercise_name: 'แมชชีน ฮิปแอบดักชัน (Hip Abduction Machine)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 35,
        reps: 15,
        done: true,
      }
    ]
  },
  {
    session_id: 'hist_magnum_1',
    user_id: 'primary',
    user_name: 'แม็กนั่ม (Magnum)',
    date: '2026-09-29',
    program_name: 'Push Day (อก ไหล่ หลังแขน)',
    start_time: '18:15',
    end_time: '19:35',
    note: 'บาร์เบลเบนช์เพรสดันได้ดี ฟอร์มกระชับ อกบนตึงเปรี๊ยะ',
    sets: [
      {
        set_id: 's_p1',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_bench_press',
        exercise_name: 'บาร์เบล เบนช์เพรส (Barbell Bench Press)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 1,
        weight_kg: 60,
        reps: 8,
        done: true,
      },
      {
        set_id: 's_p2',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_bench_press',
        exercise_name: 'บาร์เบล เบนช์เพรส (Barbell Bench Press)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 2,
        weight_kg: 70,
        reps: 8,
        done: true,
      },
      {
        set_id: 's_p3',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_bench_press',
        exercise_name: 'บาร์เบล เบนช์เพรส (Barbell Bench Press)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 3,
        weight_kg: 75,
        reps: 6,
        done: true,
      },
      {
        set_id: 's_p4',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_incline_db_press',
        exercise_name: 'อินไคลน์ ดัมเบลล์ เพรส (Incline Dumbbell Press)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 1,
        weight_kg: 22,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_p5',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_incline_db_press',
        exercise_name: 'อินไคลน์ ดัมเบลล์ เพรส (Incline Dumbbell Press)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 2,
        weight_kg: 24,
        reps: 8,
        done: true,
      },
      {
        set_id: 's_p6',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_lateral_raise',
        exercise_name: 'ดัมเบลล์ แลทเทอรัล เรส (Dumbbell Lateral Raise)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 1,
        weight_kg: 10,
        reps: 12,
        done: true,
      },
      {
        set_id: 's_p7',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_lateral_raise',
        exercise_name: 'ดัมเบลล์ แลทเทอรัล เรส (Dumbbell Lateral Raise)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 2,
        weight_kg: 12,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_p8',
        session_id: 'hist_magnum_1',
        exercise_id: 'ex_tricep_rope_pushdown',
        exercise_name: 'ไตรเซป โรป พุชดาวน์ (Tricep Rope Pushdown)',
        user_name: 'แม็กนั่ม (Magnum)',
        set_no: 1,
        weight_kg: 25,
        reps: 12,
        done: true,
      }
    ]
  },
  {
    session_id: 'hist_manao_2',
    user_id: 'partner',
    user_name: 'มะนาว (Manow)',
    date: '2026-09-27',
    program_name: 'Upper Body & Core Toning (หลังกระชับ ไหล่สวย & เอวเอส)',
    start_time: '18:00',
    end_time: '19:05',
    note: 'ดึงหลังโฟกัสบีบปีก ไหล่กลมสวย กระชับแขน',
    sets: [
      {
        set_id: 's_u1',
        session_id: 'hist_manao_2',
        exercise_id: 'ex_lat_pulldown',
        exercise_name: 'แลท พูลดาวน์ (Lat Pulldown)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 25,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_u2',
        session_id: 'hist_manao_2',
        exercise_id: 'ex_lat_pulldown',
        exercise_name: 'แลท พูลดาวน์ (Lat Pulldown)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 30,
        reps: 10,
        done: true,
      },
      {
        set_id: 's_u3',
        session_id: 'hist_manao_2',
        exercise_id: 'ex_lateral_raise',
        exercise_name: 'ดัมเบลล์ แลทเทอรัล เรส (Dumbbell Lateral Raise)',
        user_name: 'มะนาว (Manow)',
        set_no: 1,
        weight_kg: 4,
        reps: 15,
        done: true,
      },
      {
        set_id: 's_u4',
        session_id: 'hist_manao_2',
        exercise_id: 'ex_lateral_raise',
        exercise_name: 'ดัมเบลล์ แลทเทอรัล เรส (Dumbbell Lateral Raise)',
        user_name: 'มะนาว (Manow)',
        set_no: 2,
        weight_kg: 4,
        reps: 15,
        done: true,
      }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles
  const [activeProfileKey, setActiveProfileKey] = useState<'primary' | 'partner'>(() => {
    return (localStorage.getItem('ft_active_profile') as 'primary' | 'partner') || 'primary';
  });

  const [primaryProfile, setPrimaryProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ft_profile_primary');
    if (!saved) return DEFAULT_PRIMARY_PROFILE;
    try {
      const p = JSON.parse(saved);
      if (p.name === 'Me (Trainer)' || !p.name) p.name = DEFAULT_PRIMARY_PROFILE.name;
      return p;
    } catch {
      return DEFAULT_PRIMARY_PROFILE;
    }
  });

  const [partnerProfile, setPartnerProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ft_profile_partner');
    if (!saved) return DEFAULT_PARTNER_PROFILE;
    try {
      const p = JSON.parse(saved);
      if (p.name === 'แฟน (Babe)' || !p.name) p.name = DEFAULT_PARTNER_PROFILE.name;
      return p;
    } catch {
      return DEFAULT_PARTNER_PROFILE;
    }
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ft_settings');
    const defaultKey = getDefaultGeminiApiKey();
    if (!saved) {
      if (typeof window !== 'undefined' && defaultKey) {
        localStorage.setItem('fittrack_gemini_key', defaultKey);
      }
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.geminiApiKey || parsed.geminiApiKey.trim() === '') {
        parsed.geminiApiKey = defaultKey;
      }
      if (!parsed.appsScriptUrl) {
        parsed.appsScriptUrl = DEFAULT_SETTINGS.appsScriptUrl;
      }
      if (!parsed.primarySpreadsheetId) {
        parsed.primarySpreadsheetId = DEFAULT_SETTINGS.primarySpreadsheetId;
      }
      if (typeof window !== 'undefined' && parsed.geminiApiKey) {
        localStorage.setItem('fittrack_gemini_key', parsed.geminiApiKey);
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('ft_custom_exercises');
    const customList: Exercise[] = saved ? JSON.parse(saved) : [];
    return [...SEED_EXERCISES, ...customList];
  });

  // Programs
  const [programs, setPrograms] = useState<Program[]>(() => {
    const v = localStorage.getItem('ft_programs_version');
    if (v !== 'v2_magnum') {
      localStorage.setItem('ft_programs_version', 'v2_magnum');
      localStorage.setItem('ft_programs_primary', JSON.stringify(DEFAULT_PROGRAMS));
      return activeProfileKey === 'partner' ? DEFAULT_PARTNER_PROGRAMS : DEFAULT_PROGRAMS;
    }
    const saved = localStorage.getItem(`ft_programs_${activeProfileKey}`);
    if (saved) return JSON.parse(saved);
    return activeProfileKey === 'partner' ? DEFAULT_PARTNER_PROGRAMS : DEFAULT_PROGRAMS;
  });

  // Unified Food Logs (Combined for Magnum & Manow)
  const [allFoodLogs, setAllFoodLogs] = useState<FoodLog[]>(() => {
    const savedUnified = localStorage.getItem('ft_food_logs_unified');
    if (savedUnified) {
      try { return JSON.parse(savedUnified); } catch {}
    }
    const primarySaved = localStorage.getItem('ft_food_logs_primary');
    const partnerSaved = localStorage.getItem('ft_food_logs_partner');
    const primaryLogs: FoodLog[] = primarySaved ? JSON.parse(primarySaved) : [];
    const partnerLogs: FoodLog[] = partnerSaved ? JSON.parse(partnerSaved) : [];
    return [
      ...primaryLogs.map(l => ({ ...l, user_id: 'primary', user_name: 'แม็กนั่ม (Magnum)' })),
      ...partnerLogs.map(l => ({ ...l, user_id: 'partner', user_name: 'มะนาว (Manow)' }))
    ];
  });

  const foodLogs = allFoodLogs.filter(l => (l.user_id || 'primary') === activeProfileKey);

  // Unified Body Metrics (Combined for Magnum & Manow)
  const [allBodyMetrics, setAllBodyMetrics] = useState<BodyMetric[]>(() => {
    // Migration: One-time clearing of legacy/mock body metrics as requested
    const cleared = localStorage.getItem('ft_metrics_cleared_v2');
    if (!cleared) {
      localStorage.setItem('ft_metrics_cleared_v2', 'true');
      localStorage.removeItem('ft_metrics_unified');
      localStorage.removeItem('ft_metrics_primary');
      localStorage.removeItem('ft_metrics_partner');
      return [];
    }
    const savedUnified = localStorage.getItem('ft_metrics_unified');
    if (savedUnified) {
      try {
        return JSON.parse(savedUnified);
      } catch {}
    }
    return [];
  });

  const bodyMetrics = allBodyMetrics.filter(m => (m.user_id || 'primary') === activeProfileKey);

  // Unified Workout History (Combined for Magnum & Manow)
  const [allWorkoutHistory, setAllWorkoutHistory] = useState<WorkoutSession[]>(() => {
    const savedUnified = localStorage.getItem('ft_history_unified');
    if (savedUnified) {
      try {
        const parsed = JSON.parse(savedUnified);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const primarySaved = localStorage.getItem('ft_history_primary');
    const partnerSaved = localStorage.getItem('ft_history_partner');
    const primaryH: WorkoutSession[] = primarySaved ? JSON.parse(primarySaved) : [];
    const partnerH: WorkoutSession[] = partnerSaved ? JSON.parse(partnerSaved) : [];
    if (primaryH.length > 0 || partnerH.length > 0) {
      return [
        ...primaryH.map(s => ({ ...s, user_id: 'primary', user_name: 'แม็กนั่ม (Magnum)' })),
        ...partnerH.map(s => ({ ...s, user_id: 'partner', user_name: 'มะนาว (Manow)' }))
      ];
    }
    return DEFAULT_WORKOUT_HISTORY;
  });

  const workoutHistory = allWorkoutHistory.filter(s => (s.user_id || 'primary') === activeProfileKey);

  // Active Workout Session
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    const saved = localStorage.getItem(`ft_active_workout_${activeProfileKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const firestoreDbRef = useRef<Firestore | null>(null);

  // Initialize and listen to Firebase Firestore Real-time changes
  useEffect(() => {
    if (!settings.firebaseConfig?.apiKey || !settings.firebaseConfig?.projectId) {
      setIsFirebaseConnected(false);
      firestoreDbRef.current = null;
      return;
    }

    try {
      const db = initFirebase(settings.firebaseConfig);
      if (!db) {
        setIsFirebaseConnected(false);
        return;
      }
      firestoreDbRef.current = db;
      setIsFirebaseConnected(true);
      setFirebaseError(null);

      // 1. Food Logs Real-time listener
      const unsubFood = subscribeToFoodLogs(
        db,
        (logs) => {
          if (logs && logs.length > 0) {
            setAllFoodLogs(logs);
          }
        },
        (err) => setFirebaseError(`Food Logs: ${err.message}`)
      );

      // 2. Workout History Real-time listener
      const unsubWorkouts = subscribeToWorkoutHistory(
        db,
        (workouts) => {
          if (workouts && workouts.length > 0) {
            setAllWorkoutHistory(workouts);
          }
        },
        (err) => setFirebaseError(`Workout History: ${err.message}`)
      );

      // 3. Body Metrics Real-time listener
      const unsubMetrics = subscribeToBodyMetrics(
        db,
        (metrics) => {
          if (metrics && metrics.length > 0) {
            setAllBodyMetrics(metrics);
          }
        },
        (err) => setFirebaseError(`Body Metrics: ${err.message}`)
      );

      // 4. Custom Exercises Real-time listener
      const unsubExercises = subscribeToCustomExercises(
        db,
        (customs) => {
          if (customs && customs.length > 0) {
            setExercises((prev) => {
              const baseMap = new Map(SEED_EXERCISES.map((e) => [e.exercise_id, e]));
              customs.forEach((c) => baseMap.set(c.exercise_id, c));
              return Array.from(baseMap.values());
            });
          }
        },
        (err) => setFirebaseError(`Exercises: ${err.message}`)
      );

      // 5. User Profiles Real-time listener
      const unsubProfiles = subscribeToProfiles(
        db,
        ({ primary, partner }) => {
          if (primary) setPrimaryProfile((prev) => ({ ...prev, ...primary }));
          if (partner) setPartnerProfile((prev) => ({ ...prev, ...partner }));
        },
        (err) => setFirebaseError(`Profiles: ${err.message}`)
      );

      return () => {
        unsubFood();
        unsubWorkouts();
        unsubMetrics();
        unsubExercises();
        unsubProfiles();
      };
    } catch (e: any) {
      console.error('Firebase setup error:', e);
      setIsFirebaseConnected(false);
      setFirebaseError(e.message || 'Firebase initialization failed');
    }
  }, [JSON.stringify(settings.firebaseConfig)]);

  const testFirebaseConnection = async (config?: FirebaseConfig): Promise<{ success: boolean; message: string }> => {
    const targetConfig = config || settings.firebaseConfig;
    if (!targetConfig?.apiKey || !targetConfig?.projectId) {
      return { success: false, message: 'กรุณากรอก Firebase API Key และ Project ID ให้ครบถ้วน' };
    }
    try {
      const db = initFirebase(targetConfig);
      if (!db) throw new Error('ไม่สามารถเริ่มต้น Firebase ได้');
      const testDocRef = doc(db, 'user_profiles', 'test_ping');
      await getDoc(testDocRef);
      setIsFirebaseConnected(true);
      setFirebaseError(null);
      return { success: true, message: '🟢 เชื่อมต่อ Cloud Database (Firebase Firestore) สำเร็จแบบ Real-time เรียบร้อยแล้ว!' };
    } catch (err: any) {
      setIsFirebaseConnected(false);
      setFirebaseError(err.message);
      return { success: false, message: `🔴 เชื่อมต่อไม่สำเร็จ: ${err.message}` };
    }
  };

  const migrateLocalDataToFirebase = async (onProgress?: (msg: string) => void) => {
    const db = firestoreDbRef.current || (settings.firebaseConfig ? initFirebase(settings.firebaseConfig) : null);
    if (!db) {
      throw new Error('กรุณาตั้งค่าและเชื่อมต่อ Firebase ให้สำเร็จก่อนทำการย้ายข้อมูล');
    }
    const customExs = exercises.filter((e) => e.is_custom);
    return await migrateAllDataToCloud(
      db,
      {
        foodLogs: allFoodLogs,
        workoutHistory: allWorkoutHistory,
        bodyMetrics: allBodyMetrics,
        customExercises: customExs,
        primaryProfile,
        partnerProfile,
      },
      onProgress
    );
  };


  // Unified Spreadsheet Link
  const unifiedSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A/edit';
  const openUnifiedSpreadsheet = () => {
    window.open(unifiedSpreadsheetUrl, '_blank');
  };

  // Sheets Service Instance (Pointing to the single unified spreadsheet)
  const sheetsService = new GoogleSheetsService(
    settings.googleAccessToken,
    settings.primarySpreadsheetId || '1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A',
    settings.appsScriptUrl
  );

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ft_active_profile', activeProfileKey);

    const savedActive = localStorage.getItem(`ft_active_workout_${activeProfileKey}`);
    setActiveWorkout(savedActive ? JSON.parse(savedActive) : null);

    const savedPrograms = localStorage.getItem(`ft_programs_${activeProfileKey}`);
    if (savedPrograms) {
      setPrograms(JSON.parse(savedPrograms));
    } else {
      setPrograms(activeProfileKey === 'partner' ? DEFAULT_PARTNER_PROGRAMS : DEFAULT_PROGRAMS);
    }
  }, [activeProfileKey]);

  useEffect(() => {
    localStorage.setItem('ft_profile_primary', JSON.stringify(primaryProfile));
  }, [primaryProfile]);

  useEffect(() => {
    localStorage.setItem('ft_profile_partner', JSON.stringify(partnerProfile));
  }, [partnerProfile]);

  useEffect(() => {
    localStorage.setItem('ft_settings', JSON.stringify(settings));
    if (settings.geminiApiKey) {
      localStorage.setItem('fittrack_gemini_key', settings.geminiApiKey);
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ft_food_logs_unified', JSON.stringify(allFoodLogs));
  }, [allFoodLogs]);

  useEffect(() => {
    localStorage.setItem('ft_metrics_unified', JSON.stringify(allBodyMetrics));
  }, [allBodyMetrics]);

  useEffect(() => {
    localStorage.setItem('ft_history_unified', JSON.stringify(allWorkoutHistory));
  }, [allWorkoutHistory]);

  useEffect(() => {
    localStorage.setItem(`ft_programs_${activeProfileKey}`, JSON.stringify(programs));
  }, [programs, activeProfileKey]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(`ft_active_workout_${activeProfileKey}`, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(`ft_active_workout_${activeProfileKey}`);
    }
  }, [activeWorkout, activeProfileKey]);

  // Workout Timer Interval
  useEffect(() => {
    if (!activeWorkout) return;
    const timer = setInterval(() => {
      setActiveWorkout(prev => {
        if (!prev) return null;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeWorkout?.session_id]);

  const updateProfile = (updates: Partial<UserProfile>, isPartner?: boolean) => {
    const isTargetPartner = isPartner || activeProfileKey === 'partner';
    let updatedProfile: UserProfile;
    if (isTargetPartner) {
      updatedProfile = { ...partnerProfile, ...updates };
      setPartnerProfile(updatedProfile);
    } else {
      updatedProfile = { ...primaryProfile, ...updates };
      setPrimaryProfile(updatedProfile);
    }

    // Cloud Firestore Sync
    if (firestoreDbRef.current) {
      cloudSaveProfile(firestoreDbRef.current, updatedProfile, isTargetPartner).catch((err) => {
        console.error('Firebase save profile error:', err);
      });
    }

    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      sheetsService.syncProfile(updatedProfile, updatedProfile.name).catch(err => {
        console.error('Auto sync profile failed:', err);
      });
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addCustomExercise = (newEx: Exercise) => {
    setExercises(prev => {
      const updated = [newEx, ...prev];
      const customOnly = updated.filter(e => e.is_custom);
      localStorage.setItem('ft_custom_exercises', JSON.stringify(customOnly));
      return updated;
    });

    // Cloud Firestore Sync
    if (firestoreDbRef.current) {
      cloudSaveCustomExercise(firestoreDbRef.current, newEx).catch((err) => {
        console.error('Firebase save exercise error:', err);
      });
    }
  };


  // Workout management
  const startWorkout = (name = 'บันทึกการฝึก', initialExercises?: Exercise[]) => {
    const sessionId = 'sess_' + Date.now();
    const newSession: ActiveWorkout = {
      session_id: sessionId,
      name,
      start_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      elapsedSeconds: 0,
      note: '',
      cardio: [],
      exercises: (initialExercises || []).map(ex => ({
        exercise_id: ex.exercise_id,
        note: '',
        sets: [
          {
            set_id: 'set_' + Math.random().toString(36).substring(2, 9),
            session_id: sessionId,
            exercise_id: ex.exercise_id,
            set_no: 1,
            weight_kg: 20,
            reps: 10,
            done: false,
          }
        ]
      }))
    };
    setActiveWorkout(newSession);
  };

  const startCardioSession = (name?: string, defaultType: CardioType = 'incline_treadmill') => {
    const sessionId = 'sess_' + Date.now();
    const typeNames: Record<CardioType, string> = {
      incline_treadmill: 'เดินชันลู่วิ่ง (Incline Treadmill)',
      treadmill_run: 'วิ่งบนลู่วิ่ง (Treadmill Running)',
      stationary_bike: 'ปั่นจักรยานฟิตเนส (Stationary Bike)',
      elliptical: 'เครื่องเดินวงรี (Elliptical)',
      stairmaster: 'บันไดสเต็ปมาสเตอร์ (Stairmaster)',
      outdoor_walk: 'เดินเร็วกลางแจ้ง (Outdoor Walk)',
      outdoor_run: 'วิ่งกลางแจ้ง (Outdoor Run)',
      other: 'คาร์ดิโอทั่วไป (Cardio)'
    };
    const defaultName = typeNames[defaultType] || 'คาร์ดิโอ (Cardio)';
    const newSession: ActiveWorkout = {
      session_id: sessionId,
      name: name || defaultName,
      start_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      elapsedSeconds: 0,
      note: '',
      exercises: [],
      cardio: [
        {
          id: 'cardio_' + Date.now(),
          type: defaultType,
          machine_name: defaultName,
          duration_minutes: 30,
          incline_pct: defaultType === 'incline_treadmill' ? 10 : 0,
          speed_kmh: defaultType === 'incline_treadmill' ? 4.5 : 8.0,
          distance_km: defaultType === 'incline_treadmill' ? 2.25 : 4.0,
          calories_kcal: defaultType === 'incline_treadmill' ? 190 : 250,
          note: ''
        }
      ]
    };
    setActiveWorkout(newSession);
  };

  const cancelWorkout = () => {
    if (window.confirm('คุณต้องการยกเลิกการฝึกเซสชันนี้ใช่หรือไม่?')) {
      setActiveWorkout(null);
    }
  };

  const setSessionNote = (note: string) => {
    setActiveWorkout(prev => prev ? { ...prev, note } : null);
  };

  const setExerciseNote = (exercise_id: string, note: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.exercise_id === exercise_id ? { ...ex, note } : ex
        )
      };
    });
  };

  const addCardioToWorkout = (cardio: CardioActivity) => {
    const cardioWithId: CardioActivity = {
      ...cardio,
      id: cardio.id || 'cardio_' + Math.random().toString(36).substring(2, 9)
    };
    setActiveWorkout(prev => {
      if (!prev) {
        const sessionId = 'sess_' + Date.now();
        return {
          session_id: sessionId,
          name: 'คาร์ดิโอ / ' + cardio.machine_name,
          start_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          elapsedSeconds: 0,
          note: '',
          exercises: [],
          cardio: [cardioWithId]
        };
      }
      return {
        ...prev,
        cardio: [...(prev.cardio || []), cardioWithId]
      };
    });
  };

  const updateCardioInWorkout = (cardioIndex: number, updates: Partial<CardioActivity>) => {
    setActiveWorkout(prev => {
      if (!prev || !prev.cardio) return prev;
      const updated = [...prev.cardio];
      updated[cardioIndex] = { ...updated[cardioIndex], ...updates };
      return { ...prev, cardio: updated };
    });
  };

  const removeCardioFromWorkout = (cardioIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev || !prev.cardio) return prev;
      return {
        ...prev,
        cardio: prev.cardio.filter((_, idx) => idx !== cardioIndex)
      };
    });
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    const today = new Date().toISOString().split('T')[0];
    const currentName = activeProfileKey === 'partner' ? partnerProfile.name : primaryProfile.name;

    const allSets: WorkoutSet[] = [];
    activeWorkout.exercises.forEach(ex => {
      const exObj = exercises.find(e => e.exercise_id === ex.exercise_id);
      const exName = exObj ? `${exObj.name_th} (${exObj.name_en})` : ex.exercise_id;
      ex.sets.forEach(s => {
        allSets.push({
          ...s,
          exercise_name: exName,
          user_name: currentName,
          note: ex.note || s.note,
        });
      });
    });

    // Build session note including cardio summary if cardio was completed
    let finalNote = activeWorkout.note || '';
    if (activeWorkout.cardio && activeWorkout.cardio.length > 0) {
      const cardioParts = activeWorkout.cardio.map(c => {
        const details: string[] = [c.machine_name];
        if (c.incline_pct !== undefined && c.incline_pct > 0) details.push(`ชัน ${c.incline_pct}%`);
        if (c.speed_kmh) details.push(`เร็ว ${c.speed_kmh} km/h`);
        if (c.duration_minutes) details.push(`${c.duration_minutes} นาที`);
        if (c.calories_kcal) details.push(`${c.calories_kcal} kcal`);
        if (c.note) details.push(`("${c.note}")`);
        return details.join(' · ');
      }).join(' | ');
      finalNote = finalNote ? `${finalNote} [คาร์ดิโอ: ${cardioParts}]` : `[คาร์ดิโอ: ${cardioParts}]`;
    }

    const finishedSession: WorkoutSession = {
      session_id: activeWorkout.session_id,
      user_id: activeProfileKey,
      user_name: currentName,
      date: today,
      program_name: activeWorkout.name,
      start_time: activeWorkout.start_time,
      end_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      note: finalNote,
      sets: allSets,
      cardio: activeWorkout.cardio,
    };

    setAllWorkoutHistory(prev => [finishedSession, ...prev]);
    setActiveWorkout(null);

    // Cloud Firestore Sync
    if (firestoreDbRef.current) {
      cloudSaveWorkout(firestoreDbRef.current, finishedSession).catch((err) => {
        console.error('Firebase save workout error:', err);
      });
    }

    // Auto-sync to Google Sheets via Apps Script or OAuth
    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncWorkoutSession(finishedSession, allSets, currentName);
      } catch (err) {
        console.error('Auto sync workout failed:', err);
      }
    }
  };

  const resetProgramsToDefault = () => {
    const target = activeProfileKey === 'partner' ? DEFAULT_PARTNER_PROGRAMS : DEFAULT_PROGRAMS;
    setPrograms(target);
    localStorage.setItem(`ft_programs_${activeProfileKey}`, JSON.stringify(target));
  };

  const deleteWorkoutSession = (sessionId: string) => {
    setAllWorkoutHistory(prev => prev.filter(s => s.session_id !== sessionId));
    if (firestoreDbRef.current) {
      cloudDeleteWorkout(firestoreDbRef.current, sessionId).catch(console.error);
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) {
      startWorkout('การฝึกวันนี้', [exercise]);
      return;
    }
    setActiveWorkout(prev => {
      if (!prev) return null;
      const exists = prev.exercises.find(e => e.exercise_id === exercise.exercise_id);
      if (exists) return prev;
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            exercise_id: exercise.exercise_id,
            sets: [
              {
                set_id: 'set_' + Math.random().toString(36).substring(2, 9),
                session_id: prev.session_id,
                exercise_id: exercise.exercise_id,
                set_no: 1,
                weight_kg: 20,
                reps: 10,
                done: false,
              }
            ]
          }
        ]
      };
    });
  };

  const removeExerciseFromWorkout = (exercise_id: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(e => e.exercise_id !== exercise_id)
      };
    });
  };

  const addSetToExercise = (exercise_id: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.exercise_id !== exercise_id) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSetNo = ex.sets.length + 1;
          const newSet: WorkoutSet = {
            set_id: 'set_' + Math.random().toString(36).substring(2, 9),
            session_id: prev.session_id,
            exercise_id,
            set_no: newSetNo,
            weight_kg: lastSet ? lastSet.weight_kg : 20,
            reps: lastSet ? lastSet.reps : 10,
            done: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        })
      };
    });
  };

  const removeSetFromExercise = (exercise_id: string, setIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.exercise_id !== exercise_id) return ex;
          const updatedSets = ex.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
            ...s,
            set_no: idx + 1
          }));
          return { ...ex, sets: updatedSets };
        })
      };
    });
  };

  const updateSet = (exercise_id: string, setIndex: number, updates: Partial<WorkoutSet>) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.exercise_id !== exercise_id) return ex;
          const updatedSets = [...ex.sets];
          updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
          return { ...ex, sets: updatedSets };
        })
      };
    });
  };

  const addFoodLog = async (logData: Omit<FoodLog, 'log_id'>) => {
    const targetUserId = (logData.user_id as 'primary' | 'partner') || activeProfileKey;
    const currentName = targetUserId === 'partner' ? partnerProfile.name : primaryProfile.name;
    const newLog: FoodLog = {
      ...logData,
      log_id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: targetUserId,
      user_name: currentName,
    };
    setAllFoodLogs(prev => [newLog, ...prev]);

    // Cloud Firestore Sync
    if (firestoreDbRef.current) {
      cloudSaveFoodLog(firestoreDbRef.current, newLog).catch(console.error);
    }

    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncFoodLog(newLog, currentName);
      } catch (err) {
        console.error('Auto sync food log failed:', err);
      }
    }
  };

  const updateFoodLog = async (log_id: string, updates: Partial<FoodLog>) => {
    setAllFoodLogs(prev => {
      const updated = prev.map(l => (l.log_id === log_id ? { ...l, ...updates } : l));
      const target = updated.find(l => l.log_id === log_id);
      if (target && firestoreDbRef.current) {
        cloudSaveFoodLog(firestoreDbRef.current, target).catch(console.error);
      }
      return updated;
    });
  };

  const deleteFoodLog = (log_id: string) => {
    setAllFoodLogs(prev => prev.filter(l => l.log_id !== log_id));
    if (firestoreDbRef.current) {
      cloudDeleteFoodLog(firestoreDbRef.current, log_id).catch(console.error);
    }
  };

  const addBodyMetric = async (metricData: Omit<BodyMetric, 'id'>) => {
    const currentName = activeProfileKey === 'partner' ? partnerProfile.name : primaryProfile.name;
    const newMetric: BodyMetric = {
      ...metricData,
      id: 'metric_' + Date.now(),
      user_id: activeProfileKey,
      user_name: currentName,
    };
    setAllBodyMetrics(prev => [newMetric, ...prev]);

    // Cloud Firestore Sync
    if (firestoreDbRef.current) {
      cloudSaveBodyMetric(firestoreDbRef.current, newMetric).catch(console.error);
    }

    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncBodyMetric(newMetric, currentName);
      } catch (err) {
        console.error('Auto sync metric failed:', err);
      }
    }
  };

  const deleteBodyMetric = (metricIdOrDate: string) => {
    setAllBodyMetrics(prev =>
      prev.filter(m => (m.id ? m.id !== metricIdOrDate : m.date !== metricIdOrDate))
    );
    if (firestoreDbRef.current) {
      cloudDeleteBodyMetric(firestoreDbRef.current, metricIdOrDate).catch(console.error);
    }
  };

  const clearAllBodyMetrics = () => {
    setAllBodyMetrics([]);
    localStorage.removeItem('ft_metrics_unified');
    localStorage.removeItem('ft_metrics_primary');
    localStorage.removeItem('ft_metrics_partner');
  };

  const addProgram = (prog: Program) => {
    setPrograms(prev => [prog, ...prev]);
  };

  const updateProgram = (programId: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(p => (p.program_id === programId ? { ...p, ...updates } : p)));
  };

  const deleteProgram = (programId: string) => {
    setPrograms(prev => prev.filter(p => p.program_id !== programId));
  };

  const syncAllToGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      if (settings.appsScriptUrl) {
        await fetch(settings.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'setup' }),
        });
        return {
          success: true,
          message: 'เชื่อมต่อและตรวจสอบ 8 แท็บใน Google Sheet ผ่าน Apps Script สำเร็จเรียบร้อยแล้ว!',
        };
      }

      if (!settings.googleAccessToken) {
        throw new Error('กรุณาลงชื่อเข้าใช้ Google หรือตรวจสอบ Apps Script Web App URL ในหน้าการตั้งค่า');
      }
      let sheetId = activeProfileKey === 'primary' ? settings.primarySpreadsheetId : settings.partnerSpreadsheetId;
      if (!sheetId) {
        // Auto create spreadsheet
        const curProf = activeProfileKey === 'primary' ? primaryProfile : partnerProfile;
        sheetId = await sheetsService.createInitialSpreadsheet(curProf.email, curProf.name);
        if (activeProfileKey === 'primary') {
          updateSettings({ primarySpreadsheetId: sheetId });
        } else {
          updateSettings({ partnerSpreadsheetId: sheetId });
        }
      }
      return { success: true, message: `ซิงค์กับ Google Sheet สำเร็จ (Spreadsheet ID: ${sheetId.substring(0, 8)}...)` };
    } catch (err: any) {
      return { success: false, message: err.message || 'ซิงค์ไม่สำเร็จ' };
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFoodDatabaseToSheets = async (foods?: PredefinedFood[]) => {
    const items = foods || PREDEFINED_FOODS;
    try {
      await sheetsService.syncFoodDatabase(items);
      return {
        success: true,
        message: `ซิงค์รายการอาหาร ${items.length} รายการลง Google Sheet สำเร็จแล้ว`,
      };
    } catch (err: any) {
      console.warn('Sync food database error:', err);
      return { success: false, message: err.message || 'ซิงค์ตารางอาหารไม่สำเร็จ' };
    }
  };

  const currentProfile = activeProfileKey === 'primary' ? primaryProfile : partnerProfile;

  return (
    <AppContext.Provider
      value={{
        activeProfileKey,
        setActiveProfileKey,
        currentProfile,
        primaryProfile,
        partnerProfile,
        updateProfile,
        exercises,
        addCustomExercise,
        activeWorkout,
        startWorkout,
        startCardioSession,
        cancelWorkout,
        finishWorkout,
        setSessionNote,
        setExerciseNote,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        addCardioToWorkout,
        updateCardioInWorkout,
        removeCardioFromWorkout,
        workoutHistory,
        allWorkoutHistory,
        deleteWorkoutSession,
        foodLogs,
        allFoodLogs,
        addFoodLog,
        updateFoodLog,
        deleteFoodLog,
        bodyMetrics,
        allBodyMetrics,
        addBodyMetric,
        deleteBodyMetric,
        clearAllBodyMetrics,
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        resetProgramsToDefault,
        settings,
        updateSettings,
        isSyncing,
        sheetsService,
        syncAllToGoogleSheets,
        syncFoodDatabaseToSheets,
        unifiedSpreadsheetUrl,
        openUnifiedSpreadsheet,
        isFirebaseConnected,
        firebaseError,
        migrateLocalDataToFirebase,
        testFirebaseConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
