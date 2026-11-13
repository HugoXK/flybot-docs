# FlyBot documentation

Bilingual documentation for [FlyBot](https://github.com/ThinkFlowLab/FlyBot), published at <https://flybot-docs.hugoxk.online/>.

- English: `/`
- 中文: `/zh/`

Every public page exists in both languages with the same sections: `content/en/<slug>.md` and `content/zh/<slug>.md`. The site is a curated introduction and tutorial; deep subsystem and API reference material stays in the FlyBot repository and is linked from the pages.

The landing includes a browser-only FlyBot simulation (Chief → Lead → Dev / Test / Reviewer → merge queue). It makes no model calls and touches no repositories.

## Build

```sh
npm install
npm run build
```

The site is written to `site/`.
