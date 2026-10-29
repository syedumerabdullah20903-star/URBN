import React from 'react';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { HERO_IMAGE } from '../data/products';

export const HeroBanner: React.FC = () => {
  const { setCurrentCategory } = useStore();

  const handleShopCategory = (cat: ProductCategory) => {
    setCurrentCategory(cat);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-neutral-950 text-white overflow-hidden">
      {/* Background Image with Dark Contrast Scrim */}
      <div className="relative min-h-[460px] sm:min-h-[580px] lg:min-h-[680px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="URBN Men's Streetwear Fall/Winter Campaign"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback to static public path if needed
              (e.target as HTMLImageElement).src = '/images/hero.jpg';
            }}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          {/* Gradients for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 w-full">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="w-4 sm:w-6 h-[1.5px] bg-amber-400" />
              <span>MENSWEAR DROP // 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08] font-display text-balance">
              URBAN UTILITY. <br />
              <span className="text-neutral-300 font-light">MENS STREETWEAR.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl">
              Engineered heavyweight streetwear crafted exclusively for men. Heavy 280 GSM cottons, technical cargo cuts, and vintage washed denim inspired by contemporary youth culture.
            </p>

            {/* CTAs (Full width on mobile, inline on desktop) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
              <button
                onClick={() => handleShopCategory('all')}
                className="py-3.5 px-7 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-md hover:bg-neutral-200 transition-colors shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>EXPLORE ALL MENSWEAR</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleShopCategory('hoodies')}
                className="py-3.5 px-7 bg-transparent border-2 border-white/80 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SHOP HOODIES & FLEECE</span>
              </button>

              <button
                onClick={() => handleShopCategory('cargos')}
                className="py-3.5 px-7 bg-white/10 backdrop-blur-xs border border-white/20 text-neutral-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SHOP CARGOS</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Brand Value Pillars Strip */}
      <div className="border-t border-neutral-800 bg-neutral-900/95 py-3.5 sm:py-4 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-xs text-neutral-300">
          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">Nationwide Delivery</div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Karachi, Lahore & 200+ cities</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">Cash on Delivery (COD)</div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Pay at doorstep with cash</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">14-Day Easy Exchange</div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Easy outlet exchange</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider">WhatsApp Checkout</div>
              <div className="text-[10px] sm:text-[11px] text-neutral-400">Instant order & live support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
