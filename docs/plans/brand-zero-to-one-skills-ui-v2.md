# Open Marketing Skills UI V2：外部精选、极简目录

状态：已实施，已补充外部来源发现与 Star 快照，待上线后收集真实任务验证
日期：2026-09-01  
范围：公开网站、外部 Skill 目录与详情页；不扩展 Agent、Workflow、MCP 或执行平台。

## 1. 本轮纠偏

当前 V1 的技术底座可以保留，但产品表达过重：

- 首页同时解释 0→1 路线、三个成长阶段、五阶段地图、统计、筛选和收录规则。
- 当前首页实际包含 29 个按钮、3 个下拉选择和 5,700 字以上可见文本。
- 详情页把使用方式、输入、输出、人机分工、来源、验证、安装和相关推荐全部平铺展开。
- 公开目录混入 Open Marketing 原创和改编内容，外部精选的产品心智不够直接。
- 用户进入首页后，先理解产品架构，才能找到一个 Skill；顺序反了。

V2 的一句话目标：

> 让营销人在 30 秒内找到一个能解决当前任务的外部 Skill，并看懂它从哪里来、能交付什么、怎么安装。

## 2. 产品范围

### 2.1 V2 公开区只展示外部原版

V2 首轮公开目录只展示 `source.type=upstream` 的独立 Skill。

以下内容先退出公开目录，保留在仓库候选区：

- 现有全部 `original` Skill。
- 现有全部 `adapted` Skill。
- 来自维护者、Interflow、Open Marketing 活动、文章或内部实践的 Skill。
- 只有 Agent 人设、Workflow 组合、MCP、Connector 或平台产品，没有独立 `SKILL.md` 的条目。

它们不是删除，而是标记为 `paused_internal`，等完成真实任务验证、授权和独立安装测试后再单独决定是否恢复。

### 2.2 路线降级为分类，不再做首页主叙事

保留五个营销任务分类，但不再绘制“品牌作战地图”：

1. 洞察研究
2. 品牌策略
3. 创意内容
4. 媒介增长
5. 运营协作

分类只是筛选，不暗示自动流程、组合安装或先后依赖。

### 2.3 不再限制首发一定是 20 个

公开目录数量由资格决定，不由版式决定：

- 默认“精选”页通常控制在 12–15 个编辑推荐；本轮为保留 Cola 精选入口，暂为 19 个并支持分页。
- “全部 Skill”收录所有通过来源、许可证和独立性检查的外部 Skill。
- 每页显示 18 或 24 张卡片，避免首页无限拉长。
- 完全同质的 Skill 只保留来源更透明、交付更具体、独立性更好的一个。
- 方法不同、交付物不同的同类 Skill 可以并列，让用户自己选。

## 3. UI 方向

参考 ColaSkill 的不是橙色或图片风格，而是它的阅读顺序：

> 一句话说明 → 精选/全部 → 分类 → 卡片 → 详情 → 安装。

视觉遵循本轮提供的 `DESIGN.md`：灰白、系统字体、紧凑间距、无阴影、少颜色、低装饰。

### 3.1 视觉 Token

| 项目 | V2 规则 |
| --- | --- |
| 页面背景 | `#ffffff` |
| 次级表面 | `#f9f9f9` |
| 主文字 | `#0d0d0d` |
| 次级文字 | `#5d5d5d` |
| 弱化文字 | `#8f8f8f` |
| 边线 | `1px solid #0000001a` |
| Hover | `#0000000d` |
| 字体 | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| 最大标题 | 24px / 600 |
| 正文 | 16px / 1.5 |
| 辅助文字 | 14px / 1.43 |
| 卡片圆角 | 10px |
| 卡片内边距 | 16px |
| 阴影 | 不使用 |
| 彩色强调 | 默认不使用；验证状态也不依赖红绿颜色 |

不采用 `DESIGN.md` 中为聊天产品设计的固定侧边栏。这个站的核心任务是浏览 Skill，顶栏加卡片网格比聊天式两栏更直接。

### 3.2 首页信息架构

