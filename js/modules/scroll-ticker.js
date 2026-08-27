/*
  scroll-ticker.js
  A single passive `scroll`/`resize` listener feeding one shared
  requestAnimationFrame loop. Any module that needs to react to scroll
  (progress bar, hero parallax, etc.) registers a callback here instead of
  adding its own listener — this is the "batch layout reads, don't stack
  redundant scroll listeners" performance fix agreed for the real build.
*/

const callbacks = new Set();
let ticking = false;
let queued = false;

function runFrame() {
  queued = false;
  for (const cb of callbacks) cb();
}

function requestTick() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(runFrame);
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
}

/** Register a function to run (at most once per frame) on scroll/resize. */
export function onScrollFrame(callback) {
  callbacks.add(callback);
  callback(); // run once immediately so initial state is correct pre-scroll
  return () => callbacks.delete(callback);
}
