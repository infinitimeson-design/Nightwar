import { loadRoles, loadScenarios } from './modules/data-loader.js';
import { initMotionSystem } from './modules/motion-system.js';
import { initNav } from './modules/nav.js';
import { initHeroMarionette } from './modules/hero-marionette.js';
import { initCarousel } from './modules/carousel.js';
import { initScenarioFlow } from './modules/scenario-flow.js';
import { initRoleSheet } from './modules/role-sheet.js';
import { initEnvelope } from './modules/envelope.js';
import { initFooterParticles } from './modules/footer-particles.js';

async function main() {
  initMotionSystem();
  initNav();
  initHeroMarionette();
  initRoleSheet();
  initEnvelope();
  initFooterParticles();

  const [roles, scenarios] = await Promise.all([loadRoles(), loadScenarios()]);
  const flow = initScenarioFlow(scenarios, roles);
  initCarousel(scenarios, { onEnterScenario: (id) => flow.toggleScenario(id) });
}

main().catch((err) => {
  // fail loud in the console during development; the static markup already
  // on the page (hero, nav, envelope, about, contact, footer) still works
  // even if the data fetch fails, so the page never goes fully blank
  console.error('Night War: failed to initialize', err);
});