```text
┌──────────────────────────────────────────────────────────────┐
│ Open Marketing Skills                         搜索    GitHub │
├──────────────────────────────────────────────────────────────┤
│ 找一个 Skill，完成一个品牌营销任务。                         │
│ 外部精选 · 来源透明 · 单独安装                               │
│                                                              │
│ [精选] [全部 Skill]                                          │
│ [全部] [洞察] [策略] [创意] [媒介] [运营]                    │
│                                                              │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│ │ 中文结果名   │ │ 中文结果名   │ │ 中文结果名   │              │
│ │ original-id │ │ original-id │ │ original-id │              │
│ │ 两行结果说明 │ │ 两行结果说明 │ │ 两行结果说明 │              │
│ │ 作者 · 来源  │ │ 作者 · 来源  │ │ 作者 · 来源  │              │
│ └─────────────┘ └─────────────┘ └─────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

首页删除：

- 0→1 / 1→10 / 10→∞ 三阶段入口。
- 品牌作战地图。
- “20 个能单独开工”的大数字口号。
- 收录规则长说明。
- 多维下拉筛选。
- 首页直接展开安装验证、许可证和人机分工。
- 所有装饰性的统计卡和大色块。

首页只保留：

- 一句产品说明。
- `精选 / 全部 Skill` 两个页签。
- 一个搜索框。
- 五个分类按钮。
- Skill 卡片网格。
- 页尾的一小段收录与投稿入口。

### 3.3 列表卡片

一张卡片最多显示六组信息：

1. 中文结果名。
2. 原始 Skill ID。
3. 两行以内的具体交付结果。
4. 一个分类标签。
5. 作者头像或 GitHub 头像、作者名。
6. GitHub Star 与抓取日期，或“来源已核验”。

卡片不显示：

- 许可证全文。
- Commit SHA。
- 三种验证状态。
- 适合谁的完整列表。
- 多个交付物文件名。
- Codex、Claude Code 两套命令。
- “AI 做什么 / 人做什么”。

这些信息移到详情页。整张卡片可点击，不再同时放“查看怎么用”和“复制安装”两个主操作。

缩略图规则：

- 上游提供了可展示、许可证允许的真实结果图时才使用。
- 没有图时使用纯文字卡，不制作虚假的 AI 插画占位。
- 不从外部网站直接热链图片。

### 3.4 详情页

详情页从当前 11 个展开区块压缩为 5 个区块：

1. **结果**：它完成什么、适合什么时候用。
2. **怎么开始**：需要提供什么、3 个可复制请求。
3. **会拿到什么**：交付物和不能替你判断的边界。
4. **安装**：Codex / Claude Code / 查看 GitHub；安装是页面唯一强按钮。
5. **来源与验证**：作者、仓库、许可证、Commit、核验和测试记录，默认折叠。

相关推荐最多 3 张紧凑卡片，不再重复完整目录卡信息。

详情页线框：

```text
返回全部 Skill

把访谈和评论整理成客户洞察
customer-research
两句话说明结果                                         [安装]
作者 · GitHub · 洞察研究

你需要提供
访谈 / 问卷 / 评论 / 研究目标

试试这样说
[请求 1，点击复制]
[请求 2，点击复制]
[请求 3，点击复制]

你会拿到
研究摘要 · 客户原话表 · 证据缺口

不能替你判断
样本是否代表整个市场

