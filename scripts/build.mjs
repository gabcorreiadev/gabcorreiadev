#!/usr/bin/env node
/**
 * Gera os cards SVG do README (tema claro e escuro).
 *
 *   node scripts/build.mjs          -> busca números reais (precisa de GITHUB_TOKEN)
 *   node scripts/build.mjs --mock   -> usa dados de exemplo (só para pré-visualizar)
 *
 * Sem dependências: só Node 20+.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
const USER = process.env.GH_USER || process.env.GITHUB_REPOSITORY_OWNER || "gabcorreiadev";
const TOKEN = process.env.GITHUB_TOKEN;
const MOCK = process.argv.includes("--mock");
const W = 840;

/* ───────────────────────── conteúdo ───────────────────────── */

const PROFILE = {
  name: "Gabriel Correia Reis",
  prompt: "$ whoami",
  roles: [
    "Desenvolvedor Front-End Jr na Be.Aliant",
    "Interfaces com olhar de UI/UX",
    "Sistemas para Internet · turma de 2026",
  ],
  tags: "front-end  ·  ui/ux  ·  angular  ·  react  ·  typescript",
};

const TIMELINE = [
  { when: "2023", title: "SENAI Barueri", lines: ["Curso de Web Front-End", "onde tudo começou, aos 18"] },
  { when: "set/2023", title: "Paynet", lines: ["Front-End &", "UX Designer"] },
  { when: "ago/2024", title: "Revizia", lines: ["Estágio Front-End", "Angular + TypeScript"] },
  { when: "fev/2026 → hoje", title: "Be.Aliant", lines: ["Dev Front-End Jr", "web para clientes"], current: true },
  { when: "dez/2026", title: "Estácio", lines: ["Tecnólogo em", "Sistemas para Internet"], future: true },
];

const STACK = [
  {
    label: "no dia a dia",
    items: [
      ["HTML", "#e34c26"], ["CSS", "#663399"], ["SCSS", "#c6538c"], ["JavaScript", "#f1e05a"],
      ["TypeScript", "#3178c6"], ["Angular", "#dd0031"], ["React", "#61dafb"], ["Figma", "#a259ff"], ["Git", "#f05032"],
    ],
  },
  {
    label: "estudando agora",
    items: [
      ["Next.js", "@text"], ["Node.js", "#5fa04e"], ["NestJS", "#e0234e"], ["PostgreSQL", "#4169e1"],
      ["Prisma", "#5a67d8"], ["GSAP", "#88ce02"], ["Vite", "#9135ff"],
    ],
  },
];

/* ───────────────────────── temas ───────────────────────── */

const THEMES = {
  dark: {
    bg1: "#07120b", bg2: "#0d1117", card: "#0d1117", border: "#1e2a23", grid: "#3fb950",
    text: "#e6edf3", muted: "#8b949e", faint: "#30363d", accent: "#3fb950", accent2: "#56d364", glow: 0.32,
    chip: "#111a14", heat: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  },
  light: {
    bg1: "#f2fbf4", bg2: "#ffffff", card: "#ffffff", border: "#d0d7de", grid: "#1a7f37",
    text: "#1f2328", muted: "#59636e", faint: "#d8dee4", accent: "#1a7f37", accent2: "#2da44e", glow: 0.16,
    chip: "#f6f8fa", heat: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  },
};

const SANS = `'Segoe UI', Inter, -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif`;
const MONO = `'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function svg(h, t, body, css = "", title = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .in{opacity:0;animation:fadeUp .7s ease-out forwards}
  ${css}
  @media (prefers-reduced-motion: reduce){*{animation:none!important;opacity:1!important}}
</style>
<rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="16" fill="${t.card}" stroke="${t.border}"/>
${body}
</svg>`;
}

const sectionTitle = (t, label, x = 40, y = 44) =>
  `<text x="${x}" y="${y}" class="mono" font-size="13" fill="${t.accent}">// <tspan fill="${t.text}" font-weight="600">${esc(label)}</tspan></text>`;

