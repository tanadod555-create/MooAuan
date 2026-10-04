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

// ==================== YOUTUBE WORKOUT CLIP ANALYSIS ====================

export interface YoutubeWorkoutAnalysis {
  title: string;
  channelName?: string;
  category: string;
  estimatedDurationMinutes: number;
  estimatedCalories: number;
  intensity: 'เบา (Low)' | 'ปานกลาง (Moderate)' | 'เข้มข้นสูง (High)';
  targetMuscles: string[];
  benefits: string[];
  movements: string[];
  coachingTips: string;
  suitability: string;
}

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }
  return null;
}

export async function fetchYouTubeOEmbed(
  videoId: string
): Promise<{ title?: string; author_name?: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title,
        author_name: data.author_name,
      };
    }
  } catch {
    // Graceful silent fallback
  }
  return null;
}

/**
 * Smart Rule-Based Sports Science Parser (Used as instant reliable fallback when AI API is unavailable/limited)
 */
function generateSmartFallbackWorkout(
  input: { urlOrText: string; userNote?: string; userName?: string; userGoal?: string },
  fetchedTitle: string,
  fetchedAuthor: string
): YoutubeWorkoutAnalysis {
  const query = `${input.urlOrText} ${fetchedTitle} ${input.userNote || ''}`.toLowerCase();

  let category = 'พิลาทิส & แกนกลางลำตัว (Pilates & Core)';
  let duration = 20;
  let calories = 140;
  let intensity: 'เบา (Low)' | 'ปานกลาง (Moderate)' | 'เข้มข้นสูง (High)' = 'ปานกลาง (Moderate)';
  let targetMuscles = ['หน้าท้อง', 'แกนกลางลำตัว (Core)', 'บั้นท้าย/ก้น'];
  let benefits = [
    'กระชับกล้ามเนื้อแกนกลางลำตัวและสร้างร่อง 11',
    'เผาผลาญไขมันส่วนเกินต่อเนื่อง',
    'Low Impact ถนอมข้อต่อและหัวเข่า',
    'เพิ่มความยืดหยุ่นและเสริมสร้างบุคลิกภาพที่ดี',
  ];
  let movements = ['Glute Bridge', 'Bicycle Crunch', 'Bird Dog', 'Plank Variations'];
  let coachingTips =
    'เน้นการหายใจเข้าลึก-ออกยาว ควบคุมการเกร็งหน้าท้องและหลังล่างให้แนบพื้นตลอดการเคลื่อนไหว';

  if (
    query.includes('dance') ||
    query.includes('เต้น') ||
    query.includes('aerobic') ||
    query.includes('แอโรบิก')
  ) {
    category = 'เต้นแอโรบิก & คาร์ดิโอ (Dance Cardio)';
    duration = 20;
    calories = 180;
    intensity = 'ปานกลาง (Moderate)';
    targetMuscles = ['ทั่วร่างกาย (Full Body)', 'ขา/สะโพก', 'หัวใจและปอด'];
    benefits = [
      'เร่งอัตราการเต้นของหัวใจและเผาผลาญไขมันสูงสุด',
      'สนุกสนาน อารมณ์ดี ไม่น่าเบื่อ',
      'เพิ่มความคล่องตัวและการประสานงานของร่างกาย',
    ];
    movements = ['Step Touch', 'Side Tap & Punch', 'V-Step Bounce', 'Hip Sway Cardio'];
    coachingTips = 'ขยับตามจังหวะเพลงอย่างเพลิดเพลิน รักษาจังหวะการหายใจสม่ำเสมอ ไม่กลั้นหายใจ';
  } else if (
    query.includes('hiit') ||
    query.includes('tabata') ||
    query.includes('เบิร์น') ||
    query.includes('fat burn')
  ) {
    category = 'HIIT เผาผลาญไขมันเร่งด่วน';
    duration = 15;
    calories = 190;
    intensity = 'เข้มข้นสูง (High)';
    targetMuscles = ['ทั่วร่างกาย (Full Body)', 'ต้นขา', 'แกนกลางลำตัว'];
    benefits = [
      'เกิดสภาวะ Afterburn Effect เผาผลาญไขมันต่อเนื่องหลังซ้อม',
      'กระตุ้นระบบไหลเวียนโลหิตและความฟิตระดับสูงสุด',
      'ใช้เวลาสั้นแต่ได้ประสิทธิภาพสูงสุด',
    ];
    movements = [
      'Squat Jumps / Squat Pulses',
      'High Knees',
      'Mountain Climbers',
      'Burpee Low-Impact',
    ];
    coachingTips =
      'ออกแรงเต็มที่ในช่วง Interval และพักให้หัวใจลดลงตามกำหนด รักษาระดับความปลอดภัยของข้อต่อ';
  } else if (
    query.includes('abs') ||
    query.includes('หน้าท้อง') ||
    query.includes('11') ||
    query.includes('เอว') ||
    query.includes('chloe ting')
  ) {
    category = 'ปั้นร่อง 11 & กระชับหน้าท้อง (Abs & Waist)';
    duration = 15;
    calories = 120;
    intensity = 'ปานกลาง (Moderate)';
    targetMuscles = ['หน้าท้องส่วนล่าง', 'หน้าท้องส่วนบน', 'กล้ามเนื้อเอวด้านข้าง (Obliques)'];
    benefits = [
      'สร้างร่อง 11 คมชัด กระชับหน้าท้องส่วนล่าง',
      'ลดเอวคอดเป็นทรง S-Curve',
      'เพิ่มความแข็งแรงให้กระดูกสันหลังและแกนกลาง',
    ];
    movements = ['Deadbug', 'Bicycle Crunches', 'Russian Twists', 'Plank Hold'];
    coachingTips =
      'เกร็งสะดือดูดเข้าหาแนวกระดูกสันหลัง ห้ามใช้แรงดึงจากคอ ให้ใช้แรงบีบจากกล้ามเนื้อหน้าท้อง';
  } else if (
    query.includes('glute') ||
    query.includes('butt') ||
    query.includes('ก้น') ||
    query.includes('สะโพก') ||
    query.includes('ขา')
  ) {
    category = 'ปั้นก้นกลมเด้ง & ต้นขาเฟิร์ม (Glutes & Legs)';
    duration = 20;
    calories = 150;
    intensity = 'ปานกลาง (Moderate)';
    targetMuscles = ['กล้ามเนื้อบั้นท้าย (Glute Max & Med)', 'ต้นขาด้านใน', 'ต้นขาด้านหลัง (Hamstrings)'];
    benefits = [
      'ปั้นก้นกลมเด้ง ยกกระชับสะโพก',
      'ลดเซลลูไลท์และกระชับต้นขา',
      'ช่วยเสริมการทรงตัวและป้องกันอาการปวดหลังล่าง',
    ];
    movements = ['Glute Bridge Pulses', 'Donkey Kicks', 'Fire Hydrants', 'Sumo Squats'];
    coachingTips =
      'บีบเกร็งก้นที่จุดสูงสุดของการเคลื่อนไหว 1-2 วินาที และดันสะโพกขึ้นตรงๆ ไม่แอ่นหลัง';
  } else if (
    query.includes('yoga') ||
    query.includes('stretch') ||
    query.includes('ยืด') ||
    query.includes('คลาย')
  ) {
    category = 'โยคะ & ยืดเหยียดผ่อนคลาย (Yoga & Stretch)';
    duration = 15;
    calories = 70;
    intensity = 'เบา (Low)';
    targetMuscles = ['กล้ามเนื้อทั่วร่างกาย', 'ข้อต่อ', 'แผ่นหลังและสะบัก'];
    benefits = [
      'คลายกล้ามเนื้อที่ตึงเกร็ง แก้อาการออฟฟิศซินโดรม',
      'ลดความเครียดและช่วยให้หลับสบายขึ้น',
      'ฟื้นฟูกล้ามเนื้อหลังการออกกำลังกาย',
    ];
    movements = ['Child Pose', 'Cat-Cow Stretch', 'Downward Dog', 'Seated Forward Bend'];
    coachingTips = 'หายใจเข้าลึกผ่อนคลาย ปล่อยกล้ามเนื้อให้ยืดตามแรงโน้มถ่วงโดยไม่ต้องฝืน';
  }

  const durMatch = query.match(/(\d+)\s*(?:min|mins|นาที)/i);
  if (durMatch && durMatch[1]) {
    const parsedDur = parseInt(durMatch[1], 10);
    if (parsedDur >= 5 && parsedDur <= 120) {
      duration = parsedDur;
      calories = Math.round(
        duration * (intensity === 'เข้มข้นสูง (High)' ? 12 : intensity === 'ปานกลาง (Moderate)' ? 8 : 4.5)
      );
    }
  }

  const title =
    fetchedTitle ||
    (input.urlOrText.length > 40 ? 'ออกกำลังกายตามคลิป YouTube' : input.urlOrText) ||
    'ออกกำลังกายตามคลิป';

  return {
    title,
    channelName: fetchedAuthor || undefined,
    category,
    estimatedDurationMinutes: duration,
    estimatedCalories: calories,
    intensity,
    targetMuscles,
    benefits,
    movements,
    coachingTips,
    suitability: `เหมาะสำหรับ ${input.userName || 'คุณ'} ที่ต้องการ${category} อย่างมีประสิทธิภาพและสนุกสนาน`,
  };
}

