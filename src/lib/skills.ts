import registryData from '../../generated/registry.json';
import candidateData from '../../generated/candidates.json';
import workflowData from '../../generated/workflow-examples.json';
import communityData from '../../generated/community-recommendations.json';

export type WorkspaceId = 'insights' | 'strategy' | 'creative' | 'media' | 'operations';
export type SourceType = 'upstream' | 'adapted' | 'original';
export type ValidationStatus = 'passed' | 'pending' | 'failed';
export type Visibility = 'public' | 'candidate' | 'paused_internal' | 'withdrawn';
export type PracticeLevel = 'discovered' | 'source_verified' | 'practiced' | 'replicated' | 'best_practice';
export type ComparisonScale = 'low' | 'medium' | 'high';
export type ComparisonEvidenceType = 'publisher' | 'maintainer_test' | 'community_case' | 'inference';
export type CatalogBucketId = 'gather' | 'strategize' | 'write' | 'visual' | 'auto';

export type ValidationRecord = {
  status: ValidationStatus;
  checkedAt: string;
  noteZh: string;
};

export type PracticeEvidence = {
  caseTitleZh: string;
  contextZh: string;
  inputZh: string;
  outputZh: string;
  evidenceUrl: string;
  practitionerRole: string;
  attributionZh: string;
  howToUseZh: string;
  setupZh: string;
  expectedOutputZh: string;
  pitfallsZh: string[];
  bestPracticesZh: string[];
  remixZh: string;
  scenariosZh: string[];
  boundaryZh: string;
  notForZh: string[];
  depthPathZh: string;
};

export type ComparisonProfile = {
  learningCurve: ComparisonScale;
  outputConsistency: ComparisonScale;
  flexibility: ComparisonScale;
  operatorDependency: ComparisonScale;
  materialDependency: ComparisonScale;
  workflowCompleteness: ComparisonScale;
  bestForZh: string[];
  notForZh: string[];
};

export type ComparisonEvidence = {
  type: ComparisonEvidenceType;
  summaryZh: string;
  checkedAt: string;
  sourceUrl?: string;
};

