export const WORKSPACES = [
  { id: 'insights', name: '洞察研究', caption: '找问题与证据' },
  { id: 'strategy', name: '营销策略', caption: '做选择与计划' },
  { id: 'creation', name: '内容创作', caption: '形成可审稿内容' },
  { id: 'adaptation', name: '渠道适配', caption: '适配平台与场景' },
  { id: 'delivery', name: '上线交付', caption: '准备上线与投放' },
  { id: 'performance', name: '结果复盘', caption: '归集结果与迭代' }
] as const;

export type WorkspaceId = (typeof WORKSPACES)[number]['id'];
export type PackageKind = 'agent' | 'skill' | 'connector';
export type PackageStatus = 'cocreating' | 'pending_validation' | 'installable';
export type InstallState = 'not_installed' | 'installed' | 'modified' | 'update_available';

export interface CatalogSource {
  label: string;
  url: string;
  license: string;
  mode: 'adapted' | 'referenced' | 'original';
}

export interface PermissionDisclosure {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

export interface SkillDependency {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

export interface ValidationRecord {
  role: string;
  industry: string;
  task: string;
  date: string;
  conclusion: string;
  contentVersion: string;
  target: 'Codex';
}

export interface CatalogPackage {
  id: string;
  kind: PackageKind;
  version: string;
  name: string;
  shortDescription: string;
  workspace: WorkspaceId;
  status: PackageStatus;
  maturityNote: string;
  task: string;
  requiredInputs: string[];
  dataSources: string[];
  outputs: string[];
  cannotInfer: string[];
  humanGate: string;
  missingInputBehavior: string;
  channels: string[];
  industries: string[];
  permissions: PermissionDisclosure[];
  bundledSkills: SkillDependency[];
  validation: ValidationRecord[];
  sources: CatalogSource[];
  installState?: InstallState;
  originSlug?: string;
  searchText?: string;
}

export interface CodexStatus {
  cliFound: boolean;
  cliVersion?: string;
  desktopFound: boolean;
  loggedIn: boolean;
  skillsDirectory: string;
  message?: string;
}

export interface InstallRequest {
  packageId: string;
  optionalSkillIds: string[];
  permissionVersion: string;
}

export interface InstallResult {
  status: 'installed' | 'updated' | 'removed' | 'blocked';
  path?: string;
  backupPath?: string;
  message: string;
}
