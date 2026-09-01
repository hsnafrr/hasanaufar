/* =====================================================================
   Developing the Frame — the works list
   One long column: each project takes a full row, explains itself, and
   arrives from an alternating side as you scroll into it. Inside every
   row sits a fixed frame with a stack of three photos that hands off
   one at a time.
   No carousel library — the slider is pointer maths plus a spring
   integrator (stiffness 260, damping 30), and the loop only ever writes
   transform, opacity and z-index.
   ===================================================================== */
(() => {
  'use strict';

  const grid = document.querySelector('#worksGrid');
  if (!grid || !window.PROJECTS) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* every number below comes from the motion tokens in css/works.css */
  const root = getComputedStyle(document.documentElement);
  const tok = (n, fallback) => {
    const v = parseFloat(root.getPropertyValue(n));
    return Number.isFinite(v) ? v : fallback;
  };
  const T = {
    reveal:  tok('--mo-reveal', 220),
    decay:   tok('--mo-decay', 600),
    stagger: tok('--mo-stagger', 45),
    enter:   tok('--mo-enter', 680),
    enterX:  tok('--enter-x', 64),
    stackX:  tok('--stack-x', 8),      // px, photo 2; photo 3 doubles it
    stackRot:tok('--stack-rot', 1.5),  // deg, photo 2; photo 3 doubles it
    fanOpen: tok('--stack-fan-hover', 1.4)
  };
  const SPRING = { k: 260, c: 30 };

  const SHOTS = 3;
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const total = window.PROJECTS.length;

  /* ---------------- markup ---------------- */
  grid.innerHTML = window.PROJECTS.map((p, i) => {
    const n = String(total - i).padStart(2, '0');
    const shots = Array.from({ length: SHOTS }, (_, s) => {
      /* photo 1 paints at once, 2 is preloaded, 3 waits until it is needed */
      const load = s === 2 ? 'loading="lazy"' : '';
      const prio = s === 0 ? 'fetchpriority="high"' : '';
      const what = ['the landing view', 'a section further down', 'the phone layout'][s];
      return `<figure class="wslide" data-s="${s}">
          <img src="assets/shots/${p.slug}-${s + 1}.webp"
               alt="${p.name}, ${what}" ${load} ${prio}
               decoding="async" width="1280" height="800">
        </figure>`;
    }).join('');

    return `
    <article class="wcard is-latent" tabindex="0" data-i="${i}"
             data-side="${i % 2 ? 'b' : 'a'}"
             aria-roledescription="project" aria-label="${p.name}, ${p.sector}">

      <div class="wcard__media">
        <div class="wcard__frame">
          <div class="wstack" role="group" aria-label="${p.name}, ${SHOTS} photos">${shots}</div>
        </div>
        <div class="wcard__bar">
          <span class="wcard__count" data-count>01 / ${String(SHOTS).padStart(2, '0')}</span>
          <span class="wcard__shot" data-shot>The landing view</span>
          <span class="wcard__rule"><i data-rule></i></span>
          <span class="wcard__nav">
            <button type="button" data-prev aria-label="Previous photo of ${p.name}" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>
            </button>
            <button type="button" data-next aria-label="Next photo of ${p.name}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
            </button>
          </span>
        </div>
      </div>

      <div class="wcard__body">
        <span class="wcard__no">${n} / ${total}</span>
        <h3 class="wcard__title"><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3>
        <ul class="wcard__tags">
          ${p.client ? '<li class="client">Client work</li>' : ''}
          <li>${p.sector}</li>
          ${p.stack.map(s => `<li>${s}</li>`).join('')}
        </ul>
        <dl>
          <div><dt>Problem</dt><dd>${p.problem}</dd></div>
          <div><dt>What I built</dt><dd>${p.solution}</dd></div>
          <div><dt>Why it matters</dt><dd>${p.role}</dd></div>
        </dl>
        <a class="link wcard__link" href="${p.url}" target="_blank" rel="noopener"
           tabindex="-1">Visit the live site ${arrow}</a>
      </div>
    </article>`;
  }).join('');


  /* ---------------- the stack ----------------
     `pos` is a float: 0 = photo 1 in front, 1.5 = halfway to photo 3.
     Drag, spring and the arrow buttons all move that one number, so the
     three photos only ever read from a single source of truth. */
  const cards = [...grid.querySelectorAll('.wcard')];
  let lastActive = -1;   // the frame the cursor left on, used by the handoff

  cards.forEach(card => {
    const frame  = card.querySelector('.wcard__frame');
    const slides = [...card.querySelectorAll('.wslide')];
    const count  = card.querySelector('[data-count]');
    const shotName = card.querySelector('[data-shot]');
    const NAMES  = ['The landing view', 'Further down the page', 'The phone layout'];
    const rule   = card.querySelector('[data-rule]');
    const prev   = card.querySelector('[data-prev]');
    const next   = card.querySelector('[data-next]');
    const max    = SHOTS - 1;

    let pos = 0, target = 0, vel = 0;
    let fan = 1, fanTo = 1;                 // 1 at rest, 1.4 when attended to
    let raf = 0, hinted = false;
    let dragging = false, ptr = null, startX = 0, startPos = 0, lastX = 0, lastT = 0;

    /* rubber band past the ends — resistance, not a wall */
    const band = v => v < 0 ? v * 0.32 : v > max ? max + (v - max) * 0.32 : v;

    const place = () => {
      for (const s of slides) {
        const d = +s.dataset.s - pos;        // <0 gone, 0 front, >0 waiting behind
        let x, rot, sc, op, z;
        if (d <= 0) {                        // hands off to the left, out of frame
          x = `${d * 108}%`;
          rot = d * 2; sc = 1; op = 1 + d * 1.6; z = 50 + d;   // leaves over the next
        } else {                             // stacked behind, offset and turned
          x = `${d * T.stackX * fan}px`;
          rot = d * T.stackRot * fan; sc = 1 - d * 0.03; op = 1; z = 30 - d;   // waits under
        }
        s.style.transform = `translate3d(${x},0,0) rotate(${rot}deg) scale(${sc})`;
        s.style.opacity = Math.max(0, Math.min(1, op));

        /* z-index and attributes are not animated values — write them only
           when they actually change, so the loop stays transform/opacity */
        const zi = String(Math.round(z * 10));
        if (s.dataset.z !== zi) { s.dataset.z = zi; s.style.zIndex = zi; }
        const front = Math.abs(d) < 0.5;
        if (s.hasAttribute('data-front') !== front) s.toggleAttribute('data-front', front);
      }
      rule.style.transform = `scaleX(${(Math.max(0, Math.min(max, pos)) + 1) / SHOTS})`;

      const shown = Math.round(Math.max(0, Math.min(max, pos))) + 1;
      if (count.dataset.shown !== String(shown)) {
        count.dataset.shown = String(shown);
        count.textContent =
          `${String(shown).padStart(2, '0')} / ${String(SHOTS).padStart(2, '0')}`;
        shotName.textContent = NAMES[shown - 1];
        prev.disabled = shown === 1;
        next.disabled = shown === SHOTS;
      }
    };

    /* will-change goes on when something starts moving, off when it stops */
    const hint = () => {
      if (hinted) return;
      hinted = true;
      slides.forEach(s => { s.style.willChange = 'transform,opacity'; });
    };
    const unhint = () => {
      if (!hinted || raf || dragging) return;
      hinted = false;
      slides.forEach(s => { s.style.willChange = ''; });
    };

    /* one loop for both the slider spring and the fan — transform/opacity only */
    const tick = () => {
      raf = 0;
      const dt = 1 / 60;

      if (!dragging) {                       // spring toward the settled photo
        vel += ((target - pos) * SPRING.k - vel * SPRING.c) * dt;
        pos += vel * dt;
      }
      fan += (fanTo - fan) * 0.18;           // fan opens and closes, no overshoot

      place();

      const moving = !dragging &&
        (Math.abs(target - pos) > 0.0006 || Math.abs(vel) > 0.0025);
      const fanning = Math.abs(fanTo - fan) > 0.002;
      if (moving || fanning || dragging) {
        raf = requestAnimationFrame(tick);
      } else {
        if (!dragging) { pos = target; vel = 0; }
        fan = fanTo;
        place();
        unhint();
      }
    };
    const run = () => { hint(); if (!raf) raf = requestAnimationFrame(tick); };

    const settle = to => {
      target = Math.max(0, Math.min(max, to));
      if (reduced) { pos = target; vel = 0; place(); return; }
      run();
    };
    const setFan = open => {
      fanTo = reduced ? 1 : (open ? T.fanOpen : 1);
      if (!reduced) run();
    };

    /* --- pointer drag --- */
    frame.addEventListener('pointerdown', e => {
      if (e.button) return;
      dragging = true; ptr = e.pointerId;
      startX = lastX = e.clientX; startPos = pos; lastT = performance.now(); vel = 0;
      card.classList.add('is-dragging');
      setFan(false);
      run();
      frame.setPointerCapture(ptr);
    });

    frame.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== ptr) return;
      const now = performance.now();
      if (now > lastT) {
        vel = -(e.clientX - lastX) / frame.clientWidth / ((now - lastT) / 1000);
      }
      lastX = e.clientX; lastT = now;
      pos = band(startPos - (e.clientX - startX) / frame.clientWidth);
      place();
    });

    const release = e => {
      if (!dragging || (e && e.pointerId !== ptr)) return;
      dragging = false;
      card.classList.remove('is-dragging');
      /* a flick carries exactly one photo; a slow drag lands on the nearest */
      const flick = Math.abs(vel) > 1.1 ? Math.sign(vel) : 0;
      settle(flick ? Math.round(startPos) + flick : Math.round(pos));
      if (matchMedia('(hover:hover)').matches && card.matches(':hover')) setFan(true);
    };
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);

    /* a tap on the photo advances it; a drag that ended here does not */
    frame.addEventListener('click', () => {
      if (Math.abs(lastX - startX) > 6) return;
      settle(pos >= max - 0.01 ? 0 : Math.round(pos) + 1);
    });

    prev.addEventListener('click', e => { e.stopPropagation(); settle(Math.round(pos) - 1); });
    next.addEventListener('click', e => { e.stopPropagation(); settle(Math.round(pos) + 1); });

    /* --- keyboard, while the card holds focus --- */
    card.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); settle(Math.round(pos) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); settle(Math.round(pos) + 1); }
      if (e.key === 'Enter' && e.target === card) card.querySelector('.wcard__title a').click();
    });

    /* attention opens the fan — pointer and keyboard reach the same state */
    card.addEventListener('pointerenter', () => setFan(true));
    card.addEventListener('pointerleave', () => { if (!dragging) setFan(false); });
    card.addEventListener('focusin', () => setFan(true));
    card.addEventListener('focusout', () => { if (!card.contains(document.activeElement)) setFan(false); });

    place();
  });

  /* ---------------- entry ----------------
     Each row develops in from the side it sits on: the photographs lead,
     the writing follows one beat later. One row at a time, alternating,
     so the column reads as a sequence rather than a wall. */
  const enter = card => {
    card.classList.remove('is-latent');
    if (reduced || !window.gsap) return;

    const side  = card.dataset.side === 'b' ? 1 : -1;
    const media = card.querySelector('.wcard__media');
    const body  = card.querySelector('.wcard__body');
    const dist  = T.enterX;

    gsap.fromTo([media, body],
      { x: k => (k === 0 ? side : -side * 0.62) * dist, opacity: 0 },
      {
        x: 0, opacity: 1, duration: T.enter / 1000, ease: 'power3.out',
        stagger: T.stagger / 1000, overwrite: true,
        onComplete() { gsap.set([media, body], { clearProps: 'transform,opacity' }); }
      });
  };

  if (reduced) {
    cards.forEach(c => c.classList.remove('is-latent'));
  } else if (window.gsap && window.ScrollTrigger) {
    cards.forEach(card => ScrollTrigger.create({
      trigger: card, start: 'top 84%', once: true, onEnter: () => enter(card)
    }));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) if (e.isIntersecting) { enter(e.target); obs.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.remove('is-latent'));
  }
  /* ===================================================================
     Act 1 — the contact sheet
     Fourteen frames sit at 4% opacity, blurred and grey. A soft radius
     of attention travels with the cursor; the nearest frame develops to
     full, everyone else is capped halfway, so only one is ever readable.
     Reveal is quick, decay is slow — the asymmetry is the whole point.
     =================================================================== */
  const sheet = document.querySelector('#sheetGrid');
  const fine  = matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (sheet) {
    const RADIUS = 280;                    // px — the developing radius
    const TAU_UP = T.reveal / 3;           // 220ms reveal, as a time constant
    const TAU_DN = T.decay / 3;            // 600ms decay — always the slower one
    const CAP    = 0.5;                    // nobody but the nearest goes past this

    sheet.innerHTML = window.PROJECTS.map((p, i) => `
      <button class="sheet__item" type="button" data-i="${i}"
              aria-label="Open ${p.name}, ${p.sector}">
        <img src="assets/shots/${p.slug}-1.webp" alt="" aria-hidden="true"
             loading="lazy" decoding="async" width="1280" height="800">
        <figcaption><b>${p.name}</b><span>${String(total - i).padStart(2, '0')}</span></figcaption>
      </button>`).join('');

    const items = [...sheet.querySelectorAll('.sheet__item')];
    const state = items.map(() => ({ p: 0, w: 0 }));   // p = shown, w = wanted
    let mx = -9999, my = -9999, inside = false, last = 0, loop = 0, activeIdx = -1;
    let developed = false;                 // true once the sheet has handed over
    let rects = [];

    const measure = () => { rects = items.map(el => el.getBoundingClientRect()); };
    const smooth = x => x * x * (3 - 2 * x);           // soft edge, not a hard circle

    const frame = now => {
      loop = 0;
      if (developed) return;
      const dt = Math.min(64, now - (last || now)); last = now;

      /* who is nearest — one active index per frame, never per-card hover */
      let best = -1, bestRaw = 0;
      for (let i = 0; i < items.length; i++) {
        const r = rects[i];
        if (!r) continue;
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        const raw = inside ? Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS) : 0;
        state[i].w = smooth(raw);
        if (raw > bestRaw) { bestRaw = raw; best = i; }
      }
      for (let i = 0; i < items.length; i++) {
        if (i !== best) state[i].w = Math.min(state[i].w, CAP);
      }
      if (best !== activeIdx) {
        if (activeIdx > -1) items[activeIdx].removeAttribute('data-active');
        if (best > -1) items[best].setAttribute('data-active', '');
        activeIdx = best;
        if (best > -1) lastActive = best;
      }

      /* lerp toward the wanted value — up fast, down slow */
      let busy = false;
      for (let i = 0; i < items.length; i++) {
        const s = state[i];
        const tau = s.w > s.p ? TAU_UP : TAU_DN;
        s.p += (s.w - s.p) * (1 - Math.exp(-dt / tau));
        if (Math.abs(s.w - s.p) > 0.002) busy = true;
        const v = Math.round(s.p * 1000) / 1000;
        if (items[i].dataset.p !== String(v)) {
          items[i].dataset.p = String(v);
          items[i].style.setProperty('--p', v);       /* opacity + filter only */
        }
      }
      if (busy || inside) loop = requestAnimationFrame(frame);
    };
    const run = () => { if (!loop && !reduced) loop = requestAnimationFrame(frame); };

    if (!reduced && fine) {
      sheet.addEventListener('pointerenter', () => { inside = true; measure(); run(); });
      sheet.addEventListener('pointerleave', () => { inside = false; last = 0; run(); });
      sheet.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
      addEventListener('resize', measure, { passive: true });
      addEventListener('scroll', () => { if (inside) measure(); }, { passive: true });

      /* the keyboard walks the same path the cursor does */
      items.forEach((el, i) => {
        el.addEventListener('focus', () => {
          const r = el.getBoundingClientRect();
          measure();
          mx = r.left + r.width / 2; my = r.top + r.height / 2;
          inside = true; run();
        });
        el.addEventListener('blur', () => { inside = false; run(); });
      });
    }

    /* Act 2 — the handoff, on the way out.
       As the sheet leaves the viewport every frame develops at once, in a
       stagger that radiates from whichever one the cursor left on. Come
       back up and they re-latent, so the sheet is never spent. */
    const developAll = () => {
      if (developed) return;
      developed = true;
      if (loop) { cancelAnimationFrame(loop); loop = 0; }
      const anchor = lastActive > -1 ? lastActive : 0;
      const order = items
        .map((el, i) => ({ i, d: Math.abs(i - anchor) }))
        .sort((a, b) => a.d - b.d);
      order.forEach(({ i }, rank) => {
        const el = items[i];
        el.style.transition = `opacity ${T.reveal * 2}ms var(--ease-dev) ${rank * T.stagger}ms,` +
                              ` filter ${T.reveal * 2}ms var(--ease-dev) ${rank * T.stagger}ms`;
        el.style.setProperty('--p', 1);
        state[i].p = state[i].w = 1;
        el.dataset.p = '1';
      });
    };
    const relatent = () => {
      if (!developed) return;
      developed = false;
      items.forEach((el, i) => {
        el.style.transition = `opacity ${T.decay}ms var(--ease-latent),` +
                              ` filter ${T.decay}ms var(--ease-latent)`;
        el.style.setProperty('--p', 0);
        state[i].p = state[i].w = 0;
        el.dataset.p = '0';
        setTimeout(() => { el.style.transition = ''; }, T.decay);
      });
      last = 0;
      run();
    };

    if (!reduced && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: '#sheet', start: 'bottom 72%',
        onEnter: developAll, onLeaveBack: relatent
      });
    }

    /* Act 2 — the handoff, on the way in.
       Pick a frame and it flies down into its row: measure here, measure
       there, animate the difference with transform only. */
    items.forEach((el, i) => el.addEventListener('click', () => handoff(i, el)));
  }

  /* ------------------------------------------------------------------ */
  function handoff(i, from) {
    const card = cards[i];
    if (!card) return;

    /* the row must already be developed when the frame lands on it */
    if (card.classList.contains('is-latent')) {
      card.classList.remove('is-latent');
      if (window.gsap) gsap.set(card.querySelectorAll('.wcard__media,.wcard__body'),
        { clearProps: 'transform,opacity', opacity: 1 });
    }

    if (reduced || !window.gsap) {
      card.scrollIntoView({ block: 'center' });
      card.focus({ preventScroll: true });
      return;
    }

    const first = from.getBoundingClientRect();
    const src = from.querySelector('img').currentSrc || from.querySelector('img').src;

    /* First … then jump to where it is going and measure Last */
    const prevBehaviour = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    card.scrollIntoView({ block: 'center' });
    document.documentElement.style.scrollBehavior = prevBehaviour;

    const target = card.querySelector('.wcard__frame');
    const last = target.getBoundingClientRect();

    const flip = document.createElement('figure');
    flip.className = 'flip';
    flip.style.cssText =
      `left:0;top:0;width:${first.width}px;height:${first.height}px;` +
      `transform:translate3d(${first.left}px,${first.top}px,0)`;
    flip.innerHTML = `<img src="${src}" alt="">`;
    document.body.appendChild(flip);

    /* the row waits, dimmed, until the frame arrives */
    gsap.set(target, { opacity: 0 });

    gsap.to(flip, {
      x: last.left, y: last.top,
      scaleX: last.width / first.width, scaleY: last.height / first.height,
      duration: T.enter / 1000, ease: 'power3.out',
      onComplete() {
        gsap.to(target, { opacity: 1, duration: 0.18, ease: 'none' });
        gsap.to(flip, {
          opacity: 0, duration: 0.18, ease: 'none',
          onComplete: () => flip.remove()
        });
        card.focus({ preventScroll: true });
      }
    });
  }
})();