/* ───────────────────────── header ───────────────────────── */

function header(t) {
  const H = 250;
  // grade de contribuições decorativa com "onda" pulsando
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const cols = 11, rows = 7, s = 15, gap = 5, gx = 560, gy = 52;
  let cells = "";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const lvl = Math.min(4, Math.floor(rnd() * 5 + c / 6));
      const d = ((c + r) * 0.12).toFixed(2);
      cells += `<rect class="cell" style="animation-delay:${d}s" x="${gx + c * (s + gap)}" y="${gy + r * (s + gap)}" width="${s}" height="${s}" rx="3.5" fill="${t.heat[lvl]}"/>`;
    }
  }
  const roles = PROFILE.roles
    .map((r, i) => `<text class="role sans" style="animation-delay:${i * 3}s" x="64" y="168" font-size="18" fill="${t.muted}">${esc(r)}</text>`)
    .join("");

  const css = `
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .cell{animation:pulse 3.2s ease-in-out infinite}
  @keyframes role{0%{opacity:0;transform:translateY(6px)}4%,30%{opacity:1;transform:translateY(0)}34%,100%{opacity:0;transform:translateY(-6px)}}
  .role{opacity:0;animation:role 9s ease-in-out infinite}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  .caret{animation:blink 1s steps(1) infinite}`;

  const body = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient>
  <radialGradient id="glow" cx="0.78" cy="0.45" r="0.45"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glow}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.grid}" stroke-opacity=".06"/></pattern>
  <clipPath id="type"><rect x="40" y="40" height="30" width="0"><animate attributeName="width" from="0" to="90" dur="1.1s" begin="0.3s" fill="freeze" calcMode="discrete" values="0;13;22;31;40;49;58;67;90" keyTimes="0;.11;.22;.33;.44;.55;.66;.77;1"/></rect></clipPath>
  <clipPath id="r"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
</defs>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</g>
<g clip-path="url(#type)"><text x="44" y="62" class="mono" font-size="15" fill="${t.accent}">${esc(PROFILE.prompt)}</text></g>
<rect class="caret" x="122" y="49" width="8" height="16" fill="${t.accent}"/>
<text class="sans in" style="animation-delay:.5s" x="42" y="124" font-size="44" font-weight="700" fill="${t.text}" letter-spacing="-0.5">${esc(PROFILE.name)}</text>
<circle cx="50" cy="162" r="4" fill="${t.accent}"><animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite"/></circle>
${roles}
<line x1="44" y1="194" x2="500" y2="194" stroke="${t.faint}"/>
<text class="mono in" style="animation-delay:.9s" x="44" y="220" font-size="12.5" fill="${t.muted}">${esc(PROFILE.tags)}</text>
${cells}`;
  return svg(H, t, body, css, `${PROFILE.name} — Desenvolvedor Front-End`);
}

/* ───────────────────────── trajetória ───────────────────────── */

function timeline(t) {
  const H = 236, y = 104, n = TIMELINE.length;
  const step = (W - 80) / n, x0 = 40 + step / 2;
  const xs = TIMELINE.map((_, i) => x0 + i * step);
  const lastDone = TIMELINE.findIndex((e) => e.current);
  const css = `
  @keyframes draw{to{stroke-dashoffset:0}}
  .prog{stroke-dasharray:${xs[lastDone] - xs[0]};stroke-dashoffset:${xs[lastDone] - xs[0]};animation:draw 2.2s .3s ease-out forwards}
  @keyframes ring{0%{r:7;opacity:.8}100%{r:20;opacity:0}}
  .ring{animation:ring 1.8s ease-out infinite}`;

  let nodes = "";
  TIMELINE.forEach((e, i) => {
    const x = xs[i], d = (0.3 + i * 0.35).toFixed(2);
    const dot = e.future
      ? `<circle cx="${x}" cy="${y}" r="6.5" fill="${t.card}" stroke="${t.muted}" stroke-width="2" stroke-dasharray="3 3"/>`
      : `<circle cx="${x}" cy="${y}" r="7" fill="${t.accent}"/>` +
        (e.current ? `<circle class="ring" cx="${x}" cy="${y}" r="7" fill="none" stroke="${t.accent}" stroke-width="2"/>` : "");
    const sub = e.lines
      .map((l, j) => `<text x="${x}" y="${y + 58 + j * 18}" text-anchor="middle" class="sans" font-size="12.5" fill="${t.muted}">${esc(l)}</text>`)
      .join("");
    nodes += `<g class="in" style="animation-delay:${d}s">
  <text x="${x}" y="${y - 24}" text-anchor="middle" class="mono" font-size="12" fill="${e.future ? t.muted : t.accent}">${esc(e.when)}</text>
  ${dot}
  <text x="${x}" y="${y + 36}" text-anchor="middle" class="sans" font-size="15" font-weight="600" fill="${t.text}">${esc(e.title)}</text>
  ${sub}
