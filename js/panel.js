// Control panel: talks to the bot's /panel API (see src/web-panel.js in the bot).
(() => {
  const $ = s => document.querySelector(s);
  if (!$('#p-app')) return;
  const API = window.RAIDER.apiBase;
  const LABELS = {
    welcome: ['Welcome messages', 'Greets new members'], boost: ['Boost thank-you', 'Thanks server boosters'],
    levelup: ['Chat level-ups', 'Level-up announcements'], voice: ['Voice level-ups', 'Voice summaries and level-ups'], dashboard: ['Dashboard', 'Stats dashboard messages'],
  };
  let token = sessionStorage.getItem('raider-token'), gid = '', data = null;

  const msg = (t, k = '') => window.toast(t, k);
  const h = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) k === 'onclick' ? e.onclick = v : e.setAttribute(k, v); e.append(...kids); return e; };
  const fill = (sel, items, value, empty) => { sel.textContent = ''; if (empty) sel.add(new Option(empty, '')); items.forEach(i => sel.add(new Option(i.name, i.id))); if (value !== undefined && value !== null) sel.value = value; };

  // Confirm dialog
  const dlg = h('dialog', { class: 'confirm' });
  dlg.innerHTML = '<form method="dialog"><h3 id="cf-t"></h3><p id="cf-p"></p><div class="btns" style="margin-top:22px"><button class="btn" value="no">Cancel</button><button class="btn primary" value="yes">Continue</button></div></form>';
  document.body.append(dlg);
  const ask = (title, text) => new Promise(res => { dlg.querySelector('#cf-t').textContent = title; dlg.querySelector('#cf-p').textContent = text; dlg.returnValue = ''; dlg.onclose = () => res(dlg.returnValue === 'yes'); dlg.showModal(); });

  function showLogin() { $('#p-app').hidden = true; $('#snapshot').hidden = true; $('#p-login').hidden = false; }
  async function api(path, body) {
    const r = await fetch(API + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => { throw new Error('Can’t reach the bot. It may be offline or asleep.'); });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401 && token) { token = null; sessionStorage.removeItem('raider-token'); showLogin(); }
    if (!r.ok) throw new Error(d.error || 'Request failed (' + r.status + ').');
    return d;
  }
  // Run a change, show the bot's answer, then refresh the page data.
  async function act(path, body, confirm) {
    if (confirm && !(await ask(...confirm))) return;
    msg('Working…');
    try { const r = await api(path, { guildId: gid, ...body }); msg(r.message || 'Saved.', r.ok === false ? 'err' : 'ok'); await load(); }
    catch (e) { msg(e.message, 'err'); }
  }

  async function login(pass) {
    token = (await api('/panel/login', { passkey: pass })).token;
    sessionStorage.setItem('raider-token', token); await init();
  }
  async function init() {
    const { guilds } = await api('/panel/guilds');
    $('#p-login').hidden = true; $('#p-app').hidden = false; $('#snapshot').hidden = false;
    fill($('#p-guild'), guilds); gid = $('#p-guild').value;
    if (!gid) return msg('The bot is not in any server you can control.', 'err');
    await load();
  }
  const setState = (id, on) => { const e = $(id); e.textContent = on ? 'ON' : 'OFF'; e.className = 'state' + (on ? ' on' : ''); };
  async function load() {
    const d = data = await api('/panel/data?guild=' + encodeURIComponent(gid));
    // Channels
    const rows = $('#p-rows'); rows.textContent = '';
    for (const t of Object.keys(LABELS)) {
      const sel = h('select', { id: 'sel-' + t, 'aria-label': LABELS[t][0] });
      fill(sel, d.textChannels.map(c => ({ id: c.id, name: '#' + c.name })), d.channels[t], 'Not set');
      rows.append(h('div', { class: 'set' }, h('label', { for: 'sel-' + t }, LABELS[t][0], h('small', {}, LABELS[t][1])), sel,
        h('button', { class: 'btn sm', type: 'button', onclick: () => sel.value ? act('/panel/channel', { type: t, channelId: sel.value }) : msg('Pick a channel first.', 'err') }, 'Save')));
    }
    // Team
    fill($('#t-vc'), d.voiceChannels, d.team.channelId, 'Choose a voice channel…');
    setState('#t-state', d.team.active); setState('#t-pstate', d.team.panelOn);
    $('#t-on').setAttribute('aria-pressed', d.team.active); $('#t-off').setAttribute('aria-pressed', !d.team.active);
    $('#t-pon').setAttribute('aria-pressed', d.team.panelOn); $('#t-poff').setAttribute('aria-pressed', !d.team.panelOn);
    for (const n of [1, 2]) {
      const box = $('#t-' + n), list = d.team['team' + n]; box.textContent = '';
      $('#t-c' + n).textContent = list.length;
      list.length ? list.forEach(p => box.append(h('span', { class: 'chip' }, p.name))) : box.append(h('span', { class: 'empty' }, 'Empty'));
    }
    // Soundboard
    fill($('#s-ch'), d.voiceChannels);
    const list = $('#s-list'); list.textContent = '';
    if (!d.blocks.length) list.append(h('p', { class: 'empty-note' }, 'Nobody is restricted.'));
    d.blocks.forEach(b => list.append(h('div', { class: 'res' }, h('span', {}, `${b.name} · ${b.allVoice ? 'all voice channels' : b.channels.join(', ') || 'some channels'}`),
      h('button', { class: 'btn sm', type: 'button', onclick: () => act('/panel/soundboard', { action: 'unblock', userId: b.id }) }, 'Unblock'))));
    // Server snapshot
    const g = $('#p-guild').selectedOptions[0]?.textContent || '–', set = Object.values(d.channels).filter(Boolean).length;
    const row = (k, v, on) => h('div', {}, h('span', {}, k), h('b', on ? { class: 'on' } : {}, v));
    const snap = $('#snap'); snap.textContent = '';
    snap.append(row('Server', g), row('Team mode', d.team.active ? 'ON' : 'OFF', d.team.active), row('Self-select panel', d.team.panelOn ? 'ON' : 'OFF', d.team.panelOn),
      row('Team 1 · Team 2', `${d.team.team1.length} · ${d.team.team2.length}`), row('Channels set', `${set} of ${Object.keys(LABELS).length}`), row('Soundboard restricted', String(d.blocks.length)));
  }

  // Member search box → results with action buttons
  function bindSearch(input, box, buttons) {
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        box.textContent = '';
        if (!input.value.trim()) return;
        try {
          const { members } = await api(`/panel/members?guild=${encodeURIComponent(gid)}&q=${encodeURIComponent(input.value.trim())}`);
          if (!members.length) box.append(h('p', { class: 'empty-note', style: 'margin-top:10px' }, 'No members found.'));
          members.forEach(m => box.append(h('div', { class: 'res' }, h('img', { src: m.avatar, alt: '' }), h('span', {}, m.name),
            ...buttons.map(b => h('button', { class: 'btn sm', type: 'button', onclick: () => b.run(m) }, b.label)))));
        } catch (e) { msg(e.message, 'err'); }
      }, 300);
    });
  }
  bindSearch($('#t-q'), $('#t-res'), [1, 2].map(n => ({ label: 'Team ' + n, run: m => act('/panel/team', { action: 'assign', userId: m.id, team: String(n) }) })));
  bindSearch($('#s-q'), $('#s-res'), ['block', 'unblock'].map(a => ({ label: a === 'block' ? 'Block' : 'Unblock',
    run: m => act('/panel/soundboard', { action: a, userId: m.id, channelIds: [...$('#s-ch').selectedOptions].map(o => o.value) }) })));

  $('#t-set').onclick = () => $('#t-vc').value ? act('/panel/team', { action: 'setup', channelId: $('#t-vc').value }) : msg('Pick a voice channel first.', 'err');
  $('#t-on').onclick = () => data?.team.active ? msg('Team mode is already on.') : act('/panel/team', { action: 'on' }, ['Turn team mode on?', 'This creates two team voice channels and moves players into them.']);
  $('#t-off').onclick = () => !data?.team.active ? msg('Team mode is already off.') : act('/panel/team', { action: 'off' });
  $('#t-pon').onclick = () => data?.team.panelOn ? msg('The panel is already on.') : act('/panel/team', { action: 'panel-on' }, ['Post the team panel?', 'This clears current team assignments and creates the team voice channels.']);
  $('#t-poff').onclick = () => !data?.team.panelOn ? msg('The panel is already off.') : act('/panel/team', { action: 'panel-off' });
  $('#p-guild').onchange = e => { gid = e.target.value; load().catch(err => msg(err.message, 'err')); };
  $('#p-refresh').onclick = () => load().then(() => msg('Refreshed.', 'ok')).catch(e => msg(e.message, 'err'));
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.seg button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    ['channels', 'team', 'sound'].forEach(t => $('#tab-' + t).hidden = t !== b.dataset.tab);
  });
  $('#p-go').onclick = () => login($('#p-key').value).then(() => { $('#p-key').value = ''; }).catch(e => msg(e.message, 'err'));
  $('#p-key').addEventListener('keydown', e => e.key === 'Enter' && $('#p-go').click());

  // One passkey entry on the lock screen also connects the panel.
  window.addEventListener('raider-unlocked', e => login(e.detail.passkey).catch(err => { msg(err.message, 'err'); showLogin(); }));
  token ? init().catch(() => showLogin()) : showLogin();
})();
