export type ComparisonPortrait = {
  skillId: string;
  methodZh: string;
  titleZh: string;
  summaryZh: string;
};

export type ComparisonRow = {
  labelZh: string;
  questionZh: string;
  values: Record<string, string>;
};

export type ComparisonGroup = {
  id: string;
  taskZh: string;
  titleZh: string;
  introZh: string;
  skillIds: string[];
  portraits: ComparisonPortrait[];
  sharedBoundary: {
    titleZh: string;
    summaryZh: string;
  };
  rows: ComparisonRow[];
};

export const COMPARISON_GROUPS: ComparisonGroup[] = [
  {
    id: 'ppt',
    taskZh: '演示文稿 / PPT',
    titleZh: '同样做 PPT，它们把不同环节做深了。',
    introZh: '这不是二选一，也不是总分排名。我们把每个精选 Skill 的起点、工作方式、交付物和边界摊开，让使用者自己判断它和当前任务的关系。',
    skillIds: ['guizang-ppt-skill', 'ppt-kit'],
    portraits: [
      {
        skillId: 'guizang-ppt-skill',
        methodZh: '受控设计型',
        titleZh: '把演讲型 PPT 的第一次出稿做得更快、更稳',
        summaryZh: '适合发布会、Demo Day 和个人演讲；内置风格与版式约束让第一次结果更稳定。'
      },
      {
        skillId: 'ppt-kit',
        methodZh: '参考驱动型',
        titleZh: '把参考提炼、设计系统和系列化生产做成一套流程',
        summaryZh: '适合客户提案、报价、Brief 和品牌系列材料；参考质量与操作者判断直接影响结果。'
      }
    ],
    sharedBoundary: {
      titleZh: '两者目前都没有把原生 PPTX 多人协作当作核心交付',
      summaryZh: '复杂表格、多人在线协作和原生可编辑 PPTX 属于共同边界；这不代表 Skill 不好，只代表它们解决的是另一段工作。'
    },
    rows: [
      {
        labelZh: '核心任务',
        questionZh: '它主要替你完成什么？',
        values: {
          'guizang-ppt-skill': '用固定设计语言快速生成演讲型网页 PPT',
          'ppt-kit': '从任意视觉参考提取风格，再生产整套品牌材料'
        }
      },
      {
        labelZh: '风格来源',
        questionZh: '视觉规则从哪里来？',
        values: {
          'guizang-ppt-skill': '内置两套：电子杂志风、瑞士国际主义',
          'ppt-kit': '用户提供的 PDF、截图、图片、HTML 或 PPTX'
        }
      },
      {
        labelZh: '上手门槛',
        questionZh: '第一次做出可用结果有多难？',
        values: {
          'guizang-ppt-skill': '低。约束明确，页面结构与视觉选择更少',
          'ppt-kit': '高。需要判断参考质量、提炼规则并组织整套结构'
        }
      },
      {
        labelZh: '稳定与自由',
        questionZh: '结果更像模板，还是更像定制？',
        values: {
          'guizang-ppt-skill': '稳定性高、自由度中；在受控范围内更容易复现',
          'ppt-kit': '自由度高、稳定性中；上限更高，波动也更大'
        }
      },
      {
        labelZh: '操作者依赖',
        questionZh: '人的经验会多大程度影响结果？',
        values: {
          'guizang-ppt-skill': '中。仍需把控叙事和信息密度，但视觉判断较少',
          'ppt-kit': '高。参考选择、设计抽象和迭代判断都会拉开差距'
        }
      },
      {
        labelZh: '内容与页面',
        questionZh: '它怎样处理内容结构？',
        values: {
          'guizang-ppt-skill': '可协助搭叙事弧、页面结构和文案，并套入预制骨架',
          'ppt-kit': '原则上不代写；以 freeform 页面为主，需要操作者先组织内容'
        }
      },
      {
        labelZh: '主要交付',
        questionZh: '最终拿到什么？',
        values: {
          'guizang-ppt-skill': '可直接演示的网页 PPT',
          'ppt-kit': '可复用 skin、HTML Deck 与视觉一致的 1:1 PDF'
        }
      },
      {
        labelZh: '复用方式',
        questionZh: '下一次怎样继续用？',
        values: {
          'guizang-ppt-skill': '复用整套模板、页面骨架与设计规则',
          'ppt-kit': '复用已提炼的 skin，连续生产提案、Brief、报价和结案材料'
        }
      },
      {
        labelZh: '主要边界',
        questionZh: '什么时候不要勉强用？',
        values: {
          'guizang-ppt-skill': '风格范围较窄，不适合复杂表格和高度自定义品牌系统',
          'ppt-kit': '没有高质量参考或设计判断时，容易出现流程重、结果不稳'
        }
      }
    ]
  }
];

export function getComparisonGroup(id: string) {
  return COMPARISON_GROUPS.find((group) => group.id === id);
}
