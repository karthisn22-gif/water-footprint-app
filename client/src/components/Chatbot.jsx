import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          text: {
            en: "Hello! I'm your Water Footprint Assistant. Ask me anything about water consumption, irrigation methods, crop water needs, or sustainable farming techniques!",
            ta: "வணக்கம்! நான் உங்கள் நீர் தடம் உதவியாளர். நீர் நுகர்வு, நீர்ப்பாசன முறைகள், பயிர் நீர் தேவைகள் அல்லது நிலையான விவசாய நுட்பங்கள் பற்றி எதையும் கேளுங்கள்!",
            hi: "नमस्ते! मैं आपका जल पदचिह्न सहायक हूँ। पानी की खपत, सिंचाई के तरीके, फसल के पानी की जरूरत, या टिकाऊ खेती की तकनीक के बारे में कुछ भी पूछें!",
            kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ನೀರಿನ ಹೆಜ್ಜೆಗುರುತು ಸಹಾಯಕ. ನೀರಿನ ಬಳಕೆ, ನೀರಾವರಿ ವಿಧಾನಗಳು, ಬೆಳೆ ನೀರಿನ ಅಗತ್ಯತೆಗಳು ಅಥವಾ ಸುಸ್ಥಿರ ಕೃಷಿ ತಂತ್ರಗಳ ಬಗ್ಗೆ ಏನೇ ಕೇಳಿ!",
            ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ജല കാൽപ്പാട് സഹായിയാണ്. ജല ഉപഭോഗം, ജലസേചന രീതികൾ, വിളകളുടെ ജല ആവശ്യങ്ങൾ അല്ലെങ്കിൽ സുസ്ഥിര കാർഷിക രീതികൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക!",
            te: "నమస్కారం! నేను మీ నీటి పాదముద్ర సహాయకుడిని. నీటి వినియోగం, నీటిపారుదల పద్ధతులు, పంట నీటి అవసరాలు లేదా స్థిరమైన వ్యవసాయ పద్ధతుల గురించి నన్ను అడగండి!",
            mr: "नमस्कार! मी तुमचा वॉटर फूटप्रिंट असिस्टंट आहे. पाण्याचा वापर, सिंचन पद्धती, पिकांची पाण्याची गरज किंवा शाश्वत शेती तंत्रांबद्दल काहीही विचारा!"
          }
        }
      ]);
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: { [i18n.language]: input, en: input } };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get the latest location from session storage
      const location = sessionStorage.getItem('calc_location') || 'Unknown';
      
      // only send english versions to backend to keep context clear
      const formattedHistory = messages.map(msg => ({
        role: msg.role,
        text: typeof msg.text === 'object' ? (msg.text.en || msg.text[i18n.language]) : msg.text
      }));

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        message: input,
        history: formattedHistory,
        location: location
      });

      const aiResponse = { role: 'model', text: res.data.response };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = { 
        role: 'model', 
        text: { en: "Sorry, I am having trouble connecting to the network right now." } 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Expert"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chatbot-header">
              <MessageCircle size={18} />
              <h3>{t('chatbot_title')}</h3>
            </div>
            
            <div className="chatbot-messages">
              {messages.map((msg, index) => {
                const textContent = typeof msg.text === 'object' 
                  ? (msg.text[i18n.language] || msg.text.en || Object.values(msg.text)[0]) 
                  : msg.text;

                return (
                  <div key={index} className={`chat-bubble ${msg.role}`}>
                    <p>{textContent}</p>
                  </div>
                );
              })}
              {loading && (
                <div className="chat-bubble model loading">
                  <Loader2 size={16} className="spinner" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input" onSubmit={handleSend}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot_placeholder')}
                disabled={loading}
              />
              <button type="submit" disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
