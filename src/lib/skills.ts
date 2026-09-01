import registryData from '../../generated/registry.json';

export type WorkspaceId = 'insights' | 'strategy' | 'creative' | 'media' | 'operations';
export type SourceType = 'upstream' | 'adapted' | 'original';
export type ValidationStatus = 'passed' | 'pending' | 'failed';

export type ValidationRecord = {
  status: ValidationStatus;
  checkedAt: string;
  noteZh: string;
};

export type Skill = {
  id: string;
  titleZh: string;
  originalName: string;
  summaryZh: string;
  growthStage: 'zero_to_one';
  workspace: WorkspaceId;
  audiences: string[];
  useCases: string[];
  inputs: string[];
  outputs: string[];
  promptExamples: string[];
  humanGate: string;
  cannotInfer: string[];
  channels: string[];
  source: {
    type: SourceType;
    repo: string;
    path: string;
    commit: string;
    author: string;
    authorUrl?: string;
    avatarUrl?: string;
    license: string;
    checkedAt: string;
    upstreamName?: string;
    upstreamRepo?: string;
    upstreamPath?: string;
    upstreamCommit?: string;
    upstreamAuthor?: string;
    changesZh?: string;
  };
  installation: {
    codex: string;
    claudeCode: string;
    download?: string;
  };
  validation: {
    spec: ValidationRecord;
    installation: ValidationRecord;
    practice: ValidationRecord;
  };
  relatedSkillIds: string[];
  installable: boolean;
};

export type Registry = {
  product: string;
  growthStage: 'zero_to_one';
  catalogVersion: string;
  stats: {
    total: number;
    byWorkspace: Record<WorkspaceId, number>;
    bySource: Record<SourceType, number>;
    installable: number;
    practiceValidated: number;
  };
  skills: Skill[];
};

export const registry = registryData as Registry;

export const WORKSPACES: Array<{
  id: WorkspaceId;
  number: string;
  name: string;
  english: string;
  question: string;
  output: string;
}> = [
  { id: 'insights', number: '01', name: '洞察研究', english: 'INSIGHTS', question: '人们到底在说什么？', output: '原话 · 研究 · 画像 · 问题' },
  { id: 'strategy', number: '02', name: '品牌策略', english: 'STRATEGY', question: '我们要为谁占据什么？', output: '底稿 · 定位 · 主张 · Campaign' },
  { id: 'creative', number: '03', name: '创意内容', english: 'CREATIVE', question: '怎样把策略变成表达？', output: 'Brief · 文案 · 广告 · 视觉' },
  { id: 'media', number: '04', name: '媒介与上线', english: 'MEDIA', question: '去哪里、怎么测、何时上？', output: '渠道 · 预算 · 测试 · 追踪' },
  { id: 'operations', number: '05', name: '运营协作', english: 'OPERATIONS', question: '谁在什么时候交付什么？', output: '倒排 · RACI · 日历 · 复盘' }
];

export const SOURCE_LABELS: Record<SourceType, string> = {
  upstream: '原版推荐',
  adapted: '中国化改编',
  original: 'Open Marketing 原创'
};

export function skillHref(id: string, base = '') {
  return `${base}/skills/${id}/`;
}
