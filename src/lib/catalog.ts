import type { CatalogPackage, CatalogSource, WorkspaceId } from './types';

const agencyAgents: CatalogSource = {
  label: 'Agency Agents',
  url: 'https://github.com/msitarzewski/agency-agents',
  license: 'MIT',
  mode: 'adapted'
};

const marketingSkills: CatalogSource = {
  label: 'Marketing Skills',
  url: 'https://github.com/coreyhaines31/marketingskills',
  license: 'MIT',
  mode: 'adapted'
};

const openMarketing: CatalogSource = {
  label: 'Open Marketing',
  url: 'https://github.com/open-marketing-cn/open-marketing-workbench',
  license: 'CC BY 4.0',
  mode: 'original'
};

const sharedPermissions = [
  {
    id: 'project-read',
    label: '读取当前项目资料',
    detail: '只读取你在 Codex 当前项目中明确提供或点选的文件。',
    required: true
  },
  {
    id: 'project-write',
    label: '写入本地交付物',
    detail: '在当前项目的 .open-marketing/ 目录保存输出、来源和确认记录。',
    required: true
  },
  {
    id: 'network',
    label: '联网访问公开资料',
    detail: '仅在任务明确需要、且你允许时联网；不会自动发布、投放或发送消息。',
    required: false
  }
];

