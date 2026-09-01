# 参与 Open Marketing Skills

我们收的是能独立完成一个品牌 0→1 营销任务的 Skill，不是提示词收藏、Agent 角色列表或自动化流程。

非技术贡献者不需要使用 GitHub：可以从 README 的飞书入口推荐、认领或提交案例。以下内容面向维护目录数据、脚本和网站的贡献者。

## 投稿先进入候选库

1. 新建 `catalog/intake/<candidate>.yaml` 或提交候选 Issue。
2. 提供真实 GitHub 仓库、`SKILL.md` 路径、作者、许可证和核验日期。
3. 说明它对应洞察、策略、创意、媒介或运营中的哪一个具体任务。
4. 自动检查只读取文本、目录和许可证，不执行候选仓库脚本。
5. 维护者人工核对原文，确认没有扩大能力。
6. 完成 Codex 与 Claude Code 的单独安装和触发测试。
7. 通过 PR 才能从 `catalog/intake/` 进入 `catalog/skills/`。

GitHub Star、下载量、作者知名度和自动安全评分都不能替代人工判断。

## 公开 Skill 最低要求

- 一个目录只暴露一个小写连字符触发名；
- 能在空白环境中单独安装、单独触发、单独产出；
- 不要求用户预先安装另一个 Skill；
- 明确受众、使用场景、输入和具体交付文件；
- 有三个与实际能力一致的中文请求示例；
- 区分 AI 动作、人工决定和不能推断的内容；
- `relatedSkillIds` 只能推荐，不得成为运行前置条件；
- 不自动发布、投放、付款、私信或修改真实营销账户；
- 使用脱敏或虚构测试材料。

## 三种来源

### upstream

推荐原作者版本。不复制 `SKILL.md`，manifest 必须锁定仓库、路径、Commit、作者、许可证和核验日期。

### adapted

只有许可证允许时才能复制修改。必须提供：

- `skills/<id>/SKILL.md`；
- `NOTICE.md`；
- `LICENSE.upstream`；
- 上游 Skill 名、仓库、路径、Commit；
- 中文化范围和实际改动；
- 移除的共享依赖与独立性说明。

### original

由 Open Marketing 或贡献者原创。必须明确作者与内容许可证，不能用“官方精选”隐藏署名。

没有许可证、路径无法确认或只剩网页宣传的候选只能留在 intake。

## 验证分层

- `spec`：目录、字段、内容边界和来源通过检查；
- `installation`：在空白 Codex 与 Claude Code 中只安装当前 Skill 并成功触发；
- `practice`：真实营销人用脱敏任务确认交付物对工作有用。

规范与安装通过后可以开放安装；实战徽章必须等真实任务完成，不能用作者自测、截图或页面状态代替。

目录同时记录五级实践状态：`discovered`、`source_verified`、`practiced`、`replicated`、`best_practice`。只有 `practiced` 及以上并通过人工复核的条目，才计入每月“好用 Skill”。

同类选择使用以下结构化字段：

- `categoryId`：具体任务赛道，例如 `presentation-generation`；
- `comparisonGroupId`：进入哪个同任务横评页，例如 `ppt`；没有可比较对象时留空；
- `methodType`：工作方式，例如“受控设计型”或“参考驱动型”；
- `comparisonProfile`：上手门槛、稳定性、自由度、操作者依赖、素材依赖、工作流完整度；
- `comparisonEvidence`：结论的证据类型、摘要、来源链接和核验日期。

比较结论必须标注 `publisher`、`maintainer_test`、`community_case` 或 `inference`，不得把项目方描述或待验证推断写成维护者实测。

## 本地检查

```bash
npm run catalog:generate
npm run verify
```

## 数据与目录结构

`catalog/skills/<id>.yaml` 是公开网站唯一数据源；`catalog/intake/` 保存候选和发现信号。生成器会输出 `generated/registry.json`、`generated/search-index.json`、`generated/updates.json`，本地维护的 Skill 还会生成 ZIP。

```text
catalog/skills/       公开与暂停的 manifest
catalog/intake/       候选与外部发现记录
skills/               本仓库维护的独立 Skill 包
generated/            构建生成的注册表、更新和搜索数据
schemas/              manifest schema
src/                  SvelteKit 网站
scripts/              目录生成、安全、评判与上游核验
docs/                 评判、实践和维护者资料
```

要求 Node.js 20 或更高版本：

```bash
npm install
npm run dev
```

PR 必须写明实际运行结果。所有提交使用 DCO：

```bash
git commit -s -m "feat: add ..."
```

禁止提交真实姓名、头像、昵称、群聊截图、账号 ID、Token、客户路径、内部报告、合同、原始媒体或可识别的销售与投放结果。
