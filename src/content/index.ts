/**
 * Main Content Script for Markdown Reader
 * Parses and renders markdown files with enhanced styling
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
  GALLERY: `${PREFIX}-gallery`
};

const STORAGE_KEYS = {
  THEME: 'mdrTheme',
  CODE_BLOCK_THEME: 'mdrCodeBlockTheme',
  THEME_SWITCHING: 'mdrThemeSwitching',
  TEXT_FONT: 'mdrTextFont',
  CENTERED_MODE: 'centeredMode',
  SIDE_PANEL: 'sidePanel',
  AUTO_REFRESH: 'autoRefresh'
};

const THEME_OPTIONS = ['auto', 'light', 'dark'];

const FONT_SIZE_OPTIONS = ['Tiny', 'Small', 'Normal', 'Medium', 'Large', 'Extra Large'];
const FONT_SIZE_VALUES = [12, 14, 16, 18, 20, 24];
const FONT_SIZE_MAP = FONT_SIZE_OPTIONS.reduce((acc, opt, i) => {
  acc[opt] = FONT_SIZE_VALUES[i];
  return acc;
}, {} as Record<string, number>);

// ============================================================================
// State
// ============================================================================

let sideCollapsed = false;
let centeredMode = false;
let refreshEnabled = true;

// ============================================================================
// Utility Functions
// ============================================================================

function logInfo(...args: unknown[]): void {
  console.info(`%c `, 'font-size:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAC8bSURBVHgB7d1PbFzHle/xo0GWJKDZmdqkDZjMMhK1lthaWiIQGQ+xaMCBKUcCnh8SWxRgI8+2/jtRQAGi5AngAeRYNGzAtOcBVgBJWaoprUUpyyEDuGcjevc8oPacOt3VcrvFf03eOrfq1vcD3DRlO3Fs9b31u1XnVIkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFARuyRyq6uru91HzV+7uy6sremuHzrXrl27HguApKzx3BP/M9bWeeY1O5/u2feDYENRBQD/pT/qrl+6a6+/GOx3TkPAD/5zXj/dzdEUAKVzzz19ztXlx+deTXjuFaHzzOO5t47SA4D78tfdx6+kfQPsFVhpuqsh7RujwY0B2Oga8PW5x0uOLQ0DDXf9zT3zGpK5UgKAf9N/x12nhC9/LBru+lwIA0Dh/IvOmLsmhan8WDTddctd13N95pkGAH8TnJN2+kW8Zt31OQkZ2D7/ojMpP85wIl6dINCQjJgEAAb+ZDXddcHdFLMCYEvc867mPt4QZ5hT1JSMnnlBAwADf2U0hSAAbMgP/Pq8mxSkruGu41VfGvgXCUCnvtw14368Jwz+VVBz1033e/qduyYFwDNdz7vvhMG/Kuru0ufdjF/KqaTCZwD8W/9NodClypruOkSxIHLnnndazHxemOqvsqa0ZwMaUjGFzgB0vfXXBFVWk3Y6PidAhrSVz136rLsmDP5VV3PXvSo+7wqZAfBrX/rWXxfkpinMBiAj/q3/miBHuo/AK1V53u14BsBvasFaf75qwmwAMqAvOl1v/chTa7zzL73J29EMgF/v/1aYAkOb9tIeZw9uVA21Teihzzh91t2ShG07ALgbQvtcZwX4qaawJIAKYcofG5h0z7rPJVHbWgJg8McGatKeIuNcByTPL20x+GM9s348TFLfMwB+KuyeABurxBQZ8uWedTrlPynA5g6l2CbYVwDwhQ+PhDV/bF3SU2TIE4M/+qQvPBoCHktCtrwE4Ad/ffNn8Ec/kp4iQ34Y/LENOi5+m1p3wJZnANw/mL75s66L7Upyigx58ZuZnRJgex6759w+ScSWZgB8IQyDP3biWwoDETP/nGPwx07s9SEyCZvOAMRS9Le8vCyLi0uy8vSpLD9ZFjxvcHBQhoZecJ8DMjw80vqMTFNoEUSEYm31637uPV15KisrK4LnDe0Zkj3u2TcwMCAjIyMSgSRmPDcMAP4UJJ36r4kx/eLPzz9w131ZXPonX/x") no-repeat 100%/100px;padding:50px;');
}

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function buildClass(...parts: string[]): string {
  return parts.join('-');
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
    // Remove existing gallery
    this.closeGallery();

    // Create gallery overlay
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

    // Setup event listeners
    const closeBtn = this.gallery.querySelector(`.${CLASSES.GALLERY}__close`);
    closeBtn?.addEventListener('click', () => this.closeGallery());

    this.gallery.addEventListener('click', (e) => {
      if (e.target === this.gallery) this.closeGallery();
    });

    // Create thumbnails
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
    // Get the raw markdown content
    const content = this.element.textContent || '';

    // Basic markdown parsing (in a real implementation, use markdown-it)
    const html = this.parseMarkdown(content);

    // Create a wrapper
    const wrapper = document.createElement('div');
    wrapper.className = CLASSES.CONTENT;
    wrapper.innerHTML = html;

    // Replace the original content
    this.element.innerHTML = '';
    this.element.appendChild(wrapper);

    // Add loaded attribute
    document.documentElement.setAttribute('mdr-loaded', '');

    // Process the rendered content
    this.postRender(wrapper);

    // Initialize image gallery
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
  private isCollapsed: boolean = false;

  constructor() {
    this.create();
  }

  private create(): void {
    // Check if side panel already exists
    this.panel = document.querySelector('.mdr-side');

    if (!this.panel) {
      this.panel = document.createElement('aside');
      this.panel.className = 'mdr-side';
      document.body.prepend(this.panel);
      this.populateContent();
    }

    this.setupToggleButton();
  }

  private populateContent(): void {
    if (!this.panel) return;

    // Get current file path
    const path = window.location.pathname;

    // Create file tree UI
    const header = document.createElement('div');
    header.className = 'mdr-side__head';
    header.innerHTML = `
      <div class="mdr-side__title">Files</div>
      <button class="mdr-side__toggle" aria-label="Toggle side panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
        </svg>
      </button>
    `;

    const search = document.createElement('div');
    search.className = 'mdr-side__search';
    search.innerHTML = `
      <input type="text" placeholder="Search files..." aria-label="Search files" />
    `;

    const content = document.createElement('div');
    content.className = 'mdr-side__content';
    content.innerHTML = `
      <div class="mdr-side__file-tree">
        <div class="file-item" data-path="${path}">
          <span class="file-icon">📄</span>
          <span class="file-name">${path.split('/').pop() || 'README.md'}</span>
        </div>
      </div>
    `;

    this.panel.innerHTML = '';
    this.panel.appendChild(header);
    this.panel.appendChild(search);
    this.panel.appendChild(content);

    // Setup search
    const searchInput = search.querySelector('input');
    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterFiles(query);
    });

    // Setup toggle button
    const toggleBtn = header.querySelector('.mdr-side__toggle');
    toggleBtn?.addEventListener('click', () => this.toggle());
  }

  private filterFiles(query: string): void {
    const fileItems = this.panel?.querySelectorAll('.file-item');
    fileItems?.forEach(item => {
      const name = item.querySelector('.file-name')?.textContent?.toLowerCase() || '';
      (item as HTMLElement).style.display = name.includes(query) ? 'flex' : 'none';
    });
  }

  private setupToggleButton(): void {
    // Toggle button is set up in populateContent
  }

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;

    if (this.panel) {
      this.panel.classList.toggle('left-collapsed', this.isCollapsed);
      document.body.classList.toggle('left-collapsed', this.isCollapsed);
    }

    // Save state
    chrome.storage.local.set({ [STORAGE_KEYS.SIDE_PANEL]: !this.isCollapsed });
  }

  async loadState(): Promise<void> {
    const result = await new Promise<{ sidePanel?: boolean; sidePanelCollapsed?: boolean }>((resolve) => {
      chrome.storage.local.get(['sidePanel', 'sidePanelCollapsed'], resolve);
    });

    const shouldShow = result.sidePanel !== false;
    if (!shouldShow) {
      this.isCollapsed = true;
      if (this.panel) {
        this.panel.classList.add('left-collapsed');
        document.body.classList.add('left-collapsed');
      }
    } else if (result.sidePanelCollapsed) {
      this.isCollapsed = true;
      if (this.panel) {
        this.panel.classList.add('left-collapsed');
        document.body.classList.add('left-collapsed');
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

    // If enabling, set up auto-refresh
    if (refreshEnabled) {
      this.setupAutoRefresh();
    }
  }

  private setupAutoRefresh(): void {
    // Listen for file changes (basic implementation)
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

  // Render markdown content
  const body = document.body;
  const renderer = new MarkdownRenderer(body, imageGallery);
  renderer.render();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    themeManager.applyTheme();
  });

  console.log('[Markdown Reader] Content script initialized');
}

// Auto-initialize at document_start
init();

export {};
