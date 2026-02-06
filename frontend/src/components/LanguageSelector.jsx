/**
 * LanguageSelector Component
 * Dropdown for selecting language with flag support
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Language Selector Dropdown
 * 
 * @param {Object} props
 * @param {string} props.variant - 'dropdown' | 'compact' | 'icon-only'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showFlag - Show language flags
 * @param {boolean} props.showNative - Show native language names
 */
const LanguageSelector = ({
    variant = 'dropdown',
    className = '',
    showFlag = true,
    showNative = true,
}) => {
    const { language, languages, changeLanguage, isChangingLanguage, getLanguageInfo } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = getLanguageInfo(language);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = async (code) => {
        await changeLanguage(code);
        setIsOpen(false);
    };

    if (variant === 'icon-only') {
        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                    aria-label="Select language"
                    disabled={isChangingLanguage}
                >
                    <Globe size={20} className={`text-gray-600 ${isChangingLanguage ? 'animate-pulse' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                        {Object.values(languages).map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${language === lang.code ? 'bg-orange-50' : ''
                                    }`}
                            >
                                {showFlag && <span className="text-lg">{lang.flag}</span>}
                                <div className="flex-1 text-left">
                                    <span className="text-sm font-medium text-gray-800">
                                        {showNative ? lang.nativeLabel : lang.label}
                                    </span>
                                    {showNative && (
                                        <span className="text-xs text-gray-500 ml-2">({lang.label})</span>
                                    )}
                                </div>
                                {language === lang.code && (
                                    <Check size={16} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary hover:bg-orange-50 transition-colors flex items-center gap-2 text-sm"
                    disabled={isChangingLanguage}
                >
                    {showFlag && <span className="text-base">{currentLang?.flag}</span>}
                    <span className="font-medium text-gray-700">{currentLang?.code?.toUpperCase()}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
                        {Object.values(languages).map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm ${language === lang.code ? 'bg-orange-50 text-primary' : 'text-gray-700'
                                    }`}
                            >
                                {showFlag && <span>{lang.flag}</span>}
                                <span className="flex-1 text-left font-medium">{lang.code.toUpperCase()}</span>
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default dropdown variant
    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:border-primary hover:bg-orange-50 transition-colors flex items-center gap-3 min-w-[160px]"
                disabled={isChangingLanguage}
            >
                {showFlag && <span className="text-lg">{currentLang?.flag}</span>}
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                    {showNative ? currentLang?.nativeLabel : currentLang?.label}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${isChangingLanguage ? 'animate-spin' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                    {Object.values(languages).map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${language === lang.code ? 'bg-orange-50' : ''
                                }`}
                        >
                            {showFlag && <span className="text-lg">{lang.flag}</span>}
                            <div className="flex-1 text-left">
                                <span className="text-sm font-medium text-gray-800">
                                    {showNative ? lang.nativeLabel : lang.label}
                                </span>
                                {showNative && lang.nativeLabel !== lang.label && (
                                    <span className="text-xs text-gray-500 ml-2">({lang.label})</span>
                                )}
                            </div>
                            {language === lang.code && (
                                <Check size={16} className="text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Header Language Button - A styled button for the header
 */
export const HeaderLanguageButton = () => {
    const { language, getLanguageInfo, isChangingLanguage } = useLanguage();
    const currentLang = getLanguageInfo(language);

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800/50 hover:bg-gray-700 transition-colors cursor-pointer">
            <Globe size={12} className={isChangingLanguage ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold uppercase">{currentLang?.flag}</span>
            <span className="text-[10px] font-bold uppercase">{language}</span>
        </div>
    );
};

export default LanguageSelector;
