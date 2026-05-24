/* =================================================================
   PINTANDO AVES PATAGONIA - script.js
   - Theme toggle (rain / sun) with Chromium-safe dual-video hero
   - Ambient canvas: raindrops (rain) / bird silhouettes (sun)
   - GSAP scroll reveal + card entrance animations
   - Gallery filter + image fallback handler
   ================================================================= */

'use strict';

/* ======================================
   0. WAIT FOR GSAP
====================================== */
function waitForGSAP(callback, attempts = 0) {
  if (typeof gsap !== 'undefined') {
    callback();
  } else if (attempts < 50) {
    setTimeout(() => waitForGSAP(callback, attempts + 1), 100);
  }
}

/* ======================================
   1. THEME MANAGEMENT
====================================== */
const body          = document.body;
const themeToggle   = document.getElementById('theme-toggle');
const ambientCanvas = document.getElementById('ambient-canvas');
const ctx           = ambientCanvas ? ambientCanvas.getContext('2d') : null;
const heroVideoRain = document.getElementById('hero-video-rain');
const heroVideoSun  = document.getElementById('hero-video-sun');

// Restore saved theme
const savedTheme = localStorage.getItem('pap-theme') || 'rain';
body.setAttribute('data-theme', savedTheme);

let currentTheme = savedTheme;

/**
 * Sync both hero videos to the active theme — Chromium-safe.
 *
 * KEY RULE: Never use display:none on <video> elements in Chromium.
 * When display is none, Chrome stops loading the media source entirely.
 * Instead we control visibility + opacity, which keeps the element in
 * the render tree so the browser continues buffering the video data.
 *
 * CSS handles the visual fade (opacity transition), but we also set
 * inline styles here as a belt-and-suspenders guarantee in case CSS
 * specificity is ever overridden by a third-party library.
 */
function syncHeroVideos(theme) {
  if (theme === 'sun') {
    if (heroVideoRain) heroVideoRain.pause();
    if (heroVideoSun) {
      heroVideoSun.play().catch(err => console.log("Espera interacción sol"));
    }
  } else {
    if (heroVideoSun) heroVideoSun.pause();
    if (heroVideoRain) {
      heroVideoRain.play().catch(err => console.log("Espera interacción lluvia"));
    }
  }
}

// Initial sync once the DOM is parsed and elements are available
window.addEventListener('DOMContentLoaded', function() {
  syncHeroVideos(currentTheme);
});

/* ── Logo: if logo-real.png is missing, onerror fires and shows SVG fallback.
   We hide logo-real initially to prevent a broken-image flash. ── */
const logoReal     = document.getElementById('logo-real');
const logoFallback = document.getElementById('logo-svg-fallback');
if (logoReal) {
  logoReal.style.display = 'none';
  logoReal.addEventListener('load', function() {
    logoReal.style.display = '';
    if (logoFallback) logoFallback.style.display = 'none';
  });
  if (logoFallback) logoFallback.style.display = 'block';
  // Cached image may already be complete when this script runs
  if (logoReal.complete && logoReal.naturalWidth) {
    logoReal.style.display = '';
    if (logoFallback) logoFallback.style.display = 'none';
  }
}

themeToggle && themeToggle.addEventListener('click', function() {
  currentTheme = currentTheme === 'rain' ? 'sun' : 'rain';
  body.setAttribute('data-theme', currentTheme);
  localStorage.setItem('pap-theme', currentTheme);

  // Sync both videos with Chromium-safe logic
  syncHeroVideos(currentTheme);

  // Restart particles for new theme
  initParticles();

  // Animate toggle button
  gsapSafe(function() {
    gsap.fromTo(themeToggle,
      { scale: 0.85, rotate: -10 },
      { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' }
    );
  });
});

// Helper to run GSAP safely
function gsapSafe(fn) {
  if (typeof gsap !== 'undefined') fn();
}

/* ======================================
   2. AMBIENT CANVAS - SETUP
====================================== */
function resizeCanvas() {
  if (!ambientCanvas) return;
  ambientCanvas.width  = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
}

window.addEventListener('resize', function() {
  resizeCanvas();
  initParticles();
});
resizeCanvas();

/* ======================================
   3. RAINDROP PARTICLES
====================================== */
class Raindrop {
  constructor() { this.reset(true); }

  reset(initial) {
    this.x      = Math.random() * ambientCanvas.width;
    this.y      = initial ? Math.random() * ambientCanvas.height : -20;
    this.len    = 8 + Math.random() * 14;
    this.speed  = 1.5 + Math.random() * 3;
    this.alpha  = 0.08 + Math.random() * 0.18;
    this.width  = 0.5 + Math.random() * 0.8;
    this.angleX = (Math.random() - 0.5) * 0.5;
  }

  update() {
    this.x += this.angleX;
    this.y += this.speed;
    if (this.y > ambientCanvas.height + this.len) this.reset(false);
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.angleX * this.len, this.y + this.len);
    ctx.strokeStyle = 'rgba(180,210,220,' + this.alpha + ')';
    ctx.lineWidth   = this.width;
    ctx.stroke();
  }
}

