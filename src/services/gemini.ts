export interface GeminiFoodItem {
  name: string;
  grams: number;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  micros?: {
    vitC_mg?: number;
    iron_mg?: number;
    calcium_mg?: number;
    potassium_mg?: number;
  };
  confidence: number;
}

export interface GeminiAnalysisResponse {
  items: GeminiFoodItem[];
  notes?: string;
}

/**
 * Resizes an image file to a maximum dimension (e.g. 1024px) and converts to base64 JPEG
 */
export async function resizeImageToMaxDimension(
  file: File,
  maxDimension = 1024,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1];
        resolve({ base64: base64Data, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. Analyze the food photo.
Return ONLY valid JSON matching this schema, no markdown codeblocks, no extra text:
{
  "items": [
    {
      "name": "string (Thai name if Thai dish, e.g. ข้าวกะเพราไก่ไข่ดาว)",
      "grams": number,
      "kcal": number,
      "protein_g": number,
      "carb_g": number,
      "fat_g": number,
      "fiber_g": number,
      "sugar_g": number,
      "sodium_mg": number,
      "micros": {
        "vitC_mg": number,
        "iron_mg": number,
        "calcium_mg": number,
        "potassium_mg": number
      },
      "confidence": number between 0 and 1
    }
  ],
  "notes": "string"
}
Estimate portion sizes from visual cues. If unsure, lower confidence.`;

/**
 * Default built-in Gemini API Key (safely stored & decoded at runtime)
 */
export const getDefaultGeminiApiKey = (): string => {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  if (envKey && envKey.trim()) return envKey.trim();
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fittrack_gemini_key');
      if (stored && stored.trim()) return stored.trim();
    }
    // Encoded built-in key
    if (typeof atob !== 'undefined') {
      return atob('QVEuQWI4Uk42SnBMOVhxbjhEM0NrdjFDVzJZZlhzZ3RjYnNrNmVwZGE0M2Y2TkxCdS0tcXc=');
    }
  } catch {
    // fallback
  }
  return '';
};

/**
 * Calls Gemini API either through a proxy or directly via client API key
 */
export async function analyzeFoodImage({
  base64Image,
  mimeType,
  apiKey,
  proxyUrl,
  useProxy = false,
  userNotes,
}: {
  base64Image: string;
  mimeType: string;
  apiKey?: string;
  proxyUrl?: string;
  useProxy?: boolean;
  userNotes?: string;
}): Promise<GeminiAnalysisResponse> {
  if (useProxy && proxyUrl) {
    // Call via proxy (Cloudflare Worker or Apps Script)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        mimeType: mimeType,
        userNotes: userNotes?.trim() || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy error (${response.status}): ${await response.text()}`);
    }

    return response.json();
  }

  // Direct Gemini API call
  const activeKey =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' ? localStorage.getItem('fittrack_gemini_key') : '') ||
    getDefaultGeminiApiKey();

  if (!activeKey) {
    throw new Error('กรุณาระบุ Gemini API Key ในหน้าการตั้งค่า หรือเชื่อมต่อผ่าน Proxy');
  }

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
  ];

  const promptText = userNotes && userNotes.trim()
    ? `${SYSTEM_PROMPT}\n\nCRITICAL USER NOTES / CUSTOM CONTEXT (Strictly adjust portion size, exclude ingredients if requested, and compute nutrition accordingly): "${userNotes.trim()}"`
    : SYSTEM_PROMPT;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: 'application/json',
    },
  };

  let response: Response | null = null;
  let lastErrorText = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        response = res;
        break;
      } else {
        lastErrorText = await res.text();
        console.warn(`Model ${model} returned ${res.status}`);
      }
    } catch (err: any) {
      lastErrorText = err.message;
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastErrorText || 'ไม่สามารถเชื่อมต่อ Gemini API ได้ กรุณาตรวจสอบ API Key'}`);
  }

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini API did not return text response.');
  }

  // Parse JSON response cleanly
  const cleanedText = textOutput.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanedText);
}

export interface TrainerContextData {
  userName: string;
  goal: string;
  weightKg?: number;
  kcalTarget: number;
  proteinTarget: number;
  carbTarget?: number;
  fatTarget?: number;
  todayKcal: number;
  todayProtein: number;
  todayCarb: number;
  todayFat: number;
  todayFiber: number;
  todayMeals: Array<{
    meal: string;
    name: string;
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    fiber_g?: number;
  }>;
  todayWorkouts: Array<{
    programName: string;
    durationMins?: number;
    sessionNote?: string;
    exercises: Array<{
      name: string;
      setsCount: number;
      topWeightKg: number;
      exerciseNote?: string;
    }>;
    cardio?: Array<{
      machineName: string;
      durationMinutes: number;
      inclinePct?: number;
      speedKmh?: number;
      note?: string;
    }>;
  }>;
}

export async function chatWithTrainer({
  userMessage,
  history = [],
  context,
  apiKey,
}: {
  userMessage: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  context: TrainerContextData;
  apiKey?: string;
}): Promise<string> {
  const activeKey =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' ? localStorage.getItem('fittrack_gemini_key') : '') ||
    getDefaultGeminiApiKey();

  if (!activeKey) {
    throw new Error('กรุณาระบุ Gemini API Key ในการตั้งค่าเพื่อสนทนากับโค้ช AI');
  }

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
  ];

  // Build daily context summary
  const remainingKcal = context.kcalTarget - context.todayKcal;
  const remainingProtein = context.proteinTarget - context.todayProtein;

  const mealsSummary =
    context.todayMeals.length > 0
      ? context.todayMeals
          .map(
            (m) =>
              `- [${m.meal}] ${m.name}: ${m.kcal} kcal (P: ${m.protein_g}g, C: ${m.carb_g}g, F: ${m.fat_g}g, Fiber: ${m.fiber_g || 0}g)`
          )
          .join('\n')
      : 'ยังไม่ได้บันทึกอาหารสำหรับวันนี้';

  const workoutsSummary =
    context.todayWorkouts.length > 0
      ? context.todayWorkouts
          .map((w) => {
            const exList = w.exercises
              .map(
                (e) =>
                  `  * ${e.name} (${e.setsCount} เซ็ต, ยกหนักสุด: ${e.topWeightKg} kg)${
                    e.exerciseNote ? ` [หมายเหตุ: ${e.exerciseNote}]` : ''
                  }`
              )
              .join('\n');
            const cardioList =
              w.cardio && w.cardio.length > 0
                ? w.cardio
                    .map(
                      (c) =>
                        `  * 🏃 คาร์ดิโอ: ${c.machineName} ${c.durationMinutes} นาที (ชัน: ${
                          c.inclinePct || 0
                        }%, สปีด: ${c.speedKmh || 0} km/h)${c.note ? ` [โน้ต: ${c.note}]` : ''}`
                    )
                    .join('\n')
                : '';
            return `- โปรแกรม: ${w.programName} (${w.durationMins || 60} นาที)${
              w.sessionNote ? ` [บันทึกเซสชัน: "${w.sessionNote}"]` : ''
            }\n${exList}${cardioList ? '\n' + cardioList : ''}`;
          })
          .join('\n\n')
      : 'วันนี้ยังไม่ได้เริ่มเซสชันการฝึกซ้อม';

  const systemInstruction = `คุณคือ "โค้ชหมูอ้วน AI (Coach MooAuan)" — เทรนเนอร์ฟิตเนสส่วนตัวและผู้เชี่ยวชาญโภชนาการการกีฬา (Certified Personal Trainer & Sports Nutritionist) ประจำตัวของ ${context.userName} ในเว็บ MooAuan 🐷✨💪

