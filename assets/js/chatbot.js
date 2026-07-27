/* Portfolio assistant chatbot — answers only from site/resume knowledge */

(function () {
  "use strict";

  const config = window.PORTFOLIO_CONFIG || {};
  const knowledge = window.PORTFOLIO_KNOWLEDGE || "";
  const proxyUrl = String(
    (typeof config.chatProxyUrl === "string" && config.chatProxyUrl) ||
      config.chatProxyUrlLocal ||
      ""
  ).trim();
  const model = config.chatModel || "llama-3.3-70b-versatile";

  const root = document.getElementById("chatbot");
  const toggle = document.getElementById("chatToggle");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messagesEl = document.getElementById("chatMessages");
  const statusEl = document.getElementById("chatStatus");

  if (!root || !toggle || !panel || !form || !input || !messagesEl) return;

  const SYSTEM_PROMPT =
    "You are the portfolio assistant for Sarthak Kulkarni. " +
    "You may ONLY answer questions about Sarthak Kulkarni using the PROFILE DATA below " +
    "(his experience, skills, education, projects, publications, leadership, certifications, contact, and location). " +
    "If the user asks anything unrelated (general knowledge, coding help, other people, politics, jokes, math, etc.), " +
    "politely refuse and say you can only answer questions about Sarthak Kulkarni based on his portfolio and resume. " +
    "Do not invent employers, dates, skills, or achievements that are not in PROFILE DATA. " +
    "If something is not in PROFILE DATA, say you do not have that information on the portfolio/resume. " +
    "Keep answers concise, professional, and helpful. Prefer short paragraphs or brief bullets.\n\n" +
    "PROFILE DATA:\n" +
    knowledge;

  /** @type {{role: string, content: string}[]} */
  const history = [];

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      input.focus();
      if (!messagesEl.dataset.welcomed) {
        addBubble(
          "assistant",
          "Hi — I can answer questions about Sarthak Kulkarni based on his portfolio and resume. What would you like to know?"
        );
        messagesEl.dataset.welcomed = "1";
      }
    }
  }

  function addBubble(role, text) {
    const row = document.createElement("div");
    row.className = "chat-bubble chat-bubble--" + role;
    row.textContent = text;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function offTopicLocalGuard(question) {
    const q = question.toLowerCase();
    const aboutSignals = [
      "sarthak",
      "kulkarni",
      "you",
      "your",
      "portfolio",
      "resume",
      "cv",
      "experience",
      "skill",
      "project",
      "education",
      "college",
      "hexaware",
      "azure",
      "databricks",
      "certification",
      "contact",
      "email",
      "phone",
      "linkedin",
      "pune",
      "publication",
      "leadership",
      "aces",
      "hire",
      "work",
      "role",
      "job",
      "background",
      "who",
      "what do you",
      "where",
    ];
    return aboutSignals.some((s) => q.includes(s));
  }

  async function askModel(question) {
    if (!proxyUrl) {
      throw new Error(
        "Chat proxy is not configured. For local use, run: node scripts/dev-chat-proxy.cjs"
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: question },
    ];

    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (data && (data.error && data.error.message)) ||
        (data && data.error) ||
        "Chat request failed (" + res.status + ")";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }

    const answer =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!answer) throw new Error("Empty response from model");
    return String(answer).trim();
  }

  toggle.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
  closeBtn?.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    addBubble("user", question);
    setStatus("Thinking…");

    if (!offTopicLocalGuard(question) && question.length < 280) {
      // Soft local hint only — model still enforces hard boundary
    }

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const answer = await askModel(question);
      history.push({ role: "user", content: question });
      history.push({ role: "assistant", content: answer });
      if (history.length > 10) history.splice(0, history.length - 10);
      addBubble("assistant", answer);
      setStatus("");
    } catch (err) {
      const raw = String(err && err.message ? err.message : err);
      const blocked =
        /failed to fetch|networkerror|load failed|blocked/i.test(raw);
      addBubble(
        "assistant",
        blocked
          ? "I could not reach the assistant from this network. If you are on office Wi‑Fi, try mobile data or home internet. You can also email sarthak.n.kulkarni@gmail.com."
          : "I could not reach the assistant right now. Please try again in a moment, or email sarthak.n.kulkarni@gmail.com."
      );
      setStatus(raw, true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      input.focus();
    }
  });

  // Quick prompts
  root.querySelectorAll("[data-chat-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.getAttribute("data-chat-prompt") || "";
      form.requestSubmit();
    });
  });
})();
