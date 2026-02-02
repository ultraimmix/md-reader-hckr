<template>
  <div class="popup-container" :class="{ 'dark': isDark }">
    <header class="popup-header">
      <h1>{{ t('ext_name') }}</h1>
    </header>

    <main class="popup-main">
      <!-- Theme Toggle -->
      <section class="popup-section">
        <div class="section-title">{{ t('theme') }}</div>
        <div class="theme-options">
          <button
            v-for="theme in themes"
            :key="theme.value"
            :class="{ active: currentTheme === theme.value }"
            @click="setTheme(theme.value)"
            class="theme-btn"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <span>{{ theme.label }}</span>
          </button>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="popup-section">
        <div class="section-title">{{ t('actions') }}</div>
        <div class="action-buttons">
          <button @click="sendAction('toggleSide')" class="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            <span>{{ t('toggle_side') }}</span>
          </button>
          <button @click="sendAction('toggleCentered')" class="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4z"/>
            </svg>
            <span>{{ t('toggle_centered') }}</span>
          </button>
          <button @click="sendAction('toggleRefresh')" class="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>{{ t('toggle_refresh') }}</span>
          </button>
        </div>
      </section>

      <!-- Options Link -->
      <footer class="popup-footer">
        <a href="options.html" target="_blank" class="options-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          {{ t('settings') }}
        </a>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Theme {
  value: string;
  label: string;
  icon: string;
}

const themes: Theme[] = [
  { value: 'auto', label: 'Auto', icon: '🌗' },
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' }
];

const currentTheme = ref('auto');
const isDark = ref(false);

// Internationalization
function t(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

// Load theme
async function loadTheme(): Promise<void> {
  const result = await new Promise<{ [key: string]: string }>((resolve) => {
    chrome.storage.local.get(['mdrThemeSwitching'], resolve);
  });
  currentTheme.value = result.mdrThemeSwitching || 'auto';
  updateDarkMode();
}

// Set theme
function setTheme(theme: string): void {
  currentTheme.value = theme;
  chrome.storage.local.set({ mdrThemeSwitching: theme });
  updateDarkMode();

  // Notify current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        'cs-action': { action: 'togglePageTheme', theme }
      });
    }
  });
}

// Update dark mode
function updateDarkMode(): void {
  if (currentTheme.value === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark.value = currentTheme.value === 'dark';
  }
}

// Send action to content script
function sendAction(action: string): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        'cs-action': { action }
      });
      window.close();
    }
  });
}

onMounted(() => {
  loadTheme();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateDarkMode();
  });
});
</script>

<style scoped>
.popup-container {
  width: 320px;
  min-height: 400px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #333333);
}

.popup-container.dark {
  background: var(--bg-primary-dark, #1a1a1a);
  color: var(--text-primary-dark, #e0e0e0);
}

.popup-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.popup-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.popup-main {
  padding: 16px;
}

.popup-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary, #666666);
  margin-bottom: 12px;
}

.theme-options {
  display: flex;
  gap: 8px;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  border-color: var(--primary-color, #0066cc);
  background: var(--bg-hover, rgba(0, 102, 204, 0.05));
}

.theme-btn.active {
  border-color: var(--primary-color, #0066cc);
  background: var(--bg-active, rgba(0, 102, 204, 0.1));
}

.theme-icon {
  font-size: 24px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
}

.action-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.popup-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.options-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: var(--primary-color, #0066cc);
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.options-link:hover {
  background: var(--bg-hover, rgba(0, 102, 204, 0.1));
}

.options-link svg {
  width: 18px;
  height: 18px;
}
</style>
