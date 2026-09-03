import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestsDir = join(root, 'catalog', 'skills');
const intakeDir = join(root, 'catalog', 'intake');
const legacyCatalogFile = join(root, 'catalog', 'legacy-catalog.json');
const localSkillsDir = join(root, 'skills');
const generatedDir = join(root, 'generated');
const downloadsDir = join(root, 'static', 'downloads');
const workspaces = ['insights', 'strategy', 'creative', 'media', 'operations'];
const sourceTypes = ['upstream', 'adapted', 'original'];
const validationStatuses = ['passed', 'pending', 'failed'];
const visibilityValues = ['public', 'candidate', 'paused_internal', 'withdrawn'];
const practiceLevels = ['discovered', 'source_verified', 'practiced', 'replicated', 'best_practice'];
const comparisonScales = ['low', 'medium', 'high'];
const comparisonEvidenceTypes = ['publisher', 'maintainer_test', 'community_case', 'inference'];
const defaultFeaturedIds = new Set([
  'customer-research', 'competitor-profiling', 'last30days',
  'product-marketing', 'marketing-plan', 'pricing',
  'copywriting', 'ad-creative', 'baoyu-cover-image',
  'ads', 'launch', 'qiaomu-seo',
  'emails', 'community-marketing', 'sales-enablement',
  'ip-as-logo', 'gzh-design', 'gbro-cover-design', 'mono-color'
]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeSkillSourceKey(source) {
  let repo = source.repo.trim().replace(/\/+$/, '').replace(/\.git$/i, '').toLocaleLowerCase('en-US');
  try {
    const url = new URL(repo);
    repo = `${url.hostname.toLocaleLowerCase('en-US')}${url.pathname.replace(/\/+$/, '').replace(/\.git$/i, '').toLocaleLowerCase('en-US')}`;
  } catch {}
  const path = source.path.trim().replace(/^\/+|\/+$/g, '').replace(/\/?SKILL\.md$/i, '').toLocaleLowerCase('en-US');
  return `${repo}|${path}`;
}

function fail(message) { throw new Error(`[catalog] ${message}`); }
function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a non-empty string`);
}
function requireStringArray(value, label, exactLength) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) fail(`${label} must be a non-empty string array`);
  if (exactLength !== undefined && value.length !== exactLength) fail(`${label} must contain ${exactLength} items`);
}
function validateStatus(record, label) {
  if (!record || !validationStatuses.includes(record.status)) fail(`${label}.status is invalid`);
  requireString(record.checkedAt, `${label}.checkedAt`);
  requireString(record.noteZh, `${label}.noteZh`);
}
function validatePracticeEvidence(evidence, label) {
  if (!evidence || typeof evidence !== 'object') fail(`${label} is required when practice validation passes`);
  for (const field of ['caseTitleZh', 'contextZh', 'inputZh', 'outputZh', 'evidenceUrl', 'practitionerRole', 'attributionZh', 'howToUseZh', 'setupZh', 'expectedOutputZh', 'boundaryZh', 'depthPathZh', 'remixZh']) {
    requireString(evidence[field], `${label}.${field}`);
  }
  requireStringArray(evidence.scenariosZh, `${label}.scenariosZh`);
  if (evidence.scenariosZh.length < 2) fail(`${label}.scenariosZh must contain at least 2 items`);
  for (const field of ['pitfallsZh', 'bestPracticesZh', 'notForZh']) requireStringArray(evidence[field], `${label}.${field}`);
}
function validateComparisonProfile(profile, label) {
  if (!profile || typeof profile !== 'object') fail(`${label} must be an object`);
  for (const field of ['learningCurve', 'outputConsistency', 'flexibility', 'operatorDependency', 'materialDependency', 'workflowCompleteness']) {
    if (!comparisonScales.includes(profile[field])) fail(`${label}.${field} is invalid`);
  }
  requireStringArray(profile.bestForZh, `${label}.bestForZh`);
  requireStringArray(profile.notForZh, `${label}.notForZh`);
}
function validateComparisonEvidence(evidence, label) {
  if (!Array.isArray(evidence)) fail(`${label} must be an array`);
  for (const [index, item] of evidence.entries()) {
    if (!item || !comparisonEvidenceTypes.includes(item.type)) fail(`${label}[${index}].type is invalid`);
    requireString(item.summaryZh, `${label}[${index}].summaryZh`);
    requireString(item.checkedAt, `${label}[${index}].checkedAt`);
    if (item.sourceUrl !== undefined) requireString(item.sourceUrl, `${label}[${index}].sourceUrl`);
  }
}
function validateManifest(skill, filename) {
  requireString(skill.id, `${filename}.id`);
  if (!slugPattern.test(skill.id) || `${skill.id}.yaml` !== filename) fail(`${filename} must match a valid skill id`);
  for (const field of ['titleZh', 'originalName', 'summaryZh', 'humanGate']) requireString(skill[field], `${skill.id}.${field}`);
  if (!slugPattern.test(skill.originalName)) fail(`${skill.id}.originalName is invalid`);
  if (skill.growthStage !== 'zero_to_one') fail(`${skill.id}.growthStage must be zero_to_one`);
  if (!workspaces.includes(skill.workspace)) fail(`${skill.id}.workspace is invalid`);
  if (skill.categoryId !== undefined && !slugPattern.test(skill.categoryId)) fail(`${skill.id}.categoryId is invalid`);
  if (skill.comparisonGroupId !== undefined && !slugPattern.test(skill.comparisonGroupId)) fail(`${skill.id}.comparisonGroupId is invalid`);
  if (skill.methodType !== undefined) requireString(skill.methodType, `${skill.id}.methodType`);
  if (skill.practiceLevel !== undefined && !practiceLevels.includes(skill.practiceLevel)) fail(`${skill.id}.practiceLevel is invalid`);
  for (const field of ['audiences', 'useCases', 'inputs', 'outputs', 'cannotInfer', 'channels']) requireStringArray(skill[field], `${skill.id}.${field}`);
  requireStringArray(skill.promptExamples, `${skill.id}.promptExamples`, 3);
  if (!skill.source || !sourceTypes.includes(skill.source.type)) fail(`${skill.id}.source.type is invalid`);
  for (const field of ['repo', 'path', 'commit', 'author', 'license', 'checkedAt']) requireString(skill.source[field], `${skill.id}.source.${field}`);
  if (skill.source.githubStars !== undefined && (!Number.isInteger(skill.source.githubStars) || skill.source.githubStars < 0)) fail(`${skill.id}.source.githubStars must be a non-negative integer`);
  if (skill.source.githubStarsCheckedAt !== undefined) requireString(skill.source.githubStarsCheckedAt, `${skill.id}.source.githubStarsCheckedAt`);
  if (!/^[a-f0-9]{7,40}$/.test(skill.source.commit)) fail(`${skill.id}.source.commit must be a commit SHA`);
  if (/unknown|pending|noassertion/i.test(skill.source.license)) fail(`${skill.id} cannot be public without a verified license`);
  for (const field of ['codex', 'claudeCode']) requireString(skill.installation?.[field], `${skill.id}.installation.${field}`);
  validateStatus(skill.validation?.spec, `${skill.id}.validation.spec`);
  validateStatus(skill.validation?.installation, `${skill.id}.validation.installation`);
  validateStatus(skill.validation?.practice, `${skill.id}.validation.practice`);
  if (skill.validation.practice.status === 'passed') validatePracticeEvidence(skill.practiceEvidence, `${skill.id}.practiceEvidence`);
  if (!Array.isArray(skill.relatedSkillIds) || skill.relatedSkillIds.includes(skill.id)) fail(`${skill.id}.relatedSkillIds is invalid`);
  if (skill.visibility !== undefined && !visibilityValues.includes(skill.visibility)) fail(`${skill.id}.visibility is invalid`);
  if (skill.featured !== undefined && typeof skill.featured !== 'boolean') fail(`${skill.id}.featured must be boolean`);
  if (skill.discoveredFrom !== undefined) requireStringArray(skill.discoveredFrom, `${skill.id}.discoveredFrom`);
  if (skill.card !== undefined) {
    requireString(skill.card.outcomeZh, `${skill.id}.card.outcomeZh`);
    if (skill.card.previewImage !== null && skill.card.previewImage !== undefined) requireString(skill.card.previewImage, `${skill.id}.card.previewImage`);
    if (skill.card.previewLicense !== null && skill.card.previewLicense !== undefined) requireString(skill.card.previewLicense, `${skill.id}.card.previewLicense`);
  }
  if (skill.comparisonProfile !== undefined) validateComparisonProfile(skill.comparisonProfile, `${skill.id}.comparisonProfile`);
  if (skill.comparisonEvidence !== undefined) validateComparisonEvidence(skill.comparisonEvidence, `${skill.id}.comparisonEvidence`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.DS_Store') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  return crc >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}
function makeZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const dosTime = 12 << 11;
  const dosDate = ((2026 - 1980) << 9) | (8 << 5) | 31;
  for (const entry of entries) {
    const name = Buffer.from(entry.name.replaceAll('\\', '/'));
    const data = entry.data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(0, 10); central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34); central.writeUInt16LE(0, 36); central.writeUInt32LE(0, 38); central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const directory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, directory, end]);
}

async function validateLocalPackage(skill) {
  const dir = join(localSkillsDir, skill.id);
  const skillFile = join(dir, 'SKILL.md');
  try { await stat(skillFile); } catch { fail(`${skill.id} is ${skill.source.type} but ${relative(root, skillFile)} is missing`); }
  const content = await readFile(skillFile, 'utf8');
  const exposedName = content.match(/^name:\s*([^\n]+)$/m)?.[1]?.trim();
  if (exposedName !== skill.id) fail(`${skill.id} SKILL.md exposes ${exposedName ?? 'no name'} instead of one matching name`);
  if (skill.source.type === 'adapted') {
    for (const file of ['NOTICE.md', 'LICENSE.upstream']) {
      try { await stat(join(dir, file)); } catch { fail(`${skill.id} adapted package is missing ${file}`); }
    }
  }
  const files = await walk(dir);
  const entries = await Promise.all(files.map(async (file) => ({ name: `${skill.id}/${relative(dir, file)}`, data: await readFile(file) })));
  await writeFile(join(downloadsDir, `${skill.id}.zip`), makeZip(entries));
}

await mkdir(generatedDir, { recursive: true });
await mkdir(downloadsDir, { recursive: true });
const files = (await readdir(manifestsDir)).filter((name) => name.endsWith('.yaml')).sort();
const skills = [];
for (const filename of files) {
  let skill;
  try { skill = JSON.parse(await readFile(join(manifestsDir, filename), 'utf8')); }
  catch (error) { fail(`${filename} must be JSON-compatible YAML: ${error.message}`); }
  validateManifest(skill, filename);
  skills.push(skill);
}
skills.sort((left, right) => {
  const stageDelta = workspaces.indexOf(left.workspace) - workspaces.indexOf(right.workspace);
  return stageDelta || left.id.localeCompare(right.id);
});
const ids = new Set();
const sourceKeys = new Map();
for (const skill of skills) {
  if (ids.has(skill.id)) fail(`duplicate id ${skill.id}`);
  ids.add(skill.id);
  const sourceKey = normalizeSkillSourceKey(skill.source);
  const duplicateId = sourceKeys.get(sourceKey);
  if (duplicateId) fail(`${skill.id} duplicates source repo + Skill path already used by ${duplicateId}`);
  sourceKeys.set(sourceKey, skill.id);
}
for (const skill of skills) {
  for (const related of skill.relatedSkillIds) if (!ids.has(related)) fail(`${skill.id} references missing related skill ${related}`);
  if (skill.source.type !== 'upstream') await validateLocalPackage(skill);
}

const catalogVersion = skills.map((skill) => skill.source.checkedAt).sort().at(-1);
const buildCommit = /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '') ? process.env.GITHUB_SHA : null;
const normalizedSkills = skills.map((skill) => ({
  ...skill,
  categoryId: skill.categoryId ?? skill.workspace,
  comparisonGroupId: skill.comparisonGroupId ?? null,
  methodType: skill.methodType ?? '通用任务型',
  practiceLevel: skill.practiceLevel ?? (skill.validation.practice.status === 'passed' ? 'practiced' : skill.validation.spec.status === 'passed' ? 'source_verified' : 'discovered'),
  comparisonProfile: skill.comparisonProfile ?? null,
  comparisonEvidence: skill.comparisonEvidence ?? [],
  featured: skill.featured ?? defaultFeaturedIds.has(skill.id),
  visibility: skill.visibility ?? (skill.source.type === 'upstream' ? 'public' : 'paused_internal'),
  discoveredFrom: skill.discoveredFrom ?? ['github'],
  card: skill.card ?? { outcomeZh: skill.summaryZh, previewImage: null, previewLicense: null },
}));
const publicSkills = normalizedSkills.filter((skill) => skill.visibility === 'public' && skill.source.type === 'upstream').map((skill) => ({
  ...skill,
  source: skill.source.type === 'upstream' || !buildCommit ? skill.source : { ...skill.source, commit: buildCommit },
  relatedSkillIds: skill.relatedSkillIds.filter((relatedId) => normalizedSkills.some((related) => related.id === relatedId && related.visibility === 'public' && related.source.type === 'upstream')),
  installable: skill.validation.spec.status === 'passed' && skill.validation.installation.status === 'passed'
}));
const stats = {
  total: publicSkills.length,
  byWorkspace: Object.fromEntries(workspaces.map((workspace) => [workspace, publicSkills.filter((skill) => skill.workspace === workspace).length])),
  bySource: Object.fromEntries(sourceTypes.map((type) => [type, publicSkills.filter((skill) => skill.source.type === type).length])),
  installable: publicSkills.filter((skill) => skill.installable).length,
  practiceValidated: publicSkills.filter((skill) => skill.validation.practice.status === 'passed').length
};
const registry = { product: 'Open Marketing Skills', growthStage: 'zero_to_one', catalogVersion, stats, skills: publicSkills };
const searchIndex = publicSkills.map((skill) => ({
  id: skill.id, titleZh: skill.titleZh, originalName: skill.originalName, workspace: skill.workspace,
  categoryId: skill.categoryId, comparisonGroupId: skill.comparisonGroupId, methodType: skill.methodType, practiceLevel: skill.practiceLevel,
  sourceType: skill.source.type, installable: skill.installable, featured: skill.featured,
  text: [skill.titleZh, skill.originalName, skill.summaryZh, skill.card.outcomeZh, skill.categoryId, skill.methodType, ...skill.audiences, ...skill.useCases, ...skill.inputs, ...skill.outputs, ...skill.channels, ...(skill.comparisonProfile?.bestForZh ?? []), ...(skill.comparisonProfile?.notForZh ?? []), skill.source.author].join(' ').toLocaleLowerCase('zh-CN')
}));
await writeFile(join(generatedDir, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
await writeFile(join(generatedDir, 'search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`);