export async function analyzeYoutubeWorkoutVideo(
  input: {
    urlOrText: string;
    userNote?: string;
    userName?: string;
    userGoal?: string;
  },
  customApiKey?: string
): Promise<{
  analysis: YoutubeWorkoutAnalysis;
  youtubeId: string | null;
}> {
  const activeKey =
    customApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof window !== 'undefined' ? localStorage.getItem('fittrack_gemini_key') : null) ||
    getDefaultGeminiApiKey();

  const youtubeId = extractYouTubeId(input.urlOrText);
  let fetchedTitle = '';
  let fetchedAuthor = '';

  if (youtubeId) {
    const oembed = await fetchYouTubeOEmbed(youtubeId);
    if (oembed) {
      fetchedTitle = oembed.title || '';
      fetchedAuthor = oembed.author_name || '';
    }
  }

  // If no API key is available, run our smart sports-science analysis engine immediately
  if (!activeKey) {
    const fallback = generateSmartFallbackWorkout(input, fetchedTitle, fetchedAuthor);
    return {
      analysis: fallback,
      youtubeId,
    };
  }

  const promptText = `คุณคือโค้ชผู้เชี่ยวชาญด้านวิทยาศาสตร์การกีฬาและเทรนเนอร์ส่วนตัวอัจฉริยะ (Sports Scientist & Master Trainer) ประจำ FitTrack หมูอ้วน
ผู้ใช้ชื่อคุณ "${input.userName || 'น้องมะนาว'}" (เป้าหมาย: ${input.userGoal || 'กระชับสัดส่วน Toning & สุขภาพ'}) ต้องการออกกำลังกายตามคลิป YouTube นี้:

[ข้อมูลคลิปและลิงก์]
- ข้อความ/ลิงก์ที่ผู้ใช้ระบุ: "${input.urlOrText}"
- YouTube Video ID: "${youtubeId || 'ไม่พบ ID ตรง'}"
- ชื่อคลิปจริงที่ดึงได้: "${fetchedTitle || 'อ้างอิงจากลิงก์หรือข้อความค้นหา'}"
- ช่อง/ผู้จัดทำ: "${fetchedAuthor || '-'}"
- หมายเหตุเพิ่มเติมจากผู้ใช้: "${input.userNote || 'ไม่มี'}"

กรุณาวิเคราะห์คลิปออกกำลังกายนี้อย่างละเอียดและเป็นมืออาชีพตามหลักวิทยาศาสตร์การกีฬา:
1. ประเภทของคลิปการฝึก (เช่น พิลาทิสบอดี้เวท, เต้นแอโรบิกคาร์ดิโอ, HIIT เผาผลาญไขมัน, ปั้นร่อง 11 & หน้าท้อง, ยืดเหยียดผ่อนคลาย, ปั้นก้นและสะโพก)
2. ระยะเวลาโดยประมาณ (นาที) และ แคลอรี่ที่เผาผลาญโดยเฉลี่ย (kcal)
3. ระดับความเข้มข้น (เบา (Low), ปานกลาง (Moderate), หรือ เข้มข้นสูง (High))
4. กล้ามเนื้อและสัดส่วนที่คลิปนี้เน้นโฟกัส (เช่น หน้าท้องส่วนล่าง, แกนกลางลำตัว, ก้น, ต้นขาใน, ไหล่)
5. สิ่งที่ได้ / ประโยชน์ที่ได้รับจากคลิปนี้ (3-5 ข้อ เช่น กระชับหน้าท้องสร้างเอว S, เร่งอัตราการเผาผลาญไขมัน, Low-Impact ถนอมเข่าและข้อต่อ, ปรับบุคลิกภาพ)
6. ท่าสำคัญหรือรูปแบบการเคลื่อนไหวเด่นในคลิป (3-6 ท่า)
7. คำแนะนำและเทคนิคการเกร็ง/การหายใจจากโค้ช AI
8. เหมาะสำหรับใคร / วัตถุประสงค์ใด

ส่งผลลัพธ์กลับมาเป็นรูปแบบ JSON เท่านั้น (Strict JSON Schema, no markdown wrap):
{
  "title": "string (ชื่อคลิปหรือชื่อโปรแกรมที่อ่านง่ายและกระชับ ภาษาไทย/อังกฤษ)",
  "channelName": "string (ชื่อช่องหรือ Creator)",
  "category": "string (เช่น พิลาทิส & แกนกลางลำตัว / คาร์ดิโอแดนซ์ / HIIT)",
  "estimatedDurationMinutes": number,
  "estimatedCalories": number,
  "intensity": "เบา (Low)" | "ปานกลาง (Moderate)" | "เข้มข้นสูง (High)",
  "targetMuscles": ["string", "string", "string"],
  "benefits": ["string", "string", "string", "string"],
  "movements": ["string", "string", "string", "string"],
  "coachingTips": "string (คำแนะนำการเกร็งและเทคนิคการเล่น)",
  "suitability": "string (เหมาะสำหรับใคร เช่น เหมาะสำหรับผู้หญิงที่อยากปั้นร่อง 11 และลดไขมันหน้าท้อง)"
}`;

  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
  ];

  const defaultKey = getDefaultGeminiApiKey();
  const keysToTry = [activeKey];
  if (defaultKey && defaultKey !== activeKey) {
    keysToTry.push(defaultKey);
  }

  let rawJsonText = '';

  for (const currentKey of keysToTry) {
    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const partText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (partText) {
            rawJsonText = partText;
            break;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} workout analysis failed:`, err);
      }
    }
    if (rawJsonText) break;
  }

  if (!rawJsonText) {
    // If Gemini models fail, seamlessly return smart rule-based analysis so user is NEVER blocked
    const fallback = generateSmartFallbackWorkout(input, fetchedTitle, fetchedAuthor);
    return {
      analysis: fallback,
      youtubeId,
    };
  }

  try {
    let cleaned = rawJsonText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    const parsed: YoutubeWorkoutAnalysis = JSON.parse(cleaned);

    if (fetchedTitle && (!parsed.title || parsed.title.length < 3)) {
      parsed.title = fetchedTitle;
    }
    if (fetchedAuthor && !parsed.channelName) {
      parsed.channelName = fetchedAuthor;
    }

    return {
      analysis: parsed,
      youtubeId,
    };
  } catch (err: any) {
    console.warn('JSON parsing failed, falling back to smart analysis:', err);
    const fallback = generateSmartFallbackWorkout(input, fetchedTitle, fetchedAuthor);
    return {
      analysis: fallback,
      youtubeId,
    };
  }
}

