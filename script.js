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

    let message = `Ciao! Sono ${name}, ho un'attività (${biz}) a ${city}.`;
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

if (!motionOK) {
  root.classList.remove('motion');
} else {
  window.__motionReady = true;
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
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

  // Parallax leggero sui mockup, solo da tablet in su
  gsap.matchMedia().add('(min-width: 768px)', () => {
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const inHero = el.closest('.hero');
      gsap.fromTo(el, { yPercent: inHero ? 0 : -4 }, {
        yPercent: inHero ? 8 : 4,
        ease: 'none',
        scrollTrigger: {
          trigger: inHero || el.closest('.work-card'),
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
