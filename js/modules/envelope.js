/* envelope.js — open/closed toggle only; all motion is CSS-transition driven
   (see css/components/envelope.css) so this file has no animation frames. */

export function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const hint = document.getElementById('envHint');
  const closeBtn = document.getElementById('closeEnvBtn');
  if (!envelope || !hint) return;

  const HINT_CLOSED = 'لمس کن تا باز بشه';
  const HINT_OPEN = 'برای بستن دوباره لمس کن';

  const setOpen = (open) => {
    envelope.classList.toggle('is-open', open);
    hint.textContent = open ? HINT_OPEN : HINT_CLOSED;
  };

  envelope.addEventListener('click', () => setOpen(!envelope.classList.contains('is-open')));
  closeBtn?.addEventListener('click', () => setOpen(false));
}