const legacyCatalog = JSON.parse(await readFile(legacyCatalogFile, 'utf8'));
if (!Array.isArray(legacyCatalog.skills) || !Array.isArray(legacyCatalog.buckets) || !Array.isArray(legacyCatalog.workflowExamples)) {
  fail('catalog/legacy-catalog.json must contain skills, buckets and workflowExamples arrays');
}
const legacyIds = new Set();
for (const item of legacyCatalog.skills) {
  for (const field of ['id', 'bucket', 'titleZh', 'summaryZh']) requireString(item[field], `legacy.${item.id ?? 'unknown'}.${field}`);
  if (legacyIds.has(item.id)) fail(`duplicate legacy catalog id ${item.id}`);
  legacyIds.add(item.id);
}
const bucketIds = new Set(legacyCatalog.buckets.map((bucket) => bucket.id));
for (const item of legacyCatalog.skills) if (!bucketIds.has(item.bucket)) fail(`legacy ${item.id} uses unknown bucket ${item.bucket}`);

const intakeFiles = (await readdir(intakeDir)).filter((name) => name.endsWith('.yaml') && name !== 'external-discovery-2026-09-01.yaml').sort();
const intakeById = new Map();
for (const filename of intakeFiles) {
  const record = JSON.parse(await readFile(join(intakeDir, filename), 'utf8'));
  if (record.id) intakeById.set(record.id, record);
}
const publicIds = new Set(publicSkills.map((skill) => skill.id));
const candidates = legacyCatalog.skills
  .filter((item) => {
    if (publicIds.has(item.id)) return false;
    const review = intakeById.get(item.id)?.review ?? {};
    const mappedPublicId = typeof review.publicSkillId === 'string' ? review.publicSkillId : '';
    return !['public', 'public_alternative'].includes(review.decision) || !publicIds.has(mappedPublicId);
  })
  .map((item) => {
    const intake = intakeById.get(item.id) ?? {};
    const review = intake.review ?? {};
    const missingChecksZh = [];
    if (review.path !== 'verified') missingChecksZh.push('真实 SKILL.md 路径');
    if (review.license === 'pending') missingChecksZh.push('内容许可证');
    if (review.independent !== 'verified') missingChecksZh.push('独立安装与触发');
    missingChecksZh.push('真实使用案例与署名');
    const sourceUrl = typeof intake.claimedSource === 'string' && /^https?:\/\//.test(intake.claimedSource) ? intake.claimedSource : null;
    return {
      id: item.id,
      originalName: item.id,
      titleZh: item.titleZh,
      summaryZh: item.summaryZh,
      bucket: item.bucket,
      verificationStatus: 'pending',
      sourceUrl,
      sourceLabelZh: sourceUrl ? new URL(sourceUrl).hostname.replace(/^www\./, '') : '来源待补',
      origin: {
        repo: legacyCatalog.source.repo,
        commit: legacyCatalog.source.commit,
        catalogId: item.id,
        checkedAt: legacyCatalog.source.checkedAt
      },
      missingChecksZh,
      recommendationReasonZh: '来自旧版 Brand Marketing Skills 的场景策展；正式收录前仍需完成来源、安装与实践核验。'
    };
  });

