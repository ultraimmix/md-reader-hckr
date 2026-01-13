# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Chrome/Edge browser extension** (Manifest V3) called "Markdown Reader" that renders markdown files (.md, .mdx, .mdc, .mkd, .txt, .markdown) directly in the browser with enhanced styling.

**Important:** This is a **distribution-only repository** containing pre-compiled/minified code. There is no build system, package.json, or source code - only compiled artifacts in `dist/`.

## Repository Structure

```
manifest.json          # Extension configuration (entry point)
decode_logic.js        # Utility script for decoding
dist/
  background/index.mjs # Service worker - handles commands & messaging
  content/             # Content script - markdown rendering
    index.global.js    # Main content script (minified)
    style.css          # Rendering styles
  popup/index.html     # Extension popup UI
  options/index.html   # Settings page
  assets/              # Compiled CSS, JS, fonts
assets/                # Logo and source fonts
_locales/              # i18n (en, ja, ko, zh_CN, zh_TW, etc.)
```

## Extension Architecture

Three main components communicate via Chrome messaging API:

1. **Service Worker** (`dist/background/index.mjs`): Handles keyboard shortcuts, routes messages to content scripts with actions: `toggleSide`, `toggleCentered`, `toggleRefresh`, `togglePageTheme`, `setCodeBlockTheme`

2. **Content Script** (`dist/content/index.global.js`): Injected into markdown files, parses and renders content, applies themes and layouts

3. **UI Pages** (`dist/popup/`, `dist/options/`): Settings and popup interface

## Keyboard Shortcuts

- `Alt+Shift+C` - Toggle centered layout
- `Alt+Shift+T` - Toggle page theme
- `Alt+Shift+R` - Toggle refresh
- `Alt+Shift+B` - Toggle sidebar

## Development Notes

- All code in `dist/` is minified/obfuscated - no source maps available
- Permissions: `storage`, `tabs`
- Extension key is for Microsoft Edge store
- Storage key `mdrThemeSwitching` controls theme preference

## Loading the Extension

1. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
