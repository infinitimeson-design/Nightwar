/*
  carousel.js

  Focus detection uses IntersectionObserver with a narrow rootMargin band
  instead of computing "closest card" on every scroll event. This is the fix
  for the jump/flicker bug seen in preview builds: manual scrollLeft math run
  on every scroll frame fights the browser's native scroll-snap physics
  (especially on iOS Safari); IntersectionObserver hands that detection to
  the browser's own compositor instead, so it never fights the snap.
*/
import { observeReveals } from './motion-system.js';

export function initCarousel(scenarios, { onEnterScenario } = {}) {
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('dots');
  if (!carousel) return;

  carousel.innerHTML = '';
  dotsWrap.innerHTML = '';

  scenarios.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'scen-card card';
    card.dataset.id = s.id;

    card.innerHTML = s.locked
      ? `
        <div class="card-art"><span class="tag">${s.tag}</span></div>
        <div class="card-body">
          <h3 class="card-title">${s.title}</h3>
          <p class="card-text">هنوز قفله.</p>
          <span class="btn is-full is-disabled">قفل</span>
        </div>`
      : `
        <div class="card-art"><span class="tag">${s.tag}</span></div>
        <div class="card-body">
          <p class="card-eyebrow">${s.type}</p>
          <h3 class="card-title">${s.title}</h3>
          <p class="card-text">${s.summary}</p>
          <div class="card-info-row">${s.info.map((i2) => `<span>${i2}</span>`).join('')}</div>
          <button class="btn is-primary is-full" data-ripple data-enter-scenario="${s.id}">
            ورود به سناریو
          </button>
        </div>`;
    carousel.appendChild(card);

    if (s.cover) {
      const art = card.querySelector('.card-art');
      art.style.setProperty('--card-image', `url('${s.cover}')`);
      art.style.setProperty('--card-placeholder-opacity', '0');
    }


    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', inline: 'center' }));
    dotsWrap.appendChild(dot);
  });

  const cards = Array.from(carousel.querySelectorAll('.scen-card'));
  const dots = Array.from(dotsWrap.children);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const idx = cards.indexOf(entry.target);
      if (idx === -1) return;
      entry.target.classList.toggle('is-focused', entry.isIntersecting);
      if (entry.isIntersecting) dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    });
  }, { root: carousel, rootMargin: '0px -35% 0px -35%', threshold: 0.6 });

  cards.forEach((c) => io.observe(c));
  cards[0]?.classList.add('is-focused');

  carousel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-enter-scenario]');
    if (!btn) return;
    onEnterScenario?.(btn.dataset.enterScenario);
  });

  observeReveals(carousel);
}
