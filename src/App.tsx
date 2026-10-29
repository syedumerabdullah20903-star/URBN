/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroBanner } from './components/HeroBanner';
import { CategoryStrip } from './components/CategoryStrip';
import { ProductGrid } from './components/ProductGrid';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { StorePoliciesModal } from './components/StorePoliciesModal';
import { ToastNotifications } from './components/ToastNotifications';
import { ChatWidget } from './components/chat/ChatWidget';
import { Footer } from './components/Footer';

const StorefrontContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { recentViews } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white pb-16 md:pb-0">
      {/* 1. Top Announcement Ticker */}
      <AnnouncementBar />

      {/* 2. Main Navigation Header */}
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* 3. Hero Campaign Banner */}
      <HeroBanner />

      {/* 4. Curated Department Strip */}
      <CategoryStrip />

      {/* 5. Main Catalog & Filter Grid */}
      <ProductGrid />

      {/* 6. Recently Viewed Shelf (Shows if user viewed products in this session) */}
      {recentViews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-t border-neutral-200">
          <div className="mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
              Personalized History
            </span>
            <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 mt-0.5 sm:mt-1 font-display">
              Recently Viewed Styles
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-6">
            {recentViews.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Comprehensive Retail Footer */}
      <Footer />

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav onOpenCategories={() => setIsMobileMenuOpen(true)} />

      {/* Modals & Slide-over Drawers */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <ProductDetailModal />
      <CheckoutModal />
      <OrderConfirmationModal />
      <OrderHistoryModal />
      <StorePoliciesModal />
      <ToastNotifications />
      <ChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
