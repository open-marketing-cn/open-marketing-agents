# Open Marketing「品牌 0→1 独立 Skill 精选站」V1 计划

## Summary

- V1 只展示 `Skill`，不展示 Agent、Workflow、Connector，也不建设网站内运行平台。
- 每个精选 Skill 都是独立的展示与安装单位：独立卡片、详情页、来源记录和安装入口。
- 0→1 路径只负责导航：洞察研究 → 品牌策略 → 创意内容 → 媒介与上线 → 运营协作。
- Web 体验参考 [ColaSkill](https://colaskill.com/zh/)：中文结果名优先、原作者与 GitHub 来源清楚、安装方式直白。
- 现有 Tauri/Agent 代码暂时保留但不进入 V1 前台；Web 端通过复制安装命令、复制安装提示或下载 ZIP 支持 Codex、Claude Code。

## 独立 Skill 规则

- 一个 Skill 必须能在空白环境中单独安装、单独触发、单独产出，不得要求用户先安装另一个 Skill。
- Skill 可以自带 `references/`、`assets/`、`scripts/`，这些属于同一个安装包，不作为隐藏 Skill 展示。
- Skill 之间只使用 `relatedSkillIds` 做“下一步推荐”，不形成强制依赖或组合安装。
- 0→1 路线不打包成 Workflow；用户可以按阶段逐个选择。
- 现有“消费者语言洞察 Agent”改为独立 Skill，原有来源计划、证据编码等内容合并为它自己的 references。
- 所有公开 Skill 遵循标准 `SKILL.md` 目录结构；每个安装包只暴露一个触发名称。

## 首发目录

V1 精选 20 个独立 Skill，每个工作区 4 个：

- 洞察研究：消费者语言洞察、用户研究、竞品画像、受众与问题定义。
- 品牌策略：品牌上下文、品牌定位、产品营销底稿、首轮 Campaign 策略。
- 创意内容：创意 Brief、营销文案、广告创意、视觉与内容资产。
- 媒介与上线：渠道角色与付费媒体、创意测试、数据追踪、上线检查。
- 运营协作：Campaign 倒排、RACI、内容素材日历、审稿交接与结果复盘。

首发目录之外的 Skill 进入候选库，不因数量、Star 或作者知名度直接上线。

## 外部 Skill 的处理

### 三种公开来源类型

1. `upstream`：推荐上游原版。
   - 不复制 `SKILL.md`。
   - 保存仓库、Skill 路径、Commit SHA、作者、许可证和核验日期。
   - 安装按钮生成上游原版的 Codex/Claude Code 安装命令。
2. `adapted`：中国营销场景改编版。
   - 只有许可证允许时才复制和修改。
   - 在本仓库维护独立 `skills/<slug>/` 安装包。
   - 必须保留上游版权、许可证、原始 Commit、改动说明和中文化范围。
3. `original`：Open Marketing/贡献者原创。
   - 在本仓库维护完整独立安装包。
   - 明确作者与内容许可证，不使用模糊的“官方精选”代替署名。

没有许可证、来源路径不明确或无法确认真实 `SKILL.md` 的候选不公开展示，只留在内部候选记录中。

### 仓库结构

```text
docs/plans/
  brand-zero-to-one-skills-v1.md

catalog/skills/
  <slug>.yaml

skills/
  <slug>/
    SKILL.md
    references/
    assets/
    scripts/
    NOTICE.md
    LICENSE.upstream

catalog/intake/
  <candidate>.yaml

generated/
  registry.json
  updates.json
  search-index.json
```

`catalog/skills/<slug>.yaml` 是网站唯一数据源；外部原版、改编版和原创 Skill 使用同一套展示字段。

## 卡片与详情页设计

### 列表卡片

每张卡片固定展示：

- 中文结果名，例如“把消费者原话整理成洞察卡”。
- 原始 Skill 名，例如 `customer-research`。
- 一句话结果：“你会拿到什么”，不使用抽象角色描述。
- 所属阶段、适合谁、主要交付物。
- 作者头像/名称、GitHub 仓库。
- `原版推荐`、`中国化改编` 或 `Open Marketing 原创` 标签。
- 许可证、最近核验日期、安装验证状态。
- 主按钮“查看怎么用”；通过技术与安装验证后显示“安装”。

GitHub Star 可以展示，但必须带抓取日期，且不使用“高星 = 已验证”的表达。

### 详情页

按普通营销人的阅读顺序固定为：

1. 这个 Skill 帮你完成什么。
2. 适合谁、什么时候用。
3. 使用前需要提供什么。
4. “试试这样说”：3 个可直接复制的中文请求。
5. 你会拿到哪些具体文件、表格或内容。
6. AI 做什么、人必须决定什么。
7. 它不能替你判断什么。
8. 安装到 Codex / Claude Code / 下载 ZIP。
9. 原作者、GitHub、许可证、原始路径、是否改编、改动说明。
10. 技术验证与真实营销任务验证记录。
11. 下一步相关 Skill，仅推荐，不自动安装。

详情页不复制上游的营销宣传；中文介绍必须依据实际 `SKILL.md`，不能扩大能力。

## 数据接口

每个 catalog manifest 至少包含：

- `id`、`titleZh`、`originalName`、`summaryZh`
- `growthStage: zero_to_one`
- `workspace: insights | strategy | creative | media | operations`
- `audiences`、`useCases`、`inputs`、`outputs`
- `promptExamples`、`humanGate`、`cannotInfer`
- `source.type: upstream | adapted | original`
- `source.repo`、`source.path`、`source.commit`
- `source.author`、`source.license`、`source.checkedAt`
- `installation.codex`、`installation.claudeCode`
- `validation.spec`、`validation.installation`、`validation.practice`
- `relatedSkillIds`

公开 manifest 不保留 `kind=agent`、隐藏依赖、Agent 权限包或 Workflow 字段。

## 前端与生成方式

- 保留 SvelteKit 5 + TypeScript + GitHub Pages。
- 删除手写 `SKILLS` 数组和页面内来源映射；构建时从 manifests 生成列表、详情页、统计和搜索索引。
- 首页先展示品牌成长阶段；`0→1` 可进入，`1→10`、`10→∞` 只显示简短定义与“后续开放”。
- 0→1 页面展示五阶段路线，并允许按任务、输出、渠道、来源类型、验证状态筛选。
- Web 安装按钮：
  - 上游原版：复制经过验证的 `npx skills add` 命令。
  - 原创/改编：复制本仓库中该 Skill 的独立安装命令。
  - 仓库维护的原创/改编 Skill：提供独立 ZIP。
- V1 不修改真实广告账户、不连接飞书、不要求登录、不保存模型 Key。
- 现有 Tauri 和 Agent 候选保留为非公开实验代码，本次不扩展。

## 持续收录

1. GitHub 定时搜索和人工投稿只进入 `catalog/intake/`。
2. 自动检查真实 `SKILL.md` 路径、许可证、更新时间、脚本、网络和危险动作。
3. 编辑判断是否属于品牌 0→1，以及是否留下可复用营销资产。
4. 为候选生成中文卡片草稿，但必须人工核对原文后才进入正式目录。
5. 完成 Codex、Claude Code 的独立安装与触发测试。
6. 实际营销人完成脱敏任务后，增加“实战验证”徽章。
7. 上游更新只生成复审提醒，不自动覆盖中文介绍或改编版。
8. 仓库归档、许可证变化、路径失效或权限扩大时自动撤下安装按钮。

## 迁移顺序

1. 将本计划写入仓库计划文件。
2. 建立独立 Skill manifest schema 与生成脚本。
3. 将 `brand-marketing-skills` 的 40 个条目转成候选记录，筛选首发 20 个。
4. 把符合条件的外部条目标记为 `upstream`；不再把全部外部内容描述成“本土化改编”。
5. 将确实需要中国语境改写的少量 Skill 建成独立 `adapted` 安装包。
6. 将消费者语言洞察重构成第一个完整独立 Skill。
7. 重做 SvelteKit 首页、阶段页、卡片和详情页。
8. 发布新 GitHub Pages 后，让个人 `brand-marketing-skills` 页面跳转到正式站点。

## Test Plan

- 每个公开 Skill 都有且只有一个独立 ID、详情页和安装入口。
- 在空白 Codex/Claude Code 环境中单独安装任一 Skill，不需要其他 Skill。
- 删除或不安装 related Skill 时，当前 Skill 仍可完成自己的任务。
- 上游原版安装命令准确指向真实 `SKILL.md`。
- 改编版完整保留许可证、NOTICE、来源 Commit 和改动说明。
- 无许可证、路径失效或技术验证未通过的条目不能显示安装按钮。
- 中文标题、三个示例请求和交付物说明与实际 Skill 内容一致。
- 统计数字全部从 manifest 生成，不再出现页面写 34、源码已有 40 的漂移。
- 搜索、五阶段筛选、Codex/Claude Code 安装选择和移动端页面通过浏览器验证。
- 外部候选更新不会自动覆盖正式目录或执行候选仓库中的脚本。

## Assumptions

- V1 的产品名称使用“Open Marketing Skills / 品牌 0→1 Skill 精选”。
- “精选”表示来源透明、任务明确、独立安装、技术测试通过；“实战验证”作为更高等级单独展示。
- 中文结果名是展示名称，原始 Skill 名、作者和仓库始终紧邻显示。
- 路线只是导航，不创建组合包、自动编排或隐含依赖。
- Agent、Workflow、MCP、DeepSeek Harness、协作平台连接与真实媒介执行全部不在 V1 范围内。

## V1 实施决策

- 公开目录固定为 20 个：10 个 `upstream`、2 个 `adapted`、8 个 `original`。
- `cofoundy/brand-skills` 的上游原版围绕共享 `brand.yaml` 设计，不符合独立安装规则；仅在 MIT 许可下将 `brand-context`、`brand-positioning` 重写为不依赖其他 Skill 的独立中文版本。
- “可安装”由规范检查和 Codex/Claude Code 安装检查共同决定；“实战验证”单独展示，不冒充已完成。
- 上游原版不复制进仓库；只有本仓库维护的原创和改编版生成独立 ZIP。
- 原 Agent 商店数据、Tauri 桌面实验与旧 package 保留为非公开兼容代码，前台不再引用。