▶ 来源与验证
```

### 3.5 搜索与分类

V2 只保留：

- 关键词搜索：搜中文结果名、原始 ID、交付结果和作者。
- 单选分类：全部 / 洞察 / 策略 / 创意 / 媒介 / 运营。
- 精选 / 全部 Skill 页签。

来源类型、安装状态、渠道和输出格式不再常驻首页。需要时可通过 URL 参数或二级“更多筛选”抽屉补充，但 V2 首轮不做。

### 3.6 响应式

- ≥1200px：4 列卡片。
- 768–1199px：2 列卡片。
- <768px：1 列卡片。
- 手机端顶栏只保留品牌、搜索按钮和 GitHub。
- 分类横向滚动，不折叠成下拉菜单。
- 安装按钮在详情页顶部可见，但不做遮挡内容的粘性浮层。

## 4. 外部来源审核结论

核验日期：2026-09-01。

### 4.1 可以作为正式 Skill 来源

| 来源 | 核验 Commit | 处理方式 |
| --- | --- | --- |
| `coreyhaines31/marketingskills` | `e55de886fe7580ec75cdb7ded5092b33f7d4ed58` | MIT；按单个 `skills/<id>/SKILL.md` 展示，不把整包当一张卡 |
| `Gingiris-1031/gingiris-skills` | `cd8ff37e56186f519081d0304420be5921d7fee3` | MIT；只选独立 specialist，排除 router、重复镜像和 Agent bundle |
| `JimLiu/baoyu-skills` | `6b7a2e417500561a5ecdd0b168332f4142584617` | MIT；创意类候选，必须验证不安装其他 Skill 也能完成自身任务 |
| `mvanhorn/last30days-skill` | `fcebe321c22e5e97e3ef5712e4bc00f2b33bba37` | MIT；真实路径为 `skills/last30days/SKILL.md`，网络能力和可选 Key 要在详情页说明 |
| `s1dashu/ip-as-logo-skill` | `acb834c717bcd0a487c49732d08397ba280d6904` | MIT；Cola 精选；独立根目录 `SKILL.md` |
| `isjiamu/gzh-design-skill` | `ba1f4175519b481cb3566616c9e5178705067904` | AGPL-3.0；Cola 精选；只推荐上游，不复制或改编 |
| `joeseesun/qiaomu-seo` | `b892b70639ac2839e7fa61302ff54a60a6cc9b74` | MIT；独立根目录 `SKILL.md` |
| `feichanggege/ecommerce-visual-copywriting-skill` | `38736d1ca30ee3b96d7015a16594e6c351ec3610` | MIT；独立根目录 `SKILL.md` |
| `pyang5166/gbro-cover-design` | `8d1a0a5487e9ee6539b2b0a471b58469aadfedd6` | MIT；Cola 精选；完整包含 `references/` 与 `assets/` |
| `yanliudesign/mono-color-skill` | `de607fedfff647eaf5400e0aa43085787d7d1fca` | MIT；Cola 精选；独立根目录 `SKILL.md` |
| `yaojingang/yao-geo-skills` | `201c0c45dcf09bb37bc46a467b4baf4d721db205` | MIT；高星集合中的独立 specialist，仅选 `yao-geo-page-audit` |

### 4.2 只做候选，不直接公开

| 来源 | 原因 |
| --- | --- |
| `wondelai/skills` | 仓库声明 MIT 且 Skill 结构完整，但多个 Skill 明确蒸馏商业书籍方法论，需要额外做内容来源与版权边界复核 |
| Skillry | 有品牌故事、发布视频等适合营销的付费 Skill，但页面提供的是付费 ZIP/会员能力，没有公开 GitHub 路径和可核验内容许可证 |
| Cola 中标记“License 未知”的条目 | 先进入候选；必须回到 GitHub 核验真实许可证，不能沿用目录标签 |
| GEOHub、xhs-product-picker、cangjie-skill | 已建立外部发现记录，因运行时/资料版权/方法论边界仍需复核，先保留候选 |

### 4.3 只参考任务命名，不作为 Skill 来源

| 来源 | 结论 |
| --- | --- |
| BotDirectory | 收录 Grok Bot、提示词和连接能力，不是独立 `SKILL.md` 目录 |
| Hollamuse AI Agents | 明确是按业务角色组织的付费 Agent 团队，不是开放 Skill 来源 |

这些站点可以帮助发现营销人会搜索的任务词，如“SEO 改进”“内容选题”“账户增长”，但不能直接生成公开 Skill 卡片。

## 5. 拟纳入的外部 Skill 池

以下是“适合品牌 0→1”的外部候选全集。进入正式目录前仍需逐个完成路径、许可证、独立安装、触发和输出核验。当前发现快照见 `catalog/intake/external-discovery-2026-09-01.yaml`；公开条目额外保存 GitHub Star 与核验日期，Star 不作为单独上线依据。

### 5.1 洞察研究

| Skill | 来源 | 预期结果 |
| --- | --- | --- |
| `customer-research` | marketingskills | 从访谈、问卷、评论中提取研究发现 |
| `competitor-profiling` | marketingskills | 形成竞品画像和对比证据 |
| `last30days` | mvanhorn | 研究近 30 天跨平台真实讨论 |
| `gingiris-user-interview` | Gingiris | 设计和整理用户访谈 |
| `competitor-research-playbook` | Gingiris | 形成竞品研究与行动建议 |

### 5.2 品牌策略

| Skill | 来源 | 预期结果 |
| --- | --- | --- |
| `product-marketing` | marketingskills | 整理产品营销背景与核心信息 |
| `marketing-plan` | marketingskills | 输出一份可执行营销计划 |
| `marketing-psychology` | marketingskills | 用行为原则检查营销表达 |
| `pricing` | marketingskills | 形成价格与套餐策略草案 |
| `offers` | marketingskills | 形成更清楚的产品 Offer |
| `lead-magnets` | marketingskills | 设计首个获客内容资产 |
| `b2b-marketing-playbook` | Gingiris | 形成 B2B 早期营销打法 |

以下方法论类 Skill 先留在版权复核候选：`jobs-to-be-done`、`mom-test`、`obviously-awesome`、`storybrand-messaging`、`one-page-marketing`。

### 5.3 创意内容

| Skill | 来源 | 预期结果 |
| --- | --- | --- |
| `content-strategy` | marketingskills | 形成内容主题和分发策略 |
| `copywriting` | marketingskills | 形成落地页、广告或发布文案 |
| `copy-editing` | marketingskills | 修改已有营销文案 |
| `ad-creative` | marketingskills | 形成广告创意方向与变体 |
| `social` | marketingskills | 形成社媒内容计划与帖子 |
| `video` | marketingskills | 形成视频概念、脚本或提示词 |
| `image` | marketingskills | 形成营销图片提示词与制作说明 |
| `ip-as-logo` | s1dashu | 形成商业 IP 吉祥物 Logo 候选 |
| `baoyu-cover-image` | baoyu-skills | 形成文章或社媒封面 |
| `baoyu-article-illustrator` | baoyu-skills | 形成文章配图方案 |
| `baoyu-xhs-images` | baoyu-skills | 形成小红书图卡 |
| `baoyu-slide-deck` | baoyu-skills | 形成演示内容与视觉页 |
| `gzh-design` | isjiamu | 把 Markdown 转成公众号可粘贴 HTML |
| `ecommerce-visual-copywriting` | feichanggege | 形成电商视觉策划、分镜和图内文案 |

### 5.4 媒介增长

| Skill | 来源 | 预期结果 |
| --- | --- | --- |
| `ads` | marketingskills | 形成付费广告策略与账户框架 |
| `ab-testing` | marketingskills | 形成测试假设、变体与判定方式 |
| `analytics` | marketingskills | 形成指标、追踪和分析框架 |
| `launch` | marketingskills | 形成首轮发布计划 |
| `seo-audit` | marketingskills | 形成 SEO 问题清单 |
| `ai-seo` | marketingskills | 形成 AI 搜索可见性优化建议 |
| `influencer-marketing` | marketingskills | 形成 KOL 选择和合作框架 |
| `public-relations` | marketingskills | 形成 PR 主题、媒体清单和 Pitch |
| `site-architecture` | marketingskills | 形成营销网站信息结构 |
| `qiaomu-seo` | joeseesun | 形成搜索与 AI 搜索审计报告 |
| `gingiris-seo-geo` | Gingiris | 形成 SEO/GEO 双路径计划 |
| `yao-geo-page-audit` | YAO GEO Skills | 形成 GEO 审计报告、修复清单和证据台账 |
| `gingiris-launch` | Gingiris | 形成 Product Hunt 等发布计划 |
| `gingiris-kol-outreach` | Gingiris | 形成 KOL 筛选与外联计划 |

### 5.5 运营协作

| Skill | 来源 | 预期结果 |
| --- | --- | --- |
| `emails` | marketingskills | 形成邮件序列和生命周期内容 |
| `community-marketing` | marketingskills | 形成社区营销与互动计划 |
| `co-marketing` | marketingskills | 形成联合营销合作方案 |
| `sales-enablement` | marketingskills | 形成销售资料与 Demo 话术 |
| `revops` | marketingskills | 形成线索到成交的协作规则 |
| `community-ambassador-playbook` | Gingiris | 形成品牌大使项目方案 |

## 6. 默认“精选”页

“全部 Skill”可以收录较多外部条目，首页默认精选当前为 19 个：

| 分类 | 默认精选 |
| --- | --- |
| 洞察 | `customer-research`、`competitor-profiling`、`last30days` |
| 策略 | `product-marketing`、`marketing-plan`、`pricing` |
| 创意 | `copywriting`、`ad-creative`、`baoyu-cover-image`、`ip-as-logo`、`gzh-design`、`gbro-cover-design`、`mono-color` |
| 媒介 | `ads`、`launch`、`qiaomu-seo` |
| 运营 | `emails`、`community-marketing`、`sales-enablement` |

默认精选不是“最好”，而是五类任务都有入口、任务结果具体、普通营销人容易理解。新增 Skill 不会自动进入精选页。

## 7. 数据与仓库调整

### 7.1 Manifest 新增字段

```yaml
featured: true | false
visibility: public | candidate | paused_internal | withdrawn
discoveredFrom:
  - colaskill
  - skills-sh
  - github
