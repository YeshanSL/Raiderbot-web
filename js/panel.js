const API = window.RAIDER.apiBase, $ = s => document.querySelector(s);
const LABELS = { welcome: 'Welcome messages', boost: 'Boost thank-you', levelup: 'Chat level-ups', voice: 'Voice level-ups and summaries', dashboard: 'Dashboard' };
let token = sessionStorage.getItem('raider-panel'); // cleared when the tab closes

const say = (t, kind = '') => { const m = $('#msg'); m.textContent = t; m.className = kind; };
function logout(msg) { token = null; sessionStorage.removeItem('raider-panel'); $('#app').hidden = true; $('#login').hidden = false; say(msg || ''); }
async function api(path, body) {
  const r = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => { throw new Error('Can’t reach the bot. It may be offline.'); });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && token) { logout(d.error); throw new Error(d.error); }
  if (!r.ok) throw new Error(d.error || 'Request failed.');
  return d;
}
async function load() {
  const s = await api('/panel/settings');
  $('#login').hidden = true; $('#app').hidden = false; $('#gname').textContent = s.guildName;
  const rows = $('#rows'); rows.textContent = '';
  for (const t of s.types) {
    const wrap = document.createElement('div'); wrap.className = 'set';
    const lab = document.createElement('label'); lab.textContent = LABELS[t] || t; lab.htmlFor = 'sel-' + t;
    const sel = document.createElement('select'); sel.id = 'sel-' + t;
    sel.add(new Option('Not set', ''));
    s.channels.forEach(c => sel.add(new Option('#' + c.name, c.id)));
    sel.value = s.current[t] || '';
    const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Save';
    btn.onclick = async () => {
      if (!sel.value) return say('Pick a channel first.', 'err');
      try { await api('/panel/channel', { type: t, channelId: sel.value }); say(`${LABELS[t]} channel saved.`, 'ok'); } catch (e) { say(e.message, 'err'); }
    };
    wrap.append(lab, sel, btn); rows.append(wrap);
  }
}
$('#go').onclick = async () => {
  say('Logging in…');
  try {
    token = (await api('/panel/login', { username: $('#u').value, password: $('#p').value })).token;
    sessionStorage.setItem('raider-panel', token); $('#p').value = ''; say(''); await load();
  } catch (e) { token = null; say(e.message, 'err'); }
};
$('#p').addEventListener('keydown', e => e.key === 'Enter' && $('#go').click());
$('#out').onclick = () => logout('Logged out.');
$('#pw').onclick = async () => {
  try {
    token = (await api('/panel/password', { newPassword: $('#np').value })).token;
    sessionStorage.setItem('raider-panel', token); $('#np').value = ''; say('Password updated. Other sessions were signed out.', 'ok');
  } catch (e) { say(e.message, 'err'); }
};
if (token) load().catch(() => {});
document.querySelector('.menu-btn')?.addEventListener('click', () => document.querySelector('.nav nav').classList.toggle('open'));
document.querySelectorAll('[data-name]').forEach(e => e.textContent = window.RAIDER.name);
