<template>
  <div class="options-container" :class="{ 'dark': isDark }">
    <header class="options-header">
      <div class="header-content">
        <img src="../../assets/logo.png" alt="Markdown Reader" class="logo">
        <h1>{{ t('ext_name') }}</h1>
        <span class="version">v{{ version }}</span>
      </div>
    </header>

    <main class="options-main">
      <!-- Appearance Settings -->
      <section class="options-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          {{ t('appearance') }}
        </h2>

        <!-- Theme -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('theme') }}</span>
            <span class="setting-description">{{ t('theme_description') }}</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.theme" @change="updateTheme" class="setting-select">
              <option value="auto">{{ t('theme_auto') }}</option>
              <option value="light">{{ t('theme_light') }}</option>
              <option value="dark">{{ t('theme_dark') }}</option>
            </select>
          </div>
        </div>

        <!-- Text Font -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('text_font') }}</span>
            <span class="setting-description">{{ t('text_font_description') }}</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.textFont" @change="updateSettings" class="setting-select">
              <option value="system">{{ t('font_system') }}</option>
              <option value="serif">{{ t('font_serif') }}</option>
              <option value="sans-serif">{{ t('font_sans') }}</option>
            </select>
          </div>
        </div>

        <!-- Font Size -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('font_size') }}</span>
            <span class="setting-description">{{ t('font_size_description') }}</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.fontSize" @change="updateSettings" class="setting-select">
              <option v-for="size in fontSizes" :key="size.value" :value="size.value">
                {{ size.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Code Block Theme -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('code_theme') }}</span>
            <span class="setting-description">{{ t('code_theme_description') }}</span>
          </div>
          <div class="setting-control">
            <select v-model="settings.codeTheme" @change="updateSettings" class="setting-select">
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Layout Settings -->
      <section class="options-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
            <path d="M15 3v18"/>
          </svg>
          {{ t('layout') }}
        </h2>

        <!-- Centered Mode -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('centered_mode') }}</span>
            <span class="setting-description">{{ t('centered_mode_description') }}</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input
                type="checkbox"
                v-model="settings.centeredMode"
                @change="updateSettings"
                class="toggle-input"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('side_panel') }}</span>
            <span class="setting-description">{{ t('side_panel_description') }}</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input
                type="checkbox"
                v-model="settings.sidePanel"
                @change="updateSettings"
                class="toggle-input"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <section class="options-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M2 12h6m6 0h6"/>
            <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
          </svg>
          {{ t('advanced') }}
        </h2>

        <!-- Auto Refresh -->
        <div class="setting-item">
          <div class="setting-label">
            <span>{{ t('auto_refresh') }}</span>
            <span class="setting-description">{{ t('auto_refresh_description') }}</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input
                type="checkbox"
                v-model="settings.autoRefresh"
                @change="updateSettings"
                class="toggle-input"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Keyboard Shortcuts -->
      <section class="options-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/>
            <path d="M9 11l2 2-2 2"/>
            <path d="M13 13v-2"/>
          </svg>
          {{ t('shortcuts') }}
        </h2>

        <div class="shortcuts-list">
          <div class="shortcut-item" v-for="shortcut in shortcuts" :key="shortcut.action">
            <span class="shortcut-name">{{ shortcut.label }}</span>
            <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
          </div>
        </div>

        <button class="btn-secondary" @click="openShortcuts">
          {{ t('configure_shortcuts') }}
        </button>
      </section>

      <!-- About -->
      <section class="options-section">
        <h2 class="section-title">{{ t('about') }}</h2>

        <div class="about-content">
          <p>{{ t('ext_desc') }}</p>
          <div class="about-links">
            <a href="https://md-reader.github.io" target="_blank" class="link">
              {{ t('website') }}
            </a>
            <a href="https://github.com/md-reader" target="_blank" class="link">
              GitHub
            </a>
            <a href="https://chrome.google.com/webstore" target="_blank" class="link">
              Chrome Web Store
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="options-footer">
      <p>{{ t('footer_text') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const version = '3.6.1';
const isDark = ref(false);

const settings = ref({
  theme: 'auto',
  textFont: 'system',
  fontSize: 'Normal',
  codeTheme: 'auto',
  centeredMode: false,
  sidePanel: true,
  autoRefresh: true
});

const fontSizes = [
  { label: 'Tiny (12px)', value: 'Tiny' },
  { label: 'Small (14px)', value: 'Small' },
  { label: 'Normal (16px)', value: 'Normal' },
  { label: 'Medium (18px)', value: 'Medium' },
  { label: 'Large (20px)', value: 'Large' },
  { label: 'Extra Large (24px)', value: 'Extra Large' }
];

const shortcuts = [
  { action: 'toggleCentered', label: 'Toggle centered mode', key: 'Alt+Shift+C' },
  { action: 'togglePageTheme', label: 'Toggle theme', key: 'Alt+Shift+T' },
  { action: 'toggleRefresh', label: 'Toggle auto refresh', key: 'Alt+Shift+R' },
  { action: 'toggleSide', label: 'Toggle side panel', key: 'Alt+Shift+B' }
];

// Internationalization
function t(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

// Load settings
async function loadSettings(): Promise<void> {
  const result = await new Promise<{ [key: string]: any }>((resolve) => {
    chrome.storage.local.get(
      ['mdrThemeSwitching', 'mdrTextFont', 'mdrCodeBlockTheme', 'centeredMode', 'sidePanel', 'autoRefresh'],
      resolve
    );
  });

  settings.value = {
    theme: result.mdrThemeSwitching || 'auto',
    textFont: result.mdrTextFont || 'system',
    fontSize: 'Normal',
    codeTheme: result.mdrCodeBlockTheme || 'auto',
    centeredMode: result.centeredMode || false,
    sidePanel: result.sidePanel !== false,
    autoRefresh: result.autoRefresh !== false
  };

  updateDarkMode();
}

// Update theme
function updateTheme(): void {
  chrome.storage.local.set({ mdrThemeSwitching: settings.value.theme });
  updateDarkMode();
}

// Update all settings
function updateSettings(): void {
  chrome.storage.local.set({
    mdrThemeSwitching: settings.value.theme,
    mdrTextFont: settings.value.textFont,
    mdrCodeBlockTheme: settings.value.codeTheme,
    centeredMode: settings.value.centeredMode,
    sidePanel: settings.value.sidePanel,
    autoRefresh: settings.value.autoRefresh
  });
}

// Update dark mode
function updateDarkMode(): void {
  if (settings.value.theme === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark.value = settings.value.theme === 'dark';
  }
}

// Open shortcuts configuration
function openShortcuts(): void {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
}

onMounted(() => {
  loadSettings();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateDarkMode();
  });
});
</script>

<style scoped>
.options-container {
  min-height: 100vh;
  background: var(--bg-primary, #f5f5f5);
  color: var(--text-primary, #333333);
}

.options-container.dark {
  background: var(--bg-primary-dark, #121212);
  color: var(--text-primary-dark, #e0e0e0);
}

.options-header {
  background: var(--bg-card, #ffffff);
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  padding: 24px;
}

.dark .options-header {
  background: var(--bg-card-dark, #1e1e1e);
  border-bottom-color: var(--border-color-dark, #333333);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.version {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary, #666666);
}

.dark .version {
  color: var(--text-secondary-dark, #999999);
}

.options-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.options-section {
  background: var(--bg-card, #ffffff);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .options-section {
  background: var(--bg-card-dark, #1e1e1e);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
}

.section-title svg {
  width: 24px;
  height: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.dark .setting-item {
  border-bottom-color: var(--border-color-dark, #333333);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label > span:first-child {
  font-weight: 500;
}

.setting-description {
  font-size: 13px;
  color: var(--text-secondary, #666666);
}

.dark .setting-description {
  color: var(--text-secondary-dark, #999999);
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #333333);
  cursor: pointer;
}

.dark .setting-select {
  background: var(--bg-primary-dark, #2a2a2a);
  border-color: var(--border-color-dark, #444444);
  color: var(--text-primary-dark, #e0e0e0);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color, #cccccc);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color, #0066cc);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Shortcuts */
.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.03));
  border-radius: 8px;
}

.dark .shortcut-item {
  background: var(--bg-hover-dark, rgba(255, 255, 255, 0.05));
}

.shortcut-key {
  padding: 4px 8px;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}

.dark .shortcut-key {
  background: var(--bg-primary-dark, #2a2a2a);
  border-color: var(--border-color-dark, #444444);
}

.btn-secondary {
  padding: 10px 16px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary, #333333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .btn-secondary {
  border-color: var(--border-color-dark, #444444);
  color: var(--text-primary-dark, #e0e0e0);
}

.btn-secondary:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
}

.dark .btn-secondary:hover {
  background: var(--bg-hover-dark, rgba(255, 255, 255, 0.05));
}

/* About */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-content p {
  margin: 0;
  color: var(--text-secondary, #666666);
}

.dark .about-content p {
  color: var(--text-secondary-dark, #999999);
}

.about-links {
  display: flex;
  gap: 16px;
}

.link {
  color: var(--primary-color, #0066cc);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* Footer */
.options-footer {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary, #666666);
  font-size: 13px;
}

.dark .options-footer {
  color: var(--text-secondary-dark, #999999);
}

.options-footer p {
  margin: 0;
}
</style>
