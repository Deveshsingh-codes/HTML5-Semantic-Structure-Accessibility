/* ═══════════════════════════════════════════════
   ALEX RIVERA PORTFOLIO — main.js
   Handles: nav toggle, form validation, work filter,
            char counter, budget conditional, scroll reveals
   ═══════════════════════════════════════════════ */

'use strict';

// ── UTILITY ──────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── NAV TOGGLE ────────────────────────────────────
function initNav() {
  const toggle = $('.nav-toggle');
  const nav    = $('#primary-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });

  // Close when a nav link is clicked (mobile)
  $$('a', nav).forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('nav-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ── CONTACT FORM ──────────────────────────────────
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  // Character counter
  const textarea  = $('#message', form);
  const charCount = $('#char-count', form);
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      // Warn screen readers near limit
      if (len > 950) {
        charCount.setAttribute('aria-label', `${1000 - len} characters remaining`);
      }
    });
  }

  // Conditional budget field (show when 'freelance' selected)
  const enquirySelect = $('#enquiry-type', form);
  const budgetGroup   = $('#budget-group', form);
  if (enquirySelect && budgetGroup) {
    enquirySelect.addEventListener('change', () => {
      const isFreelance = enquirySelect.value === 'freelance';
      budgetGroup.hidden = !isFreelance;
      budgetGroup.setAttribute('aria-hidden', String(!isFreelance));
    });
  }

  // Validation helpers
  function showError(inputId, errorId) {
    const input = $(`#${inputId}`, form);
    const error = $(`#${errorId}`, form);
    if (!input || !error) return;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError(inputId, errorId) {
    const input = $(`#${inputId}`, form);
    const error = $(`#${errorId}`, form);
    if (!input || !error) return;
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  }

  // Inline validation on blur
  const nameInput  = $('#name', form);
  const emailInput = $('#email', form);
  const msgInput   = $('#message', form);
  const selectEl   = $('#enquiry-type', form);
  const consentEl  = $('#consent', form);

  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      if (!nameInput.value.trim()) showError('name', 'name-error');
      else clearError('name', 'name-error');
    });
  }
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      if (!valid) showError('email', 'email-error');
      else clearError('email', 'email-error');
    });
  }
  if (msgInput) {
    msgInput.addEventListener('blur', () => {
      if (msgInput.value.trim().length < 20) showError('message', 'message-error');
      else clearError('message', 'message-error');
    });
  }

  // Submit handler
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const statusEl = $('#form-status');

    // Run all validations
    if (!nameInput?.value.trim()) { showError('name', 'name-error'); valid = false; }
    else clearError('name', 'name-error');

    const emailOk = emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    if (!emailOk) { showError('email', 'email-error'); valid = false; }
    else clearError('email', 'email-error');

    if (!selectEl?.value) { showError('enquiry-type', 'enquiry-error'); valid = false; }
    else clearError('enquiry-type', 'enquiry-error');

    if (!msgInput || msgInput.value.trim().length < 20) {
      showError('message', 'message-error'); valid = false;
    } else clearError('message', 'message-error');

    if (!consentEl?.checked) { showError('consent', 'consent-error'); valid = false; }
    else clearError('consent', 'consent-error');

    if (!valid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();

      if (statusEl) {
        statusEl.className = 'form-status error-msg';
        statusEl.textContent = 'Please correct the errors below before sending.';
      }
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    setTimeout(() => {
      if (statusEl) {
        statusEl.className = 'form-status success';
        statusEl.textContent = '✓ Message sent! I\'ll be in touch within 48 hours.';
        statusEl.focus(); // Announce to screen readers
      }
      form.reset();
      if (charCount) charCount.textContent = '0';
      if (budgetGroup) { budgetGroup.hidden = true; budgetGroup.setAttribute('aria-hidden', 'true'); }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
    }, 1200);
  });
}

// ── WORK FILTER ───────────────────────────────────
function initWorkFilter() {
  const btns     = $$('.filter-btn');
  const projects = $$('.projects-full [data-category]');
  if (!btns.length || !projects.length) return;

  const list = $('.projects-full');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button states
      btns.forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('filter-active');
      });
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('filter-active');

      // Filter projects
      projects.forEach(proj => {
        const match = filter === 'all' || proj.dataset.category === filter;
        proj.style.display = match ? '' : 'none';
      });

      // Announce result to screen readers
      const visible = projects.filter(p => p.style.display !== 'none').length;
      if (list) {
        list.setAttribute('aria-label',
          filter === 'all'
            ? `All design projects`
            : `${filter.charAt(0).toUpperCase() + filter.slice(1)} projects — ${visible} result${visible !== 1 ? 's' : ''}`
        );
      }
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────
function initScrollReveal() {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1); }
    .reveal.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const targets = $$('.project-card, .case-study, .timeline-item, .skill-group, .stat-item');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ── ACTIVE NAV LINK (highlight by URL) ────────────
function initActiveNav() {
  const path = window.location.pathname;
  $$('.primary-nav a').forEach(a => {
    const href = a.getAttribute('href');
    // If already set via HTML, don't override
    if (a.getAttribute('aria-current')) return;
    if (href && path.endsWith(href)) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

// ── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initContactForm();
  initWorkFilter();
  initScrollReveal();
  initActiveNav();
});