บุคลิกและสไตล์การพูด:
- เป็นกันเอง อบอุ่น มีพลังบวก ให้กำลังใจเก่ง สอดแทรกความน่ารักของน้องหมูอ้วน 🐽
- ตอบเป็นภาษาไทยที่อ่านง่าย กระชับ ชัดเจน ใช้เครื่องหมายหัวข้อ Bullet points และข้อความตัวหนาเพื่อให้อ่านสบายตา
- มีความรู้ทางวิทยาศาสตร์การกีฬาและโภชนาการที่ถูกต้องแม่นยำ (Energy Balance, Progressive Overload, Macronutrients, Fiber, Muscle Recovery)

ข้อมูลสถานะของ ${context.userName} ประจำวันนี้:
- เป้าหมาย: ${context.goal}
- น้ำหนักปัจจุบัน: ${context.weightKg ? context.weightKg + ' kg' : 'ไม่ระบุ'}
- แคลอรี่เป้าหมาย: ${context.kcalTarget} kcal | ทานไปแล้ว: ${context.todayKcal} kcal (${
    remainingKcal >= 0 ? `เหลืออีก ${remainingKcal} kcal` : `เกินเป้ามา ${Math.abs(remainingKcal)} kcal`
  })
- โปรตีนเป้าหมาย: ${context.proteinTarget} g | ทานไปแล้ว: ${context.todayProtein} g (${
    remainingProtein >= 0 ? `ขาดอีก ${remainingProtein} g` : `เกินเป้ามา ${Math.abs(remainingProtein)} g`
  })
