/**
 * Main Content Script for Markdown Reader
 * Parses and renders markdown files with enhanced styling
 * Includes file tree for directory browsing on file:// protocol
 */

// ============================================================================
// Constants
// ============================================================================

const PREFIX = 'mdr';
const CLASSES = {
  BRAND: PREFIX,
  PRE: `${PREFIX}-pre`,
  ROOT: `${PREFIX}-root`,
  BUTTON: `${PREFIX}-button`,
  ANCHOR: `${PREFIX}-anchor`,
  STATIC: `${PREFIX}-static`,
  CONTENT: `${PREFIX}-content`,
  CODE_BLOCK: `${PREFIX}-code-block`,
  COPY_BTN: `${PREFIX}-block__copy-btn`,
  GALLERY: `${PREFIX}-gallery`,
  SIDE: `${PREFIX}-side`,
  SIDE_HEAD: `${PREFIX}-side__head`,
  SIDE_CONTENT: `${PREFIX}-side__content`,
  SIDE_TOGGLE: `${PREFIX}-side__toggle`,
  FOLDER: `${PREFIX}-folder`,
  FILE_ITEM: `${PREFIX}-file-item`,
  FILE_TREE: `${PREFIX}-file-tree`
};

const STORAGE_KEYS = {
  THEME: 'mdrTheme',
  CODE_BLOCK_THEME: 'mdrCodeBlockTheme',
  THEME_SWITCHING: 'mdrThemeSwitching',
  TEXT_FONT: 'mdrTextFont',
  CENTERED_MODE: 'centeredMode',
  SIDE_PANEL: 'sidePanel',
  AUTO_REFRESH: 'autoRefresh',
  EXPANDED_FOLDERS: 'mdrExpandedFolders'
};

const THEME_OPTIONS = ['auto', 'light', 'dark'];

const MD_EXTENSIONS = ['.md', '.mdx', '.mdc', '.mkd', '.txt', '.markdown'];

// SVG Icons
const ICONS = {
  chevronDown: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  folder: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  folderOpen: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  markdown: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41zM6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.89v6.38h1.92zm10.91-1.77c.63 0 1.14-.28 1.14-.63v-.01c0-.35-.51-.63-1.14-.63H15.5c-.63 0-1.14.28-1.14.63v.01c0 .35.51.63 1.14.63h2.22z"/></svg>',
  panelLeft: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
};

// ============================================================================
// Types
// ============================================================================

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  isMarkdown: boolean;
  expanded: boolean;
  children: TreeNode[];
  loaded: boolean;
  hidden: boolean;
}

// ============================================================================
// State
// ============================================================================

let sideCollapsed = false;
let centeredMode = false;
let refreshEnabled = true;
let expandedFolders: Set<string> = new Set();

// ============================================================================
// Utility Functions
// ============================================================================

function isFileProtocol(): boolean {
  return window.location.protocol === 'file:';
}

function isMarkdownFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return MD_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

function getCurrentFilePath(): string {
  return decodeURIComponent(window.location.pathname);
}

function getCurrentDirPath(): string {
  const path = getCurrentFilePath();
  // If it's a file, get parent directory; if it's a directory, use as-is
  if (path.endsWith('/')) {
    return path;
  }
  return getParentPath(path) + '/';
}

function pathToFileUrl(path: string): string {
  // Convert a filesystem path to a file:// URL
  // Make sure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return 'file://' + path;
}

// ============================================================================
// Directory Listing Parser
// ============================================================================

// Supported file extensions for filtering
const SUPPORTED_EXTENSIONS = ['.md', '.mdx', '.mdc', '.mkd', '.txt', '.markdown'];

