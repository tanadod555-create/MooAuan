import {
  UserProfile,
  BodyMetric,
  Exercise,
  Program,
  ProgramItem,
  WorkoutSession,
  WorkoutSet,
  FoodLog,
} from '../types';

export const SHEET_TABS = [
  'profile',
  'body_metrics',
  'exercises',
  'programs',
  'program_items',
  'workout_sessions',
  'workout_sets',
  'food_logs',
  'food_database',
] as const;

export const SHEET_HEADERS: Record<string, string[]> = {
  profile: ['user_name', 'user_id', 'email', 'sex', 'goal', 'kcal_target', 'protein_target_g', 'carb_target_g', 'fat_target_g', 'height_cm', 'waist_cm', 'chest_cm', 'shoulders_cm', 'thigh_cm', 'hips_cm', 'arm_cm', 'calf_cm', 'neck_cm', 'updated_at'],
  body_metrics: ['user_name', 'date', 'weight_kg', 'body_fat_pct', 'waist_cm', 'chest_cm', 'shoulders_cm', 'thigh_cm', 'hips_cm', 'arm_cm', 'calf_cm', 'neck_cm', 'note'],
  exercises: ['exercise_id', 'name_en', 'name_th', 'category', 'muscle_primary', 'muscle_secondary', 'pattern', 'equipment'],
  programs: ['user_name', 'program_id', 'name', 'day_of_week', 'note'],
  program_items: ['program_id', 'order', 'exercise_id', 'target_sets', 'target_reps', 'target_weight_kg'],
  workout_sessions: ['user_name', 'date', 'program_name', 'start_time', 'end_time', 'note', 'session_id'],
  workout_sets: ['user_name', 'date', 'exercise_name', 'set_no', 'weight_kg', 'reps', 'rpe', 'done', 'session_id'],
  food_logs: ['user_name', 'date', 'time', 'meal', 'name', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'fiber_g', 'grams', 'source', 'log_id'],
  food_database: ['name_th', 'name_en', 'category', 'serving_size', 'grams', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'fiber_g', 'note'],
};

export class GoogleSheetsService {
  private accessToken: string | null = null;
  private spreadsheetId: string | null = null;
  private appsScriptUrl: string | null = null;

