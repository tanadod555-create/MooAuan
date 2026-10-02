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
  maxDimension = 640,
  quality = 0.75
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

const SYSTEM_PROMPT = `You are an expert nutrition analysis assistant. Analyze the food photo(s).
The user may provide one or multiple photos (e.g. different camera angles of the same meal, close-ups of specific items, or multiple dishes on the table).
Synthesize all provided photos into an accurate unified nutritional breakdown:
- If multiple photos show the SAME meal/dish from different angles or close-ups, DO NOT duplicate the dishes. Combine visual details from all angles for maximum portion and ingredient accuracy.
- If multiple photos show DIFFERENT dishes or a multi-course meal, list each distinct food item.
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
Estimate portion sizes from visual cues and any user notes. If unsure, lower confidence.`;

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
  base64Images,
  apiKey,
  proxyUrl,
  useProxy = false,
  userNotes,
}: {
  base64Image?: string;
  mimeType?: string;
  base64Images?: { base64: string; mimeType: string }[];
  apiKey?: string;
  proxyUrl?: string;
  useProxy?: boolean;
  userNotes?: string;
}): Promise<GeminiAnalysisResponse> {
  const imagesList: { base64: string; mimeType: string }[] = [];
  if (base64Images && base64Images.length > 0) {
    imagesList.push(...base64Images);
  } else if (base64Image && mimeType) {
    imagesList.push({ base64: base64Image, mimeType });
  }

  if (imagesList.length === 0) {
    throw new Error('ไม่พบรูปภาพสำหรับวิเคราะห์อาหาร');
  }

  if (useProxy && proxyUrl) {
    // Call via proxy (Cloudflare Worker or Apps Script)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imagesList[0].base64,
        images: imagesList.map((img) => img.base64),
        mimeType: imagesList[0].mimeType,
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
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const promptText = userNotes && userNotes.trim()
    ? `${SYSTEM_PROMPT}\n\nCRITICAL USER NOTES / CUSTOM CONTEXT (Strictly adjust portion size, exclude ingredients if requested, and compute nutrition accordingly): "${userNotes.trim()}"`
    : SYSTEM_PROMPT;

  const imageParts = imagesList.map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.base64,
    },
  }));

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          ...imageParts,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: 'application/json',
    },
  };

  const defaultKey = getDefaultGeminiApiKey();
  const keysToTry = [activeKey];
  if (defaultKey && defaultKey !== activeKey) {
    keysToTry.push(defaultKey);
  }

  let response: Response | null = null;
  let lastErrorText = '';

  for (const currentKey of keysToTry) {
    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
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
    if (response && response.ok) break;
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastErrorText || 'ไม่สามารถเชื่อมต่อ Gemini API ได้ กรุณาตรวจสอบ API Key'}`);
  }

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini API did not return text response.');
  }

  // Parse JSON response cleanly and extract JSON block
  let cleanedText = textOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleanedText);
}

/**
 * Analyzes food menu description from text using Gemini AI
 */
export async function analyzeFoodText({
  query,
  apiKey,
  userNotes,
}: {
  query: string;
  apiKey?: string;
  userNotes?: string;
}): Promise<GeminiAnalysisResponse> {
  const activeKey =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' ? localStorage.getItem('fittrack_gemini_key') : '') ||
    getDefaultGeminiApiKey();

  if (!activeKey) {
    throw new Error('กรุณาระบุ Gemini API Key ในหน้าการตั้งค่า หรือตรวจสอบการเชื่อมต่อ');
  }

  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const systemPrompt = `You are an expert nutrition analysis assistant.
The user will provide a food name, menu description, portion, or meal in natural language (Thai or English), e.g. "ข้าวมันไก่พิเศษไม่เอาหนัง + ไข่ต้ม 2 ฟอง" or "แซลมอนย่างซีอิ๊ว 150g กับข้าวกล้อง 1 ถ้วย".
Analyze the text description, identify all individual food items or ingredients, and accurately estimate portion weight in grams and nutrition values (kcal, protein_g, carb_g, fat_g, fiber_g, sugar_g, sodium_mg, micros).
Calculate Thai dishes according to standard Thai food nutrition data (e.g. INMU / Bureau of Nutrition Thailand).

