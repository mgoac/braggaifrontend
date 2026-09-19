/* ============================================================
   BRAGGAI — landing interactions
   ticker seed · scroll reveal · counters · teletype · ask demo
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- helpers ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------- 1. ticker tape ---------------- */
  const TICKER_TERMS = [
    "ORANGE & GREEN",
    "THE SET",
    "WAGON DROPPED",
    "MARCHING 100",
    "OOPS",
    "GAME DAY",
    "THIRD AVENUE",
    "SUGAR FOOT",
    "GATHER AT THE GATE",
    "FAMU STILL KNOCKS",
    "RATTLER PRIDE",
    "HIGH OVER THE SET",
  ];

  const tickerTrack = $("#ticker-track");
  if (tickerTrack) {
    const segment = TICKER_TERMS.map(
      (t) => `<span class="ticker-block">${t} <i>&#10035;</i></span>`
    ).join("");
    tickerTrack.innerHTML = segment + segment;
    tickerTrack.style.animationDuration = "34s";
    if (reduced) tickerTrack.style.animation = "none";
  }

  /* ---------------- 2. scroll reveal ---------------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------- 3. stat counters ---------------- */
  const counters = $$(".count");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const dur = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && !reduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => animateCount(el));
  }

  /* ---------------- 4. hero teletype ---------------- */
  const SCRIPT = [
    {
      q: "Q: What time does the Orange Line last shuttle run on Friday?",
      a: "\u25c9 Last campus-loop pull-out is 9:40 PM from the Gibbs Hall stop on Friday. After that it\u2019s Safe Ride \u2014 850.599.3120.",
    },
    {
      q: "Q: Where can I print a 60-page paper tonight?",
      a: "\u25c9 Coleman Library is open until 2 AM during exam week. Third floor east wing, 8\u00a2/side with your Rattler Card. Avoid printer #4 \u2014 it eats duplexed trays.",
    },
    {
      q: "Q: Is the commons open during spring break?",
      a: "\u25c9 Reduced hours: 8 AM\u20132 PM weekdays only, chill-menu style. Snack Bar stays on the full schedule. Stamp: MEDIUM \u2014 re-check on Feb 28.",
    },
  ];

  const tty = $("#teletype");
  if (tty) {
    const cycle = async () => {
      for (const item of SCRIPT) {
        const qEl = document.createElement("div");
        qEl.className = "tty-line tty-q";
        qEl.textContent = item.q;
        tty.appendChild(qEl);

        const aEl = document.createElement("div");
        aEl.className = "tty-line tty-a";
        tty.appendChild(aEl);

        tty.scrollTop = tty.scrollHeight;

        for (let i = 0; i < item.a.length; i++) {
          aEl.textContent += item.a[i];
          tty.scrollTop = tty.scrollHeight;
          await sleep(rand(6, 26));
        }
        await sleep(1600);
      }
      await sleep(500);
      cycle();
    };

    if (reduced) {
      tty.innerHTML = `<div class="tty-line tty-q">${SCRIPT[0].q}</div><div class="tty-line tty-a">${SCRIPT[0].a}</div>`;
    } else {
      cycle();
    }
  }

  /* ---------------- 5. ask demo ---------------- */
  const REPLIES = [
    "Verified: the last Orange Line pull-out is 9:40 PM at Gibbs Hall, Fridays. Safe Ride picks up after \u2014 850.599.3120. Stamp: HIGH.",
    "Coleman Library, 3rd floor east wing, open till 2 AM Exam Week. 8\u00a2/side with Rattler Card. Skip printer #4. Stamp: HIGH.",
    "The Snack Bar \u2014 mini plate, $5.50, on Gamble St. Real meat, open till 9. Stamp: HIGH. It was verified this morning.",
    "Per the registrar's memo: final drop deadline is the Friday before spring break week. File online, then email your adviser to confirm. Stamp: MEDIUM.",
  ];
  let replyIdx = 0;

  const form = $("#ask-box");
  const input = $("#ask-input");
  const replyBox = $("#ask-reply");
  if (form && input && replyBox) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const qLine = document.createElement("span");
      qLine.className = "r-q";
      qLine.textContent = "\u25b8 you: " + text;
      updateReply(qLine);

      const typingEl = document.createElement("span");
      typingEl.textContent = "\u25cf thinking on the Set\u2026";
      typingEl.style.opacity = "0.6";
      updateReply(typingEl);

      const answer = REPLIES[replyIdx % REPLIES.length];
      replyIdx++;

      setTimeout(() => {
        typingEl.remove();
        const aLine = document.createElement("span");
        aLine.className = "r-a";
        aLine.textContent = "bragg \u25b8 " + answer;
        updateReply(aLine);
      }, 700);

      input.value = "";
    });

    function updateReply(el) {
      while (replyBox.children.length >= 5) replyBox.removeChild(replyBox.firstChild);
      replyBox.appendChild(el);
    }
  }

  /* ---------------- 6. footer year ---------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();