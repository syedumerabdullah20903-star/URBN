import React from 'react';
import { X, Clock, MessageSquare, Copy, Check, ShoppingBag, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard, formatPKR } from '../services/whatsapp';

export const OrderHistoryModal: React.FC = () => {
  const {
    orderHistory,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    setActiveOrderConfirmation,
    addToast,
  } = useStore();

  if (!isOrderHistoryOpen) return null;

  const handleCopy = async (message: string) => {
    const success = await copyToClipboard(message);
    if (success) {
      addToast('Copied', 'Order details copied to clipboard.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOrderHistoryOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold uppercase tracking-tight text-neutral-900 font-display">
              My Local Order History ({orderHistory.length})
            </h2>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close order history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
            <strong>Note on LocalStorage:</strong> Orders placed from this browser are securely saved on your device. To ensure shipment dispatch, make sure your WhatsApp message was sent to our official line.
          </div>

          {orderHistory.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">No orders placed yet</p>
              <p className="text-xs text-neutral-500">
                When you complete checkout, your order reference and receipt will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => {
                const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-PK', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.orderReference}
                    className="border border-neutral-200 rounded-lg p-4 bg-white hover:border-neutral-400 transition-colors space-y-3"
                  >
                    {/* Top Row: Ref & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div>
                        <span className="font-mono text-sm font-bold text-neutral-900">
                          {order.orderReference}
                        </span>
                        <div className="text-[11px] text-neutral-400">{dateFormatted}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Pending WhatsApp
                        </span>
                        <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                          PKR {formatPKR(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1 text-xs text-neutral-600">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.title} ({item.selectedSize} · {item.selectedColor})
                          </span>
                          <span className="font-mono tabular-nums">
                            PKR {formatPKR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 text-xs">
                      <div className="text-[11px] text-neutral-500">
                        Deliver to: <strong>{order.customer.fullName}</strong> ({order.customer.city})
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(order.whatsappMessage)}
                          className="py-1.5 px-2.5 border border-neutral-300 hover:border-black rounded text-[11px] font-semibold text-neutral-700 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Message</span>
                        </button>

                        <a
                          href={order.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Reopen WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
