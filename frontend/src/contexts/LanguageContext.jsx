/**
 * Language Context
 * Global language state management with RTL support
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isRTLLanguage } from '../utils/languageUtils';

// Supported languages with their display information
const SUPPORTED_LANGUAGES = {
    'en': {
        code: 'en',
        label: 'English',
        nativeLabel: 'English',
        flag: '🇺🇸',
    },
    'hi': {
        code: 'hi',
        label: 'Hindi',
        nativeLabel: 'हिन्दी',
        flag: '🇮🇳',
    },
    'ar': {
        code: 'ar',
        label: 'Arabic',
        nativeLabel: 'العربية',
        flag: '🇸🇦',
    },
    'es': {
        code: 'es',
        label: 'Spanish',
        nativeLabel: 'Español',
        flag: '🇪🇸',
    },
    'fr': {
        code: 'fr',
        label: 'French',
        nativeLabel: 'Français',
        flag: '🇫🇷',
    },
    'de': {
        code: 'de',
        label: 'German',
        nativeLabel: 'Deutsch',
        flag: '🇩🇪',
    },
    'ta': {
        code: 'ta',
        label: 'Tamil',
        nativeLabel: 'தமிழ்',
        flag: '🇮🇳',
    },
    'te': {
        code: 'te',
        label: 'Telugu',
        nativeLabel: 'తెలుగు',
        flag: '🇮🇳',
    },
    'bn': {
        code: 'bn',
        label: 'Bengali',
        nativeLabel: 'বাংলা',
        flag: '🇮🇳',
    },
    'mr': {
        code: 'mr',
        label: 'Marathi',
        nativeLabel: 'मराठी',
        flag: '🇮🇳',
    },
    'gu': {
        code: 'gu',
        label: 'Gujarati',
        nativeLabel: 'ગુજરાતી',
        flag: '🇮🇳',
    },
    'kn': {
        code: 'kn',
        label: 'Kannada',
        nativeLabel: 'ಕನ್ನಡ',
        flag: '🇮🇳',
    },
    'ml': {
        code: 'ml',
        label: 'Malayalam',
        nativeLabel: 'മലയാളം',
        flag: '🇮🇳',
    },
    'pa': {
        code: 'pa',
        label: 'Punjabi',
        nativeLabel: 'ਪੰਜਾਬੀ',
        flag: '🇮🇳',
    },
    'ur': {
        code: 'ur',
        label: 'Urdu',
        nativeLabel: 'اردو',
        flag: '🇵🇰',
    },
    'ru': {
        code: 'ru',
        label: 'Russian',
        nativeLabel: 'Русский',
        flag: '🇷🇺',
    },
    'zh': {
        code: 'zh',
        label: 'Chinese',
        nativeLabel: '中文',
        flag: '🇨🇳',
    },
    'ja': {
        code: 'ja',
        label: 'Japanese',
        nativeLabel: '日本語',
        flag: '🇯🇵',
    },
    'ko': {
        code: 'ko',
        label: 'Korean',
        nativeLabel: '한국어',
        flag: '🇰🇷',
    },
    'pt': {
        code: 'pt',
        label: 'Portuguese',
        nativeLabel: 'Português',
        flag: '🇧🇷',
    },
    'tr': {
        code: 'tr',
        label: 'Turkish',
        nativeLabel: 'Türkçe',
        flag: '🇹🇷',
    },
    'vi': {
        code: 'vi',
        label: 'Vietnamese',
        nativeLabel: 'Tiếng Việt',
        flag: '🇻🇳',
    },
    'th': {
        code: 'th',
        label: 'Thai',
        nativeLabel: 'ไทย',
        flag: '🇹🇭',
    },
    'id': {
        code: 'id',
        label: 'Indonesian',
        nativeLabel: 'Bahasa Indonesia',
        flag: '🇮🇩',
    },
};

const STORAGE_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE = 'en';

// Create context
const LanguageContext = createContext(null);

/**
 * Language Provider Component
 */
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Try to get from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES[saved]) {
            return saved;
        }

        // Try to detect from browser
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && SUPPORTED_LANGUAGES[browserLang]) {
            return browserLang;
        }

        return DEFAULT_LANGUAGE;
    });

    const [isChangingLanguage, setIsChangingLanguage] = useState(false);

    // Update document direction for RTL languages
    useEffect(() => {
        const isRTL = isRTLLanguage(language);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add/remove RTL class for custom styling
        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [language]);

    // Save language to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    /**
     * Change the current language
     */
    const changeLanguage = useCallback(async (newLanguage) => {
        if (!SUPPORTED_LANGUAGES[newLanguage]) {
            console.warn(`Unsupported language: ${newLanguage}`);
            return;
        }

        if (newLanguage === language) return;

        setIsChangingLanguage(true);

        // Give UI time to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));

        setLanguage(newLanguage);

        // Allow time for translations to update
        setTimeout(() => {
            setIsChangingLanguage(false);
        }, 500);
    }, [language]);

    /**
     * Get language info
     */
    const getLanguageInfo = useCallback((code) => {
        return SUPPORTED_LANGUAGES[code] || null;
    }, []);

    /**
     * Check if a language is RTL
     */
    const isRTL = useCallback(() => {
        return isRTLLanguage(language);
    }, [language]);

    const value = {
        language,
        languages: SUPPORTED_LANGUAGES,
        changeLanguage,
        isChangingLanguage,
        getLanguageInfo,
        isRTL,
        isEnglish: language === 'en',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to use language context
 */
export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
};

export default LanguageContext;
