// Passkey gate. Checks the passkey against the hash in js/config.js (passkeyHash).
// Create the hash with set-passkey.html. If passkeyHash is empty, the site is open.
(() => {
  const $ = s => document.querySelector(s), H = window.RAIDER.passkeyHash || '';
  const msg = (t, k = '') => { const m = $('#gmsg'); m.textContent = t; m.className = k; };
  const open = () => document.documentElement.classList.remove('locked');
  $('#out')?.addEventListener('click', e => { e.preventDefault(); sessionStorage.removeItem('raider-auth'); location.reload(); });
  if (!H || sessionStorage.getItem('raider-auth') === H) return open(); // already unlocked in this tab

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
      if (ok) { sessionStorage.setItem('raider-auth', H); window.dispatchEvent(new CustomEvent('raider-unlocked', { detail: { passkey: typed } })); $('#k').value = ''; msg(''); open(); }
      else msg('Wrong passkey. Check caps lock and that it matches the one used in set-passkey.html.', 'err');
    } catch (err) { msg('Could not check the passkey: ' + err.message, 'err'); }
  });
})();
