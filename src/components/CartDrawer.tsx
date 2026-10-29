import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Tag, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../services/whatsapp';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    subtotal,
    shippingFee,
    discount,
    total,
    freeShippingThreshold,
    remainingForFreeShipping,
    appliedPromo,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    setCurrentCategory,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError('');
      setPromoInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeShippingPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="text-base font-bold uppercase tracking-tight font-display text-neutral-900">
              Shopping Bag ({cartCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
          {remainingForFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-neutral-800">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Free Nationwide Shipping</span>
                </span>
                <span className="tabular-nums">
                  Add PKR {formatPKR(remainingForFreeShipping)} more
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${freeShippingPercent}%` }}
                  className="h-full bg-neutral-950 transition-all duration-300"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>You've unlocked FREE nationwide delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-800">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Looks like you haven't added anything yet. Explore our latest drops.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentCategory('all');
                  const catalogEl = document.getElementById('catalog-section');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-6 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-black transition-colors"
              >
                Shop New Arrivals
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-3.5 items-start">
                {/* Thumbnail */}
                <div className="w-18 h-24 rounded overflow-hidden bg-neutral-100 shrink-0">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Stepper */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Size & Color */}
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                    <span>Size: <strong className="text-neutral-800">{item.selectedSize}</strong></span>
                    <span>·</span>
                    <span>Color: <strong className="text-neutral-800">{item.selectedColor}</strong></span>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center border border-neutral-200 rounded bg-neutral-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold tabular-nums font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-neutral-900 font-mono tabular-nums">
                      PKR {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Calculations & Checkout CTA */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-4 sm:p-5 bg-neutral-50 space-y-3">
            
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo Applied: {appliedPromo} (-PKR {formatPKR(discount)})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-emerald-700 hover:text-red-700 font-semibold underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    placeholder="Voucher (e.g. URBN10)"
                    className="flex-1 py-2 px-3 text-xs bg-white border border-neutral-300 rounded uppercase font-semibold text-neutral-900 placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-neutral-900 text-white text-xs font-bold uppercase rounded hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{promoError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-1 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-900 tabular-nums">
                  PKR {formatPKR(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount:</span>
                  <span className="font-mono tabular-nums">
                    -PKR {formatPKR(discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Nationwide Shipping:</span>
                <span className="font-mono text-neutral-900 tabular-nums">
                  {shippingFee === 0 ? 'FREE' : `PKR ${formatPKR(shippingFee)}`}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-extrabold text-neutral-900">
                <span className="uppercase font-display">Estimated Total:</span>
                <span className="font-mono text-base tabular-nums">
                  PKR {formatPKR(total)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 bg-neutral-950 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-neutral-400">
              Cash on Delivery (COD) & Instant WhatsApp verification available.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
