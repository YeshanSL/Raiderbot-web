// Builds the lock screen, top bar, footer, toast and ember background on every page.
(() => {
  const C = window.RAIDER, page = document.body.dataset.page || '';
  const pages = [['home', 'index.html', 'Home'], ['commands', 'commands.html', 'Commands'], ['control', 'control.html', 'Control'], ['docs', 'docs.html', 'Docs']];
  const lockIc = (s = 16) => `<svg class="padlock" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="shackle" d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="4.5" y="11" width="15" height="10" rx="2"/><circle cx="12" cy="16" r="1.2" fill="currentColor"/></svg>`;

  const gate = `<div id="gate"><div class="stage"><div class="g-logo"><i class="g-ring"></i><img src="assets/logo.png" alt="${C.name}"></div>
    <div class="g-swap"><div class="boot"><div class="bar"><span></span></div><p id="boot-text">Starting…</p></div>
    <form class="gform" id="gform">${'<div class="g-state">' + lockIc(26) + '<span id="g-label">Restricted access</span></div>'}
    <label class="sr" for="k">Passkey</label><input id="k" type="password" autocomplete="current-password" placeholder="Enter passkey" required>
    <button class="btn primary" type="submit">Unlock</button><p id="gmsg" role="status"></p></form></div></div></div>`;

  const header = `<header class="nav"><div class="wrap"><a class="logo" href="index.html"><img class="mark" src="assets/mark.png" alt=""><span data-name>Dark Raider</span></a>
    <nav id="nav">${pages.map(p => `<a href="${p[1]}"${p[0] === page ? ' aria-current="page"' : ''}>${p[2]}</a>`).join('')}</nav>
    <div class="right"><span class="pill" data-status><span class="dot"></span><span data-status-text>Checking…</span></span>
    <button class="btn sm lock" id="lock" type="button" title="Lock the site (use when you step away)">${lockIc()}Lock</button></div>
    <button class="menu-btn" aria-label="Menu" aria-controls="nav">☰</button></div></header>`;

  const footer = `<footer><div class="wrap"><span>© <span id="year"></span> <span data-name>Dark Raider</span> · Private, members only</span>
    <span><a href="docs.html">Docs</a> &nbsp;·&nbsp; <a href="#" id="out">Lock</a></span></div></footer>`;

  document.body.insertAdjacentHTML('afterbegin', gate + header);
  document.body.insertAdjacentHTML('beforeend', footer + '<div id="toast" role="status" aria-live="polite"></div>');

  // Slow rising embers behind everything
  const cv = document.createElement('canvas'); cv.id = 'fx'; document.body.prepend(cv);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const x = cv.getContext('2d'); let w, h; const P = [];
    const fit = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; }; fit(); addEventListener('resize', fit);
    for (let i = 0; i < 38; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, v: Math.random() * .35 + .12, d: Math.random() * 6, a: Math.random() * .5 + .15 });
    (function tick() {
      x.clearRect(0, 0, w, h);
      for (const p of P) { p.y -= p.v; p.x += Math.sin(p.y / 60 + p.d) * .25; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        x.fillStyle = `rgba(255,40,50,${p.a})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
      requestAnimationFrame(tick);
    })();
  }

  let t;
  window.toast = (text, kind = '') => {
    const el = document.getElementById('toast'); el.textContent = text; el.className = 'show ' + kind;
    clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 4200);
  };
})();