const priorityPackages: CatalogPackage[] = [
  {
    id: 'consumer-language-insight',
    kind: 'agent',
    version: '0.1.0-alpha.1',
    name: '消费者语言洞察 Agent',
    shortDescription: '从公开表达与购买/使用评论中，整理消费者真实说法、痛点、场景、顾虑和未满足需求。',
    workspace: 'insights',
    status: 'pending_validation',
    maturityNote: '技术合同已建立，等待真实中国营销任务验证；目前禁止安装。',
    task: '为一个品牌或品类建立可追溯的消费者语言情报，供定位、创意和内容工作使用。',
    requiredInputs: ['品牌或品类范围', '目标市场与时间窗口', '至少一个公开表达来源', '至少一个购买或使用评论来源'],
    dataSources: ['Just One API（用户自备 Token）', '用户主动导入的脱敏评论或访谈', '公开平台内容'],
    outputs: ['消费者原话样本库', '痛点/需求/场景/顾虑分类', '证据与判断卡', '样本限制和待补资料'],
    cannotInfer: ['市场规模或人群比例', '真实购买因果', '整个平台或整体市场结论', '未提供的身份、销量与商业关系'],
    humanGate: '营销负责人确认样本是否足够、哪些判断可进入策略，以及是否需要补充新的平台或购买评论。',
    missingInputBehavior: '缺少任一最低来源时停止，列出缺口；只有用户明确选择“带假设继续”才生成受限草稿。',
    channels: ['小红书', '抖音', '淘宝/天猫评论', '京东评论', '微博', 'B站'],
    industries: ['通用', '消费品牌', '服务品牌', '中国品牌出海'],
    permissions: [
      ...sharedPermissions,
      {
        id: 'justoneapi-token',
        label: '读取本地 Just One API Token',
        detail: 'Token 只从本地环境变量 JUSTONEAPI_TOKEN 读取，不写入 Agent 输出、日志或仓库。',
        required: false
      }
    ],
    bundledSkills: [
      { id: 'source-plan', name: '来源与样本计划', required: true, description: '先定义平台、时间窗、样本和去重口径。' },
      { id: 'evidence-coding', name: '消费者原话编码', required: true, description: '保留证据，区分原话、归类和判断。' },
      { id: 'justoneapi-connector', name: 'Just One API 连接器', required: false, description: '按用户授权抓取公开平台内容。' }
    ],
    validation: [],
    sources: [openMarketing, marketingSkills],
    searchText: '消费者 用户研究 评论 痛点 需求 场景 小红书 抖音 电商评论 Just One API'
  },
  {
    id: 'marketing-project-foundation',
    kind: 'agent',
    version: '0.1.0-alpha.1',
    name: '营销项目底稿 Agent',
    shortDescription: '把零散的品牌、产品、目标、人群、渠道与限制整理成后续 Agent 可直接接手的项目底稿。',
    workspace: 'strategy',
    status: 'cocreating',
    maturityNote: '共创中：合同与交付物已定义，尚未完成真实任务验证。',
    task: '在项目启动时找出资料缺口，形成统一营销底稿和需要负责人决定的问题。',
    requiredInputs: ['品牌与产品信息', '本次营销任务', '目标人群', '计划渠道', '项目负责人'],
    dataSources: ['已有 Brief', '品牌资料', '会议纪要脱敏版', '人工填写'],
    outputs: ['营销项目底稿', '缺失资料清单', '关键假设', '人工确认问题'],
    cannotInfer: ['真实预算', '库存与价格', '未经确认的品牌主张', '最终成功标准'],
    humanGate: '负责人确认目标、范围、品牌主张和成功标准。',
    missingInputBehavior: '停止并列出缺失资料；允许用户明确带假设继续。',
    channels: ['全渠道'],
    industries: ['通用'],
    permissions: sharedPermissions,
    bundledSkills: [],
    validation: [],
    sources: [openMarketing, marketingSkills]
  },
  {
    id: 'market-competitor-organizer',
    kind: 'agent',
    version: '0.1.0-alpha.1',
    name: '市场与竞品资料整理 Agent',
    shortDescription: '把公开资料、报告和访谈按来源、日期和可比口径整理成可追溯的市场与竞品判断。',
    workspace: 'insights',
    status: 'cocreating',
    maturityNote: '共创中：正在补充中国市场数据口径和验证任务。',
    task: '回答一个明确的市场或竞品问题，并指出证据能够支持与不能支持的判断。',
    requiredInputs: ['调研问题', '品类和竞品范围', '时间窗口', '至少一份可追溯资料'],
    dataSources: ['公开网页', '行业报告摘要', '访谈笔记', '用户导入表格'],
    outputs: ['资料对照表', '证据支持的判断', '证据不足项', '下一轮补数建议'],
    cannotInfer: ['未提供的市场份额', '竞品真实投放金额', '销量与因果关系'],
    humanGate: '营销负责人决定采用哪些判断以及是否继续补充一手资料。',
    missingInputBehavior: '没有来源或比较口径时停止，并返回缺失清单。',
    channels: ['公开资料', '电商', '社媒', '搜索'],
    industries: ['通用', '消费品牌', 'B2B'],
    permissions: sharedPermissions,
    bundledSkills: [],
    validation: [],
    sources: [openMarketing, marketingSkills]
  },
  {
    id: 'content-planning-copy',
    kind: 'agent',
    version: '0.1.0-alpha.1',
    name: '内容策划与文案 Agent',
    shortDescription: '根据已确认的项目底稿，形成内容角度、信息结构、文案草稿和需要人工确认的事实。',
    workspace: 'creation',
    status: 'cocreating',
    maturityNote: '共创中：正在合并开源内容策略、文案与校对方法。',
    task: '围绕一个明确营销任务形成可审稿的内容母稿。',
    requiredInputs: ['已确认的项目目标', '目标人群', '品牌口径', '内容任务', '可用事实'],
    dataSources: ['营销项目底稿', '品牌口径', '产品事实', '已授权素材说明'],
    outputs: ['内容角度', '信息结构', '文案母稿', '事实和表达确认项'],
    cannotInfer: ['产品功效', '用户评价', '合作关系', '促销价格', '素材授权'],
    humanGate: '品牌负责人确认内容角度、事实、语气和是否进入平台适配。',
    missingInputBehavior: '缺少事实或品牌口径时停止，返回需要补充的具体资料。',
    channels: ['内容母稿', '官网', '社媒'],
    industries: ['通用'],
    permissions: sharedPermissions,
    bundledSkills: [
      { id: 'content-strategy', name: '内容策略', required: true, description: '定义内容任务、受众与核心信息。' },
      { id: 'copywriting', name: '营销文案', required: true, description: '生成可审阅的文案草稿。' },
      { id: 'copy-editing', name: '文案校对', required: false, description: '按品牌声音与事实边界做第二轮校对。' }
    ],
    validation: [],
    sources: [openMarketing, marketingSkills, agencyAgents]
  },
  {
    id: 'china-platform-adaptation',
    kind: 'agent',
    version: '0.1.0-alpha.1',
    name: '小红书 / 抖音 / 微信内容适配 Agent',
    shortDescription: '把确认后的内容母稿分别改成小红书、抖音和微信可用版本，不承诺流量或自动发布。',
    workspace: 'adaptation',
    status: 'cocreating',
    maturityNote: '共创中：平台方法已归档，仍需分别验证三个渠道的交付物。',
    task: '根据平台使用场景重组标题、开场、正文、素材要求和行动指引。',
    requiredInputs: ['已确认内容母稿', '目标平台', '品牌口径', '素材规格', '行动指引'],
    dataSources: ['已确认母稿', '平台公开规则', '品牌自有规范', '素材清单'],
    outputs: ['各平台独立版本', '素材和规格提醒', '风险表达', '发布前确认项'],
    cannotInfer: ['平台保证流量', '最佳发布时间', '投放结果', '素材权利'],
    humanGate: '渠道负责人逐个平台确认内容、素材、时间与最终发布动作。',
    missingInputBehavior: '母稿未确认或素材规格缺失时停止。',
    channels: ['小红书', '抖音', '微信公众号', '视频号'],
    industries: ['通用', '消费品牌'],
    permissions: sharedPermissions,
    bundledSkills: [],
    validation: [],
    sources: [openMarketing, agencyAgents, marketingSkills]
  }
];

