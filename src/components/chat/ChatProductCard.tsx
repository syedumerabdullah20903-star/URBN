import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Check, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatPKR } from '../../services/whatsapp';
import { useStore } from '../../context/StoreContext';
import { ProductImage } from '../ProductImage';

interface ChatProductCardProps {
  product: Product;
  onViewProduct?: (product: Product) => void;
}

export const ChatProductCard: React.FC<ChatProductCardProps> = ({
  product,
  onViewProduct,
}) => {
  const { addToCart, openProductDetail, addToast } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const [isAdded, setIsAdded] = useState(false);
  const [isSizeSelectorOpen, setIsSizeSelectorOpen] = useState(false);

  const handleView = () => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      openProductDetail(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) {
      setIsSizeSelectorOpen(true);
      return;
    }
    const colorToUse = selectedColor || product.colors[0]?.name || 'Standard';
    const success = addToCart(product, selectedSize, colorToUse, 1);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      addToast('Added to Bag', `${product.title} (${selectedSize} / ${colorToUse}) added.`, 'success');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col text-neutral-900 w-full max-w-[280px] shrink-0">
      {/* Product Image Thumbnail */}
      <div
        onClick={handleView}
        className="relative h-36 bg-neutral-100 overflow-hidden cursor-pointer group"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {product.discountPercent && product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider shadow-xs">
            -{product.discountPercent}%
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="py-1 px-2.5 bg-white/95 text-neutral-900 text-[10px] font-bold uppercase rounded shadow-xs flex items-center gap-1">
            <Eye className="w-3 h-3" /> View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase font-mono text-neutral-400">
            {product.sku}
          </div>
          <h4
            onClick={handleView}
            className="text-xs font-bold text-neutral-900 line-clamp-1 hover:underline cursor-pointer"
            title={product.title}
          >
            {product.title}
          </h4>

          {/* Pricing */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-bold text-neutral-900 tabular-nums">
              PKR {formatPKR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-neutral-400 line-through tabular-nums">
                PKR {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Variant / Size Picker & Add to Cart */}
        <div className="space-y-1.5 pt-1 border-t border-neutral-100">
          <div className="flex items-center justify-between text-[10px] text-neutral-500">
            <span>Size:</span>
            <div className="flex items-center gap-1">
              {product.sizes.slice(0, 4).map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    selectedSize === sz
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleView}
              className="py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleAddToCart}
              className={`py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 shadow-xs ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-950 text-white hover:bg-neutral-800'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
