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
      <div className="relative min-h-[400px] sm:min-h-[520px] lg:min-h-[620px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="URBN MEN Campaign"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hero.jpg';
            }}
            className="w-full h-full object-cover object-top sm:object-center filter brightness-95 group-hover:scale-102 transition-transform duration-700 ease-out"
          />
          {/* Minimal bottom vignette solely to ensure logo and title are crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        </div>

        {/* Clean Display: Strictly Logo and Title, No text clutter on background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          <div className="flex flex-col items-start gap-2">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-white text-black font-black font-display flex items-center justify-center text-xs sm:text-sm tracking-tighter shadow-md">
                U·M
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-white font-display">
                URBN MEN
              </span>
            </div>

            {/* Campaign Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none font-display">
              URBAN UTILITY
            </h1>

          </div>
        </div>
      </div>
    </section>
  );
};
