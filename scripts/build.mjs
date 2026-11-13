import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.OUT_DIR || join(ROOT, 'site');
const APP = 'https://flybot.hugoxk.online';
const GH = 'https://github.com/ThinkFlowLab/FlyBot';
const DOCS_GH = 'https://github.com/HugoXK/flybot-docs';
const EN_DIR = join(ROOT, 'content', 'en');
const ZH_DIR = join(ROOT, 'content', 'zh');

const PAGES = [
  { slug: 'overview', groupEn: 'Overview', groupZh: '概览' },
  { slug: 'getting-started', groupEn: 'Getting started', groupZh: '快速开始' },
  { slug: 'architecture', groupEn: 'Concepts', groupZh: '概念' },
  { slug: 'sandbox', groupEn: 'Concepts', groupZh: '概念' },
  { slug: 'development', groupEn: 'Development', groupZh: '开发' },
  { slug: 'controller', groupEn: 'Reference', groupZh: '参考' },
  { slug: 'reference', groupEn: 'Reference', groupZh: '参考' },
];
const GROUPS_EN = ['Overview', 'Getting started', 'Concepts', 'Development', 'Reference'];
const GROUPS_ZH = ['概览', '快速开始', '概念', '开发', '参考'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (p) => readFileSync(p, 'utf8');
const titleOf = (md, fallback) => (md.match(/^#\s+(.+)$/m)?.[1] || fallback).replace(/[*_`]/g, '').trim();
const zhFile = (slug) => join(ZH_DIR, `${slug}.md`);
const enFile = (slug) => join(EN_DIR, `${slug}.md`);

function rewrite(md, lang) {
  let s = md;
  s = s.replace(/\]\((?:\.\/)?([a-z0-9-]+)\.md(#[^)]*)?\)/g, (_m, slug, hash = '') => {
    if (!PAGES.some((p) => p.slug === slug)) return _m;
    return `](${lang === 'zh' ? `/zh/docs/${slug}/` : `/docs/${slug}/`}${hash})`;
  });
  s = s.replace(/(href|src)="(?:\.\/)?([a-z0-9-]+)\.md(#[^"]*)?"/g, (_m, attr, slug, hash = '') => {
    if (!PAGES.some((p) => p.slug === slug)) return _m;
    return `${attr}="${lang === 'zh' ? `/zh/docs/${slug}/` : `/docs/${slug}/`}${hash}"`;
  });
  return s;
}

function nav(lang, current) {
  const groups = lang === 'zh' ? GROUPS_ZH : GROUPS_EN;
  return groups.map((group) => {
    const items = PAGES.filter((p) => (lang === 'zh' ? p.groupZh === group : p.groupEn === group)).map((p) => {
      const md = lang === 'zh' ? read(zhFile(p.slug)) : read(enFile(p.slug));
      const title = titleOf(md, p.slug);
      const href = lang === 'zh' ? (p.slug === 'overview' ? '/zh/' : `/zh/docs/${p.slug}/`) : (p.slug === 'overview' ? '/' : `/docs/${p.slug}/`);
      return `<a class="${href === current ? 'on' : ''}" href="${href}">${esc(title)}</a>`;
    }).join('');
    return `<h2>${esc(group)}</h2>${items}`;
  }).join('');
}

