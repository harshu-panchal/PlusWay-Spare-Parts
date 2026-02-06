/**
 * Translation Routes
 * Public endpoints for translation services (no authentication required)
 */

import express from 'express';
import {
    translateSingle,
    translateBatchTexts,
    translateObjectKeys,
    getTranslationStats,
} from '../controllers/translationController.js';

const router = express.Router();

// POST /api/v1/translate - Translate single text
router.post('/', translateSingle);

// POST /api/v1/translate/batch - Translate multiple texts
router.post('/batch', translateBatchTexts);

// POST /api/v1/translate/object - Translate object properties
router.post('/object', translateObjectKeys);

// GET /api/v1/translate/stats - Get cache statistics (for monitoring)
router.get('/stats', getTranslationStats);

export default router;
