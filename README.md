# Markdown Reader

A Chrome/Edge browser extension (Manifest V3) that renders markdown files beautifully in the browser.

## Project Structure

```
markdown-reader/
├── src/
│   ├── background/       # Service worker (background script)
│   │   └── index.ts
│   ├── content/          # Content scripts
│   │   ├── index.ts      # Main content script (markdown rendering)
│   │   ├── style.css     # Main styles
│   │   ├── three-column.ts   # Three-column layout
│   │   └── three-column.css  # Three-column styles
│   ├── popup/            # Extension popup UI
│   │   ├── App.vue
│   │   ├── index.ts
│   │   └── index.html
│   └── options/          # Settings page UI
│       ├── App.vue
│       ├── index.ts
│       └── index.html
├── assets/               # Static assets (logo, fonts)
├── _locales/             # Internationalization files
├── manifest.json         # Extension manifest
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite config (background)
├── vite.config.content.ts
├── vite.config.popup.ts
├── vite.config.options.ts
├── uno.config.ts         # UnoCSS configuration
├── tsconfig.json         # TypeScript configuration
└── build.js             # Build script
```

## Features

- **Beautiful Markdown Rendering**: Clean typography with syntax highlighting for code blocks
- **Three-Column Layout**: File tree on the left, content in the middle, outline on the right
- **Theme Support**: Auto, light, and dark themes that respect system preferences
- **Keyboard Shortcuts**:
  - `Alt+Shift+B` - Toggle side panel
  - `Alt+Shift+C` - Toggle centered mode
  - `Alt+Shift+T` - Toggle theme
  - `Alt+Shift+R` - Toggle auto refresh
- **Customizable**: Font size, font family, code block themes

## Development

### Installation

```bash
npm install
```

### Build

```bash
# Build all components
npm run build:all

# Or build individual components
npm run build:background
npm run build:content
npm run build:popup
npm run build:options
```

### Loading the Extension

1. Run `npm run build:all` to build the extension
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` directory

## Tech Stack

- **Vue 3** - UI framework for popup/options
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **UnoCSS** - Utility-first CSS framework
- **Chrome Extension API** - Manifest V3

## Supported File Types

`.md`, `.mdx`, `.mdc`, `.mkd`, `.txt`, `.markdown` (and uppercase variants)

## License

MIT

## Author

Bener
