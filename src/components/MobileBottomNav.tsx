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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-2 px-3 flex items-center justify-around shadow-lg safe-area-bottom"
    >
      {/* Home */}
      <button
        onClick={handleHomeClick}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentCategory === 'all' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-wider uppercase">Home</span>
      </button>

      {/* Categories / Shop */}
      <button
        onClick={onOpenCategories}
        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black transition-colors"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-wider uppercase">Categories</span>
      </button>

      {/* Search */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black transition-colors"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-wider uppercase">Search</span>
      </button>

      {/* Wishlist */}
      <button
        onClick={() => setIsWishlistOpen(true)}
        className="relative flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black transition-colors"
      >
        <Heart className="w-5 h-5" />
        {wishlist.length > 0 && (
          <span className="absolute top-0 right-4 w-4 h-4 bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
            {wishlist.length}
          </span>
        )}
        <span className="text-[10px] mt-1 tracking-wider uppercase">Saved</span>
      </button>

      {/* Cart Bag */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-black transition-colors"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-4 w-4 h-4 bg-amber-400 text-black text-[9px] font-extrabold rounded-full flex items-center justify-center tabular-nums shadow-xs">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] mt-1 tracking-wider uppercase font-semibold">Bag</span>
      </button>
    </nav>
  );
};
