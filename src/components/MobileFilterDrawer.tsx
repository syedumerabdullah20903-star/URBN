import React from 'react';
import { X, Check } from 'lucide-react';
import { FilterState } from '../types';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <span className="font-bold uppercase tracking-wider text-sm">
            Filters ({totalProductsCount})
          </span>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            totalProductsCount={totalProductsCount}
          />
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <button
            onClick={onResetFilters}
            className="w-1/3 min-h-[46px] py-3 text-xs font-bold uppercase tracking-wider border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="w-2/3 min-h-[46px] py-3 text-xs font-bold uppercase tracking-wider bg-black text-white rounded hover:bg-neutral-800 active:scale-95 transition-all shadow-xs"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