</g>`;
  });

  const body = `${sectionTitle(t, "trajetória")}
<line x1="${xs[0]}" y1="${y}" x2="${xs[n - 1]}" y2="${y}" stroke="${t.faint}" stroke-width="2" stroke-dasharray="2 5"/>
<line class="prog" x1="${xs[0]}" y1="${y}" x2="${xs[lastDone]}" y2="${y}" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round"/>
${nodes}`;
  return svg(H, t, body, css, "Trajetória: SENAI Barueri, Paynet, Revizia, Be.Aliant e Estácio");
}

/* ───────────────────────── stack ───────────────────────── */

function stack(t) {
  const chipH = 30, gapX = 7, gapY = 10, maxX = W - 40;
  let y = 78, body = sectionTitle(t, "stack"), k = 0;
  for (const group of STACK) {
    body += `<text x="40" y="${y}" class="mono" font-size="12" fill="${t.muted}">${esc(group.label)}</text>`;
    y += 14;
    let x = 40;
    for (const [name, color] of group.items) {
      const textW = [...name].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? 9 : 7.2), 0);
      const w = Math.round(textW + 32);
      if (x + w > maxX) { x = 40; y += chipH + gapY; }
      const c = color === "@text" ? t.text : color;
      body += `<g class="in" style="animation-delay:${(0.1 + k++ * 0.05).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="${w}" height="${chipH}" rx="15" fill="${t.chip}" stroke="${t.border}"/>
  <circle cx="${x + 13}" cy="${y + chipH / 2}" r="4.5" fill="${c}"/>
  <text x="${x + 22}" y="${y + 19.5}" class="sans" font-size="13" fill="${t.text}">${esc(name)}</text>
</g>`;
      x += w + gapX;
    }
    y += chipH + 34;
  }
  const H = y - 10;
  return svg(H, t, body, "", "Stack: " + STACK.map((g) => g.items.map((i) => i[0]).join(", ")).join(" | "));
}

/* ───────────────────────── números ───────────────────────── */

const fmt = (n) => (n == null ? "—" : new Intl.NumberFormat("pt-BR").format(n));

function stats(t, d) {
  const H = 324;
  const metrics = [
    ["commits", d?.commits], ["pull requests", d?.prs], ["repositórios", d?.repos],
    ["estrelas", d?.stars], ["contribuições/ano", d?.yearContrib], ["maior sequência", d?.longestStreak, "dias"],
  ];
  const colW = (W - 80) / metrics.length;
  let body = sectionTitle(t, "em números");
  body += `<text x="${W - 40}" y="44" text-anchor="end" class="mono" font-size="11.5" fill="${t.muted}">${
    d ? `atualizado em ${esc(d.updated)}` : "aguardando a 1ª execução do workflow"
  }</text>`;

  metrics.forEach(([label, val, unit], i) => {
    const x = 40 + i * colW;
    body += `<g class="in" style="animation-delay:${(0.15 + i * 0.1).toFixed(2)}s">
  <rect x="${x}" y="70" width="22" height="3" rx="1.5" fill="${t.accent}"/>
  <text x="${x}" y="112" class="sans" font-size="30" font-weight="700" fill="${t.text}">${fmt(val)}${
      unit && val != null ? `<tspan font-size="13" font-weight="400" fill="${t.muted}"> ${unit}</tspan>` : ""
    }</text>
  <text x="${x}" y="134" class="mono" font-size="11.5" fill="${t.muted}">${esc(label)}</text>
