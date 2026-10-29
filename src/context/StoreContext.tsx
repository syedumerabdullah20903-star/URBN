import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { CartItem, CustomerInfo, OrderRecord, Product, ProductCategory, Toast, WishlistItem } from '../types';
import { storageService } from '../services/storage';
import { PRODUCTS } from '../data/products';

interface StoreContextValue {
  // Cart
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  appliedPromo: string | null;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => boolean;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

  // Navigation & Modals
  currentCategory: ProductCategory;
  setCurrentCategory: (category: ProductCategory) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  isPoliciesOpen: boolean;
  setIsPoliciesOpen: (open: boolean) => void;
  activePolicyTab: 'delivery' | 'returns' | 'stores' | 'terms';
  openPolicies: (tab?: 'delivery' | 'returns' | 'stores' | 'terms') => void;

  // PDP modal / View
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;

  // Order Confirmation
  activeOrderConfirmation: OrderRecord | null;
  setActiveOrderConfirmation: (order: OrderRecord | null) => void;

  // Storage data
  recentViews: Product[];
  recordProductView: (productId: string) => void;
  recentSearches: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  customerInfo: CustomerInfo | null;
  saveCustomerInfo: (info: CustomerInfo) => void;
  orderHistory: OrderRecord[];
  recordCompletedOrder: (order: OrderRecord) => void;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 3000;
const STANDARD_SHIPPING_FEE = 250;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialized from storageService
  const [cart, setCart] = useState<CartItem[]>(() => storageService.getCart());
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => storageService.getWishlist());
  const [recentViewIds, setRecentViewIds] = useState<string[]>(() => storageService.getRecentViews());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => storageService.getRecentSearches());
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(() => storageService.getCustomerInfo());
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() => storageService.getOrderHistory());

  // Navigation & UI States
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'delivery' | 'returns' | 'stores' | 'terms'>('delivery');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<OrderRecord | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state across browser tabs using storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'urbn_cart_v1') {
        setCart(storageService.getCart());
      } else if (e.key === 'urbn_wishlist_v1') {
        setWishlist(storageService.getWishlist());
      } else if (e.key === 'urbn_order_history_v1') {
        setOrderHistory(storageService.getOrderHistory());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toast Helpers
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message?: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal]);

  const remainingForFreeShipping = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  }, [subtotal]);

  const discount = useMemo(() => {
    if (!appliedPromo || subtotal === 0) return 0;
    if (appliedPromo === 'URBN10') {
      return Math.round(subtotal * 0.1);
    }
    if (appliedPromo === 'FIRSTBUY') {
      return Math.min(subtotal, 500);
    }
    return 0;
  }, [subtotal, appliedPromo]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingFee);
  }, [subtotal, discount, shippingFee]);

  // Cart Actions
  const addToCart = useCallback((product: Product, size: string, color: string, quantity = 1): boolean => {
    if (!size || !color) {
      addToast('Option Required', 'Please select both your size and color before adding.', 'warning');
      return false;
    }

    // Check variant stock
    const variant = product.variants.find(v => v.size === size && v.color === color);
    const maxStock = variant ? variant.quantity : product.stockQuantity;

    if (maxStock <= 0) {
      addToast('Out of Stock', 'This selected size and color combination is sold out.', 'error');
      return false;
    }

    const itemId = `${product.id}-${size}-${color}`;
    let updatedCart: CartItem[] = [];

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        updatedCart = prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          title: product.title,
          sku: product.sku,
          image: product.images[0],
          price: product.price,
          originalPrice: product.originalPrice,
          selectedSize: size,
          selectedColor: color,
          quantity: Math.min(quantity, maxStock),
          maxStock,
        };
        updatedCart = [newItem, ...prev];
      }
      storageService.saveCart(updatedCart);
      return updatedCart;
    });

    addToast('Added to Bag', `${product.title} (${size} · ${color}) added.`, 'success');
    return true;
  }, [addToast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const validQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      });
      storageService.saveCart(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const itemToRemove = prev.find(i => i.id === itemId);
      const updated = prev.filter(i => i.id !== itemId);
      storageService.saveCart(updated);
      if (itemToRemove) {
        addToast('Item Removed', `${itemToRemove.title} removed from bag.`, 'info');
      }
      return updated;
    });
  }, [addToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    storageService.clearCart();
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'URBN10') {
      setAppliedPromo('URBN10');
      addToast('Promo Code Applied', '10% discount applied to your order!', 'success');
      return { success: true, message: '10% discount applied!' };
    }
    if (clean === 'FIRSTBUY') {
      setAppliedPromo('FIRSTBUY');
      addToast('Promo Code Applied', 'PKR 500 flat discount applied!', 'success');
      return { success: true, message: 'PKR 500 flat discount applied!' };
    }
    addToast('Invalid Voucher', 'Code not recognized or expired. Try "URBN10".', 'error');
    return { success: false, message: 'Invalid or expired promo code.' };
  }, [addToast]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    addToast('Promo Removed', 'Discount coupon has been removed.', 'info');
  }, [addToast]);

  // Wishlist Actions
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.productId === productId);
      let updated: WishlistItem[];
      const product = PRODUCTS.find(p => p.id === productId);

      if (exists) {
        updated = prev.filter(item => item.productId !== productId);
        if (product) addToast('Removed from Wishlist', product.title, 'info');
      } else {
        updated = [{ productId, addedAt: new Date().toISOString() }, ...prev];
        if (product) addToast('Added to Wishlist', product.title, 'success');
      }
      storageService.saveWishlist(updated);
      return updated;
    });
  }, [addToast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    storageService.saveWishlist([]);
  }, []);

  // Recently Viewed
  const recordProductView = useCallback((productId: string) => {
    const updated = storageService.addRecentView(productId);
    setRecentViewIds(updated);
  }, []);

  const recentViews = useMemo(() => {
    return recentViewIds
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentViewIds]);

  // Recent Searches
  const addSearchQuery = useCallback((query: string) => {
    const updated = storageService.addRecentSearch(query);
    setRecentSearches(updated);
  }, []);

  const clearSearchHistory = useCallback(() => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Customer Info
  const saveCustomerInfo = useCallback((info: CustomerInfo) => {
    setCustomerInfo(info);
    storageService.saveCustomerInfo(info);
  }, []);

  // Orders
  const recordCompletedOrder = useCallback((order: OrderRecord) => {
    const updated = storageService.saveOrder(order);
    setOrderHistory(updated);
  }, []);

  // Product Detail Modal
  const openProductDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    recordProductView(product.id);
  }, [recordProductView]);

  const closeProductDetail = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const openPolicies = useCallback((tab: 'delivery' | 'returns' | 'stores' | 'terms' = 'delivery') => {
    setActivePolicyTab(tab);
    setIsPoliciesOpen(true);
  }, []);

  const value: StoreContextValue = {
    cart,
    cartCount,
    subtotal,
    shippingFee,
    discount,
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    remainingForFreeShipping,
    appliedPromo,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode,
    wishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    currentCategory,
    setCurrentCategory,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    isPoliciesOpen,
    setIsPoliciesOpen,
    activePolicyTab,
    openPolicies,
    selectedProduct,
    openProductDetail,
    closeProductDetail,
    activeOrderConfirmation,
    setActiveOrderConfirmation,
    recentViews,
    recordProductView,
    recentSearches,
    addSearchQuery,
    clearSearchHistory,
    customerInfo,
    saveCustomerInfo,
    orderHistory,
    recordCompletedOrder,
    toasts,
    addToast,
    removeToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
