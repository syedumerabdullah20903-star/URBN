export type ProductCategory = 'all' | 'tees' | 'hoodies' | 'cargos' | 'jackets' | 'jeans' | 'accessories' | 'sale';

export interface ProductColor {
  name: string;
  hex: string;
  inStock?: boolean;
}

export interface ProductVariantStock {
  size: string;
  color: string;
  quantity: number;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
  fitFeedback?: 'Runs small' | 'True to size' | 'Relaxed / Oversized';
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  gender: 'men' | 'women' | 'unisex' | 'juniors';
  description: string;
  fabricCare: string[];
  fit: string;
  images: string[];
  colorImages?: Record<string, string[]>;
  price: number; // in PKR
  originalPrice?: number;
  discountPercent?: number;
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariantStock[];
  stockQuantity: number;
  tags: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewsCount: number;
  reviews?: ProductReview[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  products?: Product[];
  suggestedActions?: string[];
  customerCareDraft?: {
    query: string;
    orderRef?: string;
  };
  isError?: boolean;
}

export interface CartItem {
  id: string; // unique item id: `${productId}-${selectedSize}-${selectedColor}`
  productId: string;
  title: string;
  sku: string;
  image: string;
  price: number;
  originalPrice?: number;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  maxStock: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
  paymentMethod: 'COD' | 'DirectBank';
}

export interface OrderRecord {
  orderReference: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCodeApplied?: string;
  whatsappUrl: string;
  whatsappMessage: string;
  status: 'pending_whatsapp' | 'submitted' | 'completed';
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popularity';

export interface FilterState {
  category: ProductCategory;
  subcategories: string[];
  genders: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  searchQuery: string;
}

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