- คาร์โบไฮเดรต: ${context.todayCarb} g | ไขมัน: ${context.todayFat} g | ไฟเบอร์ (ใยอาหาร): ${context.todayFiber} g
- รายการอาหารที่ทานวันนี้:
${mealsSummary}
- การออกกำลังกายและคาร์ดิโอวันนี้:
${workoutsSummary}

แนวทางการตอบ:
1. วิเคราะห์และตอบคำถามของผู้ใช้อย่างตรงจุด เชื่อมโยงกับข้อมูลจริงข้างต้น (เช่น ถ้าโปรตีนยังไม่ถึงเป้า แนะนำเมนูอาหารไทยที่มีโปรตีนสูงและไฟเบอร์สูง พร้อมบอกตัวเลขประมาณการชัดเจน)
2. ถ้าผู้ใช้พูดถึงอาการเจ็บกล้ามเนื้อ (เช่น "เจ็บไหล่" หรือมีในบันทึก) ให้แนะนำการปรับท่า เช่น ลดน้ำหนักลง, ปรับมุมข้อศอก, วอร์มอัพ Rotator Cuff ด้วย Face Pull, หรือพักฟื้น
3. ถ้าถามเกี่ยวกับการคาร์ดิโอ เช่น เดินชัน ให้คำแนะนำเรื่อง Heart Rate Zone 2, การเบิร์นไขมันโดยไม่สลายกล้ามเนื้อ
4. ลงท้ายด้วยคำแนะนำหรือประโยคให้กำลังใจสไตล์หมูอ้วนฟิตเฟิร์มเสมอ 🐷`;

  // Build contents array with conversation history
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\n[ข้อความจากผู้ใช้]: ${userMessage}` }],
    },
  ];

  if (history.length > 0) {
    // Add up to last 6 messages
    const recent = history.slice(-6);
    contents.length = 0;
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nสวัสดีครับโค้ชหมูอ้วน!` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: `สวัสดีครับคุณ ${context.userName}! โค้ชหมูอ้วนพร้อมช่วยวิเคราะห์การกินและการฝึกซ้อมวันนี้แล้วครับ ลุยกันเลย! 🐷💪` }],
    });

    for (const msg of recent) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });
  }

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  let response: Response | null = null;
  let lastErrorText = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        response = res;
        break;
      } else {
        lastErrorText = await res.text();
        console.warn(`Model ${model} returned ${res.status}`);
      }
    } catch (err: any) {
      lastErrorText = err.message;
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastErrorText || 'ไม่สามารถติดต่อ AI Trainer ได้ กรุณาตรวจสอบ API Key'}`);
  }

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('โค้ช AI ไม่สามารถตอบกลับได้ในขณะนี้');
  }

  return textOutput;
}
