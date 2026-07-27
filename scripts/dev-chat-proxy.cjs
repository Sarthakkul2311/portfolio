/**
 * Local Groq proxy for development (keeps API key off the public site).
 *
 * Usage:
 *   node scripts/dev-chat-proxy.cjs
 *
 * Reads key from (first match):
 *   1) process.env.GROQ_API_KEY
 *   2) api-key.txt in project root (gitignored)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8787;
const ROOT = path.resolve(__dirname, "..");

function readKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY.trim();
  const keyPath = path.join(ROOT, "api-key.txt");
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, "utf8").trim().split(/\r?\n/)[0].trim();
  }
  return "";
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method !== "POST" || url.pathname.replace(/\/$/, "") !== "/chat") {
    return sendJson(res, 404, { error: "Not found. POST /chat" });
  }

  const apiKey = readKey();
  if (!apiKey) {
    return sendJson(res, 500, {
      error: "Missing Groq API key. Set GROQ_API_KEY or create api-key.txt",
    });
  }

  let raw = "";
  for await (const chunk of req) raw += chunk;

  let payload;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
  const model = typeof payload.model === "string" ? payload.model : "llama-3.3-70b-versatile";

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        messages,
      }),
    });
    const text = await groqRes.text();
    res.writeHead(groqRes.status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(text);
  } catch (err) {
    sendJson(res, 502, {
      error: "Proxy failed",
      detail: String(err && err.message ? err.message : err),
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Chat proxy ready at http://127.0.0.1:" + PORT + "/chat");
  console.log("Keep this running while testing the portfolio chatbot locally.");
});
