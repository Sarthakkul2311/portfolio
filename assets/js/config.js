/**
 * Public site config (safe to commit — NO API keys here).
 *
 * FREE production stack:
 * - Site: GitHub Pages
 * - Contact emails: FormSubmit (free)
 * - Chatbot proxy: Cloudflare Workers free plan
 * - LLM: Groq free tier (rate-limited)
 *
 * After you create the Cloudflare Worker, paste its URL below in
 * chatProxyUrlProduction, for example:
 *   "https://sarthak-portfolio-chat.YOUR_SUBDOMAIN.workers.dev/chat"
 */
(function () {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  window.PORTFOLIO_CONFIG = {
    contactEmail: "sarthak.n.kulkarni@gmail.com",
    chatProxyUrlLocal: "http://127.0.0.1:8787/chat",
    chatProxyUrlProduction: "https://holy-violet-14e6.sarthakkul2311.workers.dev/chat",
    chatModel: "llama-3.3-70b-versatile",
    get chatProxyUrl() {
      return isLocal ? this.chatProxyUrlLocal : this.chatProxyUrlProduction;
    },
  };
})();
