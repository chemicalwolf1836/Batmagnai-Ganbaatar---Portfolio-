// Vercel Edge Function — proxies the Groq API so the API key stays server-side.
// The browser POSTs { cv, job, type }; we stream the model's tokens straight back.
//
// Setup: add GROQ_API_KEY in the Vercel project (Settings → Environment Variables).
// Get a free key at https://console.groq.com/keys

export const config = { runtime: "edge" };

const MODEL = "llama-3.3-70b-versatile";

// One focused system prompt per output type.
const PROMPTS = {
  cover:
    "You are an expert career writer. Using the candidate's CV and the job description, write a tailored cover letter of 250–350 words. Be specific and grounded in the CV — no clichés, no placeholders like [Company]. Output only the letter.",
  cv:
    "You are a resume coach. Give 5–8 specific, actionable suggestions to improve the candidate's CV for this exact role. Reference concrete items from their CV and the job's requirements. Use short Markdown bullet points.",
  skills:
    "You are a hiring analyst. Compare the CV to the job description. First list the candidate's strong matches, then the top skill gaps with a concrete way to close each. Use brief Markdown sections and bullets.",
  interview:
    "You are an interview coach. Generate 6–8 likely, role-specific interview questions based on the CV and job description. Use a Markdown numbered list. Add a one-line tip under each question.",
  salary:
    "You are a compensation analyst. Estimate a realistic salary range for this role (infer location/seniority from the job description). State the range clearly, then 2–3 bullets on what moves a candidate within it. Note that it is an estimate.",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return new Response(
      "The tool isn't configured yet — GROQ_API_KEY is missing in Vercel.",
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const job = (body.job || "").trim();
  const cv = (body.cv || "").slice(0, 12000); // keep the prompt a sane size
  const type = body.type in PROMPTS ? body.type : "cover";

  if (!job) {
    return new Response("Paste a job description first.", { status: 400 });
  }

  const userMsg =
    `JOB DESCRIPTION:\n${job}\n\n---\n\nCANDIDATE CV:\n${cv || "(no CV provided)"}`;

  const upstream = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.7,
        messages: [
          { role: "system", content: PROMPTS[type] },
          { role: "user", content: userMsg },
        ],
      }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`Upstream error (${upstream.status}). ${detail}`, {
      status: 502,
    });
  }

  // Pass Groq's OpenAI-style SSE stream straight through; the browser parses it.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