type CandidateSeed = readonly [
  slug: string,
  name: string,
  workspace: WorkspaceId,
  task: string,
  channels: string,
  industry?: string
];

const agencySeeds: CandidateSeed[] = [
  ['marketing-aeo-foundations', 'AI 搜索可发现性基础 Agent', 'strategy', '检查网站是否具备被搜索引擎与 AI 助手发现、读取和引用的基础条件。', '官网/GEO'],
  ['marketing-agentic-search-optimizer', 'AI 搜索任务优化 Agent', 'strategy', '围绕用户让 AI 完成的任务，整理内容结构与机器可读信息。', '官网/GEO'],
  ['marketing-ai-citation-strategist', 'AI 引用机会 Agent', 'insights', '分析品牌被生成式搜索引用所需的主题、证据与内容缺口。', 'GEO'],
  ['marketing-app-store-optimizer', '应用商店增长 Agent', 'adaptation', '整理 App Store 与安卓应用市场的关键词、页面信息和迭代建议。', '应用商店', '互联网/工具'],
  ['marketing-baidu-seo-specialist', '百度搜索优化 Agent', 'adaptation', '面向百度搜索整理关键词、页面和技术检查清单。', '百度'],
  ['marketing-bilibili-content-strategist', 'B站内容策略 Agent', 'adaptation', '为 B 站内容定义选题、视频结构、标题与互动承接。', 'B站'],
  ['marketing-book-co-author', '专业内容成书 Agent', 'creation', '把专业经验整理成读者可理解、可编辑的书稿结构与章节草稿。', '出版/长内容'],
  ['marketing-carousel-growth-engine', '图文轮播内容 Agent', 'creation', '把一个主题改写成可连续阅读的多页图文内容。', '小红书/Instagram/LinkedIn'],
  ['marketing-china-ecommerce-operator', '中国电商运营 Agent', 'delivery', '整理淘宝、天猫、拼多多与京东的商品、活动和运营任务。', '淘宝/天猫/拼多多/京东', '消费品牌'],
  ['marketing-china-market-localization-strategist', '中国市场本土化 Agent', 'strategy', '把海外品牌的市场表达、渠道和进入计划改造成适合中国市场的版本。', '中国市场', '中国市场进入'],
  ['marketing-content-creator', '多渠道内容创作 Agent', 'creation', '根据品牌任务起草跨渠道内容并保留平台改写接口。', '全渠道'],
  ['marketing-cross-border-ecommerce', '中国品牌出海电商 Agent', 'delivery', '整理中国品牌进入海外电商平台所需的商品、内容与运营准备。', 'Amazon/独立站/海外电商', '中国品牌出海'],
  ['marketing-douyin-strategist', '抖音内容策略 Agent', 'adaptation', '面向抖音定义选题、前三秒、脚本、互动与转化承接。', '抖音'],
  ['marketing-email-strategist', '邮件营销策略 Agent', 'strategy', '按用户阶段规划邮件触达、内容、频率和衡量方式。', 'Email/CRM'],
  ['marketing-global-podcast-strategist', '全球播客增长 Agent', 'strategy', '规划面向海外市场的播客定位、嘉宾、分发和增长路径。', 'Podcast', '中国品牌出海'],
  ['marketing-growth-hacker', '增长机会实验 Agent', 'strategy', '把增长想法改写为有假设、成本、指标和停止条件的小实验。', '全渠道'],
  ['marketing-instagram-curator', 'Instagram 内容策展 Agent', 'adaptation', '规划 Instagram 视觉栏目、内容节奏与互动机制。', 'Instagram', '中国品牌出海'],
  ['marketing-kuaishou-strategist', '快手内容策略 Agent', 'adaptation', '面向快手定义人设、内容节奏、直播与社群承接。', '快手'],
  ['marketing-linkedin-content-creator', 'LinkedIn 内容 Agent', 'adaptation', '把专业经验改写成适合 LinkedIn 的观点与案例内容。', 'LinkedIn', 'B2B/中国品牌出海'],
  ['marketing-livestream-commerce-coach', '直播营销教练 Agent', 'delivery', '整理主播表达、货品节奏、互动节点和复盘问题。', '抖音/快手/视频号直播'],
  ['marketing-multi-platform-publisher', '多平台发布准备 Agent', 'delivery', '把已批准内容整理成多平台发布包，不执行真实发布。', '全渠道'],
  ['marketing-podcast-strategist', '播客内容策略 Agent', 'strategy', '定义播客定位、栏目、嘉宾、单集结构和分发计划。', '小宇宙/Apple Podcasts'],
  ['marketing-pr-communications-manager', '品牌公关沟通 Agent', 'delivery', '整理新闻点、媒体材料、问答口径与审批节点。', '媒体/公关'],
  ['marketing-private-domain-operator', '私域运营 Agent', 'delivery', '规划企业微信、社群与会员触达的内容、节奏和人工服务节点。', '企业微信/社群/会员'],
  ['marketing-reddit-community-builder', 'Reddit 社区运营 Agent', 'adaptation', '为出海品牌规划 Reddit 社区参与、话题与风险边界。', 'Reddit', '中国品牌出海'],
  ['marketing-seo-specialist', '独立站 SEO Agent', 'strategy', '检查独立站内容、关键词、页面和技术 SEO 任务。', 'Google/独立站', '中国品牌出海'],
  ['marketing-short-video-editing-coach', '短视频剪辑指导 Agent', 'creation', '把脚本转成镜头、节奏、字幕、音乐和剪辑检查清单。', '抖音/快手/视频号/B站'],
  ['marketing-social-media-strategist', '社媒内容策略 Agent', 'strategy', '定义社媒目标、受众、栏目、平台分工和衡量方式。', '全渠道'],
  ['marketing-tiktok-strategist', 'TikTok 内容策略 Agent', 'adaptation', '面向 TikTok 定义短视频选题、Hook、脚本与互动方式。', 'TikTok', '中国品牌出海'],
  ['marketing-twitter-engager', 'X 社区互动 Agent', 'adaptation', '规划 X 上的日常互动、回复和关系积累。', 'X/Twitter', '中国品牌出海'],
  ['marketing-video-optimization-specialist', '视频表现优化 Agent', 'performance', '根据视频数据和内容结构提出下一轮可验证的优化建议。', '短视频/长视频'],
  ['marketing-wechat-official-account', '微信公众号内容 Agent', 'adaptation', '把内容母稿改写为微信公众号可读的标题、结构和图文草稿。', '微信公众号'],
  ['marketing-weibo-strategist', '微博内容策略 Agent', 'adaptation', '规划微博话题、热点参与、短内容和互动节奏。', '微博'],
  ['marketing-x-twitter-intelligence-analyst', 'X 舆情与话题洞察 Agent', 'insights', '整理 X 上与品牌或品类相关的话题、观点与信号。', 'X/Twitter', '中国品牌出海'],
  ['marketing-xiaohongshu-specialist', '小红书内容策略 Agent', 'adaptation', '面向小红书搜索、收藏与评论场景规划选题、标题和笔记结构。', '小红书'],
  ['marketing-zhihu-strategist', '知乎内容策略 Agent', 'adaptation', '把品牌专业知识组织成知乎问题选择、回答结构与证据清单。', '知乎'],
  ['paid-media-auditor', '付费媒体账户审计 Agent', 'performance', '根据用户导出的账户数据检查结构、预算、素材和测量问题。', '广告平台'],
  ['paid-media-creative-strategist', '投放创意策略 Agent', 'creation', '把投放目标与人群洞察转成可测试的创意方向和素材任务书。', '广告平台'],
  ['paid-media-paid-social-strategist', '社交媒体投放策略 Agent', 'strategy', '整理社交平台投放目标、人群、素材、预算与测试结构。', '巨量引擎/腾讯广告/Meta'],
  ['paid-media-ppc-strategist', '搜索广告策略 Agent', 'strategy', '规划搜索广告关键词、账户结构、落地页和衡量方式。', '百度/Google Ads'],
  ['paid-media-programmatic-buyer', '程序化广告准备 Agent', 'delivery', '整理程序化采买所需的人群、版位、频控、素材与品牌安全要求。', 'DSP/程序化广告'],
  ['paid-media-search-query-analyst', '搜索词数据分析 Agent', 'insights', '对搜索词导出数据做归类、否词、意图和内容机会分析。', '百度/Google Ads/站内搜索'],
  ['paid-media-tracking-specialist', '营销追踪方案 Agent', 'delivery', '定义广告与站点事件、UTM、命名和上线前验证清单。', '广告平台/网站/小程序']
];

