import React from 'react';

/**
 * LoadingFallback Component
 * Used as a fallback for Suspense boundaries during route transitions
 * 
 * @param {boolean} fullscreen - Whether to show fullscreen loading or inline
 */
const LoadingFallback = ({ fullscreen = true }) => {
    if (!fullscreen) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc]">
            {/* Logo/Brand */}
            <div className="mb-8">
                <span className="text-4xl font-black text-primary italic">PLUSWAY</span>
            </div>

            {/* Spinner */}
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            </div>

            {/* Loading Text */}
            <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm">
                Loading...
            </p>
        </div>
    );
};

export default LoadingFallback;
