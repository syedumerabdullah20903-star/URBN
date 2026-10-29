import React, { useState } from 'react';
import { Truck, RefreshCw, MessageSquare, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { openPolicies } = useStore();

  if (!isVisible) return null;

  return (
    <div className="bg-neutral-900 text-neutral-100 text-xs tracking-wider uppercase py-2 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-6 text-[11px] text-neutral-400">
          <button 
            onClick={() => openPolicies('delivery')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Free Delivery Over PKR 3,000</span>
          </button>
          <span className="text-neutral-700">|</span>
          <button 
            onClick={() => openPolicies('returns')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>14-Day Easy Exchange</span>
          </button>
        </div>

        <div className="flex-1 md:flex-initial text-center text-[11px] font-medium tracking-widest text-neutral-200">
          <span className="text-amber-400 font-semibold mr-1.5">DROP '26:</span>
          <span>Cash on Delivery Available Nationwide across Pakistan</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button 
            onClick={() => openPolicies('stores')}
            className="hidden sm:inline-block text-neutral-400 hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4"
          >
            Store Locations
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
