/* nav.js — sticky nav hamburger + fullscreen menu overlay. */

export function initNav() {
  const menuBtn = document.getElementById('menuBtn');
  const overlay = document.getElementById('menuOverlay');
  if (!menuBtn || !overlay) return;

  const setOpen = (open) => {
    overlay.classList.toggle('is-open', open);
    menuBtn.textContent = open ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', String(open));
  };

  menuBtn.addEventListener('click', () => setOpen(!overlay.classList.contains('is-open')));
  overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}
