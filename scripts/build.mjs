import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCT = process.env.FLYBOT_DIR || join(ROOT, 'flybot');
const OUT = process.env.OUT_DIR || join(ROOT, 'site');
const APP = 'https://flybot.hugoxk.online';
const GH = 'https://github.com/ThinkFlowLab/FlyBot';
const DOCS_GH = 'https://github.com/HugoXK/flybot-docs';
const ZH_DIR = join(ROOT, 'translations', 'zh');
const zhFile = (p) => (p.zhFrom === 'product' ? join(PRODUCT, p.zh) : join(ZH_DIR, p.zh));

const PAGE_DEFS = [
  { slug: '', en: 'README.md', zh: 'README.zh.md', zhFrom: 'product', groupEn: 'Overview', groupZh: '概览', titleEn: 'FlyBot', titleZh: 'FlyBot 文档' },
  { slug: 'docker', en: 'docs/docker.md', zh: 'docs/docker.zh.md', zhFrom: 'product', groupEn: 'Run', groupZh: '运行' },
  { slug: 'sandbox', en: 'docs/sandbox.md', zh: 'sandbox.md', groupEn: 'Run', groupZh: '运行' },
  { slug: 'deepseek-api-key', en: 'docs/deepseek-api-key.md', groupEn: 'Run', groupZh: '英文参考', labelZh: '配置 DeepSeek API Key' },
  { slug: 'integrating', en: 'docs/integrating.md', zh: 'integrating.md', groupEn: 'Run', groupZh: '运行' },
  { slug: 'architecture', en: 'docs/architecture.md', zh: 'architecture.md', groupEn: 'Understand', groupZh: '理解' },
  { slug: 'reference', en: 'docs/reference.md', zh: 'reference.md', groupEn: 'Understand', groupZh: '理解' },
  { slug: 'code-standards', en: 'docs/code-standards.md', zh: 'code-standards.md', groupEn: 'Understand', groupZh: '理解' },
  { slug: 'autonomous-dev', en: 'docs/autonomous-dev.md', zh: 'autonomous-dev.md', groupEn: 'Understand', groupZh: '理解' },
  { slug: 'controller', en: 'docs/controller.md', zh: 'controller.md', groupEn: 'Understand', groupZh: '理解' },
  { slug: 'known-issues', en: 'docs/known-issues.md', zh: 'docs/known-issues.zh.md', zhFrom: 'product', groupEn: 'Understand', groupZh: '理解' },
];