const skillSeeds: CandidateSeed[] = [
  ['ab-test-setup', 'A/B 测试设计 Skill', 'performance', '把营销改动写成可执行的假设、变量、样本与停止条件。', '全渠道'],
  ['ad-creative', '广告素材任务书 Skill', 'creation', '生成广告素材方向、文案角度和规格清单。', '广告平台'],
  ['ai-seo', 'AI 搜索内容检查 Skill', 'strategy', '检查内容是否便于 AI 搜索发现、理解与引用。', 'GEO/独立站'],
  ['analytics-tracking', '营销数据追踪 Skill', 'delivery', '整理事件、UTM、命名和数据验证方案。', '网站/广告平台'],
  ['aso-audit', '应用商店页面审计 Skill', 'performance', '检查应用商店关键词、页面素材与转化信息。', '应用商店'],
  ['churn-prevention', '用户流失预防 Skill', 'strategy', '按流失信号整理触达策略和验证指标。', 'CRM/会员'],
  ['cold-email', '陌生邮件起草 Skill', 'creation', '基于合规来源起草个性化陌生邮件和跟进序列。', 'Email', 'B2B/中国品牌出海'],
  ['community-marketing', '社群营销规划 Skill', 'strategy', '定义社群目标、参与机制、内容与运营边界。', '社群'],
  ['competitor-alternatives', '竞品替代页 Skill', 'creation', '为独立站生成可核验的替代方案页面结构。', '独立站'],
  ['competitor-profiling', '竞品资料卡 Skill', 'insights', '把单个竞品资料整理成结构化、可追溯的资料卡。', '公开资料'],
  ['content-strategy', '内容策略 Skill', 'strategy', '定义内容目标、受众、主题、栏目和衡量方式。', '全渠道'],
  ['copy-editing', '营销文案校对 Skill', 'creation', '按事实、品牌声音、清晰度和行动指引校对文案。', '全渠道'],
  ['copywriting', '营销文案起草 Skill', 'creation', '基于明确事实和任务起草可审阅文案。', '全渠道'],
  ['customer-research', '用户研究规划 Skill', 'insights', '设计访谈、问卷、样本和证据整理方法。', '用户研究'],
  ['directory-submissions', '海外目录提交 Skill', 'delivery', '整理适合提交的海外目录、资料与追踪表。', '海外目录', '中国品牌出海'],
  ['email-sequence', '邮件序列设计 Skill', 'creation', '按用户阶段设计邮件主题、内容和触发条件。', 'Email/CRM'],
  ['form-cro', '表单转化检查 Skill', 'performance', '检查表单字段、阻力、反馈与测量问题。', '官网/落地页'],
  ['free-tool-strategy', '免费工具获客 Skill', 'strategy', '把用户问题转成可验证的免费工具选题与获客路径。', '独立站'],
  ['image', '营销图片提示与验收 Skill', 'creation', '生成图片需求、提示词和人工验收清单。', '视觉内容'],
  ['launch-strategy', '营销上线计划 Skill', 'delivery', '整理上线阶段、渠道、素材、负责人和检查点。', '全渠道'],
  ['lead-magnets', '获客资料策划 Skill', 'creation', '设计白皮书、清单或模板等获客资料。', '官网/私域'],
  ['marketing-ideas', '营销点子发散 Skill', 'strategy', '围绕一个具体目标生成带依据和筛选标准的营销点子。', '全渠道'],
  ['marketing-psychology', '行为心理检查 Skill', 'strategy', '用行为科学检查营销假设，不把理论当成用户事实。', '全渠道'],
  ['onboarding-cro', '用户上手流程检查 Skill', 'performance', '检查新用户完成首次价值所需的步骤与阻力。', '产品内'],
  ['page-cro', '落地页转化检查 Skill', 'performance', '检查页面信息顺序、证据、阻力和行动指引。', '官网/落地页'],
  ['paid-ads', '付费广告计划 Skill', 'strategy', '整理投放目标、人群、预算、创意和测量要求。', '广告平台'],
  ['paywall-upgrade-cro', '付费升级页检查 Skill', 'performance', '检查付费墙或升级页的价值表达与转化阻力。', '产品内'],
  ['popup-cro', '弹窗转化检查 Skill', 'performance', '检查弹窗触发、文案、频率与体验风险。', '官网/产品内'],
  ['pricing-strategy', '定价研究 Skill', 'strategy', '整理定价问题、证据、方案与需要负责人决策的权衡。', '全渠道'],
  ['product-marketing-context', '产品营销底稿 Skill', 'strategy', '建立产品、受众、定位、竞品和证明材料底稿。', '全渠道'],
  ['programmatic-seo', '规模化 SEO 规划 Skill', 'strategy', '规划模板化页面、数据来源、质量和索引边界。', '独立站'],
  ['referral-program', '用户推荐机制 Skill', 'strategy', '设计推荐人、被推荐人、奖励、风控和验证指标。', '产品/私域'],
  ['revops', '营销销售数据衔接 Skill', 'performance', '整理线索、阶段、字段、归因和团队交接规则。', 'CRM', 'B2B'],
  ['sales-enablement', '销售支持材料 Skill', 'creation', '把营销证据整理成销售可用的话术、案例和资料。', '销售/CRM', 'B2B'],
  ['schema-markup', '结构化数据 Skill', 'delivery', '为网页规划 Schema.org 结构化数据与验证步骤。', '独立站'],
  ['seo-audit', 'SEO 审计 Skill', 'performance', '检查站点技术、页面与内容 SEO 问题。', '独立站'],
  ['signup-flow-cro', '注册流程检查 Skill', 'performance', '检查注册步骤、字段、反馈与放弃点。', '产品内'],
  ['site-architecture', '网站信息架构 Skill', 'strategy', '规划页面层级、导航、内部链接与内容归属。', '独立站'],
  ['social-content', '社媒内容草稿 Skill', 'creation', '把明确主题改写成社媒可审阅草稿。', '社媒'],
  ['video', '营销视频制作计划 Skill', 'creation', '把营销任务转成视频脚本、镜头、素材和验收表。', '短视频/长视频']
];

