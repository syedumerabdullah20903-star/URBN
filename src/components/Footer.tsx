import React, { useState } from 'react';
import { ArrowRight, MessageSquare, Check, ShieldCheck, Truck, RefreshCw, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { getConfiguredBusinessNumber, createWhatsAppUrl } from '../services/whatsapp';

export const Footer: React.FC = () => {
  const { setCurrentCategory, openPolicies, addToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const businessNumber = getConfiguredBusinessNumber();
  const whatsappUrl = createWhatsAppUrl(
    'Hello URBN Team! I would like to get assistance regarding your collections.',
    businessNumber
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    addToast('Subscribed', 'Welcome to the URBN Insider Club. Check your inbox soon!', 'success');
    setEmail('');
  };

  const handleCategoryNav = (cat: ProductCategory) => {
    setCurrentCategory(cat);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 text-xs">
      
      {/* Newsletter Strip */}
      <div className="border-b border-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-display">
              Join The URBN Collective
            </h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Receive private drop alerts, seasonal lookbooks, and insider promotions directly.
            </p>
          </div>

          {/* Subscription Form */}
          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold py-2">
                <Check className="w-4 h-4" />
                <span>Thank you! You are subscribed for new season drop notifications.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full sm:w-72 py-3 px-4 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-l-md text-xs focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="py-3 px-6 bg-white text-black font-bold uppercase tracking-wider rounded-r-md hover:bg-neutral-200 transition-colors shrink-0 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>SUBSCRIBE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="text-2xl font-extrabold uppercase tracking-tighter text-white font-display block">
              URBN<span className="text-neutral-500">·</span>MEN
            </a>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Contemporary Pakistani men's streetwear and urban apparel. Directed by Syed Umer Abdullah. Engineered for urban durability, relaxed boxy silhouettes, and everyday distinction.
            </p>

            <div className="pt-2 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Hotline: +92 311 1398618</span>
              </a>
              <div className="text-[11px] text-neutral-400">
                Direct Inquiries: <span className="text-white font-medium">Syed Umer Abdullah</span> (0311-1398618)
              </div>
            </div>
          </div>

          {/* Col 2: Shop Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Men's Collections
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => handleCategoryNav('tees')} className="hover:text-white transition-colors">
                  Tees & Polos
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('hoodies')} className="hover:text-white transition-colors">
                  Hoodies & Fleece
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('cargos')} className="hover:text-white transition-colors">
                  Cargos & Pants
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('jackets')} className="hover:text-white transition-colors">
                  Jackets & Outerwear
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('jeans')} className="hover:text-white transition-colors">
                  Jeans & Denim
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('accessories')} className="hover:text-white transition-colors">
                  Accessories & Bags
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('sale')} className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                  Sale Archive (Up to 40% Off)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Help & Information
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => openPolicies('delivery')} className="hover:text-white transition-colors">
                  Nationwide Delivery Timelines
                </button>
              </li>
              <li>
                <button onClick={() => openPolicies('returns')} className="hover:text-white transition-colors">
                  14-Day Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicies('terms')} className="hover:text-white transition-colors">
                  Cash on Delivery (COD) Rules
                </button>
              </li>
              <li>
                <button onClick={() => openPolicies('stores')} className="hover:text-white transition-colors">
                  Flagship Store Outlets
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Locations & Payment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Flagship Stores
            </h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li>• Packages Mall & MM Alam Road, Lahore</li>
              <li>• Dolmen Mall Clifton, Karachi</li>
              <li>• The Centaurus Mall, Islamabad</li>
            </ul>

            <div className="pt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                Accepted Payment
              </span>
              <div className="text-[11px] text-neutral-400">
                Cash on Delivery (COD) · Bank Transfer
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} URBN MEN PAKISTAN · Syed Umer Abdullah. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => openPolicies('terms')} className="hover:text-neutral-400 transition-colors">
              Privacy & Data Policy
            </button>
            <span>·</span>
            <button onClick={() => openPolicies('terms')} className="hover:text-neutral-400 transition-colors">
              Terms of Service
            </button>
            <span>·</span>
            <span>LocalStorage-First Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
