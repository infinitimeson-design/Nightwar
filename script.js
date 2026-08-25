/* ========== FX MODE ========== */
const FX = {
  mode: "full",
  viewportTier: "desktop",
  matrix: true,
  particles: true,
  particleCount: 40,
  matrixFps: 18,
  linkRadius: 120,
  particleLinks: true,
  pageVisible: true,
  reducedMotion: false,
};

const TIER_FX = {
  desktop: { matrix: true, particles: true, particleCount: 40, matrixFps: 18, particleLinks: true },
  laptop: { matrix: true, particles: true, particleCount: 30, matrixFps: 16, particleLinks: true },
  tablet: { matrix: true, particles: true, particleCount: 18, matrixFps: 15, particleLinks: true },
  mobile: { matrix: true, particles: true, particleCount: 12, matrixFps: 12, particleLinks: false },
  compact: { matrix: false, particles: true, particleCount: 8, matrixFps: 0, particleLinks: false },
};

const canvasRuntimes = {
  matrix: null,
  particles: null,
};

function detectViewportTier() {
  const width = window.innerWidth;
  if (width >= 1200) return "desktop";
  if (width >= 992) return "laptop";
  if (width >= 768) return "tablet";
  if (width > 420) return "mobile";
  return "compact";
}

function applyViewportTier(tier) {
  FX.viewportTier = tier;
  document.body.classList.remove("vp-desktop", "vp-laptop", "vp-tablet", "vp-mobile", "vp-compact");
  document.body.classList.add(`vp-${tier}`);
}

function detectFxMode() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "minimal";
  const tier = FX.viewportTier || detectViewportTier();
  if (tier === "compact") return "minimal";
  if (tier === "mobile") return "lite";
  if (tier === "tablet" || tier === "laptop") return "lite";
  return "full";
}

function applyTierSettings(tier) {
  const settings = TIER_FX[tier] || TIER_FX.desktop;
  FX.matrix = settings.matrix;
  FX.particles = settings.particles;
  FX.particleCount = settings.particleCount;
  FX.matrixFps = settings.matrixFps;
  FX.particleLinks = settings.particleLinks;
}

function applyFxMode(mode) {
  FX.mode = mode;
  FX.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tier = FX.viewportTier || detectViewportTier();

  if (mode === "minimal") {
    FX.matrix = false;
    FX.particles = false;
    FX.particleCount = 0;
    FX.matrixFps = 0;
    FX.particleLinks = false;
  } else {
    applyTierSettings(tier);
  }

  document.body.classList.remove("fx-full", "fx-lite", "fx-minimal");
  document.body.classList.add(`fx-${mode}`);

  canvasRuntimes.matrix?.syncMode();
  canvasRuntimes.particles?.syncMode();
}

function syncResponsiveState() {
  applyViewportTier(detectViewportTier());
  applyFxMode(detectFxMode());
}

function setupFxLifecycle() {
  syncResponsiveState();

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => {
    syncResponsiveState();
  });

  document.addEventListener("visibilitychange", () => {
    FX.pageVisible = !document.hidden;
    if (FX.pageVisible) {
      canvasRuntimes.matrix?.start();
      canvasRuntimes.particles?.start();
    } else {
      canvasRuntimes.matrix?.stop();
      canvasRuntimes.particles?.stop();
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => syncResponsiveState(), 200);
  });
}

function shouldReduceMotion() {
  return FX.reducedMotion || FX.mode === "minimal";
}

/* ========== HERO 3D (floating glass terminal) ========== */

function paintTerminalScreen(ctx, width, height) {
  // Draws the same "mini terminal" graphic used as the 3D screen's
  // texture and as the flat 2D fallback - real strings from the page's
  // own code-rain content, in the site's own palette, so it reads as
  // part of the same design rather than a generic placeholder.
  const lines = [
    { text: 'const portfolio = "SCdev";', color: "#7ee787" },
    { text: "build.cleanUI();", color: "#00d4ff" },
    { text: "design.responsive();", color: "#bd00ff" },
    { text: "skills.map(render);", color: "#00ff41" },
    { text: "return creativeExperience;", color: "#00d4ff" },
  ];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#05080c";
  ctx.fillRect(0, 0, width, height);

  const barHeight = height * 0.14;
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, width, barHeight);

  const dotRadius = barHeight * 0.16;
  const dotY = barHeight / 2;
  const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
  dotColors.forEach((color, index) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(barHeight * 0.5 + index * dotRadius * 2.6, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  const fontSize = Math.max(12, Math.floor(height / 13));
  ctx.font = `600 ${fontSize}px "Fira Code", monospace`;
  ctx.textBaseline = "top";

  const lineGap = (height - barHeight) / (lines.length + 1);
  lines.forEach((line, index) => {
    ctx.shadowColor = line.color;
    ctx.shadowBlur = fontSize * 0.6;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, width * 0.06, barHeight + lineGap * (index + 0.7), width * 0.88);
  });
  ctx.shadowBlur = 0;
}