class DirectoryParser {
  /**
   * Parse Chrome's directory listing HTML (for file:// protocol)
   * Chrome uses addRow() JavaScript calls in its directory listing
   */
  parseDirectoryListing(html: string, basePath: string): TreeNode[] {
    const nodes: TreeNode[] = [];

    // Chrome's directory listing format uses addRow() calls:
    // addRow("name", "path", isFolder, size, "sizeUnit", timestamp, "date")
    const addRowRegex = /addRow\("(.*?)",\s*"(.*?)",\s*(\d+),\s*(\d+),\s*"([\d.]+ [BkMG]B?)",\s*(\d+),\s*"(.*?)"\);/g;

    let match;
    while ((match = addRowRegex.exec(html)) !== null) {
      const name = match[1];
      const relativePath = match[2];
      const isFolder = !!Number.parseInt(match[3]);

      // Skip parent directory
      if (name === '..') continue;

      // For files, filter by supported extensions
      if (!isFolder) {
        const lowerName = name.toLowerCase();
        if (!SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
          continue;
        }
      }

      // Build full path
      let fullPath = basePath;
      if (!fullPath.endsWith('/')) {
        fullPath += '/';
      }
      // Use the relativePath from addRow which is already properly encoded
      fullPath += relativePath;

      // Check if it's hidden (starts with .)
      const hidden = name.startsWith('.');

      nodes.push({
        name,
        path: fullPath,
        isFolder,
        isMarkdown: !isFolder && isMarkdownFile(name),
        expanded: false,
        children: [],
        loaded: false,
        hidden
      });
    }

    // Fallback: Try parsing anchor tags (Firefox/other browsers)
    if (nodes.length === 0) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('a[href]');

      for (const link of links) {
        const href = link.getAttribute('href') || '';
        let name = link.textContent?.trim() || href;

        // Skip parent directory links and empty entries
        if (!name || name === '.' || name === '..' || name === '../' || href === '../') {
          continue;
        }

        // Skip absolute URLs (not directory entries)
        if (href.startsWith('http://') || href.startsWith('https://')) {
          continue;
        }

        // Determine if it's a folder
        const isFolder = href.endsWith('/') || name.endsWith('/');
        name = name.replace(/\/$/, '');

        // For files, filter by supported extensions
        if (!isFolder) {
          const lowerName = name.toLowerCase();
          if (!SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
            continue;
          }
        }

        // Build full path
        let fullPath = basePath;
        if (!fullPath.endsWith('/')) {
          fullPath += '/';
        }
        fullPath += encodeURIComponent(name);
        if (isFolder) {
          fullPath += '/';
        }

        const hidden = name.startsWith('.');

        nodes.push({
          name,
          path: fullPath,
          isFolder,
          isMarkdown: !isFolder && isMarkdownFile(name),
          expanded: false,
          children: [],
          loaded: false,
          hidden
        });
      }
    }

    // Sort: folders first, then files, alphabetically
    nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return nodes;
  }
}

// ============================================================================
// Directory Loader
// ============================================================================

class DirectoryLoader {
  private parser: DirectoryParser;
  private cache: Map<string, TreeNode[]> = new Map();

  constructor() {
    this.parser = new DirectoryParser();
  }

  async loadDirectory(path: string): Promise<TreeNode[]> {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // Only works for file:// protocol
    if (!isFileProtocol()) {
      return [];
    }

    try {
      // Convert path to file:// URL if needed
      let url = path;
      if (!url.startsWith('file://')) {
        url = pathToFileUrl(path);
      }

      // Ensure directory path ends with /
      if (!url.endsWith('/')) {
        url += '/';
      }

      console.log('[MDR] Loading directory via background script:', url);

      // Use background script to fetch (bypasses CORS restrictions)
      const html = await this.fetchViaBackground(url);
      if (!html) {
        console.warn(`[MDR] Failed to load directory: ${url}`);
        return [];
      }

      console.log('[MDR] Directory HTML loaded, length:', html.length);
      console.log('[MDR] HTML preview:', html.substring(0, 500));

      const nodes = this.parser.parseDirectoryListing(html, url);
      console.log('[MDR] Parsed', nodes.length, 'nodes from directory');

      // Cache the results
      this.cache.set(path, nodes);

      return nodes;
    } catch (error) {
      console.error('[MDR] Error loading directory:', error);
      return [];
    }
  }

