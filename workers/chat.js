/**
 * Cloudflare Worker — Groq chat proxy (FREE plan)
 *
 * Dashboard setup (recommended):
 * 1. https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Name it: sarthak-portfolio-chat
 * 3. Paste this file code → Deploy
 * 4. Settings → Variables and Secrets → Add secret GROQ_API_KEY
 * 5. Copy Worker URL into assets/js/config.js → chatProxyUrlProduction
 *
 * Or CLI (from /workers):
 *   npx wrangler login
 *   npx wrangler deploy
 *   npx wrangler secret put GROQ_API_KEY
 */

const ALLOWED_ORIGINS = [
  "https://sarthakkul2311.github.io",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
];

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const isChatPath = path === "/chat" || path === "/";

    if (request.method !== "POST" || !isChatPath) {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "sarthak-portfolio-chat",
          usage: "POST /chat with { model, messages }",
        }),
        { status: request.method === "GET" ? 200 : 404, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY secret is not set" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
    const model = typeof payload.model === "string" ? payload.model : "llama-3.3-70b-versatile";

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        messages,
      }),
    });

    const data = await groqRes.text();
    return new Response(data, {
      status: groqRes.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
