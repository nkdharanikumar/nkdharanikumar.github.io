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