card:
  outcomeZh: string
  previewImage: string | null
  previewLicense: string | null
source:
  type: upstream
  githubStars: integer
  githubStarsCheckedAt: YYYY-MM-DD
```

V2 首页只读取：

- `visibility=public`
- `source.type=upstream`
- 资格校验通过的记录

### 7.2 迁移现有目录

1. 将现有 8 个 `original` 和 2 个 `adapted` 公开项改为 `paused_internal`。
2. 保留已通过测试的 10 个 upstream 条目。
3. 从现有 `catalog/intake/` 中优先复核 marketingskills、baoyu-skills 等外部条目。
4. 新增 Last30Days、Gingiris、Qiaomu、公众号排版、电商视觉文案等候选记录。
5. 只有逐项测试通过后才从 intake 移入正式目录。
6. 生成器新增 `featured`、`visibility` 和分页索引。
7. 不复制 AGPL Skill；不复制任何许可证未知 Skill。

## 8. 实施顺序

### Phase 1：先把目录变干净

1. 暂停展示 original / adapted / Interflow 活动 Skill。
2. 建立外部候选清单并补齐真实仓库、路径、Commit 和许可证。
3. 对新增候选做静态安全检查和独立安装测试。
4. 选出当前 19 个默认精选，并保留新增条目不自动晋级的人工规则。

### Phase 2：重做首页

1. 删除成长阶段和品牌作战地图。
2. 删除三个下拉筛选。
3. 改为 Cola 式“精选 / 全部 + 分类 + 卡片网格”。
4. 卡片只展示结果、ID、作者和来源。
5. 加分页与关键词搜索。

### Phase 3：压缩详情页

1. 把 11 个展开模块压缩成 5 个区块。
2. 安装成为唯一强按钮。
3. 来源与验证默认折叠。
4. 相关推荐变为 3 张紧凑卡片。

### Phase 4：发布前验证

1. 桌面 1440px、平板 1024px、手机 390px 浏览器验证。
2. 首页首屏不超过一个主标题、一句说明、两个页签和一行分类。
3. 任意卡片在 5 秒内能看懂交付结果。
4. 任意详情页在不展开技术信息时，能看懂输入、输出、边界和安装。
5. 外部 Skill 数量全部由 manifest 生成。
6. 所有公开安装按钮指向真实独立 `SKILL.md`。

## 9. 验收标准

- 首页首屏不再出现路线地图、成长阶段和统计面板。
- 首页常驻筛选从多维筛选降为一个搜索、一个页签组和一个分类组。
- 默认只展示外部精选 Skill。
- Open Marketing 自有与活动相关 Skill 不进入公开结果。
- Bot、Agent、Workflow、付费闭源 ZIP 和许可证未知内容不生成公开卡片。
- 卡片不超过两行摘要，技术元数据不进入主视觉层。
- 新增外部 Skill 逐个记录作者、仓库、路径、Commit、许可证和核验日期。
- 新增 Skill 未完成 Codex 与 Claude Code 独立安装测试时，不显示安装按钮。
- 移动端无横向溢出，分类可以横向滚动。
- UI 符合灰白、系统字体、无阴影、10px 圆角和 24px 最大标题规范。

## 10. 暂不做

- 不恢复 Agent、Workflow、MCP、Connector。
- 不提供站内运行 Skill。
- 不接登录、支付或用户收藏。
- 不接真实广告账户、飞书或社媒发布。
- 不把 Skillry 的付费内容搬运到本仓库。
- 不把 BotDirectory 或 Hollamuse 的 Agent 人设改写成 Skill。
- 不在这一轮发布 Open Marketing 活动产出的内部 Skill。

## 11. 本轮参考来源

- [ColaSkill](https://colaskill.com/zh/)
- [skills.sh](https://skills.sh/)
- [brand-marketing-skills 旧页面](https://jeorrysyd.github.io/brand-marketing-skills/)
- [BotDirectory](https://botdirectory.ai/)
- [Hollamuse AI Agents](https://www.hollamuse.com/ai-agents)
- [Skillry](https://skillry.dev/)
- [Corey Haines Marketing Skills](https://github.com/coreyhaines31/marketingskills)
- [Gingiris Skills](https://github.com/Gingiris-1031/gingiris-skills)
- [Baoyu Skills](https://github.com/JimLiu/baoyu-skills)
- [Last30Days](https://github.com/mvanhorn/last30days-skill)
- [IP as Logo](https://github.com/s1dashu/ip-as-logo-skill)
- [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill)
- [Qiaomu SEO](https://github.com/joeseesun/qiaomu-seo)
- [Ecommerce Visual Copywriting Skill](https://github.com/feichanggege/ecommerce-visual-copywriting-skill)
- [WondelAI Skills](https://github.com/wondelai/skills)
