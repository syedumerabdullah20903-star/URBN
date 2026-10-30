import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Copy, Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard, formatPKR } from '../services/whatsapp';

export const OrderConfirmationModal: React.FC = () => {
  const {
    activeOrderConfirmation,
    setActiveOrderConfirmation,
    setIsOrderHistoryOpen,
    addToast,
  } = useStore();

  const [copied, setCopied] = useState(false);

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(order.whatsappMessage);
    if (success) {
      setCopied(true);
      addToast('Copied to Clipboard', 'Order details copied. You can paste into WhatsApp directly.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      addToast('Copy Failed', 'Please select and copy the text manually.', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(order.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setActiveOrderConfirmation(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-neutral-900 font-display">
              Order Pending Confirmation
            </h2>
          </div>
          <button
            onClick={() => setActiveOrderConfirmation(null)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Status Alert Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Step 2: Send WhatsApp Message to Complete Order</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your order record has been preserved locally under reference <strong>{order.orderReference}</strong>. To finalize your shipment, please ensure you send the pre-filled message directly to <strong>Syed Umer Abdullah</strong> on WhatsApp (<strong>+92 311 1398618</strong>). Our team will verify inventory and dispatch via COD.
            </p>
          </div>

          {/* Reference & Summary Box */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                  Order Reference
                </span>
                <div className="font-mono text-base font-extrabold text-neutral-900">
                  {order.orderReference}
                </div>
              </div>

              <div className="text-right">
                <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                  Total Payable (COD)
                </span>
                <div className="font-mono text-base font-extrabold text-neutral-900 tabular-nums">
                  PKR {formatPKR(order.total)}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 pt-1">
              <div>
                <strong>Customer:</strong> {order.customer.fullName}
              </div>
              <div>
                <strong>Phone:</strong> {order.customer.phone}
              </div>
              <div>
                <strong>City:</strong> {order.customer.city}
              </div>
              <div>
                <strong>Payment:</strong> {order.customer.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Direct Bank'}
              </div>
              <div className="sm:col-span-2">
                <strong>Address:</strong> {order.customer.address}
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="pt-2 border-t border-neutral-200 space-y-1.5">
              <span className="font-bold text-neutral-900 uppercase text-[11px]">Items ({order.items.length}):</span>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span>
                    {item.quantity}x {item.title} ({item.selectedSize} · {item.selectedColor})
                  </span>
                  <span className="font-mono tabular-nums">
                    PKR {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Actions Strip */}
          <div className="space-y-3">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>LAUNCH WHATSAPP TO SEND ORDER</span>
            </button>

            <button
              onClick={handleCopyMessage}
              className={`w-full min-h-[44px] py-3 px-4 border rounded-md text-xs font-bold uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-300 hover:border-black text-neutral-800 bg-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ORDER DETAILS COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY ORDER TEXT (FALLBACK)</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Message Accordion Preview */}
          <details className="text-xs text-neutral-500 border border-neutral-200 rounded p-3 bg-neutral-50">
            <summary className="font-bold text-neutral-700 cursor-pointer uppercase tracking-wider">
              View Generated Message Content
            </summary>
            <pre className="mt-3 p-3 bg-white border border-neutral-200 rounded text-[11px] font-mono whitespace-pre-wrap text-neutral-800 leading-relaxed overflow-x-auto">
              {order.whatsappMessage}
            </pre>
          </details>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setActiveOrderConfirmation(null);
              setIsOrderHistoryOpen(true);
            }}
            className="text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
          >
            <span>View All My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveOrderConfirmation(null)}
            className="py-1.5 px-4 bg-neutral-900 text-white rounded text-xs font-bold uppercase hover:bg-black"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