</g>`;
  });

  body += `<line x1="40" y1="160" x2="${W - 40}" y2="160" stroke="${t.border}"/>`;

  // heatmap
  const cell = 8, pitch = 10, hx = 40, hy = 206;
  body += `<text x="${hx}" y="190" class="mono" font-size="11.5" fill="${t.muted}">últimas 52 semanas${
    d ? ` · sequência atual: <tspan fill="${t.accent}">${fmt(d.currentStreak)} ${d.currentStreak === 1 ? "dia" : "dias"}</tspan>` : ""
  }</text>`;
  const weeks = d?.weeks ?? Array.from({ length: 53 }, () => Array(7).fill(0));
  let heat = "";
  weeks.forEach((wk, c) => {
    wk.forEach((lvl, r) => {
      if (lvl < 0) return;
      heat += `<rect x="${hx + c * pitch}" y="${hy + r * pitch}" width="${cell}" height="${cell}" rx="2" fill="${t.heat[lvl]}"/>`;
    });
  });
  body += `<g class="in" style="animation-delay:.6s">${heat}</g>`;

  // linguagens
  const lx = 612, lw = W - 40 - lx;
  body += `<text x="${lx}" y="190" class="mono" font-size="11.5" fill="${t.muted}">linguagens mais usadas</text>`;
  const langs = d?.languages ?? [];
  if (!langs.length) {
    body += `<text x="${lx}" y="220" class="sans" font-size="12.5" fill="${t.muted}">—</text>`;
  }
  langs.slice(0, 5).forEach((l, i) => {
    const y = 210 + i * 17;
    body += `<g class="in" style="animation-delay:${(0.7 + i * 0.08).toFixed(2)}s">
  <circle cx="${lx + 4}" cy="${y + 3}" r="3.5" fill="${l.color || t.muted}"/>
  <text x="${lx + 14}" y="${y + 7}" class="sans" font-size="12" fill="${t.text}">${esc(l.name)}</text>
  <rect x="${lx + 92}" y="${y + 1}" width="${lw - 132}" height="5" rx="2.5" fill="${t.faint}"/>
  <rect x="${lx + 92}" y="${y + 1}" width="${Math.max(3, ((lw - 132) * l.pct) / 100).toFixed(1)}" height="5" rx="2.5" fill="${l.color || t.accent}"/>
  <text x="${W - 40}" y="${y + 7}" text-anchor="end" class="mono" font-size="11" fill="${t.muted}">${l.pct.toFixed(0)}%</text>
</g>`;
  });

  body += `<text x="40" y="${H - 18}" class="mono" font-size="10.5" fill="${t.muted}" opacity=".8">gerado automaticamente pelo GitHub Actions · dados públicos de @${esc(USER)}</text>`;
  return svg(H, t, body, "", "Estatísticas do GitHub de " + USER);
}

/* ───────────────────────── rodapé ───────────────────────── */

function footer(t) {
  const H = 96;
  // linha de batimento ("na veia")
  const mid = 38;
  const pts = [[40, mid], [330, mid], [350, mid - 4], [362, mid + 6], [378, mid - 26], [394, mid + 18], [406, mid], [500, mid]];
  const path = "M" + pts.map((p) => p.join(" ")).join(" L") + ` L${W - 40} ${mid}`;
  const len = 900;
  const css = `
  @keyframes beat{0%{stroke-dashoffset:${len}}60%,100%{stroke-dashoffset:0}}
  .beat{stroke-dasharray:${len};stroke-dashoffset:${len};animation:beat 3.5s ease-in-out infinite}`;
  const body = `
