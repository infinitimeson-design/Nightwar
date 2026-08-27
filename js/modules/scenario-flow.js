/*
  scenario-flow.js
  Locked flow: tap a scenario card → story+stats step renders → tap
  "شناخت نقش‌ها" → that scenario's role grid renders as a further step.
  Roles are looked up by id from the shared roles array, scoped to whichever
  scenario is currently open — never a single global always-visible list.
*/
import { openRoleSheet } from './role-sheet.js';
import { observeReveals } from './motion-system.js';

const CITIZEN_INTRO = 'آن‌ها باید حقیقت را پیدا کنند، زنده بمانند و قبل از تمام شدن شب، به آدم درست اعتماد کنند.';
const MAFIA_INTRO = 'آن‌ها در میان شهر پنهان شده‌اند؛ با یک هدف ساده: کنترل بازی، بدون اینکه شناخته شوند.';

export function initScenarioFlow(scenarios, roles) {
  const panel = document.getElementById('storyPanel');
  const inner = document.getElementById('storyInner');
  const rolesById = new Map(roles.map((r) => [r.id, r]));
  let openScenarioId = null;

  function renderRoleGrid(scenario) {
    const grid = inner.querySelector('#roleGrid');
    grid.innerHTML = '';
    scenario.roleIds
      .map((id) => rolesById.get(id))
      .filter(Boolean)
      .forEach((role) => {
        const card = document.createElement('div');
        card.className = 'role-card' + (role.side === 'mafia' ? ' is-hidden' : '');
        card.dataset.side = role.side;
        card.innerHTML = `
          <div class="card-art"></div>
          <div class="card-body">
            <h5>${role.name}</h5>
            <span class="role-side">${role.label}</span>
          </div>`;
        card.addEventListener('click', () => openRoleSheet(role));
        grid.appendChild(card);

        if (role.image) {
          const art = card.querySelector('.card-art');
          art.style.setProperty('--card-image', `url('${role.image}')`);
          art.style.setProperty('--card-placeholder-opacity', '0');
        }
      });
  }

  function renderStory(scenario) {
    inner.innerHTML = `
      <div class="glass-panel">
        <p class="eyebrow">سناریو</p>
        <h3>${scenario.title}</h3>
        <p class="story-sub">${scenario.type}</p>
        ${scenario.story.map((line) => `<p class="story-line" data-reveal>${line}</p>`).join('')}
        <p class="story-endline" data-reveal>${scenario.endLine}</p>
        <div class="stats-grid">
          ${scenario.stats.map((s) => `<div class="stat-box"><b>${s.value}</b><span>${s.label}</span></div>`).join('')}
        </div>
        <button class="btn is-primary is-full" data-ripple id="showRolesBtn">شناخت نقش‌ها</button>
        <div class="panel-collapse roles-step" id="rolesStep">
          <p class="eyebrow" style="margin-top:20px;">نقش‌ها</p>
          <h3 style="font-size:18px; margin:0 0 4px;">هر نقش، یک تصمیم</h3>
          <p style="font-size:12px; color:rgba(248,238,223,.6); margin:0 0 16px;">هیچ نقشی بی‌دلیل وارد بازی نشده است.</p>
          <div class="role-tabs">
            <div class="role-tab is-active" data-filter="citizen">شهروندان — ۱۰ نقش</div>
            <div class="role-tab" data-filter="mafia">مافیا — ۵ نقش</div>
          </div>
          <p class="side-intro" id="sideIntro">${CITIZEN_INTRO}</p>
          <div class="role-grid" id="roleGrid"></div>
        </div>
      </div>`;

    renderRoleGrid(scenario);

    const rolesStep = inner.querySelector('#rolesStep');
    inner.querySelector('#showRolesBtn').addEventListener('click', (e) => {
      const open = rolesStep.classList.toggle('is-open');
      e.currentTarget.textContent = open ? 'پنهان کردن نقش‌ها' : 'شناخت نقش‌ها';
    });
    inner.querySelectorAll('.role-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        inner.querySelectorAll('.role-tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const side = tab.dataset.filter;
        inner.querySelector('#sideIntro').textContent = side === 'citizen' ? CITIZEN_INTRO : MAFIA_INTRO;
        inner.querySelectorAll('#roleGrid .role-card').forEach((c) => c.classList.toggle('is-hidden', c.dataset.side !== side));
      });
    });

    observeReveals(inner);
  }

  return {
    toggleScenario(scenarioId) {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario || scenario.locked) return;

      if (openScenarioId === scenarioId && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
        openScenarioId = null;
        return;
      }
      openScenarioId = scenarioId;
      renderStory(scenario);
      panel.classList.add('is-open');
    },
  };
}
