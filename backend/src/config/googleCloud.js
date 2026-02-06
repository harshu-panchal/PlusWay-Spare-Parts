/**
 * Google Cloud Translate Configuration
 * Handles API key initialization and language code mapping
 */

// Language code mapping from various formats to Google Translate API codes
export const languageCodeMap = {
    // Standard codes
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-IN': 'en',

    // Hindi
    'hi': 'hi',
    'hi-IN': 'hi',

    // Arabic
    'ar': 'ar',
    'ar-SA': 'ar',
    'ar-AE': 'ar',

    // Spanish
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',

    // French
    'fr': 'fr',
    'fr-FR': 'fr',

    // German
    'de': 'de',
    'de-DE': 'de',

    // Portuguese
    'pt': 'pt',
    'pt-BR': 'pt',
    'pt-PT': 'pt',

    // Russian
    'ru': 'ru',

    // Chinese
    'zh': 'zh',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',

    // Japanese
    'ja': 'ja',

    // Korean
    'ko': 'ko',

    // Tamil
    'ta': 'ta',
    'ta-IN': 'ta',

    // Telugu
    'te': 'te',
    'te-IN': 'te',

    // Bengali
    'bn': 'bn',
    'bn-IN': 'bn',

    // Marathi
    'mr': 'mr',
    'mr-IN': 'mr',

    // Gujarati
    'gu': 'gu',
    'gu-IN': 'gu',

    // Kannada
    'kn': 'kn',
    'kn-IN': 'kn',

    // Malayalam
    'ml': 'ml',
    'ml-IN': 'ml',

    // Punjabi
    'pa': 'pa',
    'pa-IN': 'pa',

    // Urdu
    'ur': 'ur',
    'ur-PK': 'ur',

    // Hebrew
    'he': 'he',
    'iw': 'he', // Legacy code

    // Persian/Farsi
    'fa': 'fa',
    'fa-IR': 'fa',

    // Thai
    'th': 'th',

    // Vietnamese
    'vi': 'vi',

    // Indonesian
    'id': 'id',

    // Malay
    'ms': 'ms',

    // Turkish
    'tr': 'tr',

    // Italian
    'it': 'it',

    // Dutch
    'nl': 'nl',

    // Polish
    'pl': 'pl',

    // Ukrainian
    'uk': 'uk',
};

// RTL (Right-to-Left) languages
export const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa'];

/**
 * Normalize language code to Google Translate API format
 * @param {string} code - Language code (e.g., 'en-US', 'hi-IN')
 * @returns {string} - Normalized code (e.g., 'en', 'hi')
 */
export const normalizeLanguageCode = (code) => {
    if (!code) return 'en';
    return languageCodeMap[code] || code.split('-')[0] || 'en';
};

/**
 * Check if a language is RTL
 * @param {string} code - Language code
 * @returns {boolean}
 */
export const isRTLLanguage = (code) => {
    const normalizedCode = normalizeLanguageCode(code);
    return RTL_LANGUAGES.includes(normalizedCode);
};

/**
 * Get Google Cloud Translate API key
 * @returns {string}
 */
export const getTranslateApiKey = () => {
    const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
    if (!apiKey) {
        console.warn('GOOGLE_CLOUD_TRANSLATE_API_KEY is not set in environment variables');
    }
    return apiKey;
};

export default {
    languageCodeMap,
    RTL_LANGUAGES,
    normalizeLanguageCode,
    isRTLLanguage,
    getTranslateApiKey,
};
