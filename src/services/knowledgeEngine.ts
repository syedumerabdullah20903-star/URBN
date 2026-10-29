/**
 * Centralized Knowledge Engine for URBN·MEN Storefront & AI Chatbot
 * Source of truth for product search, fabric specifications, review summaries,
 * store policies, delivery timelines, LocalStorage cart/order guidance, and WhatsApp support.
 */

import { Product, ProductReview, CartItem, OrderRecord } from '../types';
import { PRODUCTS } from '../data/products';
import { formatPKR, getConfiguredBusinessNumber, createWhatsAppUrl } from './whatsapp';

export interface KnowledgeAnswer {
  text: string;
  products?: Product[];
  suggestedActions?: string[];
  customerCareDraft?: {
    query: string;
    orderRef?: string;
  };
}

export const STORE_POLICIES = {
  freeShippingThreshold: 3000,
  standardShippingFee: 250,
  deliveryTimelines: {
    majorMetros: '2 to 3 working days (Karachi, Lahore, Islamabad, Rawalpindi)',
    otherCities: '3 to 5 working days (Faisalabad, Multan, Peshawar, Quetta, Sialkot & 200+ cities)',
  },
  courierPartners: ['TCS', 'Leopards Courier', 'Call Courier'],
  exchangeDays: 14,
  exchangeTerms: [
    'Articles must be unwashed, unworn, and have all original price tags attached.',
    'Exchanges can be performed via courier return or directly at any flagship store outlet.',
    'Clearance items discounted over 40% are eligible for size exchange only.',
    'Customers must retain their original delivery invoice and order reference (e.g. ORD-XXXXXXXX).',
  ],
  codRules: [
    'Cash on Delivery (COD) is available nationwide across 200+ cities in Pakistan.',
    'Payment must be handed to the courier rider upon delivery before opening the sealed parcel (standard courier regulation).',
    'If a size or style exchange is needed, our 14-day exchange process handles it quickly.',
  ],
  stores: [
    { city: 'Lahore', locations: 'Packages Mall (Level 1) & MM Alam Road, Gulberg III', timings: '11:00 AM – 11:00 PM' },
    { city: 'Karachi', locations: 'Dolmen Mall Clifton (1st Floor) & Lucky One Mall', timings: '11:00 AM – 11:00 PM' },
    { city: 'Islamabad', locations: 'The Centaurus Mall (F-8) & Safa Gold Mall (F-7)', timings: '11:00 AM – 11:00 PM' },
  ],
  customerSupport: {
    founderAndDirector: 'Syed Umer Abdullah',
    whatsappNumber: '+92 311 1398618',
    whatsappRaw: '923111398618',
    localNumber: '0311-1398618',
    hours: 'Mon-Sat: 10:00 AM – 10:00 PM (PKT)',
  },
};

/**
 * Searches and filters the genuine product catalog
 */
