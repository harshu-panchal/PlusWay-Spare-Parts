/**
 * TranslatedText Components
 * Reusable components for translated content
 */

import React, { useState, useEffect, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../services/translationService';

/**
 * TranslatedText Component
 * Translates a single text string and displays it
 * 
 * @param {Object} props
 * @param {string} props.text - Text to translate
 * @param {string} props.sourceLang - Source language (default: 'en')
 * @param {string} props.as - HTML element to render (default: 'span')
 * @param {string} props.className - CSS class name
 * @param {string} props.loadingText - Text to show while loading (optional)
 * @param {boolean} props.showOriginalWhileLoading - Show original text while loading
 */
export const TranslatedText = memo(({
    text,
    sourceLang = 'en',
    as: Component = 'span',
    className = '',
    loadingText = '',
    showOriginalWhileLoading = true,
    ...props
}) => {
    const { language, isEnglish } = useLanguage();
    const [translatedText, setTranslatedText] = useState(text);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const translate = async () => {
            // Skip if English or empty
            if (isEnglish || !text || typeof text !== 'string' || text.trim() === '') {
                setTranslatedText(text);
                return;
            }

            setIsLoading(true);

            try {
                const result = await translateText(text, language, sourceLang);
                if (isMounted) {
                    setTranslatedText(result);
                }
            } catch (error) {
                console.error('TranslatedText error:', error);
                if (isMounted) {
                    setTranslatedText(text);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        translate();

        return () => {
            isMounted = false;
        };
    }, [text, language, isEnglish, sourceLang]);

    const displayText = isLoading
        ? (showOriginalWhileLoading ? translatedText : (loadingText || translatedText))
        : translatedText;

    return (
        <Component className={className} {...props}>
            {displayText}
        </Component>
    );
});

TranslatedText.displayName = 'TranslatedText';

/**
 * AutoTranslated Component
 * Automatically translates its children (text content only)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child content
 * @param {string} props.sourceLang - Source language
 */
export const AutoTranslated = memo(({
    children,
    sourceLang = 'en',
    ...props
}) => {
    const { language, isEnglish } = useLanguage();
    const [translatedContent, setTranslatedContent] = useState(children);

    useEffect(() => {
        if (isEnglish || typeof children !== 'string') {
            setTranslatedContent(children);
            return;
        }

        let isMounted = true;

        translateText(children, language, sourceLang)
            .then(result => {
                if (isMounted) {
                    setTranslatedContent(result);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setTranslatedContent(children);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [children, language, isEnglish, sourceLang]);

    if (typeof children === 'string') {
        return <span {...props}>{translatedContent}</span>;
    }

    return <>{children}</>;
});

AutoTranslated.displayName = 'AutoTranslated';

/**
 * TranslatedContent Component
 * For objects/arrays of content that need translation
 * 
 * @param {Object} props
 * @param {Object|Array} props.content - Content to translate
 * @param {string[]} props.keys - Keys to translate
 * @param {Function} props.render - Render function with translated content
 * @param {string} props.sourceLang - Source language
 */
export const TranslatedContent = memo(({
    content,
    keys = [],
    render,
    sourceLang = 'en',
    children,
}) => {
    const { language, isEnglish } = useLanguage();
    const [translatedContent, setTranslatedContent] = useState(content);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEnglish || !content) {
            setTranslatedContent(content);
            return;
        }

        let isMounted = true;

        const translateContent = async () => {
            setIsLoading(true);

            try {
                // Handle object translation
                if (typeof content === 'object' && !Array.isArray(content)) {
                    const result = await translateObjectContent(content, keys, language, sourceLang);
                    if (isMounted) {
                        setTranslatedContent(result);
                    }
                }
                // Handle array of objects
                else if (Array.isArray(content)) {
                    const results = await Promise.all(
                        content.map(item => translateObjectContent(item, keys, language, sourceLang))
                    );
                    if (isMounted) {
                        setTranslatedContent(results);
                    }
                }
            } catch (error) {
                console.error('TranslatedContent error:', error);
                if (isMounted) {
                    setTranslatedContent(content);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        translateContent();

        return () => {
            isMounted = false;
        };
    }, [content, keys, language, isEnglish, sourceLang]);

    if (render) {
        return render(translatedContent, isLoading);
    }

    if (typeof children === 'function') {
        return children(translatedContent, isLoading);
    }

    return null;
});

TranslatedContent.displayName = 'TranslatedContent';

/**
 * Helper function to translate object content
 */
const translateObjectContent = async (obj, keys, targetLang, sourceLang) => {
    if (!obj || typeof obj !== 'object') return obj;

    const translated = { ...obj };

    for (const key of keys) {
        if (translated[key] && typeof translated[key] === 'string') {
            translated[key] = await translateText(translated[key], targetLang, sourceLang);
        }
    }

    return translated;
};

/**
 * Simple T component for inline translation
 * Usage: <T>Hello World</T>
 */
export const T = memo(({ children, ...props }) => (
    <TranslatedText text={children} {...props} />
));

T.displayName = 'T';

export default TranslatedText;