<path d="${path}" fill="none" stroke="${t.faint}" stroke-width="2"/>
<path class="beat" d="${path}" fill="none" stroke="${t.accent}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
<text x="${W / 2}" y="76" text-anchor="middle" class="mono" font-size="12.5" fill="${t.muted}">feito com café, código e <tspan fill="${t.accent}">♥</tspan> em Jandira, SP</text>`;
  return svg(H, t, body, css, "Feito com café, código e carinho em Jandira, SP");
}

/* ───────────────────────── botões de contato ───────────────────────── */

const BUTTONS = {
  linkedin: { label: "LinkedIn", icon: (c, bg) => `<rect x="16" y="11" width="16" height="16" rx="3.5" fill="${c}"/><text x="24" y="23.5" text-anchor="middle" class="sans" font-size="11" font-weight="700" fill="${bg}">in</text>` },
  email: { label: "E-mail", icon: (c) => `<rect x="16" y="13" width="17" height="12" rx="2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M16.8 14l7.7 6 7.7-6" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>` },
  github: { label: "Repositórios", icon: (c) => `<rect x="16" y="12" width="7" height="7" rx="1.5" fill="${c}"/><rect x="25" y="12" width="7" height="7" rx="1.5" fill="${c}" opacity=".55"/><rect x="16" y="21" width="7" height="7" rx="1.5" fill="${c}" opacity=".55"/><rect x="25" y="21" width="7" height="7" rx="1.5" fill="${c}"/>` },
};

function button(t, key) {
  const b = BUTTONS[key];
  const w = Math.round(b.label.length * 8 + 62), h = 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(b.label)}">
<title>${esc(b.label)}</title>
<style>.sans{font-family:${SANS}}</style>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="19" fill="${t.chip}" stroke="${t.border}"/>
${b.icon(t.accent, t.chip)}
<text x="42" y="24" class="sans" font-size="14" font-weight="600" fill="${t.text}">${esc(b.label)}</text>
</svg>`;
}

