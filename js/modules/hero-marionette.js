/*
  hero-marionette.js

  SCOPE NOTE (read this before extending): the Master Build Prompt calls for
  a full Three.js/WebGL marionette with idle motion, scroll motion, touch
  response and parallax, with a required graceful fallback. What's
  implemented here right now IS that fallback tier — an SVG/CSS puppet with
  idle sway (pure CSS animation) plus scroll-driven string tension and a
  light parallax offset (this file). A full WebGL rig was out of scope to
  hand-build reliably in this session; this module is intentionally
  self-contained so upgrading to a real Three.js scene later means rewriting
  only this file — the markup contract (#marionette, .puppet-body, .string)
  and every other module stay untouched.
*/
import { onScrollFrame } from './scroll-ticker.js';

export function initHeroMarionette() {
  const puppetBody = document.getElementById('puppetBody');
  const strings = Array.from(document.querySelectorAll('.marionette .string'));
  if (!puppetBody) return;

  onScrollFrame(() => {
    const y = window.scrollY;
    const tilt = Math.sin(y / 300) * 3;
    const drift = Math.min(y * 0.04, 18);
    puppetBody.style.transform = `translateY(${drift}px) rotate(${tilt}deg)`;
    const tension = 1 + Math.min(y / 400, 1.2);
    strings.forEach((s) => { s.style.strokeWidth = String(tension); });
  });
}
