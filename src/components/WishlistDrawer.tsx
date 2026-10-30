import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { formatPKR } from '../services/whatsapp';
import { ProductImage } from './ProductImage';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    clearWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    openProductDetail,
    addToCart,
  } = useStore();

  if (!isWishlistOpen) return null;

  const savedProducts = wishlist
    .map(item => PRODUCTS.find(p => p.id === item.productId))
    .filter(Boolean) as typeof PRODUCTS;

  const handleMoveToCart = (product: typeof PRODUCTS[0]) => {
    // If has single size or default 'M', add directly; otherwise open details
    if (product.sizes.length === 1) {
      addToCart(product, product.sizes[0], product.colors[0]?.name || 'Default');
      toggleWishlist(product.id);
    } else {
      setIsWishlistOpen(false);
      openProductDetail(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600 fill-red-600" />
            <h2 className="text-base font-bold uppercase tracking-tight font-display text-neutral-900">
              Saved Wishlist ({savedProducts.length})
            </h2>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {savedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-800">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Click the heart icon on any product card to save your favorite styles for later.
                </p>
              </div>
            </div>
          ) : (
            savedProducts.map((product) => (
              <div key={product.id} className="py-4 flex gap-3.5 items-start">
                <div className="w-18 h-24 rounded overflow-hidden bg-neutral-100 shrink-0">
                  <ProductImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => {
                        setIsWishlistOpen(false);
                        openProductDetail(product);
                      }}
                      className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 cursor-pointer hover:underline"
                    >
                      {product.title}
                    </h4>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-red-600 transition-colors -mr-1 -mt-1 rounded-md"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-neutral-900 font-mono tabular-nums">
                    PKR {formatPKR(product.price)}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="min-h-[40px] py-2 px-3.5 bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{product.sizes.length === 1 ? 'Move to Bag' : 'Select Size'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <button
              onClick={clearWishlist}
              className="w-full min-h-[44px] py-2.5 text-xs text-neutral-600 hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
            >
              Clear Entire Wishlist
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
