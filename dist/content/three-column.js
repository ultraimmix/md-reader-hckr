/**
 * Three-column layout for Markdown Reader
 * Left: Folder navigation | Center: Content | Right: Outline
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'mdr-three-column-state';
  let outlinePanel = null;
  let isInitialized = false;

  // SVG icons
  const ICONS = {
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
    outline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h12"/></svg>'
  };

  // Load saved state (only for right/outline panel)
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { rightCollapsed: false };
    } catch (e) {
      return { rightCollapsed: false };
    }
  }

  // Save state
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save panel state:', e);
    }
  }

  // Create toggle button
  function createToggleButton(direction) {
    const btn = document.createElement('button');
    btn.className = 'panel-toggle-btn';
    btn.setAttribute('aria-label', direction === 'left' ? 'Toggle folder panel' : 'Toggle outline panel');
    btn.innerHTML = direction === 'left' ? ICONS.chevronLeft : ICONS.chevronRight;
    return btn;
  }

  // Extract headings from content
  function extractHeadings() {
    const content = document.querySelector('.mdr-content, .mdr');
    if (!content) return [];

    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const items = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();

      // Ensure heading has an ID for linking
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }

      items.push({
        level,
        text,
        id: heading.id,
        element: heading
      });
    });

    return items;
  }

  // Create outline panel
  function createOutlinePanel() {
    const panel = document.createElement('aside');
    panel.className = 'mdr-outline-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'outline-header';

    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'outline-title';
    titleWrapper.innerHTML = ICONS.outline + '<span>Outline</span>';

    const toggleBtn = createToggleButton('right');
    toggleBtn.addEventListener('click', () => togglePanel('right'));

    header.appendChild(titleWrapper);
    header.appendChild(toggleBtn);

    // Content
    const content = document.createElement('nav');
    content.className = 'outline-content';

    panel.appendChild(header);
    panel.appendChild(content);

    return panel;
  }

  // Update outline content
  function updateOutlineContent() {
    if (!outlinePanel) return;

    const content = outlinePanel.querySelector('.outline-content');
    if (!content) return;

    const headings = extractHeadings();
    content.innerHTML = '';

    if (headings.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 16px; color: var(--text-muted, #888); font-size: 13px;';
      empty.textContent = 'No headings found';
      content.appendChild(empty);
      return;
    }

    headings.forEach(heading => {
      const item = document.createElement('a');
      item.className = 'outline-item';
      item.setAttribute('data-level', heading.level);
      item.href = '#' + heading.id;
      item.textContent = heading.text;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        heading.element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update active state
        content.querySelectorAll('.outline-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
      });

      content.appendChild(item);
    });
  }

  // Hide the folder/outline tab switcher in left panel
  function hideTabSwitcher() {
    const sideHead = document.querySelector('.mdr-side__head');
    if (!sideHead) return;

    // Find and hide the tab group
    const children = sideHead.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.classList.contains('flex-1') || child.classList.contains('panel-toggle-btn')) {
        continue;
      }
      if (child.querySelector('[value="folder"]') ||
          child.querySelector('[value="outline"]') ||
          child.getAttribute('role') === 'radiogroup' ||
          child.getAttribute('role') === 'tablist') {
        child.style.display = 'none';
      }
    }
  }


  // Setup left panel - only hide tab switcher, don't add extra toggle button
  // The main script already provides a toggle button for the left panel
  function setupLeftPanel() {
    // Hide tab switcher (folder loading is now handled in main JS)
    setTimeout(hideTabSwitcher, 500);
    setTimeout(hideTabSwitcher, 1000);
  }

  // Toggle panel collapsed state (only for right/outline panel now)
  function togglePanel(side) {
    if (side !== 'right') return; // Left panel is controlled by main script

    const state = loadState();
    state.rightCollapsed = !state.rightCollapsed;

    if (outlinePanel) {
      outlinePanel.classList.toggle('right-collapsed', state.rightCollapsed);
    }
    document.body.classList.toggle('right-collapsed', state.rightCollapsed);

    saveState(state);
  }

  // Apply saved state (only for right/outline panel now)
  function applyState() {
    const state = loadState();

    // Only manage right panel state - left panel is controlled by main script
    if (outlinePanel) {
      if (state.rightCollapsed) {
        outlinePanel.classList.add('right-collapsed');
        document.body.classList.add('right-collapsed');
      } else {
        outlinePanel.classList.remove('right-collapsed');
        document.body.classList.remove('right-collapsed');
      }
    }
  }

  // Highlight current heading based on scroll position
  function updateActiveHeading() {
    if (!outlinePanel) return;

    const headings = extractHeadings();
    if (headings.length === 0) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    let activeHeading = headings[0];

    for (const heading of headings) {
      const rect = heading.element.getBoundingClientRect();
      const headingTop = rect.top + scrollY;

      if (headingTop <= scrollY + viewportHeight * 0.3) {
        activeHeading = heading;
      } else {
        break;
      }
    }

    // Update active class
    const items = outlinePanel.querySelectorAll('.outline-item');
    items.forEach(item => {
      const href = item.getAttribute('href');
      if (href === '#' + activeHeading.id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Initialize
  function init() {
    if (isInitialized) return;

    // Check if MDR is loaded
    const root = document.documentElement;
    if (!root.hasAttribute('mdr-loaded')) {
      return;
    }

    // Create outline panel
    outlinePanel = createOutlinePanel();
    document.body.appendChild(outlinePanel);

    // Setup left panel
    setupLeftPanel();

    // Update outline content
    updateOutlineContent();

    // Apply saved state
    applyState();

    // Listen for scroll to update active heading
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveHeading, 50);
    }, { passive: true });

    // Watch for content changes (MutationObserver)
    const content = document.querySelector('.mdr-content, .mdr');
    if (content) {
      const observer = new MutationObserver(() => {
        setTimeout(updateOutlineContent, 100);
      });
      observer.observe(content, { childList: true, subtree: true });
    }

    // Extra hide tab switcher calls (Vue might re-render)
    setTimeout(hideTabSwitcher, 1500);
    setTimeout(hideTabSwitcher, 2500);

    isInitialized = true;
    console.log('[MDR Three-Column] Layout initialized');
  }

  // Wait for DOM and MDR to be ready
  function waitForReady() {
    // Check if already ready
    if (document.documentElement.hasAttribute('mdr-loaded')) {
      setTimeout(init, 100);
      return;
    }

    // Use MutationObserver to watch for mdr-loaded attribute
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'mdr-loaded') {
          observer.disconnect();
          setTimeout(init, 100);
          return;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    // Fallback timeout
    setTimeout(() => {
      if (!isInitialized) {
        init();
      }
    }, 3000);
  }

  // Start
  waitForReady();
})();
