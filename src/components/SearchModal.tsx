import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { formatPKR } from '../services/whatsapp';
import { ProductImage } from './ProductImage';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    recentSearches,
    addSearchQuery,
    clearSearchHistory,
    openProductDetail,
    setCurrentCategory,
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const popularTags = ['Oversized Tee', 'Cargo Pants', 'Denim Jacket', 'Hoodies', 'Flannel Shirt', 'Dad Cap'];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return PRODUCTS.filter(product => {
      const titleMatch = product.title.toLowerCase().includes(q);
      const skuMatch = product.sku.toLowerCase().includes(q);
      const catMatch = product.category.toLowerCase().includes(q);
      const tagMatch = product.tags.some(tag => tag.toLowerCase().includes(q));
      const descMatch = product.description.toLowerCase().includes(q);
      return titleMatch || skuMatch || catMatch || tagMatch || descMatch;
    });
  }, [query]);

  const handleSelectProduct = (product: Product) => {
    if (query.trim()) {
      addSearchQuery(query.trim());
    }
    setIsSearchOpen(false);
    openProductDetail(product);
  };

  const handleApplyQuery = (term: string) => {
    setQuery(term);
    addSearchQuery(term);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Modal Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                addSearchQuery(query.trim());
              }
            }}
            placeholder="Search by product name, SKU, category, or tag (e.g. 'Cargo', 'Oversized')..."
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-black mr-2"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black px-2 py-1 rounded hover:bg-neutral-100"
          >
            ESC
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Recent Searches & Popular Tags (shown when query is empty) */}
          {!query.trim() && (
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-[11px] text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyQuery(term)}
                        className="text-xs py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors flex items-center gap-1"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trending Drops & Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleApplyQuery(tag)}
                      className="text-xs py-1.5 px-3 border border-neutral-200 hover:border-black text-neutral-700 hover:text-black rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Jump */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Browse by Category
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setCurrentCategory('tees');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded text-left font-medium text-neutral-900 flex items-center justify-between"
                  >
                    <span>Tees & Polos</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCategory('hoodies');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded text-left font-medium text-neutral-900 flex items-center justify-between"
                  >
                    <span>Hoodies & Fleece</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCategory('cargos');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded text-left font-medium text-neutral-900 flex items-center justify-between"
                  >
                    <span>Cargos & Pants</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCategory('jackets');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded text-left font-medium text-neutral-900 flex items-center justify-between"
                  >
                    <span>Jackets & Outerwear</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCategory('jeans');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded text-left font-medium text-neutral-900 flex items-center justify-between"
                  >
                    <span>Jeans & Denim</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCategory('sale');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 bg-red-50 hover:bg-red-100 rounded text-left font-bold text-red-600 flex items-center justify-between"
                  >
                    <span>Sale (Up to 40% Off)</span>
                    <ArrowRight className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-neutral-500">
                <span>
                  Found <strong className="text-neutral-900 tabular-nums">{searchResults.length}</strong> styles matching "{query}"
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm font-semibold text-neutral-800">No products found</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    We couldn't find matches for "{query}". Try searching for generic keywords like "hoodie", "pants", "tee", or browse our collections.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="py-3 flex items-center gap-4 hover:bg-neutral-50 rounded-md p-2 -mx-2 cursor-pointer transition-colors"
                    >
                      <div className="w-14 h-18 rounded overflow-hidden bg-neutral-100 shrink-0">
                        <ProductImage
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                          {product.sku} · {product.category}
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-900 truncate">
                          {product.title}
                        </h4>
                        <div className="text-xs font-semibold text-neutral-900 mt-1 tabular-nums">
                          PKR {formatPKR(product.price)}
                          {product.originalPrice && (
                            <span className="text-neutral-400 line-through ml-2 font-normal">
                              PKR {formatPKR(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 shrink-0">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