function makeCandidate(seed: CandidateSeed, kind: 'agent' | 'skill', source: CatalogSource): CatalogPackage {
  const [slug, name, workspace, task, channels, industry = '通用'] = seed;
  return {
    id: `${source === agencyAgents ? 'agency' : 'skill'}-${slug}`,
    kind,
    version: '0.0.1',
    name,
    shortDescription: `${task} 当前作为候选内容展示，完成中国营销语境改写、安全检查和真实任务验证后才可安装。`,
    workspace,
    status: 'cocreating',
    maturityNote: '共创中：来源已登记，尚未通过 Open Marketing 维护者审核与真实从业者验证。',
    task,
    requiredInputs: ['明确的营销任务', '品牌或产品资料', '目标人群', '相关渠道或历史资料'],
    dataSources: ['用户主动提供的资料', '公开且可追溯的来源'],
    outputs: [`${name.replace(/ Agent| Skill/g, '')}工作稿`, '来源与假设', '缺失资料', '人工确认项'],
    cannotInfer: ['未提供的商业数据', '未经确认的品牌主张', '发布、预算或效果结论'],
    humanGate: '营销负责人确认事实、选择、预算、发布动作和最终判断。',
    missingInputBehavior: '缺少必需资料时停止并列出具体缺口；不得自动补写为事实。',
    channels: channels.split('/'),
    industries: industry.split('/'),
    permissions: sharedPermissions,
    bundledSkills: [],
    validation: [],
    sources: [source],
    originSlug: slug,
    searchText: `${name} ${task} ${channels} ${industry} ${slug}`
  };
}

