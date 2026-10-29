import React from 'react';
import { X, ChevronRight, MessageSquare, Heart, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { CATEGORIES_META } from '../data/products';
import { getConfiguredBusinessNumber, createWhatsAppUrl } from '../services/whatsapp';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const {
    currentCategory,
    setCurrentCategory,
    wishlist,
    setIsWishlistOpen,
    setIsOrderHistoryOpen,
    openPolicies,
  } = useStore();

  if (!isOpen) return null;

  const categories: { id: ProductCategory; label: string; count?: string; isSale?: boolean }[] = [
    { id: 'all', label: 'All Menswear', count: '120+ Styles' },
    { id: 'tees', label: 'Tees & Polos', count: '45+ Styles' },
    { id: 'hoodies', label: 'Hoodies & Sweatshirts', count: '38+ Styles' },
    { id: 'cargos', label: 'Cargos & Pants', count: '28+ Styles' },
    { id: 'jackets', label: 'Jackets & Outerwear', count: '32+ Styles' },
    { id: 'jeans', label: 'Jeans & Denim', count: '24+ Styles' },
    { id: 'accessories', label: 'Accessories & Carry', count: '20+ Styles' },
    { id: 'sale', label: 'Men\'s Sale (Up to 40% Off)', count: 'Limited Drops', isSale: true },
  ];

  const businessNumber = getConfiguredBusinessNumber();
  const supportUrl = createWhatsAppUrl(
    'Hello URBN Support! I would like to inquire about an order / product availability.',
    businessNumber
  );

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <span className="text-xl font-extrabold tracking-tighter uppercase font-display">
            URBN<span className="text-neutral-400">·</span>MEN
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-600 hover:text-black rounded-md hover:bg-neutral-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="py-2 divide-y divide-neutral-100 flex-1">
          <div className="px-4 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            Categories
          </div>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCurrentCategory(cat.id);
                  onClose();
                  const catalogEl = document.getElementById('catalog-section');
                  if (catalogEl) {
                    catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                  cat.isSale
                    ? 'text-red-600 font-bold bg-red-50/50'
                    : isSelected
                    ? 'text-black font-bold bg-neutral-100'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <div className="text-sm tracking-wide">{cat.label}</div>
                  {cat.count && (
                    <div className="text-[11px] text-neutral-400 font-normal">{cat.count}</div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            );
          })}

          {/* Quick Action Links */}
          <div className="pt-4 pb-2">
            <div className="px-4 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              My Shopping
            </div>
            <button
              onClick={() => {
                onClose();
                setIsWishlistOpen(true);
              }}
              className="w-full text-left px-5 py-3 flex items-center justify-between text-neutral-700 hover:bg-neutral-50 text-sm"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-neutral-500" />
                <span>Wishlist</span>
              </div>
              <span className="text-xs bg-neutral-200 text-neutral-800 rounded-full px-2 py-0.5 tabular-nums">
                {wishlist.length}
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                setIsOrderHistoryOpen(true);
              }}
              className="w-full text-left px-5 py-3 flex items-center justify-between text-neutral-700 hover:bg-neutral-50 text-sm"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Policies & Assistance */}
          <div className="pt-3 pb-2">
            <div className="px-4 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              Assistance & Stores
            </div>
            <button
              onClick={() => {
                onClose();
                openPolicies('delivery');
              }}
              className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-neutral-600 hover:bg-neutral-50 text-xs"
            >
              <Truck className="w-3.5 h-3.5 text-neutral-500" />
              <span>Nationwide Delivery & COD</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openPolicies('returns');
              }}
              className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-neutral-600 hover:bg-neutral-50 text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>14-Day Exchange Policy</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openPolicies('stores');
              }}
              className="w-full text-left px-5 py-2.5 flex items-center gap-3 text-neutral-600 hover:bg-neutral-50 text-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>Flagship Store Outlets</span>
            </button>
          </div>
        </div>

        {/* Footer with WhatsApp Help Button */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp: +92 311 1398618</span>
          </a>
          <p className="text-[10px] text-center text-neutral-500">
            Syed Umer Abdullah · Mon-Sat: 10:00 AM – 10:00 PM (PKT)
          </p>
        </div>
      </div>
    </div>
  );
};
