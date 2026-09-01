/* =====================================================================
   Hasan Aufar — interactions
   GSAP + ScrollTrigger. Motion is scroll-driven; nothing autoplays.
   ===================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('no-motion');

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     1 · IDENTITIES — a real ring in 3D space
     Each card sits on a circle at a fixed angle. Turning the ring moves
     one continuous position value; every card takes the shortest way
     round, so the wrap happens behind the viewer and is never seen.
  ------------------------------------------------------------------ */
  const IDENTITIES = [
    {
      role: 'Founder',
      name: 'Farnsher Studio',
      img: 'assets/img/id-founder.webp',
      tag: 'Farnsher Studio',
      meta: 'Client work',
      copy: 'Farnsher Studio is the name I ship client work under — websites and digital products for small businesses that need a real storefront, not a listing on someone else’s platform. I take the whole thing: positioning, copy, build, handover.',
      facts: [
        ['Works with', 'F&B, beauty, transport, construction, local retail'],
        ['Scope', 'Positioning → copy → build → deploy → handover'],
        ['Shop', 'payhip.com/hsnrrtech']
      ]
    },
    {
      role: 'Content creator',
      name: 'hsnrr.tech',
      img: 'assets/img/id-creator.webp',
      tag: 'hsnrr.tech',
      meta: 'Instagram · TikTok · YouTube',
      copy: 'I review AI tools by actually using them until they break, and I document every site while I build it. No top-ten lists. The account exists so people can watch the work happen and judge it themselves — 18,000 views in the first month.',
      facts: [
        ['Pillars', 'Verdict · AI Reviews · Portfolio · Content · Tools · Testing'],
        ['Cadence', 'One new AI tool every week'],
        ['First month', '18,000 views from zero']
      ]
    },
    {
      role: 'Developer',
      name: 'Frontend &amp; AI agents',
      img: 'assets/img/id-developer.webp',
      tag: 'Frontend / AI',
      meta: 'Fourteen builds live',
      copy: 'Next.js, Tailwind and vanilla JS on the front; agent and workflow automation behind it — booking flows that compose themselves into WhatsApp messages, estimators, client portals, RAG. Self-taught, fourteen builds live, still learning in public.',
      facts: [
        ['Stack', 'Next.js · React · Tailwind · vanilla JS · GSAP'],
        ['Automation', 'AI agents, workflow tooling, WhatsApp handoff'],
        ['Looking for', 'Remote frontend work, Europe-friendly hours']
      ]
    }
  ];

  const N = IDENTITIES.length;
  const STEP = 52;                     // degrees between cards on the ring
  const ring = $('#ring');
  const track = $('#ringTrack');
  const dotsEl = $('#ringDots');
  let pos = 0;                         // continuous ring position, in cards
  let cards = [];

  IDENTITIES.forEach((id, i) => {
    const el = document.createElement('article');
    el.className = 'ring__card';
    el.innerHTML =
      `<figure>
         <img src="${id.img}" alt="${id.role} — ${id.name.replace(/&amp;/g, 'and')}"
              decoding="async" ${i ? 'loading="lazy"' : ''}>
         <figcaption><em>${id.tag}</em><span>${id.meta}</span></figcaption>
       </figure>`;
    el.addEventListener('click', () => go(i));
    track.appendChild(el);
    cards.push(el);

    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', `Show ${id.role}`);
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  });

  /* shortest signed distance from a card to the front of the ring */
  const wrap = k => ((k % N) + N + N / 2) % N - N / 2;

  const layout = () => {
    const radius = cards[0].offsetWidth * (window.innerWidth < 760 ? 1.02 : 0.78);
    cards.forEach((el, i) => {
      const k = wrap(i - pos);
      const a = k * STEP;
      const far = Math.min(Math.abs(k), 1.5) / 1.5;
      gsap.set(el, {
        xPercent: -50, yPercent: -50,
        rotationY: a,
        z: -Math.abs(k) * radius * 0.34,
        x: Math.sin(a * Math.PI / 180) * radius,
        y: Math.abs(k) * 14,
        opacity: 1 - far * 0.9,
        zIndex: 100 - Math.round(Math.abs(k) * 10)
      });
    });
    const active = Math.round(((pos % N) + N) % N) % N;
    cards.forEach((el, i) => el.classList.toggle('is-active', i === active));
  };

  const paint = i => {
    const id = IDENTITIES[i];
    $('#ringGhost').textContent = String(i + 1).padStart(2, '0');
    $('#ringRole').textContent = id.role;
    $('#ringName').innerHTML = id.name;
    $('#ringCopy').textContent = id.copy;
    $('#ringFacts').innerHTML = id.facts
      .map(([k, v]) => `<li><span>${k}</span>${v}</li>`).join('');
    $$('button', dotsEl).forEach((d, j) =>
      d.setAttribute('aria-current', j === i ? 'true' : 'false'));

    if (reduced) return;
    gsap.fromTo('#ringRole, #ringName, #ringCopy, #ringFacts li',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .04, overwrite: true });
    gsap.fromTo('#ringGhost', { opacity: 0, scale: .92 },
      { opacity: 1, scale: 1, duration: .9, ease: 'power3.out', overwrite: true });
  };

  let index = 0, spinTween = null;
  function go(i, spin) {
    /* travel to the nearest instance of card i, so the ring never
       unwinds the long way round */
    const target = pos + wrap(i - pos) + (spin || 0);
    index = ((i % N) + N) % N;
    paint(index);
    if (reduced) { pos = target; layout(); return; }
    spinTween = gsap.to({ v: pos }, {
      v: target, duration: .95 + Math.abs(target - pos) * .12, ease: 'power3.out',
      overwrite: true,
      onUpdate() { pos = this.targets()[0].v; layout(); },
      onComplete() { pos = target; layout(); }
    });
  }

  $('#ringPrev').addEventListener('click', () => go(index - 1));
  $('#ringNext').addEventListener('click', () => go(index + 1));
  ring.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });

  /* drag: the ring turns with the finger, and a flick keeps turning */
  let dragging = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;
  const perCard = () => Math.max(120, ring.clientWidth * 0.34);

  ring.addEventListener('pointerdown', e => {
    dragging = true; startX = lastX = e.clientX; startPos = pos;
    lastT = performance.now(); vel = 0;
    if (spinTween) spinTween.kill();
    ring.setPointerCapture(e.pointerId);
  });
  ring.addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now();
    if (now > lastT) vel = (e.clientX - lastX) / (now - lastT);
    lastX = e.clientX; lastT = now;
    pos = startPos - (e.clientX - startX) / perCard();
    layout();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    const flick = Math.abs(vel) > 0.45 ? Math.sign(-vel) : 0;
    const landed = Math.round(pos) + flick;
    index = ((landed % N) + N) % N;
    paint(index);
    spinTween = gsap.to({ v: pos }, {
      v: landed, duration: .85, ease: 'power3.out',
      onUpdate() { pos = this.targets()[0].v; layout(); },
      onComplete() { pos = landed; layout(); }
    });
  };
  ring.addEventListener('pointerup', release);
  ring.addEventListener('pointercancel', release);

  layout();
  paint(0);
  window.addEventListener('resize', layout);

  /* ------------------------------------------------------------------
     2 · BOOKING — the form writes the brief, the button sends it
  ------------------------------------------------------------------ */
  const WA = '6289620928296';
  const preview = $('#bookPreview');
  const who = $('#bookWho');
  const decode = s => { const d = document.createElement('textarea'); d.innerHTML = s; return d.value; };

  const brief = () => {
    const pages = $('#chipPages .chip[aria-pressed="true"]');
    const needs = $$('#chipNeeds .chip[aria-pressed="true"]')
      .map(b => decode(b.dataset.need));
    const lines = ['Hi Hasan — I’d like a quote for a website.'];
    lines.push(pages ? `Size: ${decode(pages.dataset.pages)}.`
                     : 'Size: not decided yet.');
    lines.push(needs.length ? `Needs: ${needs.join(', ')}.`
                            : 'Needs: just the pages for now.');
    if (who.value.trim()) lines.push(`Business: ${who.value.trim()}.`);
    lines.push('Sent from hasanaufar.com');
    return lines.join('\n');
  };

  const refresh = () => {
    const text = brief();
    preview.textContent = text;
    $('#bookWa').href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    $('#bookMail').href = 'mailto:hasan.aufar1504@gmail.com'
      + '?subject=' + encodeURIComponent('Website brief')
      + '&body=' + encodeURIComponent(text);
  };

  $$('#chipPages .chip').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') === 'true';
    $$('#chipPages .chip').forEach(o => o.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', String(!on));
    refresh();
  }));
  $$('#chipNeeds .chip').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    refresh();
  }));
  who.addEventListener('input', refresh);
  $('#bookForm').addEventListener('submit', e => e.preventDefault());
  refresh();

  /* ------------------------------------------------------------------
     3 · STORY FILM — click to play, never autoplay
  ------------------------------------------------------------------ */
  const player = $('#player'), sv = $('#storyVideo'), sBtn = $('#storyPlay'), sTime = $('#storyTime');
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  sv.addEventListener('loadedmetadata', () => { sTime.textContent = fmt(sv.duration); });
  sv.addEventListener('timeupdate', () => {
    if (!sv.paused) sTime.textContent = `${fmt(sv.currentTime)} / ${fmt(sv.duration)}`;
  });
  sBtn.addEventListener('click', () => { sv.controls = true; sv.play(); });
  sv.addEventListener('play',  () => player.classList.add('is-playing'));
  sv.addEventListener('pause', () => player.classList.remove('is-playing'));
  sv.addEventListener('ended', () => { player.classList.remove('is-playing'); sv.currentTime = 0; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !sv.paused) sv.pause(); },
      { threshold: 0.25 }).observe(sv);
  }

  /* ------------------------------------------------------------------
     4 · ABOUT — expand the full story
  ------------------------------------------------------------------ */
  const aboutBody = $('#aboutBody'), aboutBtn = $('#aboutToggle');
  aboutBtn.addEventListener('click', () => {
    const open = aboutBody.classList.toggle('is-open');
    aboutBtn.setAttribute('aria-expanded', String(open));
    aboutBtn.textContent = open ? 'Close' : 'Read the whole story';
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------------
     5 · SCROLL — the film, the beats, reveals, nav, progress
  ------------------------------------------------------------------ */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const nav = $('#nav');
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => nav.classList.toggle('is-solid', self.scroll() > 60)
  });

  gsap.to('#progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: .25 }
  });

  const mm = gsap.matchMedia();

  mm.add({ motion: '(prefers-reduced-motion: no-preference)' }, ctx => {
    if (!ctx.conditions.motion) return;

    /* opening */
    gsap.from('#heroTitle .line > span', {
      yPercent: 118, duration: 1.25, ease: 'power3.out', stagger: .09, delay: .15
    });
    gsap.from('#heroMeta, #heroCue', {
      opacity: 0, y: 14, duration: 1, ease: 'power2.out', delay: .9, stagger: .12
    });

    /* ---- the film: one timeline, scrubbed by scroll ----
       The video is seeked frame by frame, and the beats are placed on
       the same timeline so each line lands on a moment of the footage. */
    const v = $('#heroVideo');
    const proxy = { t: 0 };
    let ready = false, wanted = 0, raf = 0;

    const seek = () => {
      raf = 0;
      if (ready && Math.abs(v.currentTime - wanted) > 0.012) v.currentTime = wanted;
    };
    const onReady = () => {
      ready = true;
      ScrollTrigger.refresh();
      v.removeEventListener('loadeddata', onReady);
    };
    v.addEventListener('loadeddata', onReady);
    if (v.readyState >= 2) onReady();

    /* iOS ignores currentTime until the element has seen a gesture */
    const prime = () => {
      v.play().then(() => v.pause()).catch(() => {});
      window.removeEventListener('touchstart', prime);
      window.removeEventListener('pointerdown', prime);
    };
    window.addEventListener('touchstart', prime, { once: true, passive: true });
    window.addEventListener('pointerdown', prime, { once: true });

    const end = $('#heroEnd');
    const film = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=420%',
        scrub: .5,
        pin: '.hero__stage',
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => end.classList.toggle('is-live', self.progress > 0.9)
      }
    });

    /* 0 → 10: the footage itself */
    film.to(proxy, {
      t: () => (v.duration || 8) - 0.05, duration: 10,
      onUpdate() { wanted = proxy.t; if (!raf) raf = requestAnimationFrame(seek); }
    }, 0);

    /* the opening title clears the frame */
    film.to('#heroInner', { yPercent: -14, opacity: 0, duration: 1.1 }, 0.25)
        .to('#heroCue',   { opacity: 0, duration: .5 }, 0);

    /* three beats, each held for a beat, then released */
    const beats = ['#beat1', '#beat2', '#beat3'];
    const at = [1.9, 4.0, 6.1];
    beats.forEach((b, i) => {
      film.fromTo(b, { opacity: 0, y: 34, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'power2.out' }, at[i])
          .to(b, { opacity: 0, y: -26, filter: 'blur(5px)', duration: .7, ease: 'power2.in' },
        at[i] + 1.5);
    });

    /* the end card: know more */
    film.fromTo(end, { opacity: 0, scale: .97 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 8.4);
    film.fromTo('#heroEnd .h2', { y: 26 }, { y: 0, duration: 1, ease: 'power2.out' }, 8.4);

    /* section reveals — once in, they stay in */
    const show = els => (els.forEach(el => { el.dataset.rv = 'in'; }), gsap.to(els, {
      opacity: 1, y: 0, duration: .95, ease: 'power3.out',
      stagger: { amount: Math.min(0.45, els.length * 0.08) }, overwrite: true
    }));
    ScrollTrigger.batch('.rv', { start: 'top 90%', once: true,
      onEnter: b => show(b.filter(el => el.dataset.rv !== 'in')) });

    /* anything already on screen at load (or after a jump link) reveals now */
    const sweep = () => {
      const pending = $$('.rv').filter(el =>
        el.dataset.rv !== 'in' &&
        el.getBoundingClientRect().top < window.innerHeight * 0.95);
      if (pending.length) show(pending);
    };
    requestAnimationFrame(sweep);
    window.addEventListener('load', sweep);

    /* a jump link can skip past a batch trigger in a single frame —
       sweep on scroll (rAF-throttled) so nothing is ever left invisible */
    let queued = 0;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; sweep(); });
    }, { passive: true });

    /* the ring tilts as it passes — motion tied to scroll, not a loop */
    gsap.fromTo('#ringTrack',
      { rotationX: 7, y: 26 },
      { rotationX: -5, y: -26, ease: 'none',
        scrollTrigger: { trigger: '#identities', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    return () => gsap.set('.rv', { clearProps: 'all' });
  });

  mm.add({ still: '(prefers-reduced-motion: reduce)' }, () => {
    gsap.set('.rv', { opacity: 1, y: 0 });
    gsap.set('#heroEnd', { opacity: 1 });
    $('#heroEnd').classList.add('is-live');
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
