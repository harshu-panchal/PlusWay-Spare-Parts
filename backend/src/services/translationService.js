/**
 * Translation Service
 * Core translation logic with caching, batching, and error handling
 */

import axios from 'axios';
import { normalizeLanguageCode, getTranslateApiKey } from '../config/googleCloud.js';

// In-memory cache with TTL (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const translationCache = new Map();
const cacheTimestamps = new Map();

// Rate limiting configuration
const RATE_LIMIT_DELAY = 100; // ms between requests
let lastRequestTime = 0;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

/**
 * Generate cache key
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} - Cache key
 */
const getCacheKey = (text, sourceLang, targetLang) => {
    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);
    // Use Base64 encoding for the text to handle special characters
    const encodedText = Buffer.from(text).toString('base64');
    return `${normalizedSource}_${normalizedTarget}_${encodedText}`;
};

/**
 * Get cached translation
 * @param {string} key - Cache key
 * @returns {string|null} - Cached translation or null
 */
const getCachedTranslation = (key) => {
    if (!translationCache.has(key)) return null;

    const timestamp = cacheTimestamps.get(key);
    if (Date.now() - timestamp > CACHE_TTL) {
        // Cache expired
        translationCache.delete(key);
        cacheTimestamps.delete(key);
        return null;
    }

    return translationCache.get(key);
};

/**
 * Set cached translation
 * @param {string} key - Cache key
 * @param {string} translation - Translated text
 */
const setCachedTranslation = (key, translation) => {
    translationCache.set(key, translation);
    cacheTimestamps.set(key, Date.now());
};

/**
 * Clean up expired cache entries
 */
const cleanupCache = () => {
    const now = Date.now();
    for (const [key, timestamp] of cacheTimestamps.entries()) {
        if (now - timestamp > CACHE_TTL) {
            translationCache.delete(key);
            cacheTimestamps.delete(key);
        }
    }
};

// Run cache cleanup every hour
setInterval(cleanupCache, 60 * 60 * 1000);

/**
 * Wait for rate limiting
 */
const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
};

/**
 * Make translation API request with retry logic
 * @param {string|string[]} text - Text(s) to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<Object>} - API response
 */
const makeTranslationRequest = async (text, targetLang, sourceLang = null) => {
    const apiKey = getTranslateApiKey();

    if (!apiKey) {
        throw new Error('Translation API key not configured');
    }

    const normalizedTarget = normalizeLanguageCode(targetLang);
    const normalizedSource = sourceLang ? normalizeLanguageCode(sourceLang) : null;

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            await waitForRateLimit();

            const params = {
                q: text,
                target: normalizedTarget,
                key: apiKey,
                format: 'text',
            };

            if (normalizedSource) {
                params.source = normalizedSource;
            }

            const response = await axios.post(
                'https://translation.googleapis.com/language/translate/v2',
                null,
                { params }
            );

            return response.data;
        } catch (error) {
            lastError = error;

            // Check if rate limited
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || RETRY_DELAYS[attempt];
                console.warn(`Rate limited, retrying after ${retryAfter}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                continue;
            }

            // For other errors, apply exponential backoff
            if (attempt < MAX_RETRIES - 1) {
                console.warn(`Translation request failed, retrying in ${RETRY_DELAYS[attempt]}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
            }
        }
    }

    throw lastError;
};

