/* ---------------------------------------------------------------
   WhatsApp
   --------------------------------------------------------------- */
const WHATSAPP_NUMBER = '393347278991';
const WHATSAPP_DEFAULT_MESSAGE = 'Ciao! Ho visto il tuo sito e vorrei informazioni per una nuova attività.';

function buildWhatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('[data-whatsapp]').forEach(el => {
  el.setAttribute('href', buildWhatsappLink(WHATSAPP_DEFAULT_MESSAGE));
});

/* ---------------------------------------------------------------
   Contact form -> WhatsApp
   --------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();
    const biz = document.getElementById('fbiz').value.trim();
    const city = document.getElementById('fcity').value;
    const msg = document.getElementById('fmsg').value.trim();

    const where = city === 'Altra' ? 'fuori Torino e Benevento' : `a ${city}`;
    let message = `Ciao! Sono ${name}, ho un'attività (${biz}) ${where}.`;
    if (msg) message += ` ${msg}`;

    window.open(buildWhatsappLink(message), '_blank', 'noopener');
  });
}

/* ---------------------------------------------------------------
   Motion: GSAP + Lenis, solo se prefers-reduced-motion lo consente.
   La classe .motion (messa in <head>) nasconde lo stato iniziale;
   se GSAP non è caricato la togliamo e la pagina resta statica.
   --------------------------------------------------------------- */
const root = document.documentElement;
const motionOK = root.classList.contains('motion') && typeof gsap !== 'undefined';
let lenis = null;

if (!motionOK) {
  root.classList.remove('motion');
} else {
  window.__motionReady = true;
  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Gli stili inline di GSAP sostituiscono quelli di .motion
  gsap.set('.hero-title .line-inner', { yPercent: 110, y: 0 });
  gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 16 });
  gsap.set('.work-card', { autoAlpha: 0, y: 40 });

  // Ingresso: titolo riga per riga, poi testo, CTA e mockup
  gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 })
    .to('.hero-title .line-inner', { yPercent: 0, duration: 1.1, stagger: 0.08 })
    .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, '-=0.75');

  // Card portfolio: salgono con stagger, una volta sola
  gsap.to('.work-card', {
    autoAlpha: 1,
    y: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.work-grid', start: 'top 85%', once: true },
  });

  // Titoli di sezione: riga per riga quando entrano in vista
  gsap.utils.toArray('h2').forEach((title) => {
    const lines = title.querySelectorAll('.line-inner');
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 110, y: 0 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
    });
  });

  // Gruppi [data-stagger]: i figli salgono uno dopo l'altro
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    gsap.set(group.children, { autoAlpha: 0, y: 40 });
    gsap.to(group.children, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // Parallax leggero sui mockup, solo da tablet in su
  gsap.matchMedia().add('(min-width: 768px)', () => {
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const inHero = el.closest('.hero');
      gsap.fromTo(el, { yPercent: inHero ? 0 : -4 }, {
        yPercent: inHero ? 8 : 4,
        ease: 'none',
        scrollTrigger: {
          trigger: inHero || el.closest('.work-card, section'),
          start: inHero ? 'top top' : 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------------------------------------------------------------
   Menu mobile: si chiude con la X, toccando un link o con Esc.
   Mentre è aperto la pagina sotto è inerte e non scorre.
   --------------------------------------------------------------- */
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
  const menuLinks = mobileMenu.querySelectorAll('a');
  // Tutto ciò che non è il menu o la X: reso inerte mentre il menu è aperto
  const behind = [
    ...document.querySelectorAll('.skip-link, .site-header .logo, .site-header .btn, main, footer'),
  ];
  let menuTl = null;

  const setOpen = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    root.classList.toggle('menu-open', open);
    behind.forEach((el) => { el.inert = open; });
    if (lenis) open ? lenis.stop() : lenis.start();
  };

  const openMenu = () => {
    mobileMenu.hidden = false;
    setOpen(true);
    if (menuTl) menuTl.kill();
    // opacity e non autoAlpha: con visibility:hidden i link non prenderebbero il focus
    if (motionOK) {
      menuTl = gsap.timeline()
        .fromTo(mobileMenu, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
        .fromTo(menuLinks, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'expo.out', stagger: 0.05 }, '-=0.1');
    }
    menuLinks[0].focus();
  };

  const closeMenu = ({ returnFocus = true } = {}) => {
    if (mobileMenu.hidden) return;
    setOpen(false);
    if (menuTl) menuTl.kill();
    const done = () => { mobileMenu.hidden = true; };
    if (motionOK) {
      menuTl = gsap.to(mobileMenu, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done });
    } else {
      done();
    }
    if (returnFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => {
    menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  // Toccando un link il menu si chiude e l'ancora porta alla sezione
  menuLinks.forEach((link) => link.addEventListener('click', () => closeMenu({ returnFocus: false })));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Da 768px in su il menu non esiste: se si allarga la finestra, si chiude
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu({ returnFocus: false });
  });
}
