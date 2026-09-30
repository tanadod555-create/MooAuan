/**
 * FitTrack - Google Apps Script Backend
 * Project ID: 1AzjOzJKjgrFqUehHtzhojd-_Im7mN3_sXHHKtosOmlJMsRs24Bl8_l0e
 * Target Spreadsheet: 1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A
 * 
 * Instructions:
 * 1. Open your Apps Script project at: https://script.google.com/d/1AzjOzJKjgrFqUehHtzhojd-_Im7mN3_sXHHKtosOmlJMsRs24Bl8_l0e/edit
 * 2. Paste this entire code into Code.gs (replace any existing content)
 * 3. Select function "setupSheets" from the dropdown and click "Run" (กดอนุญาตสิทธิ์ Permission ครั้งแรก)
 *    -> ฟังก์ชันนี้จะสร้าง 8 แท็บมาตรฐานใน Google Sheet ให้อัตโนมัติทันที!
 * 4. Click "Deploy" (การทำให้ใช้งานได้) > "New deployment" (การทำให้ใช้งานได้ใหม่)
 *    - Type: "Web app" (เว็บแอปพลิเคชัน)
 *    - Description: "FitTrack API v1"
 *    - Execute as: "Me" (ฉัน)
 *    - Who has access: "Anyone" (ทุกคน)
 * 5. Click "Deploy" แล้วคัดลอก "Web app URL" มาวางในแอป FitTrack (หน้าโปรไฟล์ > Google & API > Proxy URL)
 */

var SPREADSHEET_ID = "1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A";

var SHEET_HEADERS = {
  profile: ['user_name', 'user_id', 'email', 'sex', 'goal', 'kcal_target', 'protein_target_g', 'carb_target_g', 'fat_target_g', 'height_cm', 'updated_at'],
  body_metrics: ['user_name', 'date', 'weight_kg', 'body_fat_pct', 'waist_cm', 'note'],
  exercises: ['exercise_id', 'name_en', 'name_th', 'category', 'muscle_primary', 'muscle_secondary', 'pattern', 'equipment'],
  programs: ['user_name', 'program_id', 'name', 'day_of_week', 'note'],
  program_items: ['program_id', 'order', 'exercise_id', 'target_sets', 'target_reps', 'target_weight_kg'],
  workout_sessions: ['user_name', 'date', 'program_name', 'start_time', 'end_time', 'note', 'session_id'],
  workout_sets: ['user_name', 'date', 'exercise_name', 'set_no', 'weight_kg', 'reps', 'rpe', 'done', 'session_id'],
  food_logs: ['user_name', 'date', 'time', 'meal', 'name', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'grams', 'source', 'log_id']
};

/**
 * ฟังก์ชันสร้าง 8 แท็บมาตรฐานพร้อม Header ให้อัตโนมัติ (รันครั้งเดียว)
 */
function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var tabs = Object.keys(SHEET_HEADERS);
  
  tabs.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    // Set headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_HEADERS[tabName]);
      sheet.getRange(1, 1, 1, SHEET_HEADERS[tabName].length)
        .setFontWeight("bold")
        .setBackground("#0f172a")
        .setFontColor("#38bdf8");
      sheet.setFrozenRows(1);
    }
  });

  // Remove default "Sheet1" or "แผ่นงาน1" if unused
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("แผ่นงาน1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
  
  Logger.log("FitTrack Sheets setup completed successfully!");
}

