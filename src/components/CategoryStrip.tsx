import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import {
  MEN_CATEGORY_IMAGE,
  OUTERWEAR_IMAGE,
  HOODIE_IMAGE,
  CARGO_IMAGE,
} from '../data/products';
import { ProductImage } from './ProductImage';

export const CategoryStrip: React.FC = () => {
  const { setCurrentCategory } = useStore();

  const tiles: { title: string; subtitle: string; category: ProductCategory; image: string }[] = [
    {
      title: 'OVERSIZED TEES',
      subtitle: '280 GSM Boxy Graphic Tees',
      category: 'tees',
      image: MEN_CATEGORY_IMAGE,
    },
    {
      title: 'HEAVY HOODIES',
      subtitle: '420 GSM French Terry Fleece',
      category: 'hoodies',
      image: HOODIE_IMAGE,
    },
    {
      title: 'CARGOS & PANTS',
      subtitle: 'Tactical Parachute & Relaxed Fits',
      category: 'cargos',
      image: CARGO_IMAGE,
    },
    {
      title: 'DENIM & JACKETS',
      subtitle: '14.5 oz Selvedge · Flannels',
      category: 'jackets',
      image: OUTERWEAR_IMAGE,
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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-8 gap-2 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
            Curated Collections
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900 mt-0.5 sm:mt-1 font-display">
            Shop by Department
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs text-neutral-500 max-w-sm">
          Precision cuts, structural cottons, and urban silhouettes designed for daily versatility.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => handleTileClick(tile.category)}
            className="group relative h-60 sm:h-96 rounded-md sm:rounded-lg overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-shadow bg-neutral-100"
          >
            {/* Image */}
            <ProductImage
              src={tile.image}
              alt={tile.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 text-white flex flex-col justify-end pointer-events-none">
              <span className="text-[9px] sm:text-[11px] text-neutral-300 font-medium tracking-wide line-clamp-1">
                {tile.subtitle}
              </span>
              <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                <h3 className="text-xs sm:text-base md:text-lg font-bold uppercase tracking-tight text-white font-display">
                  {tile.title}
                </h3>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors shrink-0 ml-1.5">
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
