# Night War — شب‌های مافیا

Static, mobile-first site. No backend, no build step, no framework — plain
HTML/CSS/JS (ES modules), matching the locked Master Build Prompt + Master
Copy Lock specs.

## Run locally

Opening `index.html` directly (`file://`) will NOT work — the scenario/role
content is fetched from `data/*.json`, and browsers block `fetch()` on
`file://` for security reasons. Serve the folder instead:

```
python3 -m http.server 8000
# or: npx serve
```

Then open `http://localhost:8000`.

## Deploy (GitHub Pages)

Every asset path in this project is relative (no leading `/`), so it works
whether the repo is served from the domain root or from a project subpath
like `username.github.io/night-war/` — no configuration needed. Push the
folder to a repo and enable Pages on the branch.

## Project structure

```
index.html              → all markup, static content, section order
css/tokens.css           → EVERY color/spacing/radius/shadow/timing value.
                            Restyle the whole site by editing only this file.
css/base.css              → reset + page-level rules
css/motion.css             → the reveal/blur-to-focus system
css/components/            → button, card, glass, nav, envelope, sheet
css/sections/               → one file per page section
js/main.js                 → entry point, wires modules together
js/modules/data-loader.js    → the only file that knows about fetch()/paths
js/modules/motion-system.js   → scroll reveal + ripple + progress bar
js/modules/carousel.js         → scenario carousel (IntersectionObserver)
js/modules/scenario-flow.js     → story step → roles step per scenario
js/modules/role-sheet.js         → role detail bottom sheet
js/modules/envelope.js            → envelope open/close
js/modules/footer-particles.js     → "SC DEV" particle formation
js/modules/hero-marionette.js       → puppet scroll motion (see note below)
js/modules/scroll-ticker.js          → shared scroll listener (perf)
data/roles.json                       → all 15 roles — content only
data/scenarios.json                    → scenarios — content only, ref roleIds
assets/fonts/Estedad/                   → drop real font files here
assets/images/roles/                     → drop real role art here
assets/images/scenarios/                  → drop real scenario art here
```

## Adding content — no code changes needed

- **New scenario**: add an object to `data/scenarios.json` with a `roleIds`
  array pointing at existing role ids (or new ones added to `roles.json`
  first). The carousel and story/roles flow pick it up automatically.
- **New role**: add an object to `data/roles.json`. Reference its `id` from
  any scenario's `roleIds`.
- **Real images**: see the `README.txt` in each `assets/images/*` folder.
  Every card renders inside a fixed aspect-ratio box, so dropping in a real
  photo at the documented path never affects layout or any other file.
- **Real font**: drop Estedad's `.woff2` files into `assets/fonts/Estedad/`
  matching the filenames already referenced in `estedad.css`.

## Known scope gaps (read before treating this as final)

- **Hero marionette**: the Master Build Prompt calls for a full Three.js/
  WebGL rig. What's implemented is the SVG/CSS fallback tier only (idle sway,
  scroll-driven string tension, light parallax) — a full physically-rigged
  3D puppet was out of scope to hand-build reliably in this session.
  `js/modules/hero-marionette.js` is written as a small, isolated module
  specifically so it can be replaced with a real Three.js scene later
  without touching any other file.
- **All artwork is a placeholder gradient** until real photos are added
  (see above) — this is intentional, not a bug.
- **Estedad font** falls back to Vazirmatn (Google Fonts) until the real
  font files are added.
- This has been checked for correct file paths and valid JS/JSON syntax, and
  smoke-tested by serving it locally — it has NOT been visually verified in
  an actual mobile browser. Test on a real device before shipping.
