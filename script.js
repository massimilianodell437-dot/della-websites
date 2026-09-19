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
  progressFill.style.height = `${progress}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------------------------------------------------------------
   Active nav link on scroll
   --------------------------------------------------------------- */
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('[data-nav]');

let lastActiveSectionId = null;

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navAnchors.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
    });

    if (id !== lastActiveSectionId) {
      lastActiveSectionId = id;
      progressFill.classList.remove('is-pulsing');
      // eslint-disable-next-line no-unused-expressions
      progressFill.offsetWidth; // force reflow so the animation restarts
      progressFill.classList.add('is-pulsing');
    }
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
   GSAP / ScrollTrigger / CustomEase / Lenis

   Named motion system — every GSAP tween below uses one of these
   three, matching the exact CSS cubic-bezier curves 1:1 (no drift
   between CSS-driven and JS-driven motion):
   - easeReveal (0.16,1,0.3,1): scroll reveals, page-load elements
   - easeHover (0.65,0,0.35,1): hover/interaction states
   - easeTransition (0.83,0,0.17,1): page/section transitions
   --------------------------------------------------------------- */
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('easeReveal', '0.16, 1, 0.3, 1');
CustomEase.create('easeHover', '0.65, 0, 0.35, 1');
CustomEase.create('easeTransition', '0.83, 0, 0.17, 1');

/* Piazzolla (the display serif used in every heading) loads async via
   Google Fonts — if it swaps in after ScrollTrigger has already measured
   trigger positions off the fallback font's metrics, everything below
   the fold can reflow and throw those positions off until something
   forces a recalculation. Refresh once fonts and the full page (images
   included) have actually settled, so trigger points reflect final layout. */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener('load', () => ScrollTrigger.refresh());

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

/* Page-load signature sequence
   Initial hidden state is set explicitly via standalone gsap.set() calls
   (which render synchronously) and the timeline below only ever animates
   TO explicit values. Chaining .from() inside a timeline is fragile here:
   a .from() tween captures its destination from whatever is on screen at
   construction time, and a preceding timeline.set() hasn't rendered yet at
   that point (timeline children only render once the playhead reaches
   them), so the destination gets captured as the still-hidden CSS state.

   Order: brief hold on bg-primary -> logo clip-path wipe -> nav items
   stagger in -> headline reveals word-by-word (up + slight rotation,
   settling to 0) -> supporting copy follows. */
gsap.set('.logo img', { clipPath: 'inset(0 100% 0 0)' });
gsap.set('#navLinks a, .nav-cta', { opacity: 0, y: 10 });
gsap.set('.hero-sub', { opacity: 0, y: 20 });
gsap.set('.hero-actions', { opacity: 0, y: 20 });
gsap.set('.hero-visual', { opacity: 0, y: 20 });

/* Split the two headline lines into words so each one can animate up
   with its own slight rotation. Falls back to a plain reveal of the
   whole line if SplitType didn't load (offline CDN, etc.). */
const heroSplit = (typeof SplitType !== 'undefined')
  ? new SplitType('.hero-title .title-line', { types: 'words', wordClass: 'word' })
  : null;
const heroWords = heroSplit ? heroSplit.words : gsap.utils.toArray('.hero-title .title-line');
const randomTilt = () => prefersReducedMotion ? 0 : (Math.random() < 0.5 ? -1 : 1) * gsap.utils.random(2, 4);
gsap.set(heroWords, { opacity: 0, yPercent: 100, rotate: randomTilt });

/* Hero stats count-up — any number visible above the fold at load
   (the "+64%" badge, the mockup's 120+ / 4.9★ / 7gg) charges up from 0
   to its real value once, right after the hero intro reveal finishes,
   staggered ~150ms apart. Reset to a zeroed label now so nothing
   flashes the final value while still hidden by the intro timeline. */
function formatCount(target, decimals, prefix, suffix) {
  return `${prefix}${target.toFixed(decimals)}${suffix}`;
}

const heroCountEls = gsap.utils.toArray('.hero [data-count-to]');
heroCountEls.forEach((el) => {
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
  el.textContent = formatCount(0, decimals, el.dataset.prefix || '', el.dataset.suffix || '');
});

function startHeroCountUps() {
  heroCountEls.forEach((el, i) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = formatCount(target, decimals, prefix, suffix);
      return;
    }

    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: target,
      duration: 1.1,
      delay: i * 0.15,
      ease: 'easeReveal',
      onUpdate: () => { el.textContent = formatCount(proxy.val, decimals, prefix, suffix); },
    });
  });
}

const heroTl = gsap.timeline({ defaults: { ease: 'easeReveal' } });

heroTl
  // 1. brief hold on solid bg-primary before anything moves
  .to({}, { duration: prefersReducedMotion ? 0.01 : 0.2 })
  // 2. logo reveals via a clip-path wipe, not an opacity fade
  .to('.logo img', { clipPath: 'inset(0 0% 0 0)', duration: 0.4 })
  // 3. nav items stagger in, 60ms apart, overlapping the tail of the wipe
  .to('#navLinks a, .nav-cta', { opacity: 1, y: 0, duration: 0.25, stagger: 0.06 }, '-=0.25')
  // 4. headline reveals word-by-word: up + slight rotation settling to 0
  .to(heroWords, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.5, stagger: 0.025 }, '-=0.2')
  .to('.hero-sub', { y: 0, opacity: 1, duration: 0.6 }, '-=0.25')
  .to('.hero-actions', { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
  .to('.hero-visual', { y: 0, opacity: 1, duration: 0.7 }, '-=0.45')
  .call(startHeroCountUps);

/* Scroll reveals — triggered once at ~78% viewport entry (anticipated,
   not delayed), not continuous scrub: this is content arriving, not
   something structurally tied to live scroll position like the
   horizontal timeline or hero parallax below. Three deliberately
   different treatments so the page doesn't read as one animation
   copy-pasted everywhere:
   - Headlines: masked lines slide up from their own clip boundary
   - Body copy: simple opacity + 20px Y — restraint matters here
   - Portfolio images: clip-path wipe + scale-down from 1.05 to 1.0
   Every group staggers 60-100ms per item; nothing syncs in unison. */
gsap.utils.toArray('.section-title').forEach((title) => {
  const lines = title.querySelectorAll('.line');
  if (!lines.length) return;
  gsap.set(lines, { yPercent: 100 });
  gsap.to(lines, {
    yPercent: 0,
    duration: 0.8,
    ease: 'easeReveal',
    stagger: 0.08,
    scrollTrigger: { trigger: title, start: 'top 78%', once: true },
  });
});

gsap.set('.reveal', { opacity: 0, y: 20 });
ScrollTrigger.batch('.reveal', {
  start: 'top 78%',
  once: true,
  onEnter: (batch) => gsap.to(batch, {
    opacity: 1, y: 0, duration: 0.7, ease: 'easeReveal', stagger: 0.07,
  }),
});

gsap.set('.reveal-image', { clipPath: 'inset(0 0 100% 0)', scale: 1.05, opacity: 0 });
ScrollTrigger.batch('.reveal-image', {
  start: 'top 78%',
  once: true,
  onEnter: (batch) => gsap.to(batch, {
    clipPath: 'inset(0 0 0% 0)', scale: 1, opacity: 1, duration: 0.9, ease: 'easeReveal', stagger: 0.1,
  }),
});

/* Problem -> Solution scroll-pinned dissolve. Pins the statement for
   one viewport-height of scroll while the problem statement fades/
   drifts up and out and the solution statement fades/drifts in, with
   enough overlap to read as one statement transforming into the
   other. Driven entirely by scrub progress, so it reverses cleanly on
   scroll-up — nothing here is a one-shot animation. */
const problemPin = document.getElementById('problemPin');

if (problemPin && !prefersReducedMotion) {
  const problemStatement = problemPin.querySelector('.statement--problem');
  const solutionStatement = problemPin.querySelector('.statement--solution');

  gsap.set(solutionStatement, { opacity: 0, y: 40 });

  const dissolveTl = gsap.timeline({
    scrollTrigger: {
      trigger: problemPin,
      start: 'top top',
      end: '+=100%',
      scrub: 0.4,
      pin: true,
      anticipatePin: 1,
    },
  });

  dissolveTl
    .to(problemStatement, { opacity: 0, y: -50, ease: 'none', duration: 0.5 }, 0)
    .to(solutionStatement, { opacity: 1, y: 0, ease: 'none', duration: 0.5 }, 0.3);
}

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------------------------------------------------------
   Services — glass cards: staggered scroll-scrub entrance, cursor-XY
   tilt on hover, and a scroll-triggered (once) price count-up. No
   idle/ambient motion once settled — these cards hold text the visitor
   needs to read, so once the entrance animation finishes the layout
   stays still until the user's cursor moves over a card.
   --------------------------------------------------------------- */
const planCards = gsap.utils.toArray('.plan-card');

if (planCards.length) {
  gsap.set(planCards, { opacity: 0, y: 50 });

  const cardsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 85%',
      end: 'top 40%',
      scrub: 0.5,
    },
  });
  planCards.forEach((card, i) => {
    cardsTl.to(card, { opacity: 1, y: 0, ease: 'none', duration: 0.5 }, i * 0.15);
  });

  if (canHover && !prefersReducedMotion) {
    const TILT_MAX = 9;

    planCards.forEach((card) => {
      const baseScale = card.classList.contains('plan-card--featured') ? 1.04 : 1;

      const setRotateX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'easeHover' });
      const setRotateY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'easeHover' });
      // 'scale' (like 'rotateX'/'rotateY') isn't reliable as a quickTo
      // property string on a fresh element — scaleX/scaleY are the
      // real, unaliased properties and compose the same visual result.
      const setScaleX = gsap.quickTo(card, 'scaleX', { duration: 0.4, ease: 'easeHover' });
      const setScaleY = gsap.quickTo(card, 'scaleY', { duration: 0.4, ease: 'easeHover' });
      const setScale = (v) => { setScaleX(v); setScaleY(v); };
      setScale(baseScale);

      // tilt tracks the cursor's exact position within THIS card's own
      // bounds (classic tilt-card technique) — not a grid-wide proximity
      // field.
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        setRotateY((px - 0.5) * 2 * TILT_MAX);
        setRotateX(-(py - 0.5) * 2 * TILT_MAX);
      });

      card.addEventListener('mouseenter', () => setScale(baseScale * 1.02));
      card.addEventListener('mouseleave', () => {
        setScale(baseScale);
        setRotateX(0);
        setRotateY(0);
      });
    });
  }

  /* Mobile carousel dot-nav — mirrors the CSS scroll-snap carousel at
     max-width:899px (see style.css). Native scroll-snap handles the
     swipe/momentum/snap itself; this just reflects + drives the active
     dot, so it's a thin sync layer rather than a re-implementation. */
  const servicesGrid = document.querySelector('.services-grid');
  const planDots = document.getElementById('planDots');
  if (servicesGrid && planDots && planCards.length) {
    planCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Vai al piano ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        planCards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      planDots.appendChild(dot);
    });
    const dotEls = Array.from(planDots.children);

    let scrollTicking = false;
    servicesGrid.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const center = servicesGrid.scrollLeft + servicesGrid.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        planCards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - center);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        dotEls.forEach((d, i) => d.classList.toggle('is-active', i === closest));
        scrollTicking = false;
      });
    }, { passive: true });
  }
}

/* Scroll-triggered count-up — fires once, ~800ms cubic ease, for any
   below-the-fold number (pricing, problem-section stats). Separate
   from the hero's load-triggered stats count-up above, and reuses the
   same formatCount helper for consistent prefix/decimals/suffix
   handling (a stat-num's suffix lives in a sibling <small>, so it's
   simply omitted from that element's own data attributes). */
function initScrollCountUp(selector, duration) {
  gsap.utils.toArray(selector).forEach((el) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = formatCount(0, decimals, prefix, suffix);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        if (prefersReducedMotion) {
          el.textContent = formatCount(target, decimals, prefix, suffix);
          return;
        }
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration,
          ease: 'easeReveal',
          onUpdate: () => { el.textContent = formatCount(proxy.val, decimals, prefix, suffix); },
        });
      },
    });
  });
}

initScrollCountUp('.price-num', 0.8);
initScrollCountUp('.stat-num-count', 0.9);

/* ---------------------------------------------------------------
   Come funziona — each step is a static grid cell (no pinning, no
   horizontal scroll) that crossfades in on a simple scroll-position
   threshold: opacity + a small Y-offset, ease-reveal, ~450ms.
   toggleActions plays it going down and reverses it going back up, so
   it's reliable in both scroll directions without scrub math. A
   previous pinned/scrubbed version of this was reworked twice and
   still read as broken — this trades the choreography for something
   that just works.
   --------------------------------------------------------------- */
if (!prefersReducedMotion) {
  gsap.utils.toArray('.process-step-inner').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'easeReveal',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });
  });
}

/* ---------------------------------------------------------------
   Magnetic CTAs — every primary button pulls gently toward the
   cursor within a 40px radius (max ~10px of travel, so it reads as a
   pull, not a chase) and springs back on leave. The contact WhatsApp
   CTA additionally carries the strongest glow (.btn-magnetic, CSS),
   since it's the conversion point — this is the single interaction
   that does the most for the "expensive" feel, so every primary
   button gets it, not just one.
   --------------------------------------------------------------- */
if (canHover && !prefersReducedMotion) {
  const MAGNETIC_RADIUS = 40;
  const MAGNETIC_MAX = 11;

  // bound on the document, not the button: a listener on the button
  // itself only ever fires once the cursor is already inside its box,
  // which would make the 40px "pull from outside" radius dead code.
  const magneticButtons = Array.from(document.querySelectorAll('.btn-primary')).map((btn) => ({
    btn,
    setX: gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'easeHover' }),
    setY: gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'easeHover' }),
  }));

  document.addEventListener('mousemove', (e) => {
    magneticButtons.forEach(({ btn, setX, setY }) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const strength = Math.min(1, (MAGNETIC_RADIUS + Math.max(rect.width, rect.height) / 2 - dist) / MAGNETIC_RADIUS);
      const clamped = Math.max(0, strength);
      setX((dx / dist) * MAGNETIC_MAX * clamped);
      setY((dy / dist) * MAGNETIC_MAX * clamped);
    });
  });
}

/* ---------------------------------------------------------------
   Custom cursor — a small dot that follows the pointer and morphs
   into a labelled pill over any [data-cursor] element. Desktop-with-
   a-mouse only: gated on the same canHover check as the magnetic
   buttons above, so touch devices never load this and reduced-motion
   visitors keep the native cursor entirely.

   Movement is driven by gsap.quickTo on x/y (transform only, never
   left/top). Starts at opacity 0 so it can never sit stuck in the
   top-left corner before the pointer has moved: the first
   'pointermove' snaps the dot straight to the cursor with gsap.set
   (no tween — there is nothing to animate from yet) and only then
   fades it in. Leaving/re-entering the document (pointerleave /
   pointerenter, e.g. the pointer moving off the browser window or
   over a native <select>) fades it out/in the same way, so it never
   reads as "left behind" outside the viewport.
   --------------------------------------------------------------- */
const cursorEl = document.getElementById('cursor');
const cursorLabel = document.getElementById('cursorLabel');

if (cursorEl && canHover && !prefersReducedMotion) {
  document.body.classList.add('custom-cursor');

  gsap.set(cursorEl, { xPercent: -50, yPercent: -50, opacity: 0 });
  const setCursorX = gsap.quickTo(cursorEl, 'x', { duration: 0.3, ease: 'power3' });
  const setCursorY = gsap.quickTo(cursorEl, 'y', { duration: 0.3, ease: 'power3' });

  let hasPositioned = false;

  window.addEventListener('pointermove', (e) => {
    if (!hasPositioned) {
      hasPositioned = true;
      gsap.set(cursorEl, { x: e.clientX, y: e.clientY });
      gsap.to(cursorEl, { opacity: 1, duration: 0.25, ease: 'easeHover' });
    }
    setCursorX(e.clientX);
    setCursorY(e.clientY);
  });

  document.addEventListener('pointerleave', () => {
    gsap.to(cursorEl, { opacity: 0, duration: 0.2, ease: 'easeHover' });
  });
  document.addEventListener('pointerenter', () => {
    if (hasPositioned) gsap.to(cursorEl, { opacity: 1, duration: 0.2, ease: 'easeHover' });
  });

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorEl.classList.add('is-active');
      cursorLabel.textContent = el.dataset.cursor;
    });
    el.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('is-active');
    });
  });
}

/* ---------------------------------------------------------------
   Contact underline draw — the accent stroke under "Parliamone."
   draws in once on arrival, same ease-reveal curve as every other
   scroll reveal on the page rather than a one-off timing.
   --------------------------------------------------------------- */
const contactUnderline = document.getElementById('contactUnderline');
if (contactUnderline) {
  if (prefersReducedMotion) {
    contactUnderline.style.strokeDashoffset = 0;
  } else {
    const underlineLength = contactUnderline.getTotalLength();
    contactUnderline.style.strokeDasharray = underlineLength;
    contactUnderline.style.strokeDashoffset = underlineLength;
    gsap.to(contactUnderline, {
      strokeDashoffset: 0,
      duration: 1.3,
      ease: 'easeReveal',
      scrollTrigger: { trigger: '.contact', start: 'top 60%', once: true },
    });
  }
}

