import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// map lang code to full name for the prompt
const getLanguageName = (code) => {
  const languages = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    kn: 'Kannada',
    ml: 'Malayalam',
    te: 'Telugu',
    mr: 'Marathi'
  };
  return languages[code] || 'English';
};

export const analyzeCrop = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { location, cropNameInput } = req.body;
    const file = req.file;

    if (!file && !cropNameInput) {
      return res.status(400).json({ message: 'No image or crop name provided' });
    }
    
    let promptIntro = '';
    if (cropNameInput) {
      promptIntro = `You are an expert agricultural and water footprint analyst. 
      The user is asking about the following crop/food material: "${cropNameInput}".
      Determine its average water footprint per kg.
      Also, analyze if this crop is suitable for cultivation in the following location: "${location}".`;
    } else {
      promptIntro = `You are an expert agricultural and water footprint analyst. 
      Analyze the provided image and identify the food material (crop).
      Then, determine its average water footprint per kg.
      Also, analyze if this crop is suitable for cultivation in the following location: "${location}".`;
    }

    const prompt = `
      ${promptIntro}
      
      CRITICAL INSTRUCTIONS: 
      1. Provide your response EXACTLY as a JSON object, with NO markdown formatting, NO backticks, and NO extra text outside the JSON.
      2. You MUST provide translations for the cropName and suitability text in all requested languages below.
      3. Based on climate, water availability, soil type, and growing season, categorize the suitability as exactly one of: Excellent, Good, Moderate, Poor, or Not Suitable.
      4. Based on best agricultural practices, recommend the optimal irrigation method for this crop. It MUST be exactly one of: Drip, Sprinkler, Flood, Rain-fed, Micro-Sprinkler, or Subsurface Drip.
      5. FALLBACK: If the provided image or text is clearly NOT a crop or food material, you MUST STILL return the exact JSON structure. In this case, set "cropName" to "Not a crop", set all water footprint values to 0, set "suitabilityCategory" to "Not Suitable", set "irrigationMethod" to "Rain-fed", and explain in the "suitability" field that the input is not a recognized crop.
      6. CONDITIONAL SECTIONS: If the suitabilityCategory is "Poor" or "Not Suitable", you MUST set "plantingSeason", "growthDuration", and "pestsAndCare" strictly to null. Only generate these details if the crop is actually viable (Excellent, Good, or Moderate).
      
      The JSON must follow this exact structure:
      {
        "cropName": {
          "en": "<Name in English>",
          "ta": "<Name in Tamil>",
          "hi": "<Name in Hindi>",
          "kn": "<Name in Kannada>",
          "ml": "<Name in Malayalam>",
          "te": "<Name in Telugu>",
          "mr": "<Name in Marathi>"
        },
        "waterFootprint": {
          "green": <number representing green water in liters/kg>,
          "blue": <number representing blue water in liters/kg>,
          "grey": <number representing grey water in liters/kg>
        },
        "suitabilityCategory": "<Exactly one of: Excellent, Good, Moderate, Poor, Not Suitable>",
        "irrigationMethod": "<Exactly one of: Drip, Sprinkler, Flood, Rain-fed, Micro-Sprinkler, Subsurface Drip>",
        "suitability": {
          "en": "<Brief 1-2 sentence explanation of whether the crop is suitable for cultivation in ${location} and why, in English>",
          "ta": "<Same explanation translated strictly to Tamil>",
          "hi": "<Same explanation translated strictly to Hindi>",
          "kn": "<Same explanation translated strictly to Kannada>",
          "ml": "<Same explanation translated strictly to Malayalam>",
          "te": "<Same explanation translated strictly to Telugu>",
          "mr": "<Same explanation translated strictly to Marathi>"
        },
        "plantingSeason": {
          "en": "<Best planting season, e.g., 'June to August'>",
          "ta": "<Translated to Tamil>",
          "hi": "<Translated to Hindi>",
          "kn": "<Translated to Kannada>",
          "ml": "<Translated to Malayalam>",
          "te": "<Translated to Telugu>",
          "mr": "<Translated to Marathi>"
        },
        "growthDuration": {
          "en": "<Typical growth duration, e.g., '90 - 120 Days'>",
          "ta": "<Translated to Tamil>",
          "hi": "<Translated to Hindi>",
          "kn": "<Translated to Kannada>",
          "ml": "<Translated to Malayalam>",
          "te": "<Translated to Telugu>",
          "mr": "<Translated to Marathi>"
        },
        "pestsAndCare": {
          "en": ["<Bullet 1 (Pest & fix)>", "<Bullet 2 (Care tip)>"],
          "ta": ["<Translated bullet 1>", "<Translated bullet 2>"],
          "hi": ["<Translated bullet 1>", "<Translated bullet 2>"],
          "kn": ["<Translated bullet 1>", "<Translated bullet 2>"],
          "ml": ["<Translated bullet 1>", "<Translated bullet 2>"],
          "te": ["<Translated bullet 1>", "<Translated bullet 2>"],
          "mr": ["<Translated bullet 1>", "<Translated bullet 2>"]
        }
      }
    `;

    let requestParts = [{ text: prompt }];

    if (file) {
      const fileData = fs.readFileSync(file.path);
      const base64Image = fileData.toString('base64');
      requestParts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: requestParts
        }
      ]
    });

    const aiResponseText = response.text;
    
    // Try to parse the JSON
    let parsedData;
    try {
      // In case Gemini returns markdown JSON block, strip it
      const cleanedText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', aiResponseText);
      return res.status(500).json({ message: 'Failed to parse AI response', raw: aiResponseText });
    }

    // Clean up uploaded file if it exists
    if (file) {
      try { fs.unlinkSync(file.path); } catch(e) {}
    }

    res.status(200).json(parsedData);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    console.error('Gemini API Error:', error);
    
    // Check if it's a 503 error
    if (error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand')) {
      return res.status(503).json({ message: 'The AI model is currently experiencing high demand and is temporarily unavailable. Please try again in a few moments.' });
    }

    // Check if it's a 429 Quota Exceeded error
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ message: 'You have reached the free-tier limit for AI requests. Please wait about a minute before trying again!' });
    }
    
    res.status(500).json({ message: error.message || 'Error analyzing data', raw: String(error) });
  }
};