  private fetchViaBackground(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      // Send message to background script to fetch the URL
      chrome.runtime.sendMessage(
        { type: 'bg-fetch', url },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[MDR] Background fetch error:', chrome.runtime.lastError);
            resolve(null);
            return;
          }

          if (response?.success && response.data) {
            resolve(response.data);
          } else {
            console.error('[MDR] Background fetch failed:', response?.error);
            resolve(null);
          }
        }
      );
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Theme Management
// ============================================================================

class ThemeManager {
  private currentTheme: string = 'auto';
  private codeBlockTheme: string = 'auto';

  constructor() {
    this.loadTheme();
  }

  async loadTheme(): Promise<void> {
    const result = await new Promise<{ [key: string]: string }>((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.THEME_SWITCHING, STORAGE_KEYS.CODE_BLOCK_THEME], resolve);
    });

    this.currentTheme = result[STORAGE_KEYS.THEME_SWITCHING] || 'auto';
    this.codeBlockTheme = result[STORAGE_KEYS.CODE_BLOCK_THEME] || 'auto';
    this.applyTheme();
  }

  applyTheme(): void {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');

    // Apply theme
    if (this.currentTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${this.currentTheme}`);
    }

    // Update data attributes
    root.setAttribute('data-mdr-theme', this.currentTheme);
    root.setAttribute('data-mdr-code-block-theme', this.codeBlockTheme);
  }

  toggleTheme(): void {
    const currentIndex = THEME_OPTIONS.indexOf(this.currentTheme);
    this.currentTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];

    chrome.storage.local.set({ [STORAGE_KEYS.THEME_SWITCHING]: this.currentTheme });
    this.applyTheme();
  }

  setTheme(theme: string): void {
    if (THEME_OPTIONS.includes(theme)) {
      this.currentTheme = theme;
      chrome.storage.local.set({ [STORAGE_KEYS.THEME_SWITCHING]: theme });
      this.applyTheme();
    }
  }

  setCodeBlockTheme(theme: string): void {
    this.codeBlockTheme = theme;
    chrome.storage.local.set({ [STORAGE_KEYS.CODE_BLOCK_THEME]: theme });
    this.applyTheme();
  }
}

// ============================================================================
// Image Gallery/Lightbox
// ============================================================================

class ImageGallery {
  private gallery: HTMLElement | null = null;
  private currentIndex: number = 0;
  private images: HTMLImageElement[] = [];

  init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupGallery());
    } else {
      this.setupGallery();
    }
  }

  private setupGallery(): void {
    // Find all images in mdr-content
    setTimeout(() => {
      const content = document.querySelector(`.${CLASSES.CONTENT}, .${CLASSES.ROOT}`);
      if (!content) return;

      this.images = Array.from(content.querySelectorAll('img'));
      if (this.images.length === 0) return;

      // Add click handlers to images
      this.images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
          e.preventDefault();
          this.openGallery(index);
        });
      });

      // Setup keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.gallery) return;
        if (e.key === 'Escape') this.closeGallery();
        if (e.key === 'ArrowLeft') this.prevImage();
        if (e.key === 'ArrowRight') this.nextImage();
      });
    }, 500);
  }

  private openGallery(index: number): void {
    this.currentIndex = index;
    this.createGallery();
  }

  private createGallery(): void {
    this.closeGallery();

    this.gallery = document.createElement('div');
    this.gallery.className = CLASSES.GALLERY;

    const img = this.images[this.currentIndex];
    if (!img) return;

    this.gallery.innerHTML = `
      <div class="${CLASSES.GALLERY}__content">
        <button class="${CLASSES.GALLERY}__close" aria-label="Close gallery">&times;</button>
        <img src="${img.src}" alt="${img.alt || ''}" />
        <div class="${CLASSES.GALLERY}__thumbnail-list"></div>
      </div>
    `;

    document.body.appendChild(this.gallery);

    const closeBtn = this.gallery.querySelector(`.${CLASSES.GALLERY}__close`);
    closeBtn?.addEventListener('click', () => this.closeGallery());

    this.gallery.addEventListener('click', (e) => {
      if (e.target === this.gallery) this.closeGallery();
    });

    this.updateThumbnails();
  }

  private updateThumbnails(): void {
    const thumbnailList = this.gallery?.querySelector(`.${CLASSES.GALLERY}__thumbnail-list`);
    if (!thumbnailList) return;

    thumbnailList.innerHTML = '';

    this.images.forEach((img, index) => {
      const thumb = document.createElement('img');
      thumb.className = `${CLASSES.GALLERY}__thumbnail`;
      thumb.src = img.src;
      thumb.alt = img.alt || '';
      if (index === this.currentIndex) thumb.classList.add('active');

      thumb.addEventListener('click', () => {
        this.currentIndex = index;
        this.updateMainImage();
        this.updateThumbnails();
      });

      thumbnailList.appendChild(thumb);
    });
  }

  private updateMainImage(): void {
    const mainImg = this.gallery?.querySelector(`.${CLASSES.GALLERY}__content img`);
    if (mainImg && this.images[this.currentIndex]) {
      mainImg.setAttribute('src', this.images[this.currentIndex].src);
      mainImg.setAttribute('alt', this.images[this.currentIndex].alt || '');
    }
  }

  private nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateMainImage();
    this.updateThumbnails();
  }

  private prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateMainImage();
    this.updateThumbnails();
  }

  private closeGallery(): void {
    if (this.gallery) {
      this.gallery.remove();
      this.gallery = null;
    }
  }
}

// ============================================================================
// Markdown Renderer
// ============================================================================

class MarkdownRenderer {
  private element: HTMLElement;
  private imageGallery: ImageGallery;

  constructor(element: HTMLElement, imageGallery: ImageGallery) {
    this.element = element;
    this.imageGallery = imageGallery;
  }

  render(): void {
    const content = this.element.textContent || '';
    const html = this.parseMarkdown(content);

    const wrapper = document.createElement('div');
    wrapper.className = CLASSES.CONTENT;
    wrapper.innerHTML = html;

    // Clear body and add content wrapper
    // Side panel will be created AFTER this by init()
    this.element.innerHTML = '';
    this.element.appendChild(wrapper);

    document.documentElement.setAttribute('mdr-loaded', '');

    this.postRender(wrapper);
    this.imageGallery.init();
  }

  private parseMarkdown(markdown: string): string {
    let html = markdown;

    // Escape HTML first
    html = html.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks with language
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="${CLASSES.CODE_BLOCK}"><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Unordered lists
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Paragraphs
    html = html.replace(/^(?!<[a-z/])(.+)$/gm, '<p>$1</p>');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    // Clean up nested lists
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/<\/ol>\s*<ol>/g, '');

    return html;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private postRender(wrapper: HTMLElement): void {
    // Add copy buttons to code blocks
    const codeBlocks = wrapper.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const pre = block.parentElement as HTMLElement;
      if (!pre) return;

      const button = document.createElement('button');
      button.className = `${CLASSES.BUTTON} ${CLASSES.COPY_BTN}`;
      button.innerHTML = '<span class="btn-icon icon-copy">Copy</span><span class="btn-icon icon-success">✓</span>';
      button.setAttribute('aria-label', 'Copy code to clipboard');

      button.addEventListener('click', async () => {
        const code = block.textContent || '';
        try {
          await navigator.clipboard.writeText(code);
          button.classList.add('copied');
          setTimeout(() => button.classList.remove('copied'), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });

      pre.appendChild(button);
    });

    // Add anchor links to headers
    const headers = wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach((header, index) => {
      const id = `heading-${index}`;
      header.id = id;

      const anchor = document.createElement('a');
      anchor.className = CLASSES.ANCHOR;
      anchor.href = `#${id}`;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', 'Link to this section');
      header.appendChild(anchor);
    });

    // Process task lists
    const taskListItems = wrapper.querySelectorAll('li');
    taskListItems.forEach((li) => {
      const text = li.textContent || '';
      if (/^\[([ x])\]/.test(text)) {
        li.classList.add('task-list-item');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = /\[x\]/.test(text);
        checkbox.disabled = true;
        li.prepend(' ');
        li.prepend(checkbox);
      }
    });
  }
}

