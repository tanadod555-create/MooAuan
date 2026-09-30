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
] as const;

export const SHEET_HEADERS: Record<string, string[]> = {
  profile: ['user_id', 'email', 'name', 'sex', 'birth_year', 'height_cm', 'goal', 'kcal_target', 'protein_target_g', 'created_at'],
  body_metrics: ['date', 'weight_kg', 'body_fat_pct', 'waist_cm', 'note'],
  exercises: ['exercise_id', 'name_en', 'name_th', 'category', 'muscle_primary', 'muscle_secondary', 'pattern', 'equipment', 'is_custom'],
  programs: ['program_id', 'name', 'day_of_week', 'note'],
  program_items: ['program_id', 'order', 'exercise_id', 'target_sets', 'target_reps', 'target_weight_kg'],
  workout_sessions: ['session_id', 'date', 'program_id', 'start_time', 'end_time', 'note'],
  workout_sets: ['set_id', 'session_id', 'exercise_id', 'set_no', 'weight_kg', 'reps', 'rpe', 'done'],
  food_logs: ['log_id', 'date', 'time', 'meal', 'name', 'image_ref', 'grams', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'fiber_g', 'sugar_g', 'sodium_mg', 'micros_json', 'source', 'confidence'],
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
   * Synchronize Food Log to Sheet
   */
  async syncFoodLog(log: FoodLog) {
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_food', data: log }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncFoodLog error:', e);
      }
    }

    if (!this.accessToken) return;

    const row = [
      log.log_id,
      log.date,
      log.time,
      log.meal,
      log.name,
      log.image_ref || '',
      log.grams,
      log.kcal,
      log.protein_g,
      log.carb_g,
      log.fat_g,
      log.fiber_g || 0,
      log.sugar_g || 0,
      log.sodium_mg || 0,
      JSON.stringify(log.micros || {}),
      log.source,
      log.confidence || 1.0,
    ];
    return this.appendRow('food_logs', row);
  }

  /**
   * Synchronize Workout Session and Sets to Sheet
   */
  async syncWorkoutSession(session: WorkoutSession, sets: WorkoutSet[]) {
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_workout', session, sets }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncWorkoutSession error:', e);
      }
    }

    if (!this.accessToken) return;

    // 1. Session Row
    const sessionRow = [
      session.session_id,
      session.date,
      session.program_id || '',
      session.start_time,
      session.end_time || '',
      session.note || '',
    ];
    await this.appendRow('workout_sessions', sessionRow);

    // 2. Sets Rows
    if (sets.length > 0) {
      const setRows = sets.map(s => [
        s.set_id,
        session.session_id,
        s.exercise_id,
        s.set_no,
        s.weight_kg,
        s.reps,
        s.rpe || '',
        s.done ? 'TRUE' : 'FALSE'
      ]);
      await this.appendRows('workout_sets', setRows);
    }
  }

  /**
   * Synchronize Body Metric
   */
  async syncBodyMetric(metric: BodyMetric) {
    if (this.appsScriptUrl) {
      try {
        await fetch(this.appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_metric', data: metric }),
        });
        return { success: true };
      } catch (e) {
        console.warn('Apps Script syncBodyMetric error:', e);
      }
    }

    if (!this.accessToken) return;

    const row = [
      metric.date,
      metric.weight_kg,
      metric.body_fat_pct || '',
      metric.waist_cm || '',
      metric.note || '',
    ];
    return this.appendRow('body_metrics', row);
  }
}
