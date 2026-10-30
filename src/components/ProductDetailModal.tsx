import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Zap,
  Ruler,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  Check,
  AlertCircle,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../services/whatsapp';
import { SizeGuideModal } from './SizeGuideModal';
import { ImageZoomLightbox } from './ImageZoomLightbox';
import { PRODUCTS } from '../data/products';
import { ProductImage } from './ProductImage';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    closeProductDetail,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    setIsCheckoutOpen,
    openProductDetail,
    openPolicies,
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<'fabric' | 'shipping' | 'fit'>('fabric');

  // Reset state when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      const defaultColor = selectedProduct.colors[0]?.name || '';
      setSelectedColor(defaultColor);
      setActiveImageIdx(0);
      if (selectedProduct.sizes.length === 1) {
        setSelectedSize(selectedProduct.sizes[0]);
      } else {
        setSelectedSize('');
      }
      setQuantity(1);
      setValidationError('');
      setIsLightboxOpen(false);
    }
  }, [selectedProduct]);

  // Dynamic gallery images based on selected color
  const activeImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedColor && selectedProduct.colorImages && selectedProduct.colorImages[selectedColor]) {
      return selectedProduct.colorImages[selectedColor];
    }
    return selectedProduct.images;
  }, [selectedProduct, selectedColor]);

  if (!selectedProduct) return null;

  const isSaved = isInWishlist(selectedProduct.id);

  // Variant stock
  const currentVariant = selectedProduct.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );
  const availableStock = currentVariant
    ? currentVariant.quantity
    : selectedProduct.stockQuantity;

  const isOutOfStock = selectedSize && selectedColor && availableStock <= 0;

  const relatedProducts = PRODUCTS.filter(
    p => p.id !== selectedProduct.id && p.category === selectedProduct.category
  ).slice(0, 3);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setActiveImageIdx(0); // Switch to the first photo of this color
    setValidationError('');
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setValidationError('Please select a size to proceed.');
      return;
    }
    if (!selectedColor) {
      setValidationError('Please select a color.');
      return;
    }
    setValidationError('');
    const success = addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    if (success) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setValidationError('Please select a size to proceed with checkout.');
      return;
    }
    if (!selectedColor) {
      setValidationError('Please select a color.');
      return;
    }
    setValidationError('');
    const success = addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    if (success) {
      closeProductDetail();
      setIsCheckoutOpen(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          onClick={closeProductDetail}
        />

        {/* Modal Dialog Panel: Full-height on mobile for app-like experience, modal on desktop */}
        <div className="relative w-full max-w-5xl bg-white h-[92vh] sm:h-auto sm:max-h-[94vh] rounded-t-2xl sm:rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col my-0 sm:my-auto">
          
          {/* Sticky top close & header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white sticky top-0 z-20">
            <div className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono truncate max-w-[200px] sm:max-w-md">
              URBN / {selectedProduct.category} / {selectedProduct.sku}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="p-2 text-neutral-500 hover:text-red-600 rounded-full hover:bg-neutral-100"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
              <button
                onClick={closeProductDetail}
                className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Close product view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Scrollable with bottom padding for mobile sticky CTA */}
          <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 sm:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Gallery Column (7 cols) with High-Res Zoom Lightbox Trigger */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {/* Main Image with Zoom click */}
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative aspect-[3/4] bg-neutral-100 rounded-md sm:rounded-lg overflow-hidden cursor-zoom-in group shadow-xs hover:shadow-md transition-shadow"
                >
                  <ProductImage
                    src={activeImages[activeImageIdx] || activeImages[0]}
                    alt={`${selectedProduct.title} - ${selectedColor}`}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                  />
                  
                  {/* Zoom badge overlay */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-colors pointer-events-none">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Inspect Zoom (3.5x)</span>
                  </div>

                  {selectedProduct.discountPercent && (
                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 tracking-wider rounded-xs shadow-xs">
                      -{selectedProduct.discountPercent}% OFF
                    </div>
                  )}

                  {/* Color tag on image */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                    {selectedColor}
                  </div>
                </div>

                {/* Thumbnails rail for active color */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 px-0.5">
                    <span>{activeImages.length} Photos for {selectedColor}</span>
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="text-neutral-700 hover:text-black font-semibold flex items-center gap-1 underline"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Full Screen Zoom</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
                    {activeImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded overflow-hidden border-2 transition-all shrink-0 ${
                          activeImageIdx === idx ? 'border-neutral-900 shadow-xs scale-102' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <ProductImage
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purchase Module Column (5 cols) */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                {/* Title & SKU */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 font-mono">
                    <span>SKU: {selectedProduct.sku}</span>
                    <span className="text-emerald-700 font-semibold font-sans">
                      {availableStock > 0 ? '● In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 font-display">
                    {selectedProduct.title}
                  </h1>
                </div>

                {/* Price & Rating */}
                <div className="flex items-baseline gap-2.5 pb-3 border-b border-neutral-100">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono tabular-nums">
                    PKR {formatPKR(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-xs sm:text-sm text-neutral-400 line-through font-mono tabular-nums">
                      PKR {formatPKR(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Color Selector (Updates Gallery Picture Set Instantly) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-500 uppercase">Available Colours:</span>
                    <span className="text-neutral-900 font-bold">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    {selectedProduct.colors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => handleColorSelect(color.name)}
                          style={{ backgroundColor: color.hex }}
                          className={`min-w-[42px] min-h-[42px] rounded-full border-2 transition-transform relative flex items-center justify-center cursor-pointer ${
                            isSelected ? 'border-neutral-950 scale-110 shadow-sm ring-2 ring-neutral-950/20' : 'border-neutral-300 hover:scale-105'
                          }`}
                          title={color.name}
                          aria-label={color.name}
                        >
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 ${
                                color.hex === '#f5f5f0' || color.hex === '#f8fafc' ? 'text-black' : 'text-white'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector + Size Guide Link */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-500 uppercase">Select Size:</span>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="min-h-[36px] text-neutral-700 hover:text-black underline flex items-center gap-1 cursor-pointer py-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {selectedProduct.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setSelectedSize(size);
                            setValidationError('');
                          }}
                          className={`min-h-[44px] rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-950 text-white shadow-xs'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stock alert for low stock */}
                  {selectedSize && availableStock > 0 && availableStock <= 5 && (
                    <p className="text-xs text-amber-600 font-medium">
                      Hurry! Only {availableStock} items left in size {selectedSize}.
                    </p>
                  )}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Quantity:</span>
                  <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden bg-neutral-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-9 flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold tabular-nums font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock || 10, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="w-10 h-9 flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Validation Error Banner */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Desktop Action Buttons */}
                <div className="hidden sm:block space-y-2.5 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={Boolean(isOutOfStock)}
                    className="w-full py-3.5 px-4 bg-neutral-950 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
                  </button>

                  <div className="grid grid-cols-12 gap-2">
                    <button
                      onClick={handleBuyNow}
                      disabled={Boolean(isOutOfStock)}
                      className="col-span-9 py-3 px-4 bg-amber-400 text-neutral-950 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>BUY NOW (COD / WHATSAPP)</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className={`col-span-3 py-3 px-2 border rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-neutral-300 hover:border-black text-neutral-700'
                      }`}
                      title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Information Accordion */}
                <div className="border-t border-neutral-200 pt-3 divide-y divide-neutral-200 text-xs">
                  {/* Accordion 1: Fabric & Care */}
                  <div className="py-2.5">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === 'fabric' ? ('' as any) : 'fabric')}
                      className="w-full flex items-center justify-between font-bold text-neutral-900 uppercase tracking-wide text-left cursor-pointer"
                    >
                      <span>Fabric & Care Specifications</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeAccordion === 'fabric' ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {activeAccordion === 'fabric' && (
                      <div className="pt-2 text-neutral-600 space-y-1">
                        <p className="font-semibold text-neutral-800">{selectedProduct.description}</p>
                        <ul className="list-disc pl-4 space-y-0.5 pt-1">
                          {selectedProduct.fabricCare.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Fit & Silhouette */}
                  <div className="py-2.5">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === 'fit' ? ('' as any) : 'fit')}
                      className="w-full flex items-center justify-between font-bold text-neutral-900 uppercase tracking-wide text-left cursor-pointer"
                    >
                      <span>Fit & Silhouette Notes</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeAccordion === 'fit' ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {activeAccordion === 'fit' && (
                      <div className="pt-2 text-neutral-600">
                        <p>{selectedProduct.fit}</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Shipping & Exchange */}
                  <div className="py-2.5">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? ('' as any) : 'shipping')}
                      className="w-full flex items-center justify-between font-bold text-neutral-900 uppercase tracking-wide text-left cursor-pointer"
                    >
                      <span>Nationwide Delivery & COD Details</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeAccordion === 'shipping' ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {activeAccordion === 'shipping' && (
                      <div className="pt-2 text-neutral-600 space-y-1.5">
                        <p className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                          <span><strong>Karachi, Lahore, Islamabad:</strong> 2–3 working days.</span>
                        </p>
                        <p><strong>Other Cities & Nationwide:</strong> 3–5 working days via TCS / Leopards.</p>
                        <p><strong>Payment:</strong> Cash on Delivery (COD) or Direct Bank Transfer.</p>
                        <p><strong>Exchange:</strong> 14-day hassle-free exchange policy.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Related Products Rail */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-neutral-900 mb-3 font-display">
                  You May Also Like
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => openProductDetail(rel)}
                      className="group flex flex-col bg-neutral-50 rounded-md p-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="aspect-[3/4] rounded overflow-hidden bg-neutral-200 mb-1.5">
                        <ProductImage
                          src={rel.images[0]}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-[9px] uppercase font-mono text-neutral-400">{rel.category}</div>
                      <div className="text-xs font-semibold text-neutral-900 truncate">{rel.title}</div>
                      <div className="text-xs font-bold text-neutral-900 mt-0.5 font-mono tabular-nums">
                        PKR {formatPKR(rel.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* STICKY BOTTOM BAR FOR MOBILE: Thumb-friendly 1-tap checkout */}
          <div className="sm:hidden absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] border-t border-neutral-200 flex items-center gap-2 z-30 shadow-2xl safe-area-bottom">
            <button
              onClick={handleAddToCart}
              disabled={Boolean(isOutOfStock)}
              className="flex-1 min-h-[48px] py-3 px-2.5 bg-neutral-950 text-white rounded-md text-[11px] xs:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="truncate">{isOutOfStock ? 'SOLD OUT' : `ADD TO BAG · PKR ${formatPKR(selectedProduct.price * quantity)}`}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={Boolean(isOutOfStock)}
              className="min-h-[48px] py-3 px-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-md text-[11px] xs:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
              title="Instant WhatsApp Checkout"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>WHATSAPP ORDER</span>
            </button>
          </div>

        </div>

        {/* Size Guide Modal */}
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          category={selectedProduct.category}
        />
      </div>

      {/* High-Resolution Multi-Level Super-Zoom Lightbox (1x - 3.5x with Pan & Drag) */}
      <ImageZoomLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={activeImages}
        activeIndex={activeImageIdx}
        onIndexChange={setActiveImageIdx}
        title={selectedProduct.title}
        selectedColor={selectedColor}
      />
    </>
  );
};
