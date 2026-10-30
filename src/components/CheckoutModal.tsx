import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Truck, MessageSquare, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerInfo, OrderRecord } from '../types';
import { PAKISTAN_CITIES } from '../data/products';
import {
  generateOrderReference,
  formatWhatsAppOrderMessage,
  createWhatsAppUrl,
  getConfiguredBusinessNumber,
  formatPKR,
} from '../services/whatsapp';
import { ProductImage } from './ProductImage';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    subtotal,
    shippingFee,
    discount,
    total,
    appliedPromo,
    customerInfo,
    saveCustomerInfo,
    recordCompletedOrder,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setActiveOrderConfirmation,
    addToast,
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0]);
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'DirectBank'>('COD');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate saved customer info if available
  useEffect(() => {
    if (customerInfo) {
      setFullName(customerInfo.fullName || '');
      setPhone(customerInfo.phone || '');
      setEmail(customerInfo.email || '');
      if (PAKISTAN_CITIES.includes(customerInfo.city)) {
        setCity(customerInfo.city);
      } else if (customerInfo.city) {
        setCity('Other City');
        setCustomCity(customerInfo.city);
      }
      setAddress(customerInfo.address || '');
      setPostalCode(customerInfo.postalCode || '');
      setPaymentMethod(customerInfo.paymentMethod || 'COD');
    }
  }, [customerInfo]);

  if (!isCheckoutOpen) return null;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Full Name is required (minimum 3 characters)';
    }

    // Pakistani phone number validation (accepts 03111398618, 0311-1398618, +923111398618, 923111398618)
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const pakPhoneRegex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required for delivery confirmation';
    } else if (!pakPhoneRegex.test(cleanPhone)) {
      errs.phone = 'Please enter a valid Pakistani mobile number (e.g., 0311-1398618)';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const selectedCity = city === 'Other City' ? customCity.trim() : city;
    if (!selectedCity) {
      errs.city = 'Please select or specify your delivery city';
    }

    if (!address.trim() || address.trim().length < 10) {
      errs.address = 'Please provide a complete street address with house/flat # (min 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = () => {
    if (isSubmitting) return; // Prevent double submission

    if (!validateForm()) {
      addToast('Validation Error', 'Please complete all required delivery fields.', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('Bag Empty', 'Your shopping bag is empty.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCity = city === 'Other City' ? customCity.trim() : city;
      const orderRef = generateOrderReference();

      const customer: CustomerInfo = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: selectedCity,
        address: address.trim(),
        postalCode: postalCode.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentMethod,
      };

      // Save customer info for future checkouts
      saveCustomerInfo(customer);

      // Generate WhatsApp order message
      const message = formatWhatsAppOrderMessage({
        orderReference: orderRef,
        customer,
        items: cart,
        subtotal,
        discount,
        shipping: shippingFee,
        total,
      });

      const businessNumber = getConfiguredBusinessNumber();
      const whatsappUrl = createWhatsAppUrl(message, businessNumber);

      const newOrderRecord: OrderRecord = {
        orderReference: orderRef,
        createdAt: new Date().toISOString(),
        customer,
        items: [...cart],
        subtotal,
        discount,
        shipping: shippingFee,
        total,
        promoCodeApplied: appliedPromo || undefined,
        whatsappUrl,
        whatsappMessage: message,
        status: 'pending_whatsapp',
      };

      // Record in LocalStorage
      recordCompletedOrder(newOrderRecord);

      // Clear the cart
      clearCart();

      // Open WhatsApp directly in new window/tab
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Could not launch WhatsApp window automatically', err);
      }

      // Close checkout and display order pending confirmation modal
      setIsCheckoutOpen(false);
      setActiveOrderConfirmation(newOrderRecord);
      addToast('Order Saved', `Order ${orderRef} created. Confirm via WhatsApp!`, 'success');
    } catch (err) {
      console.error('Order creation error:', err);
      addToast('Order Error', 'Failed to process order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-t-2xl sm:rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col my-0 sm:my-auto h-[94vh] sm:h-auto sm:max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 bg-white sticky top-0 z-20 shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              Secure Checkout
            </span>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-neutral-900 font-display">
              Delivery & Order Confirmation
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Form + Summary Split) */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Customer & Address Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md flex items-center gap-3 text-xs text-neutral-700">
                <Truck className="w-5 h-5 text-neutral-900 shrink-0" />
                <div>
                  <strong>Cash on Delivery (COD) Available Nationwide.</strong> Delivery in 2–4 working days via premier courier partners.
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Customer & Shipping Information
                </h3>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Muhammad Hamza"
                    className={`w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 ${
                      errors.fullName ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-neutral-300 focus:ring-black'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="0311-1398618"
                      className={`w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-neutral-300 focus:ring-black'
                      }`}
                    />
                    {errors.phone ? (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    ) : (
                      <p className="text-[10px] text-neutral-400 mt-1">Order updates and delivery dispatch SMS/Call</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="hamza@example.com"
                      className="w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* City Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                      }}
                      className="w-full min-h-[44px] py-2.5 px-3 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {city === 'Other City' ? (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Specify City Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="e.g. Mirpur, Kasur, Jhelum"
                        className="w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Postal / Zip Code <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 75500"
                        className="w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Complete Street Address & House / Flat # <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                    }}
                    placeholder="House/Plot #, Street name, Sector/Block, Nearby Landmark"
                    className={`w-full min-h-[70px] py-2.5 px-3.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-1 ${
                      errors.address ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-neutral-300 focus:ring-black'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.address}
                    </p>
                  )}
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Special Delivery Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Deliver before 5 PM, Call upon arrival"
                    className="w-full min-h-[44px] py-2.5 px-3.5 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Payment Selection */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3.5 rounded-md border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                        paymentMethod === 'COD'
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="mt-0.5 accent-black"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 uppercase">
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Pay cash to the courier representative when package arrives.
                        </div>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod('DirectBank')}
                      className={`p-3.5 rounded-md border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                        paymentMethod === 'DirectBank'
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'DirectBank'}
                        onChange={() => setPaymentMethod('DirectBank')}
                        className="mt-0.5 accent-black"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 uppercase">
                          Direct Bank / EasyPaisa
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Bank transfer details shared upon order verification.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Order Items & Cost Summary (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-200">
                Order Items ({cart.length})
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-200/60">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3">
                    <div className="w-12 h-16 rounded overflow-hidden bg-neutral-200 shrink-0">
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-neutral-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-neutral-500">
                        {item.selectedSize} · {item.selectedColor} · Qty: {item.quantity}
                      </div>
                      <div className="font-mono font-bold text-neutral-900 mt-0.5 tabular-nums">
                        PKR {formatPKR(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-900 tabular-nums">
                    PKR {formatPKR(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">
                      -PKR {formatPKR(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Nationwide Shipping</span>
                  <span className="font-mono text-neutral-900 tabular-nums">
                    {shippingFee === 0 ? 'FREE' : `PKR ${formatPKR(shippingFee)}`}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-neutral-200 text-base font-extrabold text-neutral-900">
                  <span className="uppercase font-display">Grand Total</span>
                  <span className="font-mono tabular-nums">
                    PKR {formatPKR(total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA - Direct WhatsApp Order */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full min-h-[50px] py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'CREATING ORDER...' : 'ORDER VIA WHATSAPP (CONFIRM)'}
                  </span>
                </button>

                <p className="text-[11px] text-neutral-500 text-center leading-normal">
                  Clicking will save your order locally and generate a direct verification message to Syed Umer Abdullah on WhatsApp (+92 311 1398618).
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
