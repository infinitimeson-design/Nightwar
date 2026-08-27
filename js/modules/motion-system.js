/*
  motion-system.js
  Owns scroll-linked MOTION, never visual style. It writes a single number
  (--reveal-progress, 0..1) onto each observed element; css/motion.css alone
  decides what that number looks like (blur amount, translate distance,
  timing curve). Changing "how much blur" is a CSS-only edit; changing "when
  an element counts as revealed" is a JS-only edit — the two never collide.
*/
import { onScrollFrame } from './scroll-ticker.js';

// many thresholds = a smooth-looking continuous progress from a native,
// off-main-thread IntersectionObserver instead of per-frame manual math
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

function initRevealSystem() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const progress = entry.isIntersecting ? entry.intersectionRatio : 0;
      entry.target.style.setProperty('--reveal-progress', progress.toFixed(3));
    });
  }, { threshold: THRESHOLDS, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('[data-reveal], [data-reveal-block]').forEach((el) => io.observe(el));
  return io;
}

/** Call again after dynamically injecting new [data-reveal] markup (e.g. the
 *  scenario story step), so newly-added elements also get observed. */
export function observeReveals(root = document) {
  const io = window.__nightwarRevealObserver;
  if (!io) return;
  root.querySelectorAll('[data-reveal], [data-reveal-block]').forEach((el) => io.observe(el));
}

function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ripple]');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
}

function initProgressBar() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  onScrollFrame(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const scrolled = max > 0 ? doc.scrollTop / max : 0;
    bar.style.transform = `scaleX(${scrolled})`;
  });
}

export function initMotionSystem() {
  window.__nightwarRevealObserver = initRevealSystem();
  initRipple();
  initProgressBar();
}
