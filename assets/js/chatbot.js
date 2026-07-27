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
    "You are the warm, professional portfolio assistant for Sarthak Kulkarni. " +
    "Your goal is to help visitors quickly appreciate Sarthak’s strengths, professionalism, and potential. " +
    "Always speak positively, respectfully, and impressively about Sarthak. " +
    "Never criticize Sarthak, never invent weaknesses, never use negative framing about him, " +
    "and never imply he lacks skills, experience, or suitability. " +
    "If information is limited, stay gracious and highlight what is known from PROFILE DATA in a confident, complimentary way. " +
    "You may ONLY answer questions about Sarthak Kulkarni using the PROFILE DATA below " +
    "(experience, skills, education, projects, publications, leadership, certifications, contact, and location). " +
    "If the user asks anything unrelated (general knowledge, coding help for themselves, other people, politics, jokes, math, etc.), " +
    "politely decline and invite them to ask about Sarthak’s background, skills, projects, or experience instead. " +
    "Do not invent employers, dates, skills, or achievements that are not in PROFILE DATA. " +
    "If a specific detail is not in PROFILE DATA, say that detail is not listed here, then warmly point them to related strengths that are listed, " +
    "or suggest contacting Sarthak directly. " +
    "Tone: polished, friendly, confident, and concise. Prefer short paragraphs or brief bullets. " +
    "Make every answer leave a strong positive impression of Sarthak.\n\n" +
    "PROFILE DATA:\n" +
    knowledge;

  const NETWORK_BLOCK_MESSAGE =
    "It looks like your current Wi‑Fi or network is blocking this assistant — " +
    "this portfolio website itself is working fine. " +
    "Please switch to another network (for example mobile data or home internet) and try again. " +
    "You can also reach Sarthak anytime at sarthak.n.kulkarni@gmail.com.";

  const GENERIC_ERROR_MESSAGE =
    "I am briefly unable to respond just now. Please try again in a moment. " +
    "Meanwhile, feel free to explore Sarthak’s experience and projects on this site, " +
    "or email sarthak.n.kulkarni@gmail.com.";

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
          "Hello! I am Sarthak’s portfolio assistant. I would be glad to share his experience, skills, projects, and achievements. What would you like to know?"
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

  function isNetworkBlockError(err) {
    const raw = String(err && err.message ? err.message : err);
    return /failed to fetch|networkerror|load failed|blocked|network request failed|fetch/i.test(
      raw
    );
  }

  async function askModel(question) {
    if (!proxyUrl) {
      throw new Error("Chat proxy is not configured.");
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
        (data && data.error && data.error.message) ||
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
      const blocked = isNetworkBlockError(err);
      addBubble("assistant", blocked ? NETWORK_BLOCK_MESSAGE : GENERIC_ERROR_MESSAGE);
      setStatus(
        blocked ? "Network restriction detected on your side" : "Please try again shortly",
        true
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      input.focus();
    }
  });

  root.querySelectorAll("[data-chat-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.getAttribute("data-chat-prompt") || "";
      form.requestSubmit();
    });
  });
})();
