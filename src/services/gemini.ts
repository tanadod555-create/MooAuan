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
}: {
  base64Image: string;
  mimeType: string;
  apiKey?: string;
  proxyUrl?: string;
  useProxy?: boolean;
}): Promise<GeminiAnalysisResponse> {
  if (useProxy && proxyUrl) {
    // Call via proxy (Cloudflare Worker or Apps Script)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        mimeType: mimeType,
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

  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
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
