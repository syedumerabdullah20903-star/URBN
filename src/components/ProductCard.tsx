import React, { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../services/whatsapp';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, toggleWishlist, isInWishlist, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  const isSaved = isInWishlist(product.id);

  // Dynamic image based on active color
  const colorSpecificImages = (product.colorImages && selectedColor && product.colorImages[selectedColor]) || product.images;
  const primaryImage = colorSpecificImages[0] || product.images[0];
  const secondaryImage = colorSpecificImages[1] || colorSpecificImages[0] || product.images[0];

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
      onClick={() => openProductDetail(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-white rounded-md overflow-hidden border border-neutral-200/70 hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer text-left select-none"
    >
      {/* Image Container (Aspect Ratio 3:4) */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
        <ProductImage
          src={isHovered ? secondaryImage : primaryImage}
          alt={`${product.title} - ${selectedColor}`}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
        />

        {/* Discount / Tag Badge */}
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 tracking-wider rounded-xs shadow-xs">
            -{product.discountPercent}%
          </div>
        ) : product.isNewArrival ? (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 tracking-wider rounded-xs shadow-xs">
            NEW
          </div>
        ) : null}

        {/* Color preview pill on mobile */}
        {selectedColor && (
          <div className="sm:hidden absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
            {selectedColor}
          </div>
        )}

        {/* Wishlist Button (Enlarged touch target for mobile) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-2 sm:p-2 rounded-full backdrop-blur-md transition-colors ${
            isSaved
              ? 'bg-red-50 text-red-600'
              : 'bg-white/85 hover:bg-white text-neutral-600 hover:text-black shadow-xs'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-red-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 ${
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
                <span>QUICK ADD ({selectedColor})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2">
        <div className="space-y-0.5 sm:space-y-1">
          {/* Category & SKU */}
          <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono truncate">{product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Swatches row */}
        <div className="pt-1 flex items-end justify-between gap-1.5 border-t border-neutral-100">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-900 tabular-nums font-mono whitespace-nowrap">
              PKR {formatPKR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through tabular-nums font-mono whitespace-nowrap">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Interactive Color Swatches: Click switches product card photo directly! */}
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
                      setSelectedColor(col.name);
                    }}
                    style={{ backgroundColor: col.hex }}
                    className={`w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 ring-1 ring-black scale-125 shadow-xs'
                        : 'border-neutral-300 hover:scale-115'
                    }`}
                  />
                );
              })}
              {product.colors.length > 3 && (
                <span className="text-[9px] text-neutral-400">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
