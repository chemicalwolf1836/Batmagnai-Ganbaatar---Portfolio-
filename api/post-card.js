// Vercel Edge Function — renders an on-brand LinkedIn post graphic as a PNG.
//
// Usage:  GET /api/post-card?d=<base64url JSON>
//   JSON shape (all optional, sensible defaults applied):
//   {
//     kicker, title, subtitle,
//     steps:     [{ icon, t, d }, ...],          // up to 3
//     takeaways: [{ l, v, c }, ...],             // up to 4 ; c = "gold" | "green"
//     quote, name, links, pill
//   }
//
// Renders with Satori (no browser needed), so it works in the Edge runtime.
// Design mirrors the dark "Project Breakdown" card style.

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const C = {
  bg: "#0e0e12",
  panel: "rgba(255,255,255,0.028)",
  line: "rgba(255,255,255,0.09)",
  gold: "#c9a24b",
  green: "#8fae97",
  text: "#efece4",
  muted: "#97938a",
};

// Tiny hyperscript helper so we can build the tree without JSX.
// Satori requires every <div> with multiple children to declare display:flex,
// so we default all divs to flex unless the style overrides it.
function h(type, props, ...children) {
  const p = { ...(props || {}) };
  if (type === "div") p.style = { display: "flex", ...(p.style || {}) };
  p.children = children.flat();
  return { type, props: p };
}

// Fonts are fetched once and reused across invocations.
const FONT_URLS = {
  serif: "https://cdn.jsdelivr.net/npm/@fontsource/lora@5/files/lora-latin-400-normal.woff",
  serifBold: "https://cdn.jsdelivr.net/npm/@fontsource/lora@5/files/lora-latin-600-normal.woff",
  mono: "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-500-normal.woff",
};
let fontsPromise;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(FONT_URLS.serif).then((r) => r.arrayBuffer()),
      fetch(FONT_URLS.serifBold).then((r) => r.arrayBuffer()),
      fetch(FONT_URLS.mono).then((r) => r.arrayBuffer()),
    ]).then(([serif, serifBold, mono]) => [
      { name: "Lora", data: serif, weight: 400, style: "normal" },
      { name: "Lora", data: serifBold, weight: 600, style: "normal" },
      { name: "Mono", data: mono, weight: 500, style: "normal" },
    ]);
  }
  return fontsPromise;
}

const DEFAULTS = {
  kicker: "Project Breakdown",
  title: "An AI Travel\nBudget Estimator",
  subtitle: "Turning a single Claude call into a real, daily trip budget.",
  steps: [
    { icon: "🧳", t: "Travel Style", d: "Pick budget, mid-range, or luxury for the trip." },
    { icon: "⚡", t: "Claude API", d: "One structured prompt returns the costs as JSON." },
    { icon: "📊", t: "Daily Breakdown", d: "Stay, food, transport, and extras, per day." },
  ],
  takeaways: [
    { l: "Caching", v: "The same trip never hits the API twice", c: "gold" },
    { l: "Validation", v: "Zod guards every response shape", c: "green" },
    { l: "Reliability", v: "Strip the markdown fences before parsing", c: "gold" },
    { l: "Next time", v: "Reach for structured outputs from day one", c: "green" },
  ],
  quote:
    "The hard part of building with AI is not calling the model. It is making its answer something you can trust.",
  name: "Batmagnai Ganbaatar",
  links: "linkedin.com/in/batmagnai-ganbaatar-025a94211  ·  batmagnai-ganbaatar-portfolio.vercel.app",
  pill: "Next.js + Claude",
};

function decodeData(req) {
  try {
    const b64 = new URL(req.url).searchParams.get("d");
    if (!b64) return DEFAULTS;
    const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(norm), (c) => c.charCodeAt(0))
    );
    return { ...DEFAULTS, ...JSON.parse(json) };
  } catch {
    return DEFAULTS;
  }
}

