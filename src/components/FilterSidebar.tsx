import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterState, ProductCategory } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount,
}) => {
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '36'];
  const colorsList = [
    { name: 'Black', hex: '#121212' },
    { name: 'Charcoal', hex: '#262626' },
    { name: 'Chalk/White', hex: '#f5f5f0' },
    { name: 'Indigo', hex: '#18243b' },
    { name: 'Sand/Beige', hex: '#d2b48c' },
    { name: 'Olive', hex: '#4b5320' },
  ];

  const pricePresets = [
    { label: 'Under PKR 2,500', min: 0, max: 2500 },
    { label: 'PKR 2,500 – 5,000', min: 2500, max: 5000 },
    { label: 'PKR 5,000 – 8,000', min: 5000, max: 8000 },
    { label: 'Above PKR 8,000', min: 8000, max: 20000 },
  ];

  const toggleSize = (size: string) => {
    const updated = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: updated });
  };

  const toggleColor = (colorName: string) => {
    const updated = filters.colors.includes(colorName)
      ? filters.colors.filter(c => c !== colorName)
      : [...filters.colors, colorName];
    onFilterChange({ ...filters, colors: updated });
  };

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 15000 ||
    filters.inStockOnly ||
    filters.onSaleOnly;

  return (
    <div className="space-y-6 text-xs text-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <span className="font-bold uppercase tracking-wider text-neutral-900 text-sm">
          Filters ({totalProductsCount})
        </span>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Sale & Stock Quick Toggles */}
      <div className="space-y-2 pb-4 border-b border-neutral-100">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => onFilterChange({ ...filters, onSaleOnly: e.target.checked })}
            className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
          />
          <span className="font-semibold text-neutral-900">Sale Items Only</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
          />
          <span className="text-neutral-700">In-Stock Only</span>
        </label>
      </div>

      {/* Sizes */}
      <div className="space-y-2.5 pb-4 border-b border-neutral-100">
        <div className="font-bold uppercase tracking-wider text-neutral-900">Size</div>
        <div className="grid grid-cols-4 gap-1.5">
          {sizesList.map((sz) => {
            const isSelected = filters.sizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => toggleSize(sz)}
                className={`min-h-[40px] py-2 px-2 rounded text-xs font-semibold active:scale-95 transition-all ${
                  isSelected
                    ? 'bg-neutral-950 text-white font-bold shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2.5 pb-4 border-b border-neutral-100">
        <div className="font-bold uppercase tracking-wider text-neutral-900">Color Palette</div>
        <div className="flex flex-wrap gap-2">
          {colorsList.map((col) => {
            const isSelected = filters.colors.includes(col.name);
            return (
              <button
                key={col.name}
                onClick={() => toggleColor(col.name)}
                className={`min-h-[36px] flex items-center gap-1.5 py-1.5 px-3 rounded border active:scale-95 transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800'
                }`}
              >
                <span
                  style={{ backgroundColor: col.hex }}
                  className="w-3 h-3 rounded-full border border-neutral-300 shrink-0"
                />
                <span className="text-[11px] font-medium">{col.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Presets */}
      <div className="space-y-2.5 pb-4 border-b border-neutral-100">
        <div className="font-bold uppercase tracking-wider text-neutral-900">Price Range (PKR)</div>
        <div className="space-y-1.5">
          {pricePresets.map((preset, idx) => {
            const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isSelected) {
                    onFilterChange({ ...filters, minPrice: 0, maxPrice: 15000 });
                  } else {
                    onFilterChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
                  }
                }}
                className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-neutral-100 font-bold text-neutral-950'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>{preset.label}</span>
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
