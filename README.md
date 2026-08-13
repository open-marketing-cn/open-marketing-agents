# Open Marketing

> 面向中国营销人的本地 Agent 商店。挑选、理解并安全地把营销 Agent 安装到 Codex。

Open Marketing 由 Interflow 发起，目前处于 **v0.1 alpha / 私有审计阶段**。它不是一个已经公开发布的 SaaS，也不会代替营销负责人做品牌主张、预算、发布或效果判断。

English summary: Open Marketing is a Mac-first, local Agent registry for Chinese marketing practitioners. It installs audited marketing Agents into Codex while keeping data, credentials, execution and human approvals under the user's control.

## 现在已经有什么

- 六个营销工作空间：洞察研究、营销策略、内容创作、渠道适配、上线交付、结果复盘。
- 48 个 Agent 候选：包含 Open Marketing 首批核心项，以及 [Agency Agents](https://github.com/msitarzewski/agency-agents) 中全部营销和投放候选的中文任务化目录。
- 40 个可选 Skill 候选：来自 [Marketing Skills](https://github.com/coreyhaines31/marketingskills) 的中文任务化目录。
- Codex 检测，以及安全安装、更新、卸载的桌面端机制。
- 第一个深度包：消费者语言洞察 Agent，使用用户自备的 [Just One API](https://justoneapi.com/en) 作为可选公开数据连接器。
- 来源、许可证、权限、缺失资料、人工确认和真实验证记录的统一展示。

## 状态必须看懂

| 状态 | 含义 | 能否安装 |
|---|---|---|
| 共创中 | 已登记来源和任务，仍在本土化、安全检查或补合同 | 否 |
| 待验证 | 技术包已形成，但还没有真实中国营销任务验证 | 否 |
| 可安装 | Codex 技术验证与至少一位真实从业者脱敏验证均通过 | 是 |

当前仓库没有把任何候选标成“可安装”。这是刻意的：首个真实验证完成之前，安装按钮和后端接口都会拒绝安装。

## 为什么不是“一键生成一切”

一个 Open Marketing Agent 必须说明：

1. 谁在什么营销任务中需要它；
2. 用户需要提供哪些数据和来源；
3. Agent 会做什么；
4. 它不能推断什么；
5. 会交付哪些可审阅文件；
6. 哪一步必须由人确认；
7. 怎样才算真实验证通过。

Agent 缺少必需资料时应停止并列出缺口。用户可以明确选择“带假设继续”，但假设、确认时间和输出限制必须留在运行记录中。

## 本地开发（Mac）

要求：

- macOS 12 或更高版本
- Node.js 20 或更高版本
- Rust stable toolchain
- 已安装并登录 Codex（桌面版和 CLI 均支持检测）

```bash
npm install
npm run tauri:dev
```

只检查网页界面：

```bash
npm run dev
```

网页预览不会读取本机 Codex，也不会安装任何内容。

运行全部前端检查：

```bash
npm run verify
```

运行 Rust 安装器测试：

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

构建 Mac 应用：

```bash
npm run tauri:build
```

## Codex 安装位置

v0.1 只支持全局安装：

```text
~/.codex/skills/open-marketing-<agent-id>/SKILL.md
```

Agent 依赖的 Skill 默认放在该 Agent 的 `references/skills/` 中，因此 Codex 顶层技能列表只显示 Agent。只有用户单独安装的 Skill 才会成为顶层技能。

更新或卸载前会校验内容哈希；如果检测到用户修改，Open Marketing 先备份再继续，不静默覆盖。

## 数据和凭证

- Open Marketing 桌面应用不需要模型 Key；Agent 由用户已登录的 Codex 执行。
- 外部数据服务采用 BYOK。Just One API Token 只配置在用户本机的 MCP/环境中。
- Agent 运行数据保存在当前 Codex 项目的 `.open-marketing/`，默认加入 `.gitignore`，一直保留到用户主动删除。
- 不提交客户资料、账号、Token、原始媒体、群聊截图或真实商业结果。
- 不自动发布、投放、私信、付款或修改平台后台。

## 消费者语言洞察 Agent

它只做消费者侧市场情报：消费者原话、痛点、需求、场景、顾虑和期待。它不做市场规模、竞品份额、定价或购买因果判断。

最低数据要求：

- 至少一个公开表达来源；
- 至少一个购买或使用评论来源。

Just One API 的官方文档列出了小红书、抖音、淘宝/天猫、京东、微博、B站等社媒和电商端点，并提供 MCP 的端点发现、schema 检查和调用工具。Agent 不写死端点：每次都先查当前 schema，再让用户确认平台、关键词、样本量和费用边界。

详见 [`catalog/packages/consumer-language-insight/SKILL.md`](catalog/packages/consumer-language-insight/SKILL.md)。

## 开源来源与许可证

- 桌面应用机制与 Agent 目录研究参考 Agency Agents（MIT）。
- 营销 Skill 候选参考 Marketing Skills（MIT）。
- 注册表、来源和安全思路参考 Open Design（Apache-2.0）；未整体复制其产品或代码。
- Open Marketing 代码使用 Apache-2.0；Agent 卡、Playbook 和方法文档使用 CC BY 4.0。

具体归属见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。上游许可证不自动变成 Open Marketing 本土化内容的真实验证背书。

## 共创与验证

正式路径：

```text
群反馈 → 结构化 Issue → Agent 提案 → 脱敏样例 → 安全检查 → Codex 测试 → 真实从业者验证 → 维护者审核 → 合并与署名
```

验证记录公开以下脱敏字段：验证者角色、行业、测试任务、验证日期和结论。验证按“内容版本 × 目标工具 × 实际品类”记录，不能跨版本或跨工具继承。

阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)、[`GOVERNANCE.md`](GOVERNANCE.md) 和 [`SECURITY.md`](SECURITY.md) 后再提交。

## 发布边界

仓库当前在 `open-marketing-cn/open-marketing-workbench` 进行私有审计：检查工作树、完整 Git 历史、构建产物、许可证、安装包和敏感信息。审计通过且至少有一个真实验证 Agent 后，才会转公开并发布 `v0.1.0`。

这份 README 只描述仓库中已经存在的机制；候选数量、共创意向或 GitHub Star 不是产品效果。
