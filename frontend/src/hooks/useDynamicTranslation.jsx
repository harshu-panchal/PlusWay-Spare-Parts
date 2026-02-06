/**
 * useDynamicTranslation Hook
 * For translating API/dynamic content with caching and batching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    translateText as translate,
    translateBatch as batch,
    translateObject as translateObj,
} from '../services/translationService';

/**
 * Hook for translating dynamic content (API responses, user-generated content)
 * @param {Object} options - Configuration options
 * @param {string} options.sourceLang - Source language code (default: 'en')
 * @returns {Object} - Translation functions and state
 */
export const useDynamicTranslation = ({ sourceLang = 'en' } = {}) => {
    const { language, isEnglish } = useLanguage();
    const [isTranslating, setIsTranslating] = useState(false);
    const translationCountRef = useRef(0);

    /**
     * Translate a single text
     * @param {string} text - Text to translate
     * @returns {Promise<string>} - Translated text
     */
    const translateText = useCallback(async (text) => {
        // Skip translation if English or empty
        if (isEnglish || !text || typeof text !== 'string' || text.trim() === '') {
            return text;
        }

        translationCountRef.current++;
        setIsTranslating(true);

        try {
            const result = await translate(text, language, sourceLang);
            return result;
        } finally {
            translationCountRef.current--;
            if (translationCountRef.current === 0) {
                setIsTranslating(false);
            }
        }
    }, [language, isEnglish, sourceLang]);

    /**
     * Translate multiple texts
     * @param {string[]} texts - Array of texts to translate
     * @returns {Promise<string[]>} - Array of translated texts
     */
    const translateBatch = useCallback(async (texts) => {
        // Skip if English or empty
        if (isEnglish || !Array.isArray(texts) || texts.length === 0) {
            return texts;
        }

        translationCountRef.current++;
        setIsTranslating(true);

        try {
            const result = await batch(texts, language, sourceLang);
            return result;
        } finally {
            translationCountRef.current--;
            if (translationCountRef.current === 0) {
                setIsTranslating(false);
            }
        }
    }, [language, isEnglish, sourceLang]);

    /**
     * Translate specific keys in an object
     * @param {Object} obj - Object to translate
     * @param {string[]} keysToTranslate - Keys to translate
     * @returns {Promise<Object>} - Translated object
     */
    const translateObject = useCallback(async (obj, keysToTranslate) => {
        // Skip if English or invalid object
        if (isEnglish || !obj || typeof obj !== 'object') {
            return obj;
        }

        translationCountRef.current++;
        setIsTranslating(true);

        try {
            const result = await translateObj(obj, keysToTranslate, language, sourceLang);
            return result;
        } finally {
            translationCountRef.current--;
            if (translationCountRef.current === 0) {
                setIsTranslating(false);
            }
        }
    }, [language, isEnglish, sourceLang]);

    /**
     * Translate an array of objects
     * @param {Object[]} objects - Array of objects to translate
     * @param {string[]} keysToTranslate - Keys to translate in each object
     * @returns {Promise<Object[]>} - Array of translated objects
     */
    const translateObjectArray = useCallback(async (objects, keysToTranslate) => {
        if (isEnglish || !Array.isArray(objects) || objects.length === 0) {
            return objects;
        }

        translationCountRef.current++;
        setIsTranslating(true);

        try {
            const results = await Promise.all(
                objects.map(obj => translateObj(obj, keysToTranslate, language, sourceLang))
            );
            return results;
        } finally {
            translationCountRef.current--;
            if (translationCountRef.current === 0) {
                setIsTranslating(false);
            }
        }
    }, [language, isEnglish, sourceLang]);

    return {
        translate: translateText,
        translateText,
        translateBatch,
        translateObject,
        translateObjectArray,
        isTranslating,
        currentLanguage: language,
        isEnglish,
    };
};

export default useDynamicTranslation;
