import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Move,
} from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ImageZoomLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  title: string;
  selectedColor?: string;
}

export const ImageZoomLightbox: React.FC<ImageZoomLightboxProps> = ({
  isOpen,
  onClose,
  images,
  activeIndex,
  onIndexChange,
  title,
  selectedColor,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when image changes or opens
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [activeIndex, isOpen]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (activeIndex < images.length - 1) onIndexChange(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        if (activeIndex > 0) onIndexChange(activeIndex - 1);
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev + 0.5, 3.5));
      } else if (e.key === '-' || e.key === '_') {
        setScale((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, images.length, onClose, onIndexChange]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const maxX = (scale - 1) * 300;
    const maxY = (scale - 1) * 300;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan (when zoomed) or swipe next/prev (when scale === 1)
  const swipeTouchStartX = useRef<number | null>(null);
  const swipeTouchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else {
      swipeTouchStartX.current = e.touches[0].clientX;
      swipeTouchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scale > 1 && isDragging && e.touches.length === 1) {
      const maxX = (scale - 1) * 260;
      const maxY = (scale - 1) * 260;
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale > 1) {
      setIsDragging(false);
    } else if (swipeTouchStartX.current !== null && e.changedTouches.length > 0) {
      const diffX = swipeTouchStartX.current - e.changedTouches[0].clientX;
      const diffY = swipeTouchStartY.current ? Math.abs(swipeTouchStartY.current - e.changedTouches[0].clientY) : 0;
      if (Math.abs(diffX) > 30 && Math.abs(diffX) > diffY) {
        if (diffX > 0 && activeIndex < images.length - 1) {
          onIndexChange(activeIndex + 1);
        } else if (diffX < 0 && activeIndex > 0) {
          onIndexChange(activeIndex - 1);
        }
      }
      swipeTouchStartX.current = null;
      swipeTouchStartY.current = null;
    }
  };

  // Double click/tap toggle 2.5x zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3 sm:p-5 text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-display truncate max-w-[220px] sm:max-w-md">
            {title}
          </h3>
          {selectedColor && (
            <span className="text-[10px] sm:text-xs text-neutral-400">
              Color: <strong className="text-white">{selectedColor}</strong> · Double tap / click to zoom
            </span>
          )}
        </div>

        {/* Controls: Zoom In / Zoom Out / Reset / Close */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-1 backdrop-blur-md text-xs">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 hover:bg-white/20 rounded disabled:opacity-30 transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.5}
              className="p-1.5 hover:bg-white/20 rounded disabled:opacity-30 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              disabled={scale === 1}
              className="p-1.5 hover:bg-white/20 rounded disabled:opacity-30 transition-colors ml-1"
              title="Reset Zoom (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Close zoom viewer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className={`relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6 ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        {/* Navigation Arrow Left */}
        {images.length > 1 && activeIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(activeIndex - 1);
            }}
            className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Scaled & Panned Image */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="max-w-full max-h-[75vh] flex items-center justify-center pointer-events-none"
        >
          <img
            src={images[activeIndex] || images[0]}
            alt={title}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl drop-shadow-2xl"
          />
        </div>

        {/* Navigation Arrow Right */}
        {images.length > 1 && activeIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(activeIndex + 1);
            }}
            className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Pan Indicator when zoomed */}
        {scale > 1 && (
          <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-neutral-300 flex items-center gap-1.5 pointer-events-none">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>Drag to pan · Double tap to reset</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Quick Zoom Buttons on Mobile + Thumbnails Rail */}
      <div className="p-3 sm:p-5 z-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-3">
        
        {/* Mobile Quick Zoom Buttons */}
        <div className="flex sm:hidden items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-1 disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] font-bold px-1 tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            className="p-1 disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-neutral-500">|</span>
          <button
            onClick={() => setScale(2)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${scale === 2 ? 'bg-white text-black' : 'text-neutral-300'}`}
          >
            2x
          </button>
          <button
            onClick={() => setScale(3)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${scale === 3 ? 'bg-white text-black' : 'text-neutral-300'}`}
          >
            3x
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-0.5 text-[10px] text-neutral-400 underline"
          >
            Reset
          </button>
        </div>

        {/* Thumbnails Rail */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-1 px-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative w-12 h-16 sm:w-16 sm:h-20 rounded overflow-hidden border-2 transition-all shrink-0 ${
                  activeIndex === idx
                    ? 'border-white scale-105 shadow-md'
                    : 'border-white/30 opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
