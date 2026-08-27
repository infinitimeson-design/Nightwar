/*
  footer-particles.js

  Progress formula: the footer is the LAST element on the page, so the page
  can never scroll the footer's bottom edge past the viewport top — a
  formula based on getBoundingClientRect().bottom crossing 0 can never reach
  1 (this was the bug in early preview builds: density looked permanently
  sparse because progress capped around 0.3–0.4). Progress is instead
  anchored to the page's actual scrollable range: 0 the moment the footer's
  top touches the bottom of the viewport, 1 at the maximum possible scroll
  (the true bottom of the page) — matching the locked spec: particles
  scattered from the start of the footer, fully formed "SC DEV" only at the
  very bottom.

  Performance: the rAF loop only runs while the footer is on-screen
  (gated by IntersectionObserver) — it does not run, and does not read
  layout, at any other time. Particle count adapts to viewport width so
  low-end / narrow devices render fewer particles.
*/

const WORD = 'SC DEV';
const MAX_PARTICLES_WIDE = 900;
const MAX_PARTICLES_NARROW = 450;

export function initFooterParticles() {
  const canvas = document.getElementById('footerCanvas');
  const fallbackText = document.getElementById('footerFallbackText');
  const footerEl = document.getElementById('footer');
  if (!canvas || !footerEl) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseCanvas = !!canvas.getContext;

  if (!canUseCanvas || reduceMotion) {
    canvas.style.display = 'none';
    fallbackText?.classList.add('is-visible');
    return; // CSS-only fallback, no particle system, no rAF loop at all
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let rafId = null;
  let visible = false;

  function buildParticles() {
    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = 220 * dpr);

    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const octx = off.getContext('2d');
    octx.fillStyle = '#fff';
    octx.font = `bold ${Math.floor(h * 0.34)}px Estedad, Vazirmatn, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(WORD, w / 2, h / 2);

    const data = octx.getImageData(0, 0, w, h).data;
    const step = Math.max(2, Math.floor(w / 380));
    const targets = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 100) targets.push({ x, y });
      }
    }

    const cap = window.innerWidth >= 480 ? MAX_PARTICLES_WIDE : MAX_PARTICLES_NARROW;
    const count = Math.min(targets.length, cap);
    const chosen = targets.sort(() => Math.random() - 0.5).slice(0, count);

    particles = chosen.map((t) => ({
      sx: Math.random() * w, sy: Math.random() * h,
      tx: t.x, ty: t.y,
      r: (Math.random() * 1.3 + 0.7) * dpr,
      hue: Math.random() > 0.5 ? '142,22,22' : '232,201,153',
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function currentProgress() {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const footerStart = Math.max(0, footerEl.offsetTop - window.innerHeight);
    const raw = (doc.scrollTop - footerStart) / Math.max(1, maxScroll - footerStart);
    return Math.max(0, Math.min(1, raw));
  }

  function frame() {
    if (!visible) { rafId = null; return; }
    const progress = currentProgress();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = performance.now() / 1000;
    particles.forEach((p) => {
      const idle = Math.sin(t * 1.2 + p.phase) * 3 * (1 - progress);
      const x = p.sx + (p.tx - p.sx) * progress + idle;
      const y = p.sy + (p.ty - p.sy) * progress + idle * 0.6;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.hue}, ${0.35 + progress * 0.55})`;
      ctx.shadowColor = `rgba(${p.hue}, ${0.5 * progress})`;
      ctx.shadowBlur = 4 * progress * (window.devicePixelRatio || 1);
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    rafId = requestAnimationFrame(frame);
  }

  buildParticles();
  window.addEventListener('resize', buildParticles, { passive: true });

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && rafId === null) rafId = requestAnimationFrame(frame);
  }, { threshold: 0 }).observe(footerEl);
}
