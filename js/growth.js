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
    { slug: 'vie-beauty', chan: 'WhatsApp', lang: 'ID', log: [
      ['in',  'Halo kak, kulit saya lagi kering banget. Ada treatment yang cocok? Sabtu bisa?'],
      ['out', 'Halo! Untuk kulit kering, facial hidrasi 60 menit paling pas. Sabtu ini masih ada jam 11.00 dan 15.30 — mau yang mana?'],
      ['in',  '15.30 ya'],
      ['out', 'Siap, jam 15.30 saya kunci. Boleh nama, dan apakah ada alergi produk?'],
      ['in',  'Rina, nggak ada alergi'],
      ['out', 'Terima kasih, Rina. Booking terkonfirmasi — pengingat saya kirim Jumat sore.'] ],
      brief: 'NEW BOOKING\nTreatment   Hydrating facial · 60 min\nWhen        Saturday 15:30\nGuest       Rina · no allergies\nSkin        dry\nSource      Instagram ad → WhatsApp' },

    { slug: 'papa-e-bakery', chan: 'Instagram DM', lang: 'EN', log: [
      ['in',  'can I get a dozen brown butter cookies for saturday?'],
      ['out', "Yes! This batch still has room. Pickup is Saturday — want to add cakepops? Cookies & Cream is back this week."],
      ['in',  'add 6 cookies and cream'],
      ['out', "Done: 12 brown butter chocolate chunk + 6 Cookies & Cream cakepops, Saturday pickup. Payment link is below — I'll remind you Friday evening."] ],
      brief: 'PRE-ORDER · this week\'s batch\n12 × Brown butter chocolate chunk\n 6 × Cakepop · Cookies & Cream\nPickup      Saturday\nPaid        link sent\nBatch       capacity updated' },

    { slug: 'atelier-renovation', chan: 'Site chat', lang: 'FR', log: [
      ['in',  'Bonjour, je voudrais refaire une salle de bain à Palaiseau.'],
      ['out', 'Bonjour ! Pour préparer le devis : quelle surface environ, et faut-il toucher à la plomberie ?'],
      ['in',  'Environ 6 m², et on déplace la douche.'],
      ['out', 'Merci. Déplacer la douche demande une visite avant de chiffrer. Je peux proposer mardi 10h ou jeudi 16h.'],
      ['in',  'Jeudi.'],
      ['out', 'C\'est noté pour jeudi 16h. Vous recevez le récapitulatif par e-mail.'] ],
      brief: 'DEMANDE QUALIFIÉE\nProjet      Salle de bain · 6 m²\nMétiers     Plomberie, plâtrerie, peinture\nLieu        Palaiseau (91)\nVisite      Jeudi 16:00\nNote        déplacement de la douche' },

    { slug: 'riv-group', chan: 'WhatsApp', lang: 'EN', log: [
      ['in',  "We're planning a 3-storey office in Bekasi, about 900 m². Do you do design & build?"],
      ['out', 'Yes — design & build is one of our six service lines. Is the land ready, and when would you like to start?'],
      ['in',  'Land is ready, start in Q2'],
      ['out', "Noted. I've sent two similar commercial projects from our portfolio. Our estimator can survey the site — which day suits you?"] ],
      brief: 'TENDER BRIEF\nType        Commercial · 3-storey office\nArea        ~900 m²\nLocation    Bekasi\nScope       Design & build\nStart       Q2 · land ready\nNext        site survey' },

    { slug: 'zona-seafood', chan: 'WhatsApp', lang: 'ID', log: [
      ['in',  'Mau reservasi 12 orang, malam Minggu jam 7'],
      ['out', 'Bisa! Dari daerah mana, kak? Saya carikan cabang terdekat yang masih ada meja panjang.'],
      ['in',  'Seturan'],
      ['out', 'Cabang terdekat dari Seturan masih ada meja untuk 12 orang jam 19.00. Saya pesankan atas nama siapa?'] ],
      brief: 'RESERVATION → nearest branch\nParty       12 people · long table\nWhen        Saturday 19:00\nFrom        Seturan\nFlag        large group, kitchen notified' },

    { slug: 'lpm-pelita-kasih', chan: 'WhatsApp', lang: 'ID', log: [
      ['in',  'Saya ingin jadi orang tua asuh, caranya bagaimana?'],
      ['out', 'Terima kasih! Orang Tua Asuh mendampingi pendidikan seorang anak asuh. Boleh saya catat nama dan kota Ibu/Bapak? Tim kami akan menghubungi untuk perkenalan.'],
      ['in',  'Maria, dari Semarang'],
      ['out', 'Sudah kami catat, Bu Maria. Tim LPM Pelita Kasih akan menghubungi Ibu dalam dua hari kerja.'] ],
      brief: 'CALON ORANG TUA ASUH\nNama        Maria\nKota        Semarang\nMinat       Orang Tua Asuh (OTA)\nNext        perkenalan oleh tim' },
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
        <b>${esc(p.name)}</b><span>${esc((A[d.slug] || {}).name || '')} · ${d.lang}</span></button>`;
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