const candidateRegistry = {
  product: 'Open Marketing Skill Candidates',
  generatedAt: catalogVersion,
  stats: {
    total: candidates.length,
    byBucket: Object.fromEntries(legacyCatalog.buckets.map((bucket) => [bucket.id, candidates.filter((item) => item.bucket === bucket.id).length]))
  },
  buckets: legacyCatalog.buckets,
  candidates
};
const workflowRegistry = {
  product: 'Open Marketing Workflow Examples',
  generatedAt: catalogVersion,
  evidenceStatus: 'scenario_example',
  examples: legacyCatalog.workflowExamples.map((workflow) => ({
    ...workflow,
    composition: workflow.composition.map((id) => ({ id, status: publicIds.has(id) ? 'verified' : 'pending' }))
  }))
};
await writeFile(join(generatedDir, 'candidates.json'), `${JSON.stringify(candidateRegistry, null, 2)}\n`);
await writeFile(join(generatedDir, 'workflow-examples.json'), `${JSON.stringify(workflowRegistry, null, 2)}\n`);
let previousUpdates = null;
try { previousUpdates = JSON.parse(await readFile(join(generatedDir, 'updates.json'), 'utf8')); } catch {}
const previousSources = new Map((previousUpdates?.sources ?? []).map((source) => [source.id, source]));
const updateSources = publicSkills.map((skill) => ({
  ...previousSources.get(skill.id),
  id: skill.id,
  repo: skill.source.repo,
  path: skill.source.path,
  pinnedCommit: skill.source.commit,
  githubStars: skill.source.githubStars,
  githubStarsCheckedAt: skill.source.githubStarsCheckedAt,
  checkedAt: previousSources.get(skill.id)?.checkedAt ?? skill.source.checkedAt,
  reviewStatus: previousSources.get(skill.id)?.reviewStatus ?? 'pending_remote_review'
}));
const updates = {
  generatedAt: previousUpdates?.generatedAt ?? new Date().toISOString(),
  catalogVersion,
  policy: '上游更新只生成复审记录，不自动覆盖中文介绍或本仓库改编版。',
  summary: {
    total: updateSources.length,
    current: updateSources.filter((item) => item.reviewStatus === 'current').length,
    reviewRequired: updateSources.filter((item) => item.reviewStatus === 'review_required' || item.reviewStatus === 'pending_remote_review').length,
    blocked: updateSources.filter((item) => item.reviewStatus === 'block_installation').length
  },
  sources: updateSources
};
await writeFile(join(generatedDir, 'updates.json'), `${JSON.stringify(updates, null, 2)}\n`);
console.log(`Generated ${stats.total} skills: ${stats.bySource.upstream} upstream, ${stats.bySource.adapted} adapted, ${stats.bySource.original} original.`);
