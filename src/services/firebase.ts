import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  Unsubscribe,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  FoodLog,
  WorkoutSession,
  BodyMetric,
  Exercise,
  UserProfile,
  FirebaseConfig,
} from '../types';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export const initFirebase = (config: FirebaseConfig): Firestore | null => {
  try {
    if (!config || !config.apiKey || !config.projectId) {
      return null;
    }
    const apps = getApps();
    firebaseApp = apps.length === 0 ? initializeApp(config) : getApp();
    firestoreDb = getFirestore(firebaseApp);
    return firestoreDb;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

export const getFirestoreInstance = (): Firestore | null => {
  return firestoreDb;
};

// ==================== REALTIME SUBSCRIPTIONS ====================

export const subscribeToFoodLogs = (
  db: Firestore,
  onUpdate: (logs: FoodLog[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, 'food_logs');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const logs: FoodLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as FoodLog);
      });
      // Sort by date + time descending
      logs.sort((a, b) => {
        const timeA = `${a.date} ${a.time || '00:00'}`;
        const timeB = `${b.date} ${b.time || '00:00'}`;
        return timeB.localeCompare(timeA);
      });
      onUpdate(logs);
    },
    (err) => {
      console.error('Firestore FoodLogs subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToWorkoutHistory = (
  db: Firestore,
  onUpdate: (workouts: WorkoutSession[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, 'workout_history');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const workouts: WorkoutSession[] = [];
      snapshot.forEach((docSnap) => {
        workouts.push(docSnap.data() as WorkoutSession);
      });
      workouts.sort((a, b) => {
        const timeA = `${a.date} ${a.start_time || '00:00:00'}`;
        const timeB = `${b.date} ${b.start_time || '00:00:00'}`;
        return timeB.localeCompare(timeA);
      });
      onUpdate(workouts);
    },
    (err) => {
      console.error('Firestore WorkoutHistory subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToBodyMetrics = (
  db: Firestore,
  onUpdate: (metrics: BodyMetric[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, 'body_metrics');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const metrics: BodyMetric[] = [];
      snapshot.forEach((docSnap) => {
        metrics.push(docSnap.data() as BodyMetric);
      });
      metrics.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(metrics);
    },
    (err) => {
      console.error('Firestore BodyMetrics subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToCustomExercises = (
  db: Firestore,
  onUpdate: (exercises: Exercise[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, 'custom_exercises');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Exercise[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Exercise);
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore CustomExercises subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToProfiles = (
  db: Firestore,
  onUpdate: (profiles: { primary?: UserProfile; partner?: UserProfile }) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, 'user_profiles');
  return onSnapshot(
    colRef,
    (snapshot) => {
      let primary: UserProfile | undefined;
      let partner: UserProfile | undefined;
      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'primary') {
          primary = docSnap.data() as UserProfile;
        } else if (docSnap.id === 'partner') {
          partner = docSnap.data() as UserProfile;
        }
      });
      onUpdate({ primary, partner });
    },
    (err) => {
      console.error('Firestore UserProfiles subscription error:', err);
      if (onError) onError(err);
    }
  );
};

// ==================== CLOUD MUTATION ACTIONS ====================

export const cloudSaveFoodLog = async (db: Firestore, log: FoodLog): Promise<void> => {
  const docRef = doc(db, 'food_logs', log.log_id);
  await setDoc(docRef, log, { merge: true });
};

export const cloudDeleteFoodLog = async (db: Firestore, logId: string): Promise<void> => {
  const docRef = doc(db, 'food_logs', logId);
  await deleteDoc(docRef);
};

export const cloudSaveWorkout = async (db: Firestore, session: WorkoutSession): Promise<void> => {
  const docRef = doc(db, 'workout_history', session.session_id);
  await setDoc(docRef, session, { merge: true });
};

export const cloudDeleteWorkout = async (db: Firestore, sessionId: string): Promise<void> => {
  const docRef = doc(db, 'workout_history', sessionId);
  await deleteDoc(docRef);
};

export const cloudSaveBodyMetric = async (db: Firestore, metric: BodyMetric): Promise<void> => {
  const docId = metric.id || metric.date;
  const docRef = doc(db, 'body_metrics', docId);
  await setDoc(docRef, { ...metric, id: docId }, { merge: true });
};

export const cloudDeleteBodyMetric = async (db: Firestore, metricIdOrDate: string): Promise<void> => {
  const docRef = doc(db, 'body_metrics', metricIdOrDate);
  await deleteDoc(docRef);
};

export const cloudSaveCustomExercise = async (db: Firestore, exercise: Exercise): Promise<void> => {
  const docRef = doc(db, 'custom_exercises', exercise.exercise_id);
  await setDoc(docRef, exercise, { merge: true });
};

export const cloudSaveProfile = async (
  db: Firestore,
  profile: UserProfile,
  isPartner: boolean
): Promise<void> => {
  const docRef = doc(db, 'user_profiles', isPartner ? 'partner' : 'primary');
  await setDoc(docRef, profile, { merge: true });
};

// ==================== BATCH DATA MIGRATION ====================

export interface MigrationPayload {
  foodLogs: FoodLog[];
  workoutHistory: WorkoutSession[];
  bodyMetrics: BodyMetric[];
  customExercises: Exercise[];
  primaryProfile: UserProfile;
  partnerProfile: UserProfile;
}

export const migrateAllDataToCloud = async (
  db: Firestore,
  data: MigrationPayload,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; count: number }> => {
  try {
    let totalSynced = 0;

    // 1. Sync Profiles
    if (onProgress) onProgress('กำลังอัปโหลดโปรไฟล์ผู้ใช้งาน...');
    await cloudSaveProfile(db, data.primaryProfile, false);
    await cloudSaveProfile(db, data.partnerProfile, true);
    totalSynced += 2;

    // 2. Sync Custom Exercises
    if (data.customExercises.length > 0) {
      if (onProgress) onProgress(`กำลังอัปโหลดท่าออกกำลังกาย (${data.customExercises.length} รายการ)...`);
      for (const ex of data.customExercises) {
        await cloudSaveCustomExercise(db, ex);
        totalSynced++;
      }
    }

    // 3. Sync Food Logs in Batches
    if (data.foodLogs.length > 0) {
      if (onProgress) onProgress(`กำลังอัปโหลดบันทึกอาหาร (${data.foodLogs.length} รายการ)...`);
      const batchSize = 400;
      for (let i = 0; i < data.foodLogs.length; i += batchSize) {
        const chunk = data.foodLogs.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((log) => {
          const docRef = doc(db, 'food_logs', log.log_id);
          batch.set(docRef, log, { merge: true });
        });
        await batch.commit();
        totalSynced += chunk.length;
      }
    }

    // 4. Sync Workout History
    if (data.workoutHistory.length > 0) {
      if (onProgress) onProgress(`กำลังอัปโหลดประวัติการออกกำลังกาย (${data.workoutHistory.length} ครั้ง)...`);
      const batchSize = 400;
      for (let i = 0; i < data.workoutHistory.length; i += batchSize) {
        const chunk = data.workoutHistory.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((sess) => {
          const docRef = doc(db, 'workout_history', sess.session_id);
          batch.set(docRef, sess, { merge: true });
        });
        await batch.commit();
        totalSynced += chunk.length;
      }
    }

    // 5. Sync Body Metrics
    if (data.bodyMetrics.length > 0) {
      if (onProgress) onProgress(`กำลังอัปโหลดบันทึกน้ำหนักและสัดส่วน (${data.bodyMetrics.length} รายการ)...`);
      const batchSize = 400;
      for (let i = 0; i < data.bodyMetrics.length; i += batchSize) {
        const chunk = data.bodyMetrics.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((m) => {
          const docId = m.id || m.date;
          const docRef = doc(db, 'body_metrics', docId);
          batch.set(docRef, { ...m, id: docId }, { merge: true });
        });
        await batch.commit();
        totalSynced += chunk.length;
      }
    }

    if (onProgress) onProgress('✅ ย้ายข้อมูลขึ้น Cloud สำเร็จสมบูรณ์!');
    return { success: true, count: totalSynced };
  } catch (error: any) {
    console.error('Migration error:', error);
    throw new Error(error?.message || 'Failed to migrate data to Firestore');
  }
};
