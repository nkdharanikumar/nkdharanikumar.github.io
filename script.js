/*
 * Portfolio Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initScrollReveal();
    initSmoothScroll();
    initMobileMenu();
    initFormHandler();
});

// Custom Cursor Logic
function initCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    // Only active on non-touch devices
    if (matchMedia('(pointer:fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight delay (animation usually done via CSS transition or requestAnimationFrame)
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Add hover effects for clickable elements
        const clickables = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-item');
        
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    } else {
        // Hide custom cursor on touch devices to avoid confusion
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
    }
}

// Scroll Reveal Animation (Intersection Observer)
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px"
    });

    reveals.forEach(reveal => revealObserver.observe(reveal));
}

// Navigation Visuals & Smooth Scroll
function initSmoothScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active state manually
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Mobile Menu (To be implemented with structure)
function initMobileMenu() {
    // Logic will be added once HTML structure for mobile toggle is confirmed
}

// Form Handling (Formspree)
function initFormHandler() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const button = form.querySelector('button[type="submit"]');
            const status = document.getElementById('form-status');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            button.disabled = true;

            const data = new FormData(event.target);
            
            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    status.innerHTML = "Thanks for your message! I'll get back to you soon 🚀";
                    status.style.color = "#4ade80"; // Green
                    form.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwnProperty.call(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        status.innerHTML = "Oops! There was a problem submitting your form";
                    }
                    status.style.color = "#f87171"; // Red
                }
            } catch (error) {
                status.innerHTML = "Oops! There was a problem submitting your form";
                status.style.color = "#f87171";
            }
            
            button.innerHTML = originalText;
            button.disabled = false;
        });
    }
}
