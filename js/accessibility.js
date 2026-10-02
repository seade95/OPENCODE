/**
 * EduVerse - Accessibility & WCAG Compliance Engine
 * Provides comprehensive ARIA attributes, modal dialog focus trapping,
 * focus restoration, screen reader announcements, and robust keyboard
 * navigation for all portal modals and tabbed interfaces.
 */

(function () {
  'use strict';

  // State management
  var lastFocusedElement = null;
  var activeModalElement = null;
  var isNavigatingWithKeyboard = false;

  // Global namespace
  window.EduVerseAccessibility = window.EduVerseAccessibility || {};

  /**
   * Helper: Announce messages to screen readers via aria-live region
   */
  function announce(message, priority) {
    if (!message) return;
    priority = priority || 'polite';
    var announcer = document.getElementById('accessibilityAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'accessibilityAnnouncer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.padding = '0';
      announcer.style.margin = '-1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      announcer.style.border = '0';
      document.body.appendChild(announcer);
    }
    // Update content after brief delay to ensure AT detection
    announcer.textContent = '';
    setTimeout(function () {
      announcer.textContent = message;
    }, 50);
  }

  window.EduVerseAccessibility.announce = announce;

  /**
   * Helper: Get all focusable elements inside a container
   */
  function getFocusableElements(container) {
    if (!container) return [];
    var selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    var elements = Array.prototype.slice.call(container.querySelectorAll(selector));
    return elements.filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement || el.getClientRects().length > 0;
    });
  }

  // Track keyboard usage for focus-visible styles
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0 || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      isNavigatingWithKeyboard = true;
      document.body.classList.add('user-is-tabbing');
    }
  });

  document.addEventListener('mousedown', function () {
    isNavigatingWithKeyboard = false;
    document.body.classList.remove('user-is-tabbing');
  });

  /* ==========================================================================
     1. MODAL ACCESSIBILITY & FOCUS TRAPPING
     ========================================================================== */

  /**
   * Decorate and initialize modal dialog ARIA attributes
   */
  function setupModalElement(overlay) {
    if (!overlay) return;

    // Set dialog roles on overlay/modal
    var modalContent = overlay.querySelector('.modal, #modalContent, .sa-modal-card') || overlay;
    
    if (!overlay.hasAttribute('role') && !modalContent.hasAttribute('role')) {
      modalContent.setAttribute('role', 'dialog');
      modalContent.setAttribute('aria-modal', 'true');
    }

    if (!overlay.hasAttribute('tabindex')) {
      overlay.setAttribute('tabindex', '-1');
    }

    // Auto-link modal heading to aria-labelledby
    var heading = modalContent.querySelector('h1, h2, h3, h4, h5, h6, .modal-title, .sa-modal-title');
    if (heading) {
      if (!heading.id) {
        heading.id = 'modal-title-' + Math.random().toString(36).substring(2, 9);
      }
      modalContent.setAttribute('aria-labelledby', heading.id);
      if (overlay !== modalContent) {
        overlay.setAttribute('aria-labelledby', heading.id);
      }
    } else if (!modalContent.hasAttribute('aria-label') && !modalContent.hasAttribute('aria-labelledby')) {
      modalContent.setAttribute('aria-label', 'Dialog Window');
    }

    // Auto-link paragraph description to aria-describedby
    var desc = modalContent.querySelector('p:not(:empty), .modal-description');
    if (desc && !modalContent.hasAttribute('aria-describedby')) {
      if (!desc.id) {
        desc.id = 'modal-desc-' + Math.random().toString(36).substring(2, 9);
      }
      modalContent.setAttribute('aria-describedby', desc.id);
    }

    // Ensure close buttons have accessible names
    var closeBtns = modalContent.querySelectorAll('.modal-close, [data-action="closeModal"], .sa-modal-close');
    closeBtns.forEach(function (btn) {
      if (!btn.hasAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Close modal');
      }
      if (!btn.hasAttribute('type')) {
        btn.setAttribute('type', 'button');
      }
    });
  }

  /**
   * Handle active modal open focus management
   */
  function handleModalOpen(overlay) {
    if (activeModalElement === overlay) return;

    // Save previous focus if valid
    if (document.activeElement && document.activeElement !== document.body && !overlay.contains(document.activeElement)) {
      lastFocusedElement = document.activeElement;
    }

    activeModalElement = overlay;
    setupModalElement(overlay);

    var modalContent = overlay.querySelector('.modal, #modalContent, .sa-modal-card') || overlay;
    var focusables = getFocusableElements(modalContent);

    // Announce to screen reader
    var heading = modalContent.querySelector('h1, h2, h3, h4, h5, h6');
    var titleText = heading ? heading.textContent.trim() : 'Modal dialog';
    announce(titleText + ' opened', 'assertive');

    // Move focus inside modal
    setTimeout(function () {
      if (focusables.length > 0) {
        // Prefer first input or primary action if present, else first focusable
        var primaryFocus = modalContent.querySelector('input:not([type="hidden"]), select, textarea, .btn-primary') || focusables[0];
        if (primaryFocus && typeof primaryFocus.focus === 'function') {
          primaryFocus.focus();
        }
      } else {
        modalContent.setAttribute('tabindex', '-1');
        modalContent.focus();
      }
    }, 60);
  }

  /**
   * Handle modal close focus restoration
   */
  function handleModalClose(overlay) {
    if (activeModalElement !== overlay) return;
    activeModalElement = null;

    announce('Modal dialog closed', 'polite');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try {
        lastFocusedElement.focus();
      } catch (err) {}
    }
  }

  /**
   * Modal Keyboard Event Trap (Tab loop & Escape key)
   */
  document.addEventListener('keydown', function (e) {
    if (!activeModalElement) return;

    // Check if activeModalElement is still visible
    var isVisible = activeModalElement.classList.contains('active') ||
                    activeModalElement.style.display === 'flex' ||
                    activeModalElement.style.display === 'block' ||
                    (!activeModalElement.classList.contains('hidden') && activeModalElement.classList.contains('fixed'));

    if (!isVisible) {
      handleModalClose(activeModalElement);
      return;
    }

    // Escape Key -> Close Modal
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();

      // Trigger close functions
      if (typeof window.closeModal === 'function') {
        window.closeModal();
      } else {
        activeModalElement.classList.remove('active');
        activeModalElement.classList.add('hidden');
      }
      handleModalClose(activeModalElement);
      return;
    }

    // Tab Key -> Focus Trap
    if (e.key === 'Tab' || e.keyCode === 9) {
      var modalContent = activeModalElement.querySelector('.modal, #modalContent, .sa-modal-card') || activeModalElement;
      var focusables = getFocusableElements(modalContent);

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      var firstEl = focusables[0];
      var lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab on first element -> wrap to last element
        if (document.activeElement === firstEl || !modalContent.contains(document.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab on last element -> wrap to first element
        if (document.activeElement === lastEl || !modalContent.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }, true);

  /* ==========================================================================
     2. TABBED INTERFACES & KEYBOARD NAVIGATION
     ========================================================================== */

  /**
   * Initialize and synchronize ARIA attributes across all tabbed containers
   */
  function initTabGroup(container) {
    if (!container) return;

    // Assign role="tablist"
    if (!container.hasAttribute('role')) {
      container.setAttribute('role', 'tablist');
    }

    if (!container.hasAttribute('aria-label')) {
      var label = 'Portal Navigation Tabs';
      if (container.classList.contains('student-tabs')) label = 'Student Portal Sections';
      else if (container.classList.contains('admin-sidebar')) label = 'Admin Dashboard Sections';
      else if (container.classList.contains('sa-pw-role-tabs')) label = 'User Role Options';
      else if (container.id === 'copilotTabs' || container.querySelector('#tabBtnExplorer')) label = 'Workspace Navigation';
      container.setAttribute('aria-label', label);
    }

    // Find all tab buttons in this container
    var tabs = Array.prototype.slice.call(container.querySelectorAll('.student-tab, .admin-sidebar-item, .sa-pw-role-tab, .tt-tab, .k12-tab, .game-tab, [data-tab], [data-panel], [data-teacher-panel], [data-tttab], [id^="tabBtn"]'));
    if (tabs.length === 0) return;

    var hasActiveTab = false;

    tabs.forEach(function (tab, idx) {
      tab.setAttribute('role', 'tab');

      // Check active state
      var isActive = tab.classList.contains('active') ||
                     tab.getAttribute('aria-selected') === 'true' ||
                     (tab.className && tab.className.indexOf('border-blue-500') !== -1);

      if (isActive && !hasActiveTab) {
        hasActiveTab = true;
      }

      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      // ID generation for tab
      if (!tab.id) {
        var tabVal = tab.getAttribute('data-tab') ||
                     tab.getAttribute('data-panel') ||
                     tab.getAttribute('data-teacher-panel') ||
                     tab.getAttribute('data-tttab') ||
                     'tab-' + idx;
        tab.id = 'tab-control-' + tabVal.replace(/[^a-zA-Z0-9_-]/g, '');
      }

      // Link tab to target panel (aria-controls)
      var targetPanelId = getTargetPanelId(tab);
      if (targetPanelId) {
        tab.setAttribute('aria-controls', targetPanelId);

        var targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
          targetPanel.setAttribute('role', 'tabpanel');
          targetPanel.setAttribute('aria-labelledby', tab.id);
          targetPanel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
          if (!targetPanel.hasAttribute('tabindex')) {
            targetPanel.setAttribute('tabindex', '0');
          }
        }
      }
    });

    // Fallback if no tab was active
    if (!hasActiveTab && tabs.length > 0) {
      tabs[0].setAttribute('aria-selected', 'true');
      tabs[0].setAttribute('tabindex', '0');
    }
  }

  /**
   * Helper: Resolve target panel ID from tab element
   */
  function getTargetPanelId(tab) {
    if (tab.hasAttribute('aria-controls')) return tab.getAttribute('aria-controls');

    var studentTab = tab.getAttribute('data-tab');
    if (studentTab) return 'stu-' + studentTab;

    var adminPanel = tab.getAttribute('data-panel');
    if (adminPanel) return 'admin-' + adminPanel;

    var teacherPanel = tab.getAttribute('data-teacher-panel');
    if (teacherPanel) return 'teacher-' + teacherPanel;

    var ttTab = tab.getAttribute('data-tttab');
    if (ttTab) return 'tt-panel-' + ttTab;

    if (tab.id === 'tabBtnExplorer') return 'panelExplorer';
    if (tab.id === 'tabBtnRepos') return 'panelRepos';
    if (tab.id === 'tabBtnCopilot') return 'panelCopilot';
    if (tab.id === 'tabBtnHealth') return 'panelHealth';

    return null;
  }

  /**
   * Handle Keyboard Arrow Navigation inside Tablists
   */
  function handleTabListKeyDown(e) {
    var tab = e.target.closest('[role="tab"], .student-tab, .admin-sidebar-item, .sa-pw-role-tab, .tt-tab, [data-tab], [data-panel], [data-teacher-panel]');
    if (!tab) return;

    var tablist = tab.closest('[role="tablist"], .student-tabs, .admin-sidebar, .sa-pw-role-tabs, .tt-tabs');
    if (!tablist) return;

    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"], .student-tab, .admin-sidebar-item, .sa-pw-role-tab, .tt-tab, [data-tab], [data-panel], [data-teacher-panel]'));
    if (tabs.length <= 1) return;

    var currentIndex = tabs.indexOf(tab);
    var targetIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = tabs.length - 1;
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        tab.click();
        announceTabChange(tab);
        return;
      default:
        return;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      var targetTab = tabs[targetIndex];

      // Roving tabindex update
      tabs.forEach(function (t) {
        t.setAttribute('tabindex', '-1');
        t.setAttribute('aria-selected', 'false');
      });

      targetTab.setAttribute('tabindex', '0');
      targetTab.setAttribute('aria-selected', 'true');
      targetTab.focus();

      // Trigger selection/click
      targetTab.click();
      announceTabChange(targetTab);
    }
  }

  /**
   * Screen reader announcement when tab changes
   */
  function announceTabChange(tab) {
    var labelText = tab.textContent ? tab.textContent.trim() : 'Tab';
    var tablist = tab.closest('[role="tablist"], .student-tabs, .admin-sidebar, .sa-pw-role-tabs');
    var tabs = tablist ? tablist.querySelectorAll('[role="tab"], .student-tab, .admin-sidebar-item') : [];
    var index = Array.prototype.indexOf.call(tabs, tab);
    
    var announceMsg = 'Tab selected: ' + labelText;
    if (tabs.length > 0 && index !== -1) {
      announceMsg += ', ' + (index + 1) + ' of ' + tabs.length;
    }
    announce(announceMsg, 'polite');
  }

  /* ==========================================================================
     3. SCANNER & MUTATION OBSERVER
     ========================================================================== */

  /**
   * Scan entire document for tab groups and active modals
   */
  function scanAccessibility() {
    // 1. Modals
    var overlays = document.querySelectorAll('.modal-overlay, #modalOverlay, [role="dialog"], #calcModal');
    overlays.forEach(function (overlay) {
      setupModalElement(overlay);
      var isVisible = overlay.classList.contains('active') ||
                      overlay.style.display === 'flex' ||
                      overlay.style.display === 'block' ||
                      (!overlay.classList.contains('hidden') && overlay.classList.contains('fixed'));
      if (isVisible) {
        handleModalOpen(overlay);
      }
    });

    // 2. Tab Groups
    var tabGroups = document.querySelectorAll('.student-tabs, .admin-sidebar, .sa-pw-role-tabs, .tt-tabs, [role="tablist"], .k12-tabs');
    tabGroups.forEach(function (group) {
      initTabGroup(group);
    });
  }

  // Event Listeners for Tab Navigation
  document.addEventListener('keydown', handleTabListKeyDown);

  // Synchronize tabs on click
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"], .student-tab, .admin-sidebar-item, .sa-pw-role-tab, .tt-tab, [data-tab], [data-panel], [data-teacher-panel]');
    if (!tab) return;

    var tablist = tab.closest('[role="tablist"], .student-tabs, .admin-sidebar, .sa-pw-role-tabs');
    if (tablist) {
      setTimeout(function () {
        initTabGroup(tablist);
      }, 30);
    }
  });

  // Observe DOM changes (modals opening/closing, dynamic tab panels loading)
  var observerThrottled = false;
  var observer = new MutationObserver(function (mutations) {
    if (observerThrottled) return;
    observerThrottled = true;

    setTimeout(function () {
      observerThrottled = false;

      // Check modal visibility state
      var activeOverlay = document.querySelector('.modal-overlay.active, #modalOverlay.active, [role="dialog"].active, .modal-overlay:not(.hidden)');
      if (activeOverlay && activeModalElement !== activeOverlay) {
        handleModalOpen(activeOverlay);
      } else if (!activeOverlay && activeModalElement) {
        handleModalClose(activeModalElement);
      }

      // Refresh tab ARIA attributes
      scanAccessibility();
    }, 100);
  });

  // Hook into openModal / closeModal if defined on window
  function wrapModalHooks() {
    if (typeof window.openModal === 'function' && !window.openModal.__a11yWrapped) {
      var origOpen = window.openModal;
      window.openModal = function (html) {
        var res = origOpen.apply(this, arguments);
        var overlay = document.getElementById('modalOverlay') || document.querySelector('.modal-overlay');
        if (overlay) {
          setTimeout(function () { handleModalOpen(overlay); }, 40);
        }
        return res;
      };
      window.openModal.__a11yWrapped = true;
    }

    if (typeof window.closeModal === 'function' && !window.closeModal.__a11yWrapped) {
      var origClose = window.closeModal;
      window.closeModal = function () {
        var overlay = activeModalElement || document.getElementById('modalOverlay') || document.querySelector('.modal-overlay');
        var res = origClose.apply(this, arguments);
        if (overlay) {
          handleModalClose(overlay);
        }
        return res;
      };
      window.closeModal.__a11yWrapped = true;
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      scanAccessibility();
      wrapModalHooks();
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    });
  } else {
    scanAccessibility();
    wrapModalHooks();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

})();
