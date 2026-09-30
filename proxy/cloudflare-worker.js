/**
 * FitTrack - Gemini Multimodal Proxy (Cloudflare Worker)
 * 
 * Instructions:
 * 1. Create a free Cloudflare Worker at https://dash.cloudflare.com
 * 2. Set an Environment Secret in Settings > Variables: GEMINI_API_KEY = "your-api-key"
 * 3. Paste this code and deploy.
 * 4. Put your worker URL in FitTrack Settings (e.g. https://fittrack-proxy.yourname.workers.dev)
 */

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. Analyze the food photo.
Return ONLY valid JSON matching this schema, no markdown codeblocks, no extra text:
{
  "items": [
    {
      "name": "string (Thai name if Thai dish)",
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

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { image, mimeType } = await request.json();

      if (!image) {
        return new Response(JSON.stringify({ error: 'Missing image data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Worker GEMINI_API_KEY is not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType || 'image/jpeg',
                    data: image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      });

      if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        return new Response(JSON.stringify({ error: errorText }), {
          status: geminiRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await geminiRes.json();
      const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleaned = textOutput.replace(/```json\n?|\n?```/g, '').trim();

      return new Response(cleaned, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
