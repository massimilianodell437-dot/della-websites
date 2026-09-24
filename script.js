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

    // Senza 'noopener' window.open restituisce la finestra: così si vede
    // se il browser l'ha bloccata, e in quel caso si apre WhatsApp qui.
    const url = buildWhatsappLink(message);
    const win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
    } else {
      window.location.href = url;
    }
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

  // Tutto quello che segue è legato allo scroll (scrub): torna indietro
  // se si risale. Solo transform e opacity, tranne il testo dei contatori.
  const mm = gsap.matchMedia();

  // Card portfolio: salgono con un leggero stagger
  gsap.to('.work-card', {
    autoAlpha: 1,
    y: 0,
    ease: 'none',
    stagger: 0.15,
    scrollTrigger: { trigger: '.work-grid', start: 'top 95%', end: 'top 55%', scrub: 0.6 },
  });

  // Titoli di sezione: riga per riga seguendo lo scroll
  gsap.utils.toArray('h2').forEach((title) => {
    const lines = title.querySelectorAll('.line-inner');
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 110, y: 0 });
    gsap.to(lines, {
      yPercent: 0,
      ease: 'none',
      stagger: 0.25,
      scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 60%', scrub: 0.6 },
    });
  });

  // Gruppi [data-stagger]: i figli salgono uno dopo l'altro
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    gsap.set(group.children, { autoAlpha: 0, y: 40 });
    gsap.to(group.children, {
      autoAlpha: 1,
      y: 0,
      ease: 'none',
      stagger: 0.2,
      scrollTrigger: { trigger: group, start: 'top 92%', end: 'top 55%', scrub: 0.6 },
    });
  });

  // "Perché funziona": le cifre contano da 0 mentre la card entra
  gsap.utils.toArray('.why-num').forEach((num) => {
    const target = Number(num.dataset.count);
    const counter = { v: 0 };
    num.textContent = '0';
    gsap.to(counter, {
      v: target,
      ease: 'none',
      onUpdate: () => { num.textContent = Math.round(counter.v); },
      scrollTrigger: { trigger: num.closest('.why-card'), start: 'top 90%', end: 'top 50%', scrub: 0.4 },
    });
  });

  // Parallax leggero sui mockup delle card, solo da tablet in su
  mm.add('(min-width: 768px)', () => {
    gsap.utils.toArray('.work-card [data-parallax]').forEach((el) => {
      gsap.fromTo(el, { yPercent: -4 }, {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('.work-card'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  // Hero: il laptop parte inclinato in 3D e più piccolo, si raddrizza
  // scorrendo. Su mobile l'inclinazione è più leggera.
  const heroLaptop = document.querySelector('[data-hero-laptop]');
  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' }, (ctx) => {
    const { desktop } = ctx.conditions;
    gsap.fromTo(heroLaptop,
      { rotationX: desktop ? 22 : 12, scale: desktop ? 0.86 : 0.92, transformOrigin: '50% 100%' },
      {
        rotationX: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: desktop ? '+=70%' : '+=50%', scrub: 0.6 },
      });
  });

  // "Come lavoro": da 900px la sezione resta ferma e i passi si accendono
  // uno alla volta; il telefono si sposta verso il passo attivo.
  // Su mobile niente pin: ogni passo si accende quando arriva a metà schermo.
  const howSteps = gsap.utils.toArray('.how-steps li');
  const howPhone = document.querySelector('.how-visual');
  mm.add('(min-width: 900px)', () => {
    // telefono: sinistra per i passi 1-2, destra per 3-4; su e giù per le righe
    const poses = [
      { x: -18, y: -14, rotation: -3 },
      { x: -18, y: 14, rotation: -2 },
      { x: 18, y: -14, rotation: 3 },
      { x: 18, y: 14, rotation: 2 },
    ];
    gsap.set(howSteps, { autoAlpha: 0.25 });
    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut', duration: 1 },
      scrollTrigger: {
        trigger: '.how-frame',
        start: () => (document.querySelector('.how-frame').offsetHeight < innerHeight ? 'center center' : 'top top'),
        end: '+=' + howSteps.length * 70 + '%',
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    howSteps.forEach((step, i) => {
      if (i > 0) tl.to(howSteps[i - 1], { autoAlpha: 0.25 }, i);
      tl.to(step, { autoAlpha: 1 }, i).to(howPhone, poses[i], i);
    });
    tl.to({}, { duration: 0.6 }); // pausa sull'ultimo passo prima di sbloccare
  });
  mm.add('(max-width: 899px)', () => {
    howSteps.forEach((step) => {
      gsap.fromTo(step, { autoAlpha: 0.25, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: step, start: 'top 85%', end: 'top 55%', scrub: 0.6 },
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
