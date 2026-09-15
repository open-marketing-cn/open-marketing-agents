# Open Marketing

> AI 产品与营销开源实践库：读方法、拿模板、找工具、交流实测。

本站包含深度文章与开源工具两个入口。文章保留背景、实际动作、结果与限制；工具保留作者、许可证及实践状态。

## 首页与主要入口

**[打开 Open Marketing 首页](https://open-marketing-cn.github.io/open-marketing-agents/)**

| 你现在要做什么 | 直接入口 | 可以带走什么 |
|---|---|---|
| 理清产品与营销的下一步 | [实践手册](https://open-marketing-cn.github.io/open-marketing-agents/articles/) | 从需求到增长的四章方法与工作模板 |
| 为具体任务选择 Skill | [开源工具](https://open-marketing-cn.github.io/open-marketing-agents/tools/) | 输入要求、交付物、作者来源、安装方式与实践记录 |
| 看别人推荐了什么 | [推荐广场](https://open-marketing-cn.github.io/open-marketing-agents/recommendations/) · [在 GitHub 阅读](generated/community-recommendations.md) | 具体使用场景、原作者与推荐人 |
| 分享自己实际用过的 Skill | [唯一推荐表单](https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f) | 下一次成功同步后进入站内广场和仓库记录 |

## 这次更新了什么

Open Marketing 从营销 Skill 目录扩展为 **AI 产品与营销开源实践库**：方法、模板、工具与社区经验相互连接。网站帮助独立创作者、品牌运营和小团队从一个真实任务出发，找到下一步和可交接的成果。

这是项目内容与使用路径的升级；当前网页用于阅读、选工具和分享经验，Skill 仍由你自己的 Agent 执行。桌面工作台代码保留在仓库中，但不能据此称网页已具备在线执行能力。

首页负责导航与精选，文章页只展示实践手册，工具页负责完整筛选与同类对比，推荐广场集中展示投稿。公开工具目录已移除候选池入口；内部候选资料保留用于后续复核。

文章源码位于 `content/articles/`。原始嘉宾材料不随站点发布；文章保留方法、场景和限制。既有 `/articles/`、`/tools/`、`/skills/` 与对比详情链接继续有效。

## 为什么使用

- **省去从零找方法的步骤**：按当前问题读章节，带走可填写的模板。
- **先判断工具是否适合**：查看需要什么材料、输出什么、有什么限制，再安装到自己的 Agent。
- **让经验可复用**：分享具体使用场景，后来的人直接在网站或 GitHub 查看。

## 四步使用

1. **按营销任务找 Skill**：先从当前要交付的结果出发，而不是从热度出发。
2. **看同赛道差异和使用前提**：了解每个 Skill 把哪一段工作做深了，再看门槛、稳定性、自由度、操作者与素材依赖。
3. **复制原作者安装方式**：安装状态未通过复测的条目只提供来源，不开放一键复制。
4. **用完回来补实践**：仍用同一个推荐表，补充一个真实、脱敏的使用场景和你的判断。

## 同类差异示例：同样是 PPT Skill，各自做深了什么

| Skill | 它做深的环节 | 工作方式 |
|---|---|---|
| [`guizang-ppt-skill`](https://open-marketing-cn.github.io/open-marketing-agents/skills/guizang-ppt-skill/) | 演讲型 PPT 的快速稳定出稿 | 像一家有招牌风格的设计工作室：约束更多，上手更快，出品更稳定 |
| [`ppt-kit`](https://open-marketing-cn.github.io/open-marketing-agents/skills/ppt-kit/) | 从参考提炼设计系统，再连续生产品牌材料 | 像自己的 PPT 工厂：自由度高、可复用，但更依赖参考质量与操作者判断 |
| **共同边界** | 原生可编辑 PPTX、多人协作和复杂表格 | 两者当前都没有把这类交付当作核心工作流 |

上面的内容是在说明差异，不是在替使用者二选一。[打开完整 PPT 差异对比](https://open-marketing-cn.github.io/open-marketing-agents/compare/ppt/)可以查看六维画像、工作方式、主要交付、共同边界、证据类型和核验日期；统一 Brief 的成果与修改轮次进入飞书横评记录。

## 怎样参与共创

[推荐一个 Skill](https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f) · [查看公开推荐广场](https://open-marketing-cn.github.io/open-marketing-agents/recommendations/)

全部共创只使用这一个入口，共 8 题；提交即代表你实际使用过这个 Skill：

- **名称**：Skill 的公开名称；
- **原作者名称**：作者、团队或组织的公开名称，和推荐人分开署名；
- **分类**：洞察研究、品牌策略、创意内容、媒介增长、运营协作或其他；
- **使用场景**：你在什么真实任务里使用；
- **一句话描述**：它帮你得到什么结果；
- **适配 Agent**：WorkBuddy / 豆包工作伙伴、Codex、Claude Code、ChatGPT、Cursor 等；
- **Skill / 仓库链接**：原作者公开来源；
- **贡献者署名**：选填，不填则匿名。编号由系统自动生成。

认领实测、统一 Brief、实践补证和同类横评不再设置公众分入口；维护者收到推荐后，再在飞书后台完成去重、邀请实测和评审。发现来源、许可证、边界或上游 Commit 变化时，也直接使用这个表单。

投稿在下一次成功同步后进入站内推荐广场及 GitHub 推荐记录；自动任务每 15 分钟检查一次，实际显示时间受 GitHub 排队和飞书接口影响。投稿不自动变成正式 Skill，来源、安装与实测记录分别保留。链接未填完整的投稿会提示补充来源，不能直接安装。

## 什么会被收录

收录时先检查来源与安装；完成实践验证还需要相应案例证据：

- 有真实公开仓库、独立 `SKILL.md`、清楚的作者和许可证；
- 可以独立安装，并留下文件、表格、页面、清单等可交接结果；
- 有真实或脱敏案例，以及同意公开的实践者署名方式；
- 写清适用、不适用、踩过的弯路、最佳实践和进阶玩法；
- 不自动发布、投放、付款、发消息或修改真实账户，关键决定由人确认。

我们把状态分开显示：**被发现 → 来源核验 → 实践验证 → 多人复现 → 最佳实践**。GitHub Star、X 或小红书热度只决定优先评测什么，不决定是否公开，也不能代替许可证和真实实践。

来源核验、安装验证和实战验证分别记录。仅通过来源与安装检查的条目不承诺使用效果；完整实践证据是持续补充的维护目标。

详细评判方式见[评判协议](docs/evaluation-rubric.md)，实践资料可以参考[实战记录模板](docs/practice-evidence-template.md)。

## 署名与隐私

- 贡献者可以选择实名、昵称或角色匿名，也可以选择不公开署名；
- 公开资料只展示贡献者明确授权的署名和脱敏案例；
- 不公开联系方式、客户身份、内部路径、原始内部材料、Token 或未经许可的截图；
- 第三方 Skill 始终保留原作者、仓库、许可证、核验 Commit 和日期。

## 项目与技术入口

GitHub 是正式公开版本与审核记录，飞书只向社区提供一个“推荐一个 Skill”入口；认领、实践和横评在维护后台流转。目录数据、开发方式、schema、脚本和 PR 流程请读 [CONTRIBUTING.md](CONTRIBUTING.md)；审核排期、权限和自动化写入边界见[共同维护手册](docs/maintainer-playbook.md)。

仓库代码使用 [Apache-2.0](LICENSE)，Open Marketing 原创内容使用 [CC BY 4.0](LICENSE-CONTENT)；第三方内容保留各自许可证与署名，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 维护与推广

- [本次更新与两周推广计划](docs/launch-plan-2026-09-15.md)
- [Cola Skill 本轮选取与核验记录](docs/cola-selection-2026-09-15.md)
