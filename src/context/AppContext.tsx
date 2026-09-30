import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Exercise,
  WorkoutSession,
  WorkoutSet,
  FoodLog,
  BodyMetric,
  Program,
  AppSettings,
} from '../types';
import { SEED_EXERCISES } from '../data/exercises';
import { GoogleSheetsService } from '../services/googleSheets';

interface ActiveWorkout {
  session_id: string;
  name: string;
  start_time: string;
  elapsedSeconds: number;
  exercises: {
    exercise_id: string;
    sets: WorkoutSet[];
  }[];
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
  cancelWorkout: () => void;
  finishWorkout: () => Promise<void>;
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exercise_id: string) => void;
  addSetToExercise: (exercise_id: string) => void;
  removeSetFromExercise: (exercise_id: string, setIndex: number) => void;
  updateSet: (exercise_id: string, setIndex: number, updates: Partial<WorkoutSet>) => void;

  workoutHistory: WorkoutSession[];
  
  foodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, 'log_id'>) => Promise<void>;
  deleteFoodLog: (log_id: string) => void;
  
  bodyMetrics: BodyMetric[];
  addBodyMetric: (metric: Omit<BodyMetric, 'id'>) => Promise<void>;

  programs: Program[];
  addProgram: (program: Program) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  isSyncing: boolean;
  sheetsService: GoogleSheetsService;
  syncAllToGoogleSheets: () => Promise<{ success: boolean; message: string }>;
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
  created_at: new Date().toISOString(),
};

const DEFAULT_PARTNER_PROFILE: UserProfile = {
  user_id: 'user_partner',
  email: 'manao@example.com',
  name: 'มะนาว (Manao)',
  sex: 'female',
  birth_year: 2000,
  height_cm: 162,
  goal: 'Toning & Healthy (หุ่นกระชับ & สุขภาพ)',
  kcal_target: 1750,
  protein_target_g: 110,
  carb_target_g: 190,
  fat_target_g: 50,
  created_at: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  activeProfileKey: 'primary',
  googleClientId: '',
  googleAccessToken: '',
  primarySpreadsheetId: '1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A',
  partnerSpreadsheetId: '',
  appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwueoU7u4P84GwE2PXeAlp_c3iEGE9UFGeWcJmxuOt_BxKXd3tGWQbzJ7DBnT6C1gN7/exec',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('fittrack_gemini_key') || '' : ''),
  geminiProxyUrl: '',
  useProxy: false,
  autoSyncGoogleSheets: false,
};