export function searchCatalog(params: {
  query?: string;
  category?: string;
  color?: string;
  size?: string;
  maxPrice?: number;
  minPrice?: number;
  onSaleOnly?: boolean;
  newArrivalsOnly?: boolean;
}): Product[] {
  const { query, category, color, size, maxPrice, minPrice, onSaleOnly, newArrivalsOnly } = params;

  return PRODUCTS.filter((product) => {
    // Category check
    if (category && category !== 'all') {
      if (category === 'sale') {
        if (!product.isOnSale && (!product.discountPercent || product.discountPercent <= 0)) return false;
      } else if (product.category !== category) {
        return false;
      }
    }

    // Sale check
    if (onSaleOnly && !product.isOnSale && (!product.discountPercent || product.discountPercent <= 0)) {
      return false;
    }

    // New arrivals check
    if (newArrivalsOnly && !product.isNewArrival) {
      return false;
    }

    // Size check
    if (size) {
      const normalizedSize = size.toUpperCase().trim();
      const hasSize = product.sizes.some((s) => s.toUpperCase() === normalizedSize);
      if (!hasSize) return false;
    }

    // Color check
    if (color) {
      const normalizedColor = color.toLowerCase().trim();
      const hasColor = product.colors.some((c) => c.name.toLowerCase().includes(normalizedColor));
      if (!hasColor) return false;
    }

    // Price check
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;

    // Keyword match
    if (query) {
      const q = query.toLowerCase().trim();
      const inTitle = product.title.toLowerCase().includes(q);
      const inSku = product.sku.toLowerCase().includes(q);
      const inCategory = product.category.toLowerCase().includes(q);
      const inTags = product.tags.some((t) => t.toLowerCase().includes(q));
      const inDesc = product.description.toLowerCase().includes(q);
      const inFabric = product.fabricCare.some((f) => f.toLowerCase().includes(q));
      if (!inTitle && !inSku && !inCategory && !inTags && !inDesc && !inFabric) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Retrieves full fabric, fit, and care specifications for a product
 */
export function getProductSpecifications(productIdOrSku: string): {
  product?: Product;
  fabricDetails: string;
  fitDetails: string;
  careDetails: string[];
  stockSummary: string;
} | null {
  const product = PRODUCTS.find(
    (p) => p.id === productIdOrSku || p.sku.toLowerCase() === productIdOrSku.toLowerCase()
  );

  if (!product) return null;

  const stockSummary = product.stockQuantity > 0
    ? `${product.stockQuantity} units available across sizes (${product.sizes.join(', ')})`
    : 'Currently out of stock';

  return {
    product,
    fabricDetails: product.fabricCare[0] || 'Specific fabric composition not provided.',
    fitDetails: product.fit || 'Regular fit.',
    careDetails: product.fabricCare.slice(1),
    stockSummary,
  };
}

/**
 * Analyzes verified customer reviews for a given product
 */
export function getProductReviewsAnalysis(productIdOrSku: string): {
  product?: Product;
  hasReviews: boolean;
  averageRating: number;
  totalReviews: number;
  verifiedReviews: ProductReview[];
  fitFeedbackSummary: string;
  commonThemes: string[];
} | null {
  const product = PRODUCTS.find(
    (p) => p.id === productIdOrSku || p.sku.toLowerCase() === productIdOrSku.toLowerCase()
  );

  if (!product) return null;

  const reviews = product.reviews || [];
  const hasReviews = reviews.length > 0;

  let fitFeedbackSummary = 'No customer fit feedback recorded yet.';
  if (hasReviews) {
    const fitCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      if (r.fitFeedback) {
        fitCounts[r.fitFeedback] = (fitCounts[r.fitFeedback] || 0) + 1;
      }
    });
    const entries = Object.entries(fitCounts);
    if (entries.length > 0) {
      fitFeedbackSummary = entries.map(([fit, count]) => `${count} review(s) report "${fit}"`).join(', ');
    }
  }

  const commonThemes: string[] = [];
  if (hasReviews) {
    reviews.forEach((r) => {
      if (r.comment.toLowerCase().includes('gsm') || r.comment.toLowerCase().includes('thick') || r.comment.toLowerCase().includes('heavy')) {
        commonThemes.push('Fabric weight & substantial hand-feel praised');
      }
      if (r.comment.toLowerCase().includes('drape') || r.comment.toLowerCase().includes('drop shoulder') || r.comment.toLowerCase().includes('fit')) {
        commonThemes.push('Streetwear boxy silhouette & relaxed drop-shoulder cut praised');
      }
      if (r.comment.toLowerCase().includes('wash') || r.comment.toLowerCase().includes('collar')) {
        commonThemes.push('Collar durability & post-wash shape retention confirmed');
      }
    });
  }

  return {
    product,
    hasReviews,
    averageRating: product.rating,
    totalReviews: product.reviewsCount,
    verifiedReviews: reviews,
    fitFeedbackSummary,
    commonThemes: Array.from(new Set(commonThemes)),
  };
}

/**
 * Intelligent client-side rule engine to evaluate customer queries
 * Serves as both our high-speed local responder and graceful fallback.
 */
export function answerCustomerQuery(
  rawQuery: string,
  context?: {
    currentProductId?: string;
    currentCart?: CartItem[];
    recentOrders?: OrderRecord[];
  }
): KnowledgeAnswer {
  const query = rawQuery.trim().toLowerCase();

  // 1. Order tracking query
  const orderRefMatch = rawQuery.match(/ORD-[A-Z0-9]{8}/i);
  if (
    query.includes('track') ||
    query.includes('where is my order') ||
    query.includes('order status') ||
    orderRefMatch
  ) {
    const targetRef = orderRefMatch ? orderRefMatch[0].toUpperCase() : undefined;
    const foundOrder = targetRef && context?.recentOrders
      ? context.recentOrders.find((o) => o.orderReference === targetRef)
      : context?.recentOrders && context.recentOrders.length > 0
      ? context.recentOrders[0]
      : undefined;

    if (foundOrder) {
      return {
        text: `Found local order **${foundOrder.orderReference}** created on ${new Date(foundOrder.createdAt).toLocaleDateString()}:\n\n` +
          `• Total: PKR ${formatPKR(foundOrder.total)} (${foundOrder.customer.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'})\n` +
          `• Delivery to: ${foundOrder.customer.address}, ${foundOrder.customer.city}\n` +
          `• Items: ${foundOrder.items.map((i) => `${i.quantity}x ${i.title} (${i.selectedSize}/${i.selectedColor})`).join(', ')}\n\n` +
          `*Note on tracking:* Local orders exist in your browser. For real-time courier tracking updates from TCS/Leopards, reach out to our WhatsApp customer care desk with your order reference.`,
        suggestedActions: [
          'Chat with Customer Care on WhatsApp',
          'Delivery & Shipping Timelines',
          'Continue Shopping',
        ],
        customerCareDraft: {
          query: `Hello URBN Care! I would like an update on my order ${foundOrder.orderReference}.`,
          orderRef: foundOrder.orderReference,
        },
      };
    }

    return {
      text: `Your orders placed on this device are saved in your browser's LocalStorage under **My Orders** in the top bar.\n\n` +
        `If you have an order reference (e.g., \`ORD-XXXXXXXX\`), type it here or connect directly with our WhatsApp dispatch desk for courier tracking.`,
      suggestedActions: [
        'Open My Orders',
        'Contact WhatsApp Support',
        'Delivery Timelines',
      ],
      customerCareDraft: {
        query: 'Hello URBN Support! I would like to inquire about my order status.',
      },
    };
  }

  // 2. Shipping & Delivery Questions
  if (
    query.includes('delivery') ||
    query.includes('shipping') ||
    query.includes('courier') ||
    query.includes('tcs') ||
    query.includes('leopard') ||
    query.includes('how long') ||
    query.includes('delivery charges') ||
    query.includes('delivery fee')
  ) {
    return {
      text: `Here are our published nationwide delivery rules across Pakistan:\n\n` +
        `• **Free Delivery:** All orders of **PKR ${formatPKR(STORE_POLICIES.freeShippingThreshold)} or more** receive 100% Free Nationwide Delivery.\n` +
        `• **Standard Delivery Fee:** PKR ${STORE_POLICIES.standardShippingFee} flat fee for orders under PKR ${formatPKR(STORE_POLICIES.freeShippingThreshold)}.\n` +
        `• **Timelines:**\n` +
        `  - Major Metros (Karachi, Lahore, Islamabad, Rawalpindi): **${STORE_POLICIES.deliveryTimelines.majorMetros}**.\n` +
        `  - Other Cities & Towns (200+ destinations via TCS, Leopards & Call Courier): **${STORE_POLICIES.deliveryTimelines.otherCities}**.\n` +
        `• **Payment:** Cash on Delivery (COD) is available nationwide.`,
      suggestedActions: [
        'Cash on Delivery Rules',
        '14-Day Exchange Policy',
        'Find Oversized Tees',
        'Shop Hoodies',
      ],
    };
  }

  // 3. Exchange & Returns
  if (
    query.includes('return') ||
    query.includes('exchange') ||
    query.includes('refund') ||
    query.includes('replace') ||
    query.includes('size change')
  ) {
    return {
      text: `**URBN 14-Day Easy Exchange Policy:**\n\n` +
        `• You can exchange any unworn, unwashed garment within **14 days** of delivery.\n` +
        `• Original price tags must remain attached.\n` +
        `• Exchanges can be processed via courier pickup or at any flagship store outlet in Lahore, Karachi, or Islamabad.\n` +
        `• Items discounted over 40% are eligible for size exchange only (subject to stock).\n` +
        `• To initiate an exchange, keep your order reference (\`ORD-XXXXXXXX\`) ready and contact our WhatsApp team.`,
      suggestedActions: [
        'Store Locations in Pakistan',
        'WhatsApp Exchange Desk',
        'Size Guide Assistance',
      ],
      customerCareDraft: {
        query: 'Hello URBN Support! I would like to exchange an item from my recent delivery.',
      },
    };
  }

  // 4. Cash on Delivery (COD) & Payment
  if (
    query.includes('cod') ||
    query.includes('cash on delivery') ||
    query.includes('payment') ||
    query.includes('bank transfer') ||
    query.includes('easypaisa') ||
    query.includes('jazzcash')
  ) {
    return {
      text: `**Payment Options at URBN·MEN:**\n\n` +
        `1. **Cash on Delivery (COD):** Available for 200+ cities across Pakistan. Pay cash to the courier rider upon receiving your parcel.\n` +
        `   *Courier Rule:* Parcels cannot be opened prior to payment handover.\n` +
        `2. **Direct Bank Transfer / EasyPaisa / JazzCash:** Available upon checkout. Order confirmation is shared directly via WhatsApp with payment instructions.`,
      suggestedActions: [
        'Free Delivery Threshold',
        '14-Day Exchange Policy',
        'View My Cart',
      ],
    };
  }

  // 5. Physical Store Outlets
  if (
    query.includes('store') ||
    query.includes('outlet') ||
    query.includes('shop location') ||
    query.includes('address') ||
    query.includes('lahore') && (query.includes('where') || query.includes('store')) ||
    query.includes('karachi') && (query.includes('where') || query.includes('store')) ||
    query.includes('islamabad') && (query.includes('where') || query.includes('store'))
  ) {
    return {
      text: `**URBN Flagship Outlets in Pakistan (Open daily 11:00 AM – 11:00 PM):**\n\n` +
        `• **Lahore:** Packages Mall (Level 1) & MM Alam Road, Gulberg III\n` +
        `• **Karachi:** Dolmen Mall Clifton (1st Floor) & Lucky One Mall\n` +
        `• **Islamabad:** The Centaurus Mall (F-8) & Safa Gold Mall (F-7 Markaz)\n\n` +
        `You can visit any outlet for fitting, style consultation, or 14-day in-store exchanges.`,
      suggestedActions: [
        'Delivery Timelines',
        'Explore Menswear',
        'WhatsApp Support',
      ],
    };
  }

  // 6. Current Cart Assistance
  if (
    query.includes('cart') ||
    query.includes('bag') ||
    query.includes('subtotal') ||
    query.includes('checkout') ||
    query.includes('how much in my cart')
  ) {
    const cart = context?.currentCart || [];
    if (cart.length === 0) {
      return {
        text: `Your shopping bag is currently empty. Browse our heavyweight tees, pullover hoodies, or tactical cargos to get started. Orders over PKR 3,000 get Free Delivery!`,
        suggestedActions: [
          'Show Oversized Tees',
          'Heavyweight Hoodies',
          'Tactical Cargo Pants',
          'Sale Archive',
        ],
      };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const neededForFree = Math.max(0, STORE_POLICIES.freeShippingThreshold - subtotal);
    const shipping = neededForFree === 0 ? 0 : STORE_POLICIES.standardShippingFee;
    const total = subtotal + shipping;

    const itemsSummary = cart.map((i) => `• ${i.title} (${i.selectedSize} / ${i.selectedColor}) x ${i.quantity} — PKR ${formatPKR(i.price * i.quantity)}`).join('\n');

    return {
      text: `Here is your current bag summary:\n\n${itemsSummary}\n\n` +
        `• **Subtotal:** PKR ${formatPKR(subtotal)}\n` +
        `• **Shipping:** ${shipping === 0 ? 'FREE' : `PKR ${STORE_POLICIES.standardShippingFee}`}\n` +
        `• **Estimated Total:** PKR ${formatPKR(total)}\n\n` +
        (neededForFree > 0
          ? `💡 Add items worth **PKR ${formatPKR(neededForFree)}** to qualify for **Free Nationwide Delivery**!`
          : `🎉 Congratulations! Your order qualifies for **Free Nationwide Delivery**!`),
      suggestedActions: [
        'Proceed to Checkout',
        'Add More Items for Free Delivery',
        'Delivery & COD Rules',
      ],
    };
  }

  // 6.5. Store Owner / Founder / Syed Umer Abdullah inquiry
  if (
    query.includes('owner') ||
    query.includes('founder') ||
    query.includes('syed') ||
    query.includes('umer') ||
    query.includes('abdullah') ||
    query.includes('who runs') ||
    query.includes('who owns') ||
    query.includes('director') ||
    query.includes('creator') ||
    query.includes('ceo')
  ) {
    return {
      text: `**URBN MEN** is directed and founded by **Syed Umer Abdullah**.\n\n` +
        `• **Direct WhatsApp:** ${STORE_POLICIES.customerSupport.whatsappNumber} (${STORE_POLICIES.customerSupport.localNumber})\n` +
        `• **Operating Hours:** ${STORE_POLICIES.customerSupport.hours}\n` +
        `• **Role:** Directing streetwear curation, product quality standards, order dispatch verifications, and VIP customer concierge.\n\n` +
        `Feel free to reach out directly to Syed Umer Abdullah via WhatsApp for styling advice, order confirmation, or VIP assistance.`,
      suggestedActions: [
        'Chat on WhatsApp',
        'Show Oversized Tees',
        'Track My Order',
      ],
      customerCareDraft: {
        query: 'Hello Syed Umer Abdullah! I am browsing URBN MEN and would like personal assistance.',
      },
    };
  }

  // 7. Human Customer Care / WhatsApp Handoff
  if (
    query.includes('human') ||
    query.includes('agent') ||
    query.includes('support') ||
    query.includes('talk to') ||
    query.includes('whatsapp') ||
    query.includes('complaint') ||
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('number') ||
    query.includes('help desk')
  ) {
    return {
      text: `You can connect directly with **Syed Umer Abdullah** and our customer concierge via WhatsApp:\n\n` +
        `• **WhatsApp Hotline:** ${STORE_POLICIES.customerSupport.whatsappNumber} (${STORE_POLICIES.customerSupport.localNumber})\n` +
        `• **Representative:** Syed Umer Abdullah\n` +
        `• **Operating Hours:** ${STORE_POLICIES.customerSupport.hours}\n` +
        `• **Assistance Available For:** Custom sizing advice, courier dispatch & tracking updates, order verification, and 14-day store exchange validation.`,
      suggestedActions: [
        'Chat on WhatsApp',
        '14-Day Exchange Policy',
        'Delivery Information',
      ],
      customerCareDraft: {
        query: 'Hello Syed Umer Abdullah! I would like to speak to customer service regarding my shopping inquiry.',
      },
    };
  }

  // 8. Reviews / Customer opinion query
  if (
    query.includes('review') ||
    query.includes('rating') ||
    query.includes('what do customers think') ||
    query.includes('feedback') ||
    query.includes('quality')
  ) {
    // If user is currently looking at a product or mentions a product
    let targetProduct = context?.currentProductId
      ? PRODUCTS.find((p) => p.id === context.currentProductId)
      : undefined;

    if (!targetProduct) {
      targetProduct = PRODUCTS.find((p) =>
        query.includes(p.title.toLowerCase()) ||
        query.includes(p.category.toLowerCase()) ||
        p.tags.some((t) => query.includes(t.toLowerCase()))
      ) || PRODUCTS[0];
    }

    const analysis = getProductReviewsAnalysis(targetProduct.id);
    if (analysis && analysis.hasReviews) {
      const quotes = analysis.verifiedReviews
        .slice(0, 2)
        .map((r) => `> "${r.comment}" — *${r.author} (Verified Buyer, ${r.rating}★)*`)
        .join('\n\n');

      return {
        text: `Here is the verified customer review breakdown for **${targetProduct.title}**:\n\n` +
          `• **Average Rating:** ${analysis.averageRating} / 5.0 (${analysis.totalReviews} verified ratings)\n` +
          `• **Customer Fit Consensus:** ${analysis.fitFeedbackSummary}\n` +
          `• **Key Praises:** ${analysis.commonThemes.join('; ') || 'High fabric density and clean silhouette'}\n\n` +
          `${quotes}\n\n` +
          `*Note:* Verified reviews come from authenticated customers who completed WhatsApp orders.`,
        products: [targetProduct],
        suggestedActions: [
          `Fabric details for ${targetProduct.title}`,
          'Available Sizes & Colors',
          'Shop Similar Products',
        ],
      };
    }

    return {
      text: `**${targetProduct.title}** has an average rating of **${targetProduct.rating} / 5.0** based on **${targetProduct.reviewsCount} customer reviews**.\n\n` +
        `Customers consistently rate this article highly for its substantial weight and durability. Would you like to check its fabric specifications or available sizes?`,
      products: [targetProduct],
      suggestedActions: [
        'Fabric & Material Specs',
        'View Size Guide',
        'Delivery Timelines',
      ],
    };
  }

  // 9. Fabric, Material & Composition Query
  if (
    query.includes('fabric') ||
    query.includes('material') ||
    query.includes('cotton') ||
    query.includes('gsm') ||
    query.includes('terry') ||
    query.includes('denim') ||
    query.includes('ripstop') ||
    query.includes('summer') ||
    query.includes('winter') ||
    query.includes('stretch') ||
    query.includes('care')
  ) {
    let target = context?.currentProductId
      ? PRODUCTS.find((p) => p.id === context.currentProductId)
      : undefined;

    if (!target) {
      target = PRODUCTS.find((p) =>
        query.includes(p.title.toLowerCase()) ||
        query.includes(p.category.toLowerCase()) ||
        p.tags.some((t) => query.includes(t.toLowerCase()))
      ) || PRODUCTS[0];
    }

    const specs = getProductSpecifications(target.id);
    if (specs) {
      const careText = specs.careDetails.length > 0
        ? `\n\n**Care Instructions:**\n${specs.careDetails.map((c) => `• ${c}`).join('\n')}`
        : '';

      const seasonNote = target.category === 'hoodies' || target.category === 'jackets'
        ? '💡 **Seasonal Suitability:** Ideal for cold weather, winter layers, and evening wear.'
        : target.category === 'tees'
        ? '💡 **Seasonal Suitability:** 280 GSM combed cotton offers a heavy, structured boxy drape suitable year-round.'
        : '';

      return {
        text: `**Fabric & Specifications for ${target.title}:**\n\n` +
          `• **Composition:** ${specs.fabricDetails}\n` +
          `• **Fit Type:** ${specs.fitDetails}\n` +
          `• **Available Options:** Sizes (${target.sizes.join(', ')}), Colors (${target.colors.map((c) => c.name).join(', ')})\n` +
          (seasonNote ? `\n${seasonNote}` : '') +
          careText,
        products: [target],
        suggestedActions: [
          `Check reviews for ${target.title}`,
          'View Size Guide',
          'Add to Bag',
        ],
      };
    }
  }

  // 10. Price-based, Budget, or Sale search
  const priceUnderMatch = query.match(/(?:under|below|less than)\s*(?:pkr|rs\.?)?\s*([0-9,]+)/i);
  const maxBudget = priceUnderMatch ? parseInt(priceUnderMatch[1].replace(/,/g, ''), 10) : undefined;

  if (query.includes('sale') || query.includes('discount') || query.includes('cheap') || maxBudget !== undefined) {
    let matches = searchCatalog({
      maxPrice: maxBudget,
      onSaleOnly: query.includes('sale') || query.includes('discount'),
    });

    if (query.includes('cheap') || query.includes('lowest price')) {
      matches = [...matches].sort((a, b) => a.price - b.price);
    }

    if (matches.length > 0) {
      const count = matches.length;
      return {
        text: `Found **${count} menswear styles** matching your budget and sale criteria:\n\n` +
          matches.slice(0, 3).map((p) => `• **${p.title}** — PKR ${formatPKR(p.price)}${p.originalPrice ? ` (was PKR ${formatPKR(p.originalPrice)}, ${p.discountPercent}% off)` : ''}`).join('\n'),
        products: matches.slice(0, 4),
        suggestedActions: [
          'Show Oversized Tees Under PKR 3,000',
          'View Pullover Hoodies',
          'Delivery & COD Policy',
        ],
      };
    }
  }

  // 11. Color & Size Specific Search
  const colorNames = ['black', 'charcoal', 'white', 'chalk', 'indigo', 'sand', 'beige', 'olive', 'pine', 'sage', 'onyx', 'oatmeal'];
  const matchedColor = colorNames.find((c) => query.includes(c));
  const sizesList = ['xs', 's', 'm', 'l', 'xl', 'xxl', '28', '30', '32', '34', '36'];
  const matchedSize = sizesList.find((s) => new RegExp(`\\b${s}\\b`, 'i').test(query));

  if (matchedColor || matchedSize) {
    const filtered = searchCatalog({
      color: matchedColor,
      size: matchedSize,
      query: !matchedColor && !matchedSize ? query : undefined,
    });

    if (filtered.length > 0) {
      return {
        text: `Found **${filtered.length} styles** ${matchedColor ? `in **${matchedColor}**` : ''} ${matchedSize ? `in size **${matchedSize.toUpperCase()}**` : ''}:\n\n` +
          `Browse the matching catalog below:`,
        products: filtered.slice(0, 4),
        suggestedActions: [
          'View Size Guide',
          'Free Delivery Threshold',
          'Shop Hoodies',
        ],
      };
    }
  }

  // 12. Category Search (Tees, Hoodies, Cargos, Jackets, Jeans, Accessories)
  if (query.includes('tee') || query.includes('t-shirt') || query.includes('shirt')) {
    const tees = searchCatalog({ category: 'tees' });
    return {
      text: `We have **${tees.length} heavyweight graphic & minimal tees** engineered from 280 GSM combed cotton:`,
      products: tees.slice(0, 4),
      suggestedActions: [
        'Fabric Details of Boxy Tee',
        'Find Black Tees',
        'Hoodies & Sweatshirts',
      ],
    };
  }

  if (query.includes('hoodie') || query.includes('sweatshirt') || query.includes('fleece')) {
    const hoodies = searchCatalog({ category: 'hoodies' });
    return {
      text: `Here are our **420 GSM French Terry Pullover Hoodies & Sweatshirts** built for substantial drape and cold weather:`,
      products: hoodies.slice(0, 4),
      suggestedActions: [
        'Fabric & GSM of Pullover Hoodie',
        'Tactical Cargo Pants',
        'Reviews for French Terry Hoodie',
      ],
    };
  }

  if (query.includes('cargo') || query.includes('pant') || query.includes('parachute') || query.includes('trouser')) {
    const cargos = searchCatalog({ category: 'cargos' });
    return {
      text: `Explore our **Tactical Parachute & Relaxed Cargos** featuring ripstop fabrics, deep storage pockets, and adjustable ankle drawcords:`,
      products: cargos.slice(0, 4),
      suggestedActions: [
        'Check Cargo Fit & Waist Sizes',
        'Pair with Oversized Tee',
        'Delivery & COD Rules',
      ],
    };
  }

  if (query.includes('jacket') || query.includes('outerwear') || query.includes('denim')) {
    const jackets = searchCatalog({ category: 'jackets' });
    return {
      text: `Check out our **Outerwear & 14.5 oz Selvedge Raw Denim Jackets** crafted for urban layering:`,
      products: jackets.slice(0, 4),
      suggestedActions: [
        'Selvedge Denim Weight & Rigidity',
        'Layering with Hoodies',
        'Exchange Policy',
      ],
    };
  }

  if (query.includes('accessory') || query.includes('accessories') || query.includes('bag') || query.includes('cap')) {
    const acc = searchCatalog({ category: 'accessories' });
    return {
      text: `Complete your streetwear look with our **Cordura Crossbody Bags** and **Structured Dad Caps**:`,
      products: acc.slice(0, 4),
      suggestedActions: [
        'View Oversized Hoodies',
        'Free Shipping Threshold',
        'WhatsApp Support',
      ],
    };
  }

  // 13. General / Keyword Search Fallback across Catalog
  const generalMatches = searchCatalog({ query });
  if (generalMatches.length > 0) {
    return {
      text: `Found **${generalMatches.length} styles** matching "${rawQuery}":`,
      products: generalMatches.slice(0, 4),
      suggestedActions: [
        'View Size Guide',
        'Delivery Timelines',
        'Connect with Customer Care',
      ],
    };
  }

  // 14. Friendly Fallback with Smart Guidance
  return {
    text: `I couldn't find an exact match for "${rawQuery}" in our current catalog or published policies.\n\n` +
      `You can ask me about:\n` +
      `• **Specific products** (e.g. "Show me black hoodies", "Boxy graphic tees under PKR 3,000")\n` +
      `• **Fabric specifications & sizing** (e.g. "What fabric is the cargo pant made of?", "What is 420 GSM French Terry?")\n` +
      `• **Nationwide delivery & COD** (e.g. "How long does shipping take to Lahore?", "What are delivery charges?")\n` +
      `• **14-day exchanges & store outlets** in Karachi, Lahore, and Islamabad\n` +
      `• Or connect directly with our human support desk on WhatsApp.`,
    suggestedActions: [
      'Show Oversized Tees',
      'Heavyweight Hoodies',
      'Delivery & Shipping Rates',
      '14-Day Exchange Policy',
      'WhatsApp Support Desk',
    ],
    customerCareDraft: {
      query: `Hello URBN Care! I have an inquiry about: "${rawQuery}".`,
    },
  };
}
