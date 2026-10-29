import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { createWhatsAppUrl, copyToClipboard, getConfiguredBusinessNumber } from '../../services/whatsapp';

interface CustomerCareCardProps {
  draftQuery: string;
  orderRef?: string;
}

export const CustomerCareCard: React.FC<CustomerCareCardProps> = ({
  draftQuery,
  orderRef,
}) => {
  const [copied, setCopied] = useState(false);
  const businessNumber = getConfiguredBusinessNumber();

  const formattedMessage = orderRef
    ? `${draftQuery}\n(Order Reference: ${orderRef})`
    : draftQuery;

  const whatsappUrl = createWhatsAppUrl(formattedMessage, businessNumber);

  const handleCopy = async () => {
    const ok = await copyToClipboard(formattedMessage);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-lg p-3 sm:p-3.5 space-y-2.5 text-xs text-neutral-800 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-900 text-[11px]">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Concierge Desk · Syed Umer Abdullah</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
          Live on WhatsApp
        </span>
      </div>

      <p className="text-[11px] text-neutral-600">
        Direct VIP customer care with Syed Umer Abdullah. Active to assist with courier dispatch, custom fittings, order confirmations, or store exchange validation.
      </p>

      {/* Message Preview Box */}
      <div className="bg-white/90 p-2.5 rounded border border-emerald-200 text-neutral-800 font-mono text-[11px] leading-relaxed">
        {formattedMessage}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Chat on WhatsApp</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={handleCopy}
          className="py-2 px-3 border border-neutral-300 hover:bg-white text-neutral-700 font-semibold text-[10px] rounded flex items-center gap-1 transition-colors"
          title="Copy support message"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 pt-0.5">
        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>Syed Umer Abdullah · Hotline: +92 311 1398618 (0311-1398618) · Mon-Sat 10am–10pm</span>
      </div>
    </div>
  );
};