export type Skill = {
  id: string;
  titleZh: string;
  originalName: string;
  summaryZh: string;
  growthStage: 'zero_to_one';
  workspace: WorkspaceId;
  categoryId: string;
  comparisonGroupId: string | null;
  methodType: string;
  practiceLevel: PracticeLevel;
  featured: boolean;
  visibility: Visibility;
  discoveredFrom: string[];
  card: {
    outcomeZh: string;
    previewImage: string | null;
    previewLicense: string | null;
  };
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
    githubStars?: number;
    githubStarsCheckedAt?: string;
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
  practiceEvidence?: PracticeEvidence;
  comparisonProfile: ComparisonProfile | null;
  comparisonEvidence: ComparisonEvidence[];
  submittedAt?: string;
  publishedAt?: string;
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

export type CandidateSkill = {
  id: string;
  originalName: string;
  titleZh: string;
  summaryZh: string;
  bucket: CatalogBucketId;
  verificationStatus: 'pending';
  sourceUrl: string | null;
  sourceLabelZh: string;
  origin: { repo: string; commit: string; catalogId: string; checkedAt: string };
  missingChecksZh: string[];
  recommendationReasonZh: string;
};

export type CatalogBucket = {
  id: CatalogBucketId;
  icon: string;
  name: string;
  tagline: string;
  pair: string;
};

export type WorkflowExample = {
  id: string;
  titleZh: string;
  subtitleZh: string;
  descriptionZh: string;
  composition: Array<{ id: string; status: 'verified' | 'pending' }>;
  steps: string[];
  outputZh: string;
};

export type CommunityRecommendation = {
  id: string;
  name: string;
  originalAuthor: string;
  category: string;
  scenario: string;
  description: string;
  agent: string;
  url: string;
  contributor: string | null;
  submittedAt: string;
  status: string;
  recommendationCount: number;
};

export const registry = registryData as Registry;
export const candidateRegistry = candidateData as {
  product: string;
  generatedAt: string;
  stats: { total: number; byBucket: Record<CatalogBucketId, number> };
  buckets: CatalogBucket[];
  candidates: CandidateSkill[];
};
export const workflowRegistry = workflowData as { product: string; generatedAt: string; evidenceStatus: 'scenario_example'; examples: WorkflowExample[] };
export const communityRegistry = communityData as { product: string; generatedAt: string | null; recommendations: CommunityRecommendation[] };

export const publicSkills = registry.skills.filter((skill) => skill.visibility === 'public' && skill.source.type === 'upstream');
export const pendingSkills = candidateRegistry.candidates;
export const CATALOG_BUCKETS = candidateRegistry.buckets;
export const workflowExamples = workflowRegistry.examples;
export const communityRecommendations = communityRegistry.recommendations;

const FORMAL_BUCKET_BY_ID: Record<string, CatalogBucketId> = {
  'seo-audit': 'gather',
  'content-strategy': 'strategize',
  'lead-magnets': 'strategize',
  'copy-editing': 'write',
  'cold-email': 'write',
  video: 'visual',
  'site-architecture': 'auto',
  'ai-seo': 'auto',
  'baoyu-article-illustrator': 'visual',
  'baoyu-markdown-to-html': 'auto',
  'humanizer-zh': 'write',
  'ian-xiaohei-illustrations': 'visual',
  'web-quality-audit': 'auto',
  wewrite: 'write',
  'positioning-messaging': 'strategize',
  'content-marketing': 'strategize',
  'media-relations': 'strategize',
  'page-cro': 'auto',
  'social-content': 'write',
  'premium-ui-design': 'visual',
  'taste-design': 'visual',
  'customer-research': 'gather',
  'competitor-profiling': 'gather',
  last30days: 'gather',
  analytics: 'gather',
  'marketing-plan': 'strategize',
  pricing: 'strategize',
  'product-marketing': 'strategize',
  launch: 'strategize',
  'community-marketing': 'strategize',
  'sales-enablement': 'strategize',
  copywriting: 'write',
  'ad-creative': 'write',
  emails: 'write',
  image: 'visual',
  'baoyu-cover-image': 'visual',
  'gbro-cover-design': 'visual',
  'guizang-ppt-skill': 'visual',
  'gzh-design': 'visual',
  'ip-as-logo': 'visual',
  'mono-color': 'visual',
  'ppt-kit': 'visual',
  'ab-testing': 'auto',
  ads: 'auto',
  'qiaomu-seo': 'auto',
  'yao-geo-page-audit': 'auto'
};

export function catalogBucketForSkill(skill: Pick<Skill, 'id' | 'workspace'>): CatalogBucketId {
  return FORMAL_BUCKET_BY_ID[skill.id] ?? ({ insights: 'gather', strategy: 'strategize', creative: 'write', media: 'auto', operations: 'auto' } as const)[skill.workspace];
}

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
  { id: 'media', number: '04', name: '媒介增长', english: 'MEDIA', question: '去哪里、怎么测、何时上？', output: '渠道 · 预算 · 测试 · 追踪' },
  { id: 'operations', number: '05', name: '运营协作', english: 'OPERATIONS', question: '谁在什么时候交付什么？', output: '倒排 · RACI · 日历 · 复盘' }
];

export const SOURCE_LABELS: Record<SourceType, string> = {
  upstream: '原版推荐',
  adapted: '中国化改编',
  original: 'Open Marketing 原创'
};

export const PRACTICE_LEVEL_LABELS: Record<PracticeLevel, string> = {
  discovered: '被发现',
  source_verified: '来源核验',
  practiced: '实践验证',
  replicated: '多人复现',
  best_practice: '最佳实践'
};

export const COMPARISON_SCALE_LABELS: Record<ComparisonScale, string> = {
  low: '低',
  medium: '中',
  high: '高'
};

export const COMPARISON_EVIDENCE_LABELS: Record<ComparisonEvidenceType, string> = {
  publisher: '项目方说明',
  maintainer_test: '维护者实测',
  community_case: '社区案例',
  inference: '待验证推断'
};

export function skillHref(id: string, base = '') {
  return `${base}/skills/${id}/`;
}

export function comparisonHref(id: string, base = '') {
  return `${base}/compare/${id}/`;
}

export function formatGithubStars(value?: number) {
  if (value === undefined) return '';
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '')}K`;
  return String(value);
}
