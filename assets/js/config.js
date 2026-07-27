/**
 * Public site config (safe to commit — NO API keys here).
 *
 * FREE stack: GitHub Pages + FormSubmit + Cloudflare Workers + Groq free tier
 */
(function () {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  window.PORTFOLIO_CONFIG = {
    contactEmail: "sarthak.n.kulkarni@gmail.com",
    chatProxyUrlLocal: "http://127.0.0.1:8787/chat",
    chatProxyUrlProduction: "https://holy-violet-14e6.sarthakkul2311.workers.dev/chat",
    // false = always use Cloudflare Worker (recommended)
    // true  = on localhost only, use node scripts/dev-chat-proxy.cjs
    forceLocalProxy: false,
    chatModel: "llama-3.3-70b-versatile",
    get chatProxyUrl() {
      if (this.forceLocalProxy && isLocal) return this.chatProxyUrlLocal;
      return this.chatProxyUrlProduction || this.chatProxyUrlLocal;
    },
  };
})();
