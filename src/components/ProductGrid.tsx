import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES_META } from '../data/products';
import { FilterState, Product, SortOption } from '../types';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { MobileFilterDrawer } from './MobileFilterDrawer';

export const ProductGrid: React.FC = () => {
  const { currentCategory, setCurrentCategory } = useStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState(12);

  const initialFilters: FilterState = {
    category: currentCategory,
    subcategories: [],
    genders: [],
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 15000,
    inStockOnly: false,
    onSaleOnly: false,
    searchQuery: '',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync category when user clicks header or category strip
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, category: currentCategory }));
    setVisibleCount(12);
  }, [currentCategory]);

  const activeCategoryMeta = CATEGORIES_META.find(c => c.id === currentCategory);

  // Filter products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category check
      if (currentCategory !== 'all') {
        if (currentCategory === 'sale') {
          if (!product.isOnSale && (!product.discountPercent || product.discountPercent <= 0)) {
            return false;
          }
        } else if (product.category !== currentCategory) {
          return false;
        }
      }

      // Sale Only filter
      if (filters.onSaleOnly && !product.isOnSale && (!product.discountPercent || product.discountPercent <= 0)) {
        return false;
      }

      // In Stock filter
      if (filters.inStockOnly && product.stockQuantity <= 0) {
        return false;
      }

      // Sizes filter
      if (filters.sizes.length > 0) {
        const hasSize = product.sizes.some(s => filters.sizes.includes(s));
        if (!hasSize) return false;
      }

      // Colors filter
      if (filters.colors.length > 0) {
        const hasColor = product.colors.some(c =>
          filters.colors.some(fc => c.name.toLowerCase().includes(fc.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [currentCategory, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case 'newest':
        return list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'popularity':
        return list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      case 'featured':
      default:
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [filteredProducts, sortOption]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  const resetAllFilters = () => {
    setFilters({
      category: currentCategory,
      subcategories: [],
      genders: [],
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 15000,
      inStockOnly: false,
      onSaleOnly: false,
      searchQuery: '',
    });
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Category Header Banner */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Department
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-neutral-900 mt-1 font-display">
              {activeCategoryMeta?.name || 'All Collections'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
              {activeCategoryMeta?.tagline || 'Explore the complete archive of urban streetwear, contemporary cuts, and daily utility.'}
            </p>
          </div>

          {/* Quick Department Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full md:w-auto -mx-3 px-3 md:mx-0 md:px-0">
            {CATEGORIES_META.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(cat.id as any)}
                  className={`min-h-[40px] py-2 px-3.5 rounded-md uppercase font-bold tracking-wider whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {cat.id === 'all' ? 'ALL' : cat.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Toolbar: Filter Toggle on Mobile, Active count, Sorting */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-100">
        
        {/* Left: Mobile Filter Button + Desktop Count */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden min-h-[44px] flex items-center gap-2 py-2 px-3.5 bg-neutral-900 text-white hover:bg-black text-xs font-bold rounded-md uppercase tracking-wider active:scale-95 transition-all shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <span className="text-xs font-medium text-neutral-500">
            <strong className="text-neutral-900 tabular-nums">{sortedProducts.length}</strong> styles
          </span>
        </div>

        {/* Right: Sorting Select */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <span className="hidden sm:inline text-neutral-500 font-medium">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="min-h-[44px] py-2 px-3 bg-white border border-neutral-200 rounded-md text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer text-xs"
          >
            <option value="featured">Featured Picks</option>
            <option value="newest">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filters.sizes.length > 0 || filters.colors.length > 0 || filters.minPrice > 0 || filters.maxPrice < 15000 || filters.onSaleOnly || filters.inStockOnly) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active:</span>

          {filters.onSaleOnly && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              Sale Items
              <button onClick={() => setFilters({ ...filters, onSaleOnly: false })} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.sizes.map((sz) => (
            <span key={sz} className="inline-flex items-center gap-1 py-1 px-2.5 bg-neutral-100 text-neutral-800 text-xs rounded border border-neutral-200">
              Size: {sz}
              <button
                onClick={() => setFilters({ ...filters, sizes: filters.sizes.filter(s => s !== sz) })}
                className="hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.colors.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 py-1 px-2.5 bg-neutral-100 text-neutral-800 text-xs rounded border border-neutral-200">
              Color: {c}
              <button
                onClick={() => setFilters({ ...filters, colors: filters.colors.filter(col => col !== c) })}
                className="hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(filters.minPrice > 0 || filters.maxPrice < 15000) && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-neutral-100 text-neutral-800 text-xs rounded border border-neutral-200">
              PKR {filters.minPrice} – {filters.maxPrice}
              <button
                onClick={() => setFilters({ ...filters, minPrice: 0, maxPrice: 15000 })}
                className="hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs text-neutral-500 hover:text-black font-semibold underline underline-offset-4 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 bg-white p-5 rounded-lg border border-neutral-200/80 shadow-xs">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={resetAllFilters}
            totalProductsCount={sortedProducts.length}
          />
        </aside>

        {/* Product Cards Grid (9 cols on desktop, full width on mobile) */}
        <main className="lg:col-span-9">
          {displayedProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900">
                No matching styles found
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No products match your selected combination of filters. Try clearing some filters or switching categories.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 py-2 px-4 bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < sortedProducts.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 8)}
                className="py-3 px-8 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-md"
              >
                LOAD MORE STYLES ({sortedProducts.length - visibleCount} REMAINING)
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetAllFilters}
        totalProductsCount={sortedProducts.length}
      />
    </section>
  );
};