function sizeCanvasToBox(canvas) {
  const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 320;
  const height = canvas.clientHeight || width;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  return { width, height, dpr };
}

function drawStaticHeroFallback(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height, dpr } = sizeCanvasToBox(canvas);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintTerminalScreen(context, width, height);
}

async function setupHero3D() {
  const canvas = document.getElementById("hero-3d-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  // Deliberately NOT using shouldReduceMotion() here - that helper also
  // returns true for the "compact" viewport tier (nearly every phone in
  // portrait), which is a performance knob for the matrix/particle
  // canvases, not a real motion preference. The 3D scene here is cheap
  // (a handful of boxes + one small texture), so it only skips for an
  // actual OS-level reduced-motion preference.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    drawStaticHeroFallback(canvas);
    return;
  }

  const hasWebGL = (() => {
    try {
      const test = document.createElement("canvas");
      return !!(test.getContext("webgl2") || test.getContext("webgl"));
    } catch (error) {
      return false;
    }
  })();

  if (!hasWebGL) {
    drawStaticHeroFallback(canvas);
    return;
  }

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    initHero3DScene(THREE, canvas);
  } catch (error) {
    drawStaticHeroFallback(canvas);
  }
}

function initHero3DScene(THREE, canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 4);

  const group = new THREE.Group();
  group.rotation.set(-0.14, 0.22, 0);
  scene.add(group);

  const bezelGeometry = new THREE.BoxGeometry(2.5, 1.55, 0.12);
  const bezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1117,
    transparent: true,
    opacity: 0.55,
    roughness: 0.35,
    metalness: 0.4,
  });
  const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
  group.add(bezel);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(bezelGeometry),
    new THREE.LineBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.55 }),
  );
  group.add(edges);

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const screenCtx = screenCanvas.getContext("2d");
  if (screenCtx) paintTerminalScreen(screenCtx, screenCanvas.width, screenCanvas.height);

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.22, 1.34),
    new THREE.MeshBasicMaterial({ map: screenTexture }),
  );
  screen.position.z = 0.07;
  group.add(screen);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const glowBlue = new THREE.PointLight(0x00d4ff, 1.1, 12);
  glowBlue.position.set(-2, 1.5, 2.5);
  scene.add(glowBlue);
  const glowPurple = new THREE.PointLight(0xbd00ff, 0.8, 12);
  glowPurple.position.set(2, -1.2, 2);
  scene.add(glowPurple);

  const heroSection = document.getElementById("hero");

  const getScrollProgress = () => {
    if (!heroSection) return 0;
    const rect = heroSection.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const scrolled = window.innerHeight - rect.top;
    return Math.min(1, Math.max(0, scrolled / total));
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  let visible = false;
  let frameId = null;

  const animate = (time) => {
    if (!visible || !FX.pageVisible) {
      frameId = null;
      return;
    }

    const progress = getScrollProgress();
    group.rotation.y = 0.22 + progress * 0.55;
    group.rotation.x = -0.14 - progress * 0.16;
    group.position.y = progress * -0.18;
    group.rotation.z = Math.sin(time * 0.0006) * 0.02;

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (frameId !== null) return;
    frameId = window.requestAnimationFrame(animate);
  };

  const stop = () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && visible) start();
    else stop();
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
}

document.addEventListener("DOMContentLoaded", () => {
  setupFxLifecycle();
  canvasRuntimes.matrix = setupMatrixCanvas();
  canvasRuntimes.particles = setupParticlesCanvas();
  setupSidebar();
  setupTyping();
  setupLineNumbers();
  setupNavigation();
  setupRevealAnimations();
  setupCounters();
  setupSkillBars();
  setupCursor();
  setupMagnetic();
  setupContactForm();
  setupHero3D();
});

function setupTyping() {
  const items = [
    { selector: "#typing-name", text: "Full Stack Developer" },
    { selector: "#typing-role", text: "Senior Software Engineer" },
    { selector: "#typing-passion", text: "Building scalable web apps" },
  ];
  const cursor = document.getElementById("hero-cursor");

  if (shouldReduceMotion()) {
    items.forEach((item) => {
      const element = document.querySelector(item.selector);
      if (element) element.textContent = item.text;
    });
    if (cursor) {
      const lastElement = document.querySelector(items[items.length - 1].selector);
      lastElement?.after(cursor);
    }
    return;
  }

  let delay = 300;
  items.forEach((item) => {
    const element = document.querySelector(item.selector);
    if (!element) return;

    window.setTimeout(() => {
      if (cursor) element.after(cursor);
      typeText(element, item.text, 0, cursor);
    }, delay);

    delay += estimateTypingDuration(item.text) + 450;
  });
}

