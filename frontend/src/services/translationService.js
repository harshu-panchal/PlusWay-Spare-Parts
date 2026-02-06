/**
 * Translation Service
 * API client with request queuing and batching
 */

import { API_BASE_URL } from '../config/api';
import { normalizeLanguageCode } from '../utils/languageUtils';
import {
    getCacheKey,
    getFromCache,
    saveToCache,
    getBatchFromCache,
    saveBatchToCache,
} from '../utils/translationCache';

// Configuration
const BATCH_WINDOW_MS = 100; // Wait 100ms to collect batch requests
const MIN_REQUEST_INTERVAL = 200; // Minimum 200ms between API requests
const MAX_BATCH_SIZE = 10; // Maximum texts per batch

// State
let requestQueue = [];
let batchTimeout = null;
let lastRequestTime = 0;
let isProcessing = false;

/**
 * Process the queued requests
 */
const processQueue = async () => {
    if (isProcessing || requestQueue.length === 0) return;

    isProcessing = true;

    try {
        // Get requests to process (up to MAX_BATCH_SIZE)
        const toProcess = requestQueue.splice(0, MAX_BATCH_SIZE);

        // Group by target language and source language
        const groups = {};

        for (const request of toProcess) {
            const key = `${request.sourceLang}_${request.targetLang}`;
            if (!groups[key]) {
                groups[key] = {
                    sourceLang: request.sourceLang,
                    targetLang: request.targetLang,
                    requests: [],
                };
            }
            groups[key].requests.push(request);
        }

        // Process each group
        for (const groupKey of Object.keys(groups)) {
            const group = groups[groupKey];

            // Extract unique texts
            const textsToTranslate = [];
            const textToRequestsMap = new Map();

            for (const request of group.requests) {
                // Check cache first
                const cacheKey = getCacheKey(request.text, group.sourceLang, group.targetLang);
                const cached = await getFromCache(cacheKey);

                if (cached) {
                    request.resolve(cached);
                } else {
                    if (!textToRequestsMap.has(request.text)) {
                        textToRequestsMap.set(request.text, []);
                        textsToTranslate.push(request.text);
                    }
                    textToRequestsMap.get(request.text).push(request);
                }
            }

            // If all were cached, continue to next group
            if (textsToTranslate.length === 0) continue;

            // Rate limiting
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
                await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
            }

            try {
                // Make API request
                lastRequestTime = Date.now();

                const response = await fetch(`${API_BASE_URL}/api/v1/translate/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: textsToTranslate,
                        targetLang: group.targetLang,
                        sourceLang: group.sourceLang,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Translation API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.data.translations) {
                    // Cache and resolve
                    const cacheItems = [];

                    for (let i = 0; i < textsToTranslate.length; i++) {
                        const original = textsToTranslate[i];
                        const translation = data.data.translations[i]?.translation || original;
                        const cacheKey = getCacheKey(original, group.sourceLang, group.targetLang);

                        // Cache the translation
                        cacheItems.push({ key: cacheKey, original, translation });

                        // Resolve all requests for this text
                        const requests = textToRequestsMap.get(original);
                        if (requests) {
                            requests.forEach(req => req.resolve(translation));
                        }
                    }

                    // Save all to cache
                    await saveBatchToCache(cacheItems);
                } else {
                    // Resolve with original text on error
                    for (const request of group.requests) {
                        if (!request.resolved) {
                            request.resolve(request.text);
                        }
                    }
                }
            } catch (error) {
                console.error('Translation API error:', error);

                // Resolve with original text on error
                for (const [text, requests] of textToRequestsMap) {
                    requests.forEach(req => req.resolve(text));
                }
            }
        }
    } finally {
        isProcessing = false;

        // If there are more items in queue, process them
        if (requestQueue.length > 0) {
            batchTimeout = setTimeout(processQueue, BATCH_WINDOW_MS);
        }
    }
};

/**
 * Add a translation request to the queue
 */
const queueRequest = (text, targetLang, sourceLang) => {
    return new Promise((resolve) => {
        requestQueue.push({
            text,
            targetLang: normalizeLanguageCode(targetLang),
            sourceLang: normalizeLanguageCode(sourceLang),
            resolve,
            resolved: false,
        });

        // Clear existing timeout and set new one
        if (batchTimeout) clearTimeout(batchTimeout);
        batchTimeout = setTimeout(processQueue, BATCH_WINDOW_MS);
    });
};

/**
 * Translate a single text
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
    // Skip empty or invalid text
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return text;
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // Skip if same language
    if (normalizedSource === normalizedTarget) {
        return text;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, normalizedSource, normalizedTarget);
    const cached = await getFromCache(cacheKey);

    if (cached) {
        return cached;
    }

    // Queue the request
    return queueRequest(text, normalizedTarget, normalizedSource);
};

/**
 * Translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) {
        return texts;
    }

    // Queue all translations and wait for them
    const promises = texts.map(text => translateText(text, targetLang, sourceLang));
    return Promise.all(promises);
};

/**
 * Translate specific keys in an object
 * @param {Object} obj - Object to translate
 * @param {string[]} keysToTranslate - Keys to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Object>} - Translated object
 */
export const translateObject = async (obj, keysToTranslate, targetLang, sourceLang = 'en') => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // Skip if same language
    if (normalizedSource === normalizedTarget) {
        return obj;
    }

    // Deep clone the object
    const translatedObj = JSON.parse(JSON.stringify(obj));

    // Collect texts to translate
    const textsToTranslate = [];
    const paths = [];

    const collectTexts = (current, path = []) => {
        if (Array.isArray(current)) {
            for (let i = 0; i < current.length; i++) {
                collectTexts(current[i], [...path, i]);
            }
        } else if (current && typeof current === 'object') {
            for (const key of Object.keys(current)) {
                const value = current[key];

                const shouldTranslate = keysToTranslate.includes(key);

                if (shouldTranslate && typeof value === 'string' && value.trim() !== '') {
                    textsToTranslate.push(value);
                    paths.push([...path, key]);
                } else if (typeof value === 'object' && value !== null) {
                    collectTexts(value, [...path, key]);
                }
            }
        }
    };

    collectTexts(obj);

    if (textsToTranslate.length === 0) {
        return translatedObj;
    }

    // Translate all collected texts
    const translations = await translateBatch(textsToTranslate, normalizedTarget, normalizedSource);

    // Apply translations
    const setValueAtPath = (obj, path, value) => {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    };

    for (let i = 0; i < paths.length; i++) {
        setValueAtPath(translatedObj, paths[i], translations[i]);
    }

    return translatedObj;
};

/**
 * Direct API call for single translation (bypasses queue)
 * Use this for immediate translations when batching is not desired
 */
export const translateTextDirect = async (text, targetLang, sourceLang = 'en') => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return text;
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    if (normalizedSource === normalizedTarget) {
        return text;
    }

    // Check cache
    const cacheKey = getCacheKey(text, normalizedSource, normalizedTarget);
    const cached = await getFromCache(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                targetLang: normalizedTarget,
                sourceLang: normalizedSource,
            }),
        });

        if (!response.ok) {
            return text;
        }

        const data = await response.json();

        if (data.success && data.data.translation) {
            await saveToCache(cacheKey, text, data.data.translation);
            return data.data.translation;
        }

        return text;
    } catch (error) {
        console.error('Direct translation error:', error);
        return text;
    }
};

export default {
    translateText,
    translateBatch,
    translateObject,
    translateTextDirect,
};
