# FitTrack – Gym & Nutrition Tracker (สำหรับ 2 คน)

เว็บแอปพลิเคชันสำหรับบันทึกการออกกำลังกายและติดตามโภชนาการ รองรับการใช้งาน 2 คน (เจ้าของ + แฟน) ออกแบบสไตล์ Dark UI ระดับมืออาชีพ (Hevy-inspired) พร้อมระบบ Anatomy กายวิภาคแบบ Interactive, สแกนวิเคราะห์อาหารด้วย Gemini Multimodal AI และบันทึกข้อมูลทั้งหมดลงใน Google Sheets ผ่าน Google Sheets API v4

---

## ฟีเจอร์หลัก (Core Features)

1. **Interactive Anatomy (แผนผังกายวิภาคโต้ตอบได้)**
   - สลับดูร่างกายด้านหน้า (Front) และด้านหลัง (Back)
   - แตะกล้ามเนื้อแล้วเรืองแสงนีออน (Emerald & Sky Blue Glow) พร้อมแสดงชื่อทางการแพทย์ (Latin & Thai) เช่น `อก · Pectoralis major`, `หลังกว้าง · Latissimus dorsi`
   - แสดงกล้ามเนื้อย่อย (Sub-muscles) และกรองรายการท่าฝึกสำหรับมัดนั้นทันที
   - แตะชื่อท่าเพื่อเปิด Bottom Sheet ดูวิธีเล่น, เทคนิคการเกร็ง, ฟีลลิ่งที่ควรรู้สึก, การหายใจ และข้อผิดพลาดที่พบบ่อย พร้อมปุ่มกดเพิ่มเข้าเซสชันการฝึกวันนี้ได้ทันที

2. **Hevy-style Gym Workout Logger (บันทึกเซสชันในยิม)**
   - เริ่มฝึกแบบเปิด (Empty Workout) หรือเริ่มจากโปรแกรมประจำสัปดาห์ (Push Day, Pull Day, Leg Day)
   - ตารางบันทึกเซ็ตเรียลไทม์: Set #, น้ำหนัก (kg), จำนวนครั้ง (Reps), ปุ่มติ๊กเสร็จสิ้น `[✓]`
   - นาฬิกาจับเวลาพักระหว่างเซ็ต (Rest Timer) นับถอยหลังอัตโนมัติ 60s, 90s, 120s
   - บันทึกประวัติและคำนวณ Total Volume ยกสะสม (kg) ซิงค์เข้า Google Sheet

3. **คลังท่าออกกำลังกาย (Exercise Library)**
   - ค้นหาได้ทั้งภาษาไทยและอังกฤษ
   - แยกหมวดหมู่: Strength, Warm Up, Cool Down
   - กรองตามอุปกรณ์ (Barbell, Dumbbell, Cable, Machine, Bodyweight) และ Movement Pattern (Press, Pull, Squat, Hinge, Curl, Raise, Core, Calf)
   - สร้างท่าฝึกของตัวเองได้อิสระ (`is_custom = true`)

4. **บันทึกอาหารด้วยรูปภาพผ่าน Gemini AI (Food & Nutrition Tracker)**
   - ถ่ายรูปอาหารหรือเลือกรูปจากเครื่อง → ย่อขนาดฝั่ง Client (1024px JPEG) ประหยัดเน็ตและความเร็ว
   - วิเคราะห์พลังงาน (Kcal), โปรตีน (Protein), คาร์โบไฮเดรต (Carbs), ไขมัน (Fat) และแร่ธาตุวิตามิน (Micronutrients)
   - แสดงผลใน Modal ที่ผู้ใช้สามารถแก้ไขชื่อและตัวเลขทุกช่องได้อิสระก่อนกดยืนยันบันทึก
   - มีระบบกรอกอาหารเอง (Manual Entry) สำหรับวันที่ไม่ได้ถ่ายรูป
   - แสดงหลอดความก้าวหน้าเทียบกับเป้าหมาย Kcal & Macros ประจำวันของโปรไฟล์

5. **ระบบแยกโปรไฟล์ 2 คน (Owner + Partner)**
   - สลับโปรไฟล์ระหว่าง "Me (Trainer)" กับ "แฟน (Babe)" ได้ทันทีที่แถบด้านบน
   - แยกน้ำหนัก เป้าหมายสารอาหาร และ Google Spreadsheet ของแต่ละคนอย่างเป็นสัดส่วน