function estimateTypingDuration(text) {
  // Same average pace as the per-character jitter below, used only to
  // schedule when the *next* line should start.
  return text.length * 48;
}

function typeText(element, text, index, cursor) {
  if (index > text.length) return;

  element.textContent = text.slice(0, index);

  const character = text[index - 1] || "";
  const pauseAfterPunctuation = /[.,!?]/.test(character) ? 160 : 0;
  const jitter = 28 + Math.random() * 40;

  window.setTimeout(
    () => typeText(element, text, index + 1, cursor),
    jitter + pauseAfterPunctuation,
  );
}

function setupLineNumbers() {
  const lineNumberContainer = document.querySelector("#about-lines");
  const codeBlock = document.querySelector(".code-content code");
  if (!lineNumberContainer || !codeBlock) return;

  const lineCount = codeBlock.textContent.split("\n").length;
  lineNumberContainer.textContent = Array.from(
    { length: lineCount },
    (_, index) => index + 1,
  ).join("\n");
}

function setupMatrixCanvas() {
  const canvas = document.querySelector("#matrix-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@";
  const fontSize = 14;
  let columns = 0;
  let drops = [];
  let animationId = null;
  let lastFrame = 0;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * canvas.height);
  };

  const draw = () => {
    context.fillStyle = "rgba(10, 10, 10, 0.08)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#00ff41";
    context.font = `${fontSize}px Fira Code, monospace`;

    drops.forEach((drop, index) => {
      const character = characters[Math.floor(Math.random() * characters.length)];
      context.fillText(character, index * fontSize, drop * fontSize);

      if (drop * fontSize > canvas.height && Math.random() > 0.975) {
        drops[index] = 0;
      } else {
        drops[index] += 1;
      }
    });
  };

  const loop = (timestamp) => {
    if (!FX.matrix || !FX.pageVisible) {
      animationId = null;
      return;
    }

    const frameInterval = FX.matrixFps > 0 ? 1000 / FX.matrixFps : Infinity;
    if (timestamp - lastFrame >= frameInterval) {
      lastFrame = timestamp;
      draw();
    }

    animationId = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (!FX.matrix || !FX.pageVisible || animationId !== null) return;
    lastFrame = 0;
    animationId = window.requestAnimationFrame(loop);
  };

  const stop = () => {
    if (animationId !== null) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const syncMode = () => {
    stop();
    if (FX.matrix) start();
  };

  resize();
  window.addEventListener("resize", resize);
  start();

  return { start, stop, syncMode };
}

