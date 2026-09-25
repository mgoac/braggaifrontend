/* ============================================================
   BRAGGAI — STAFF DIRECTORY
   staff cards · search · ratings
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const grid = $("#staff-grid");
  const input = $("#staff-input");
  const searchBtn = $("#staff-search-btn");

  if (!grid) return;

  const STAFF = [
    {
      name: "Dr. Larry Robinson",
      dept: "College of Science & Technology",
      title: "Professor · Former President",
      email: "larry.robinson@famu.edu",
      phone: "(850) 599-3225",
      rating: 4.8,
    },
    {
      name: "Dr. Michael Abazinge",
      dept: "College of Science & Technology",
      title: "Professor",
      email: "michael.abazinge@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.5,
    },
    {
      name: "Dr. Richard Long",
      dept: "College of Science & Technology",
      title: "Center Director",
      email: "richard.long@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.6,
    },
    {
      name: "Dr. Viniece Jennings",
      dept: "College of Science & Technology",
      title: "Deputy Director",
      email: "viniece.jennings@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.7,
    },
    {
      name: "Dr. Steve Morey",
      dept: "College of Science & Technology",
      title: "Distinguished Professor",
      email: "steve.morey@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.4,
    },
    {
      name: "Dr. Hongmei Chi",
      dept: "College of Science & Technology",
      title: "Professor",
      email: "hongmei.chi@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.9,
    },
    {
      name: "Dr. Vanessa Pitts Bannister",
      dept: "College of Science & Technology",
      title: "Professor",
      email: "vanessa.pitts@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.5,
    },
    {
      name: "Dr. Michael Martínez-Colón",
      dept: "College of Science & Technology",
      title: "Professor",
      email: "michael.martinez@famu.edu",
      phone: "(850) 412-6405",
      rating: 4.6,
    },
    {
      name: "Arda Vanli",
      dept: "FAMU-FSU College of Engineering",
      title: "Professor",
      email: "oavanli@eng.famu.fsu.edu",
      phone: "(850) 410-6354",
      rating: 4.3,
    },
    {
      name: "Marcos Vasconcelos",
      dept: "FAMU-FSU College of Engineering",
      title: "Assistant Professor",
      email: "marcos@eng.famu.fsu.edu",
      phone: "(850) 410-6562",
      rating: 4.7,
    },
    {
      name: "Dr. Ali Abdelhafiz Mahmoud",
      dept: "FAMU-FSU College of Engineering",
      title: "Professor",
      email: "ali.abdelhafiz@eng.famu.fsu.edu",
      phone: "(850) 410-6405",
      rating: 4.5,
    },
    {
      name: "Dr. Jizhe Cai",
      dept: "FAMU-FSU College of Engineering",
      title: "Assistant Professor",
      email: "jcai@eng.famu.fsu.edu",
      phone: "(850) 645-1995",
      rating: 4.8,
    },
  ];

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? "½" : "";
    return "★".repeat(full) + half + "☆".repeat(5 - full - (half ? 1 : 0));
  };

  const renderStaff = (list) => {
    grid.innerHTML = "";
    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; opacity:0.6; font-family:var(--mono); font-size:0.8rem;">No staff found matching that search.</p>`;
      return;
    }

    list.forEach((person) => {
      const card = document.createElement("div");
      card.className = "staff-card";
      card.innerHTML = `
        <div class="staff-avatar">${person.name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/i, "").charAt(0)}</div>
        <h3 class="staff-name">${person.name}</h3>
        <p class="staff-dept">${person.dept}</p>
        <p class="staff-contact">${person.title} · ${person.email}</p>
        <p class="staff-contact" style="font-size:0.78rem; opacity:0.6;">${person.phone}</p>
        <div class="staff-rating">
          <span class="staff-stars">${renderStars(person.rating)}</span>
          <span class="staff-rating-num">${person.rating.toFixed(1)}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  const search = () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { renderStaff(STAFF); return; }
    const filtered = STAFF.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.dept.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
    renderStaff(filtered);
  };

  input.addEventListener("input", search);
  searchBtn.addEventListener("click", search);

  renderStaff(STAFF);
})();