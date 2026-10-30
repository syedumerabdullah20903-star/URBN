import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, Clock, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { formatPKR } from '../services/whatsapp';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    currentCategory,
    setCurrentCategory,
    cartCount,
    subtotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsOrderHistoryOpen,
    openPolicies,
  } = useStore();

  const [hoveredNav, setHoveredNav] = useState<ProductCategory | null>(null);

  const navLinks: { label: string; category: ProductCategory; isSale?: boolean }[] = [
    { label: 'ALL', category: 'all' },
    { label: 'TEES', category: 'tees' },
    { label: 'HOODIES', category: 'hoodies' },
    { label: 'CARGOS', category: 'cargos' },
    { label: 'JACKETS', category: 'jackets' },
    { label: 'JEANS', category: 'jeans' },
    { label: 'ACCESSORIES', category: 'accessories' },
    { label: 'SALE', category: 'sale', isSale: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-shadow">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-14 sm:h-18">
          
          {/* Mobile Menu Button & Brand Zone */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-neutral-800 hover:text-black focus:outline-none focus:ring-2 focus:ring-neutral-900 rounded-md transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Title (One line wordmark with responsive text size) */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter text-black uppercase font-display whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              URBN<span className="text-neutral-400 font-light">·</span>MEN
            </a>
          </div>

          {/* Zone 2: 4-5 Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider">
            {navLinks.map((link) => {
              const isActive = currentCategory === link.category;
              return (
                <button
                  key={link.category}
                  onClick={() => {
                    setCurrentCategory(link.category);
                    const catalogEl = document.getElementById('catalog-section');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onMouseEnter={() => setHoveredNav(link.category)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative py-5 transition-colors whitespace-nowrap shrink-0 ${
                    link.isSale
                      ? 'text-red-600 hover:text-red-700 font-bold'
                      : isActive
                      ? 'text-black font-bold'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Search, Wishlist, Bag, Order History) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-neutral-700 hover:text-black transition-colors rounded-md hover:bg-neutral-100"
              aria-label="Search catalog"
              title="Search styles (Press /)"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-medium text-neutral-500 ml-1">Search</span>
            </button>

            {/* My Orders link */}
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="hidden lg:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1.5 p-2 text-neutral-700 hover:text-black transition-colors rounded-md hover:bg-neutral-100"
              title="Track local orders"
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-medium text-neutral-500">Orders</span>
            </button>

            {/* Support info */}
            <button
              onClick={() => openPolicies('delivery')}
              className="hidden xl:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1 p-2 text-neutral-700 hover:text-black transition-colors rounded-md hover:bg-neutral-100"
              title="Shipping & Customer Support"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-xs font-medium text-neutral-500">Help</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-neutral-700 hover:text-black transition-colors rounded-md hover:bg-neutral-100"
              aria-label={`Wishlist (${wishlist.length} saved)`}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="min-h-[44px] flex items-center gap-2 py-2 px-3 sm:px-3.5 bg-neutral-950 text-white rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
              aria-label={`Shopping bag (${cartCount} items)`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase">
                {cartCount > 0 ? `PKR ${formatPKR(subtotal)}` : 'BAG'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