export const CATALOG: CatalogPackage[] = [
  ...priorityPackages,
  ...agencySeeds.map((seed) => makeCandidate(seed, 'agent', agencyAgents)),
  ...skillSeeds.map((seed) => makeCandidate(seed, 'skill', marketingSkills))
];

export function searchCatalog(
  packages: CatalogPackage[],
  query: string,
  workspace: WorkspaceId | 'all',
  kind: 'all' | 'agent' | 'skill',
  status: 'all' | CatalogPackage['status']
): CatalogPackage[] {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  return packages.filter((item) => {
    if (workspace !== 'all' && item.workspace !== workspace) return false;
    if (kind !== 'all' && item.kind !== kind) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (!normalized) return true;
    const haystack = [
      item.name,
      item.shortDescription,
      item.task,
      item.channels.join(' '),
      item.industries.join(' '),
      item.sources.map((source) => source.label).join(' '),
      item.searchText ?? ''
    ]
      .join(' ')
      .toLocaleLowerCase('zh-CN');
    return haystack.includes(normalized);
  });
}

export function countByWorkspace(packages: CatalogPackage[], workspace: WorkspaceId): number {
  return packages.filter((item) => item.workspace === workspace).length;
}

export function canInstall(item: CatalogPackage): boolean {
  return item.kind !== 'connector' && item.status === 'installable' && item.validation.length > 0;
}