// ============================================================================
// Side Panel (Folder/File Tree)
// ============================================================================

class SidePanel {
  private panel: HTMLElement | null = null;
  private contentArea: HTMLElement | null = null;
  private isCollapsed: boolean = false;
  private loader: DirectoryLoader;
  private rootNodes: TreeNode[] = [];
  private currentPath: string = '';
  private showHiddenFiles: boolean = false;
  private searchQuery: string = '';

  constructor() {
    this.loader = new DirectoryLoader();
    this.currentPath = getCurrentFilePath();
    this.create();
  }

  private create(): void {
    // Check if side panel already exists
    this.panel = document.querySelector(`.${CLASSES.SIDE}`);

    if (!this.panel) {
      this.panel = document.createElement('aside');
      this.panel.className = CLASSES.SIDE;
      // Apply inline styles to ensure visibility (CSS may not be loaded yet)
      this.panel.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 250px;
        background: var(--bg-card, #ffffff);
        border-right: 1px solid var(--border-color, #e0e0e0);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      `;
      document.body.prepend(this.panel);
    }

    this.buildPanelStructure();
    this.loadFileTree();
  }

  private buildPanelStructure(): void {
    if (!this.panel) return;

    // Header with title and toggle button
    const header = document.createElement('div');
    header.className = CLASSES.SIDE_HEAD;
    header.innerHTML = `
      <div class="mdr-side__title-wrapper">
        <span class="mdr-side__icon">${ICONS.panelLeft}</span>
        <span class="mdr-side__title">Files</span>
      </div>
      <button class="${CLASSES.SIDE_TOGGLE}" aria-label="Collapse side panel">
        ${ICONS.chevronRight}
      </button>
    `;

    // Search bar
    const search = document.createElement('div');
    search.className = 'mdr-side__search';
    search.innerHTML = `
      <div class="mdr-side__search-wrapper">
        <span class="mdr-side__search-icon">${ICONS.search}</span>
        <input type="text" placeholder="Search files..." aria-label="Search files" />
      </div>
    `;

    // Content area for file tree
    this.contentArea = document.createElement('div');
    this.contentArea.className = CLASSES.SIDE_CONTENT;

    // Loading indicator
    this.contentArea.innerHTML = `
      <div class="mdr-side__loading">Loading files...</div>
    `;

    this.panel.innerHTML = '';
    this.panel.appendChild(header);
    this.panel.appendChild(search);
    this.panel.appendChild(this.contentArea);

    // Setup event listeners
    const toggleBtn = header.querySelector(`.${CLASSES.SIDE_TOGGLE}`);
    toggleBtn?.addEventListener('click', () => this.toggle());

    const searchInput = search.querySelector('input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.renderTree();
    });
  }

  private async loadFileTree(): Promise<void> {
    if (!isFileProtocol()) {
      // For non-file protocol, just show current file
      this.showCurrentFileOnly();
      return;
    }

    // Load expanded folders from storage
    await this.loadExpandedFolders();

    // Get parent directory of current file
    const currentDir = getCurrentDirPath();

    try {
      this.rootNodes = await this.loader.loadDirectory(currentDir);

      // Mark current file as active
      this.markCurrentFile();

      // Auto-expand to current file
      await this.expandToCurrentFile();

      this.renderTree();
    } catch (error) {
      console.error('[MDR] Failed to load file tree:', error);
      this.showError('Failed to load directory');
    }
  }

  private showCurrentFileOnly(): void {
    if (!this.contentArea) return;

    const fileName = getCurrentFilePath().split('/').pop() || 'README.md';

    this.contentArea.innerHTML = `
      <div class="${CLASSES.FILE_TREE}">
        <div class="${CLASSES.FILE_ITEM} active" data-path="${getCurrentFilePath()}">
          <span class="file-icon">${isMarkdownFile(fileName) ? ICONS.markdown : ICONS.file}</span>
          <span class="file-name">${fileName}</span>
        </div>
      </div>
    `;
  }

  private showError(message: string): void {
    if (!this.contentArea) return;

    this.contentArea.innerHTML = `
      <div class="mdr-side__error">
        <p>${message}</p>
        <button class="mdr-side__retry-btn">Retry</button>
      </div>
    `;

    const retryBtn = this.contentArea.querySelector('.mdr-side__retry-btn');
    retryBtn?.addEventListener('click', () => {
      this.loader.clearCache();
      this.loadFileTree();
    });
  }

  private markCurrentFile(): void {
    const currentPath = getCurrentFilePath();

    const markRecursive = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        // Remove trailing slash for comparison
        const nodePath = node.path.replace(/\/$/, '');
        const comparePath = currentPath.replace(/\/$/, '');

        if (decodeURIComponent(nodePath) === comparePath) {
          // Found current file
          return true;
        }

        if (node.children.length > 0) {
          markRecursive(node.children);
        }
      }
      return false;
    };

