import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageLightbox = ({
  isOpen,
  images = [],
  initialIndex = 0,
  onClose,
  alt = "",
}) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setIndex(initialIndex);
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowRight")
        setIndex((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images.length) return null;

  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close image viewer">
        <X size={28} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center justify-center gap-3">
        <img
          src={images[index]}
          alt={alt}
          className="max-w-[92vw] md:max-w-[88vw] max-h-[82vh] md:max-h-[88vh] object-contain select-none"
          draggable={false}
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Previous image">
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Next image">
            <ChevronRight size={32} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <div className="text-white/70 text-[11px] font-bold tracking-widest">
              {index + 1} / {images.length}
            </div>
            <div className="flex gap-2 overflow-x-auto max-w-[92vw] px-2 pb-1 rounded-lg bg-black/40 backdrop-blur-sm">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`w-12 h-12 shrink-0 border-2 bg-white p-1 transition-all my-1 ${
                    i === index
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Show image ${i + 1}`}>
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageLightbox;
