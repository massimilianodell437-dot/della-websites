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
   settling to 0) -> the shader ramps in underneath that same reveal
   (not before it), so the text feels like it's arriving into an
   already-alive environment rather than the environment arriving after. */
gsap.set('.logo img', { clipPath: 'inset(0 100% 0 0)' });
gsap.set('#navLinks a, .nav-cta', { opacity: 0, y: 10 });
gsap.set('.eyebrow[data-hero-el]', { opacity: 0, y: 16 });
gsap.set('.hero-sub', { opacity: 0, y: 20 });
gsap.set('.hero-actions', { opacity: 0, y: 20 });
gsap.set('.hero-meta', { opacity: 0, y: 16 });
gsap.set('.hero-visual', { opacity: 0, x: 40 });
gsap.set('.floating-badge', { opacity: 0, y: 14, scale: 0.9 });
if (!prefersReducedMotion) gsap.set('#heroCanvas', { opacity: 0 });

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
  .to('.eyebrow[data-hero-el]', { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
  // 4. headline reveals word-by-word: up + slight rotation settling to 0
  .to(heroWords, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.5, stagger: 0.025 }, '-=0.2')
  // 5. the shader ramps in at the exact same moment the headline starts
  //    revealing (never before it) — arriving into an already-alive scene
  .to('#heroCanvas', { opacity: 1, duration: 0.9 }, '<')
  .to('.hero-sub', { y: 0, opacity: 1, duration: 0.6 }, '-=0.25')
  .to('.hero-actions', { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
  .to('.hero-meta', { y: 0, opacity: 1, duration: 0.5 }, '-=0.45')
  .to('.hero-visual', { x: 0, opacity: 1, duration: 0.9 }, '-=0.8')
  .to('.floating-badge', { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
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
  const problemEyebrow = problemPin.querySelector('.statement-eyebrow--problem');
  const solutionEyebrow = problemPin.querySelector('.statement-eyebrow--solution');

  gsap.set([solutionStatement, solutionEyebrow], { opacity: 0, y: 40 });

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
    .to(problemEyebrow, { opacity: 0, y: -14, ease: 'none', duration: 0.5 }, 0)
    .to(problemStatement, { opacity: 0, y: -50, ease: 'none', duration: 0.5 }, 0)
    .to(solutionEyebrow, { opacity: 1, y: 0, ease: 'none', duration: 0.5 }, 0.3)
    .to(solutionStatement, { opacity: 1, y: 0, ease: 'none', duration: 0.5 }, 0.3);
}

/* Mockup parallax on mouse move (desktop, fine pointer only) */
const mockupWrap = document.getElementById('mockupWrap');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (mockupWrap && canHover && !prefersReducedMotion) {
  const rotateX = gsap.quickTo(mockupWrap, 'rotationX', { duration: 0.7, ease: 'easeHover' });
  const rotateY = gsap.quickTo(mockupWrap, 'rotationY', { duration: 0.7, ease: 'easeHover' });

  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const rect = mockupWrap.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    rotateY(-8 + relX * -10);
    rotateX(3 + relY * 8);
  });
}

/* Depth parallax as the user scrolls out of the hero: the shader
   background is translated downward by a fraction of the scroll
   distance, which partially cancels its native upward scroll motion —
   so it visibly moves slower than the foreground and reads as farther
   away. hero-copy scrolls at the normal (native) rate as the middle
   plane; hero-visual gets an extra push, reading as the closest plane. */
if (!prefersReducedMotion) {
  gsap.to('#heroCanvas', {
    y: 160,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

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
      // field. Also drives the CSS specular-highlight position via --mx/--my.
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        setRotateY((px - 0.5) * 2 * TILT_MAX);
        setRotateX(-(py - 0.5) * 2 * TILT_MAX);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
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
   Signature moment — each portfolio mockup constructs itself piece by
   piece as it scrolls into view: chrome bar, then nav, then the image
   block, then the headline, then the CTA. Echoes the actual pitch
   ("we build your site fast") instead of a generic fade-in. Scrubbed
   to the case-study's own scroll position, so scrolling back up
   un-builds it cleanly rather than just replaying a fixed animation. */
if (!prefersReducedMotion) {
  gsap.utils.toArray('.case-study:not(.case-study--travelmap)').forEach((study) => {
    // scoped to .compare-after specifically — the "before" mockup
    // reuses .mockup-chrome for its own browser-frame look, so an
    // unscoped query would be one DOM-order accident away from
    // animating the wrong layer's chrome bar
    const after = study.querySelector('.compare-after') || study;
    const chrome = after.querySelector('.mockup-chrome');
    const nav = after.querySelector('.mockup-nav');
    const portrait = after.querySelector('.mockup-portrait');
    const kicker = after.querySelector('.mockup-kicker');
    const h1 = after.querySelector('.mockup-h1');
    const cta = after.querySelector('.mockup-cta');

    gsap.set([chrome, nav, kicker, h1, cta], { opacity: 0, y: 14 });
    gsap.set(portrait, { opacity: 0, scale: 0.92 });

    gsap.timeline({
      scrollTrigger: {
        trigger: study,
        start: 'top 82%',
        end: 'top 32%',
        scrub: 0.4,
      },
    })
      .to(chrome, { opacity: 1, y: 0, ease: 'none', duration: 0.18 }, 0)
      .to(nav, { opacity: 1, y: 0, ease: 'none', duration: 0.18 }, 0.16)
      .to(portrait, { opacity: 1, scale: 1, ease: 'none', duration: 0.22 }, 0.34)
      .to([kicker, h1], { opacity: 1, y: 0, ease: 'none', duration: 0.18 }, 0.56)
      .to(cta, { opacity: 1, y: 0, ease: 'none', duration: 0.18 }, 0.76);
  });
}

/* ---------------------------------------------------------------
   Signature interaction — drag-reveal before/after on each portfolio
   mockup. Pointer Events unify mouse, touch and pen in one listener
   set, so the same code drives both desktop drag and mobile swipe.
   Position tracks the pointer 1:1 while dragging — no eased lag, per
   spec — while the hint label's fade-out uses the site's standard
   ease. Independent of the construct-piece-by-piece reveal above:
   that animates opacity/y on the individual pieces inside
   .compare-after, this animates clip-path on .compare-after itself,
   so the two never touch the same property. */
gsap.utils.toArray('.compare').forEach((compare) => {
  const after = compare.querySelector('.compare-after');
  const handle = compare.querySelector('.compare-handle');
  const hint = compare.querySelector('.compare-hint');
  if (!after || !handle) return;

  let dragging = false;
  let hintDismissed = false;

  function dismissHint() {
    if (hintDismissed || !hint) return;
    hintDismissed = true;
    hint.classList.add('is-hidden');
  }
  const hintTimer = setTimeout(dismissHint, 4000);

  function setPosition(clientX) {
    const rect = compare.getBoundingClientRect();
    const pct = gsap.utils.clamp(0, 100, ((clientX - rect.left) / rect.width) * 100);
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
  }

  compare.addEventListener('pointerdown', (e) => {
    dragging = true;
    try { compare.setPointerCapture(e.pointerId); } catch (err) { /* no active pointer to capture — drag still tracks via move/up */ }
    clearTimeout(hintTimer);
    dismissHint();
    setPosition(e.clientX);
  });
  compare.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPosition(e.clientX);
  });
  const stopDrag = (e) => {
    dragging = false;
    try { if (compare.hasPointerCapture(e.pointerId)) compare.releasePointerCapture(e.pointerId); } catch (err) { /* nothing captured */ }
  };
  compare.addEventListener('pointerup', stopDrag);
  compare.addEventListener('pointercancel', stopDrag);
});

/* ---------------------------------------------------------------
   TravelMap screenshot slideshow — real captures of the live app,
   auto-advancing with a crossfade (ease-reveal, matches the site's
   scroll-reveal curve rather than inventing a one-off timing) until
   the visitor takes over: dots, arrows, or a touch swipe all count as
   manual navigation and permanently stop autoplay rather than having
   it resume later and fight whatever the visitor just chose.
   --------------------------------------------------------------- */
(() => {
  const shot = document.getElementById('travelmapShot');
  const dotsWrap = document.getElementById('travelmapDots');
  if (!shot || !dotsWrap) return;

  const slides = Array.from(shot.querySelectorAll('.shot-slide'));
  if (slides.length < 2) return;

  const prevBtn = shot.querySelector('.hero-shot-arrow--prev');
  const nextBtn = shot.querySelector('.hero-shot-arrow--next');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Vai alla schermata ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => { goTo(i); stopForGood(); });
    dotsWrap.appendChild(dot);
  });
  const dotEls = Array.from(dotsWrap.children);

  let active = 0;
  let timer = null;
  let userTookOver = false;

  function goTo(i) {
    if (i === active) return;
    slides[active].classList.remove('is-active');
    dotEls[active].classList.remove('is-active');
    active = i;
    slides[active].classList.add('is-active');
    dotEls[active].classList.add('is-active');
  }

  function next() { goTo((active + 1) % slides.length); }
  function prev() { goTo((active - 1 + slides.length) % slides.length); }

  function play() {
    if (prefersReducedMotion || userTookOver) return;
    stop();
    timer = setInterval(next, 4000);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function stopForGood() {
    userTookOver = true;
    stop();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopForGood(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopForGood(); });

  // touch swipe — left/right, a modest threshold so it doesn't fire on
  // an incidental tap or a mostly-vertical scroll gesture
  let touchStartX = null;
  shot.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  shot.addEventListener('touchend', (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
    stopForGood();
  }, { passive: true });

  play();
  shot.addEventListener('mouseenter', stop);
  shot.addEventListener('mouseleave', play);
})();

/* ---------------------------------------------------------------
   Hero mockup slideshow — real TravelMap screenshots inside the
   browser-chrome frame, browsed manually via prev/next arrows (no
   autoplay: this is a deliberate look, not a preview loop). Same
   crossfade mechanics as the portfolio slideshow, loops in both
   directions.
   --------------------------------------------------------------- */
(() => {
  const shot = document.getElementById('heroShotBody');
  if (!shot) return;

  const slides = Array.from(shot.querySelectorAll('.hero-shot-slide'));
  const prevBtn = shot.querySelector('.hero-shot-arrow--prev');
  const nextBtn = shot.querySelector('.hero-shot-arrow--next');
  if (slides.length < 2 || !prevBtn || !nextBtn) return;

  let active = slides.findIndex((s) => s.classList.contains('is-active'));
  if (active < 0) active = 0;

  function goTo(i) {
    if (i === active) return;
    slides[active].classList.remove('is-active');
    active = i;
    slides[active].classList.add('is-active');
  }

  nextBtn.addEventListener('click', () => goTo((active + 1) % slides.length));
  prevBtn.addEventListener('click', () => goTo((active - 1 + slides.length) % slides.length));
})();

/* ---------------------------------------------------------------
   Shader background — raw WebGL, no library. Reused for both the hero
   (full strength) and the contact section (low intensity, via a
   dimmer CSS opacity on that canvas — conversion is the job there,
   not spectacle). Continuously drifts on its own (uTime) so it never
   reads as a still image, and warps toward the cursor (uMouse) for an
   unmistakable, physically-reactive feel. Freezes to one static frame
   under prefers-reduced-motion, and pauses its render loop while its
   section is scrolled out of view.
   --------------------------------------------------------------- */
function initShaderBackground(canvasId, sectionSelector) {
  const canvas = document.getElementById(canvasId);
  const heroSection = document.querySelector(sectionSelector);
  if (!canvas || !heroSection) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vertexSrc = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uMotion;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      float aspect = uResolution.x / uResolution.y;
      vec2 auv = vec2(uv.x * aspect, uv.y);

      float t = uTime * 0.045 * uMotion;
      vec2 mouseOffset = (uMouse - 0.5) * 2.0 * uMotion;

      vec2 p = auv * 1.9 + mouseOffset * 0.55;

      float n1 = snoise(p + vec2(t, -t * 0.7));
      float n2 = snoise(p * 1.6 - vec2(t * 0.5, t * 0.9) + 4.2);
      float n = n1 * 0.6 + n2 * 0.4;
      n = n * 0.5 + 0.5;

      float lightN = snoise(p * 1.1 - vec2(t * 0.25, t * 0.35) + 91.0);
      lightN = lightN * 0.5 + 0.5;

      /* two-accent system only, matching the CSS palette exactly */
      vec3 bg = vec3(0.0431, 0.0588, 0.0549);          /* --bg-primary */
      vec3 accentDeep = vec3(0.0039, 0.4118, 0.4353);  /* --accent-deep */
      vec3 accentBright = vec3(0.3098, 0.7490, 0.6667); /* --accent-bright */

      vec3 col = bg;
      col = mix(col, accentDeep, smoothstep(0.40, 0.80, n));
      col = mix(col, accentBright, smoothstep(0.80, 1.02, n) * 0.5);
      col = mix(col, accentBright, smoothstep(0.64, 0.92, lightN) * 0.16);

      /* concentrate the glow around the mockup on the right; fall to
         near-pure background on the left where the headline sits */
      vec2 vc = auv - vec2(aspect * 0.6, 0.4);
      float vig = smoothstep(1.05, 0.05, length(vc));
      col = mix(bg, col, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Hero shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compile(gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Hero shader link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const uMotionLoc = gl.getUniformLocation(program, 'uMotion');

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = 0;
  let height = 0;

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  resize();
  window.addEventListener('resize', resize);

  const mouseTarget = { x: 0.5, y: 0.5 };
  const mouseCurrent = { x: 0.5, y: 0.5 };

  if (canHover) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseTarget.x = (e.clientX - rect.left) / rect.width;
      mouseTarget.y = 1 - (e.clientY - rect.top) / rect.height;
    });
  }

  const motion = prefersReducedMotion ? 0 : 1;
  const startTime = performance.now();
  let rafId = null;
  let visible = true;

  function render(now) {
    const elapsed = (now - startTime) / 1000;
    mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.06;
    mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.06;

    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform2f(uResolutionLoc, width, height);
    gl.uniform2f(uMouseLoc, mouseCurrent.x, mouseCurrent.y);
    gl.uniform1f(uMotionLoc, motion);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (motion) rafId = requestAnimationFrame(render);
  }

  render(performance.now());

  if (motion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !visible) {
          visible = true;
          rafId = requestAnimationFrame(render);
        } else if (!entry.isIntersecting && visible) {
          visible = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0 });
    observer.observe(heroSection);
  }
}

initShaderBackground('heroCanvas', '.hero');
initShaderBackground('contactCanvas', '.contact');

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

