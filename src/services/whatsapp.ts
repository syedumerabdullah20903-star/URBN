/**
 * WhatsApp Order Service
 * Handles formatting, encoding, link construction, and fallback copy for WhatsApp Checkout.
 */

import { CartItem, CustomerInfo } from '../types';

// Default business number if env is not configured
const DEFAULT_BUSINESS_NUMBER = '923111398618';
export const BUSINESS_OWNER_NAME = 'Syed Umer Abdullah';
export const DISPLAY_WHATSAPP_NUMBER = '+92 311 1398618';
export const LOCAL_WHATSAPP_NUMBER = '0311-1398618';

/**
 * Sanitizes phone number to strict international digits with no '+', '-', ' ' or parentheses.
 */
export function sanitizeWhatsAppNumber(num: string | undefined): string {
  if (!num) return DEFAULT_BUSINESS_NUMBER;
  const digits = num.replace(/\D/g, '');
  // If user entered Pakistani local 03111398618, normalize to 923111398618
  if (digits.startsWith('0') && digits.length === 11) {
    return '92' + digits.slice(1);
  }
  return digits || DEFAULT_BUSINESS_NUMBER;
}

export function getConfiguredBusinessNumber(): string {
  const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  return sanitizeWhatsAppNumber(envNumber || DEFAULT_BUSINESS_NUMBER);
}

/**
 * Generates an uppercase alphanumeric order reference
 * Example: ORD-26F8B91C
 */
export function generateOrderReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${randomPart}`;
}

export interface FormatOrderParams {
  orderReference: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

/**
 * Formats monetary value in Pakistani Rupees
 */
export function formatPKR(amount: number): string {
  return amount.toLocaleString('en-PK');
}

/**
 * Generates the clean formatted order message matching exact specification
 */
export function formatWhatsAppOrderMessage(params: FormatOrderParams): string {
  const { orderReference, customer, items, subtotal, discount, shipping, total } = params;

  const itemLines = items.map((item, idx) => {
    const lineTotal = item.price * item.quantity;
    return `${idx + 1}. ${item.title}
   SKU: ${item.sku}
   Size: ${item.selectedSize}
   Color: ${item.selectedColor}
   Quantity: ${item.quantity}
   Unit Price: PKR ${formatPKR(item.price)}
   Line Total: PKR ${formatPKR(lineTotal)}`;
  }).join('\n\n');

  const emailLine = customer.email ? `\nEmail: ${customer.email}` : '';
  const notesLine = customer.notes ? `\nCustomer Notes: ${customer.notes}` : '';
  const paymentMethodLabel = customer.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer / EasyPaisa';

  return `NEW CUSTOMER ORDER — URBN MEN
Attention: Syed Umer Abdullah

Order Reference: ${orderReference}

CUSTOMER DETAILS
Name: ${customer.fullName}
Phone: ${customer.phone}${emailLine}
City: ${customer.city}
Delivery Address: ${customer.address}${customer.postalCode ? ' (' + customer.postalCode + ')' : ''}

ORDER ITEMS
${itemLines}

Subtotal: PKR ${formatPKR(subtotal)}
Discount: PKR ${formatPKR(discount)}
Delivery: PKR ${formatPKR(shipping)}
TOTAL: PKR ${formatPKR(total)}

Payment Method: ${paymentMethodLabel}${notesLine}

Please confirm product availability and delivery details.`;
}

/**
 * Creates the official wa.me direct chat URL
 */
export function createWhatsAppUrl(message: string, businessNumber?: string): string {
  const number = sanitizeWhatsAppNumber(businessNumber || getConfiguredBusinessNumber());
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Copies text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback using textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.warn('Failed to copy to clipboard', err);
    return false;
  }
}
