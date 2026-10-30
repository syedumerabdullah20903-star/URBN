import React from 'react';
import { HERO_IMAGE } from '../data/products';

export const HeroBanner: React.FC = () => {
  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      onClick={handleScrollToCatalog}
      className="relative bg-neutral-950 text-white overflow-hidden cursor-pointer group select-none"
      aria-label="Hero campaign display"
    >
      {/* Background Campaign Image */}
      <div className="relative min-h-[400px] sm:min-h-[520px] lg:min-h-[620px] flex items-end sm:items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="URBN MEN Campaign"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hero.jpg';
            }}
            className="w-full h-full object-cover object-center filter brightness-95 group-hover:scale-102 transition-transform duration-700 ease-out"
          />
          {/* Subtle gradient to ensure logo and title remain high-contrast and legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/30 sm:to-transparent" />
        </div>

        {/* Display Content: Strictly Logo & Title over the Image */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-white text-black font-black font-display flex items-center justify-center text-xs sm:text-base tracking-tighter shadow-md">
                U·M
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-white/95 font-display">
                URBN MEN
              </span>
            </div>

            {/* Campaign Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none font-display">
              URBAN UTILITY
            </h1>

          </div>
        </div>
      </div>
    </section>
  );
};
