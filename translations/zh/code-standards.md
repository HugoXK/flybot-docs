# FlyBot 代码规范（Agent 验收）

面向 agent 与维护者的简短验收规则。硬性 DSH 规则见 `AGENTS.md` 与 `CONTRIBUTING.md`；有日期的教训写入 `LESSONS.md`，至少三天后再提升到本页。

## 验证者诚实

报告变更状态时：

1. **Tip SHA**：写明确切提交（`git rev-parse HEAD`）。
2. **Ran**：列出你在该 tip 亲自运行过的每条命令与结果。
3. **Not run**：列出未运行的重要检查（smoke、Desktop、真实模型等）。缺少证据是缺口，不是 PASS。
4. **不借信用**：作者声明与其他 SHA 的旧 CI 不是你的结果。
5. **PASS 措辞**：只写证据支持的内容，例如“unit + lint 在 `abc1234` 通过；smoke 未运行”。

## 先失败再修复

- 新的回归测试或断言必须先**在未修复的 tip 上失败**，修复后通过。
- 优先最小 fixture 覆盖一类问题（fence 重组、伪造 header），而不是只匹配一个字符串的样本。
- 明确说明 red 的类型：在 `base` 上红、修复后绿的是**缺陷测试**；在 `base` 上也是绿的是**护栏**。声称修复需要缺陷测试；护栏不算 fail-without-change 证据。

## 修复类，而不是样本

审查或测试发现一条逃逸路径时，修复共享 helper 并覆盖同类标记（`untrusted-message`、`untrusted-file`、可信 header）。同类问题写入 `LESSONS.md` 或本页，不要用特例掩盖。

## 列表同步：软离开、幂等重放

维护成员、名单或在线状态的变更每次都容易踩四个坑：

- **离开是标记，不是删除**：保留记录并设置 `leftSeq`/`leftAt`，实时视图过滤；不要 `filter()` 掉条目，否则下次同步无法区分“离开”和“从未加入”。
- **重新加入清除标记**：匹配旧记录，清掉 `left`，刷新 `joinedSeq`；不要新增第二条记录。
- **同一投递只落一次**：重复消息/事件不能新增行或成员变更；用事件 id 与游标去重，并用 fixture 重放两次验证。
- **缺失字段不是清空**：只对消息显式携带的字段做 diff；未携带的名单保持原样，清空必须显式传值。

## 静默捕获

吞掉错误的 `catch` 必须在块内注释原因或处理；被丢弃结果的 fire-and-forget promise 需要 `void` 或一行原因。`check-empty-catch` 会拒绝裸 `catch {}`；测试 helper 不受生产门禁约束。

## 安全：fence 与远端字符串

- 不可信正文留在 fence 内；闭合标记不能在单次 strip 后被重组。
- 对端控制的显示名、handle、文件名在进入模型可见的可信文本前要清洗；优先 fence。
- 参考 LESSONS（2026-10-14 fence / display names）与 issue #9。

## 只合并已审查的 tip

- **T0/T1** 在必需检查绿色后合并；**T2/T3** 需要同一 tip 的 **PASS**，且 PASS 与绿色 CI 不能互相替代。
- 作者登录名的 review 是 attestation（#644）：结论的 GitHub 登录等于 PR 作者时，`Verdict:` 注释不算；header 需要在空行前写 `Attestation: <完整 40 位 sha> role=<Bot>`，角色不是 PR 的 `Owner:`。
- 一个 tip 只有一个结论；新提交使 PASS 失效；纠正写成 `Correction from <Bot>: …`，不是 verdict。
- 判断合并树：PR 页面绿色只是 head；队列会用当前 `main` 重建合并，以那次运行为准。
- 必需检查：`npm test`、client `--check`、`npm run lint`，以及 `index.js`/`src/host/` 变更时的 smoke。