/**
 * Web App HTTP POST Handler (เพิ่มข้อมูลลง Sheet)
 */
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. Setup request
    if (action === "setup") {
      setupSheets();
      return jsonResponse({ success: true, message: "Sheets setup completed" });
    }

    // 2. Add Food Log
    if (action === "add_food" || contents.log_id) {
      var sheet = ss.getSheetByName("food_logs") || ss.insertSheet("food_logs");
      var log = contents.data || contents;
      var userName = contents.user_name || log.user_name || "แม็กนั่ม";

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(SHEET_HEADERS.food_logs);
        sheet.getRange(1, 1, 1, SHEET_HEADERS.food_logs.length)
          .setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
        sheet.setFrozenRows(1);
      }

      var row = [
        userName,
        log.date || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
        log.time || Utilities.formatDate(new Date(), "GMT+7", "HH:mm"),
        log.meal || "lunch",
        log.name || "",
        log.kcal || 0,
        log.protein_g || 0,
        log.carb_g || 0,
        log.fat_g || 0,
        log.grams || 0,
        log.source || "manual",
        log.log_id || "log_" + Date.now()
      ];
      sheet.appendRow(row);
      return jsonResponse({ success: true, message: "Food log saved for " + userName });
    }

    // 3. Add Workout Session & Sets
    if (action === "add_workout") {
      var sessSheet = ss.getSheetByName("workout_sessions") || ss.insertSheet("workout_sessions");
      var setSheet = ss.getSheetByName("workout_sets") || ss.insertSheet("workout_sets");
      var session = contents.session;
      var sets = contents.sets || [];
      var userName = contents.user_name || (session && session.user_name) || "แม็กนั่ม";

      if (sessSheet.getLastRow() === 0) {
        sessSheet.appendRow(SHEET_HEADERS.workout_sessions);
        sessSheet.getRange(1, 1, 1, SHEET_HEADERS.workout_sessions.length)
          .setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
        sessSheet.setFrozenRows(1);
      }

      if (setSheet.getLastRow() === 0) {
        setSheet.appendRow(SHEET_HEADERS.workout_sets);
        setSheet.getRange(1, 1, 1, SHEET_HEADERS.workout_sets.length)
          .setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
        setSheet.setFrozenRows(1);
      }

      if (session) {
        sessSheet.appendRow([
          userName,
          session.date || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
          session.program_name || session.program_id || "ทั่วไป",
          session.start_time,
          session.end_time || "",
          session.note || "",
          session.session_id
        ]);
      }

      if (sets && sets.length > 0) {
        sets.forEach(function(s) {
          setSheet.appendRow([
            userName,
            (session && session.date) || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
            s.exercise_name || s.exercise_id,
            s.set_no,
            s.weight_kg,
            s.reps,
            s.rpe || "",
            s.done ? "TRUE" : "FALSE",
            (session && session.session_id) || ""
          ]);
        });
      }
      return jsonResponse({ success: true, message: "Workout session saved for " + userName });
    }

    // 4. Add Body Metric
    if (action === "add_metric") {
      var metricSheet = ss.getSheetByName("body_metrics") || ss.insertSheet("body_metrics");
      var m = contents.data;
      var userName = contents.user_name || (m && m.user_name) || "แม็กนั่ม";

      if (metricSheet.getLastRow() === 0) {
        metricSheet.appendRow(SHEET_HEADERS.body_metrics);
        metricSheet.getRange(1, 1, 1, SHEET_HEADERS.body_metrics.length)
          .setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
        metricSheet.setFrozenRows(1);
      }

      metricSheet.appendRow([
        userName,
        m.date,
        m.weight_kg,
        m.body_fat_pct || "",
        m.waist_cm || "",
        m.note || ""
      ]);
      return jsonResponse({ success: true, message: "Body metric saved for " + userName });
    }

    // 5. Update Profile
    if (action === "update_profile") {
      var pSheet = ss.getSheetByName("profile") || ss.insertSheet("profile");
      var p = contents.data;
      var userName = contents.user_name || (p && p.name) || "แม็กนั่ม";

      if (pSheet.getLastRow() === 0) {
        pSheet.appendRow(SHEET_HEADERS.profile);
        pSheet.getRange(1, 1, 1, SHEET_HEADERS.profile.length)
          .setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
        pSheet.setFrozenRows(1);
      }

      pSheet.appendRow([
        userName,
        p.user_id || "primary",
        p.email || "",
        p.sex || "male",
        p.goal || "",
        p.kcal_target || 2000,
        p.protein_target_g || 140,
        p.carb_target_g || 200,
        p.fat_target_g || 60,
        p.height_cm || "",
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message: "Profile updated for " + userName });
    }

    return jsonResponse({ success: false, message: "Unknown action: " + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Web App HTTP GET Handler (อ่านข้อมูลจาก Sheet)
 */
function doGet(e) {
  try {
    var tab = (e && e.parameter && e.parameter.tab) || "food_logs";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(tab);
    if (!sheet) {
      return jsonResponse({ success: false, message: "Tab not found: " + tab });
    }
    var data = sheet.getDataRange().getValues();
    return jsonResponse({ success: true, tab: tab, rows: data });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