    markRecursive(this.rootNodes);
  }

  private async expandToCurrentFile(): Promise<void> {
    // The current file should be visible, so expand parent folders
    const currentPath = getCurrentFilePath();
    const currentDir = getCurrentDirPath();

    // Expand root level
    for (const node of this.rootNodes) {
      if (expandedFolders.has(node.path)) {
        node.expanded = true;
        if (node.isFolder && !node.loaded) {
          await this.loadChildren(node);
        }
      }
    }
  }

  private async loadChildren(node: TreeNode): Promise<void> {
    if (node.loaded || !node.isFolder) return;

    try {
      node.children = await this.loader.loadDirectory(node.path);
      node.loaded = true;

      // Recursively expand children that were previously expanded
      for (const child of node.children) {
        if (child.isFolder && expandedFolders.has(child.path)) {
          child.expanded = true;
          await this.loadChildren(child);
        }
      }
    } catch (error) {
      console.error(`[MDR] Failed to load children for ${node.path}:`, error);
    }
  }

  private renderTree(): void {
    if (!this.contentArea) return;

    console.log('[MDR] renderTree called, rootNodes:', this.rootNodes.length);
    console.log('[MDR] First few nodes:', this.rootNodes.slice(0, 3).map(n => ({ name: n.name, isFolder: n.isFolder, hidden: n.hidden })));

    const treeContainer = document.createElement('div');
    treeContainer.className = CLASSES.FILE_TREE;

    // Render nodes
    this.renderNodes(this.rootNodes, treeContainer, 0);

    console.log('[MDR] Tree container children:', treeContainer.children.length);

    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(treeContainer);

    // Debug: Check if panel is visible
    console.log('[MDR] Panel element:', this.panel);
    console.log('[MDR] Panel in document:', document.body.contains(this.panel));
    console.log('[MDR] Panel parentNode:', this.panel?.parentNode);
    console.log('[MDR] Panel style.display:', this.panel?.style.display);
    console.log('[MDR] Panel offsetWidth:', this.panel?.offsetWidth);
    console.log('[MDR] Panel offsetHeight:', this.panel?.offsetHeight);
    console.log('[MDR] Panel getBoundingClientRect:', this.panel?.getBoundingClientRect());
    console.log('[MDR] Content area:', this.contentArea);
    console.log('[MDR] Content area innerHTML length:', this.contentArea.innerHTML.length);

    // If no visible nodes (all filtered out), show message
    if (treeContainer.children.length === 0) {
      treeContainer.innerHTML = `
        <div class="mdr-side__empty">
          ${this.searchQuery ? 'No matching files' : 'No files found'}
        </div>
      `;
    }
  }

  private renderNodes(nodes: TreeNode[], container: HTMLElement, depth: number): void {
    const currentPath = getCurrentFilePath();

    for (const node of nodes) {
      // Skip hidden files unless showing them
      if (node.hidden && !this.showHiddenFiles) continue;

      // Apply search filter
      if (this.searchQuery) {
        const matchesSearch = node.name.toLowerCase().includes(this.searchQuery);
        const hasMatchingChildren = this.hasMatchingChildren(node);
        if (!matchesSearch && !hasMatchingChildren) continue;
      }

      const item = document.createElement('div');
      item.className = CLASSES.FILE_ITEM;
      item.setAttribute('data-path', node.path);
      item.setAttribute('data-depth', String(depth));
      item.style.paddingLeft = `${12 + depth * 16}px`;

      // Check if this is the current file
      const nodePath = decodeURIComponent(node.path.replace(/\/$/, ''));
      if (nodePath === currentPath) {
        item.classList.add('active');
      }

      // Build item content
      if (node.isFolder) {
        item.classList.add('is-folder');
        item.innerHTML = `
          <span class="file-chevron">${node.expanded ? ICONS.chevronDown : ICONS.chevronRight}</span>
          <span class="file-icon">${node.expanded ? ICONS.folderOpen : ICONS.folder}</span>
          <span class="file-name">${this.highlightSearch(node.name)}</span>
        `;

        // Click to toggle expand/collapse
        item.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await this.toggleNode(node);
        });
      } else {
        item.innerHTML = `
          <span class="file-chevron"></span>
          <span class="file-icon">${node.isMarkdown ? ICONS.markdown : ICONS.file}</span>
          <span class="file-name">${this.highlightSearch(node.name)}</span>
        `;

        // Click to navigate
        item.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = node.path;
        });
      }

      container.appendChild(item);

      // Render children if expanded
      if (node.isFolder && node.expanded && node.children.length > 0) {
        this.renderNodes(node.children, container, depth + 1);
      }
    }
  }

  private hasMatchingChildren(node: TreeNode): boolean {
    if (!node.isFolder) return false;

    for (const child of node.children) {
      if (child.name.toLowerCase().includes(this.searchQuery)) {
        return true;
      }
      if (this.hasMatchingChildren(child)) {
        return true;
      }
    }
    return false;
  }

  private highlightSearch(text: string): string {
    if (!this.searchQuery) return text;

    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async toggleNode(node: TreeNode): Promise<void> {
    node.expanded = !node.expanded;

    // Load children if expanding and not loaded
    if (node.expanded && !node.loaded) {
      await this.loadChildren(node);
    }

    // Update expanded folders set
    if (node.expanded) {
      expandedFolders.add(node.path);
    } else {
      expandedFolders.delete(node.path);
    }

    // Save state
    this.saveExpandedFolders();

    // Re-render
    this.renderTree();
  }

  private async loadExpandedFolders(): Promise<void> {
    try {
      const result = await new Promise<{ [key: string]: string[] }>((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.EXPANDED_FOLDERS], resolve);
      });

      const folders = result[STORAGE_KEYS.EXPANDED_FOLDERS] || [];
      expandedFolders = new Set(folders);
    } catch (error) {
      expandedFolders = new Set();
    }
  }

  private saveExpandedFolders(): void {
    chrome.storage.local.set({
      [STORAGE_KEYS.EXPANDED_FOLDERS]: Array.from(expandedFolders)
    });
  }

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;

    if (this.panel) {
      this.panel.classList.toggle('left-collapsed', this.isCollapsed);
      document.body.classList.toggle('left-collapsed', this.isCollapsed);

      // Ensure header and toggle button visibility in collapsed state
      const head = this.panel.querySelector(`.${CLASSES.SIDE_HEAD}`) as HTMLElement;
      const toggleBtn = this.panel.querySelector(`.${CLASSES.SIDE_TOGGLE}`) as HTMLElement;

      if (this.isCollapsed) {
        // Collapsed state: show only toggle button
        if (head) {
          head.style.opacity = '1';
          head.style.pointerEvents = 'auto';
        }
        if (toggleBtn) {
          toggleBtn.style.opacity = '1';
          toggleBtn.style.pointerEvents = 'auto';
          toggleBtn.innerHTML = ICONS.chevronRight; // > to expand
        }
      } else {
        // Expanded state: reset inline styles
        if (head) {
          head.style.opacity = '';
          head.style.pointerEvents = '';
        }
        if (toggleBtn) {
          toggleBtn.style.opacity = '';
          toggleBtn.style.pointerEvents = '';
          toggleBtn.innerHTML = ICONS.chevronRight; // > to collapse (will be rotated by CSS)
        }
      }
    }

    // Save state
    chrome.storage.local.set({ [STORAGE_KEYS.SIDE_PANEL]: !this.isCollapsed });
  }

  async loadState(): Promise<void> {
    const result = await new Promise<{ sidePanel?: boolean; sidePanelCollapsed?: boolean }>((resolve) => {
      chrome.storage.local.get(['sidePanel', 'sidePanelCollapsed'], resolve);
    });

    const shouldShow = result.sidePanel !== false;
    if (!shouldShow || result.sidePanelCollapsed) {
      this.isCollapsed = true;
      if (this.panel) {
        this.panel.classList.add('left-collapsed');
        document.body.classList.add('left-collapsed');

        // Ensure header and toggle button visibility in collapsed state
        const head = this.panel.querySelector(`.${CLASSES.SIDE_HEAD}`) as HTMLElement;
        const toggleBtn = this.panel.querySelector(`.${CLASSES.SIDE_TOGGLE}`) as HTMLElement;

        if (head) {
          head.style.opacity = '1';
          head.style.pointerEvents = 'auto';
        }
        if (toggleBtn) {
          toggleBtn.style.opacity = '1';
          toggleBtn.style.pointerEvents = 'auto';
        }
      }
    }
  }
}

