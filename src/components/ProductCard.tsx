import React, { useState, useRef } from 'react';
import { Heart, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../services/whatsapp';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, toggleWishlist, isInWishlist, addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  // Touch tracking for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);

  const isSaved = isInWishlist(product.id);

  // Dynamic image list based on active color
  const colorSpecificImages = (product.colorImages && selectedColor && product.colorImages[selectedColor]) || product.images;
  const availableImages = colorSpecificImages.length > 0 ? colorSpecificImages : product.images;
  const currentImage = availableImages[currentImageIdx] || availableImages[0] || product.images[0];

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % availableImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setCurrentImageIdx(0);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.touches[0].clientX;
    const diffY = touchStartY.current - e.touches[0].clientY;

    // Detect horizontal swipe intention
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current ? Math.abs(touchStartY.current - e.changedTouches[0].clientY) : 0;

    // Threshold of 30px swipe distance
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        // Swiped left -> next photo
        handleNextImage();
      } else {
        // Swiped right -> prev photo
        handlePrevImage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    // Release isSwiping after short delay to prevent triggering card click
    setTimeout(() => {
      isSwiping.current = false;
    }, 100);
  };

  const handleCardClick = () => {
    if (isSwiping.current) return;
    openProductDetail(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes.includes('M') ? 'M' : product.sizes[0];
    const success = addToCart(product, defaultSize, selectedColor, 1);
    if (success) {
      setQuickAddSuccess(true);
      setTimeout(() => setQuickAddSuccess(false), 1500);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white rounded-md overflow-hidden border border-neutral-200/80 hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer text-left select-none w-full min-w-0"
    >
      {/* Image Container (Aspect Ratio 3:4) with touch swipe listeners */}
      <div
        className="relative aspect-[3/4] bg-neutral-100 overflow-hidden w-full touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ProductImage
          src={currentImage}
          alt={`${product.title} - ${selectedColor}`}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
        />

        {/* Discount / Tag Badge */}
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 tracking-wider rounded-xs shadow-xs z-10">
            -{product.discountPercent}%
          </div>
        ) : product.isNewArrival ? (
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 tracking-wider rounded-xs shadow-xs z-10">
            NEW
          </div>
        ) : null}

        {/* Color preview pill */}
        {selectedColor && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/65 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase z-10 max-w-[80px] truncate">
            {selectedColor}
          </div>
        )}

        {/* Wishlist Button (40px touch target) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1 right-1 sm:top-2 sm:right-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-full backdrop-blur-md transition-colors z-10 ${
            isSaved
              ? 'bg-red-50 text-red-600'
              : 'bg-white/90 hover:bg-white text-neutral-600 hover:text-black shadow-xs'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-red-600' : ''}`} />
        </button>

        {/* Swipe Chevrons: Always visible on mobile if multi-image, or on hover desktop */}
        {availableImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-neutral-900 shadow-xs flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-neutral-900 shadow-xs flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Swipe Indicator Dots at bottom center */}
        {availableImages.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
            {availableImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === currentImageIdx
                    ? 'w-3 sm:w-3.5 bg-white shadow-xs'
                    : 'w-1 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 ${
              quickAddSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-black text-white'
            }`}
          >
            {quickAddSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>QUICK ADD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between gap-1 w-full min-w-0">
        <div className="space-y-0.5 min-w-0">
          {/* Category & SKU */}
          <div className="text-[9px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1 min-w-0">
            <span className="truncate">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono truncate">{product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Swatches row - Cleanly responsive without overflowing */}
        <div className="pt-1.5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-end justify-between gap-1 min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-neutral-900 tabular-nums font-mono whitespace-nowrap">
              PKR {formatPKR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[9px] sm:text-[10px] text-neutral-400 line-through tabular-nums font-mono whitespace-nowrap">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Interactive Color Swatches: Click switches product card photo directly */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {product.colors.slice(0, 3).map((col) => {
                const isSelected = selectedColor === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    title={`View in ${col.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(col.name);
                    }}
                    className="w-4 h-4 rounded-full flex items-center justify-center p-0"
                    aria-label={`Select ${col.name}`}
                  >
                    <span
                      style={{ backgroundColor: col.hex }}
                      className={`w-3 h-3 rounded-full border transition-all inline-block ${
                        isSelected
                          ? 'border-neutral-900 ring-1 ring-black scale-125 shadow-xs'
                          : 'border-neutral-300 hover:scale-110'
                      }`}
                    />
                  </button>
                );
              })}
              {product.colors.length > 3 && (
                <span className="text-[8px] text-neutral-400 font-mono">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
