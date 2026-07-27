/**
 * Cloudflare Worker — Groq chat proxy (FREE plan)
 *
 * In Cloudflare dashboard:
 * 1. Open your Worker → Edit code
 * 2. Replace ALL code with this file
 * 3. Deploy
 * 4. Settings → Variables and Secrets → secret GROQ_API_KEY = your gsk_ key
 */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const isChatPath = path === "/chat" || path === "/";

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "sarthak-portfolio-chat",
          usage: "POST /chat with { model, messages }",
        }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    if (request.method !== "POST" || !isChatPath) {
      return new Response(JSON.stringify({ error: "Not found. Use POST /chat" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY secret is not set on this Worker",
        }),
        {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
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

    try {
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
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Upstream request failed",
          detail: String(err && err.message ? err.message : err),
        }),
        {
          status: 502,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }
  },
};