// ============================================================================
// Message Handler
// ============================================================================

class MessageHandler {
  constructor(
    private themeManager: ThemeManager,
    private sidePanel: SidePanel
  ) {}

  init(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message['cs-action']) {
        this.handleAction(message['cs-action']);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  private handleAction(data: { action: string; theme?: string }): void {
    switch (data.action) {
      case 'toggleSide':
        this.sidePanel.toggle();
        break;
      case 'toggleCentered':
        this.toggleCentered();
        break;
      case 'toggleRefresh':
        this.toggleRefresh();
        break;
      case 'togglePageTheme':
        if (data.theme) {
          this.themeManager.setTheme(data.theme);
        } else {
          this.themeManager.toggleTheme();
        }
        break;
      case 'setCodeBlockTheme':
        if (data.theme) {
          this.themeManager.setCodeBlockTheme(data.theme);
        }
        break;
    }
  }

  private toggleCentered(): void {
    centeredMode = !centeredMode;
    document.body.classList.toggle('mdr-centered', centeredMode);
    chrome.storage.local.set({ [STORAGE_KEYS.CENTERED_MODE]: centeredMode });
  }

  private toggleRefresh(): void {
    refreshEnabled = !refreshEnabled;
    chrome.storage.local.set({ [STORAGE_KEYS.AUTO_REFRESH]: refreshEnabled });

    if (refreshEnabled) {
      this.setupAutoRefresh();
    }
  }

  private setupAutoRefresh(): void {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mdr-refresh');
      channel.onmessage = () => {
        window.location.reload();
      };
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

async function init(): Promise<void> {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });
  }

  // Initialize managers
  const themeManager = new ThemeManager();
  const imageGallery = new ImageGallery();

  // Render markdown content FIRST (before creating side panel)
  // This clears the body and creates the content wrapper
  const body = document.body;
  const renderer = new MarkdownRenderer(body, imageGallery);
  renderer.render();

  // NOW create side panel (after body has been set up)
  const sidePanel = new SidePanel();
  const messageHandler = new MessageHandler(themeManager, sidePanel);

  // Load saved states
  await sidePanel.loadState();

  // Load centered mode
  const savedState = await new Promise<{ centeredMode?: boolean }>((resolve) => {
    chrome.storage.local.get(['centeredMode'], resolve);
  });
  if (savedState.centeredMode) {
    centeredMode = true;
    document.body.classList.add('mdr-centered');
  }

  // Initialize message handler
  messageHandler.init();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    themeManager.applyTheme();
  });

  console.log('[Markdown Reader] Content script initialized');
}

// Auto-initialize at document_start
init();

export {};
