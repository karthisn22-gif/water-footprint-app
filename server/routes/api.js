import express from 'express';
import multer from 'multer';
import { verifyGoogleToken } from '../controllers/authController.js';
import { analyzeCrop } from '../controllers/geminiController.js';
import { saveHistory, getHistory, deleteHistory } from '../controllers/historyController.js';
import { translateText } from '../controllers/translateController.js';
import { chatWithExpert } from '../controllers/chatController.js';

const router = express.Router();

// Multer setup for image uploads (saving temporarily in 'uploads' directory)
const upload = multer({ dest: 'uploads/' });

// Auth route
router.post('/auth/google', verifyGoogleToken);

// Gemini Analysis route
router.post('/analyze', upload.single('image'), analyzeCrop);

// Translate route
router.post('/translate', translateText);

// Chat route
router.post('/chat', chatWithExpert);

// History routes
router.post('/history', saveHistory);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistory);

export default router;
