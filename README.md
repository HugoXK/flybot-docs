# FlyBot documentation site

Bilingual static documentation for [FlyBot](https://github.com/ThinkFlowLab/FlyBot), published at <https://flybot-docs.hugoxk.online/>.

- English: `/`
- 中文: `/zh/`

English pages are built from `ThinkFlowLab/FlyBot` (`README.md` and `docs/`). Chinese pages use the product's existing Chinese files (`README.zh.md`, `docs/docker.zh.md`, `docs/known-issues.zh.md`) plus the translations in `translations/zh/`. Untranslated reference pages are listed under **英文参考** with an `EN` mark and are never mixed into the Chinese pages.

The landing includes a browser-only FlyBot simulation (Chief → Lead → Dev / Test / Reviewer → merge queue). It makes no model calls and touches no repositories.

## Build

```sh
npm install
FLYBOT_DIR=../FlyBot npm run build
```
