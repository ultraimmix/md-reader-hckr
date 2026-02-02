/**
 * Service Worker for Markdown Reader Extension
 * Handles keyboard shortcuts and routes messages to content scripts
 */

// Message action handlers
const actionHandlers = {
  async toggleSide({ sender }: { sender: (tabId: number, message: any) => void }) {
    sender('cs-action', { action: 'toggleSide' });
  },
  async toggleCentered({ sender }: { sender: (tabId: number, message: any) => void }) {
    sender('cs-action', { action: 'toggleCentered' });
  },
  async toggleRefresh({ sender }: { sender: (tabId: number, message: any) => void }) {
    sender('cs-action', { action: 'toggleRefresh' });
  },
  async togglePageTheme({ sender }: { sender: (tabId: number, message: any) => void }) {
    sender('cs-action', { action: 'togglePageTheme' });
  },
  async setCodeBlockTheme({ sender }: { sender: (tabId: number, message: any) => void }) {
    sender('cs-action', { action: 'setCodeBlockTheme' });
  }
};

// Storage keys
const THEME_STORAGE_KEY = 'mdrThemeSwitching';

// Theme options
const THEME_OPTIONS = ['auto', 'light', 'dark'];

// Font size options
const FONT_SIZE_OPTIONS = ['Tiny', 'Small', 'Normal', 'Medium', 'Large', 'Extra Large'];
const FONT_SIZE_VALUES = [12, 14, 16, 18, 20, 24];
const FONT_SIZE_MAP = FONT_SIZE_OPTIONS.reduce((acc, opt, i) => {
  acc[opt] = FONT_SIZE_VALUES[i];
  return acc;
}, {} as Record<string, number>);

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;

  const handler = actionHandlers[command as keyof typeof actionHandlers];
  if (handler) {
    handler({
      sender: (action: string, data: any) => {
        chrome.tabs.sendMessage(tab.id!, { [action]: data });
      }
    });
  }
});

// Handle messages from popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTheme') {
    chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
      sendResponse(result[THEME_STORAGE_KEY] || 'auto');
    });
    return true;
  }

  if (message.action === 'setTheme') {
    chrome.storage.local.set({ [THEME_STORAGE_KEY]: message.theme });
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'toggleTheme') {
    chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
      const currentTheme = result[THEME_STORAGE_KEY] || 'auto';
      const currentIndex = THEME_OPTIONS.indexOf(currentTheme);
      const nextTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: nextTheme });
      sendResponse({ theme: nextTheme });
    });
    return true;
  }
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Markdown Reader] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[Markdown Reader] Extension updated');
  }
});

export {};