  constructor(accessToken?: string, spreadsheetId?: string, appsScriptUrl?: string) {
    if (accessToken) this.accessToken = accessToken;
    if (spreadsheetId) this.spreadsheetId = spreadsheetId;
    if (appsScriptUrl) this.appsScriptUrl = appsScriptUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setSpreadsheetId(id: string) {
    this.spreadsheetId = id;
  }

  setAppsScriptUrl(url: string) {
    this.appsScriptUrl = url;
  }

  getSpreadsheetId(): string | null {
    return this.spreadsheetId;
  }

  getAppsScriptUrl(): string | null {
    return this.appsScriptUrl;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('Google OAuth Access Token is missing. Please sign in with Google.');
    }
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Sheets API Error [${res.status}]: ${errorText}`);
    }
    return res.json();
  }

  /**
   * Create a new Google Spreadsheet for the user with all 8 predefined sheets and headers
   */
  async createInitialSpreadsheet(userEmail: string, userName: string): Promise<string> {
    const title = `FitTrack - ${userName || userEmail}`;
    
    // Create new empty spreadsheet with first tab
    const createPayload = {
      properties: { title },
      sheets: SHEET_TABS.map(tab => ({
        properties: { title: tab }
      }))
    };

    const created = await this.fetchWithAuth(
      'https://sheets.googleapis.com/v4/spreadsheets',
      {
        method: 'POST',
        body: JSON.stringify(createPayload)
      }
    );

    const spreadsheetId = created.spreadsheetId;
    this.spreadsheetId = spreadsheetId;

    // Write initial header rows to all tabs
    const headerData = SHEET_TABS.map(tab => ({
      range: `${tab}!A1`,
      values: [SHEET_HEADERS[tab]]
    }));

    await this.fetchWithAuth(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: headerData
        })
      }
    );

    return spreadsheetId;
  }

  /**
   * Append a single row of values to a specific sheet tab
   */
  async appendRow(tab: string, values: any[]) {
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID is not set.');
    return this.fetchWithAuth(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${tab}!A:A:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({
          values: [values.map(v => (v === undefined || v === null ? '' : v))]
        })
      }
    );
  }

  /**
   * Append multiple rows in a single batch
   */
  async appendRows(tab: string, rows: any[][]) {
    if (!this.spreadsheetId || rows.length === 0) return;
    return this.fetchWithAuth(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${tab}!A:A:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({
          values: rows.map(r => r.map(v => (v === undefined || v === null ? '' : v)))
        })
      }
    );
  }

  /**
   * Read all data from a specific tab (excluding header row)
   */
  async readTab(tab: string): Promise<any[][]> {
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID is not set.');
    const result = await this.fetchWithAuth(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${tab}!A2:Z1000`
    );
    return result.values || [];
  }

  /**
   * Synchronize Food Log to Sheet (Unified with User Name)
   */
  async syncFoodLog(log: FoodLog, userName: string = 'แม็กนั่ม') {
    const finalUserName = log.user_name || userName;
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_food', data: log, user_name: finalUserName }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncFoodLog error:', e);
      }
    }

    if (!this.accessToken) return;

    // Matches SHEET_HEADERS.food_logs: ['user_name', 'date', 'time', 'meal', 'name', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'fiber_g', 'grams', 'source', 'log_id']
    const row = [
      finalUserName,
      log.date,
      log.time,
      log.meal,
      log.name,
      log.kcal,
      log.protein_g,
      log.carb_g,
      log.fat_g,
      log.fiber_g || 0,
      log.grams,
      log.source,
      log.log_id,
    ];
    return this.appendRow('food_logs', row);
  }

  /**
   * Synchronize Predefined Food Database to Sheet
   */
  async syncFoodDatabase(foods: Array<{
    name_th: string;
    name_en: string;
    category_label_th: string;
    serving_size: string;
    grams: number;
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    fiber_g: number;
    note?: string;
  }>) {
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync_food_database', data: foods }),
        });
      } catch (e) {
        console.warn('Apps Script syncFoodDatabase error:', e);
      }
    }

    if (!this.accessToken) return;

    const rows = foods.map((f) => [
      f.name_th,
      f.name_en,
      f.category_label_th,
      f.serving_size,
      f.grams,
      f.kcal,
      f.protein_g,
      f.carb_g,
      f.fat_g,
      f.fiber_g,
      f.note || '',
    ]);

    return this.appendRows('food_database', rows);
  }

  /**
   * Synchronize Workout Session and Sets to Sheet (Unified with User Name)
   */
  async syncWorkoutSession(session: WorkoutSession, sets: WorkoutSet[], userName: string = 'แม็กนั่ม') {
    const finalUserName = session.user_name || userName;
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_workout', session, sets, user_name: finalUserName }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncWorkoutSession error:', e);
      }
    }

    if (!this.accessToken) return;

    // 1. Session Row: ['user_name', 'date', 'program_name', 'start_time', 'end_time', 'note', 'session_id']
    const sessionRow = [
      finalUserName,
      session.date,
      session.program_name || session.program_id || 'ทั่วไป',
      session.start_time,
      session.end_time || '',
      session.note || '',
      session.session_id,
    ];
    await this.appendRow('workout_sessions', sessionRow);

    // 2. Sets Rows: ['user_name', 'date', 'exercise_name', 'set_no', 'weight_kg', 'reps', 'rpe', 'done', 'session_id']
    if (sets.length > 0) {
      const setRows = sets.map(s => [
        finalUserName,
        session.date,
        s.exercise_name || s.exercise_id,
        s.set_no,
        s.weight_kg,
        s.reps,
        s.rpe || '',
        s.done ? 'TRUE' : 'FALSE',
        session.session_id,
      ]);
      await this.appendRows('workout_sets', setRows);
    }
  }

  /**
   * Synchronize Body Metric (Unified with User Name)
   */
  async syncBodyMetric(metric: BodyMetric, userName: string = 'แม็กนั่ม') {
    const finalUserName = metric.user_name || userName;
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_metric', data: metric, user_name: finalUserName }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncBodyMetric error:', e);
      }
    }

    if (!this.accessToken) return;

    // Matches SHEET_HEADERS.body_metrics: ['user_name', 'date', 'weight_kg', 'body_fat_pct', 'waist_cm', 'chest_cm', 'shoulders_cm', 'thigh_cm', 'hips_cm', 'arm_cm', 'calf_cm', 'neck_cm', 'note']
    const row = [
      finalUserName,
      metric.date,
      metric.weight_kg,
      metric.body_fat_pct || '',
      metric.waist_cm || '',
      metric.chest_cm || '',
      metric.shoulders_cm || '',
      metric.thigh_cm || '',
      metric.hips_cm || '',
      metric.arm_cm || '',
      metric.calf_cm || '',
      metric.neck_cm || '',
      metric.note || '',
    ];
    return this.appendRow('body_metrics', row);
  }

  /**
   * Synchronize Profile to Sheet (Unified with User Name)
   */
  async syncProfile(profile: UserProfile, userName: string = 'แม็กนั่ม') {
    const finalUserName = profile.name || userName;
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_profile', data: profile, user_name: finalUserName }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncProfile error:', e);
      }
    }

    if (!this.accessToken) return;

    // Matches SHEET_HEADERS.profile: ['user_name', 'user_id', 'email', 'sex', 'goal', 'kcal_target', 'protein_target_g', 'carb_target_g', 'fat_target_g', 'height_cm', 'waist_cm', 'chest_cm', 'shoulders_cm', 'thigh_cm', 'hips_cm', 'arm_cm', 'calf_cm', 'neck_cm', 'updated_at']
    const row = [
      finalUserName,
      profile.user_id || '',
      profile.email || '',
      profile.sex || '',
      profile.goal || '',
      profile.kcal_target || '',
      profile.protein_target_g || '',
      profile.carb_target_g || '',
      profile.fat_target_g || '',
      profile.height_cm || '',
      profile.waist_cm || '',
      profile.chest_cm || '',
      profile.shoulders_cm || '',
      profile.thigh_cm || '',
      profile.hips_cm || '',
      profile.arm_cm || '',
      profile.calf_cm || '',
      profile.neck_cm || '',
      new Date().toISOString(),
    ];
    return this.appendRow('profile', row);
  }
}
