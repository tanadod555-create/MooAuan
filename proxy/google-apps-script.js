/**
 * FitTrack - Gemini Proxy (Google Apps Script Web App)
 * 
 * Instructions:
 * 1. Open https://script.google.com and create a New Project
 * 2. Go to Project Settings (Gear icon) > Script Properties > Add "GEMINI_API_KEY" = "your-api-key"
 * 3. Paste this code into Code.gs
 * 4. Click Deploy > New deployment > Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Copy the Web App URL and paste into FitTrack Settings.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var base64Image = data.image;
    var mimeType = data.mimeType || 'image/jpeg';

    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'GEMINI_API_KEY not set in Script Properties' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var systemPrompt = "You are a nutrition analysis assistant. Analyze the food photo.\n" +
      "Return ONLY valid JSON matching this schema, no markdown codeblocks, no extra text:\n" +
      "{\n" +
      "  \"items\": [\n" +
      "    {\n" +
      "      \"name\": \"string (Thai name if Thai dish)\",\n" +
      "      \"grams\": number,\n" +
      "      \"kcal\": number,\n" +
      "      \"protein_g\": number,\n" +
      "      \"carb_g\": number,\n" +
      "      \"fat_g\": number,\n" +
      "      \"fiber_g\": number,\n" +
      "      \"sugar_g\": number,\n" +
      "      \"sodium_mg\": number,\n" +
      "      \"micros\": {\"vitC_mg\": number, \"iron_mg\": number, \"calcium_mg\": number, \"potassium_mg\": number},\n" +
      "      \"confidence\": number\n" +
      "    }\n" +
      "  ],\n" +
      "  \"notes\": \"string\"\n" +
      "}\n" +
      "Estimate portion sizes from visual cues. If unsure, lower confidence.";

    var payload = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json"
      }
    };

    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var jsonRes = JSON.parse(response.getContentText());
    var textOutput = jsonRes.candidates[0].content.parts[0].text;
    var cleaned = textOutput.replace(/```json\n?|\n?```/g, "").trim();

    return ContentService.createTextOutput(cleaned)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
