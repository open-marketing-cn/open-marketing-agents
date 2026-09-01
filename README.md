# Open Marketing Skills

> 面向品牌 0→1 的独立营销 Skill 精选目录。

Open Marketing Skills 按 **洞察研究 → 品牌策略 → 创意内容 → 媒介与上线 → 运营协作** 组织可单独安装的 Agent Skills。网站不在站内运行 AI；它帮助普通营销人先看清输入、交付物、人工决定、来源和验证记录，再复制安装命令到 Codex 或 Claude Code。

## V1 当前状态

- `20` 个公开 Skill，每个阶段 `4` 个；
- `10` 个上游原版推荐、`2` 个中国化改编、`8` 个 Open Marketing 原创；
- `20/20` 已在独立空白目录安装到 Codex 与 Claude Code；
- `0/20` 标记为实战验证，等待真实营销人用脱敏任务复核；
- `40` 个旧目录条目已进入 `catalog/intake/`，不会自动公开；
- V1 不展示 Agent、Workflow、Connector，不登录、不保存模型 Key、不连接真实广告或协作账户。

“技术安装已验证”和“真实营销任务已验证”是两个不同状态，网站会分别展示。

## 五个工作区

| 阶段 | 要回答的问题 | 典型交付 |
|---|---|---|
| 洞察研究 | 人们到底在说什么？ | 原话表、研究摘要、竞品画像、问题定义 |
| 品牌策略 | 我们要为谁占据什么？ | 品牌底稿、定位、营销上下文、首轮 Campaign 策略 |
| 创意内容 | 怎样把策略变成表达？ | 创意 Brief、页面文案、广告变体、图片制作说明 |
| 媒介与上线 | 去哪里、怎么测、何时上？ | 渠道预算、实验方案、追踪计划、发布检查 |
| 运营协作 | 谁在什么时候交付什么？ | 倒排表、RACI、素材日历、交接与复盘 |

路线只是导航。`relatedSkillIds` 只推荐下一步，不会组合安装，也不会形成隐藏依赖。

## 安装一个 Skill

上游原版直接从原作者仓库安装：

```bash
npx skills add coreyhaines31/marketingskills -s customer-research -a codex -y
npx skills add coreyhaines31/marketingskills -s customer-research -a claude-code -y
```

Open Marketing 原创或改编版从本仓库安装：

```bash
npx skills add open-marketing-cn/open-marketing-agents -s consumer-language-insight -a codex -y
npx skills add open-marketing-cn/open-marketing-agents -s consumer-language-insight -a claude-code -y
```

仓库维护的原创和改编版同时提供单 Skill ZIP；上游原版不复制进本仓库。

## 目录为何可信

每个公开 manifest 都必须说明：

1. 中文结果名和真实触发名；
2. 适合谁、什么时候用；
3. 使用前要提供什么；
4. 三个可复制的中文请求；
5. 会交付哪些文件、表格或内容；
6. AI 做什么、人必须决定什么；
7. 不能替用户判断什么；
8. 原作者、仓库、路径、Commit、许可证和核验日期；
9. Codex、Claude Code 与真实营销任务的独立验证记录。

外部内容分三类：

- `upstream`：只推荐原版，不复制 `SKILL.md`；
- `adapted`：许可证允许时维护独立中国化版本，保留 NOTICE、上游许可证、Commit 和改动；
- `original`：Open Marketing 或贡献者原创，明确作者和内容许可证。

没有许可证、找不到真实 `SKILL.md` 或安装失败的候选不会显示安装按钮。

## 数据与生成

`catalog/skills/<id>.yaml` 是公开网站唯一数据源。运行生成器会验证 ID、五阶段、三种来源、三个示例请求、许可证、related ID、独立目录结构和改编版 NOTICE，然后生成：

```text
generated/registry.json
generated/search-index.json
generated/updates.json
static/downloads/<local-skill>.zip
```

前台统计、列表、详情页、筛选和安装状态都来自生成结果，不再维护手写数组。
GitHub Pages 构建时会用当前 `GITHUB_SHA` 填入原创与改编版的发布 Commit；上游原版继续使用人工核验后锁定的上游 Commit。

## 本地开发

要求 Node.js 20 或更高版本：

```bash
git clone https://github.com/open-marketing-cn/open-marketing-agents.git
cd open-marketing-agents
npm install
npm run dev
```

检查与构建：

```bash
npm run verify
```

GitHub Pages 工作流在 `main` 更新后构建静态网站。旧 Tauri 安装器与 Agent 候选代码仍留在仓库作为非公开实验，不进入 V1 前台。

## 项目结构

```text
catalog/skills/       20 个公开 manifest
catalog/intake/       候选与旧目录迁移记录
skills/               本仓库维护的独立 Skill 包
generated/            构建生成的 registry、更新与搜索数据
schemas/              Skill manifest 等 schema
src/                  SvelteKit 5 网站
scripts/              目录生成、安全与上游核验
docs/plans/           产品与开发依据
src-tauri/            非公开桌面实验代码
```

## 参与贡献

先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)、[GOVERNANCE.md](GOVERNANCE.md)、[SECURITY.md](SECURITY.md) 和 [DCO.md](DCO.md)。投稿先进入 `catalog/intake/`，不会因为 Star 或作者知名度直接上线。

仓库代码使用 [Apache-2.0](LICENSE)，Open Marketing 原创内容使用 [CC BY 4.0](LICENSE-CONTENT)；第三方内容保留各自许可证与署名，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
