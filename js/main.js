const C = window.RAIDER, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Branding / links
$$('[data-name]').forEach(e => e.textContent = C.name);
$$('[data-invite]').forEach(e => e.href = C.inviteUrl);
$$('[data-support]').forEach(e => e.href = C.supportUrl);
$$('[data-github]').forEach(e => e.href = C.githubUrl);
$('.menu-btn')?.addEventListener('click', () => $('#nav').classList.toggle('open'));
$('#year') && ($('#year').textContent = new Date().getFullYear());

// Copy buttons
function copy(btn, text) {
  navigator.clipboard?.writeText(text).then(() => { const o = btn.textContent; btn.textContent = 'Copied'; btn.classList.add('done'); setTimeout(() => { btn.textContent = o; btn.classList.remove('done'); }, 1400); });
}
$$('.doc pre').forEach(p => { const b = document.createElement('button'); b.className = 'copy'; b.type = 'button'; b.textContent = 'Copy'; b.onclick = () => copy(b, p.innerText.replace(/\s*Copy$/, '')); p.append(b); });

// Home: highlights
if ($('#features-grid')) $('#features-grid').innerHTML = FEATURES.filter(f => f.home).map(f =>
  `<div class="card${f.big ? ' big' : ''}"><span class="ic">${f.icon}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p>` +
  (f.big ? '<div class="split" aria-hidden="true"><div class="t1"><b>Team 1</b>4 players</div><div class="t2"><b>Team 2</b>4 players</div></div>' : '') + '</div>').join('');

// Commands page: groups, filter chips, search, click to copy
(() => {
  const box = $('#commands-list'); if (!box) return;
  let q = '', group = 'all';
  const chips = $('#cmd-groups');
  if (chips) {
    chips.innerHTML = ['All', ...COMMANDS.map(g => g.group)].map((g, i) => `<button type="button" class="chip" data-g="${i ? esc(g) : 'all'}" aria-pressed="${!i}">${esc(g)}</button>`).join('');
    chips.onclick = e => { const b = e.target.closest('.chip'); if (!b) return; group = b.dataset.g; $$('#cmd-groups .chip').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); };
  }
  const styled = c => { const i = c.search(/[<\[]/); return i < 0 ? `<b>${esc(c)}</b>` : `<b>${esc(c.slice(0, i).trim())}</b> <em>${esc(c.slice(i))}</em>`; };
  function render() {
    box.innerHTML = COMMANDS.filter(g => group === 'all' || g.group === group).map(g => {
      const items = g.items.filter(i => (i.cmd + i.desc + g.group).toLowerCase().includes(q));
      return items.length ? `<div class="cgroup"><h3>${esc(g.group)}${g.admin ? '<span class="tag">Admin only</span>' : ''}</h3><div class="cgrid">` +
        items.map(i => `<div class="crow"><div class="top"><code class="cmd">${styled(i.cmd)}</code><button class="copy" type="button" data-copy="${esc(i.cmd.split(/[<\[]/)[0].trim())}">Copy</button></div><p>${esc(i.desc)}</p></div>`).join('') + '</div></div>' : '';
    }).join('') || '<p class="lead">No commands match.</p>';
  }
  box.onclick = e => { const b = e.target.closest('[data-copy]'); if (b) copy(b, b.dataset.copy); };
  $('#cmd-search')?.addEventListener('input', e => { q = e.target.value.toLowerCase(); render(); });
  render();
})();

// Owner & admins: the manual list in data.js wins; otherwise use what the bot found
function renderStaff(home) {
  const grid = $('#staff-grid'); if (!grid) return;
  const list = (window.TEAM && TEAM.length) ? TEAM : home ? [home.owner, ...home.admins] : [];
  grid.innerHTML = list.length ? list.map(p => {
    const av = p.avatar ? `<img class="av" src="${esc(p.avatar)}" alt="" loading="lazy">` : `<div class="av">${esc((p.name || '?')[0].toUpperCase())}</div>`;
    const name = p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name);
    const alt = /owner/i.test(p.role) ? '' : ' alt';
    return `<div class="person">${av}<div><b>${name}</b><span class="tag${alt}">${esc(p.role || 'Admin')}</span>${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</div></div>`;
  }).join('') : '<p class="empty-note">No staff to show yet. Add people in js/data.js, or set STATUS_GUILD_ID on the bot.</p>';
}

