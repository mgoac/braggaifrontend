/* ============================================================
   BRAGGAI — AUTH
   login · signup · session · account panel
   front-end only (localStorage). swap the API stubs for your backend.
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const STORE_KEY = "braggai.session";
  const USERS_KEY = "braggai.users";

  /* ---------------- storage ---------------- */
  const saveSession = (user) => localStorage.setItem(STORE_KEY, JSON.stringify(user));
  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)); }
    catch { return null; }
  };
  const clearSession = () => localStorage.removeItem(STORE_KEY);

  const readUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  };
  const writeUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

  /* ============================================================
     API LAYER — replace these stubs with real backend calls
     ============================================================ */
  const API = {
    async login(email, password) {
      // POST /api/auth/login  { email, password }
      const users = readUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) throw new Error("Email or password is incorrect.");
      return { id: found.id, name: found.name, email: found.email };
    },

    async signup(name, email, password) {
      // POST /api/auth/signup  { name, email, password }
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("That email is already registered.");
      }
      const user = { id: crypto.randomUUID(), name, email, password };
      users.push(user);
      writeUsers(users);
      return { id: user.id, name: user.name, email: user.email };
    },

    async logout() {
      // POST /api/auth/logout
      return true;
    },
  };

  /* ---------------- elements ---------------- */
  const overlay    = $("#auth-overlay");
  const openBtn    = $("#auth-open");
  const closeBtn   = $("#auth-close");
  const tabs       = $$(".auth-tab");
  const panels     = $$(".auth-panel");
  const loginForm  = $("#auth-login");
  const signupForm = $("#auth-signup");
  const logoutBtn  = $("#auth-logout");

  if (!overlay || !openBtn) return;

  /* ---------------- helpers ---------------- */
  const showPanel = (name) => {
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === name));
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
  };

  const setError = (el, msg) => {
    if (!el) return;
    if (!msg) { el.hidden = true; el.textContent = ""; return; }
    el.hidden = false;
    el.textContent = msg;
  };

  const openAuth = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-locked");
    showPanel(readSession() ? "account" : "login");
  };

  const closeAuth = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-locked");
  };

  const paintSession = () => {
    const user = readSession();
    if (user) {
      openBtn.textContent = user.name.split(" ")[0];
      openBtn.classList.add("is-user");
      $("#account-name").textContent  = user.name;
      $("#account-email").textContent = user.email;
    } else {
      openBtn.textContent = "LOG IN";
      openBtn.classList.remove("is-user");
    }
  };

  /* ---------------- events ---------------- */
  openBtn.addEventListener("click", openAuth);
  closeBtn.addEventListener("click", closeAuth);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeAuth(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeAuth();
  });

  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      showPanel(t.dataset.tab);
      setError($("#login-error"), "");
      setError($("#signup-error"), "");
    })
  );

  $$(".auth-link").forEach((btn) =>
    btn.addEventListener("click", () => {
      showPanel(btn.dataset.goto);
      setError($("#login-error"), "");
      setError($("#signup-error"), "");
    })
  );

  /* ---------------- login ---------------- */
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = $("#login-email").value.trim();
    const password = $("#login-password").value;
    const errEl    = $("#login-error");
    const submit   = loginForm.querySelector(".auth-submit");

    setError(errEl, "");
    if (!email || !password) { setError(errEl, "Fill in both fields."); return; }

    submit.disabled = true;
    const orig = submit.textContent;
    submit.textContent = "Checking…";
    try {
      const user = await API.login(email, password);
      saveSession(user);
      paintSession();
      showPanel("account");
      loginForm.reset();
    } catch (err) {
      setError(errEl, err.message);
    } finally {
      submit.disabled = false;
      submit.textContent = orig;
    }
  });

  /* ---------------- signup ---------------- */
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name     = $("#signup-name").value.trim();
    const email    = $("#signup-email").value.trim();
    const password = $("#signup-password").value;
    const errEl    = $("#signup-error");
    const submit   = signupForm.querySelector(".auth-submit");

    setError(errEl, "");
    if (!name || !email || !password) { setError(errEl, "Fill in every field."); return; }
    if (password.length < 8) { setError(errEl, "Password must be at least 8 characters."); return; }

    submit.disabled = true;
    const orig = submit.textContent;
    submit.textContent = "Creating…";
    try {
      const user = await API.signup(name, email, password);
      saveSession(user);
      paintSession();
      showPanel("account");
      signupForm.reset();
    } catch (err) {
      setError(errEl, err.message);
    } finally {
      submit.disabled = false;
      submit.textContent = orig;
    }
  });

  /* ---------------- logout ---------------- */
  logoutBtn.addEventListener("click", async () => {
    await API.logout();
    clearSession();
    paintSession();
    showPanel("login");
  });

  /* ---------------- boot ---------------- */
  paintSession();

  /* expose for main.js and other modules */
  window.BraggAI = window.BraggAI || {};
  window.BraggAI.auth = {
    isLoggedIn: () => !!readSession(),
    getUser:    () => readSession(),
    open:       openAuth,
    close:      closeAuth,
  };
})();