function demoHtml(lang) {
  const zh = lang === 'zh';
  return `<section class="demo demo-team" data-demo data-lang="${zh ? 'zh' : 'en'}">
  <div class="demo-head"><div><span class="kicker">${zh ? '团队房间模拟' : 'TEAM ROOM SIMULATION'}</span><h2>${zh ? '看一次 FlyBot 团队如何接手' : 'See the FlyBot team take one request'}</h2><p>${zh ? '从 Chief 分派、Lead 拆分，到 Dev / Test / Reviewer 与合并队列。团队保留记忆、计划与群聊；浏览器内模拟，不调用模型。' : 'From a Chief assignment and a Lead split to Dev / Test / Reviewer and the merge queue. The team keeps its memory, schedules and group chats; a browser simulation with no model calls.'}</p></div><span class="demo-badge">${zh ? '团队房间' : 'TEAM ROOM'}</span></div>
  <div class="demo-controls"><div class="demo-tabs" role="tablist"><button type="button" class="on" data-scenario="bug">${zh ? '修复缺陷' : 'Bug fix'}</button><button type="button" data-scenario="feature">${zh ? '新增能力' : 'Feature'}</button><button type="button" data-scenario="docs">${zh ? '更新文档' : 'Documentation'}</button></div><div class="demo-actions"><button type="button" class="btn primary" data-demo-start>${zh ? '让团队接手' : 'Start the team'}</button><button type="button" class="btn" data-demo-reset>${zh ? '重置' : 'Reset'}</button></div></div>
  <div class="team"><aside class="team-tree"><div class="team-kicker">${zh ? '团队' : 'TEAM'}</div><div class="tree-node" data-role="Chief">Chief <small>root</small></div><div class="tree-children"><div class="tree-node" data-role="Lead">Lead</div><div class="tree-children"><div class="tree-node" data-role="Dev-1">Dev-1</div><div class="tree-node" data-role="Dev-2">Dev-2</div><div class="tree-node" data-role="Test">Test</div><div class="tree-node" data-role="Reviewer">Reviewer</div></div></div><div class="team-note">${zh ? '持久团队 · 记忆 / 计划 / 群聊' : 'Persistent team · memory / schedules / groups'}</div></aside><div class="team-room" data-demo-chat aria-live="polite"><div class="demo-empty">${zh ? '选择一个场景，然后让团队接手。' : 'Choose a scenario, then let the team take it.'}</div></div></div>
  <div class="team-actions" data-demo-actions></div>
  <div class="demo-foot"><span>${zh ? '浏览器内模拟 · 不接触模型或仓库' : 'Runs in your browser · no model or repository access'}</span><a href="${zh ? '/zh/docs/architecture/' : '/docs/architecture/'}">${zh ? '阅读架构' : 'Read the architecture'} ↗</a></div>
</section>
<script>window.FLYBOT_DEMO=${JSON.stringify(zh ? {
  bug: { request: '修复 Web 应用的登录重定向循环。', nudge: '状态：Dev-1 正在修重定向，Test 会在 Reviewer 审查前验证。', messages: [{role:'Chief',text:'Lead，拆一下。保持仓库约定和当前风险等级。'},{role:'Lead',text:'Dev-1 实现，Test 复现，Reviewer 在 tip 审查。T2。'},{role:'Dev-1',text:'补丁已就绪：src/auth/redirect.ts，测试通过。'},{role:'Test',text:'已复现循环，并用两个重定向用例验证修复。'},{role:'Reviewer',text:'PASS at a1b2c3d。'},{role:'Merge queue',text:'已 squash 合并，发布说明已准备。'}]},
  feature: { request: '为仓库列表增加“按最近更新排序”。', nudge: '状态：Dev-2 在做接口与界面，Test 覆盖列表状态。', messages: [{role:'Chief',text:'Lead，拆一下。这次会改接口和仓库列表。'},{role:'Lead',text:'Dev-2 负责接口与界面，Test 覆盖空列表与分页，Reviewer 在 tip 审查。T2。'},{role:'Dev-2',text:'接口与界面已就绪，补充分页与空状态测试。'},{role:'Test',text:'已验证空列表、单页与多页排序。'},{role:'Reviewer',text:'PASS at b2c3d4e。'},{role:'Merge queue',text:'已合并，进入下一个补丁版本。'}]},
  docs: { request: '更新部署文档，说明 sandbox preflight 的退出码。', nudge: '状态：Dev-1 正在重写 preflight 章节，Test 在核对命令。', messages: [{role:'Chief',text:'Lead，拆一下。这份指南已经过时。'},{role:'Lead',text:'Dev-1 更新指南，Test 核对命令与退出码，Reviewer 在 tip 审查。T1。'},{role:'Dev-1',text:'指南已更新：preflight 退出码与被阻塞主机的说明。'},{role:'Test',text:'在干净 shell 中核对了每条命令与退出码。'},{role:'Reviewer',text:'PASS at c3d4e5f。'},{role:'Merge queue',text:'已合并，文档站点按计划重建。'}]},
} : {
  bug: { request: 'Fix the login redirect loop in the web app.', nudge: 'Status: Dev-1 is patching the redirect; Test will verify before the reviewer gates the tip.', messages: [{role:'Chief',text:'Lead, split this. Keep the repo conventions and the current risk tier.'},{role:'Lead',text:'Dev-1 implements, Test reproduces, Reviewer gates the tip. T2.'},{role:'Dev-1',text:'Patch ready: src/auth/redirect.ts. Tests pass.'},{role:'Test',text:'Reproduced the loop; verified the fix with two redirect cases.'},{role:'Reviewer',text:'PASS at a1b2c3d.'},{role:'Merge queue',text:'Squashed and merged. Release note ready.'}]},
  feature: { request: 'Add sort-by-recently-updated to the repository list.', nudge: 'Status: Dev-2 is on the API and UI; Test is covering the list states.', messages: [{role:'Chief',text:'Lead, split this. It touches the API and the repository list.'},{role:'Lead',text:'Dev-2 owns the API and UI; Test covers empty and paginated lists; Reviewer gates the tip. T2.'},{role:'Dev-2',text:'API and UI ready. Added pagination and empty-state tests.'},{role:'Test',text:'Verified empty, one-page and multi-page lists.'},{role:'Reviewer',text:'PASS at b2c3d4e.'},{role:'Merge queue',text:'Squashed and merged. Ships in the next patch release.'}]},
  docs: { request: 'Update the deployment guide for the sandbox preflight exit codes.', nudge: 'Status: Dev-1 is rewriting the preflight section; Test is checking the commands.', messages: [{role:'Chief',text:'Lead, split this. The guide is outdated.'},{role:'Lead',text:'Dev-1 updates the guide; Test checks the commands and exit codes; Reviewer gates the tip. T1.'},{role:'Dev-1',text:'Guide updated: preflight exit codes and the blocked-host note.'},{role:'Test',text:'Checked every command and exit code in a clean shell.'},{role:'Reviewer',text:'PASS at c3d4e5f.'},{role:'Merge queue',text:'Squashed and merged. The docs site rebuilds on schedule.'}]},
})};</script>`;
}

