# 开发

本页是 FlyBot 变更的验收契约。硬性 DSH 规则见 `AGENTS.md` 与 `CONTRIBUTING.md`；有日期的教训写入 `LESSONS.md`，至少三天后再提升到本页。

## 验证者诚实

报告变更状态时：

1. **Tip SHA**：写明确切提交（`git rev-parse HEAD`）。
2. **Ran**：列出你在该 tip 亲自运行过的每条命令与结果。
3. **Not run**：列出未运行的重要检查（smoke、Desktop、真实模型）。缺少证据是缺口，不是 PASS。
4. **不借信用**：作者声明与其他 SHA 的旧 CI 不是你的结果。
5. **PASS 措辞**：只写证据支持的内容，例如“unit + lint 在 `abc1234` 通过；smoke 未运行”。

## 先失败再修复

- 先加回归测试，在未修复的 tip 上运行并确认失败；修复后在新 tip 运行绿色。
- 保留红色与绿色两半证据；审查者会重新验证。
- 测试类，而不是一个样本。明确 red 是**缺陷测试**（base 上红、修复后绿）还是**护栏**（base 上也是绿）。声称修复需要缺陷测试。

## 修复类，而不是样本

审查发现一条逃逸路径时，修复共享 helper 并覆盖同类标记（`untrusted-message`、`untrusted-file`、可信 header）。同类问题写入本页或 `LESSONS.md`，不要用特例掩盖。

## 列表同步

维护成员、名单或在线状态的变更必须显式处理四个坑：

- **离开是标记，不是删除。** 保留记录并设置 `leftSeq`/`leftAt`，实时视图过滤；不要 `filter()` 掉条目。
- **重新加入清除标记。** 匹配旧记录，清掉 `left`，刷新 `joinedSeq`；不要新增第二条记录。
- **同一投递只落一次。** 重复事件不能新增行或成员变更；用 fixture 重放两次验证幂等。
- **缺失字段不是清空。** 只对消息显式携带的字段做 diff；清空必须显式传值。

## 静默捕获与 fence

- 吞掉错误的 `catch` 必须在块内注释原因或处理；`check-empty-catch` 会拒绝裸 `catch {}`。
- 被丢弃结果的 fire-and-forget promise 需要 `void` 或一行原因。
- 不可信正文留在 fence 内；闭合标记不能在单次 strip 后被重组。对端控制的显示名、handle、文件名在进入模型可见的可信文本前要清洗。

## 循环

```
issue → claim → branch/worktree → red test → fix → gates → PR
      → review at the tip → risk tier → merge queue → release
```

1. **Issue。** 从可复现缺陷或明确维护需求开始。先搜索开放与已关闭 issue。报告包含预期/实际行为、最小复现、`file:line` 与环境。
2. **认领。** 跳过已有 assignee 或活跃 claim 的 issue。分配维护者账号，添加 `agent-working`，评论分支与一行计划。
3. **分支与失败测试。** 从最新 `main` 开分支；一个 issue、一个分支、一个 PR。测试类。
4. **门禁。** 在将要链接的确切 tip，于 `core/` 运行：

```sh
npm ci
npm run harness          # 一次性安装测试用的 DSH 包
npm run build
npm test
npm run lint
npm run arch-docs
```

客户端变更还要运行 `node scripts/build-client.mjs --check`；host 变更运行 smoke bench。用户可见变更需要 changelog fragment。

## 合并规则

- **T0/T1** 在必需检查绿色、PR 可合并且符合设计规则时合并。
- **T2/T3** 需要同一 tip 的 **PASS** 与绿色检查。新提交使 PASS 失效。
- 作者登录名的 review 是 attestation：结论的 GitHub 登录等于 PR 作者时，`Verdict:` 注释不算；header 需要写 `Attestation: <完整 40 位 sha> role=<Bot>`。
- 一个 tip 只有一个结论；纠正写成 `Correction from <Bot>: …`。
- 合并队列会用当前 `main` 重建合并；以那次运行为准。
