// Builds the lock screen, top bar, footer and toast on every page, so the menu lives in one place.
(() => {
  const C = window.RAIDER, page = document.body.dataset.page || '';
  const pages = [['home', 'index.html', 'Home'], ['commands', 'commands.html', 'Commands'], ['control', 'control.html', 'Control'], ['docs', 'docs.html', 'Docs']];
  const mark = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#ff5b3a"/><path d="M9 22 16 8l7 14-7-4z" fill="#160905"/></svg>';

  const gate = `<div id="gate"><form class="box card" id="gform"><div class="brand">${mark}<span data-name>Dark Raider</span></div>
    <p class="muted">Enter the passkey to continue.</p><label for="k">Passkey</label><input id="k" type="password" autocomplete="current-password" required autofocus>
    <div class="btns" style="margin-top:20px"><button class="btn primary" type="submit" style="width:100%">Unlock</button></div><p id="gmsg" role="status"></p></form></div>`;

  const header = `<header class="nav"><div class="wrap"><a class="logo" href="index.html">${mark}<span data-name>Dark Raider</span></a>
    <nav id="nav">${pages.map(p => `<a href="${p[1]}"${p[0] === page ? ' aria-current="page"' : ''}>${p[2]}</a>`).join('')}</nav>
    <div class="right"><span class="pill" data-status><span class="dot"></span><span data-status-text>Checking…</span></span><a class="btn primary sm" data-invite href="#">Add to Discord</a></div>
    <button class="menu-btn" aria-label="Menu" aria-controls="nav">☰</button></div></header>`;

  const footer = `<footer><div class="wrap"><span>© <span id="year"></span> <span data-name>Dark Raider</span>. Not affiliated with Discord.</span>
    <span><a href="docs.html">Docs</a> &nbsp;·&nbsp; <a href="#" id="out">Log out</a> &nbsp;·&nbsp; <a data-support href="#">Support server</a> &nbsp;·&nbsp; <a data-github href="#">GitHub</a></span></div></footer>`;

  document.body.insertAdjacentHTML('afterbegin', gate + header);
  document.body.insertAdjacentHTML('beforeend', footer + '<div id="toast" role="status" aria-live="polite"></div>');

  let t;
  window.toast = (text, kind = '') => {
    const el = document.getElementById('toast'); el.textContent = text; el.className = 'show ' + kind;
    clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 4200);
  };
})();
