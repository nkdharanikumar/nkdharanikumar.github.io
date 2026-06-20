const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const year = document.querySelector("[data-year]");
const clock = document.querySelector("[data-clock]");
const cursor = document.querySelector(".cursor");
const trailRoot = document.querySelector(".cursor-trail");

year.textContent = new Date().getFullYear();

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

// --- Brand Name Hover Scramble Effect ---
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Initialize brand scramble effect
document.addEventListener("DOMContentLoaded", () => {
  const brandEl = document.querySelector(".brand-text");
  if (brandEl) {
    const fx = new TextScramble(brandEl);
    const brandContainer = brandEl.closest(".brand");
    
    if (brandContainer) {
      brandContainer.addEventListener("mouseenter", () => {
        fx.setText("Dharanikumar");
      });
      brandContainer.addEventListener("mouseleave", () => {
        fx.setText("DK");
      });
    }
  }
});

// --- Interactive Canvas ASCII Intro ---
let animFrameId;
function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  const canvas = document.getElementById("intro-canvas");
  if (!overlay || !canvas) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  // Track mouse coordinates inside canvas
  let mouse = { x: -9999, y: -9999, radius: 90 };
  
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    updateParticleTargets();
  });

  // Offscreen canvas to render bold text "DK" and sample it
  const offCanvas = document.createElement("canvas");
  offCanvas.width = 600;
  offCanvas.height = 300;
  const offCtx = offCanvas.getContext("2d");
  
  offCtx.fillStyle = "#000000";
  offCtx.fillRect(0, 0, 600, 300);
  offCtx.fillStyle = "#ffffff";
  offCtx.font = "900 180px 'Inter', sans-serif";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText("DK", 300, 150);

  const imgData = offCtx.getImageData(0, 0, 600, 300);
  const pixels = imgData.data;
  const particles = [];
  const grid = 7;
  const chars = [".", ":", "-", "^", "*", "!", "+", "=", "D", "K", "/", "\\", "|", "~"];

  for (let y = 0; y < 300; y += grid) {
    for (let x = 0; x < 600; x += grid) {
      const idx = (y * 600 + x) * 4;
      if (pixels[idx] > 128) { // White pixel
        const rx = x - 300;
        const ry = y - 150;
        particles.push({
          rx,
          ry,
          char: chars[Math.floor(Math.random() * chars.length)],
          color: Math.random() < 0.15 ? "#ff5a1f" : "#f7f0e7",
          size: Math.floor(Math.random() * 3) + 10, // 10px to 12px font
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0,
          vx: 0,
          vy: 0,
          alpha: 1,
          angle: 0,
          spin: 0,
          noiseX: Math.random() * 100,
          noiseY: Math.random() * 100,
          noiseSpeed: 0.01 + Math.random() * 0.02
        });
      }
    }
  }

  let exploded = false;
  let shakeX = 0;
  let shakeY = 0;

  function updateParticleTargets() {
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.max(0.6, Math.min(1.4, width / 600));
    
    particles.forEach((p) => {
      p.targetX = cx + p.rx * scale;
      p.targetY = cy + p.ry * scale;
      if (!exploded && p.x === 0 && p.y === 0) {
        // Initial slight offset for organic merge
        p.x = p.targetX + (Math.random() - 0.5) * 50;
        p.y = p.targetY + (Math.random() - 0.5) * 50;
      }
    });
  }

  updateParticleTargets();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Apply screen shake
    ctx.save();
    if (exploded) {
      shakeX *= 0.9;
      shakeY *= 0.9;
      ctx.translate(shakeX, shakeY);
    }

    particles.forEach((p) => {
      if (!exploded) {
        // Floating animation using noise
        p.noiseX += p.noiseSpeed;
        p.noiseY += p.noiseSpeed;
        const ox = Math.sin(p.noiseX) * 2;
        const oy = Math.cos(p.noiseY) * 2;
        
        const tx = p.targetX + ox;
        const ty = p.targetY + oy;

        // Repel from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 20;
          const pushY = Math.sin(angle) * force * 20;
          p.x += (tx + pushX - p.x) * 0.1;
          p.y += (ty + pushY - p.y) * 0.1;
        } else {
          p.x += (tx - p.x) * 0.08;
          p.y += (ty - p.y) * 0.08;
        }
      } else {
        // Explode physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.22; // gravity
        p.angle += p.spin;
        p.alpha -= 0.016;
        if (p.alpha < 0) p.alpha = 0;
      }

      if (p.alpha > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.angle !== 0) ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px "Space Mono", monospace`;
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }
    });

    ctx.restore();
    animFrameId = requestAnimationFrame(animate);
  }

  // Trigger explosion on click
  overlay.addEventListener("click", (e) => {
    if (exploded) return;
    exploded = true;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    particles.forEach((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let angle = dist === 0 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
      
      const force = Math.max(0.1, (600 - dist) / 600);
      const speed = (6 + Math.random() * 18) * force + (Math.random() * 4);

      p.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 3;
      p.vy = Math.sin(angle) * speed - (4 + Math.random() * 8); // push up
      p.spin = (Math.random() - 0.5) * 0.25;
    });

    shakeX = (Math.random() - 0.5) * 20;
    shakeY = (Math.random() - 0.5) * 20;

    overlay.classList.add("fade-out");

    setTimeout(() => {
      cancelAnimationFrame(animFrameId);
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 1200);
  });

  animate();
}

window.addEventListener("load", initIntro);

const updateClock = () => {
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now) + " IST";
};

setHeaderState();
updateClock();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.setInterval(updateClock, 1000);

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  });
});

if (window.matchMedia("(pointer: fine)").matches) {
  const trailDots = Array.from({ length: 5 }, () => {
    const dot = document.createElement("span");
    dot.className = "trail-dot";
    trailRoot.appendChild(dot);
    return { node: dot, x: 0, y: 0 };
  });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.add("is-visible");
    trailDots.forEach((dot) => {
      dot.node.style.opacity = "1";
    });
  });

  window.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
    trailDots.forEach((dot) => {
      dot.node.style.opacity = "0";
    });
  });

  document.querySelectorAll("a, button, .magnetic").forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });

  document.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      cursor.classList.remove("is-hovering");
      cursor.classList.add("is-viewing");
    });
    card.addEventListener("mouseleave", () => cursor.classList.remove("is-viewing"));
  });

  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

    trailDots.forEach((dot, index) => {
      const targetX = index === 0 ? cursorX : trailDots[index - 1].x;
      const targetY = index === 0 ? cursorY : trailDots[index - 1].y;
      dot.x += (targetX - dot.x) * 0.24;
      dot.y += (targetY - dot.y) * 0.24;
      dot.node.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
    });

    requestAnimationFrame(animateCursor);
  };

  animateCursor();
}

// --- Scroll Reveal Animation Logic ---
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
});