/* ======================================
   4. BIRD SILHOUETTE PARTICLES (sun)
====================================== */
class BirdSilhouette {
  constructor() { this.reset(true); }

  reset(initial) {
    const w = ambientCanvas.width;
    const h = ambientCanvas.height;
    this.size      = 12 + Math.random() * 22;
    this.speed     = 0.5 + Math.random() * 1.2;
    this.alpha     = 0.06 + Math.random() * 0.12;
    this.y         = initial ? Math.random() * h * 0.7 : (0.05 + Math.random() * 0.65) * h;
    this.x         = initial ? Math.random() * w : -this.size * 3;
    this.flapPhase = Math.random() * Math.PI * 2;
    this.flapSpeed = 0.06 + Math.random() * 0.06;
    this.driftY    = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.x += this.speed;
    this.y += this.driftY;
    this.flapPhase += this.flapSpeed;
    if (this.x > ambientCanvas.width + this.size * 3) this.reset(false);
  }

  draw() {
    const s    = this.size;
    const flap = Math.sin(this.flapPhase) * 0.35;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = '#1a4a2a';

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left wing
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.05);
    ctx.bezierCurveTo(
      -s * 0.5, -s * (0.35 + flap),
      -s * 0.9, -s * (0.1 + flap * 0.5),
      -s * 0.55, s * 0.05
    );
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.05);
    ctx.bezierCurveTo(
      s * 0.5, -s * (0.35 + flap),
      s * 0.9, -s * (0.1 + flap * 0.5),
      s * 0.55, s * 0.05
    );
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.08, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.beginPath();
    ctx.moveTo(s * 0.68, -s * 0.09);
    ctx.lineTo(s * 0.88, -s * 0.05);
    ctx.lineTo(s * 0.68, -s * 0.01);
    ctx.fill();

    ctx.restore();
  }
}

/* ======================================
   5. PARTICLE MANAGER
====================================== */
var particles = [];
var animFrame = null;

function initParticles() {
  particles = [];
  if (animFrame) cancelAnimationFrame(animFrame);
  if (!ctx) return;

  const theme = body.getAttribute('data-theme');

  if (theme === 'rain') {
    const count = Math.min(140, Math.floor(window.innerWidth / 8));
    for (let i = 0; i < count; i++) particles.push(new Raindrop());
  } else {
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) particles.push(new BirdSilhouette());
  }

  animateParticles();
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  animFrame = requestAnimationFrame(animateParticles);
}

// Start particles
initParticles();

/* ======================================
   5b. GALLERY IMAGE ERROR HANDLER
   When a real product photo fails to load, reveals the
   SVG placeholder hidden by default (style="display:none")
====================================== */
document.querySelectorAll('.gallery-card__photo').forEach(function(img) {
  if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
  img.addEventListener('error', function() { showPlaceholder(img); });
});

function showPlaceholder(img) {
  img.style.display = 'none';
  const ph = img.nextElementSibling;
  if (ph && ph.classList.contains('gallery-card__placeholder')) {
    ph.style.display        = 'flex';
    ph.style.alignItems     = 'center';
    ph.style.justifyContent = 'center';
  }
}

