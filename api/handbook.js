// Vercel Edge Function — Handbook Generator backend.
// Two modes keep every call short (the browser orchestrates the long run):
//   mode:"outline" → one quick call, returns a JSON array of sections
//   mode:"section" → streams ONE ~1,200-word section grounded in the source
//
// Setup: add GROQ_API_KEY in Vercel (Settings → Environment Variables).

export const config = { runtime: "edge" };

const MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function headers(key) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return new Response(
      "The tool isn't configured yet — GROQ_API_KEY is missing in Vercel.",
      { status: 500 }
    );
  }

  let body;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  const mode = body.mode;
  const topic = (body.topic || "").trim();
  const doc = (body.doc || "").slice(0, 6000); // cap source to keep token usage sane

  if (!topic && !doc) {
    return new Response("Add a topic or upload a document first.", { status: 400 });
  }

  // ---- OUTLINE: one non-streaming call, returns a JSON array of sections ----
  if (mode === "outline") {
    const sys =
      'You are a documentation architect. Design a handbook outline of 6 to 8 sections ' +
      'for the given topic and source material. Respond with ONLY a JSON array (no markdown, ' +
      'no prose) of objects like {"title":"...","scope":"one short line"}. Sections must be ' +
      'logically ordered and non-overlapping, covering the topic end to end.';
    const user =
      `TOPIC: ${topic || "(infer a sensible handbook topic from the source)"}\n\n` +
      `SOURCE MATERIAL:\n${doc || "(none provided — use general best practices for the topic)"}`;

    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return new Response(`Upstream error (${r.status}). ${t}`, { status: r.status === 429 ? 429 : 502 });
    }

    const data = await r.json();
    let text = data.choices?.[0]?.message?.content || "[]";
    text = text.replace(/```json|```/gi, "").trim();
    const start = text.indexOf("["), end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
    return new Response(text, { headers: { "Content-Type": "application/json; charset=utf-8" } });
  }

  // ---- SECTION: stream ONE section of the handbook ----
  if (mode === "section") {
    const title = (body.title || "Section").trim();
    const scope = (body.scope || "").trim();
    const outline = (body.outline || "").slice(0, 1800);

    const sys =
      "You are writing ONE section of a long-form, structured handbook grounded in the provided " +
      "source material. Write 900–1400 words of clean Markdown for THIS section only. Begin with " +
      "'## ' followed by the section title. Use ### subsections and bullet or numbered lists where " +
      "useful. Be specific and grounded in the source; do not invent policies the source doesn't " +
      "imply. Do NOT write other sections, an intro to the whole document, or a final conclusion.";
    const user =
      `HANDBOOK TOPIC: ${topic || "(from source)"}\n\n` +
      `FULL OUTLINE:\n${outline}\n\n` +
      `WRITE THIS SECTION:\n${title}${scope ? ` — ${scope}` : ""}\n\n` +
      `SOURCE MATERIAL:\n${doc || "(none — use general best practices)"}`;

    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.6,
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      }),
    });

    if (!r.ok || !r.body) {
      const t = await r.text().catch(() => "");
      return new Response(`Upstream error (${r.status}). ${t}`, { status: r.status === 429 ? 429 : 502 });
    }

    return new Response(r.body, {
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  return new Response("Unknown mode", { status: 400 });
}
