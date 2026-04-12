function resolveTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark';
}

function createNoopEngine() {
  return {
    start() {},
    stop() {},
  };
}

function createDarkGalaxyEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return createNoopEngine();
  }

  const NUM_PARTICLES = 65000;
  const CHARS = '  .·-~*:;=!+#$@';
  const FONT_SIZE = 12;
  const CELL_WIDTH = 7;
  const CELL_HEIGHT = 12;
  const DENSITY_SCALE = 0.48;

  const CRT_OFFSET_X = 1.2;
  const CRT_OFFSET_Y = 0.4;
  const BRIGHTNESS_BOOST = 2.0;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let gridLength = 0;
  let gridDensity = new Float32Array(0);
  let gridR = new Float32Array(0);
  let gridG = new Float32Array(0);
  let gridB = new Float32Array(0);
  let particles = [];

  let spin = 0;
  let targetPitch = 0.7939;
  let pitch = 0.7939;
  let targetYaw = 0.693;
  let yaw = 0.693;
  let targetZoom = 4.0;
  let zoom = 100.0;

  let autoDrift = false;
  let time = 0;

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let animationFrameId = null;
  let running = false;

  const listenerCleanup = [];

  const addListener = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listenerCleanup.push(() => target.removeEventListener(type, handler, options));
  };

  const removeAllListeners = () => {
    while (listenerCleanup.length) {
      const cleanup = listenerCleanup.pop();
      cleanup();
    }
  };

  const lerp = (start, end, t) => start + (end - start) * t;

  const getColor = (radius, maxRadius, isCore) => {
    const t = Math.pow(radius / maxRadius, 0.7);
    if (isCore) {
      const blend = radius / 2.5;
      return {
        r: lerp(55, 45, blend),
        g: lerp(60, 50, blend),
        b: lerp(70, 60, blend),
      };
    }
    if (t < 0.4) {
      const blend = t / 0.4;
      return {
        r: lerp(69, 45, blend),
        g: lerp(76, 50, blend),
        b: lerp(89, 59, blend),
      };
    }
    const blend = (t - 0.4) / 0.6;
    return {
      r: lerp(45, 26, blend),
      g: lerp(50, 30, blend),
      b: lerp(59, 38, blend),
    };
  };

  class Particle {
    constructor() {
      const maxRadius = 8.5;
      const typeRoll = Math.random();
      let radius;
      let angle;
      let isCore = false;

      if (typeRoll < 0.25) {
        isCore = true;
        radius = Math.pow(Math.random(), 2.0) * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        this.x = radius * Math.sin(phi) * Math.cos(theta);
        this.z = radius * Math.sin(phi) * Math.sin(theta);
        this.y = radius * Math.cos(phi) * 0.7;
      } else {
        radius = Math.pow(Math.random(), 1.2) * maxRadius;
        const numArms = 3;
        const armOffset =
          (Math.floor(Math.random() * numArms) * Math.PI * 2) / numArms;
        const twist = radius * 1.6;
        const scatterX =
          (Math.random() - 0.5) * 1.8 * (radius / maxRadius + 0.2);
        const scatterZ =
          (Math.random() - 0.5) * 1.8 * (radius / maxRadius + 0.2);
        angle = armOffset + twist;
        this.x = Math.cos(angle) * radius + scatterX;
        this.z = Math.sin(angle) * radius + scatterZ;
        const diskThickness = 0.4 * Math.exp(-radius / 3.0);
        this.y = (Math.random() - 0.5) * diskThickness;
      }

      const colors = getColor(radius, maxRadius, isCore);
      this.r = colors.r;
      this.g = colors.g;
      this.b = colors.b;
    }
  }

  const initParticles = () => {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle());
    }
  };

  const resize = () => {
    if (!canvas.parentElement) return;

    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / CELL_WIDTH);
    rows = Math.ceil(height / CELL_HEIGHT);
    gridLength = cols * rows;

    gridDensity = new Float32Array(gridLength);
    gridR = new Float32Array(gridLength);
    gridG = new Float32Array(gridLength);
    gridB = new Float32Array(gridLength);

    ctx.font = `bold ${FONT_SIZE}px "Courier New", Courier, monospace`;
    ctx.textBaseline = 'top';
  };

  const animate = () => {
    if (!running) return;

    time += 0.01;
    spin -= 0.0015;

    if (autoDrift) {
      targetYaw = 0.693 + Math.sin(time * 0.3) * 0.15;
      targetPitch = 0.7939 + Math.cos(time * 0.2) * 0.1;
    }

    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;
    zoom += (targetZoom - zoom) * 0.08;

    gridDensity.fill(0);
    gridR.fill(0);
    gridG.fill(0);
    gridB.fill(0);

    const perspective = 600;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p = particles[i];

      const px = p.x * cosSpin - p.z * sinSpin;
      const py = p.y;
      const pz = p.x * sinSpin + p.z * cosSpin;

      const cx = px;
      const cy = py * cosPitch - pz * sinPitch;
      const cz = py * sinPitch + pz * cosPitch;

      const fx = cx * cosYaw - cz * sinYaw;
      const fy = cy;
      let fz = cx * sinYaw + cz * cosYaw;

      fz += zoom;
      if (fz < 0.1) continue;

      let depthWeight = 12 / fz + 0.2;
      depthWeight *= 0.8 + 0.4 * Math.sin(time * 5 + i);

      const scale = perspective / fz;
      const sx = width / 2 + fx * scale;
      const sy = height / 2 + fy * scale;

      const col = Math.floor(sx / CELL_WIDTH);
      const row = Math.floor(sy / CELL_HEIGHT);

      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const idx = row * cols + col;
        gridDensity[idx] += depthWeight;
        gridR[idx] += p.r * depthWeight;
        gridG[idx] += p.g * depthWeight;
        gridB[idx] += p.b * depthWeight;
      }
    }

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const glowRadius = Math.max(width, height) * 0.45;
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius
    );
    glowGradient.addColorStop(0, 'rgba(45, 50, 59, 0.15)');
    glowGradient.addColorStop(0.5, 'rgba(26, 30, 38, 0.1)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter';

    const charLen = CHARS.length - 1;

    for (let i = 0; i < gridLength; i++) {
      const weight = gridDensity[i];
      if (weight > 0.1) {
        const r = Math.floor(
          Math.min(255, (gridR[i] / weight) * BRIGHTNESS_BOOST)
        );
        const g = Math.floor(
          Math.min(255, (gridG[i] / weight) * BRIGHTNESS_BOOST)
        );
        const b = Math.floor(
          Math.min(255, (gridB[i] / weight) * BRIGHTNESS_BOOST)
        );

        let charIdx = Math.floor(weight * DENSITY_SCALE);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const px = col * CELL_WIDTH;
        const py = row * CELL_HEIGHT;

        if (charIdx > 3) {
          const bgAlpha = Math.min(0.12, weight * 0.012);
          ctx.fillStyle = `rgba(${r}, 0, 0, ${bgAlpha})`;
          ctx.fillRect(
            px - CRT_OFFSET_X,
            py - CRT_OFFSET_Y,
            CELL_WIDTH,
            CELL_HEIGHT
          );
          ctx.fillStyle = `rgba(0, ${g}, 0, ${bgAlpha})`;
          ctx.fillRect(px, py, CELL_WIDTH, CELL_HEIGHT);
          ctx.fillStyle = `rgba(0, 0, ${b}, ${bgAlpha})`;
          ctx.fillRect(
            px + CRT_OFFSET_X,
            py + CRT_OFFSET_Y,
            CELL_WIDTH,
            CELL_HEIGHT
          );
        }

        if (charIdx > charLen) charIdx = charLen;
        const char = CHARS[charIdx];

        ctx.fillStyle = `rgb(${r}, 0, 0)`;
        ctx.fillText(char, px - CRT_OFFSET_X, py - CRT_OFFSET_Y);
        ctx.fillStyle = `rgb(0, ${g}, 0)`;
        ctx.fillText(char, px, py);
        ctx.fillStyle = `rgb(0, 0, ${b})`;
        ctx.fillText(char, px + CRT_OFFSET_X, py + CRT_OFFSET_Y);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    animationFrameId = requestAnimationFrame(animate);
  };

  const handleMouseDown = (event) => {
    isDragging = true;
    autoDrift = false;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    canvas.style.cursor = 'grabbing';
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;

    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;
    targetYaw += dx * 0.005;
    targetPitch += dy * 0.005;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  const handleMouseUp = () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  };

  const handleTouchStart = (event) => {
    isDragging = true;
    autoDrift = false;
    lastMouseX = event.touches[0].clientX;
    lastMouseY = event.touches[0].clientY;
    canvas.style.cursor = 'grabbing';
  };

  const handleTouchMove = (event) => {
    if (!isDragging) return;

    const dx = event.touches[0].clientX - lastMouseX;
    const dy = event.touches[0].clientY - lastMouseY;
    targetYaw += dx * 0.006;
    targetPitch += dy * 0.006;
    lastMouseX = event.touches[0].clientX;
    lastMouseY = event.touches[0].clientY;
  };

  const start = () => {
    if (running) return;

    running = true;
    spin = 0;
    targetPitch = 0.7939;
    pitch = 0.7939;
    targetYaw = 0.693;
    yaw = 0.693;
    targetZoom = 4.0;
    zoom = 100.0;
    autoDrift = false;
    time = 0;
    isDragging = false;
    canvas.style.cursor = 'grab';

    initParticles();
    resize();
    animate();

    addListener(window, 'resize', resize);
    if (window.visualViewport) {
      addListener(window.visualViewport, 'resize', resize);
    }
    addListener(window, 'mousemove', handleMouseMove);
    addListener(window, 'mouseup', handleMouseUp);
    addListener(window, 'touchmove', handleTouchMove, { passive: true });
    addListener(window, 'touchend', handleMouseUp);

    addListener(canvas, 'mousedown', handleMouseDown);
    addListener(canvas, 'touchstart', handleTouchStart, { passive: true });
  };

  const stop = () => {
    if (!running) return;

    running = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    removeAllListeners();
    isDragging = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return { start, stop };
}

function createLightSkyEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return createNoopEngine();
  }

  const FPS = 24;
  const SCROLL_STEP = 0.5;
  const MOBILE_FONT_SIZE = 8;
  const DESKTOP_FONT_SIZE = 10;
  const CHAR_ASPECT_RATIO = 0.62;
  const LINE_HEIGHT_RATIO = 0.92;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let fontSize = 0;
  let cellWidth = 0;
  let cellHeight = 0;

  let animationFrameId = null;
  let running = false;
  let offset = 0;
  let scrollPhase = 0;
  let frame = 0;
  let lastTime = 0;

  const listenerCleanup = [];

  const addListener = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listenerCleanup.push(() => target.removeEventListener(type, handler, options));
  };

  const removeAllListeners = () => {
    while (listenerCleanup.length) {
      const cleanup = listenerCleanup.pop();
      cleanup();
    }
  };

  const getConfig = () => window.__LIGHT_SKY_CONFIG;

  const resize = () => {
    if (!canvas.parentElement) return;

    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = width < 768 ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
    cellWidth = fontSize * CHAR_ASPECT_RATIO;
    cellHeight = fontSize * LINE_HEIGHT_RATIO;

    cols = Math.max(1, Math.ceil(width / cellWidth));
    rows = Math.max(1, Math.ceil(height / cellHeight));

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `700 ${fontSize}px "Courier New", Courier, monospace`;
  };

  const draw = () => {
    const config = getConfig();
    if (!config || !width || !height) return;

    const sourceRows = config.rows || 0;
    const sourceCols = config.cols || config.TARGET_LENGTH || 0;
    if (!sourceRows || !sourceCols) return;

    const contentStart = config.contentStartRow ?? 0;
    const contentRows = Math.max(1, config.contentRowCount || sourceRows);
    const windowStart = contentRows > rows ? Math.floor((contentRows - rows) / 2) : 0;

    ctx.clearRect(0, 0, width, height);

    const haze = ctx.createLinearGradient(0, 0, 0, height);
    haze.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
    haze.addColorStop(0.6, 'rgba(125, 211, 252, 0.07)');
    haze.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      const py = y * cellHeight;
      const sourceY =
        contentRows > rows
          ? contentStart + windowStart + y
          : contentStart + (y % contentRows);

      for (let x = 0; x < cols; x++) {
        const sourceX = (x + offset) % sourceCols;
        const char = config.getCell(sourceY, sourceX);
        const intensity = config.getIntensity(char);
        const px = x * cellWidth;

        if (intensity <= 0.02 || char === ' ') {
          const fallbackChar = (x + y + frame) % 6 < 2 ? ':' : '-';
          const ambientAlpha = (x * 17 + y * 11 + frame * 3) % 9 === 0 ? 0.09 : 0.045;
          ctx.globalAlpha = ambientAlpha;
          ctx.fillStyle = config.getColor(fallbackChar);
          ctx.fillText(fallbackChar, px, py);
          continue;
        }

        const twinkle = 0.82 + 0.18 * Math.sin(frame * 0.12 + x * 0.09 + y * 0.07);
        ctx.globalAlpha = Math.min(1, Math.max(0.08, intensity * twinkle));
        ctx.fillStyle = config.getColor(char);
        ctx.fillText(char, px, py);
      }
    }

    ctx.globalAlpha = 1;
  };

  const loop = (time) => {
    if (!running) return;

    const config = getConfig();
    if (!config) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    const fpsInterval = 1000 / FPS;
    const deltaTime = time - lastTime;

    if (deltaTime >= fpsInterval) {
      lastTime = time - (deltaTime % fpsInterval);
      const cycle = config.cols || config.TARGET_LENGTH || 1;
      scrollPhase = (scrollPhase + SCROLL_STEP) % cycle;
      offset = Math.floor(scrollPhase);
      frame += 1;
      draw();
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;

    const legacyLayer = canvas.parentElement?.querySelector('[data-light-sky-layer]');
    if (legacyLayer) {
      legacyLayer.remove();
    }

    running = true;
    offset = 0;
    scrollPhase = 0;
    frame = 0;

    resize();
    draw();
    addListener(window, 'resize', resize);

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!running) return;

    running = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    removeAllListeners();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return { start, stop };
}

