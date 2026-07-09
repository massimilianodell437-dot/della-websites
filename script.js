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
      ease: 'power3.out',
      onUpdate: () => { el.textContent = formatCount(proxy.val, decimals, prefix, suffix); },
    });
  });
}

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
  }, 1.1)
  .call(startHeroCountUps);

/* Generic scroll reveal for section elements — scrubbed to scroll
   position so content visibly assembles as the user scrolls, rather
   than popping in fully formed and sitting still. Reverses cleanly
   on scroll-up since it's tied directly to scroll progress. */
const revealEls = gsap.utils.toArray('.reveal');

revealEls.forEach((el) => {
  gsap.set(el, { opacity: 1 });
  gsap.from(el, {
    y: 64,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top 92%',
      end: 'top 48%',
      scrub: 0.5,
    },
  });
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
  const rotateX = gsap.quickTo(mockupWrap, 'rotationX', { duration: 0.7, ease: 'power3.out' });
  const rotateY = gsap.quickTo(mockupWrap, 'rotationY', { duration: 0.7, ease: 'power3.out' });

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
   Services — glass cards: staggered scroll-scrub entrance, idle float,
   cursor-proximity tilt, and a scroll-triggered (once) price count-up.

   Idle float runs on each card's INNER wrapper while tilt/entrance/
   hover-scale run on the OUTER card — two different elements, so none
   of these ever fight over the same transform property on the same
   GSAP target (the exact bug class this file avoids elsewhere too).
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
    const servicesGrid = document.querySelector('.services-grid');

    const controllers = planCards.map((card) => {
      const inner = card.querySelector('.plan-card-inner');
      const baseScale = card.classList.contains('plan-card--featured') ? 1.04 : 1;

      const setRotateX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const setRotateY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      // 'scale' (like 'rotateX'/'rotateY') isn't reliable as a quickTo
      // property string on a fresh element — scaleX/scaleY are the
      // real, unaliased properties and compose the same visual result.
      const setScaleX = gsap.quickTo(card, 'scaleX', { duration: 0.4, ease: 'power3.out' });
      const setScaleY = gsap.quickTo(card, 'scaleY', { duration: 0.4, ease: 'power3.out' });
      const setScale = (v) => { setScaleX(v); setScaleY(v); };
      setScale(baseScale);

      gsap.to(inner, {
        y: -7,
        duration: 2.6 + Math.random() * 1.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: Math.random() * 0.6,
      });

      card.addEventListener('mouseenter', () => setScale(baseScale * 1.02));
      card.addEventListener('mouseleave', () => setScale(baseScale));

      return { card, setRotateX, setRotateY };
    });

    servicesGrid.addEventListener('mousemove', (e) => {
      controllers.forEach(({ card, setRotateX, setRotateY }) => {
        const rect = card.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const strength = Math.max(0, 1 - Math.hypot(dx, dy) / 420);
        setRotateY((dx / rect.width) * 10 * strength);
        setRotateX((-dy / rect.height) * 10 * strength);
      });
    });

    servicesGrid.addEventListener('mouseleave', () => {
      controllers.forEach(({ setRotateX, setRotateY }) => { setRotateX(0); setRotateY(0); });
    });
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
          ease: 'power3.out',
          onUpdate: () => { el.textContent = formatCount(proxy.val, decimals, prefix, suffix); },
        });
      },
    });
  });
}

initScrollCountUp('.price-num', 0.8);
initScrollCountUp('.stat-num-count', 0.9);

/* ---------------------------------------------------------------
   How it works — horizontal scroll-scrubbed timeline. The section
   pins for as much vertical scroll as the track needs, and vertical
   scroll progress directly drives the track's horizontal position
   (recalculated on resize). Each step's content animates in as its
   card nears center, driven by the same live progress value — not a
   timer. Desktop only: on narrow/touch viewports a pinned horizontal
   drag reads as broken, so mobile gets a plain vertical scrub reveal
   instead (matching the rest of the site's fallback pattern).
   --------------------------------------------------------------- */