const GROUPS_EN = ['Overview', 'Run', 'Understand', 'Subsystems', 'Interop', 'Testing', 'Reports', 'Design & operations'];
const GROUPS_ZH = ['概览', '运行', '理解', '英文参考'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (p) => readFileSync(p, 'utf8');
const titleOf = (md, fallback) => (md.match(/^#\s+(.+)$/m)?.[1] || fallback).replace(/[*_`]/g, '').trim();

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.md')) acc.push('docs/' + relative(join(PRODUCT, 'docs'), p).split(sep).join('/'));
  }
  return acc;
}

function collectPages() {
  const known = new Map(PAGE_DEFS.map((p) => [p.en, p]));
  const pages = PAGE_DEFS.map((p) => ({ ...p }));
  const extra = [];
  for (const en of walk(join(PRODUCT, 'docs'))) {
    if (known.has(en)) continue;
    let slug = en.replace(/^docs\//, '').replace(/\.md$/, '').replace(/^README$/, '');
    if (slug.endsWith('/README')) slug = slug.slice(0, -7);
    let groupEn = 'Design & operations';
    if (en.startsWith('docs/subsystems/')) groupEn = 'Subsystems';
    else if (en.startsWith('docs/interop/')) groupEn = 'Interop';
    else if (en.startsWith('docs/testing/')) groupEn = 'Testing';
    else if (en.startsWith('docs/reports/')) groupEn = 'Reports';
    if (!en.endsWith('.zh.md') && en !== 'docs/README.md') extra.push({ slug, en, groupEn, groupZh: '英文参考' });
  }
  return [...pages, ...extra];
}

function rewriteRaw(s, lang, sourcePath) {
  const dir = posix.dirname(sourcePath);
  return s.replace(/(href|src)="([^"]+)"/g, (match, attr, value) => {
    if (/^(https?:|mailto:|#|\/|data:)/.test(value)) return match;
    const at = value.indexOf('#');
    const hash = at === -1 ? '' : value.slice(at);
    const raw = at === -1 ? value : value.slice(0, at);
    if (!raw) return match;
    if (attr === 'src' || /\.(svg|png|jpe?g|webp|gif)$/i.test(raw)) {
      if (/^(?:\.\.\/)?docs\/assets\//.test(raw)) {
        const file = raw.replace(/^(?:\.\.\/)?docs\/assets\//, '');
        return `${attr}="/assets/docs-assets/${file}${hash}"`;
      }
      if (/(?:^|\/)images\//.test(raw)) {
        const file = raw.replace(/^(?:\.\.\/)?docs\/images\//, '').replace(/^images\//, '');
        return `${attr}="/assets/images/${file}${hash}"`;
      }
      return match;
    }
    const resolved = posix.normalize(posix.join(dir, raw)).replace(/^\.\//, '');
    if (resolved.startsWith('docs/') && resolved.endsWith('.md')) {
      const slug = resolved.replace(/^docs\//, '').replace(/\.md$/, '').replace(/^README$/, '');
      if (lang === 'zh' && ZH_URL.has(slug)) return `${attr}="${ZH_URL.get(slug)}${hash}"`;
      return `${attr}="${EN_URL.get(resolved) || `/docs/${slug}/`}${hash}"`;
    }
    if (resolved === 'README.md') return `${attr}="${lang === 'zh' ? '/zh/' : '/'}${hash}"`;
    if (resolved === 'README.zh.md') return `${attr}="/zh/${hash}"`;
    if (existsSync(join(PRODUCT, resolved))) return `${attr}="${GH}/blob/main/${resolved}${hash}"`;
    return match;
  });
}

function rewrite(md, lang, sourcePath) {
  let s = md.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (match, target, title = '') => {
    if (/^(https?:|mailto:|#|data:)/.test(target)) return match;
    const at = target.indexOf('#');
    const hash = at === -1 ? '' : target.slice(at);
    const raw = at === -1 ? target : target.slice(0, at);
    if (!raw) return match;
    if (/^(?:\.\.\/)?docs\/assets\//.test(raw)) {
      const file = raw.replace(/^(?:\.\.\/)?docs\/assets\//, '');
      return `](/assets/docs-assets/${file}${hash}${title})`;
    }
    if (/(?:^|\/)images\//.test(raw)) {
      const file = raw.replace(/^(?:\.\.\/)?docs\/images\//, '').replace(/^images\//, '');
      return `](/assets/images/${file}${hash}${title})`;
    }
    const resolved = posix.normalize(posix.join(posix.dirname(sourcePath), raw)).replace(/^\.\//, '');
    if (resolved.startsWith('docs/') && resolved.endsWith('.md')) {
      const slug = resolved.replace(/^docs\//, '').replace(/\.md$/, '').replace(/^README$/, '');
      if (lang === 'zh' && ZH_URL.has(slug)) return `](${ZH_URL.get(slug)}${hash}${title})`;
      return `](${EN_URL.get(resolved) || `/docs/${slug}/`}${hash}${title})`;
    }
    if (resolved === 'README.md') return `](${lang === 'zh' ? '/zh/' : '/'}${hash}${title})`;
    if (resolved === 'README.zh.md') return `](/zh/${hash}${title})`;
    if (existsSync(join(PRODUCT, resolved))) return `](${GH}/blob/main/${resolved}${hash}${title})`;
    return match;
  });
  return rewriteRaw(s, lang, sourcePath);
}

function nav(lang, current) {
  const groups = lang === 'zh' ? GROUPS_ZH : GROUPS_EN;
  const labels = {
    zh: { '概览': '概览', '开始': '开始', '理解': '理解', '运维': '运维', '英文参考': '英文参考' },
    en: { 'Overview': 'Overview', 'Run': 'Run', 'Understand': 'Understand', 'Subsystems': 'Subsystems', 'Interop': 'Interop', 'Testing': 'Testing', 'Reports': 'Reports', 'Design & operations': 'Design & operations' },
  };
  const out = [];
  for (const group of groups) {
    const refSlugs = ['deepseek-api-key', 'governance', 'release-runbook', 'testing-layers'];
    const pool = lang === 'zh' && group === '英文参考'
      ? PAGES.filter((p) => refSlugs.includes(p.slug))
      : PAGES.filter((p) => (lang === 'zh' ? p.groupZh === group : p.groupEn === group)).filter((p) => (lang === 'en' ? true : group === '英文参考' || p.zh));
    const items = pool
      .map((p) => {
        const zhRef = { 'deepseek-api-key': '配置 DeepSeek API Key', governance: '治理', 'release-runbook': '发布运行手册', 'testing-layers': '测试层级' };
        const title = lang === 'zh' && p.zh ? p.titleZh || titleOf(read(zhFile(p)), p.slug) : (lang === 'zh' ? zhRef[p.slug] || p.titleEn : p.titleEn) || titleOf(read(join(PRODUCT, p.en)), p.slug);
        const href = lang === 'zh' && group !== '英文参考' && p.zh ? `/zh${p.slug ? `/docs/${p.slug}/` : '/'}` : `${p.slug ? `/docs/${p.slug}/` : '/'}`;
        const active = href === current ? ' class="on"' : '';
        const mark = lang === 'zh' && group === '英文参考' ? ' <span class="en-mark">EN</span>' : '';
        return `<a${active} href="${href}">${esc(title)}${mark}</a>`;
      }).join('');
    if (items) {
      const more = lang === 'zh' && group === '英文参考' ? `<a href="/docs/architecture/">完整英文文档 <span class="en-mark">EN</span></a>` : '';
      out.push(`<h2>${esc(labels[lang][group] || group)}</h2>${items}${more}`);
    }
  }
  return out.join('');
}

function page({ lang, slug, title, body, description, home = false }) {
  const isZh = lang === 'zh';
  const brand = isZh ? '/zh/' : '/';
  const other = home ? (isZh ? '/' : '/zh/') : (isZh ? `/docs/${slug}/` : (PAGES.find((p) => p.slug === slug)?.zh ? `/zh/docs/${slug}/` : '/zh/'));
  const current = home ? brand : isZh ? `/zh/docs/${slug}/` : `/docs/${slug}/`;
  const navHtml = nav(lang, current);
  return `<!doctype html><html lang="${isZh ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — FlyBot Docs</title><meta name="description" content="${esc(description || 'FlyBot documentation')}"><meta name="theme-color" content="#080a0f">
<link rel="icon" href="/assets/images/logo.svg"><link rel="stylesheet" href="/assets/docs.css"><link rel="stylesheet" href="/assets/demo.css">
<script defer src="/assets/demo.js"></script></head><body>
<header class="site-header"><a class="brand" href="${brand}"><span class="brand-mark">F</span> HUGOXK <small>LAB / FLYBOT DOCS</small></a>
<nav class="nav"><a href="${brand}">${isZh ? '文档首页' : 'Docs home'}</a><a href="${other}">${isZh ? 'English' : '中文'}</a><a href="${APP}">${isZh ? '打开 FlyBot' : 'Open FlyBot'} ↗</a><a href="${GH}">GitHub ↗</a></nav></header>
<div class="docs-shell"><aside class="docs-nav"><h2>FlyBot</h2>${navHtml}<div class="app"><a href="${APP}">${isZh ? '打开 FlyBot' : 'Open FlyBot'} ↗</a><a href="${GH}">${isZh ? '源仓库' : 'Source'} ↗</a></div></aside><main class="docs-main">${body}</main></div>
<footer class="docs-footer"><span>© 2026 HUGOXK // LAB · FLYBOT</span><div><a href="${brand}">${isZh ? '首页' : 'Home'}</a><a href="${APP}">${isZh ? '应用' : 'App'}</a><a href="${GH}">GitHub</a></div></footer></body></html>`;
}

function demoHtml(lang) {
  const zh = lang === 'zh';
  return `<section class="demo" data-demo data-lang="${zh ? 'zh' : 'en'}">
  <div class="demo-head"><div><span class="kicker">${zh ? '浏览器模拟' : 'BROWSER SIMULATION'}</span><h2>${zh ? '看一次 FlyBot 任务如何完成' : 'See one FlyBot task end to end'}</h2><p>${zh ? '从 Chief 分派、Lead 拆分，到 Dev / Test / Reviewer 与合并队列。浏览器内模拟，不调用模型，也不改动仓库。' : 'From a Chief assignment and a Lead split to Dev / Test / Reviewer and the merge queue. A browser simulation; no model calls or repositories are touched.'}</p></div><span class="demo-badge">${zh ? '模拟' : 'SIMULATION'}</span></div>
  <div class="demo-controls"><div class="demo-tabs" role="tablist"><button type="button" class="on" data-scenario="bug">${zh ? '修复缺陷' : 'Bug fix'}</button><button type="button" data-scenario="feature">${zh ? '新增能力' : 'Feature'}</button><button type="button" data-scenario="docs">${zh ? '更新文档' : 'Documentation'}</button></div><div class="demo-actions"><button type="button" class="btn primary" data-demo-start>${zh ? '开始模拟' : 'Start simulation'}</button><button type="button" class="btn" data-demo-reset>${zh ? '重置' : 'Reset'}</button></div></div>
  <div class="demo-chat" data-demo-chat aria-live="polite"><div class="demo-empty">${zh ? '选择场景后开始。' : 'Choose a scenario, then start.'}</div></div>
  <div class="demo-foot"><span>${zh ? '浏览器内模拟 · 不接触模型或仓库' : 'Runs in your browser · no model or repository access'}</span><a href="${zh ? '/zh/docs/architecture/' : '/docs/architecture/'}">${zh ? '阅读架构' : 'Read the architecture'} ↗</a></div>
</section>
<script>window.FLYBOT_DEMO=${JSON.stringify(zh ? {
  bug: { user: '修复 Web 应用的登录重定向循环。', steps: ['Chief 将任务交给 FlyBot Lead，风险等级 T2。', 'Lead 拆分：Dev-1 实现，Test 复现，Reviewer 在 tip 审查。', 'Dev-1 推送修复，测试通过；Test 验证重定向，Reviewer 在 tip 给出 PASS。', '合并队列完成 squash 合并，发布说明已准备。'] },
  feature: { user: '为仓库列表增加“按最近更新排序”。', steps: ['Chief 分派给 FlyBot Lead，风险等级 T2。', 'Lead 拆分：Dev-2 实现接口与界面，Test 覆盖空列表与分页。', 'Dev-2 提交变更；新增测试通过，Reviewer 在 tip 给出 PASS。', '合并队列完成合并；变更进入下一个补丁版本。'] },
  docs: { user: '更新部署文档，说明 sandbox preflight 的退出码。', steps: ['Chief 分派给 FlyBot Lead，风险等级 T1。', 'Lead 指派 Dev-1 更新文档，Test 核对命令与退出码。', '文档更新完成；链接与示例检查通过，Reviewer 在 tip 给出 PASS。', '合并队列完成合并；文档站点随后重建。'] },
} : {
  bug: { user: 'Fix the login redirect loop in the web app.', steps: ['Chief assigned the task to FlyBot Lead. Risk tier: T2.', 'Lead split the work: Dev-1 implements, Test reproduces, Reviewer gates the tip.', 'Dev-1 pushed a patch; tests pass. Test verified the redirect; Reviewer posted PASS at the tip.', 'The merge queue squashed and merged the PR. Release notes are ready.'] },
  feature: { user: 'Add sort-by-recently-updated to the repository list.', steps: ['Chief assigned the task to FlyBot Lead. Risk tier: T2.', 'Lead split the work: Dev-2 implements the API and UI; Test covers empty and paginated lists.', 'Dev-2 pushed the change; the new tests pass and Reviewer posted PASS at the tip.', 'The merge queue merged it; the change ships in the next patch release.'] },
  docs: { user: 'Update the deployment guide for the sandbox preflight exit codes.', steps: ['Chief assigned the task to FlyBot Lead. Risk tier: T1.', 'Lead assigned Dev-1 to update the docs and Test to verify the commands and exit codes.', 'The guide is updated; links and examples pass and Reviewer posted PASS at the tip.', 'The merge queue merged it; the documentation site rebuilds on its schedule.'] },
})};</script>`;
}

const PAGES = collectPages();
const EN_URL = new Map(PAGES.map((p) => [p.en, p.slug ? `/docs/${p.slug}/` : '/']));
const ZH_URL = new Map(PAGES.filter((p) => p.zh).map((p) => [p.slug, p.slug ? `/zh/docs/${p.slug}/` : '/zh/']));

for (const p of PAGES) {
  p.titleEn = p.titleEn || titleOf(read(join(PRODUCT, p.en)), p.slug || 'FlyBot');
  if (p.zh) p.titleZh = p.titleZh || titleOf(read(zhFile(p)), p.titleEn);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets', 'images'), { recursive: true });
mkdirSync(join(OUT, 'docs'), { recursive: true });
mkdirSync(join(OUT, 'zh', 'docs'), { recursive: true });

for (const p of PAGES) {
  const enDir = p.slug ? join(OUT, 'docs', p.slug) : OUT;
  mkdirSync(enDir, { recursive: true });
  const enBody = `<p class="mut" style="margin-bottom:18px"><a href="${GH}/blob/main/${p.en}">Edit ${esc(p.en)} on GitHub ↗</a></p>` + (p.slug === '' ? demoHtml('en') : '') + marked.parse(rewrite(read(join(PRODUCT, p.en)), 'en', p.en));
  writeFileSync(join(enDir, 'index.html'), page({ lang: 'en', slug: p.slug, title: p.titleEn, body: enBody, home: p.slug === '' }));
  if (!p.zh) continue;
  const zhDir = p.slug ? join(OUT, 'zh', 'docs', p.slug) : join(OUT, 'zh');
  mkdirSync(zhDir, { recursive: true });
  const zhEdit = p.zhFrom === 'product' ? `${GH}/blob/main/${p.zh}` : `${DOCS_GH}/blob/main/translations/zh/${p.zh}`;
  const zhLabel = p.zhFrom === 'product' ? p.zh : `translations/zh/${p.zh}`;
  const zhBody = `<p class="mut" style="margin-bottom:18px"><a href="${zhEdit}">在 GitHub 上编辑 ${esc(zhLabel)} ↗</a></p>` + (p.slug === '' ? demoHtml('zh') : '') + marked.parse(rewrite(read(zhFile(p)), 'zh', p.zhFrom === 'product' ? p.zh : `translations/zh/${p.zh}`));
  writeFileSync(join(zhDir, 'index.html'), page({ lang: 'zh', slug: p.slug, title: p.titleZh, body: zhBody, home: p.slug === '' }));
}


function redirect(path, to) {
  const file = join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><title>Redirect</title></head><body><a href="${to}">Continue</a></body></html>`);
}
redirect('docs', '/');
redirect('zh/docs', '/zh/');
redirect('docs/readme.zh', '/zh/');
redirect('docs/docker.zh', '/zh/docs/docker/');
redirect('docs/known-issues.zh', '/zh/docs/known-issues/');

cpSync(join(PRODUCT, 'docs', 'images'), join(OUT, 'assets', 'images'), { recursive: true });
if (existsSync(join(PRODUCT, 'docs', 'assets'))) cpSync(join(PRODUCT, 'docs', 'assets'), join(OUT, 'assets', 'docs-assets'), { recursive: true });
cpSync(join(ROOT, 'docs', 'assets', 'docs.css'), join(OUT, 'assets', 'docs.css'));
cpSync(join(ROOT, 'docs', 'assets', 'demo.css'), join(OUT, 'assets', 'demo.css'));
cpSync(join(ROOT, 'docs', 'assets', 'demo.js'), join(OUT, 'assets', 'demo.js'));
if (existsSync(join(ROOT, 'docs', 'assets', 'images'))) cpSync(join(ROOT, 'docs', 'assets', 'images'), join(OUT, 'assets', 'images'), { recursive: true });
console.log(`built ${PAGES.length} English pages and ${PAGES.filter((p) => p.zh).length} Chinese pages into ${OUT}`);