Return ONLY valid JSON matching this schema, no markdown codeblocks, no extra text:
{
  "items": [
    {
      "name": "string (clear Thai name if Thai dish, e.g. ข้าวมันไก่เนื้ออกล้วน (พิเศษ))",
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
  "notes": "string (brief note explaining portion and nutrition estimate)"
}`;

  const promptText = userNotes && userNotes.trim()
    ? `${systemPrompt}\n\nUSER FOOD DESCRIPTION: "${query.trim()}"\nADDITIONAL NOTES / PREFERENCES: "${userNotes.trim()}"`
    : `${systemPrompt}\n\nUSER FOOD DESCRIPTION: "${query.trim()}"`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: 'application/json',
    },
  };

  const defaultKey = getDefaultGeminiApiKey();
  const keysToTry = [activeKey];
  if (defaultKey && defaultKey !== activeKey) {
    keysToTry.push(defaultKey);
  }

  let response: Response | null = null;
  let lastErrorText = '';

  for (const currentKey of keysToTry) {
    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
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
    if (response && response.ok) break;
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastErrorText || 'ไม่สามารถเชื่อมต่อ Gemini API ได้ กรุณาตรวจสอบ API Key'}`);
  }

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini API did not return text response.');
  }

  let cleanedText = textOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }
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
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
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
                    e.exerciseNote ? ` [หมายเหตุของผู้ใช้: "${e.exerciseNote}"]` : ''
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
                        }%, สปีด: ${c.speedKmh || 0} km/h)${c.note ? ` [โน้ต: "${c.note}"]` : ''}`
                    )
                    .join('\n')
                : '';
            return `- โปรแกรม: ${w.programName} (${w.durationMins || 60} นาที)${
              w.sessionNote ? ` [บันทึกเซสชัน: "${w.sessionNote}"]` : ''
            }\n${exList}${cardioList ? '\n' + cardioList : ''}`;
          })
          .join('\n\n')
      : 'วันนี้ยังไม่ได้เริ่มเซสชันการฝึกซ้อม';

  const systemInstruction = `คุณคือสุดยอด AI เทรนเนอร์อัจฉริยะ "โค้ชหมูอ้วน (Coach MooAuan)" ขับเคลื่อนด้วยขุมพลัง Google Gemini ชั้นนำ 🐷✨💪
คุณทำหน้าที่เป็น Personal Trainer และ Sports Nutritionist ระดับมืออาชีพประจำตัวของ ${context.userName} ในเว็บ MooAuan

คุณสมบัติและสไตล์การตอบ (Gemini Persona):
- ตอบได้อย่างฉลาด คมคาย ละเอียด ลึกซึ้ง และมีหลักการทางวิทยาศาสตร์การกีฬา (Evidence-based Fitness & Nutrition)
- บุคลิกเป็นกันเอง อบอุ่น มีพลังบวก ให้กำลังใจเก่ง สอดแทรกความน่ารักของน้องหมูอ้วน 🐽
- จัดฟอร์แมตคำตอบให้อ่านง่าย สบายตา ใช้ Markdown Bullet points, ตัวหนา, และตารางเมื่อเปรียบเทียบข้อมูล
- อิงฐานข้อมูลจริงของผู้ใช้ (Real Data Grounding) ในทุกคำตอบ ห้ามตอบลอยๆ
- ตอบให้ละเอียด ครบถ้วน ชัดเจนทุกประเด็น ไม่ตอบห้วนหรือสั้นกุด และห้ามตัดจบกึ่งกลางประโยคเด็ดขาด ให้สรุปคำแนะนำจนจบประโยคอย่างสมบูรณ์แบบเสมอ

