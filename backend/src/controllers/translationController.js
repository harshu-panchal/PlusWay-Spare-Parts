/**
 * Translation Controller
 * Handles translation API endpoints
 */

import { translateText, translateBatch, translateObject, getCacheStats } from '../services/translationService.js';

/**
 * Translate single text
 * POST /api/v1/translate
 * Body: { text: string, targetLang: string, sourceLang?: string }
 */
export const translateSingle = async (req, res) => {
    try {
        const { text, targetLang, sourceLang = 'en' } = req.body;

        // Validation
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required',
            });
        }

        const result = await translateText(text, targetLang, sourceLang);

        // Check for API errors
        if (result.error && result.translation === result.original) {
            return res.status(503).json({
                success: false,
                message: 'Translation service temporarily unavailable',
                error: result.error,
                data: result,
            });
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('translateSingle error:', error);

        // Check if rate limited
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            res.set('Retry-After', retryAfter);
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded, please try again later',
                retryAfter,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Translation failed',
            error: error.message,
        });
    }
};

/**
 * Translate multiple texts in batch
 * POST /api/v1/translate/batch
 * Body: { texts: string[], targetLang: string, sourceLang?: string }
 */
export const translateBatchTexts = async (req, res) => {
    try {
        const { texts, targetLang, sourceLang = 'en' } = req.body;

        // Validation
        if (!texts || !Array.isArray(texts)) {
            return res.status(400).json({
                success: false,
                message: 'Texts array is required',
            });
        }

        if (texts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Texts array cannot be empty',
            });
        }

        if (texts.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 100 texts allowed per batch',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required',
            });
        }

        const result = await translateBatch(texts, targetLang, sourceLang);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('translateBatchTexts error:', error);

        // Check if rate limited
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            res.set('Retry-After', retryAfter);
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded, please try again later',
                retryAfter,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Batch translation failed',
            error: error.message,
        });
    }
};

/**
 * Translate specific keys in an object
 * POST /api/v1/translate/object
 * Body: { object: Object, targetLang: string, sourceLang?: string, keysToTranslate?: string[] }
 */
export const translateObjectKeys = async (req, res) => {
    try {
        const { object, targetLang, sourceLang = 'en', keysToTranslate = null } = req.body;

        // Validation
        if (!object || typeof object !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Object is required',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required',
            });
        }

        if (keysToTranslate && !Array.isArray(keysToTranslate)) {
            return res.status(400).json({
                success: false,
                message: 'keysToTranslate must be an array of strings',
            });
        }

        const result = await translateObject(object, targetLang, sourceLang, keysToTranslate);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('translateObjectKeys error:', error);

        // Check if rate limited
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            res.set('Retry-After', retryAfter);
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded, please try again later',
                retryAfter,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Object translation failed',
            error: error.message,
        });
    }
};

/**
 * Get translation cache statistics
 * GET /api/v1/translate/stats
 */
export const getTranslationStats = async (req, res) => {
    try {
        const stats = getCacheStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('getTranslationStats error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to get translation stats',
            error: error.message,
        });
    }
};

export default {
    translateSingle,
    translateBatchTexts,
    translateObjectKeys,
    getTranslationStats,
};
