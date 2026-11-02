/* =====================================================================
   Agents + Getting found
   - the console: six real businesses, each agent working a real request,
     typed out message by message, ending in the brief the owner receives
   - the roster: every agent from js/agents.js, one row per business
   - the funnel line, drawn against scroll
   ===================================================================== */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = Object.fromEntries((window.PROJECTS || []).map(p => [p.slug, p]));
  const A = window.AGENTS || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- the console ---------------- */
  const DEMOS = [
    { slug: 'vie-beauty', chan: 'WhatsApp', log: [
      ['in',  'Hi! My skin has been really dry lately. Which treatment would help? Is Saturday possible?'],
      ['out', 'Hi! For dry skin, the 60-minute hydrating facial is the best fit. This Saturday we still have 11:00 and 15:30 — which works for you?'],
      ['in',  '15:30 please'],
      ['out', 'Great, 15:30 is held for you. May I have your name, and do you have any product allergies?'],
      ['in',  'Rina, no allergies'],
      ['out', 'Thank you, Rina. Your booking is confirmed — I will send a reminder on Friday afternoon.'] ],
      brief: 'NEW BOOKING\nTreatment   Hydrating facial · 60 min\nWhen        Saturday 15:30\nGuest       Rina · no allergies\nSkin        dry\nSource      Instagram ad → WhatsApp' },

    { slug: 'papa-e-bakery', chan: 'Instagram DM', log: [
      ['in',  'can I get a dozen brown butter cookies for saturday?'],
      ['out', 'Yes! This batch still has room. Pickup is Saturday — want to add cakepops? Cookies & Cream is back this week.'],
      ['in',  'add 6 cookies and cream'],
      ['out', 'Done: 12 brown butter chocolate chunk + 6 Cookies & Cream cakepops, Saturday pickup. Payment link is below — I will remind you Friday evening.'] ],
      brief: 'PRE-ORDER · this week\'s batch\n12 × Brown butter chocolate chunk\n 6 × Cakepop · Cookies & Cream\nPickup      Saturday\nPaid        link sent\nBatch       capacity updated' },

    { slug: 'atelier-renovation', chan: 'Site chat', log: [
      ['in',  'Hello, I would like to redo a bathroom in Palaiseau.'],
      ['out', 'Hello! To prepare the quote: roughly how big is the room, and does the plumbing need to change?'],
      ['in',  'About 6 m², and we want to move the shower.'],
      ['out', 'Thanks. Moving the shower needs a site visit before we can price it. I can offer Tuesday 10:00 or Thursday 16:00.'],
      ['in',  'Thursday.'],
      ['out', 'Booked for Thursday at 16:00. You will get a summary by email.'] ],
      brief: 'QUALIFIED REQUEST\nProject     Bathroom · 6 m²\nTrades      Plumbing, plaster, painting\nLocation    Palaiseau (91)\nVisit       Thursday 16:00\nNote        shower to be moved' },

    { slug: 'riv-group', chan: 'WhatsApp', log: [
      ['in',  'We are planning a 3-storey office in Bekasi, about 900 m². Do you do design & build?'],
      ['out', 'Yes — design & build is one of our six service lines. Is the land ready, and when would you like to start?'],
      ['in',  'Land is ready, start in Q2'],
      ['out', 'Noted. I have sent two similar commercial projects from our portfolio. Our estimator can survey the site — which day suits you?'] ],
      brief: 'TENDER BRIEF\nType        Commercial · 3-storey office\nArea        ~900 m²\nLocation    Bekasi\nScope       Design & build\nStart       Q2 · land ready\nNext        site survey' },

    { slug: 'zona-seafood', chan: 'WhatsApp', log: [
      ['in',  'I would like a table for 12 on Saturday night at 7'],
      ['out', 'Sure! Which area are you coming from? I will find the nearest branch that still has a long table.'],
      ['in',  'Seturan'],
      ['out', 'The branch nearest Seturan has a table for 12 at 19:00. What name should I book it under?'] ],
      brief: 'RESERVATION → nearest branch\nParty       12 people · long table\nWhen        Saturday 19:00\nFrom        Seturan\nFlag        large group, kitchen notified' },

    { slug: 'lpm-pelita-kasih', chan: 'WhatsApp', log: [
      ['in',  'I would like to become a foster parent. How does it work?'],
      ['out', 'Thank you! A foster parent supports one child\'s education through the foundation. May I note your name and city? Our team will contact you to introduce the programme.'],
      ['in',  'Maria, from Semarang'],
      ['out', 'Noted, Maria. The LPM Pelita Kasih team will contact you within two working days.'] ],
      brief: 'NEW FOSTER PARENT ENQUIRY\nName        Maria\nCity        Semarang\nInterest    Foster parent programme\nNext        introduction call by the team' },
  ];

  const con = document.querySelector('#console');
  if (con) {
    const side = con.querySelector('.console__side');
    const log = con.querySelector('#consoleLog');
    const brief = con.querySelector('#consoleBrief');
    const who = con.querySelector('#consoleWho');
    const forEl = con.querySelector('#consoleFor');
    const chan = con.querySelector('#consoleChan');

    side.innerHTML = DEMOS.map((d, i) => {
      const p = P[d.slug] || { name: d.slug, sector: '' };
      return `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">
        <b>${esc(p.name)}</b><span>${esc((A[d.slug] || {}).name || '')}</span></button>`;
    }).join('');
    const tabs = [...side.querySelectorAll('button')];

    let cur = 0, timers = [], visible = false, touched = false, done = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const bubble = (dir, text) => {
      const el = document.createElement('p');
      el.className = `msg msg--${dir}`;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    };

    const play = i => {
      clear();
      cur = i; done = false;
      const d = DEMOS[i];
      tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
      who.textContent = (A[d.slug] || {}).name || 'Agent';
      forEl.textContent = (P[d.slug] || {}).name || '';
      chan.textContent = d.chan;
      log.innerHTML = '';
      brief.textContent = '';
      brief.parentElement.classList.remove('is-in');

      if (reduced) {
        d.log.forEach(([dir, t]) => bubble(dir, t));
        brief.textContent = d.brief;
        brief.parentElement.classList.add('is-in');
        return;
      }

      let t = 300;
      d.log.forEach(([dir, text]) => {
        if (dir === 'out') {
          later(() => { const typing = bubble('out', ''); typing.classList.add('msg--typing');
            typing.innerHTML = '<i></i><i></i><i></i>'; typing.dataset.typing = '1'; }, t);
          t += 900;
          later(() => {
            const typing = log.querySelector('[data-typing]');
            if (typing) typing.remove();
            bubble('out', text);
          }, t);
          t += 400 + text.length * 14;
        } else {
          later(() => bubble('in', text), t);
          t += 500 + text.length * 22;
        }
      });
      later(() => {
        brief.parentElement.classList.add('is-in');
        let k = 0;
        const type = () => { brief.textContent = d.brief.slice(0, k += 3); if (k < d.brief.length) later(type, 16); };
        type();
      }, t + 200);
      later(() => { done = true; if (!touched && visible) play((cur + 1) % DEMOS.length); }, t + 4200);
    };

    tabs.forEach(b => b.addEventListener('click', () => { touched = true; play(+b.dataset.i); }));
    side.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const n = (cur + (e.key === 'ArrowDown' ? 1 : -1) + DEMOS.length) % DEMOS.length;
      touched = true; play(n); tabs[n].focus();
    });

    /* only talks while you can see it */
    let started = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !started) { started = true; play(0); }
        else if (visible && done && !touched) play((cur + 1) % DEMOS.length);
      }, { threshold: 0.35 }).observe(con);
    } else play(0);
  }

  /* ---------------- the roster ---------------- */
  const roster = document.querySelector('#roster');
  if (roster && window.PROJECTS) {
    roster.innerHTML = window.PROJECTS.map((p, i) => {
      const a = A[p.slug];
      if (!a) return '';
      return `<details class="rrow">
        <summary>
          <span class="rrow__n">${String(i + 1).padStart(2, '0')}</span>
          <span class="rrow__biz"><b>${esc(p.name)}</b><i>${esc(p.sector)}</i></span>
          <span class="rrow__agent">${esc(a.name)}</span>
          <span class="rrow__lands">${esc(a.lands)}</span>
          <span class="rrow__plus" aria-hidden="true"></span>
        </summary>
        <div class="rrow__body">
          <p>${esc(a.job)}</p>
          <ul>${a.does.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
        </div>
      </details>`;
    }).join('');
  }

  /* ---------------- the funnel line ---------------- */
  const path = document.querySelector('#funnelPath');
  if (path) {
    const fun = path.closest('.funnel');
    if (reduced || !window.gsap || !window.ScrollTrigger) { fun.classList.add('is-drawn'); return; }
    window.addEventListener('load', () => {
      gsap.fromTo(path, { strokeDashoffset: 1000 }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: fun, start: 'top 85%', end: 'top 35%', scrub: 0.6,
          onUpdate: self => fun.style.setProperty('--f', self.progress.toFixed(3)) }
      });
    });
  }
})();