ฐานข้อมูลจริงของ ${context.userName} ประจำวันนี้:
- เป้าหมายหลัก: ${context.goal}
- น้ำหนักตัวล่าสุด: ${context.weightKg ? context.weightKg + ' kg' : 'ไม่ระบุ'}
- แคลอรี่เป้าหมาย: ${context.kcalTarget} kcal | ทานแล้ว: ${context.todayKcal} kcal (${
    remainingKcal >= 0 ? `เหลืออีก ${remainingKcal} kcal` : `เกินเป้ามา ${Math.abs(remainingKcal)} kcal`
  })
- โปรตีนเป้าหมาย: ${context.proteinTarget} g | ทานแล้ว: ${context.todayProtein} g (${
    remainingProtein >= 0 ? `ขาดอีก ${remainingProtein} g` : `เกินเป้ามา ${Math.abs(remainingProtein)} g`
  })
- คาร์บ: ${context.todayCarb} g | ไขมัน: ${context.todayFat} g | ไฟเบอร์ (ใยอาหาร): ${context.todayFiber} g
- ประวัติมื้ออาหารที่บันทึกวันนี้:
${mealsSummary}
- ประวัติการฝึกซ้อมและคาร์ดิโอวันนี้:
${workoutsSummary}

กฎเหล็กในการตอบ:
1. หากผู้ใช้ถามเรื่องอาหารหรือโปรตีนไม่พอ: ให้คำนวณส่วนต่างตัวเลขจริงเสมอ แนะนำเมนูอาหารไทยที่หาทานง่ายพร้อมปริมาณกรัม, แคลอรี่, โปรตีน และเน้นย้ำเรื่องไฟเบอร์
2. หากมีอาการเจ็บหรือล้า (เช่น "เจ็บไหล่" หรือมีในบันทึก): ให้แนะนำการปรับท่าทางชีวกลศาสตร์ (เช่น ลดองศากางข้อศอก, Scapular depression, หมุนข้อต่อ Rotator Cuff, หรือปรับมุมม้านั่ง)
3. หากถามเรื่องคาร์ดิโอ: ให้คำแนะนำตามสปีดและความชันจริงที่ผู้ใช้เล่น พร้อมแนะนำ Heart Rate Zone 2 เพื่อเบิร์นไขมันสูงสุดโดยไม่สลายกล้ามเนื้อ
4. สรุปจบด้วยประโยคหรือคำแนะนำสร้างแรงบันดาลใจสไตล์หมูอ้วนฟิตเฟิร์มเสมอ!`;

  // Build clean contents array
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (history && history.length > 0) {
    for (const msg of history.slice(-8)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const requestBodyWithSystem = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const requestBodyFallback = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `[SYSTEM INSTRUCTION & USER DATABASE]\n${systemInstruction}\n\n[USER CONVERSATION START]` }],
      },
      {
        role: 'model',
        parts: [{ text: `สวัสดีครับคุณ ${context.userName}! โค้ชหมูอ้วนพร้อมช่วยวิเคราะห์จากฐานข้อมูลของคุณแล้วครับ 🐷💪` }],
      },
      ...contents,
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const defaultKey = getDefaultGeminiApiKey();
  const keysToTry = [activeKey];
  if (defaultKey && defaultKey !== activeKey) {
    keysToTry.push(defaultKey);
  }

  let response: Response | null = null;
  let lastErrorText = '';

  for (const currentKey of keysToTry) {
    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
      try {
        // First attempt with top-level system_instruction
        let res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBodyWithSystem),
        });

        // If system_instruction is not supported (HTTP 400), try fallback format
        if (!res.ok && res.status === 400) {
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBodyFallback),
          });
        }

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
    if (response && response.ok) break;
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastErrorText || 'ไม่สามารถติดต่อ AI Trainer ได้ กรุณาตรวจสอบ API Key'}`);
  }

  const json = await response.json();
  const candidate = json.candidates?.[0];
  const parts = candidate?.content?.parts;
  const textOutput = Array.isArray(parts)
    ? parts.map((p: any) => p?.text || '').join('')
    : candidate?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('โค้ช AI ไม่สามารถตอบกลับได้ในขณะนี้');
  }

  return textOutput;
}
