/* ============================================================
   BRAGGAI — MAIN
   ask box · chips · answer panel · auth gating
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const form    = $("#ask-form");
  const input   = $("#ask-input");
  const answer  = $("#ask-answer");
  const aSource = $("#answer-source");
  const aBody   = $("#answer-body");
  const aActions= $("#answer-actions");
  const aClose  = $("#answer-close");

  if (!form || !input) return;

  /* ============================================================
     tiny knowledge base — replace with real API / vector search
     ============================================================ */
  const KB = [
    {
      match: ["register", "registration", "class", "enroll", "hold"],
      source: "FAMU Office of the Registrar",
      body: "Registration is handled by the Office of the Registrar. If you have a hold blocking enrollment, most holds are cleared by the office that placed them — Financial Aid, Student Accounts, or the Registrar directly.",
      actions: [
        { label: "Call Registrar",  href: "tel:+18505993000" },
        { label: "Email Registrar", href: "mailto:registrar@famu.edu" },
        { label: "Open iRattler",   href: "https://irattler.famu.edu" },
      ],
    },
    {
      match: ["financial aid", "fafsa", "disburse", "scholarship", "finaid"],
      source: "FAMU Office of Financial Aid",
      body: "Financial Aid handles FAFSA, verification, disbursement and scholarships. If your aid hasn't disbursed, check your iRattler account for outstanding requirements first — most delays are unresolved verification items.",
      actions: [
        { label: "Call Financial Aid",  href: "tel:+18505993730" },
        { label: "Email Financial Aid", href: "mailto:finaid@famu.edu" },
        { label: "Open iRattler",       href: "https://irattler.famu.edu" },
      ],
    },
    {
      match: ["housing", "dorm", "residence", "roommate", "dining"],
      source: "FAMU Housing & Residential Life",
      body: "Housing handles residence halls, applications, maintenance requests and dining resources. For maintenance, submit through the housing portal so it's tracked.",
      actions: [
        { label: "Call Housing",  href: "tel:+18505993651" },
        { label: "Email Housing", href: "mailto:housing@famu.edu" },
      ],
    },
    {
      match: ["wifi", "wi-fi", "email", "canvas", "irattler", "password", "login", "technology", "it "],
      source: "FAMU Information Technology Services",
      body: "ITS handles FAMU email, Canvas, iRattler, Wi-Fi and account issues. Password resets can be done through the ITS self-service portal.",
      actions: [
        { label: "Call ITS Help Desk", href: "tel:+18504124357" },
        { label: "Email ITS",          href: "mailto:its@famu.edu" },
      ],
    },
    {
      match: ["transcript", "enrollment verification", "proof", "records"],
      source: "FAMU Office of the Registrar",
      body: "Official transcripts and enrollment verification letters are issued by the Registrar. Most requests can be submitted online through iRattler.",
      actions: [
        { label: "Request Transcript", href: "https://irattler.famu.edu" },
        { label: "Email Registrar",    href: "mailto:registrar@famu.edu" },
      ],
    },
    {
      match: ["nobody responded", "no response", "emailed", "called", "ignored", "unresolved"],
      source: "FAMU Office of the Ombuds",
      body: "If you've contacted an office and haven't received a response, the Office of the Ombuds can help you escalate. Document every contact attempt — dates, names, and methods — before reaching out.",
      actions: [
        { label: "Contact Ombuds", href: "mailto:ombuds@famu.edu" },
        { label: "File a Request", href: "#" },
      ],
    },
    {
      match: ["counsel", "mental", "therapy", "stress", "anxiety"],
      source: "FAMU Counseling Services",
      body: "Counseling Services offers free, confidential support for enrolled students. Walk-ins are accepted during business hours.",
      actions: [
        { label: "Call Counseling",  href: "tel:+18505993145" },
        { label: "Email Counseling", href: "mailto:counseling@famu.edu" },
      ],
    },
    {
      match: ["emergency", "police", "safety", "unsafe", "crime"],
      source: "FAMU Police Department",
      body: "For emergencies call 911. For non-emergency campus safety matters, contact FAMU PD directly.",
      actions: [
        { label: "Emergency: 911",        href: "tel:911" },
        { label: "Non-emergency: FAMU PD", href: "tel:+18505993256" },
      ],
    },
  ];

  /* ============================================================
     answer renderer
     ============================================================ */
  const findAnswer = (q) => {
    const text = q.toLowerCase().trim();
    let best = null;
    let bestScore = 0;

    for (const entry of KB) {
      let score = 0;
      for (const k of entry.match) {
        if (text.includes(k)) score += k.length;
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }
    return best;
  };

  const fallback = (q) => ({
    source: "BraggAI",
    body: `I couldn't find an official FAMU source confirming a match for "${q}". Try one of the quick-access categories above, or contact the Office of the Ombuds if you're not sure who handles it.`,
    actions: [
      { label: "Contact Ombuds", href: "mailto:ombuds@famu.edu" },
    ],
  });

  const renderAnswer = (entry, q) => {
    aSource.textContent = "Source · " + entry.source;
    aBody.textContent   = entry.body;
    aActions.innerHTML  = "";

    entry.actions.forEach((a) => {
      const el = document.createElement("a");
      el.className = "btn";
      el.href = a.href;
      el.textContent = a.label + " →";
      if (a.href.startsWith("http")) { el.target = "_blank"; el.rel = "noopener"; }
      aActions.appendChild(el);
    });

    answer.hidden = false;
    answer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  /* ============================================================
     submit handler
     ============================================================ */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    const hit = findAnswer(q);
    renderAnswer(hit || fallback(q), q);
  });

  /* ============================================================
     chip handler
     ============================================================ */
  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.q;
      input.focus();
      form.requestSubmit();
    });
  });

  /* ============================================================
     close answer
     ============================================================ */
  if (aClose) {
    aClose.addEventListener("click", () => {
      answer.hidden = true;
      input.value = "";
      input.focus();
    });
  }

  /* ============================================================
     auth gating — require login before answering
     ============================================================ */
  const auth = window.BraggAI && window.BraggAI.auth;
  if (auth) {
    form.addEventListener("submit", (e) => {
      if (!auth.isLoggedIn()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        auth.open();
      }
    }, true);
  }
})();