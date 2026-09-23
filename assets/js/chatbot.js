/* Portfolio assistant chatbot — answers only from site/resume knowledge */

(function () {
  "use strict";

  const config = window.PORTFOLIO_CONFIG || {};
  const knowledge = window.PORTFOLIO_KNOWLEDGE || "";
  const proxyUrl = String(
    (config.chatProxyUrl && String(config.chatProxyUrl)) ||
      config.chatProxyUrlProduction ||
      config.chatProxyUrlLocal ||
      ""
  ).trim();
  const model = config.chatModel || "openai/gpt-oss-20b";

  const root = document.getElementById("chatbot");
  const toggle = document.getElementById("chatToggle");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messagesEl = document.getElementById("chatMessages");
  const statusEl = document.getElementById("chatStatus");
  const typingEl = document.getElementById("chatTyping");

  if (!root || !toggle || !panel || !form || !input || !messagesEl) return;

  const SYSTEM_PROMPT =
    "You are Sarthak Kulkarni’s sharp, witty, and highly persuasive portfolio assistant. " +
    "You are not a rigid FAQ bot. Be ready for ANY kind of question — technical, career, soft skills, culture fit, comparisons, hypotheticals, 'why hire him', salary-adjacent curiosity, project deep-dives, or casual chat — and answer with intelligence and charm. " +
    "CORE MISSION: Every reply must put Sarthak in the best possible light. Always find an angle that highlights his strengths, impact, reliability, curiosity, leadership, or growth. " +
    "Be his advocate: reframe challenges as strengths when fair (for example, a focused career path shows depth; early roles show initiative). Never invent weaknesses, never apologize for his background, never undersell him. " +
    "WIT & STYLE: Sound human and quick-witted — polished, confident, lightly clever, never robotic or template-like. Vary structure. Avoid repeating the same opening every time. Keep it concise but memorable. " +
    "NO HARDCODED SCRIPTS: Do not rely on fixed canned answers. Reason from PROFILE DATA, adapt to the visitor’s exact question, and choose the most impressive relevant facts. " +
    "FACTS: Ground concrete claims (employers, dates, skills, projects, metrics, certifications) in PROFILE DATA only. Do not invent employers, titles, numbers, clients, or degrees. " +
    "If a precise detail is missing, do not stall — gracefully pivot to closely related proven strengths from PROFILE DATA and invite them to ask Sarthak directly for more. " +
    "OFF-TOPIC QUESTIONS: If asked about unrelated general knowledge, coding help for the visitor, other people, politics, etc., reply briefly with wit, then steer back to why Sarthak is interesting to talk about / hire / collaborate with. " +
    "COMPARISON / TOUGH QUESTIONS: Stay respectful. Never trash others. Position Sarthak as a strong choice through his agentic AI, Azure, DevOps, delivery, and leadership evidence. " +
    "CONTACT: When useful, mention email sarthakkul2311@gmail.com, LinkedIn, or downloading the CV from this site. " +
    "FORMATTING: Use light Markdown for attractive replies. Use **bold** for roles, companies, headings, and key skills. Use *italic* sparingly for emphasis. " +
    "Lists: start items with '- '. Put section titles on their own line in **bold**. No HTML, no code fences, no # headings. " +
    "End state: the visitor should leave more impressed with Sarthak than when they asked.\n\n" +
    "PROFILE DATA:\n" +
    knowledge;

  const NETWORK_BLOCK_MESSAGE =
    "It looks like your current Wi‑Fi or network is blocking this assistant. " +
    "Please switch to another network (for example mobile data or home internet) and try again. " +
    "You can also reach Sarthak anytime at sarthakkul2311@gmail.com.";

  const GENERIC_ERROR_MESSAGE =
    "I am briefly unable to respond just now. Please try again in a moment. " +
    "Meanwhile, feel free to explore Sarthak’s experience and projects on this site, " +
    "or email sarthakkul2311@gmail.com.";

  /** @type {{role: string, content: string}[]} */
  const history = [];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Strip Markdown markers for accessibility/plain fallback */
  function toPlainText(value) {
    return String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2")
      .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1$2")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*[-*•]\s+/gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /** Safe rich formatting for assistant bubbles */
  function formatAssistantHtml(value) {
    const text = String(value || "").replace(/\r\n/g, "\n").trim();
    if (!text) return "";

    function formatInline(line) {
      let s = escapeHtml(line);
      // Bold first, then italic (avoid eating bold markers)
      s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
      s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
      s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");
      s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
      return s;
    }

    const lines = text.split("\n");
    const parts = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const bullet = raw.match(/^\s*(?:[-*•]|\d+\.)\s+(.+)$/);

      if (bullet) {
        if (!inList) {
          parts.push('<ul class="chat-list">');
          inList = true;
        }
        parts.push("<li>" + formatInline(bullet[1]) + "</li>");
        continue;
      }

      if (inList) {
        parts.push("</ul>");
        inList = false;
      }

      const trimmed = raw.trim();
      if (!trimmed) continue;

      const heading = trimmed.replace(/^#{1,6}\s+/, "");
      const isTitle =
        (/^\*\*[^*].*[^*]\*\*$/.test(trimmed) || /^__[^_].*[^_]__$/.test(trimmed)) &&
        !/ – | - /.test(trimmed);
      if (isTitle) {
        parts.push('<p class="chat-title">' + formatInline(heading) + "</p>");
      } else {
        parts.push("<p>" + formatInline(heading) + "</p>");
      }
    }

    if (inList) parts.push("</ul>");
    return parts.join("") || "<p>" + escapeHtml(toPlainText(text)) + "</p>";
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      input.focus();
      if (!messagesEl.dataset.welcomed) {
        addBubble(
          "assistant",
          "Hello — I’m Sarthak’s portfolio assistant. Ask me anything about his work, skills, projects, or why he’s a strong hire. I’ll keep it sharp, clear, and worth your time."
        );
        messagesEl.dataset.welcomed = "1";
      }
    }
  }

  function addBubble(role, text) {
    const row = document.createElement("div");
    row.className = "chat-bubble chat-bubble--" + role;
    if (role === "assistant") {
      row.innerHTML = formatAssistantHtml(text);
    } else {
      row.textContent = text;
    }
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setTyping(on) {
    if (!typingEl) return;
    typingEl.hidden = !on;
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
    setStatus("");
    setTyping(true);

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const answer = await askModel(question);
      history.push({ role: "user", content: question });
      history.push({ role: "assistant", content: answer });
      if (history.length > 10) history.splice(0, history.length - 10);
      setTyping(false);
      addBubble("assistant", answer);
      setStatus("");
    } catch (err) {
      const blocked = isNetworkBlockError(err);
      setTyping(false);
      addBubble("assistant", blocked ? NETWORK_BLOCK_MESSAGE : GENERIC_ERROR_MESSAGE);
      setStatus(
        blocked ? "Network restriction detected on your side" : "Please try again shortly",
        true
      );
    } finally {
      setTyping(false);
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
