function initHomeInteractions() {
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

  // --- Ascii Galaxy Canvas Logic ---
  const canvas = document.getElementById('galaxyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NUM_PARTICLES = 65000;
  const CHARS = '  .·-~*:;=!+#$@';
  const FONT_SIZE = 12;
  const CELL_WIDTH = 7;
  const CELL_HEIGHT = 12;
  const DENSITY_SCALE = 0.48;

  const CRT_OFFSET_X = 1.2;
  const CRT_OFFSET_Y = 0.4;
  const BRIGHTNESS_BOOST = 2.0;

  let width, height;
  let cols, rows, gridLength;
  let gridDensity, gridR, gridG, gridB;
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
  let animationFrameId;

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
    if (!canvas || !canvas.parentElement) return;
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;

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
          ctx.fillRect(px - CRT_OFFSET_X, py - CRT_OFFSET_Y, CELL_WIDTH, CELL_HEIGHT);
          ctx.fillStyle = `rgba(0, ${g}, 0, ${bgAlpha})`;
          ctx.fillRect(px, py, CELL_WIDTH, CELL_HEIGHT);
          ctx.fillStyle = `rgba(0, 0, ${b}, ${bgAlpha})`;
          ctx.fillRect(px + CRT_OFFSET_X, py + CRT_OFFSET_Y, CELL_WIDTH, CELL_HEIGHT);
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

  const handleMouseDown = (e) => {
    isDragging = true;
    autoDrift = false;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      targetYaw += dx * 0.005;
      targetPitch += dy * 0.005;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
  };

  const handleTouchStart = (e) => {
    isDragging = true;
    autoDrift = false;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const dx = e.touches[0].clientX - lastMouseX;
      const dy = e.touches[0].clientY - lastMouseY;
      targetYaw += dx * 0.006;
      targetPitch += dy * 0.006;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  };

  const handleWheel = () => {
    // Zoom intentionally locked.
  };

  initParticles();
  resize();
  animate();

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleMouseUp);

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('wheel', handleWheel, { passive: true });

  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeInteractions);
} else {
  initHomeInteractions();
}