function page({ lang, slug, title, body, home = false }) {
  const isZh = lang === 'zh';
  const current = home ? (isZh ? '/zh/' : '/') : (isZh ? `/zh/docs/${slug}/` : `/docs/${slug}/`);
  const other = home ? (isZh ? '/' : '/zh/') : (isZh ? `/docs/${slug}/` : `/zh/docs/${slug}/`);
  const brand = isZh ? '/zh/' : '/';
  return `<!doctype html><html lang="${isZh ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — FlyBot Docs</title><meta name="description" content="${esc(title)} — FlyBot documentation"><meta name="theme-color" content="#080a0f">
<link rel="icon" href="/assets/images/logo.svg"><link rel="stylesheet" href="/assets/docs.css"><link rel="stylesheet" href="/assets/demo.css">
<script defer src="/assets/demo.js"></script></head><body>
<header class="site-header"><a class="brand" href="${brand}"><span class="brand-mark">F</span> HUGOXK <small>LAB / FLYBOT DOCS</small></a>
<nav class="nav"><a href="${brand}">${isZh ? '文档首页' : 'Docs home'}</a><a href="${other}">${isZh ? 'English' : '中文'}</a><a href="${APP}">${isZh ? '打开 FlyBot' : 'Open FlyBot'} ↗</a><a href="${GH}">GitHub ↗</a></nav></header>
<div class="docs-shell"><aside class="docs-nav"><h2>FlyBot</h2>${nav(lang, current)}<div class="app"><a href="${APP}">${isZh ? '打开 FlyBot' : 'Open FlyBot'} ↗</a><a href="${GH}">${isZh ? '源仓库' : 'Source'} ↗</a></div></aside><main class="docs-main">${body}</main></div>
<footer class="docs-footer"><span>© 2026 HUGOXK // LAB · FLYBOT</span><div><a href="${brand}">${isZh ? '首页' : 'Home'}</a><a href="${APP}">${isZh ? '应用' : 'App'}</a><a href="${GH}">GitHub</a></div></footer></body></html>`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets', 'images'), { recursive: true });
mkdirSync(join(OUT, 'docs'), { recursive: true });
mkdirSync(join(OUT, 'zh', 'docs'), { recursive: true });

for (const p of PAGES) {
  const enMd = rewrite(read(enFile(p.slug)), 'en');
  const enCut = p.slug === 'overview' ? enMd.indexOf('\n## ') : -1;
  const enIntro = enCut === -1 ? enMd : enMd.slice(0, enCut);
  const enRest = enCut === -1 ? '' : enMd.slice(enCut + 1);
  const enBody = `<p class="mut" style="margin-bottom:18px"><a href="${DOCS_GH}/blob/main/content/en/${p.slug}.md">Edit content/en/${p.slug}.md on GitHub ↗</a></p>` + marked.parse(enIntro) + (p.slug === 'overview' ? demoHtml('en') : '') + marked.parse(enRest);
  const zhMd = rewrite(read(zhFile(p.slug)), 'zh');
  const zhCut = p.slug === 'overview' ? zhMd.indexOf('\n## ') : -1;
  const zhIntro = zhCut === -1 ? zhMd : zhMd.slice(0, zhCut);
  const zhRest = zhCut === -1 ? '' : zhMd.slice(zhCut + 1);
  const zhBody = `<p class="mut" style="margin-bottom:18px"><a href="${DOCS_GH}/blob/main/content/zh/${p.slug}.md">在 GitHub 上编辑 content/zh/${p.slug}.md ↗</a></p>` + marked.parse(zhIntro) + (p.slug === 'overview' ? demoHtml('zh') : '') + marked.parse(zhRest);
  const enTitle = titleOf(read(enFile(p.slug)), p.slug);
  const zhTitle = titleOf(read(zhFile(p.slug)), enTitle);
  const enDir = p.slug === 'overview' ? OUT : join(OUT, 'docs', p.slug);
  const zhDir = p.slug === 'overview' ? join(OUT, 'zh') : join(OUT, 'zh', 'docs', p.slug);
  mkdirSync(enDir, { recursive: true }); mkdirSync(zhDir, { recursive: true });
  writeFileSync(join(enDir, 'index.html'), page({ lang: 'en', slug: p.slug, title: enTitle, body: enBody, home: p.slug === 'overview' }));
  writeFileSync(join(zhDir, 'index.html'), page({ lang: 'zh', slug: p.slug, title: zhTitle, body: zhBody, home: p.slug === 'overview' }));
}

function redirect(path, to) {
  const file = join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><title>Redirect</title></head><body><a href="${to}">Continue</a></body></html>`);
}
for (const [from, to] of [
  ['docs', '/'],
  ['zh/docs', '/zh/'],
  ['docs/readme.zh', '/zh/'],
  ['docs/docker', '/docs/getting-started/'],
  ['docs/docker.zh', '/zh/docs/getting-started/'],
  ['docs/deepseek-api-key', '/docs/getting-started/'],
  ['docs/known-issues', '/docs/reference/'],
  ['docs/known-issues.zh', '/zh/docs/reference/'],
  ['docs/autonomous-dev', '/docs/development/'],
  ['docs/code-standards', '/docs/development/'],
  ['docs/integrating', '/docs/architecture/'],
  ['docs/governance', '/docs/reference/'],
  ['docs/release-runbook', '/docs/reference/'],
  ['docs/testing-layers', '/docs/development/'],
  ['zh/docs/docker', '/zh/docs/getting-started/'],
  ['zh/docs/autonomous-dev', '/zh/docs/development/'],
  ['zh/docs/code-standards', '/zh/docs/development/'],
  ['zh/docs/integrating', '/zh/docs/architecture/'],
]) redirect(from, to);

cpSync(join(ROOT, 'docs', 'assets', 'docs.css'), join(OUT, 'assets', 'docs.css'));
cpSync(join(ROOT, 'docs', 'assets', 'demo.css'), join(OUT, 'assets', 'demo.css'));
cpSync(join(ROOT, 'docs', 'assets', 'demo.js'), join(OUT, 'assets', 'demo.js'));
if (existsSync(join(ROOT, 'docs', 'assets', 'images'))) cpSync(join(ROOT, 'docs', 'assets', 'images'), join(OUT, 'assets', 'images'), { recursive: true });
console.log(`built ${PAGES.length * 2} pages into ${OUT}`);
