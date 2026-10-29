import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  RotateCcw,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage, Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { sendMessageToChatbot } from '../../services/chatService';
import { chatStorageService } from '../../services/chatStorage';
import { ChatProductCard } from './ChatProductCard';
import { CustomerCareCard } from './CustomerCareCard';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome-01',
  sender: 'assistant',
  text: `Welcome to **URBN·MEN Concierge**! 👋\n\nI am your dedicated AI shopping assistant and customer care guide. How can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedActions: [
    'Show Oversized Tees (280 GSM)',
    'Find Pullover Hoodies',
    'Tactical Cargo Pants',
    'Delivery Rates & Timelines',
    '14-Day Exchange Policy',
    'Track My Order (Local)',
  ],
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  onMinimize,
}) => {
  const {
    selectedProduct,
    cart,
    openProductDetail,
    setIsCartOpen,
    setIsCheckoutOpen,
    setIsOrderHistoryOpen,
    openPolicies,
  } = useStore();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = chatStorageService.getHistory();
    return saved.length > 0 ? saved : [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Save messages to LocalStorage
  useEffect(() => {
    chatStorageService.saveHistory(messages);
  }, [messages]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessageToChatbot({
        message: query,
        history: [...messages, userMsg],
        currentProductId: selectedProduct?.id,
        currentCart: cart,
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: response.products,
        suggestedActions: response.suggestedActions,
        customerCareDraft: response.customerCareDraft,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[Chatbot Error]', err);
      const errorMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a momentary connection issue. You can try again or connect directly with our WhatsApp customer care desk.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Delivery Timelines', '14-Day Exchange Policy', 'Contact WhatsApp Support'],
        customerCareDraft: {
          query: `Hello URBN Support! I have an inquiry: "${query}".`,
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    chatStorageService.clearHistory();
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  const handleActionClick = (actionText: string) => {
    // Check if it's a direct UI navigation trigger
    const lower = actionText.toLowerCase();
    if (lower.includes('my orders') || lower.includes('track my order')) {
      setIsOrderHistoryOpen(true);
    } else if (lower.includes('checkout')) {
      setIsCheckoutOpen(true);
    } else if (lower.includes('cart') || lower.includes('bag')) {
      setIsCartOpen(true);
    } else if (lower.includes('delivery')) {
      openPolicies('delivery');
    } else if (lower.includes('exchange') || lower.includes('return')) {
      openPolicies('returns');
    } else if (lower.includes('store') || lower.includes('location')) {
      openPolicies('stores');
    }

    // Also send query to chat for continuous conversation
    handleSendMessage(actionText);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="URBN Men AI Assistant & Customer Care"
      className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:right-6 sm:left-auto sm:w-[430px] h-[88vh] sm:h-[620px] max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 z-50 flex flex-col overflow-hidden transition-all duration-300"
    >
      {/* Header Bar */}
      <div className="bg-neutral-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider font-display">
                URBN<span className="text-neutral-400 font-light">·</span>MEN CONCIERGE
              </span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-1.5 py-0.2 rounded uppercase">
                AI + Care
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grounded Catalog & 24/7 Store Support</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Minimize chat"
            aria-label="Minimize chat"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Close chat"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Product Context Banner (if user is viewing a product) */}
      {selectedProduct && (
        <div className="bg-neutral-100 border-b border-neutral-200 px-3.5 py-2 flex items-center justify-between text-xs text-neutral-700 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Viewing:
            </span>
            <span className="font-semibold text-neutral-900 truncate">
              {selectedProduct.title}
            </span>
          </div>
          <button
            onClick={() => handleSendMessage(`What fabric is ${selectedProduct.title} made of?`)}
            className="text-[10px] font-bold text-neutral-900 underline underline-offset-2 shrink-0 ml-2 hover:text-black"
          >
            Ask Fabric
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/60 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-neutral-950 text-white rounded-br-xs'
                    : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-bl-xs'
                }`}
              >
                {/* Formatted Text Content */}
                <div className="whitespace-pre-line space-y-1.5">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('\n').map((line, lIdx) => {
                        // Render bold markdown
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <span key={lIdx} className="block">
                            {parts.map((part, partIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={partIdx} className="font-extrabold">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>

                {/* Embedded Product Cards Carousel / Grid */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
                    {msg.products.map((prod) => (
                      <ChatProductCard
                        key={prod.id}
                        product={prod}
                        onViewProduct={(p) => openProductDetail(p)}
                      />
                    ))}
                  </div>
                )}

                {/* Customer Care Handoff Box (WhatsApp Link) */}
                {msg.customerCareDraft && (
                  <CustomerCareCard
                    draftQuery={msg.customerCareDraft.query}
                    orderRef={msg.customerCareDraft.orderRef}
                  />
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-neutral-400 px-1">
                {msg.timestamp}
              </span>

              {/* Follow-up Quick Action Suggestions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleActionClick(action)}
                      className="py-1 px-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-full text-[11px] font-medium transition-colors shadow-2xs hover:border-neutral-400 text-left cursor-pointer"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-2xl w-24 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about products, fabrics, delivery, or sizing..."
            className="flex-1 py-2.5 px-3.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            aria-label="Send message"
            className="p-2.5 bg-neutral-950 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-neutral-400" />
            <span>Encrypted local session. Never enter card details.</span>
          </span>
          <span className="font-mono">PKR Storefront</span>
        </div>
      </div>
    </div>
  );
};
