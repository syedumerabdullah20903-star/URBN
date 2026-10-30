import React from 'react';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const {
    currentCategory,
    setCurrentCategory,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
  } = useStore();

  const handleHomeClick = () => {
    setCurrentCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-2 flex items-center justify-around shadow-xl safe-area-bottom"
    >
      {/* Home */}
      <button
        onClick={handleHomeClick}
        className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all ${
          currentCategory === 'all' ? 'text-black font-extrabold' : 'text-neutral-500 hover:text-black'
        }`}
        aria-label="Home"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-wider uppercase font-medium">Home</span>
      </button>

      {/* Categories / Shop */}
      <button
        onClick={onOpenCategories}
        className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black active:scale-95 transition-all"
        aria-label="Categories"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-wider uppercase font-medium">Shop</span>
      </button>

      {/* Search */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black active:scale-95 transition-all"
        aria-label="Search Catalog"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-wider uppercase font-medium">Search</span>
      </button>

      {/* Wishlist */}
      <button
        onClick={() => setIsWishlistOpen(true)}
        className="relative min-h-[48px] min-w-[48px] flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black active:scale-95 transition-all"
        aria-label={`Wishlist (${wishlist.length} saved)`}
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
              {wishlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-wider uppercase font-medium">Saved</span>
      </button>

      {/* Cart Bag */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative min-h-[48px] min-w-[48px] flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black active:scale-95 transition-all"
        aria-label={`Shopping bag (${cartCount} items)`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 w-4.5 h-4.5 bg-amber-400 text-neutral-950 text-[9px] font-extrabold rounded-full flex items-center justify-center tabular-nums shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-wider uppercase font-bold text-neutral-900">Bag</span>
      </button>
    </nav>
  );
};