function initHomeInteractions() {
  const DARK_HERO_IMAGE_SRC = '/hero-dark.png';
  const LIGHT_HERO_IMAGE_SRC = '/hero-light.png';

  // --- Navigation Scroll Tracking ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = Array.from(navBtns).map((btn) =>
    document.getElementById(btn.dataset.target)
  );

  function handleScroll() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    let activeId = 'home';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && section.offsetTop <= scrollPosition) {
        activeId = section.id;
        break;
      }
    }

    navBtns.forEach((btn) => {
      if (btn.dataset.target === activeId) {
        btn.className =
          'nav-btn text-lg md:text-xl transition-all duration-300 text-[#C83030] font-medium border-b border-[#C83030]';
      } else {
        btn.className =
          'nav-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent';
      }
    });
  }

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- Theme-Aware Hero Animation Engines ---
  const canvas = document.getElementById('galaxyCanvas');
  const heroFigureImage = document.getElementById('heroFigureImage');

  const applyHeroImageForTheme = (theme) => {
    if (!heroFigureImage) return;
    heroFigureImage.src = theme === 'light' ? LIGHT_HERO_IMAGE_SRC : DARK_HERO_IMAGE_SRC;
  };

  if (!canvas) return;

  const darkEngine = createDarkGalaxyEngine(canvas);
  const lightEngine = createLightSkyEngine(canvas);
  let activeEngine = null;

  const applyCanvasPresentation = (theme) => {
    if (theme === 'dark') {
      canvas.style.display = 'block';
      canvas.style.filter = 'blur(0.3px) contrast(1.1)';
      canvas.style.imageRendering = 'auto';
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.display = 'block';
      canvas.style.filter = 'none';
      canvas.style.imageRendering = 'auto';
      canvas.style.cursor = 'default';
    }
  };

  const switchEngine = (theme) => {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    const nextEngine = normalizedTheme === 'light' ? lightEngine : darkEngine;

    if (activeEngine === nextEngine) return;

    if (activeEngine) {
      activeEngine.stop();
    }

    applyCanvasPresentation(normalizedTheme);
    applyHeroImageForTheme(normalizedTheme);
    activeEngine = nextEngine;
    activeEngine.start();
  };

  switchEngine(resolveTheme());

  const handleThemeChange = (event) => {
    const requestedTheme = event?.detail?.theme;
    switchEngine(requestedTheme === 'light' ? 'light' : resolveTheme());
  };

  window.addEventListener('themechange', handleThemeChange);

  window.addEventListener('beforeunload', () => {
    window.removeEventListener('themechange', handleThemeChange);
    if (activeEngine) {
      activeEngine.stop();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeInteractions);
} else {
  initHomeInteractions();
}