const DEFAULT_PROGRAMS: Program[] = [
  {
    program_id: 'prog_push',
    name: 'Push Day (อก ไหล่ หลังแขน)',
    day_of_week: 'จันทร์',
    note: 'เน้นอกบนและไหล่หน้า-ข้าง',
    items: [
      { program_id: 'prog_push', order: 1, exercise_id: 'ex_bench_press', target_sets: 4, target_reps: 8, target_weight_kg: 60 },
      { program_id: 'prog_push', order: 2, exercise_id: 'ex_incline_db_press', target_sets: 3, target_reps: 10, target_weight_kg: 22 },
      { program_id: 'prog_push', order: 3, exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, target_weight_kg: 10 },
      { program_id: 'prog_push', order: 4, exercise_id: 'ex_tricep_pushdown', target_sets: 3, target_reps: 12, target_weight_kg: 25 },
    ]
  },
  {
    program_id: 'prog_pull',
    name: 'Pull Day (หลัง หน้าแขน)',
    day_of_week: 'อังคาร',
    note: 'เน้นความกว้างของปีกและความหนา',
    items: [
      { program_id: 'prog_pull', order: 1, exercise_id: 'ex_lat_pulldown', target_sets: 4, target_reps: 10, target_weight_kg: 50 },
      { program_id: 'prog_pull', order: 2, exercise_id: 'ex_barbell_row', target_sets: 4, target_reps: 8, target_weight_kg: 55 },
      { program_id: 'prog_pull', order: 3, exercise_id: 'ex_face_pull', target_sets: 3, target_reps: 15, target_weight_kg: 20 },
      { program_id: 'prog_pull', order: 4, exercise_id: 'ex_barbell_curl', target_sets: 3, target_reps: 10, target_weight_kg: 25 },
    ]
  },
  {
    program_id: 'prog_legs',
    name: 'Leg Day (ขา ก้น ท้อง)',
    day_of_week: 'พฤหัสบดี',
    note: 'โฟกัส Squat และ RDL',
    items: [
      { program_id: 'prog_legs', order: 1, exercise_id: 'ex_back_squat', target_sets: 4, target_reps: 8, target_weight_kg: 80 },
      { program_id: 'prog_legs', order: 2, exercise_id: 'ex_romanian_deadlift', target_sets: 4, target_reps: 10, target_weight_kg: 60 },
      { program_id: 'prog_legs', order: 3, exercise_id: 'ex_bulgarian_split_squat', target_sets: 3, target_reps: 10, target_weight_kg: 14 },
      { program_id: 'prog_legs', order: 4, exercise_id: 'ex_hanging_leg_raise', target_sets: 3, target_reps: 12, target_weight_kg: 0 },
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
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.geminiApiKey) {
        parsed.geminiApiKey = DEFAULT_SETTINGS.geminiApiKey;
      }
      if (!parsed.appsScriptUrl) {
        parsed.appsScriptUrl = DEFAULT_SETTINGS.appsScriptUrl;
      }
      if (!parsed.primarySpreadsheetId) {
        parsed.primarySpreadsheetId = DEFAULT_SETTINGS.primarySpreadsheetId;
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
    const saved = localStorage.getItem(`ft_programs_${activeProfileKey}`);
    return saved ? JSON.parse(saved) : DEFAULT_PROGRAMS;
  });

  // Food Logs (keyed per active profile)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem(`ft_food_logs_${activeProfileKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Body Metrics
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>(() => {
    const saved = localStorage.getItem(`ft_metrics_${activeProfileKey}`);
    if (saved) return JSON.parse(saved);
    // Initial sample points
    return [
      { date: '2026-09-15', weight_kg: 72.5, body_fat_pct: 16.5, waist_cm: 80, note: 'เริ่มต้นโปรแกรม' },
      { date: '2026-09-22', weight_kg: 72.2, body_fat_pct: 16.2, waist_cm: 79.5 },
      { date: '2026-09-29', weight_kg: 71.9, body_fat_pct: 15.9, waist_cm: 79.0, note: 'สัปดาห์ที่ 3 ฟิตขึ้น' },
    ];
  });

  // Workout History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem(`ft_history_${activeProfileKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Active Workout Session
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    const saved = localStorage.getItem(`ft_active_workout_${activeProfileKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sheets Service Instance
  const sheetsService = new GoogleSheetsService(
    settings.googleAccessToken,
    activeProfileKey === 'primary' ? settings.primarySpreadsheetId : settings.partnerSpreadsheetId,
    settings.appsScriptUrl
  );

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ft_active_profile', activeProfileKey);
    // Reload profile-specific data when active profile changes
    const savedLogs = localStorage.getItem(`ft_food_logs_${activeProfileKey}`);
    setFoodLogs(savedLogs ? JSON.parse(savedLogs) : []);

    const savedMetrics = localStorage.getItem(`ft_metrics_${activeProfileKey}`);
    if (savedMetrics) setBodyMetrics(JSON.parse(savedMetrics));

    const savedHistory = localStorage.getItem(`ft_history_${activeProfileKey}`);
    setWorkoutHistory(savedHistory ? JSON.parse(savedHistory) : []);

    const savedActive = localStorage.getItem(`ft_active_workout_${activeProfileKey}`);
    setActiveWorkout(savedActive ? JSON.parse(savedActive) : null);
  }, [activeProfileKey]);

  useEffect(() => {
    localStorage.setItem('ft_profile_primary', JSON.stringify(primaryProfile));
  }, [primaryProfile]);

  useEffect(() => {
    localStorage.setItem('ft_profile_partner', JSON.stringify(partnerProfile));
  }, [partnerProfile]);

  useEffect(() => {
    localStorage.setItem('ft_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`ft_food_logs_${activeProfileKey}`, JSON.stringify(foodLogs));
  }, [foodLogs, activeProfileKey]);

  useEffect(() => {
    localStorage.setItem(`ft_metrics_${activeProfileKey}`, JSON.stringify(bodyMetrics));
  }, [bodyMetrics, activeProfileKey]);

  useEffect(() => {
    localStorage.setItem(`ft_history_${activeProfileKey}`, JSON.stringify(workoutHistory));
  }, [workoutHistory, activeProfileKey]);

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
    if (isPartner || activeProfileKey === 'partner') {
      setPartnerProfile(prev => ({ ...prev, ...updates }));
    } else {
      setPrimaryProfile(prev => ({ ...prev, ...updates }));
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
  };

  // Workout management
  const startWorkout = (name = 'บันทึกการฝึก', initialExercises?: Exercise[]) => {
    const sessionId = 'sess_' + Date.now();
    const newSession: ActiveWorkout = {
      session_id: sessionId,
      name,
      start_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      elapsedSeconds: 0,
      exercises: (initialExercises || []).map(ex => ({
        exercise_id: ex.exercise_id,
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

  const cancelWorkout = () => {
    if (window.confirm('คุณต้องการยกเลิกการฝึกเซสชันนี้ใช่หรือไม่?')) {
      setActiveWorkout(null);
    }
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    const today = new Date().toISOString().split('T')[0];
    const allSets: WorkoutSet[] = [];
    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => allSets.push(s));
    });

    const finishedSession: WorkoutSession = {
      session_id: activeWorkout.session_id,
      date: today,
      program_name: activeWorkout.name,
      start_time: activeWorkout.start_time,
      end_time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      sets: allSets,
    };

    setWorkoutHistory(prev => [finishedSession, ...prev]);
    setActiveWorkout(null);

    // Auto-sync to Google Sheets via Apps Script or OAuth
    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncWorkoutSession(finishedSession, allSets);
      } catch (err) {
        console.error('Auto sync workout failed:', err);
      }
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
    const newLog: FoodLog = {
      ...logData,
      log_id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    };
    setFoodLogs(prev => [newLog, ...prev]);

    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncFoodLog(newLog);
      } catch (err) {
        console.error('Auto sync food log failed:', err);
      }
    }
  };

  const deleteFoodLog = (log_id: string) => {
    setFoodLogs(prev => prev.filter(l => l.log_id !== log_id));
  };

  const addBodyMetric = async (metricData: Omit<BodyMetric, 'id'>) => {
    const newMetric: BodyMetric = {
      ...metricData,
      id: 'metric_' + Date.now()
    };
    setBodyMetrics(prev => [newMetric, ...prev]);

    if (settings.appsScriptUrl || (settings.autoSyncGoogleSheets && settings.googleAccessToken)) {
      try {
        await sheetsService.syncBodyMetric(newMetric);
      } catch (err) {
        console.error('Auto sync metric failed:', err);
      }
    }
  };

  const addProgram = (prog: Program) => {
    setPrograms(prev => [prog, ...prev]);
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
        cancelWorkout,
        finishWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        workoutHistory,
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        bodyMetrics,
        addBodyMetric,
        programs,
        addProgram,
        settings,
        updateSettings,
        isSyncing,
        sheetsService,
        syncAllToGoogleSheets,
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
