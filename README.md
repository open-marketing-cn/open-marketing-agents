# Open Marketing Agents

> 面向中国市场营销人的本地 Agent 目录与安装器。

Open Marketing Agents 按照 **Insights → Strategy → Creation → Adaptation → Delivery → Performance** 整理营销 Agent 和 Skill，帮助使用者了解每项能力需要什么输入、会交付什么、有哪些限制，以及是否经过真实任务验证。

项目由 [Interflow（互通有无）](https://github.com/open-marketing-cn) 发起，目前处于 `v0.1.0-alpha.1`。仓库代码已经公开，但还没有发布可供普通用户安装的正式版本。

## 当前状态

- 6 个营销工作空间；
- 48 个 Agent 候选；
- 40 个 Skill 候选；
- Mac-first 本地桌面应用，可检测 Codex 并管理 Agent 的安装、更新和卸载；
- 第一个完整任务包：[`消费者语言洞察 Agent`](catalog/packages/consumer-language-insight/SKILL.md)；
- 当前可安装 Agent：**0**。

所有候选在完成技术检查和真实从业者验证前都不能安装。

## 营销工作空间

| 工作空间 | 范围 |
|---|---|
| Insights | 市场、消费者、竞品、搜索和平台信息 |
| Strategy | 目标、定位、策略选择和优先级 |
| Creation | 文案、脚本、视觉和内容生产 |
| Adaptation | 不同平台、渠道和人群的内容适配 |
| Delivery | 素材检查、人工确认和上线交付 |
| Performance | 结果记录、复盘和下一轮学习 |

六个工作空间目前用于组织和查找 Agent，不代表营销流程已经自动打通。只有相邻 Agent 都通过真实验证，而且前一个交付物可以稳定成为后一个的输入，才会组成 Workflow。

## Agent 状态

| 状态 | 含义 | 能否安装 |
|---|---|---|
| 共创中 | 正在补齐任务说明、本土化、来源或安全检查 | 否 |
| 待验证 | 安装包和技术测试已完成，等待真实任务验证 | 否 |
| 可安装 | 技术测试和真实从业者脱敏验证均已通过 | 是 |

验证按“内容版本 × 目标工具 × 实际品类”记录，不自动跨版本、工具或品类继承。

## 一个 Agent 必须说明什么

1. 谁在什么营销任务中使用；
2. 需要哪些数据和来源；
3. Agent 会执行什么；
4. 哪些内容不能推断；
5. 会交付哪些文件或字段；
6. 哪一步必须由人确认；
7. 怎样才算验证通过。

缺少必需资料时，Agent 应停止并列出缺口，不能用未经确认的假设补齐事实。

## 本地运行

要求：

- macOS 12 或更高版本；
- Node.js 20 或更高版本；
- Rust stable toolchain；
- 已安装并登录 Codex。

```bash
git clone https://github.com/open-marketing-cn/open-marketing-agents.git
cd open-marketing-agents
npm install
npm run tauri:dev
```

只查看网页界面：

```bash
npm run dev
```

网页预览不会读取本机 Codex，也不会安装任何内容。

运行检查：

```bash
npm run verify
cargo test --manifest-path src-tauri/Cargo.toml
```

构建 Mac 应用：

```bash
npm run tauri:build
```

当前构建尚未完成 Apple Developer ID 签名和公证，不作为正式安装包发布。

## 安装位置

v0.1 只支持把 Agent 安装到 Codex 全局 Skill 目录：

```text
~/.codex/skills/open-marketing-<agent-id>/SKILL.md
```

Agent 依赖的 Skill 默认放在该 Agent 的 `references/skills/` 中。更新或卸载前会校验文件哈希；如果检测到用户修改，会先备份，不会静默覆盖。

## 项目结构

```text
catalog/        Agent 和 Skill 任务包
schemas/        Agent manifest 与运行记录 schema
src/            Svelte 桌面界面
src-tauri/      本地安装器
.github/        Issue、PR 和 CI 配置
docs/           审计与参考资料
```

## 参与贡献

可以提交：

- Agent 或 Skill 提案；
- 脱敏的真实任务验证；
- 数据连接器提案；
- 安装器、界面、测试或文档改进；
- Bug 和安全问题。

提交前请阅读：

- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`GOVERNANCE.md`](GOVERNANCE.md)
- [`SECURITY.md`](SECURITY.md)
- [`DCO.md`](DCO.md)

所有提交都必须保留来源和许可证，只能使用虚构或完成脱敏的测试资料。

## 数据与权限

- 桌面应用不需要模型 Key，Agent 由用户已登录的 Codex 执行；
- 外部数据服务采用 BYOK，凭证保存在用户本机；
- 运行数据默认保存在当前项目的 `.open-marketing/`；
- 不提交客户资料、真实账号、Token、原始媒体、群聊截图或真实商业结果；
- 不自动发布、投放、私信、付款或修改平台后台；
- 品牌判断、策略、创意定稿、预算、发布和效果归因由人确认。

## 来源与许可证

- Agent 目录与安装体验参考 [Agency Agents](https://github.com/msitarzewski/agency-agents)（MIT）；
- 营销 Skill 候选参考 [Marketing Skills](https://github.com/coreyhaines31/marketingskills)（MIT）；
- 注册表、本地优先和能力包思路参考 [Open Design](https://github.com/nexu-io/open-design)（Apache-2.0）。

Open Marketing Agents 代码使用 [Apache-2.0](LICENSE)，Agent 卡、Playbook 和方法文档使用 [CC BY 4.0](LICENSE-CONTENT)。第三方来源与修改说明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

---

English summary: Open Marketing Agents is a Mac-first, local registry and installer for China-market marketing Agents. Packages remain blocked until they pass technical checks and anonymized, real-world practitioner validation.