export default async function handler(req) {
  const d = decodeData(req);
  const fonts = await loadFonts();

  const label = (text) =>
    h("div", {
      style: {
        fontFamily: "Mono",
        fontSize: 16,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: C.muted,
        margin: "40px 0 18px",
      },
    }, text);

  const step = (s, i) =>
    h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: "26px 24px",
      },
    },
      h("div", { style: { fontSize: 30, marginBottom: 16 } }, s.icon || ""),
      h("div", { style: { fontFamily: "Mono", fontSize: 21, color: C.gold, marginBottom: 12 } }, s.t || ""),
      h("div", { style: { fontFamily: "Mono", fontSize: 16, color: C.muted, lineHeight: 1.5 } }, s.d || "")
    );

  const arrow = () =>
    h("div", { style: { display: "flex", alignItems: "center", color: C.muted, fontFamily: "Mono", fontSize: 26, padding: "0 14px" } }, "→");

  const stepsRow = [];
  d.steps.slice(0, 3).forEach((s, i) => {
    if (i > 0) stepsRow.push(arrow());
    stepsRow.push(step(s, i));
  });

  const cell = (c) =>
    h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        width: 455,
        backgroundColor: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: "22px 24px",
      },
    },
      h("div", { style: { fontFamily: "Mono", fontSize: 15, letterSpacing: "0.22em", textTransform: "uppercase", color: c.c === "green" ? C.green : C.gold, marginBottom: 12 } }, c.l || ""),
      h("div", { style: { fontFamily: "Lora", fontSize: 23, color: C.text, lineHeight: 1.35 } }, c.v || "")
    );

  const tree = h("div", {
    style: {
      width: 1080,
      height: 1350,
      display: "flex",
      flexDirection: "column",
      backgroundColor: C.bg,
      backgroundImage: "radial-gradient(1200px 520px at 80% -8%, rgba(201,162,75,0.12), transparent 60%)",
      color: C.text,
      fontFamily: "Lora",
      padding: "74px 76px",
    },
  },
    // kicker
    h("div", { style: { display: "flex", alignItems: "center", marginBottom: 22 } },
      h("div", { style: { width: 34, height: 3, backgroundColor: C.gold, borderRadius: 2, marginRight: 14 } }),
      h("div", { style: { fontFamily: "Mono", fontSize: 18, letterSpacing: "0.32em", textTransform: "uppercase", color: C.gold } }, d.kicker)
    ),
    // headline
    h("div", { style: { fontFamily: "Lora", fontWeight: 600, fontSize: 74, lineHeight: 1.05, letterSpacing: "-0.01em", whiteSpace: "pre-wrap", marginBottom: 18 } }, d.title),
    h("div", { style: { fontFamily: "Lora", fontSize: 27, color: C.muted, lineHeight: 1.4, maxWidth: 780 } }, d.subtitle),

    label("How it works"),
    h("div", { style: { display: "flex", alignItems: "stretch" } }, ...stepsRow),

    label("What the build taught me"),
    h("div", { style: { display: "flex", flexWrap: "wrap", gap: 18 } }, ...d.takeaways.slice(0, 4).map(cell)),

    h("div", { style: { display: "flex", height: 1, backgroundColor: C.line, margin: "40px 0 26px" } }),
    h("div", { style: { display: "flex", borderLeft: `3px solid ${C.gold}`, paddingLeft: 26, fontFamily: "Lora", fontSize: 26, lineHeight: 1.5, color: "#d9d5cc", maxWidth: 900 } }, d.quote),

    // footer pinned to bottom
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 36 } },
      h("div", { style: { display: "flex", flexDirection: "column", flexShrink: 1, minWidth: 0, maxWidth: 700, marginRight: 24 } },
        h("div", { style: { fontFamily: "Lora", fontWeight: 600, fontSize: 30, marginBottom: 10 } }, d.name),
        h("div", { style: { fontFamily: "Mono", fontSize: 15, lineHeight: 1.5, color: C.muted } }, d.links)
      ),
      h("div", { style: { display: "flex", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "Mono", fontSize: 18, letterSpacing: "0.12em", color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 999, padding: "12px 22px" } }, d.pill)
    )
  );

  return new ImageResponse(tree, { width: 1080, height: 1350, fonts });
}
