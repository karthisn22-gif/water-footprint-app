import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Water Footprint Calculator",
      "upload_image": "Upload Crop Image",
      "location": "Location",
      "use_gps": "Use My Location",
      "analyze": "Analyze",
      "history": "History",
      "login": "Login",
      "logout": "Logout",
      "green_water": "Green Water",
      "blue_water": "Blue Water",
      "grey_water": "Grey Water",
      "suitability": "Suitability",
      "liters_per_kg": "Liters / kg",
      "uploading": "Processing Image...",
      "delete": "Delete",
      "home": "Home",
      "save_history": "Save to History",
      "saving": "Saving...",
      "no_history": "No history found. Try analyzing a crop first!",
      "enter_location": "e.g., Sathyamangalam",
      "chatbot_title": "Water Footprint Assistant",
      "chatbot_placeholder": "Ask about water & crops...",
      "cat_excellent": "Excellent",
      "cat_good": "Good",
      "cat_moderate": "Moderate",
      "cat_poor": "Poor",
      "cat_not_suitable": "Not Suitable",
      "irrigation_drip": "Drip Irrigation",
      "irrigation_sprinkler": "Sprinkler Irrigation",
      "irrigation_flood": "Flood Irrigation",
      "irrigation_rain-fed": "Rain-fed",
      "irrigation_micro-sprinkler": "Micro-Sprinkler",
      "irrigation_subsurface_drip": "Subsurface Drip",
      "recommended_irrigation": "Recommended Irrigation",
      "mode_text": "Text",
      "mode_upload": "Upload",
      "mode_camera": "Camera",
      "enter_crop_name": "Enter crop name (e.g. Carrot)",
      "tooltip_green": "Rainwater stored in soil and used naturally by the plant.",
      "tooltip_blue": "Water taken from rivers, canals, or borewells for irrigation.",
      "tooltip_grey": "Extra clean water needed to dilute pollution caused by farming.",
      "best_planting_season": "Best Planting Season",
      "growth_duration": "Growth Duration",
      "pests_and_care": "Common Pests & Care Tips"
    }
  },
  ta: {
    translation: {
      "app_title": "நீர் தடம் கணக்கிடும் கருவி",
      "upload_image": "பயிர் படத்தைப் பதிவேற்றுக",
      "location": "இடம்",
      "use_gps": "எனது இருப்பிடத்தைப் பயன்படுத்து",
      "analyze": "பகுப்பாய்வு செய்",
      "history": "வரலாறு",
      "login": "உள்நுழைக",
      "logout": "வெளியேறு",
      "green_water": "பச்சை நீர்",
      "blue_water": "நீல நீர்",
      "grey_water": "சாம்பல் நீர்",
      "suitability": "பொருத்தம்",
      "liters_per_kg": "லிட்டர் / கிலோ",
      "uploading": "படத்தை செயலாக்குகிறது...",
      "delete": "அழி",
      "home": "முகப்பு",
      "save_history": "வரலாற்றில் சேமி",
      "saving": "சேமிக்கிறது...",
      "no_history": "எந்த வரலாறும் கிடைக்கவில்லை. முதலில் ஒரு பயிரை பகுப்பாய்வு செய்ய முயற்சிக்கவும்!",
      "enter_location": "உ.ம்., சத்தியமங்கலம்",
      "chatbot_title": "நீர் தடம் உதவியாளர்",
      "chatbot_placeholder": "நீர் மற்றும் பயிர்கள் பற்றி கேளுங்கள்...",
      "cat_excellent": "மிகச் சிறப்பு",
      "cat_good": "நல்லது",
      "cat_moderate": "மிதமானது",
      "cat_poor": "மோசமானது",
      "cat_not_suitable": "பொருத்தமற்றது",
      "irrigation_drip": "சொட்டு நீர் பாசனம்",
      "irrigation_sprinkler": "தெளிப்பு நீர் பாசனம்",
      "irrigation_flood": "வெள்ள பாசனம்",
      "irrigation_rain-fed": "மழையை நம்பிய வேளாண்மை",
      "irrigation_micro-sprinkler": "நுண் தெளிப்பு நீர் பாசனம்",
      "irrigation_subsurface_drip": "நிலத்தடி சொட்டு நீர் பாசனம்",
      "recommended_irrigation": "பரிந்துரைக்கப்பட்ட பாசனம்",
      "mode_text": "உரை",
      "mode_upload": "பதிவேற்றம்",
      "mode_camera": "புகைப்படம்",
      "enter_crop_name": "பயிர் பெயரை உள்ளிடுக (உ.ம். கேரட்)",
      "tooltip_green": "மண்ணில் சேமிக்கப்பட்டு தாவரத்தால் இயற்கையாகப் பயன்படுத்தப்படும் மழைநீர்.",
      "tooltip_blue": "பாசனத்திற்காக ஆறுகள், கால்வாய்கள் அல்லது ஆழ்துளைக் கிணறுகளில் இருந்து எடுக்கப்படும் நீர்.",
      "tooltip_grey": "விவசாயத்தால் ஏற்படும் மாசுபாட்டைக் குறைக்கத் தேவைப்படும் கூடுதல் சுத்தமான நீர்.",
      "best_planting_season": "சிறந்த நடவு பருவம்",
      "growth_duration": "வளர்ச்சி காலம்",
      "pests_and_care": "பொதுவான பூச்சிகள் மற்றும் பராமரிப்பு குறிப்புகள்"
    }
  },
  // Placeholders for other languages. The AI will respond in these languages,
  // but we can add static UI translations here.
  hi: { translation: { "app_title": "जल पदचिह्न कैलकुलेटर", "upload_image": "फसल की छवि अपलोड करें", "location": "स्थान", "analyze": "विश्लेषण करें", "history": "इतिहास" } },
  kn: { translation: { "app_title": "ನೀರಿನ ಹೆಜ್ಜೆಗುರುತು ಕ್ಯಾಲ್ಕುಲೇಟರ್", "upload_image": "ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "location": "ಸ್ಥಳ", "analyze": "ವಿಶ್ಲೇಷಿಸಿ", "history": "ಇತಿಹಾಸ" } },
  ml: { translation: { "app_title": "വാട്ടർ ഫുട്പ്രിന്റ് കാൽക്കുലേറ്റർ", "upload_image": "വിളയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക", "location": "സ്ഥലം", "analyze": "വിശകലനം ചെയ്യുക", "history": "ചരിത്രം" } },
  te: { translation: { "app_title": "నీటి ఫుట్ప్రింట్ కాలిక్యులేటర్", "upload_image": "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి", "location": "స్థానం", "analyze": "విశ్లేషించండి", "history": "చరిత్ర" } },
  mr: { translation: { "app_title": "जल पदचिन्ह कॅल्क्युलेटर", "upload_image": "पिकाची प्रतिमा अपलोड करा", "location": "स्थान", "analyze": "विश्लेषण करा", "history": "इतिहास" } }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
