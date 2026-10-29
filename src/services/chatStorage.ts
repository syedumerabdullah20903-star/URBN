/**
 * LocalStorage Service for AI Chatbot Conversation History
 * Stores user and assistant messages with timestamps and embedded suggestions.
 * Fully private, browser-specific, and respects user clearance.
 */

import { ChatMessage } from '../types';

const CHAT_STORAGE_KEY = 'urbn_chat_history_v1';
const MAX_STORED_MESSAGES = 50;

function isStorageAvailable(): boolean {
  try {
    const testKey = '__urbn_chat_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const chatStorageService = {
  getHistory(): ChatMessage[] {
    if (!isStorageAvailable()) return [];
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(-MAX_STORED_MESSAGES);
      }
      return [];
    } catch (err) {
      console.warn('[URBN Chat Storage] Failed to load chat history', err);
      return [];
    }
  },

  saveHistory(messages: ChatMessage[]): void {
    if (!isStorageAvailable()) return;
    try {
      const trimmed = messages.slice(-MAX_STORED_MESSAGES);
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('[URBN Chat Storage] Failed to save chat history', err);
    }
  },

  clearHistory(): void {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (err) {
      console.warn('[URBN Chat Storage] Failed to clear chat history', err);
    }
  },
};
