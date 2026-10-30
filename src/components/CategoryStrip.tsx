import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import {
  MEN_CATEGORY_IMAGE,
  ZIP_HOODIE_IMAGE,
  CARGO_IMAGE,
  TACTICAL_BOMBER_IMAGE,
} from '../data/products';
import { ProductImage } from './ProductImage';

export const CategoryStrip: React.FC = () => {
  const { setCurrentCategory } = useStore();

  const tiles: { title: string; subtitle: string; itemCount: string; category: ProductCategory; image: string }[] = [
    {
      title: 'OVERSIZED TEES',
      subtitle: '280 GSM Boxy Graphic Cuts',
      itemCount: '45+ STYLES',
      category: 'tees',
      image: MEN_CATEGORY_IMAGE,
    },
    {
      title: 'HEAVY HOODIES & KNITS',
      subtitle: '450 GSM French Terry & Fleeces',
      itemCount: '38+ STYLES',
      category: 'hoodies',
      image: ZIP_HOODIE_IMAGE,
    },
    {
      title: 'TACTICAL CARGOS & DENIM',
      subtitle: 'Double-Knee & Parachute Silhouettes',
      itemCount: '28+ STYLES',
      category: 'cargos',
      image: CARGO_IMAGE,
    },
    {
      title: 'JACKETS & BOMBERS',
      subtitle: 'MA-1 Flight & Selvedge Outerwear',
      itemCount: '32+ STYLES',
      category: 'jackets',
      image: TACTICAL_BOMBER_IMAGE,
    },
  ];

  const handleTileClick = (category: ProductCategory) => {
    setCurrentCategory(category);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14 select-none">
      {/* Aligned Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-8 gap-2 sm:gap-4 pb-4 border-b border-neutral-200/80">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-neutral-900 mt-0.5 sm:mt-1 font-display">
            Shop by Department
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md font-normal leading-relaxed">
          Structural cottons, technical fabrications, and contemporary cuts engineered for everyday streetwear versatility.
        </p>
      </div>

      {/* 2-Column Mobile, 4-Column Desktop Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6 w-full min-w-0">
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => handleTileClick(tile.category)}
            className="group relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 bg-neutral-100 border border-neutral-200/60"
          >
            {/* Background Image */}
            <ProductImage
              src={tile.image}
              alt={tile.title}
              className="w-full h-full object-cover object-top sm:object-center group-hover:scale-104 transition-transform duration-500 ease-out"
            />

            {/* Contrast Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />

            {/* Badge overlay on top */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 pointer-events-none">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 bg-black/60 text-white backdrop-blur-xs rounded-xs">
                {tile.itemCount}
              </span>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white flex flex-col justify-end pointer-events-none">
              <span className="text-[9px] sm:text-[11px] text-neutral-300 font-medium tracking-wide line-clamp-1 mb-0.5">
                {tile.subtitle}
              </span>
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-white font-display leading-tight">
                  {tile.title}
                </h3>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