const processPin = document.getElementById('processPin');
const processTrack = document.getElementById('processTrack');
const isDesktopProcess = window.matchMedia('(min-width: 900px)').matches;

if (processPin && processTrack) {
  const stepInners = gsap.utils.toArray('.process-step-inner');

  if (isDesktopProcess && !prefersReducedMotion) {
    gsap.set(stepInners, { opacity: 0.25, y: 24 });

    let totalScroll = 0;
    let pinDuration = 0;
    function computeProcessScroll() {
      totalScroll = Math.max(0, processTrack.scrollWidth - window.innerWidth);
      // paced independently of the raw overflow so a short track still
      // gives each step deliberate scroll room instead of flicking by
      pinDuration = Math.max(totalScroll * 3, 1200);
    }
    computeProcessScroll();

    const steps = gsap.utils.toArray('.process-step');

    ScrollTrigger.create({
      trigger: processPin,
      start: 'top top',
      end: () => '+=' + pinDuration,
      scrub: 0.4,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: computeProcessScroll,
      onUpdate: (self) => {
        gsap.set(processTrack, { x: -totalScroll * self.progress });

        steps.forEach((step, i) => {
          const inner = step.querySelector('.process-step-inner');
          const bandCenter = (i + 0.5) / steps.length;
          const dist = Math.abs(self.progress - bandCenter) / (1 / steps.length);
          const closeness = gsap.utils.clamp(0, 1, 1 - dist);
          gsap.set(inner, {
            opacity: gsap.utils.interpolate(0.25, 1, closeness),
            y: gsap.utils.interpolate(24, 0, closeness),
          });
        });
      },
    });
  } else {
    gsap.set(stepInners, { opacity: 1 });
    stepInners.forEach((el) => {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'top 55%',
          scrub: 0.5,
        },
      });
    });
  }
}

/* ---------------------------------------------------------------
   Signature moment — each portfolio mockup constructs itself piece by
   piece as it scrolls into view: chrome bar, then nav, then the image
   block, then the headline, then the CTA. Echoes the actual pitch
   ("we build your site fast") instead of a generic fade-in. Scrubbed
   to the case-study's own scroll position, so scrolling back up
   un-builds it cleanly rather than just replaying a fixed animation. */
if (!prefersReducedMotion) {
  gsap.utils.toArray('.case-study').forEach((study) => {
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

      vec3 bg = vec3(0.0431, 0.0588, 0.0549);
      vec3 teal = vec3(0.0039, 0.4118, 0.4353);
      vec3 tealBright = vec3(0.1333, 0.7804, 0.8000);
      vec3 tealLight = vec3(0.3098, 0.7490, 0.6667);

      vec3 col = bg;
      col = mix(col, teal, smoothstep(0.40, 0.80, n));
      col = mix(col, tealBright, smoothstep(0.80, 1.02, n) * 0.5);
      col = mix(col, tealLight, smoothstep(0.64, 0.92, lightN) * 0.16);

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
   Magnetic pull on the contact WhatsApp CTA — the conversion point,
   so it gets the most "expensive" feeling interaction on the site.
   Within a radius of the button it noticeably pulls toward the
   cursor; outside that radius (or on leave) it snaps back to rest. */
if (canHover && !prefersReducedMotion) {
  const magneticBtn = document.querySelector('.btn-magnetic');
  if (magneticBtn) {
    const setX = gsap.quickTo(magneticBtn, 'x', { duration: 0.5, ease: 'power3.out' });
    const setY = gsap.quickTo(magneticBtn, 'y', { duration: 0.5, ease: 'power3.out' });
    const radius = 110;
    const pull = 0.4;

    window.addEventListener('mousemove', (e) => {
      const rect = magneticBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        setX(dx * pull);
        setY(dy * pull);
      } else {
        setX(0);
        setY(0);
      }
    });
  }
}
