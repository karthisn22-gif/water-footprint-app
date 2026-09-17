import { GoogleGenAI } from '@google/genai';

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

export const translateText = async (req, res) => {
  try {
    const { cropName, suitability, targetLanguage } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const langName = getLanguageName(targetLanguage);

    const prompt = `
      You are an expert translator. Translate the following text into ${langName}.
      
      CRITICAL INSTRUCTIONS: 
      1. Provide your response EXACTLY as a JSON object, with NO markdown formatting, NO backticks, and NO extra text outside the JSON.
      2. The 'cropName' and 'suitability' values MUST be strictly translated into ${langName}.
      
      Original Crop Name: "${cropName}"
      Original Suitability Text: "${suitability}"
      
      Output JSON format:
      {
        "cropName": "<translated crop name>",
        "suitability": "<translated suitability text>"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const aiResponseText = response.text;
    
    let parsedData;
    try {
      const cleanedText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing translation response:', aiResponseText);
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ message: 'Error translating text' });
  }
};
