const C = window.RAIDER, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Fill branding / links
$$('[data-name]').forEach(e => e.textContent = C.name);
$$('[data-invite]').forEach(e => e.href = C.inviteUrl);
$$('[data-support]').forEach(e => e.href = C.supportUrl);
$$('[data-github]').forEach(e => e.href = C.githubUrl);
$('.menu-btn')?.addEventListener('click', () => $('.nav nav').classList.toggle('open'));
$('#year') && ($('#year').textContent = new Date().getFullYear());

// Features
$('#features-grid') && ($('#features-grid').innerHTML = FEATURES.map(f =>
  `<div class="card"><span class="ic">${f.icon}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join(''));

// Commands (with search)
function renderCommands(q = '') {
  const box = $('#commands-list'); if (!box) return;
  q = q.toLowerCase();
  box.innerHTML = COMMANDS.map(g => {
    const items = g.items.filter(i => (i.cmd + i.desc + g.group).toLowerCase().includes(q));
    return items.length ? `<div class="cgroup"><h3>${esc(g.group)}${g.admin ? '<span class="tag">Admin only</span>' : ''}</h3>` +
      items.map(i => `<div class="crow"><code class="cmd">${esc(i.cmd)}</code><span>${esc(i.desc)}</span></div>`).join('') + '</div>' : '';
  }).join('') || '<p class="lead">No commands match.</p>';
}
renderCommands();
$('#cmd-search')?.addEventListener('input', e => renderCommands(e.target.value));

// Owner & admins: the manual list in data.js wins; otherwise use what the bot found
function renderStaff(home) {
  const list = (window.TEAM && TEAM.length) ? TEAM : home ? [home.owner, ...home.admins] : [];
  const sec = $('#staff'); if (!sec) return;
  sec.hidden = !list.length;
  $('#staff-grid').innerHTML = list.map(p => {
    const av = p.avatar ? `<img class="av" src="${esc(p.avatar)}" alt="" loading="lazy">` : `<div class="av">${esc((p.name || '?')[0].toUpperCase())}</div>`;
    const name = p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name);
    const alt = /owner/i.test(p.role) ? '' : ' alt';
    return `<div class="card person">${av}<div><b>${name}</b><span class="tag${alt}">${esc(p.role || 'Admin')}</span>${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</div></div>`;
  }).join('');
}

// Bot status
const fmtUp = s => { const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`; };
const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
function showStatus(d) {
  const state = d == null ? 'unknown' : d.online ? 'online' : 'offline';
  $$('.pill[data-status]').forEach(p => { p.className = 'pill ' + (state === 'unknown' ? '' : state); });
  const label = { online: 'Online', offline: 'Offline', unknown: 'Status unavailable' }[state];
  $$('[data-status-text]').forEach(e => e.textContent = label);
  const on = d && d.online;
  set('s-members', on && d.users != null ? d.users.toLocaleString() : '–');
  set('s-online', on && d.onlineMembers != null ? d.onlineMembers.toLocaleString() : '–');
  renderStaff(on ? d.home : null);
  set('s-ping', on && d.ping != null ? d.ping + ' ms' : '–');
  set('s-servers', on && d.servers != null ? d.servers.toLocaleString() : '–');
  set('s-users', on && d.users != null ? d.users.toLocaleString() : '–');
  set('s-uptime', on && d.uptime != null ? fmtUp(d.uptime) : '–');
  set('s-checked', 'Last checked ' + new Date().toLocaleTimeString() + (C.status.mode === 'demo' ? ' · demo data' : ''));
}
async function checkStatus() {
  const s = C.status;
  try {
    if (s.mode === 'demo') return showStatus({ online: true, ping: 42, servers: 128, users: 24310, onlineMembers: 6120, uptime: 86400 * 6 + 3600 * 5,
      home: { owner: { name: 'Owner Name', role: 'Owner' }, admins: [{ name: 'Admin One', role: 'Admin' }, { name: 'Admin Two', role: 'Admin' }] } });
    if (s.mode === 'api') {
      const r = await fetch(s.apiUrl, { cache: 'no-store' }); if (!r.ok) throw 0;
      return showStatus(await r.json());
    }
    if (s.mode === 'widget') {
      const r = await fetch(`https://discord.com/api/guilds/${s.widgetGuildId}/widget.json`); if (!r.ok) throw 0;
      const w = await r.json();
      return showStatus({ online: (w.members || []).some(m => m.username.toLowerCase() === C.name.toLowerCase() || m.username.toLowerCase().includes('raider')) });
    }
    showStatus(null);
  } catch { showStatus(s.mode === 'api' ? { online: false } : null); } // API unreachable = bot offline
}
checkStatus(); setInterval(checkStatus, (C.status.refreshSeconds || 30) * 1000);

// Docs scroll-spy
const links = $$('.side a');
if (links.length) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-20% 0px -70% 0px' });
  $$('.doc section[id]').forEach(s => io.observe(s));
}
