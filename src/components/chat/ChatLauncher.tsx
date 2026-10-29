import React from 'react';
import { MessageSquare, Sparkles, X } from 'lucide-react';

interface ChatLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({
  isOpen,
  onToggle,
  unreadCount = 0,
}) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 select-none">
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close AI Shopping Assistant' : 'Open AI Shopping Assistant and Customer Care'}
        aria-expanded={isOpen}
        className={`group relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-neutral-900 text-white rotate-90 scale-95'
            : 'bg-neutral-950 text-white hover:bg-black hover:scale-105 ring-2 ring-white/20'
        }`}
      >
        {/* Pulsing Green Online Ring Indicator when closed */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
          </span>
        )}

        {/* Icon toggle */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 -rotate-90 transition-transform" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            </div>
          )}
        </div>

        {/* Text Pill (shown on tablet and desktop when closed) */}
        {!isOpen && (
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider leading-none text-white flex items-center gap-1 font-display">
              URBN Concierge
            </span>
            <span className="text-[10px] text-neutral-400 font-medium leading-tight mt-0.5">
              AI Support & Sizing
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
