import React, { useState, useRef } from 'react';

const ImageZoom = ({ src, alt, className }) => {
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, active: false });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();

        // Calculate percentages
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setZoomPos({ x, y, active: true });
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden cursor-zoom-in group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomPos(prev => ({ ...prev, active: true }))}
            onMouseLeave={() => setZoomPos(prev => ({ ...prev, active: false }))}
        >
            <img
                src={src || null}
                alt={alt}
                className={`w-full h-full object-contain transition-transform duration-300 ease-out ${zoomPos.active ? 'scale-[2.5]' : 'scale-100'}`}
                style={zoomPos.active ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                } : {}}
            />

            {/* Subtle Overlay to indicate zoom area */}
            {!zoomPos.active && (
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors pointer-events-none" />
            )}
        </div>
    );
};

export default ImageZoom;
