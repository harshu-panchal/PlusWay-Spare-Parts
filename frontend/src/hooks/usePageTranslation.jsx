/**
 * usePageTranslation Hook
 * For translating static page content with better batching and performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateBatch } from '../services/translationService';

/**
 * Hook for translating static page content
 * Pre-translates all provided texts when language changes
 * 
 * @param {string[]} staticTexts - Array of static texts to translate
 * @param {Object} options - Configuration options
 * @param {string} options.sourceLang - Source language code (default: 'en')
 * @returns {Object} - Translation helper and state
 */
export const usePageTranslation = (staticTexts = [], { sourceLang = 'en' } = {}) => {
    const { language, isEnglish, isChangingLanguage } = useLanguage();
    const [isTranslating, setIsTranslating] = useState(false);
    const [translations, setTranslations] = useState({});
    const previousLanguageRef = useRef(language);
    const textsRef = useRef(staticTexts);

    // Update textsRef when staticTexts change
    useEffect(() => {
        textsRef.current = staticTexts;
    }, [staticTexts]);

    // Translate when language changes
    useEffect(() => {
        const translateTexts = async () => {
            // Skip if English (no translation needed)
            if (isEnglish) {
                const englishMap = {};
                textsRef.current.forEach(text => {
                    englishMap[text] = text;
                });
                setTranslations(englishMap);
                return;
            }

            // Skip if same language and we have translations
            if (
                language === previousLanguageRef.current &&
                Object.keys(translations).length > 0
            ) {
                return;
            }

            previousLanguageRef.current = language;

            // Filter out empty/invalid texts
            const validTexts = textsRef.current.filter(
                text => text && typeof text === 'string' && text.trim() !== ''
            );

            if (validTexts.length === 0) {
                return;
            }

            setIsTranslating(true);

            try {
                const translatedTexts = await translateBatch(validTexts, language, sourceLang);

                // Create a map of original -> translated
                const newTranslations = {};
                validTexts.forEach((text, index) => {
                    newTranslations[text] = translatedTexts[index] || text;
                });

                setTranslations(newTranslations);
            } catch (error) {
                console.error('Page translation error:', error);

                // On error, map texts to themselves
                const fallbackMap = {};
                validTexts.forEach(text => {
                    fallbackMap[text] = text;
                });
                setTranslations(fallbackMap);
            } finally {
                setIsTranslating(false);
            }
        };

        translateTexts();
    }, [language, isEnglish, sourceLang]);

    /**
     * Get translated text for a given original text
     * @param {string} originalText - The original text to get translation for
     * @returns {string} - Translated text (or original if not translated yet)
     */
    const getTranslatedText = useCallback((originalText) => {
        if (!originalText || typeof originalText !== 'string') {
            return originalText;
        }

        // Return from translations map, or original if not found
        return translations[originalText] || originalText;
    }, [translations]);

    /**
     * Alias for getTranslatedText - shorthand
     */
    const t = getTranslatedText;

    /**
     * Check if a specific text has been translated
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    const isTextTranslated = useCallback((text) => {
        return text in translations && translations[text] !== text;
    }, [translations]);

    return {
        getTranslatedText,
        t,
        isTranslating: isTranslating || isChangingLanguage,
        isTextTranslated,
        translations,
        currentLanguage: language,
        isEnglish,
    };
};

/**
 * Create a namespace for page translations
 * This creates isolated translation state for different page sections
 */
export const createPageTranslation = (namespace) => {
    const cache = {};

    return {
        get: (language, text) => cache[`${language}_${text}`],
        set: (language, text, translation) => {
            cache[`${language}_${text}`] = translation;
        },
        has: (language, text) => `${language}_${text}` in cache,
        clear: () => {
            Object.keys(cache).forEach(key => delete cache[key]);
        },
    };
};

export default usePageTranslation;
