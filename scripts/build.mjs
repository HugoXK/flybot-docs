#!/usr/bin/env node
// Build the FlyBot documentation site from ThinkFlowLab/FlyBot docs and README.
// The workflow checks the product repo out next to this repo as ./flybot.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const product = process.env.FLYBOT_DIR || join(root, "flybot");
const out = join(root, "site");
const app = "https://flybot.hugoxk.online";
const gh = "https://github.com/ThinkFlowLab/FlyBot";
if (!existsSync(join(product, "docs"))) { console.error("missing product docs at", product); process.exit(2); }

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const walk = (dir, acc = []) => { for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) walk(p, acc); else if (p.endsWith(".md")) acc.push(p); } return acc; };
const all = walk(join(product, "docs")).map((p) => "docs/" + relative(join(product, "docs"), p).split(sep).join("/"));
const extra = ["README.md", "README.zh.md"].filter((p) => existsSync(join(product, p)));
const files = [...all, ...extra];
const slugOf = (path) => {
  if (path === "README.md") return "";
  if (path === "README.zh.md") return "readme.zh";
  return path.replace(/^docs\//, "").replace(/\.md$/, "").replace(/^README$/, "");
};
const urlOf = (path) => `/docs/${slugOf(path) ? slugOf(path) + "/" : ""}`;
const titleOf = (path, text) => {
  if (path === "README.md") return "FlyBot";
  if (path === "README.zh.md") return "FlyBot 中文";
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/[*_`]/g, "").trim() : path.split("/").pop().replace(/\.md$/, "");
};
const source = (path) => readFileSync(join(product, path), "utf8");
function rewrite(md) {
  let s = md;
  s = s.replace(/\]\((?:\.\/)?docs\/images\//g, "](/assets/images/");
  s = s.replace(/\]\((?:\.\/)?docs\/([^)#]+?)\.md(#[^)]*)?\)/g, (_m, p, hash = "") => `](${urlOf("docs/" + p + ".md")}${hash})`);
  s = s.replace(/\]\((?:\.\/)?README\.md(#[^)]*)?\)/g, (_m, hash = "") => `](${urlOf("README.md")}${hash})`);
  s = s.replace(/\]\((?:\.\/)?README\.zh\.md(#[^)]*)?\)/g, (_m, hash = "") => `](${urlOf("README.zh.md")}${hash})`);
  return s;
}
const groups = [
  ["Overview", ["README.md", "README.zh.md"]],
  ["Run", ["docs/docker.md", "docs/docker.zh.md", "docs/sandbox.md", "docs/deepseek-api-key.md", "docs/integrating.md"]],
  ["Understand", ["docs/architecture.md", "docs/reference.md", "docs/code-standards.md", "docs/autonomous-dev.md", "docs/controller.md", "docs/known-issues.md", "docs/known-issues.zh.md"]],
  ["Subsystems", ["docs/subsystems/README.md", ...all.filter((p) => p.startsWith("docs/subsystems/") && p !== "docs/subsystems/README.md").sort()]],
  ["Interop", all.filter((p) => p.startsWith("docs/interop/")).sort()],
  ["Testing", all.filter((p) => p.startsWith("docs/testing/")).sort()],
];
const titleMap = new Map(files.map((p) => [p, titleOf(p, readFileSync(join(product, p), "utf8"))]));
const navHtml = (current) => groups.map(([group, paths]) => {
  const items = paths.filter((p) => existsSync(join(product, p))).map((p) => `<a class="${p === current ? "on" : ""}" href="${urlOf(p)}">${esc(titleMap.get(p) || p)}</a>`).join("");
  return items ? `<h2>${esc(group)}</h2>${items}` : "";
}).join("");
const page = (path, title, description, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — FlyBot Docs</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#080a0f">
<link rel="icon" href="/assets/images/logo.svg"><link rel="stylesheet" href="/assets/docs.css"></head><body>
<header class="site-header"><a class="brand" href="/"><span class="brand-mark">H</span> HUGOXK <small>LAB / FLYBOT DOCS</small></a>
<nav class="nav"><a href="/">Docs home</a><a href="/docs/">Documentation</a><a href="${app}">Open FlyBot ↗</a><a href="https://portal.hugoxk.online/">Console ↗</a><a href="${gh}">GitHub ↗</a></nav></header>
<div class="docs-shell"><aside class="docs-nav"><h2>FlyBot</h2>${navHtml(path)}<div class="app"><a href="${app}">Open FlyBot ↗</a><a href="${gh}">Source ↗</a></div></aside><main class="docs-main">${body}</main></div>
<footer class="docs-footer"><span>© 2026 HUGOXK // LAB · FLYBOT</span><div><a href="/">Home</a><a href="/docs/">Docs</a><a href="${app}">App</a><a href="${gh}">GitHub</a></div></footer></body></html>`;

rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, "docs"), { recursive: true }); mkdirSync(join(out, "assets"), { recursive: true });
cpSync(join(product, "docs/images"), join(out, "assets/images"), { recursive: true });
cpSync(join(root, "docs/assets/docs.css"), join(out, "assets/docs.css"));
for (const path of files) {
  const slug = slugOf(path); const dir = join(out, "docs", slug); mkdirSync(dir, { recursive: true });
  const md = source(path); const title = titleOf(path, md);
  const body = `<p class="mut" style="margin-bottom:18px"><a href="${gh}/blob/main/${path}">Edit ${esc(path)} on GitHub ↗</a></p>` + marked.parse(rewrite(md));
  writeFileSync(join(dir, "index.html"), page(path, title, title, body));
}
const landing = `<span class="kicker">FLYBOT · DOCUMENTATION</span><h1>FlyBot 文档</h1>
<p class="lead">A team of long-lived AI Bots that can split work down a tree, ship code, and chat with your friends' Bots.</p>
<div class="docs-cards">
${[["/docs/", "Overview", "FlyBot 是什么、三个插件、安装与第一次运行。"], ["/docs/architecture/", "Architecture", "核心、插件、事件、Team 与运行方式。"], ["/docs/subsystems/", "Subsystems", "tree、social、timeline、host、client、plugin runtime。"], ["/docs/docker/", "Run it", "Docker、sandbox、模型 key 与集成。"], ["/docs/interop/", "Interop", "Live E2E、room fixture 与协作运行时。"]].map(([h,t,d]) => `<a class="docs-card" href="${h}"><b>${t}</b><span>${d}</span><em>READ ↗</em></a>`).join("")}
</div><h2>Quick links</h2><ul><li><a href="${app}">Open FlyBot</a></li><li><a href="${gh}">Upstream repository</a></li><li><a href="${gh}/tree/main/docs">Documentation sources</a></li></ul>
<p class="mut">This site is built from <code>ThinkFlowLab/FlyBot</code> <code>README.md</code> and <code>docs/</code> on a schedule; no documentation is copied or pinned here.</p>`;
writeFileSync(join(out, "index.html"), page("", "FlyBot 文档", "FlyBot documentation: tree, social and timeline plugins on DeepSeek Harness.", landing));
console.log(`built ${files.length} doc pages -> ${out}`);