/**
 * Translate a single text
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional, defaults to 'en')
 * @returns {Promise<Object>} - Translation result
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
    // Skip translation if same language or empty text
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return {
            original: text,
            translation: text,
            sourceLang,
            targetLang,
        };
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // Skip if source and target are the same
    if (normalizedSource === normalizedTarget) {
        return {
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    }

    // Check cache
    const cacheKey = getCacheKey(text, normalizedSource, normalizedTarget);
    const cachedTranslation = getCachedTranslation(cacheKey);

    if (cachedTranslation) {
        return {
            original: text,
            translation: cachedTranslation,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            cached: true,
        };
    }

    try {
        const response = await makeTranslationRequest(text, normalizedTarget, normalizedSource);
        const translation = response.data.translations[0].translatedText;

        // Don't cache if translation equals original (indicates potential API issue)
        if (translation && translation !== text) {
            setCachedTranslation(cacheKey, translation);
        }

        return {
            original: text,
            translation: translation || text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    } catch (error) {
        console.error('Translation error:', error.message);

        // Return original text on error (graceful fallback)
        return {
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            error: error.message,
        };
    }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional, defaults to 'en')
 * @returns {Promise<Object>} - Batch translation result
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) {
        return {
            translations: [],
            sourceLang,
            targetLang,
        };
    }

    // Limit batch size to 100
    if (texts.length > 100) {
        throw new Error('Batch size exceeds maximum limit of 100 texts');
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // Skip if source and target are the same
    if (normalizedSource === normalizedTarget) {
        return {
            translations: texts.map(text => ({
                original: text,
                translation: text,
            })),
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    }

    // Check cache for all texts
    const results = [];
    const textsToTranslate = [];
    const textsIndices = [];

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];

        // Skip invalid texts
        if (!text || typeof text !== 'string' || text.trim() === '') {
            results[i] = { original: text, translation: text };
            continue;
        }

        const cacheKey = getCacheKey(text, normalizedSource, normalizedTarget);
        const cachedTranslation = getCachedTranslation(cacheKey);

        if (cachedTranslation) {
            results[i] = { original: text, translation: cachedTranslation, cached: true };
        } else {
            textsToTranslate.push(text);
            textsIndices.push(i);
        }
    }

    // If all texts were cached, return early
    if (textsToTranslate.length === 0) {
        return {
            translations: results,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            allCached: true,
        };
    }

    try {
        const response = await makeTranslationRequest(textsToTranslate, normalizedTarget, normalizedSource);
        const translations = response.data.translations;

        // Map translations back to original indices
        for (let i = 0; i < translations.length; i++) {
            const originalIndex = textsIndices[i];
            const originalText = textsToTranslate[i];
            const translatedText = translations[i].translatedText;

            // Cache the translation (unless it equals original)
            if (translatedText && translatedText !== originalText) {
                const cacheKey = getCacheKey(originalText, normalizedSource, normalizedTarget);
                setCachedTranslation(cacheKey, translatedText);
            }

            results[originalIndex] = {
                original: originalText,
                translation: translatedText || originalText,
            };
        }

        return {
            translations: results,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    } catch (error) {
        console.error('Batch translation error:', error.message);

        // Return original texts on error (graceful fallback)
        for (const i of textsIndices) {
            if (!results[i]) {
                results[i] = { original: texts[i], translation: texts[i], error: error.message };
            }
        }

        return {
            translations: results,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            error: error.message,
        };
    }
};

/**
 * Translate specific keys in an object
 * @param {Object} obj - Object to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional, defaults to 'en')
 * @param {string[]} keysToTranslate - Array of keys to translate (optional, translates all string values if not specified)
 * @returns {Promise<Object>} - Translated object
 */
export const translateObject = async (obj, targetLang, sourceLang = 'en', keysToTranslate = null) => {
    if (!obj || typeof obj !== 'object') {
        return { original: obj, translation: obj };
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // Skip if source and target are the same
    if (normalizedSource === normalizedTarget) {
        return { original: obj, translation: obj };
    }

    try {
        // Deep clone the object
        const translatedObj = JSON.parse(JSON.stringify(obj));

        // Collect all texts to translate with their paths
        const textsToTranslate = [];
        const textPaths = [];

        const collectTexts = (current, path = []) => {
            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    collectTexts(current[i], [...path, i]);
                }
            } else if (current && typeof current === 'object') {
                for (const key of Object.keys(current)) {
                    const value = current[key];

                    // Check if this key should be translated
                    const shouldTranslate = keysToTranslate === null || keysToTranslate.includes(key);

                    if (shouldTranslate && typeof value === 'string' && value.trim() !== '') {
                        textsToTranslate.push(value);
                        textPaths.push([...path, key]);
                    } else if (typeof value === 'object' && value !== null) {
                        collectTexts(value, [...path, key]);
                    }
                }
            }
        };

        collectTexts(obj);

        // If no texts to translate, return original
        if (textsToTranslate.length === 0) {
            return { original: obj, translation: translatedObj };
        }

        // Batch translate all collected texts
        const batchResult = await translateBatch(textsToTranslate, normalizedTarget, normalizedSource);

        // Apply translations to the cloned object
        const setValueAtPath = (obj, path, value) => {
            let current = obj;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        };

        for (let i = 0; i < textPaths.length; i++) {
            const translation = batchResult.translations[i]?.translation;
            if (translation) {
                setValueAtPath(translatedObj, textPaths[i], translation);
            }
        }

        return {
            original: obj,
            translation: translatedObj,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    } catch (error) {
        console.error('Object translation error:', error.message);
        return {
            original: obj,
            translation: obj,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            error: error.message,
        };
    }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export const getCacheStats = () => {
    return {
        size: translationCache.size,
        entries: Array.from(translationCache.keys()).length,
    };
};

/**
 * Clear translation cache
 */
export const clearCache = () => {
    translationCache.clear();
    cacheTimestamps.clear();
};

export default {
    translateText,
    translateBatch,
    translateObject,
    getCacheStats,
    clearCache,
};
