// Lock screen: boot loader → passkey → unlock animation. Checks the passkey against passkeyHash in js/config.js.
// The Lock button (top bar / footer) re-locks the site and clears the control-panel login. If passkeyHash is empty, the site is open.
(() => {
  const $ = s => document.querySelector(s), H = window.RAIDER.passkeyHash || '', root = document.documentElement, g = $('#gate');
  const slow = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const msg = (t, k = '') => { const m = $('#gmsg'); m.textContent = t; m.className = k; };
  const open = () => root.classList.remove('locked');
  const lock = e => { e.preventDefault(); sessionStorage.removeItem('raider-auth'); sessionStorage.removeItem('raider-token'); location.reload(); };
  document.querySelectorAll('#lock,#out').forEach(b => b.addEventListener('click', lock));
  if (!H || sessionStorage.getItem('raider-auth') === H) return open(); // already unlocked in this tab

  // 1. boot loader
  const lines = ['Waking the bot…', 'Securing the channel…', 'Awaiting passkey'];
  let i = 0;
  (function boot() {
    $('#boot-text').textContent = lines[i];
    if (++i < lines.length) return setTimeout(boot, slow ? 800 : 150);
    setTimeout(() => { g.classList.add('ready'); $('#k').focus(); }, slow ? 700 : 150);
  })();

  // 2. passkey check
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  async function derive(pass, saltHex) {
    const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 200000 }, key, 256));
  }
  $('#gform').addEventListener('submit', async e => {
    e.preventDefault();
    if (!/^[0-9a-f]{32}:[0-9a-f]{64}$/.test(H)) return msg('The passkeyHash in js/config.js is not valid. Create it again with set-passkey.html and paste the whole line.', 'err');
    if (!window.crypto?.subtle) return msg('Open this site over https to unlock.', 'err');
    msg('Checking…');
    try {
      const [salt, hash] = H.split(':'), typed = $('#k').value;
      const ok = (await derive(typed, salt)) === hash || (typed !== typed.trim() && (await derive(typed.trim(), salt)) === hash);
      if (!ok) { g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake'); return msg('Wrong passkey. Check caps lock and try again.', 'err'); }
      // 3. unlock animation
      sessionStorage.setItem('raider-auth', H);
      window.dispatchEvent(new CustomEvent('raider-unlocked', { detail: { passkey: typed } }));
      $('#k').value = ''; msg(''); $('#g-label').textContent = 'Access granted'; g.classList.add('granted');
      setTimeout(() => g.classList.add('leaving'), slow ? 1100 : 100);
      setTimeout(() => { open(); g.className = ''; }, slow ? 1550 : 200);
    } catch (err) { msg('Could not check the passkey: ' + err.message, 'err'); }
  });
})();