6. **สถิติ & กราฟความก้าวหน้า (Progressive Overload & Body Metrics)**
   - บันทึกประวัติน้ำหนักตัว, % ไขมัน (Body Fat), รอบเอว (Waist)
   - กราฟเส้น SVG แสดงแนวโน้มน้ำหนักตัว (Weight Progression Trend)
   - สำรองข้อมูลทั้งหมดเป็น JSON Backup ได้ด้วยคลิกเดียว

---

## โครงสร้าง Google Sheets (1 ไฟล์ต่อผู้ใช้)

เมื่อทำการเชื่อมต่อและสร้าง Spreadsheet ระบบจะสร้างแท็บทั้ง 8 ให้อัตโนมัติ:
- `profile`: user_id, email, name, sex, birth_year, height_cm, goal, kcal_target, protein_target_g, created_at
- `body_metrics`: date, weight_kg, body_fat_pct, waist_cm, note
- `exercises`: exercise_id, name_en, name_th, category, muscle_primary, muscle_secondary, pattern, equipment, is_custom
- `programs`: program_id, name, day_of_week, note
- `program_items`: program_id, order, exercise_id, target_sets, target_reps, target_weight_kg
- `workout_sessions`: session_id, date, program_id, start_time, end_time, note
- `workout_sets`: set_id, session_id, exercise_id, set_no, weight_kg, reps, rpe, done
- `food_logs`: log_id, date, time, meal, name, image_ref, grams, kcal, protein_g, carb_g, fat_g, fiber_g, sugar_g, sodium_mg, micros_json, source, confidence

---

## วิธีรันบนเครื่อง Local

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. รันโหมด Development
npm run dev

# 3. บิลด์สำหรับ Production
npm run build
```

---

## การตั้งค่า Google OAuth & Google Sheets API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ แล้วเปิดใช้งาน **Google Sheets API** และ **Google Drive API**
3. ไปที่ **APIs & Services > Credentials** > สร้าง **OAuth Client ID** ชนิด **Web application**
4. ตั้งค่า **Authorized JavaScript origins**:
   - สำหรับ Local: `http://localhost:5173`
   - สำหรับ GitHub Pages: `https://<your-username>.github.io`
5. คัดลอก **Client ID** มาวางในหน้า "โปรไฟล์ > Google & API" ในแอป
6. กดปุ่ม **"ลงชื่อเข้าใช้ด้วย Google (Sign in)"** เพื่อขอ Access Token
7. กดปุ่ม **"สร้าง Sheet อัตโนมัติ / ซิงค์เดี๋ยวนี้"** ระบบจะสร้างไฟล์ Google Sheets พร้อม 8 แท็บและคอลัมน์มาตรฐานทั้งหมดให้ทันที!

---

## การตั้งค่า Gemini AI สำหรับสแกนอาหาร

มี 2 ทางเลือก:

### ทางเลือกที่ 1: ใส่ Gemini API Key โดยตรงในแอป (ง่ายที่สุด)
- รับ API Key ฟรีได้จาก [Google AI Studio](https://aistudio.google.com/)
- นำ API Key มากรอกในหน้า "โปรไฟล์ > Google & API > Gemini API Key"
- *หมายเหตุ: คีย์จะถูกเก็บอยู่ใน LocalStorage ในเบราว์เซอร์ของเครื่องคุณเท่านั้น ปลอดภัยสำหรับการใช้งานส่วนตัว*

### ทางเลือกที่ 2: ใช้ Proxy (Cloudflare Worker หรือ Google Apps Script)
สำหรับกรณีที่ต้องการแชร์ให้แฟนใช้โดยไม่ต้องแจก API Key:
- **Cloudflare Worker**: โค้ดพร้อมใช้งานอยู่ใน `proxy/cloudflare-worker.js`
- **Google Apps Script**: โค้ดพร้อมใช้งานอยู่ใน `proxy/google-apps-script.js`
- นำ URL ของ Worker หรือ Web App มาใส่ในช่อง Proxy URL ในหน้าการตั้งค่า

---

## การ Deploy ขึ้น GitHub Pages

โปรเจกต์มี GitHub Actions CI/CD อยู่ที่ `.github/workflows/deploy.yml` เรียบร้อยแล้ว:
1. สร้าง Repository บน GitHub และ Push โค้ดขึ้นไป:
   ```bash
   git init
   git add .
   git commit -m "feat: complete FitTrack app implementation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. บน GitHub ไปที่ **Settings > Pages > Build and deployment**:
   - Source: เลือก **GitHub Actions**
3. เมื่อ Push ไปที่ branch `main` ระบบจะทำการ Build และ Deploy ขึ้น GitHub Pages อัตโนมัติ!