/* ───────────────────────── dados do GitHub ───────────────────────── */

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": USER },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function fetchStats() {
  const base = await gql(
    `query($login:String!){ user(login:$login){
      createdAt
      pullRequests{ totalCount }
      allRepos: repositories(ownerAffiliations: OWNER){ totalCount }
      contributionsCollection{ contributionCalendar{ totalContributions
        weeks{ contributionDays{ date contributionCount contributionLevel } } } }
    } }`,
    { login: USER }
  );
  const u = base.user;

  // repositórios próprios (sem forks): estrelas + linguagens
  let stars = 0, cursor = null;
  const langMap = new Map();
  do {
    const r = await gql(
      `query($login:String!,$after:String){ user(login:$login){
        repositories(ownerAffiliations: OWNER, isFork:false, first:100, after:$after){
          pageInfo{ hasNextPage endCursor }
          nodes{ stargazerCount languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name color } } } }
        } } }`,
      { login: USER, after: cursor }
    );
    const page = r.user.repositories;
    for (const repo of page.nodes) {
      stars += repo.stargazerCount;
      for (const e of repo.languages.edges) {
        const cur = langMap.get(e.node.name) || { name: e.node.name, color: e.node.color, size: 0 };
        cur.size += e.size;
        langMap.set(e.node.name, cur);
      }
    }
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  const total = [...langMap.values()].reduce((a, b) => a + b.size, 0) || 1;
  const languages = [...langMap.values()].sort((a, b) => b.size - a.size).slice(0, 5)
    .map((l) => ({ ...l, pct: (l.size * 100) / total }));

  // commits de todos os anos + dias com contribuição (para as sequências)
  const startYear = new Date(u.createdAt).getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  const parts = [];
  for (let y = startYear; y <= nowYear; y++) {
    parts.push(`y${y}: contributionsCollection(from:"${y}-01-01T00:00:00Z", to:"${y}-12-31T23:59:59Z"){
      totalCommitContributions restrictedContributionsCount
      contributionCalendar{ weeks{ contributionDays{ date contributionCount } } } }`);
  }
  const yearly = (await gql(`query($login:String!){ user(login:$login){ ${parts.join("\n")} } }`, { login: USER })).user;
  let commits = 0;
  const days = [];
  for (const k of Object.keys(yearly)) {
    commits += yearly[k].totalCommitContributions;
    for (const w of yearly[k].contributionCalendar.weeks) days.push(...w.contributionDays);
  }
  const byDate = new Map(days.map((x) => [x.date, x.contributionCount]));
  const sorted = [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const today = new Date().toISOString().slice(0, 10);
  let longest = 0, run = 0;
  for (const [, c] of sorted) { run = c > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  // sequência atual: conta para trás a partir de hoje (hoje sem contribuição ainda não quebra a sequência)
  let current = 0;
  const past = sorted.filter(([dt]) => dt <= today).reverse();
  for (let i = 0; i < past.length; i++) {
    if (past[i][1] > 0) current++;
    else if (i === 0 && past[i][0] === today) continue;
    else break;
  }

  const cal = u.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.map((w) => {
    const col = Array(7).fill(-1);
    for (const dd of w.contributionDays) col[new Date(dd.date + "T00:00:00Z").getUTCDay()] = LEVEL[dd.contributionLevel] ?? 0;
    return col;
  });

  return {
    commits, prs: u.pullRequests.totalCount, repos: u.allRepos.totalCount, stars,
    yearContrib: cal.totalContributions, longestStreak: longest, currentStreak: current,
    weeks, languages, updated: new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
  };
}

function mockStats() {
  let s = 3;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const weeks = Array.from({ length: 53 }, (_, c) => Array.from({ length: 7 }, () => (rnd() > 0.72 ? 1 + Math.floor(rnd() * 4) : 0)).map((v, r) => (c === 52 && r > 3 ? -1 : v)));
  return {
    commits: 412, prs: 18, repos: 37, stars: 9, yearContrib: 107, longestStreak: 6, currentStreak: 2, weeks,
    languages: [
      { name: "TypeScript", color: "#3178c6", pct: 41 }, { name: "SCSS", color: "#c6538c", pct: 22 },
      { name: "HTML", color: "#e34c26", pct: 17 }, { name: "CSS", color: "#663399", pct: 12 }, { name: "JavaScript", color: "#f1e05a", pct: 8 },
    ],
    updated: new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " (exemplo)",
  };
}

/* ───────────────────────── main ───────────────────────── */

let data = null;
if (MOCK) data = mockStats();
else if (TOKEN) {
  try { data = await fetchStats(); } catch (e) { console.error("Falha ao buscar estatísticas:", e.message); process.exitCode = 1; }
} else console.warn("GITHUB_TOKEN ausente — card de números gerado sem dados.");

await mkdir(OUT, { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  const files = { header: header(t), timeline: timeline(t), stack: stack(t), footer: footer(t) };
  for (const key of Object.keys(BUTTONS)) files[`btn-${key}`] = button(t, key);
  if (data || !TOKEN) files.stats = stats(t, data); // se a API falhar, mantém o card anterior
  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(OUT, `${name}-${mode}.svg`), content);
  }
}
console.log("SVGs gerados em assets/" + (data ? "" : " (sem dados de estatística)"));