function setupParticlesCanvas() {
  const canvas = document.querySelector("#particles-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const context = canvas.getContext("2d");
  if (!context) return null;

  let particles = [];
  let animationId = null;
  let mouseX = 0;
  let mouseY = 0;
  let mouseKnown = false;
  const mouseRadius = 150;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      mouseKnown = true;
    },
    { passive: true },
  );

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = FX.particleCount;

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
    }));
  };

  const drawLinks = () => {
    if (!mouseKnown || !FX.particleLinks) return;

    const nearMouse = particles.filter(
      (particle) => Math.hypot(particle.x - mouseX, particle.y - mouseY) < mouseRadius,
    );

    for (let index = 0; index < nearMouse.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < nearMouse.length; nextIndex += 1) {
        const a = nearMouse[index];
        const b = nearMouse[nextIndex];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance < FX.linkRadius) {
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(0, 212, 255, ${1 - distance / FX.linkRadius})`;
          context.lineWidth = 0.5;
          context.stroke();
        }
      }
    }
  };

  const draw = () => {
    if (!FX.particles || !FX.pageVisible) {
      animationId = null;
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(0, 212, 255, 0.55)";
      context.fill();
    });

    drawLinks();
    animationId = window.requestAnimationFrame(draw);
  };

  const start = () => {
    if (!FX.particles || !FX.pageVisible || animationId !== null) return;
    animationId = window.requestAnimationFrame(draw);
  };

  const stop = () => {
    if (animationId !== null) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const syncMode = () => {
    stop();
    resize();
    if (FX.particles) start();
  };

  resize();
  window.addEventListener("resize", resize);
  start();

  return { start, stop, syncMode };
}

function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  if (!sidebar || !toggle || !overlay) return;

  const isDrawerMode = () => {
    const tier = FX.viewportTier || detectViewportTier();
    return tier === "mobile" || tier === "compact";
  };

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    overlay.setAttribute("aria-hidden", "true");
  };

  const openSidebar = () => {
    if (!isDrawerMode()) return;
    sidebar.scrollTop = 0;
    const nav = sidebar.querySelector(".sidebar-nav");
    if (nav) nav.scrollTop = 0;
    document.body.classList.add("sidebar-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    overlay.setAttribute("aria-hidden", "false");
  };

  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  window.addEventListener("resize", () => {
    if (!isDrawerMode()) closeSidebar();
  });
}

function setupNavigation() {
  const links = Array.from(document.querySelectorAll(".sidebar-link"));
  const toggle = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  const sectionIds = ["hero", "about", "skills", "projects", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }
    if (overlay) overlay.setAttribute("aria-hidden", "true");
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href") || "");
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeSidebar();
    });
  });

  const updateActiveLink = () => {
    let current = null;

    for (let index = sections.length - 1; index >= 0; index -= 1) {
      if (sections[index].getBoundingClientRect().top <= 120) {
        current = sections[index];
        break;
      }
    }

    if (!current) return;

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  };

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });
}

function supportsScrollDrivenAnimations() {
  return typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "view()");
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll(
    ".section-header, .terminal-window, .about-stats, .skill-category, .project-card, .contact-terminal, .contact-info",
  );

  elements.forEach((element) => element.classList.add("reveal"));

  // style.css handles this natively via animation-timeline: view() when
  // supported (see the matching @supports block) - skip the JS/observer
  // path there so only one reveal system runs.
  if (supportsScrollDrivenAnimations()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  elements.forEach((element) => observer.observe(element));
}

function setupCounters() {
  const counters = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.getAttribute("data-target") || "0");
        animateCounter(element, target);
        observer.unobserve(element);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(element, target) {
  if (shouldReduceMotion()) {
    element.textContent = String(target);
    return;
  }

  let current = 0;
  const step = Math.max(1, Math.ceil(target / 80));

  const tick = () => {
    current = Math.min(target, current + step);
    element.textContent = String(current);

    if (current < target) {
      window.requestAnimationFrame(tick);
    }
  };

  tick();
}

function setupSkillBars() {
  if (supportsScrollDrivenAnimations()) return;

  const skills = document.querySelectorAll(".skill-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 },
  );

  skills.forEach((skill) => observer.observe(skill));
}

function setupCursor() {
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".cursor-follower");
  if (!cursor || !follower) return;

  window.addEventListener("mousemove", (event) => {
    cursor.style.transform = `translate(${event.clientX - 6}px, ${event.clientY - 6}px)`;
    follower.style.transform = `translate(${event.clientX - 15}px, ${event.clientY - 15}px)`;
  });
}

function setupMagnetic() {
  // Only for devices with a real mouse and no motion-reduction preference -
  // touch has no hover, so this must never attach on mobile/tablet.
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover || shouldReduceMotion()) return;

  const targets = document.querySelectorAll(
    ".sidebar-link, .sidebar-toggle, .sidebar-social .social-link, .submit-btn",
  );

  targets.forEach((element) => {
    const pull = element.classList.contains("submit-btn") ? 0.2 : 0.35;
    const maxOffset = element.classList.contains("submit-btn") ? 6 : 10;

    element.classList.add("magnetic");

    element.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-maxOffset, Math.min(maxOffset, relX * pull));
      const y = Math.max(-maxOffset, Math.min(maxOffset, relY * pull));
      element.style.transform = `translate(${x}px, ${y}px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const response = document.querySelector("#form-response");
  if (!(form instanceof HTMLFormElement) || !response) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = getInputValue("#name");
    const email = getInputValue("#email");
    const subject = getInputValue("#subject");
    const message = getInputValue("#message");

    if (!name || !email || !subject || !message) {
      showFormResponse(response, "Please fill out every field.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormResponse(response, "Please enter a valid email address.");
      return;
    }

    showFormResponse(response, "Message prepared successfully. Connect a backend endpoint to send it.");
    form.reset();
  });
}

function sanitizeInput(value) {
  return value.replace(/[<>]/g, "").trim();
}

function getInputValue(selector) {
  const field = document.querySelector(selector);
  return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    ? sanitizeInput(field.value)
    : "";
}

function showFormResponse(element, message) {
  element.classList.add("show");
  element.textContent = "";

  const textNode = document.createElement("span");
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "|";
  element.append(textNode, cursor);

  let index = 0;
  const typeNext = () => {
    index += 1;
    textNode.textContent = message.slice(0, index);
    if (index < message.length) {
      window.setTimeout(typeNext, 22 + Math.random() * 30);
    } else {
      cursor.remove();
    }
  };

  if (shouldReduceMotion()) {
    textNode.textContent = message;
    cursor.remove();
    return;
  }

  window.setTimeout(typeNext, 120);
}