/* ======================================
   6. GSAP ANIMATIONS
====================================== */
waitForGSAP(function() {

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero entrance timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo('#logo',
    { opacity: 0, y: -40, scale: 0.9 },
    { opacity: 1, y: 0,   scale: 1,   duration: 1 }
  )
  .fromTo('.hero-tagline__title',
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0,  duration: 0.9 }, '-=0.5'
  )
  .fromTo('.hero-tagline__sub',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0,  duration: 0.7 }, '-=0.5'
  )
  .fromTo('#cta-explore',
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.4'
  )
  .fromTo('.scroll-hint',
    { opacity: 0 },
    { opacity: 0.7, duration: 0.6 }, '-=0.3'
  );

  // Stove entrance
  gsap.fromTo('.stove-decoration',
    { x: 60, opacity: 0 },
    { x: 0,  opacity: 1, duration: 1.2, delay: 0.8, ease: 'power2.out' }
  );

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.fromTo('.about-text',
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-section', start: 'top 75%' } }
    );
    gsap.fromTo('.about-visual__frame',
      { opacity: 0, x: 60, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-section', start: 'top 70%' } }
    );
    gsap.fromTo('.about-features li',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-features', start: 'top 80%' } }
    );
    gsap.fromTo('.gallery-card',
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0,  scale: 1,
        duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '#gallery-grid', start: 'top 80%' } }
    );
    gsap.fromTo('.process-step',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0,
        duration: 0.6, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.process-steps', start: 'top 80%' } }
    );
    gsap.fromTo('.footer-contact',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.site-footer', start: 'top 85%' } }
    );
    gsap.fromTo('.contact-btn',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1,
        duration: 0.5, stagger: 0.15, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.contact-buttons', start: 'top 90%' } }
    );
  }

  // Card 3D magnetic hover
  document.querySelectorAll('.gallery-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const r   = card.getBoundingClientRect();
      const x   = e.clientX - r.left - r.width  / 2;
      const y   = e.clientY - r.top  - r.height / 2;
      gsap.to(card, {
        rotationY: (x / r.width) * 5,
        rotationX: -(y / r.height) * 4,
        duration: 0.4, ease: 'power1.out', transformPerspective: 800,
      });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(card, {
        rotationY: 0, rotationX: 0,
        duration: 0.6, ease: 'power2.out', transformPerspective: 800,
      });
    });
  });

  // CTA pulse
  gsap.to('#cta-explore', {
    boxShadow: '0 0 0 10px rgba(0,0,0,0)',
    repeat: -1, duration: 1.5, ease: 'power1.inOut',
  });

  // Logo SVG fallback circle breathe
  gsap.to('.logo-watercolor__circle', {
    scale: 1.05, repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut',
  });

}); // end waitForGSAP

/* ======================================
   7. GALLERY FILTER
====================================== */
const filterBtns   = document.querySelectorAll('.filter-btn');
const galleryCards = document.querySelectorAll('.gallery-card');

filterBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    filterBtns.forEach(function(b) { b.classList.remove('filter-btn--active'); });
    btn.classList.add('filter-btn--active');
    const filter = btn.getAttribute('data-filter');
    galleryCards.forEach(function(card) {
      const cat  = card.getAttribute('data-category');
      const show = filter === 'all' || cat === filter;
      if (show) {
        card.classList.remove('hidden');
        gsapSafe(function() {
          gsap.fromTo(card,
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0,  scale: 1, duration: 0.45, ease: 'power2.out' }
          );
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ======================================
   8. SMOOTH SCROLL
====================================== */
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ======================================
   9. SCROLL REVEAL (CSS fallback)
====================================== */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length > 0 && 'IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function(el) { revealObs.observe(el); });
}

/* ======================================
   10. STOVE GLOW AMBIENT LIGHT
====================================== */
(function stoveGlow() {
  const stoveWindow = document.querySelector('.stove__window');
  if (!stoveWindow) return;
  let glowIntensity = 0;
  let increasing    = true;
  function pulse() {
    if (increasing) {
      glowIntensity += 0.015;
      if (glowIntensity >= 1) increasing = false;
    } else {
      glowIntensity -= 0.012;
      if (glowIntensity <= 0) increasing = true;
    }
    if (body.getAttribute('data-theme') === 'rain') {
      const alpha = 0.15 + glowIntensity * 0.25;
      stoveWindow.style.boxShadow =
        'inset 0 0 12px rgba(255,120,20,' + (0.3 + glowIntensity * 0.25) + '),' +
        '0 0 ' + (20 + glowIntensity * 30) + 'px rgba(255,100,10,' + alpha + ')';
    }
    requestAnimationFrame(pulse);
  }
  pulse();
})();

/* ======================================
   11. ACTIVE NAV LINK ON SCROLL
====================================== */
const sections = document.querySelectorAll('header[role="banner"], section[id], footer[id]');
const navLinks  = document.querySelectorAll('.site-nav a');
if ('IntersectionObserver' in window) {
  const navObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id || '';
        navLinks.forEach(function(link) {
          link.style.color = link.getAttribute('href') === ('#' + id)
            ? 'var(--accent-primary)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function(s) { navObs.observe(s); });
}

console.log('%c🦜 Pintando Aves Patagonia – Site loaded', 'color:#4caf70;font-weight:bold;font-size:14px;');

/* ======================================
   12. LIGHTBOX
====================================== */
(function initLightbox() {
  var lb         = document.getElementById('lightbox');
  var lbImg      = document.getElementById('lightbox-img');
  var lbCaption  = document.getElementById('lightbox-caption');
  var lbCounter  = document.getElementById('lightbox-counter');
  var lbClose    = document.getElementById('lightbox-close');
  var lbPrev     = document.getElementById('lightbox-prev');
  var lbNext     = document.getElementById('lightbox-next');
  var lbBackdrop = document.getElementById('lightbox-backdrop');

  if (!lb || !lbImg) return; // lightbox markup not found

  var images      = [];
  var currentIdx  = 0;
  var isAnimating = false;

  /* ── Open ── */
  function openLightbox(imgs, title, startIdx) {
    images     = imgs;
    currentIdx = startIdx || 0;

    // Toggle single-image class (hides nav arrows)
    lb.classList.toggle('single-image', images.length <= 1);

    renderImage(currentIdx, false);

    lb.setAttribute('aria-hidden', 'false');
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Trap focus on close button
    lbClose && lbClose.focus();
  }

  /* ── Close ── */
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Render image at index ── */
  function renderImage(idx, animate) {
    if (isAnimating) return;

    currentIdx = (idx + images.length) % images.length;
    var src    = images[currentIdx].src;
    var title  = images[currentIdx].title || '';

    if (animate) {
      isAnimating = true;
      lbImg.classList.add('is-loading');
    }

    var tmp = new Image();
    tmp.onload = function() {
      lbImg.src = src;
      lbImg.alt = title;
      if (lbCaption)  lbCaption.textContent  = title;
      if (lbCounter)  lbCounter.textContent  = images.length > 1
        ? (currentIdx + 1) + ' / ' + images.length
        : '';

      requestAnimationFrame(function() {
        lbImg.classList.remove('is-loading');
        isAnimating = false;
      });
    };
    tmp.onerror = function() {
      // show broken state gracefully
      lbImg.src = src;
      lbImg.classList.remove('is-loading');
      isAnimating = false;
    };
    tmp.src = src;
  }

  /* ── Navigation ── */
  function goPrev() { renderImage(currentIdx - 1, true); }
  function goNext() { renderImage(currentIdx + 1, true); }

  /* ── Parse data-images from a card ── */
  function parseCardImages(card) {
    var raw   = (card.getAttribute('data-images') || '').trim();
    var title = (card.getAttribute('data-title')  || '').trim();
    if (!raw) {
      // Fallback: read from the visible <img> inside the card
      var ph = card.querySelector('.gallery-card__photo');
      if (ph && ph.src) raw = ph.src;
    }
    return raw.split(',').map(function(s) {
      return { src: s.trim(), title: title };
    }).filter(function(o) { return o.src; });
  }

  /* ── Bind click on every gallery card ── */
  document.querySelectorAll('.gallery-card').forEach(function(card) {
    // Make the image wrapper keyboard/pointer focusable
    var wrap = card.querySelector('.gallery-card__image-wrap');
    if (wrap) {
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'button');
      wrap.setAttribute('aria-label', 'Ver imagen ampliada');
      wrap.style.cursor = 'zoom-in';

      function handleOpen() {
        var imgs = parseCardImages(card);
        if (imgs.length > 0) openLightbox(imgs, card.getAttribute('data-title'), 0);
      }

      wrap.addEventListener('click', handleOpen);
      wrap.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(); }
      });
    }
  });

  /* ── Controls ── */
  lbClose    && lbClose.addEventListener('click', closeLightbox);
  lbBackdrop && lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev     && lbPrev.addEventListener('click', goPrev);
  lbNext     && lbNext.addEventListener('click', goNext);

  /* ── Keyboard ── */
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   goPrev();
    if (e.key === 'ArrowRight')  goNext();
  });

  /* ── Touch swipe ── */
  var touchStartX = 0;
  lb.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? goNext() : goPrev(); }
  }, { passive: true });

})();

/* =================================================================
   BIRDS DIRECTORY MODAL
   ================================================================= */
(function() {
  var cards = document.querySelectorAll('.bird-card');
  var modal = document.getElementById('bird-modal');
  if (!modal || cards.length === 0) return;

  var closeBtn   = document.getElementById('bird-modal-close');
  var backdrop   = document.getElementById('bird-modal-backdrop');
  var modalImg   = document.getElementById('bird-modal-img');
  var modalTitle = document.getElementById('bird-modal-title');
  var modalDesc  = document.getElementById('bird-modal-desc');

  function openBirdModal(card) {
    var name = card.getAttribute('data-name');
    var desc = card.getAttribute('data-desc');
    var img  = card.querySelector('.bird-card__img');

    if (!img) return;

    modalImg.src = img.src;
    modalImg.alt = name;
    modalTitle.textContent = name;
    modalDesc.textContent  = desc;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBirdModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(function(card) {
    card.addEventListener('click', function() { openBirdModal(card); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBirdModal(card);
      }
    });
    // Accessibility for the card
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Ver detalles de ' + card.getAttribute('data-name'));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeBirdModal);
  if (backdrop) backdrop.addEventListener('click', closeBirdModal);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeBirdModal();
    }
  });
})();

