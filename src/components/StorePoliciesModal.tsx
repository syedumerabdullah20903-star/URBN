import React from 'react';
import { X, Truck, RefreshCw, MapPin, ShieldCheck, Phone, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getConfiguredBusinessNumber, createWhatsAppUrl } from '../services/whatsapp';

export const StorePoliciesModal: React.FC = () => {
  const { isPoliciesOpen, setIsPoliciesOpen, activePolicyTab, openPolicies } = useStore();

  if (!isPoliciesOpen) return null;

  const businessNumber = getConfiguredBusinessNumber();
  const supportUrl = createWhatsAppUrl(
    'Hello URBN Team! I would like to get help regarding store policies and order queries.',
    businessNumber
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsPoliciesOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold uppercase tracking-tight text-neutral-900 font-display">
              Customer Support & Store Policies
            </h2>
          </div>
          <button
            onClick={() => setIsPoliciesOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close policies"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6 pt-3 bg-neutral-50 gap-4 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => openPolicies('delivery')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activePolicyTab === 'delivery'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Delivery & Shipping
          </button>
          <button
            onClick={() => openPolicies('returns')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activePolicyTab === 'returns'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            14-Day Exchange
          </button>
          <button
            onClick={() => openPolicies('stores')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activePolicyTab === 'stores'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Store Outlets
          </button>
          <button
            onClick={() => openPolicies('terms')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activePolicyTab === 'terms'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            COD & Terms
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs text-neutral-700 leading-relaxed">
          {activePolicyTab === 'delivery' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <Truck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">
                    Nationwide Delivery Timelines across Pakistan
                  </h4>
                  <p>
                    We deliver to over 200 cities across Pakistan in partnership with premier courier networks (TCS, Leopards Courier, and Call Courier).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border border-neutral-200 rounded-md">
                  <div className="font-bold text-neutral-900 mb-1">Major Metros</div>
                  <p className="text-neutral-600">
                    <strong>Karachi, Lahore, Islamabad, Rawalpindi:</strong> 2 to 3 working days from order verification.
                  </p>
                </div>
                <div className="p-3 border border-neutral-200 rounded-md">
                  <div className="font-bold text-neutral-900 mb-1">Other Cities & Regions</div>
                  <p className="text-neutral-600">
                    <strong>Faisalabad, Multan, Peshawar, Quetta, Sialkot & Rural Hubs:</strong> 3 to 5 working days.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900">
                <strong>Free Delivery Policy:</strong> All orders with a subtotal of PKR 3,000 or above qualify for 100% Free Nationwide Delivery. Orders below PKR 3,000 incur a standard flat rate of PKR 250.
              </div>
            </div>
          )}

          {activePolicyTab === 'returns' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <RefreshCw className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">
                    14-Day Easy Exchange Policy
                  </h4>
                  <p>
                    If your fit isn't perfect, you can easily exchange any unworn article within 14 days of delivery.
                  </p>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                <li>Articles must be unwashed, unworn, and have all original price tags and tags attached.</li>
                <li>Exchange can be performed either by courier return or at any URBN flagship store outlet across Pakistan.</li>
                <li>Sale or clearance items with discounts greater than 40% are eligible for size exchange only (subject to availability).</li>
                <li>Please retain your original delivery invoice and order reference (ORD-XXXXXXXX) for instant validation.</li>
              </ul>
            </div>
          )}

          {activePolicyTab === 'stores' && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">
                Flagship Store Locations in Pakistan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-neutral-200 rounded-md space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-900" />
                    <span>Lahore Flagship</span>
                  </div>
                  <p className="text-neutral-600">Packages Mall, Level 1 & MM Alam Road, Gulberg III, Lahore</p>
                  <p className="text-[11px] text-neutral-400">11:00 AM – 11:00 PM</p>
                </div>

                <div className="p-3 border border-neutral-200 rounded-md space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-900" />
                    <span>Karachi Store</span>
                  </div>
                  <p className="text-neutral-600">Dolmen Mall Clifton, 1st Floor & Lucky One Mall, Karachi</p>
                  <p className="text-[11px] text-neutral-400">11:00 AM – 11:00 PM</p>
                </div>

                <div className="p-3 border border-neutral-200 rounded-md space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-900" />
                    <span>Islamabad Outlet</span>
                  </div>
                  <p className="text-neutral-600">Centaurus Mall, F-8 & Safa Gold Mall, F-7 Markaz, Islamabad</p>
                  <p className="text-[11px] text-neutral-400">11:00 AM – 11:00 PM</p>
                </div>
              </div>
            </div>
          )}

          {activePolicyTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">
                Cash on Delivery (COD) Rules & Terms
              </h4>
              <p>
                To provide the safest shopping experience across Pakistan, we prioritize Cash on Delivery (COD). Courier riders will collect the exact invoice total upon handing over your parcel.
              </p>
              <div className="p-3 bg-neutral-100 rounded-md space-y-1.5 text-neutral-700">
                <p>• Please keep the exact amount ready upon courier arrival to expedite delivery.</p>
                <p>• Due to courier regulations, parcels cannot be opened before payment is handed over. If you need a size or style exchange, our 14-day exchange process handles it quickly.</p>
                <p>• For any inquiries or order status checks, reach out directly to Syed Umer Abdullah via WhatsApp (+92 311 1398618).</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Support Bar */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            Need urgent assistance? Connect directly with <strong className="text-neutral-800">Syed Umer Abdullah</strong> on WhatsApp (+92 311 1398618).
          </div>
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
