import React, { useState } from 'react';

/**
 * LazyImage Component
 * A reusable component for lazy loading images with placeholder support
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes to apply
 * @param {string} placeholder - Placeholder color/gradient while loading
 * @param {function} onLoad - Callback when image loads
 * @param {function} onError - Callback when image fails to load
 */
const LazyImage = ({
    src,
    alt = '',
    className = '',
    placeholder = 'bg-gray-100',
    onLoad,
    onError
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
        setHasError(true);
        if (onError) onError(e);
    };

    if (hasError || !src) {
        return (
            <div className={`${placeholder} flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-2 text-center">
                    {hasError ? "Image not available" : "No Image"}
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {!isLoaded && (
                <div className={`absolute inset-0 ${placeholder} animate-pulse`} />
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
};

export default LazyImage;
