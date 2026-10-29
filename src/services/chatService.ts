/**
 * Client Chat Service
 * Handles communication with full-stack /api/chat endpoint with automatic
 * resilient fallback to the local Knowledge Engine.
 */

import { ChatMessage, Product } from '../types';
import { answerCustomerQuery } from './knowledgeEngine';

export interface SendMessageOptions {
  message: string;
  history: ChatMessage[];
  currentProductId?: string;
  currentCart?: any[];
  recentOrders?: any[];
}

export async function sendMessageToChatbot(options: SendMessageOptions): Promise<{
  text: string;
  products?: Product[];
  suggestedActions?: string[];
  customerCareDraft?: { query: string; orderRef?: string };
}> {
  const { message, history, currentProductId, currentCart, recentOrders } = options;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        currentProductId,
        currentCart,
        orderRef: recentOrders?.[0]?.orderReference,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.text === 'string') {
        return {
          text: data.text,
          products: data.products,
          suggestedActions: data.suggestedActions,
          customerCareDraft: data.customerCareDraft,
        };
      }
    }
  } catch (netErr) {
    console.info('[URBN Chatbot] Backend proxy unreachable, using local Knowledge Engine fallback.');
  }

  // Graceful Local Knowledge Engine fallback
  const localAnswer = answerCustomerQuery(message, {
    currentProductId,
    currentCart,
    recentOrders,
  });

  return localAnswer;
}
