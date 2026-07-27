/* Sarthak Kulkarni — Portfolio interactions (GitHub Pages ready) */

(function () {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const themeToggle = document.getElementById("themeToggle");
  const yearEl = document.getElementById("year");
  const backTop = document.getElementById("backTop");
  const roleRotator = document.getElementById("roleRotator");
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const pageLoader = document.getElementById("pageLoader");
  const heroPhoto = document.getElementById("heroPhoto");
  const projectPanel = document.getElementById("projectPanel");
  const toast = document.getElementById("toast");
  const sideDots = document.getElementById("sideDots");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  /* ---------- Page loader ---------- */
  window.addEventListener("load", () => {
    window.setTimeout(() => pageLoader?.classList.add("is-done"), reduceMotion ? 0 : 450);
  });

  /* ---------- Theme ---------- */
  function applyTheme(mode) {
    doc.classList.toggle("dark", mode === "dark");
    try {
      localStorage.setItem("theme", mode);
    } catch (_) {
      /* private browsing / blocked storage */
    }
  }

  (function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem("theme");
    } catch (_) {
      saved = null;
    }
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      return;
    }
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  })();

  themeToggle?.addEventListener("click", () => {
    applyTheme(doc.classList.contains("dark") ? "light" : "dark");
  });

  /* ---------- Year ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Split name characters ---------- */
  if (!reduceMotion) {
    document.querySelectorAll("[data-split]").forEach((line) => {
      const text = line.textContent || "";
      line.textContent = "";
      [...text].forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.animationDelay = 0.55 + i * 0.035 + "s";
        line.appendChild(span);
      });
    });
  }

  /* ---------- Mobile nav ---------- */
  function setNavOpen(open) {
    primaryNav?.classList.toggle("open", open);
    navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.style.overflow = open ? "hidden" : "";
  }

  navToggle?.addEventListener("click", () => {
    setNavOpen(!primaryNav?.classList.contains("open"));
  });

  primaryNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  /* ---------- Scroll progress / header / active nav ---------- */
  const sectionIds = [
    "top",
    "about",
    "skills",
    "experience",
    "projects",
    "publications",
    "leadership",
    "contact",
  ];
  const navLinks = Array.from(primaryNav?.querySelectorAll("a") || []);
  const dotLinks = Array.from(sideDots?.querySelectorAll("a") || []);

  function onScroll() {
    const scrollTop = window.scrollY || doc.scrollTop;
    const docHeight = doc.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progress) progress.style.width = pct + "%";
    header?.classList.toggle("scrolled", scrollTop > 12);

    let current = "top";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - 140 <= 0) current = id;
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === "#" + current);
    });

    dotLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("data-section") === current);
    });

    if (heroPhoto && !reduceMotion) {
      const shift = Math.min(scrollTop * 0.18, 80);
      heroPhoto.style.transform = "scale(1) translate3d(0," + shift + "px,0)";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealNodes = document.querySelectorAll(".reveal");
  revealNodes.forEach((node, i) => {
    node.style.setProperty("--delay", Math.min((i % 5) * 70, 280) + "ms");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealNodes.forEach((n) => io.observe(n));
  } else {
    revealNodes.forEach((n) => n.classList.add("in"));
  }

  /* ---------- Role rotator ---------- */
  const roles = [
    "Data Engineer",
    "Azure Specialist",
    "Databricks Practitioner",
    "ML Enthusiast",
    "Full-Stack Builder",
  ];

  if (roleRotator && !reduceMotion) {
    let index = 0;
    setInterval(() => {
      roleRotator.classList.add("is-leaving");
      window.setTimeout(() => {
        index = (index + 1) % roles.length;
        roleRotator.textContent = roles[index];
        roleRotator.classList.remove("is-leaving");
        roleRotator.classList.add("is-entering");
        requestAnimationFrame(() => roleRotator.classList.remove("is-entering"));
      }, 280);
    }, 2800);
  }

  /* ---------- Skill filters + chip select ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const skillGroups = document.querySelectorAll(".skill-group");
  const skillChips = document.querySelectorAll(".skill-chip");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";

      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });

      skillGroups.forEach((group) => {
        const category = group.getAttribute("data-category");
        const match = filter === "all" || category === filter;
        group.classList.toggle("is-dimmed", !match);
      });
    });
  });

  skillChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const skill = chip.getAttribute("data-skill") || chip.textContent || "";
      const already = chip.classList.contains("is-selected");
      skillChips.forEach((c) => c.classList.remove("is-selected"));
      if (!already) {
        chip.classList.add("is-selected");
        showToast(skill + " — part of my toolkit");
      }
    });
  });

  /* ---------- Experience accordion ---------- */
  document.querySelectorAll(".timeline-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".timeline-item");
      if (!item) return;
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".timeline-item").forEach((el) => {
        el.classList.remove("is-open");
        el.querySelector(".timeline-toggle")?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Projects ---------- */
  const projectTabs = Array.from(document.querySelectorAll(".project-tab"));
  const projectStages = Array.from(document.querySelectorAll(".project-stage"));
  const projectPrev = document.getElementById("projectPrev");
  const projectNext = document.getElementById("projectNext");
  let projectIndex = 0;

  function showProject(index) {
    projectIndex = (index + projectTabs.length) % projectTabs.length;
    projectTabs.forEach((tab, i) => {
      const active = i === projectIndex;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    projectStages.forEach((stage, i) => {
      const match = i === projectIndex;
      stage.classList.toggle("active", match);
      stage.hidden = !match;
    });
  }

  projectTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showProject(i));
  });

  projectPrev?.addEventListener("click", () => showProject(projectIndex - 1));
  projectNext?.addEventListener("click", () => showProject(projectIndex + 1));

  projectPanel?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      showProject(projectIndex + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showProject(projectIndex - 1);
    }
  });

  /* ---------- Project spotlight (pointer only, normal cursor) ---------- */
  projectPanel?.addEventListener("pointermove", (e) => {
    const rect = projectPanel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    projectPanel.style.setProperty("--cursor-x", x + "%");
    projectPanel.style.setProperty("--cursor-y", y + "%");
  });

  /* ---------- Soft tilt on interactive panels ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".project-panel, .contact-form, .cert-grid li").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateX(" + (-py * 4) + "deg) rotateY(" + px * 5 + "deg)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic buttons (keeps default pointer) ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + x * 0.16 + "px," + y * 0.2 + "px)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Ambient orb parallax ---------- */
  if (!reduceMotion) {
    const orbs = document.querySelectorAll(".orb");
    window.addEventListener(
      "pointermove",
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 24;
        const y = (e.clientY / window.innerHeight - 0.5) * 24;
        orbs.forEach((orb, i) => {
          const factor = (i + 1) * 0.35;
          orb.style.translate = x * factor + "px " + y * factor + "px";
        });
      },
      { passive: true }
    );
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", async () => {
      const value = el.getAttribute("data-copy") || "";
      const label = el.getAttribute("data-copy-label") || "Copied";
      try {
        await navigator.clipboard.writeText(value);
        showToast(label);
      } catch (_) {
        window.location.href = "mailto:" + value;
      }
    });
  });

  /* ---------- Contact form (mailto — fully frontend) ---------- */
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement} */ (document.getElementById("name"))?.value.trim();
    const email = /** @type {HTMLInputElement} */ (document.getElementById("email"))?.value.trim();
    const message = /** @type {HTMLTextAreaElement} */ (document.getElementById("message"))?.value.trim();

    if (!name || !email || !message) {
      if (formNote) {
        formNote.textContent = "Please complete all fields before sending.";
        formNote.classList.add("error");
      }
      return;
    }

    const subject = encodeURIComponent("Portfolio inquiry from " + name);
    const bodyText = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\n" + message
    );

    if (formNote) {
      formNote.classList.remove("error");
      formNote.textContent = "Opening your email client…";
    }

    window.location.href =
      "mailto:sarthak.n.kulkarni@gmail.com?subject=" + subject + "&body=" + bodyText;
  });

  /* ---------- Back to top ---------- */
  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
