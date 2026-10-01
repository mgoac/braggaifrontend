// js/auth.js — BRAGGAI auth client
const API_BASE = window.BRAGGAI_API_BASE || 'http://localhost:4000';

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const API = {
  login:  (email, password) => api('/api/auth/login',  { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name, email, password) => api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
  me:     () => api('/api/auth/me').catch(() => null),
};

function injectStyles() {
  if (document.getElementById('braggai-auth-style')) return;
  const s = document.createElement('style');
  s.id = 'braggai-auth-style';
  s.textContent = `
    .ba-auth-btn { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
      padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.18);
      background: transparent; color: inherit; cursor: pointer; transition: .2s ease; }
    .ba-auth-btn:hover { background: rgba(255,255,255,.06); }
    .ba-auth-btn.ba-primary { background: #FF6B00; border-color: #FF6B00; color: #fff; }
    .ba-auth-btn.ba-primary:hover { background: #e85f00; }

    .ba-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); backdrop-filter: blur(6px);
      display: none; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
    .ba-overlay.ba-open { display: flex; }

    .ba-modal { background: #111; border: 1px solid rgba(255,255,255,.1); border-radius: 16px;
      width: 100%; max-width: 420px; padding: 32px; color: #f5f5f5;
      font-family: 'Space Grotesk', system-ui, sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
    .ba-modal h2 { margin: 0 0 6px; font-family: 'Instrument Serif', serif; font-size: 28px; font-weight: 400; }
    .ba-modal p.ba-sub { margin: 0 0 24px; color: rgba(255,255,255,.55); font-size: 14px; }
    .ba-modal form { display: flex; flex-direction: column; gap: 12px; }
    .ba-modal label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(255,255,255,.5); margin-bottom: 4px; display: block; font-family: 'JetBrains Mono', monospace; }
    .ba-modal input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.03); color: #f5f5f5; font-size: 14px; font-family: inherit; outline: none; }
    .ba-modal input:focus { border-color: #FF6B00; }
    .ba-modal .ba-submit { margin-top: 8px; padding: 13px; border-radius: 10px; border: none;
      background: #FF6B00; color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; }
    .ba-modal .ba-submit:disabled { opacity: .6; cursor: not-allowed; }
    .ba-modal .ba-err { color: #ff6b6b; font-size: 13px; margin-top: 4px; min-height: 18px; }
    .ba-modal .ba-switch { margin-top: 20px; text-align: center; font-size: 13px; color: rgba(255,255,255,.55); }
    .ba-modal .ba-switch button { background: none; border: none; color: #FF6B00; cursor: pointer;
      font-size: 13px; font-family: inherit; text-decoration: underline; padding: 0; }
    .ba-modal .ba-close { position: absolute; top: 16px; right: 20px; background: none; border: none;
      color: rgba(255,255,255,.5); font-size: 24px; cursor: pointer; }
    .ba-modal-inner { position: relative; }
    .ba-user { display: flex; align-items: center; gap: 12px; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
  `;
  document.head.appendChild(s);
}

function buildModal() {
  const overlay = document.createElement('div');
  overlay.className = 'ba-overlay';
  overlay.id = 'ba-overlay';
  overlay.innerHTML = `
    <div class="ba-modal">
      <div class="ba-modal-inner">
        <button class="ba-close" id="ba-close" aria-label="Close">×</button>
        <h2 id="ba-title">Sign in</h2>
        <p class="ba-sub" id="ba-sub">Use your FAMU email to continue.</p>
        <form id="ba-form">
          <div id="ba-name-field" style="display:none">
            <label for="ba-name">Full name</label>
            <input id="ba-name" type="text" autocomplete="name" />
          </div>
          <div>
            <label for="ba-email">Email</label>
            <input id="ba-email" type="email" autocomplete="email" required />
          </div>
          <div>
            <label for="ba-password">Password</label>
            <input id="ba-password" type="password" autocomplete="current-password" required minlength="8" />
          </div>
          <div class="ba-err" id="ba-err"></div>
          <button class="ba-submit" id="ba-submit" type="submit">Sign in</button>
        </form>
        <p class="ba-switch" id="ba-switch">
          No account? <button type="button" id="ba-toggle">Create one</button>
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function buildNavControls() {
  const nav = document.querySelector('.nav-actions');
  if (!nav || document.getElementById('ba-nav-slot')) return;
  const slot = document.createElement('div');
  slot.id = 'ba-nav-slot';
  slot.style.display = 'flex';
  slot.style.alignItems = 'center';
  slot.style.gap = '10px';
  nav.insertBefore(slot, nav.firstChild);
  return slot;
}

function renderNav(slot, user) {
  if (!slot) return;
  if (user) {
    slot.innerHTML = `
      <div class="ba-user">${escapeHtml(user.name)}</div>
      <button class="ba-auth-btn" id="ba-logout">Log out</button>
    `;
    document.getElementById('ba-logout').onclick = async () => {
      await API.logout();
      renderNav(slot, null);
    };
  } else {
    slot.innerHTML = `<button class="ba-auth-btn" id="ba-login">Sign in</button>`;
    document.getElementById('ba-login').onclick = () => openModal('login');
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

let mode = 'login';
const overlay = buildModal();
const title = overlay.querySelector('#ba-title');
const sub = overlay.querySelector('#ba-sub');
const form = overlay.querySelector('#ba-form');
const nameField = overlay.querySelector('#ba-name-field');
const nameInput = overlay.querySelector('#ba-name');
const emailInput = overlay.querySelector('#ba-email');
const passwordInput = overlay.querySelector('#ba-password');
const err = overlay.querySelector('#ba-err');
const submit = overlay.querySelector('#ba-submit');
const switcher = overlay.querySelector('#ba-switch');

function setMode(next) {
  mode = next;
  err.textContent = '';
  if (mode === 'login') {
    title.textContent = 'Sign in';
    sub.textContent = 'Use your FAMU email to continue.';
    nameField.style.display = 'none';
    submit.textContent = 'Sign in';
    switcher.innerHTML = `No account? <button type="button" id="ba-toggle">Create one</button>`;
  } else {
    title.textContent = 'Create account';
    sub.textContent = 'Pick a name, email, and password.';
    nameField.style.display = 'block';
    submit.textContent = 'Create account';
    switcher.innerHTML = `Already have an account? <button type="button" id="ba-toggle">Sign in</button>`;
  }
  document.getElementById('ba-toggle').onclick = () => setMode(mode === 'login' ? 'signup' : 'login');
}

export function openModal(startMode = 'login') {
  setMode(startMode);
  overlay.classList.add('ba-open');
  setTimeout(() => (mode === 'signup' ? nameInput : emailInput).focus(), 50);
}
function closeModal() { overlay.classList.remove('ba-open'); }

overlay.querySelector('#ba-close').onclick = closeModal;
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.textContent = '';
  submit.disabled = true;
  try {
    if (mode === 'login') {
      await API.login(emailInput.value.trim(), passwordInput.value);
    } else {
      await API.signup(nameInput.value.trim(), emailInput.value.trim(), passwordInput.value);
    }
    const me = await API.me();
    renderNav(document.getElementById('ba-nav-slot'), me?.user || null);
    closeModal();
    form.reset();
  } catch (e) {
    err.textContent = e.message || 'Something went wrong.';
  } finally {
    submit.disabled = false;
  }
});

injectStyles();
const slot = buildNavControls();
(async () => {
  const me = await API.me();
  renderNav(slot, me?.user || null);
})();
