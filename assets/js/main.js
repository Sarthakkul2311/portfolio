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
  const chapterRail = document.getElementById("chapterRail");
  const chapterIndex = document.getElementById("chapterIndex");
  const chapterLabel = document.getElementById("chapterLabel");
  const chapterRingFg = document.getElementById("chapterRingFg");
  const timelineProgress = document.getElementById("timelineProgress");
  const timelineWrap = document.querySelector(".timeline-wrap");
  const pipeline = document.getElementById("pipelineDiagram");
  const metricStrip = document.getElementById("metricStrip");
  const meterPanel = document.querySelector(".meter-panel");
  const meterLive = document.getElementById("meterLive");
  const domainLive = document.getElementById("domainLive");
  const careerFill = document.getElementById("careerFill");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RING_LEN = 113.1;

  const chapterMeta = {
    top: { index: "01", label: "Introduction" },
    about: { index: "02", label: "About" },
    skills: { index: "03", label: "Expertise" },
    experience: { index: "04", label: "Career" },
    education: { index: "05", label: "Academics" },
    projects: { index: "06", label: "Projects" },
    publications: { index: "07", label: "Research" },
    leadership: { index: "08", label: "Leadership" },
    contact: { index: "09", label: "Contact" },
  };

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

  /* ---------- Scroll progress / header / active nav / chapters ---------- */
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
  const chapterSections = Array.from(document.querySelectorAll("[data-chapter]"));

  function setChapter(id) {
    const meta = chapterMeta[id] || chapterMeta.top;
    if (chapterIndex) chapterIndex.textContent = meta.index;
    if (chapterLabel) chapterLabel.textContent = meta.label;
  }

  function updateTimelineProgress() {
    if (!timelineWrap || !timelineProgress || reduceMotion) return;
    const rect = timelineWrap.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const start = view * 0.75;
    const end = view * 0.25;
    const raw = (start - rect.top) / (start - end + rect.height);
    const pct = Math.max(0, Math.min(1, raw)) * 100;
    timelineProgress.style.height = pct + "%";
  }

  function updateSectionMotion() {
    if (reduceMotion) return;
    chapterSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const visible = rect.top < view * 0.85 && rect.bottom > view * 0.15;
      section.classList.toggle("is-inview", visible);

      const mid = rect.top + rect.height / 2;
      const offset = (mid - view / 2) / view;
      const watermark = section.querySelector(".section-watermark");
      if (watermark && visible) {
        watermark.style.transform = "translateY(" + offset * -18 + "px)";
      }
    });

    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-parallax") || "0.1");
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progressY = (rect.top + rect.height / 2 - view / 2) / view;
      el.style.transform = "translate3d(0," + progressY * strength * -40 + "px,0)";
    });
  }

  function onScroll() {
    const scrollTop = window.scrollY || doc.scrollTop;
    const docHeight = doc.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progress) progress.style.width = pct + "%";
    if (chapterRingFg) {
      chapterRingFg.style.strokeDashoffset = String(RING_LEN - (RING_LEN * pct) / 100);
    }
    header?.classList.toggle("scrolled", scrollTop > 12);
    chapterRail?.classList.toggle("is-visible", scrollTop > 120);

    let current = "top";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - 140 <= 0) current = id;
    }

    const edu = document.getElementById("education");
    if (edu && edu.getBoundingClientRect().top - 140 <= 0) {
      const proj = document.getElementById("projects");
      if (!proj || proj.getBoundingClientRect().top - 140 > 0) {
        current = "education";
      }
    }

    setChapter(current);

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const matchId = current === "education" ? "experience" : current;
      link.classList.toggle("active", href === "#" + matchId);
    });

    dotLinks.forEach((link) => {
      const section = link.getAttribute("data-section");
      const matchId = current === "education" ? "experience" : current;
      link.classList.toggle("active", section === matchId);
    });

    if (heroPhoto && !reduceMotion) {
      const shift = Math.min(scrollTop * 0.18, 80);
      heroPhoto.style.transform = "scale(1) translate3d(0," + shift + "px,0)";
    }

    updateTimelineProgress();
    updateSectionMotion();
    if (typeof window.__syncCareerScroll === "function") {
      window.__syncCareerScroll();
    }
    if (typeof window.__syncEduScroll === "function") {
      window.__syncEduScroll();
    }
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );
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
    "Agentic AI Systems",
    "Azure AI Foundry",
    "RAG Pipelines",
    "Azure DevOps",
    "Multi-Agent Architect",
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

  /* ---------- Animated counters + meter / metric bars ---------- */
  function animateCount(el, to, suffix, duration) {
    if (reduceMotion) {
      el.textContent = to + suffix;
      return;
    }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateMeters() {
    document.querySelectorAll(".meter-item").forEach((item, i) => {
      const level = parseInt(item.getAttribute("data-level") || "0", 10);
      const pctEl = item.querySelector(".meter-pct");
      window.setTimeout(() => {
        item.classList.add("is-hot");
        if (pctEl) animateCount(pctEl, level, "%", 900);
      }, reduceMotion ? 0 : i * 70);
    });
    meterPanel?.classList.add("is-hot");
  }

  if ("IntersectionObserver" in window) {
    const dataIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          if (target.id === "metricStrip" || target.classList.contains("metric-strip")) {
            target.classList.add("is-hot");
            target.querySelectorAll("[data-count]").forEach((el) => {
              const to = parseInt(el.getAttribute("data-count") || "0", 10);
              const suffix = el.getAttribute("data-suffix") || "";
              animateCount(el, to, suffix, 1100);
            });
          }
          if (target.classList.contains("meter-panel") || target.id === "meterList") {
            animateMeters();
          }
          if (target.hasAttribute("data-animate-bars")) {
            target.classList.add("is-hot");
          }
          dataIo.unobserve(target);
        });
      },
      { threshold: 0.35 }
    );
    if (metricStrip) dataIo.observe(metricStrip);
    if (meterPanel) dataIo.observe(meterPanel);
    document.querySelectorAll("[data-animate-bars]").forEach((el) => dataIo.observe(el));
  } else {
    metricStrip?.classList.add("is-hot");
    animateMeters();
    document.querySelectorAll("[data-animate-bars]").forEach((el) => el.classList.add("is-hot"));
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent =
        (el.getAttribute("data-count") || "0") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Domain radar ---------- */
  const domains = [
    { name: "Agentic AI", value: 92, blurb: "Multi-agent systems, RAG pipelines, and LLM orchestration on Azure AI Foundry" },
    { name: "DevOps", value: 88, blurb: "CI/CD, Azure DevOps, Web Apps, and Function Apps for reliable release automation" },
    { name: "Cloud", value: 90, blurb: "Microsoft Azure platforms for production GenAI and enterprise workflows" },
    { name: "Data", value: 82, blurb: "Python, SQL, Databricks, PySpark, and time series analytics" },
    { name: "Leadership", value: 84, blurb: "Mentoring interns, team coordination, and campus leadership roles" },
  ];

  (function buildRadar() {
    const svg = document.getElementById("domainRadar");
    const area = document.getElementById("radarArea");
    const pointsG = document.getElementById("radarPoints");
    const labelsG = document.getElementById("radarLabels");
    const grid = svg?.querySelector(".radar-grid");
    const legend = document.getElementById("domainLegend");
    if (!svg || !area || !pointsG || !labelsG || !grid || !legend) return;

    const cx = 140;
    const cy = 140;
    const maxR = 92;
    const n = domains.length;

    function polar(i, ratio) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return {
        x: cx + Math.cos(angle) * maxR * ratio,
        y: cy + Math.sin(angle) * maxR * ratio,
      };
    }

    [0.35, 0.6, 0.85, 1].forEach((ratio) => {
      const pts = domains
        .map((_, i) => {
          const p = polar(i, ratio);
          return p.x.toFixed(1) + "," + p.y.toFixed(1);
        })
        .join(" ");
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", pts);
      grid.appendChild(poly);
    });

    const areaPts = domains
      .map((d, i) => {
        const p = polar(i, d.value / 100);
        return p.x.toFixed(1) + "," + p.y.toFixed(1);
      })
      .join(" ");
    area.setAttribute("points", areaPts);

    domains.forEach((d, i) => {
      const p = polar(i, d.value / 100);
      const tip = polar(i, 1.18);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(p.x));
      circle.setAttribute("cy", String(p.y));
      circle.setAttribute("r", "4.5");
      circle.classList.add("radar-point");
      circle.dataset.index = String(i);
      pointsG.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(tip.x));
      label.setAttribute("y", String(tip.y));
      label.classList.add("radar-label");
      label.textContent = d.name;
      labelsG.appendChild(label);

      const li = document.createElement("li");
      li.dataset.index = String(i);
      li.innerHTML = "<strong>" + d.name + "</strong><span>" + d.value + "</span>";
      legend.appendChild(li);

      function activate() {
        pointsG.querySelectorAll(".radar-point").forEach((el) => el.classList.remove("is-active"));
        legend.querySelectorAll("li").forEach((el) => el.classList.remove("is-active"));
        circle.classList.add("is-active");
        li.classList.add("is-active");
        if (domainLive) domainLive.textContent = d.name + " · " + d.value + "/100 — " + d.blurb;
      }

      circle.addEventListener("mouseenter", activate);
      circle.addEventListener("focus", activate);
      circle.addEventListener("click", activate);
      li.addEventListener("mouseenter", activate);
      li.addEventListener("click", activate);
    });
  })();

  /* ---------- Skill filters + chip select + meters ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const skillGroups = document.querySelectorAll(".skill-group");
  const skillChips = document.querySelectorAll(".skill-chip");
  const meterItems = document.querySelectorAll(".meter-item");

  function setMeterLive(skill, level) {
    if (!meterLive) return;
    meterLive.textContent = skill + " · proficiency " + level + "%";
  }

  function staggerVisibleChips() {
    if (reduceMotion) return;
    const visible = Array.from(skillChips).filter((chip) => {
      const group = chip.closest(".skill-group");
      return group && !group.classList.contains("is-dimmed");
    });
    visible.forEach((chip, i) => {
      chip.classList.remove("is-entering");
      void chip.offsetWidth;
      chip.style.animationDelay = i * 0.035 + "s";
      chip.classList.add("is-entering");
    });
  }

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

      meterItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const match = filter === "all" || category === filter;
        item.classList.toggle("is-dimmed", !match);
      });

      staggerVisibleChips();
    });
  });

  skillChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const skill = chip.getAttribute("data-skill") || chip.textContent || "";
      const level = chip.getAttribute("data-level") || "";
      const already = chip.classList.contains("is-selected");
      skillChips.forEach((c) => c.classList.remove("is-selected"));
      meterItems.forEach((m) => m.classList.remove("is-active"));
      if (!already) {
        chip.classList.add("is-selected");
        showToast(skill + (level ? " · " + level + "%" : " — part of my toolkit"));
        if (level) setMeterLive(skill, level);
        meterItems.forEach((m) => {
          const name = (m.getAttribute("data-skill") || "").toLowerCase();
          if (name && skill.toLowerCase().includes(name.toLowerCase())) {
            m.classList.add("is-active");
          }
        });
      } else if (meterLive) {
        meterLive.textContent = "Select a skill chip or bar to explore";
      }
    });
  });

  meterItems.forEach((item) => {
    item.querySelector(".meter-btn")?.addEventListener("click", () => {
      const skill = item.getAttribute("data-skill") || "";
      const level = item.getAttribute("data-level") || "0";
      meterItems.forEach((m) => m.classList.remove("is-active"));
      item.classList.add("is-active");
      setMeterLive(skill, level);
      skillChips.forEach((c) => {
        const chipSkill = (c.getAttribute("data-skill") || "").toLowerCase();
        c.classList.toggle(
          "is-selected",
          chipSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(chipSkill)
        );
      });
    });
  });

  /* ---------- Career path scrubber + detail panel ---------- */
  const careerNodes = Array.from(document.querySelectorAll(".career-node"));
  const timelineItems = Array.from(document.querySelectorAll(".timeline-item"));
  const careerDetail = document.getElementById("careerDetail");
  const careerDetailKicker = document.getElementById("careerDetailKicker");
  const careerDetailTitle = document.getElementById("careerDetailTitle");
  const careerDetailOrg = document.getElementById("careerDetailOrg");
  const careerDetailTime = document.getElementById("careerDetailTime");
  const careerDetailPoints = document.getElementById("careerDetailPoints");
  const careerDetailTags = document.getElementById("careerDetailTags");
  const careerDetailBar = document.getElementById("careerDetailBar");
  const careerToTimeline = [4, 3, 2, 1, 0];

  const careerData = [
    {
      kicker: "Growth leadership",
      title: "Growth Ambassador",
      org: "Younity.in · Delhi",
      time: "Jun 2021 – Jul 2021",
      points: [
        "Led a team of 15 interns, coordinating task allocation, development strategy, and delivery timelines.",
        "Supported business development and sales coordination initiatives across growth programs.",
      ],
      tags: ["Leadership", "Team Lead", "Growth"],
      focus: "78%",
    },
    {
      kicker: "Early engineering",
      title: "Trainee Software Developer",
      org: "White Code Technology Solutions Pvt. Ltd. · Pune",
      time: "Sep 2021 – Dec 2021",
      points: [
        "Developed responsive websites for educational institutions with clean, accessible UI patterns.",
        "Researched and prototyped smart contracts and NFT creation workflows on blockchain platforms.",
      ],
      tags: ["Web", "UI", "Blockchain"],
      focus: "72%",
    },
    {
      kicker: "Internship",
      title: "Data Science Intern",
      org: "CodeClause · Pune",
      time: "Apr 2023 – May 2023",
      points: [
        "Built a customer segmentation model using K-means clustering to support trend analysis and targeted insights.",
        "Developed an AI-based age and gender detection model, covering data preprocessing, training, and evaluation.",
      ],
      tags: ["Python", "ML", "K-means", "CV"],
      focus: "80%",
    },
    {
      kicker: "Professional",
      title: "Front-End Web Developer",
      org: "Growdigis IT Solution Pvt. Ltd. · Pune",
      time: "Jul 2023 – Sep 2023",
      points: [
        "Developed responsive web interfaces with backend integration for client-facing digital service platforms.",
        "Deployed a production website enabling a service provider to digitize and scale their business operations.",
      ],
      tags: ["HTML", "CSS", "JavaScript", "Web"],
      focus: "76%",
    },
    {
      kicker: "Current role",
      title: "GenAI Developer / DevOps Engineer",
      org: "Hexaware Technologies · Pune",
      time: "Aug 2024 – Present",
      points: [
        "Designed and deployed a production triaging agent on Azure that autonomously identifies issues, logs tickets, and resolves in-scope incidents — reducing manual operational effort by approximately 70%.",
        "Architected a multi-agent application to generate Informed Consent Forms across N countries × N studies via Azure AI Foundry.",
        "Built end-to-end agentic solutions using RAG, Azure Web Apps, Function Apps, and Azure DevOps CI/CD.",
      ],
      tags: ["Azure AI Foundry", "RAG", "Azure DevOps", "Agentic AI"],
      focus: "94%",
    },
  ];

  function renderCareerDetail(i) {
    const data = careerData[i];
    if (!data || !careerDetail) return;

    const apply = () => {
      if (careerDetailKicker) careerDetailKicker.textContent = data.kicker;
      if (careerDetailTitle) careerDetailTitle.textContent = data.title;
      if (careerDetailOrg) careerDetailOrg.textContent = data.org;
      if (careerDetailTime) careerDetailTime.textContent = data.time;
      if (careerDetailPoints) {
        careerDetailPoints.innerHTML = data.points.map((p) => "<li>" + p + "</li>").join("");
      }
      if (careerDetailTags) {
        careerDetailTags.innerHTML = data.tags.map((t) => "<li>" + t + "</li>").join("");
      }
      if (careerDetailBar) careerDetailBar.style.setProperty("--focus", data.focus);
      careerDetail.classList.remove("is-switching");
    };

    if (reduceMotion) {
      apply();
      return;
    }
    careerDetail.classList.add("is-switching");
    window.setTimeout(apply, 180);
  }

  function setCareer(index, syncAccordion) {
    const i = Math.max(0, Math.min(careerNodes.length - 1, index));
    careerNodes.forEach((node, idx) => {
      const active = idx === i;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (careerFill) careerFill.style.width = (i / Math.max(1, careerNodes.length - 1)) * 80 + "%";
    renderCareerDetail(i);
    if (syncAccordion) {
      const tIndex = careerToTimeline[i];
      timelineItems.forEach((item, idx) => {
        const open = idx === tIndex;
        item.classList.toggle("is-open", open);
        item.querySelector(".timeline-toggle")?.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  careerNodes.forEach((node) => {
    node.addEventListener("click", () => {
      setCareer(parseInt(node.getAttribute("data-career") || "0", 10), true);
    });
  });
  setCareer(4, false);

  window.__syncCareerScroll = function () {
    if (!timelineItems.length || reduceMotion) return;
    let activeCareer = 4;
    timelineItems.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.55) {
        const careerIdx = careerToTimeline.indexOf(idx);
        if (careerIdx >= 0) activeCareer = careerIdx;
      }
    });
    if (document.getElementById("experience")?.classList.contains("is-inview")) {
      const current = careerNodes.findIndex((n) => n.classList.contains("is-active"));
      if (current !== activeCareer) setCareer(activeCareer, false);
    }
  };

  /* ---------- Experience accordion ---------- */
  document.querySelectorAll(".timeline-toggle").forEach((btn, idx) => {
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
        const mapped = item.getAttribute("data-career-card");
        const careerIdx =
          mapped != null ? parseInt(mapped, 10) : careerToTimeline.indexOf(idx);
        if (careerIdx >= 0) setCareer(careerIdx, false);
      }
    });
  });

  /* ---------- Education journey ---------- */
  const eduCards = Array.from(document.querySelectorAll(".edu-card"));
  const eduSpineFill = document.getElementById("eduSpineFill");
  const eduJourney = document.getElementById("eduJourney");

  function setEdu(index) {
    eduCards.forEach((card, i) => {
      const active = i === index;
      card.classList.toggle("is-active", active);
      card.querySelector(".edu-card-toggle")?.setAttribute("aria-expanded", active ? "true" : "false");
    });
  }

  eduCards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".edu-card-toggle")) {
        e.stopPropagation();
        setEdu(card.classList.contains("is-active") ? -1 : i);
        return;
      }
      setEdu(i);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setEdu(i);
      }
    });
  });

  window.__syncEduScroll = function () {
    if (!eduJourney || !eduSpineFill) return;
    const rect = eduJourney.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const start = view * 0.8;
    const raw = (start - rect.top) / (rect.height + view * 0.3);
    const pct = Math.max(0, Math.min(1, raw)) * 100;
    eduSpineFill.style.height = pct + "%";

    if (!reduceMotion && eduJourney.closest(".section")?.classList.contains("is-inview")) {
      let active = 0;
      eduCards.forEach((card, i) => {
        if (card.getBoundingClientRect().top < view * 0.55) active = i;
      });
      if (!eduCards.some((c) => c.classList.contains("is-active") && document.activeElement === c)) {
        const current = eduCards.findIndex((c) => c.classList.contains("is-active"));
        if (current !== active) setEdu(active);
      }
    }
  };

  /* ---------- Projects ---------- */
  const projectTabs = Array.from(document.querySelectorAll(".project-tab"));
  const projectStages = Array.from(document.querySelectorAll(".project-stage"));
  const projectPrev = document.getElementById("projectPrev");
  const projectNext = document.getElementById("projectNext");
  let projectIndex = 0;

  function activatePipeline(active) {
    if (!pipeline) return;
    pipeline.classList.toggle("is-active", active);
    const nodes = pipeline.querySelectorAll(".pipeline-node");
    nodes.forEach((node) => node.classList.remove("is-lit"));
    if (!active || reduceMotion) {
      if (active) nodes.forEach((n) => n.classList.add("is-lit"));
      return;
    }
    nodes.forEach((node, i) => {
      window.setTimeout(() => node.classList.add("is-lit"), 220 + i * 280);
    });
  }

  function activateProjectData(stage) {
    if (!stage) return;
    const stats = stage.querySelector("[data-animate-bars]");
    if (stats) {
      stats.classList.remove("is-hot");
      void stats.offsetWidth;
      stats.classList.add("is-hot");
    }
  }

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
      if (match) activateProjectData(stage);
    });
    activatePipeline(projectIndex === 0);
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

  if ("IntersectionObserver" in window) {
    const projectIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && projectIndex === 0) activatePipeline(true);
        });
      },
      { threshold: 0.35 }
    );
    if (projectPanel) projectIo.observe(projectPanel);
  } else {
    activatePipeline(true);
  }

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
    document.querySelectorAll(".project-panel, .contact-form, .cert-grid li, .career-detail, .edu-card").forEach((el) => {
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

  /* ---------- Contact form (FormSubmit — real inbox delivery) ---------- */
  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement} */ (document.getElementById("name"))?.value.trim();
    const email = /** @type {HTMLInputElement} */ (document.getElementById("email"))?.value.trim();
    const message = /** @type {HTMLTextAreaElement} */ (document.getElementById("message"))?.value.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      if (formNote) {
        formNote.textContent = "Please complete all fields before sending.";
        formNote.classList.add("error");
      }
      return;
    }

    const inbox =
      (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.contactEmail) ||
      "sarthakkul2311@gmail.com";

    if (formNote) {
      formNote.classList.remove("error");
      formNote.textContent = "Sending your message…";
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(inbox), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: "Portfolio contact from " + name,
          _template: "table",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data && data.message) || "Could not send message");
      }

      if (formNote) {
        formNote.textContent =
          "Message sent. If this is your first submission, check your inbox to activate FormSubmit.";
      }
      contactForm.reset();
      showToast("Message sent");
    } catch (_) {
      const subject = encodeURIComponent("Portfolio inquiry from " + name);
      const bodyText = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\n\n" + message
      );
      if (formNote) {
        formNote.classList.add("error");
        formNote.textContent = "Direct send failed — opening your email app as a backup…";
      }
      window.location.href = "mailto:" + inbox + "?subject=" + subject + "&body=" + bodyText;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- Back to top ---------- */
  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
