/**
 * EduVerse — shared public page chrome
 * Handles the mobile navigation drawer, theme toggle, toasts and the
 * footer newsletter form for every page that is not the main app shell.
 */
(function () {
  'use strict';

  var THEME_KEY = 'eduverseTheme';

  /* ---------- Mobile navigation ---------- */
  function closeNav() {
    var menu = document.getElementById('navMenu');
    var backdrop = document.querySelector('.nav-backdrop');
    var toggle = document.querySelector('.nav-toggle');
    if (menu) menu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function toggleNav() {
    var menu = document.getElementById('navMenu');
    var backdrop = document.querySelector('.nav-backdrop');
    var toggle = document.querySelector('.nav-toggle');
    if (!menu) return;
    var open = menu.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* ---------- Theme ---------- */
  function applyTheme(mode) {
    var html = document.documentElement;
    var icon = document.getElementById('darkModeIcon');
    if (mode === 'dark') {
      html.setAttribute('data-theme', 'dark');
      if (icon) icon.className = 'fas fa-sun';
    } else {
      html.removeAttribute('data-theme');
      if (icon) icon.className = 'fas fa-moon';
    }
  }

  function toggleDarkMode() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
  }

  /* ---------- Toasts ---------- */
  var ICONS = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

  function toast(message, type) {
    var host = document.getElementById('toastContainer');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toastContainer';
      host.className = 'toast-container';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = '<i class="fas ' + (ICONS[type] || ICONS.info) + '"></i><span></span>';
    el.querySelector('span').textContent = message;
    host.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(function () { el.remove(); }, 260);
    }, 3600);
  }

  /* ---------- Newsletter ---------- */
  function subscribeNewsletter(input) {
    var email = input && input.value ? input.value.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Please enter a valid email address.', 'error');
      return false;
    }
    try {
      var list = JSON.parse(localStorage.getItem('eduverse_newsletter') || '[]');
      if (list.indexOf(email) === -1) list.push(email);
      localStorage.setItem('eduverse_newsletter', JSON.stringify(list));
    } catch (e) {}
    if (input) input.value = '';
    toast('You are subscribed. Welcome to EduVerse!', 'success');
    return false;
  }

  /* ---------- Active nav link ---------- */
  function markActiveLink() {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var links = document.querySelectorAll('.navbar .nav-link[href]');
    Array.prototype.forEach.call(links, function (link) {
      var href = (link.getAttribute('href') || '').split('#')[0].split('?')[0].toLowerCase();
      if (!href || href === 'javascript:;') return;
      if (href === here) link.classList.add('active');
    });
  }

  /* ---------- Boot ---------- */
  function init() {
    try {
      if (localStorage.getItem(THEME_KEY) === 'dark') applyTheme('dark');
    } catch (e) {}

    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('.nav-toggle');
      if (toggle) { e.preventDefault(); toggleNav(); return; }
      var backdrop = e.target.closest('.nav-backdrop');
      if (backdrop) { closeNav(); return; }
      var themeBtn = e.target.closest('[data-chrome="theme"]');
      if (themeBtn) { e.preventDefault(); toggleDarkMode(); return; }
      if (e.target.closest('.nav-menu a') && window.innerWidth <= 1024) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) closeNav();
    });

    window.addEventListener('scroll', function () {
      var nav = document.getElementById('navbar');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    markActiveLink();

    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  window.EduVerseChrome = {
    toggleNav: toggleNav,
    closeNav: closeNav,
    toggleDarkMode: toggleDarkMode,
    toast: toast,
    subscribeNewsletter: subscribeNewsletter
  };
  window.toggleDarkMode = window.toggleDarkMode || toggleDarkMode;
  window.toast = window.toast || toast;
  window.subscribeNewsletter = window.subscribeNewsletter || subscribeNewsletter;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
