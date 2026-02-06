/**
 * Language Utilities
 * Handles language code normalization and RTL detection
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
 * Denormalize language code back to a common format
 * @param {string} code - Normalized code
 * @returns {string} - Full code if applicable
 */
export const denormalizeLanguageCode = (code) => {
    // For most cases, just return the code
    // Special cases can be handled here
    return code;
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
 * Get display name for a language code
 * @param {string} code - Language code
 * @returns {string} - Display name
 */
export const getLanguageDisplayName = (code) => {
    const displayNames = {
        'en': 'English',
        'hi': 'हिन्दी (Hindi)',
        'ar': 'العربية (Arabic)',
        'es': 'Español (Spanish)',
        'fr': 'Français (French)',
        'de': 'Deutsch (German)',
        'pt': 'Português (Portuguese)',
        'ru': 'Русский (Russian)',
        'zh': '中文 (Chinese)',
        'zh-CN': '简体中文 (Simplified Chinese)',
        'zh-TW': '繁體中文 (Traditional Chinese)',
        'ja': '日本語 (Japanese)',
        'ko': '한국어 (Korean)',
        'ta': 'தமிழ் (Tamil)',
        'te': 'తెలుగు (Telugu)',
        'bn': 'বাংলা (Bengali)',
        'mr': 'मराठी (Marathi)',
        'gu': 'ગુજરાતી (Gujarati)',
        'kn': 'ಕನ್ನಡ (Kannada)',
        'ml': 'മലയാളം (Malayalam)',
        'pa': 'ਪੰਜਾਬੀ (Punjabi)',
        'ur': 'اردو (Urdu)',
        'he': 'עברית (Hebrew)',
        'fa': 'فارسی (Persian)',
        'th': 'ไทย (Thai)',
        'vi': 'Tiếng Việt (Vietnamese)',
        'id': 'Bahasa Indonesia',
        'ms': 'Bahasa Melayu (Malay)',
        'tr': 'Türkçe (Turkish)',
        'it': 'Italiano (Italian)',
        'nl': 'Nederlands (Dutch)',
        'pl': 'Polski (Polish)',
        'uk': 'Українська (Ukrainian)',
    };

    const normalizedCode = normalizeLanguageCode(code);
    return displayNames[normalizedCode] || code;
};

export default {
    languageCodeMap,
    RTL_LANGUAGES,
    normalizeLanguageCode,
    denormalizeLanguageCode,
    isRTLLanguage,
    getLanguageDisplayName,
};
