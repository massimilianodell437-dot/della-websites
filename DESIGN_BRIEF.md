# Design brief: rebrand-mono

Rebranding di dellawebsites.it. Riferimento: shot Dribbble "Shopify Earbuds Selling Website" (principi, non copia).
Il "prodotto" sono i siti dei clienti: dove il riferimento mostra le cuffie, qui ci sono i mockup di Désir e San Bartolomeo.

## Modello e regole sui testi (aggiornato il 21 ottobre 2026)

Queste regole valgono su tutto il resto del brief.

- **Modello**: bozza gratuita e senza impegno, poi preventivo su misura con gestione mensile. Gratuita è solo la bozza: non si scrive mai che il sito o la gestione sono gratis.
- **Frase da usare**: "La bozza è gratuita e senza impegno." (testo dell'hero, passo 2 di "Come lavoriamo", FAQ).
- **Prezzi**: sul sito non vanno mai indicati prezzi o cifre in euro, né nei testi né in meta description, OG, alt o FAQ. Al loro posto: "Preventivo su misura".
- **Voce**: il sito parla al plurale. Siamo un piccolo team di Torino che lavora insieme sui progetti, con Massimiliano Della Pia come referente principale. Non si inventano numeri (anni, clienti, siti fatti) né nomi di altre persone.
- **Contatti**: telefono 334 727 8991, WhatsApp, email, LinkedIn, zona Torino, più il pulsante WhatsApp flottante. Nessun Instagram.

## Token

**Colore**: monocromatico, nessun accento.

| Nome | Hex | Uso |
|---|---|---|
| `--white` | `#FFFFFF` | sfondo pagina |
| `--mist` | `#EDEDED` | card chiare, contenitore hero |
| `--line` | `#D6D6D6` | bordi input, divisori (pochi) |
| `--muted` | `#5C5C5C` | testo secondario (5,6:1 su `#EDEDED`, 6,7:1 su bianco) |
| `--black` | `#000000` | titoli, card nere, bottoni, blocco "Come lavoriamo" |
| `--muted-inv` | `#A3A3A3` | testo secondario su nero (8,4:1) |

L'unico colore nella pagina è quello degli screenshot dei clienti. Il colore lo portano i loro siti, non il mio.

**Tipografia**
- **Anton** (400, l'unico peso che ha): solo i titoli, sempre in maiuscolo, interlinea 0,92, tracking 0. Hero `clamp(3.25rem, 9vw, 8.5rem)`, H2 `clamp(2.5rem, 5.5vw, 4.5rem)`, titoli delle card 2rem.
  L'ho preferito a Bebas Neue perché ha un tratto più pesante: a 130px regge accanto a un mockup scuro, dove Bebas sembra esile.
- **Inter** 400/500: tutto il resto, in sentence case. Corpo 1rem/1.55, testo delle card 0,9375rem, colonne larghe al massimo 60ch.
- Google Fonts con `display=swap`. Fraunces, Archivo e IBM Plex Mono vengono tolti.

**Forme**: il raggio segue la gerarchia, non è uguale ovunque. 32px per il contenitore hero, 24px per le card, 10px per lo schermo nei mockup, 999px per pill e bottoni tondi. Niente ombre sulle card: la separazione la fa il contrasto tra grigio e nero.

**Bottoni**
- Primario: pill nera, testo bianco in sentence case, "Parliamone" (su WhatsApp).
- Link a un sito live: cerchio da 48px con ↗, bianco sulle card nere e nero su quelle grigie, `aria-label="Apri il sito di Désir Arredamenti"`.
- Focus: outline di 2px nero (bianco sulle sezioni nere) con offset di 3px.

## Layout home

```
┌ logo ───────── Progetti  Come lavoriamo  Contatti ────── (Parliamone) ┐
╭──────────────────────────────── #EDEDED, r32 ───────────────────────────────╮
│ TITOLO ANTON                                   frase breve, al plurale      │
│ SU DUE/TRE                                                                  │
│ RIGHE                    ┌──────────── laptop Désir ───────────┐            │
│ (Parliamone)             │                                     │  ┌──────┐  │
│                          │                                     │  │ tel. │  │
╰──────────────────────────┴─────────────────────────────────────┴──┴──────┴──╯
╭─ nera ─────────────────────╮ ╭─ grigia, più larga ────────────────────────────╮
│ SAN BARTOLOMEO         (↗) │ │ DÉSIR ARREDAMENTI                           (↗) │
│ una riga    [mockup tel.]  │ │ una riga              [mockup laptop]           │
╰────────────────────────────╯ ╰─────────────────────────────────────────────────╯
  IL PROBLEMA, IN BREVE: una frase Anton + 3 righe (lento / vecchio / assente)
  PERCHÉ FUNZIONA           ╭ grigia ╮ ╭ nera ╮ ╭ grigia ╮
                            │ PRIMA  │ │TUTTO │ │ UN    │   ← una parola in Anton,
                            │ LO VEDI│ │INCL. │ │ TEAM  │     mai prezzi o cifre
                            ╰────────╯ ╰──────╯ ╰───────╯
╭────────────────────────── nero pieno: COME LAVORIAMO ───────────────────────╮
│  1 Chiacchierata          ┌─ telefono ─┐          3 Guardi e decidi         │
│  2 Prepariamo la bozza    │ San Bart.  │          4 Online + gestione       │
╰─────────────────────────────────────────────────────────────────────────────╯
  PARLIAMONE. + form → WhatsApp           nota firmata
  footer: logo · 4 link · © 2026 / telefono · WhatsApp · email · LinkedIn · Torino
```

- Allineamento a sinistra ovunque. Unica eccezione il titolo di "Come lavoriamo", centrato sopra il mockup.
- Container da 1280px, gutter di 16px su mobile e 32px su desktop. Tra una sezione e l'altra 120px su desktop e 72px su mobile.
- A 375px tutto diventa una colonna. Nell'hero il titolo va sopra, il mockup di Désir va sotto a tutta larghezza e il telefono si sovrappone al laptop in basso a destra. Le card portfolio vanno una sotto l'altra. In "Come lavoriamo" il telefono va in cima e i passi sotto, in sequenza.
- **Il pezzo audace è uno solo**: il mockup di Désir che esce dal bordo del contenitore grigio dell'hero, come la testa nel riferimento. Tutto il resto resta quieto.
- La numerazione 1–4 c'è solo in "Come lavoriamo", perché lì i passi sono davvero una sequenza.

## Headline hero

**PRIMA LO VEDI FINITO. POI DECIDI TU.**: dice subito il modello, senza nominare prezzi.

Frase in alto a destra: *"Siamo un piccolo team di Torino e realizziamo siti per attività locali tra Torino e Benevento. Prepariamo una bozza del tuo sito prima di parlare di costi: se ti piace va online, altrimenti finisce lì. La bozza è gratuita e senza impegno."*

## Contenuti

- **Portfolio**: San Bartolomeo (card nera): *"Un sito one-page che rassicura le famiglie prima ancora della prima telefonata."* ↗ `https://www.sanbartolomeocasaalbergo.it`. Désir (card grigia): *"Catalogo con area riservata: il titolare aggiorna i prodotti da solo."* ↗ `https://desir-arredamenti.vercel.app`.
- **Perché funziona**: tre card con una parola in grande, nessuna cifra. "Prima lo vedi, poi decidi" (bozza prima di parlare di costi), "Tutto incluso" (dominio, hosting, sicurezza, piccole modifiche), "Un team dedicato" (un unico referente sempre raggiungibile).
- **Il problema**: da circa 2.400px passa a un blocco solo, al massimo 500px su desktop. Niente pin e niente scroll orizzontale.
- **Statistiche 53% / 88% / 9/10**: le elimino tutte. Il 53% viene da Google/SOASTA (2016): ha una fonte, ma ha 10 anni e riguarda i siti mobile in generale. L'88% e il 9/10 non hanno una fonte primaria verificabile.
- **"Solo se ti piace"**: il badge sparisce e il concetto finisce nel testo della card "Prima lo vedi, poi decidi".
- **Testi**: tutto in prima persona plurale ("costruiamo", "ci pensiamo noi", "parli con noi"), compresi meta description, OG, alt e placeholder del form ("Raccontaci").
- **WhatsApp**: in `script.js` e nei link inline il messaggio precompilato è "Ho visto il **vostro** sito".
- **Da tenere invariati**: il form che invia su WhatsApp (logica attuale) e l'email.

## Animazioni (GSAP + Lenis)

- Titoli: reveal per riga con maschera (SplitType lines, `yPercent 100 → 0`, stagger 0,08s). All'ingresso della pagina parte solo l'hero, gli H2 partono allo scroll.
- Mockup: parallax leggero, `yPercent` tra −6 e 6 in scrub. Si disattiva sotto i 768px.
- Card: salgono con stagger (`y 40 → 0`, 0,1s), una volta sola.
- Con `prefers-reduced-motion: reduce` tutto è già visibile, senza transform, e Lenis resta spento.
- **Vengono tolti**: Three.js e l'import map, il cursore custom, il bottone magnetico, i count-up, la grana, la barra di progresso, le sezioni pinnate e il tilt delle card.

## Asset

- `desir-arredamenti.webp` e `san-bartolomeo.webp` (1440×900) vanno bene per il laptop.
  **Però** lo screenshot di Désir è stato catturato a metà di un'animazione: l'eyebrow "DÉSIR — ARREDAMENTI SU MISURA" appare spezzato. Va rifatto.
- **Mancano gli screenshot mobile** per i mockup del telefono.
- **Schermate da fare** (le posso catturare io con Playwright da CLI se mi dai l'ok):
  1. Désir desktop, 1440×900, ad animazioni finite → `desir-arredamenti.webp`
  2. Désir mobile, 390×844 @2x → `desir-arredamenti-mobile.webp` (780×1688)
  3. San Bartolomeo mobile, 390×844 @2x → `san-bartolomeo-mobile.webp` (780×1688)
- I mockup (laptop e telefono) sono fatti in CSS puro: cornice nera, notch minimale. Niente PNG di device.
- Logo: SVG inline in `index.html` (segno + "DELLA" in Anton convertito in tracciati), niente file esterni.

## File

- Riscritti: `tokens.css`, `style.css`, `index.html`. `script.js` viene sfoltito tenendo form, WhatsApp, Lenis e menu mobile.
- `vetrina.html`/`.css`/`.js` e `LICENSE-vetrina.md` (pagina separata con la vecchia identità): eliminati.
- Non toccata: la cartella `three/` (non è in git: oggi `index.html` la importa, quindi su Vercel probabilmente va in 404. Il problema sparisce insieme all'hero 3D).

## Verifica

- Il Playwright MCP **non è collegato** in questa sessione. Uso Playwright 1.63 da CLI (è già installato) per gli screenshot a 375px e 1440px, e li controllo prima di chiudere ogni step.
- Il controllo finale lo faccio con ui-ux-pro-max: anti-pattern, contrasto AA, focus, alt text, responsive.

## Ordine di lavoro

1. Brief (questo) → **aspetto il tuo ok**
2. Hero + due card portfolio → screenshot + commit + `git log -1` → stop
3. Problema breve + Perché funziona → idem
4. Come lavoro → idem
5. Contatti + footer + pulizia JS/CSS → idem
6. Controllo finale con ui-ux-pro-max
