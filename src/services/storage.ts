/**
 * LocalStorage Service - Centralized, versioned, error-resilient client storage
 * 
 * NOTE ON LOCALSTORAGE ARCHITECTURE:
 * - LocalStorage is browser-specific and device-specific.
 * - It is not an authoritative multi-user inventory database.
 * - Customer orders are stored locally for the customer's own tracking and reference.
 * - Orders must be dispatched to store owners via the WhatsApp order message.
 * - Sensitive financial credentials (passwords, card numbers) are NEVER stored here.
 */

import { CartItem, CustomerInfo, OrderRecord, WishlistItem } from '../types';

const STORAGE_KEYS = {
  CART: 'urbn_cart_v1',
  WISHLIST: 'urbn_wishlist_v1',
  RECENT_VIEWS: 'urbn_recent_views_v1',
  RECENT_SEARCHES: 'urbn_recent_searches_v1',
  CUSTOMER_INFO: 'urbn_customer_info_v1',
  ORDER_HISTORY: 'urbn_order_history_v1',
  PROMO_CODE: 'urbn_applied_promo_v1',
} as const;

function isStorageAvailable(): boolean {
  try {
    const testKey = '__urbn_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[URBN Storage] Corrupted entry for key "${key}", reverting to fallback.`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[URBN Storage] Failed to write key "${key}".`, err);
    return false;
  }
}

export const storageService = {
  // Cart
  getCart(): CartItem[] {
    const items = safeGet<CartItem[]>(STORAGE_KEYS.CART, []);
    return Array.isArray(items) ? items : [];
  },
  saveCart(items: CartItem[]): void {
    safeSet(STORAGE_KEYS.CART, items);
  },
  clearCart(): void {
    safeSet(STORAGE_KEYS.CART, []);
  },

  // Wishlist
  getWishlist(): WishlistItem[] {
    const items = safeGet<WishlistItem[]>(STORAGE_KEYS.WISHLIST, []);
    return Array.isArray(items) ? items : [];
  },
  saveWishlist(items: WishlistItem[]): void {
    safeSet(STORAGE_KEYS.WISHLIST, items);
  },

  // Recently Viewed Product IDs
  getRecentViews(): string[] {
    const views = safeGet<string[]>(STORAGE_KEYS.RECENT_VIEWS, []);
    return Array.isArray(views) ? views : [];
  },
  addRecentView(productId: string): string[] {
    const current = this.getRecentViews().filter(id => id !== productId);
    const updated = [productId, ...current].slice(0, 10);
    safeSet(STORAGE_KEYS.RECENT_VIEWS, updated);
    return updated;
  },

  // Recent Searches
  getRecentSearches(): string[] {
    const searches = safeGet<string[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
    return Array.isArray(searches) ? searches : [];
  },
  addRecentSearch(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getRecentSearches();
    const current = this.getRecentSearches().filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, 8);
    safeSet(STORAGE_KEYS.RECENT_SEARCHES, updated);
    return updated;
  },
  clearRecentSearches(): void {
    safeSet(STORAGE_KEYS.RECENT_SEARCHES, []);
  },

  // Customer Info (for guest convenience on next checkout)
  getCustomerInfo(): CustomerInfo | null {
    return safeGet<CustomerInfo | null>(STORAGE_KEYS.CUSTOMER_INFO, null);
  },
  saveCustomerInfo(info: CustomerInfo): void {
    safeSet(STORAGE_KEYS.CUSTOMER_INFO, info);
  },

  // Order History
  getOrderHistory(): OrderRecord[] {
    const orders = safeGet<OrderRecord[]>(STORAGE_KEYS.ORDER_HISTORY, []);
    return Array.isArray(orders) ? orders : [];
  },
  saveOrder(order: OrderRecord): OrderRecord[] {
    const orders = this.getOrderHistory();
    // Avoid duplicate orders by reference
    const exists = orders.some(o => o.orderReference === order.orderReference);
    const updated = exists
      ? orders.map(o => (o.orderReference === order.orderReference ? order : o))
      : [order, ...orders];
    safeSet(STORAGE_KEYS.ORDER_HISTORY, updated);
    return updated;
  },
  getOrder(orderRef: string): OrderRecord | undefined {
    return this.getOrderHistory().find(o => o.orderReference === orderRef);
  },
};
