document.documentElement.classList.add('js');

const WHATSAPP_NUMBER = '393347278991';
const WHATSAPP_DEFAULT_MESSAGE = 'Ciao! Ho visto il vostro sito e vorrei informazioni per una nuova attività.';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildWhatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('#navWhatsapp, #whatsappHero, #whatsappContact').forEach(el => {
  el.setAttribute('href', buildWhatsappLink(WHATSAPP_DEFAULT_MESSAGE));
});

/* ---------------------------------------------------------------
   Mobile nav
   --------------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------------------------------------------------------------
   Navbar scrolled state + scroll progress bar
   --------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const progressFill = document.getElementById('progressFill');

function onScroll() {
  navbar.classList.toggle('is-scrolled', window.scrollY > 40);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  progressFill.style.width = `${progress}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------------------------------------------------------------
   Active nav link on scroll
   --------------------------------------------------------------- */
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('[data-nav]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navAnchors.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

/* ---------------------------------------------------------------
   Contact form -> WhatsApp
   --------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('fname').value.trim();
  const biz = document.getElementById('fbiz').value.trim();
  const city = document.getElementById('fcity').value;
  const msg = document.getElementById('fmsg').value.trim();

  let message = `Ciao! Sono ${name}, ho un'attività (${biz}) a ${city}.`;
  if (msg) message += ` ${msg}`;

  window.open(buildWhatsappLink(message), '_blank', 'noopener');
});

/* ---------------------------------------------------------------
   GSAP / ScrollTrigger / Lenis
   --------------------------------------------------------------- */
gsap.registerPlugin(ScrollTrigger);

if (!prefersReducedMotion) {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* Hero intro timeline
   Initial hidden state is set explicitly via standalone gsap.set() calls
   (which render synchronously) and the timeline below only ever animates
   TO explicit values. Chaining .from() inside a timeline is fragile here:
   a .from() tween captures its destination from whatever is on screen at
   construction time, and a preceding timeline.set() hasn't rendered yet at
   that point (timeline children only render once the playhead reaches
   them), so the destination gets captured as the still-hidden CSS state. */
gsap.set('.eyebrow[data-hero-el]', { opacity: 0, y: 16 });
gsap.set('[data-hero-line]', { yPercent: 110, opacity: 0 });
gsap.set('.hero-sub', { opacity: 0, y: 20 });
gsap.set('.hero-actions', { opacity: 0, y: 20 });
gsap.set('.hero-meta', { opacity: 0, y: 16 });
gsap.set('.hero-visual', { opacity: 0, x: 40 });
gsap.set('.floating-badge', { opacity: 0, y: 14, scale: 0.9 });

const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .to('.eyebrow[data-hero-el]', { y: 0, opacity: 1, duration: 0.7 }, 0.15)
  .to('[data-hero-line]', {
    yPercent: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.08,
  }, 0.25)
  .to('.hero-sub', { y: 0, opacity: 1, duration: 0.8 }, 0.55)
  .to('.hero-actions', { y: 0, opacity: 1, duration: 0.8 }, 0.68)
  .to('.hero-meta', { y: 0, opacity: 1, duration: 0.7 }, 0.78)
  .to('.hero-visual', {
    x: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power4.out',
  }, 0.35)
  .to('.floating-badge', {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.7,
    stagger: 0.12,
  }, 1.1);

/* Generic scroll reveal for section elements */
const revealEls = gsap.utils.toArray('.reveal');

revealEls.forEach((el) => {
  gsap.set(el, { opacity: 1 });
  gsap.from(el, {
    y: 46,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 87%',
      once: true,
    },
  });
});

/* Mockup parallax on mouse move (desktop, fine pointer only) */
const mockupWrap = document.getElementById('mockupWrap');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (mockupWrap && canHover && !prefersReducedMotion) {
  const rotateX = gsap.quickTo(mockupWrap, 'rotateX', { duration: 0.7, ease: 'power3.out' });
  const rotateY = gsap.quickTo(mockupWrap, 'rotateY', { duration: 0.7, ease: 'power3.out' });

  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const rect = mockupWrap.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    rotateY(-8 + relX * -10);
    rotateX(3 + relY * 8);
  });
}

/* Subtle scroll parallax on hero visual */
if (!prefersReducedMotion) {
  gsap.to('.hero-visual', {
    y: 60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}