// Bot status
const fmtUp = s => { const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`; };
const stat = (k, v) => $$(`[data-stat="${k}"]`).forEach(e => e.textContent = v);
function count(k, to) {
  $$(`[data-stat="${k}"]`).forEach(el => {
    const from = el._v ?? 0; el._v = to;
    if (reduce || from === to) return el.textContent = to.toLocaleString();
    const t0 = performance.now();
    (function step(t) { const p = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e).toLocaleString(); if (p < 1) requestAnimationFrame(step); })(t0);
  });
}
function showStatus(d) {
  const state = d == null ? 'unknown' : d.online ? 'online' : 'offline', on = state === 'online';
  const label = { online: 'Online', offline: 'Offline', unknown: 'Status unavailable' }[state];
  $$('[data-status]').forEach(p => p.className = 'pill ' + (state === 'unknown' ? '' : state));
  $$('.hud').forEach(h => h.dataset.state = state);
  $$('[data-status-text]').forEach(e => e.textContent = label);
  $$('b[data-stat="status"]').forEach(e => { e.textContent = label; e.className = state; });
  const num = (k, v) => on && v != null ? count(k, v) : (stat(k, '–'), $$(`[data-stat="${k}"]`).forEach(e => e._v = 0));
  num('servers', d?.servers); num('members', d?.users); num('online', d?.onlineMembers);
  stat('ping', on && d.ping != null ? d.ping + ' ms' : '–');
  stat('uptime', on && d.uptime != null ? fmtUp(d.uptime) : '–');
  const pct = on && d.users ? Math.round((d.onlineMembers || 0) / d.users * 100) : null;
  stat('pct', pct == null ? '–' : pct);
  $$('[data-bar]').forEach(b => b.style.width = (pct || 0) + '%');
  stat('checked', 'Updated ' + new Date().toLocaleTimeString() + (C.status.mode === 'demo' ? ' · demo data' : ''));
  renderStaff(on ? d.home : null);
  window.dispatchEvent(new CustomEvent('raider-status', { detail: d }));
}
async function checkStatus() {
  const s = C.status;
  try {
    if (s.mode === 'demo') return showStatus({ online: true, ping: 42, servers: 128, users: 24310, onlineMembers: 6120, uptime: 86400 * 6 + 3600 * 5,
      home: { owner: { name: 'Owner Name', role: 'Owner' }, admins: [{ name: 'Admin One', role: 'Admin' }, { name: 'Admin Two', role: 'Admin' }] } });
    if (s.mode === 'api') { const r = await fetch(s.apiUrl, { cache: 'no-store' }); if (!r.ok) throw 0; return showStatus(await r.json()); }
    if (s.mode === 'widget') {
      const r = await fetch(`https://discord.com/api/guilds/${s.widgetGuildId}/widget.json`); if (!r.ok) throw 0;
      const w = await r.json();
      return showStatus({ online: (w.members || []).some(m => m.username.toLowerCase() === C.name.toLowerCase() || m.username.toLowerCase().includes('raider')) });
    }
    showStatus(null);
  } catch { showStatus(s.mode === 'api' ? { online: false } : null); } // API unreachable = bot offline
}
if ($('[data-status]')) { checkStatus(); setInterval(checkStatus, (C.status.refreshSeconds || 30) * 1000); }

// Docs scroll-spy
const links = $$('.side a');
if (links.length) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-20% 0px -70% 0px' });
  $$('.doc section[id]').forEach(s => io.observe(s));
}
