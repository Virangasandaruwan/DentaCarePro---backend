import express from 'express';
import { getAiSuggestion, chatWithBot } from '../controllers/aiController';
const router = express.Router();
router.post('/suggest', getAiSuggestion);
router.post('/analyze', getAiSuggestion);
router.post('/chat', chatWithBot);
export default router;
