import { GoogleGenAI } from '@google/genai';

export const chatWithExpert = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { message, history, location } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Format previous history for Gemini
    let formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // strip out the initial bot greeting because Gemini expects history to start with a user message
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    // Construct the strict domain prompt
    const systemPrompt = `
      You are the Water Footprint Assistant.
      Your strictly bounded domain is:
      1. Water topics (water cycle, conservation, scarcity, water quality, irrigation methods, rainwater harvesting, groundwater).
      2. Food & water consumption (water footprints, sustainable diets).
      3. Growing techniques (crop-specific tips, soil prep, irrigation scheduling, organic methods, climate-suited crops for regions).
      
      The user's current location of interest is: "${location || 'Unknown'}". Use this context to provide hyper-localized advice if asked about irrigation or crops.
      
      CRITICAL INSTRUCTIONS:
      - If the user asks a question OUTSIDE of your strict domain (e.g., coding, movies, general history, unrelated chit-chat), you MUST politely refuse to answer and remind them that you can only answer questions related to agriculture, crops, and water footprint.
      - Provide your response EXACTLY as a JSON object, with NO markdown formatting, NO backticks, and NO extra text outside the JSON.
      - You MUST translate your response into all the requested languages below.
      
      The JSON must follow this exact structure:
      {
        "response": {
          "en": "<Your expert response in English>",
          "ta": "<Your response strictly translated to Tamil>",
          "hi": "<Your response strictly translated to Hindi>",
          "kn": "<Your response strictly translated to Kannada>",
          "ml": "<Your response strictly translated to Malayalam>",
          "te": "<Your response strictly translated to Telugu>",
          "mr": "<Your response strictly translated to Marathi>"
        }
      }
    `;

    // Combine history and current message
    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: `User's question: ${message}` }] }
    ];

    // Call Gemini using generateContent
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const aiResponseText = response.text;
    
    let parsedData;
    try {
      const cleanedText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing chat response:', aiResponseText);
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Chat Error:', error);

    if (error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand')) {
      return res.status(503).json({ message: 'The AI model is currently experiencing high demand and is temporarily unavailable. Please try again in a few moments.' });
    }

    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ message: 'You have reached the free-tier limit for AI requests. Please wait about a minute before trying again!' });
    }

    res.status(500).json({ message: error.message || 'Error communicating with chat expert' });
  }
};
