import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestsDir = join(root, 'catalog', 'skills');
const localSkillsDir = join(root, 'skills');
const generatedDir = join(root, 'generated');
const downloadsDir = join(root, 'static', 'downloads');
const workspaces = ['insights', 'strategy', 'creative', 'media', 'operations'];
const sourceTypes = ['upstream', 'adapted', 'original'];
const validationStatuses = ['passed', 'pending', 'failed'];
const visibilityValues = ['public', 'candidate', 'paused_internal', 'withdrawn'];
const defaultFeaturedIds = new Set([
  'customer-research', 'competitor-profiling', 'last30days',
  'product-marketing', 'marketing-plan', 'pricing',
  'copywriting', 'ad-creative', 'baoyu-cover-image',
  'ads', 'launch', 'qiaomu-seo',
  'emails', 'community-marketing', 'sales-enablement',
  'ip-as-logo', 'gzh-design', 'gbro-cover-design', 'mono-color'
]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
function validateManifest(skill, filename) {
  requireString(skill.id, `${filename}.id`);
  if (!slugPattern.test(skill.id) || `${skill.id}.yaml` !== filename) fail(`${filename} must match a valid skill id`);
  for (const field of ['titleZh', 'originalName', 'summaryZh', 'humanGate']) requireString(skill[field], `${skill.id}.${field}`);
  if (!slugPattern.test(skill.originalName)) fail(`${skill.id}.originalName is invalid`);
  if (skill.growthStage !== 'zero_to_one') fail(`${skill.id}.growthStage must be zero_to_one`);
  if (!workspaces.includes(skill.workspace)) fail(`${skill.id}.workspace is invalid`);
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
  if (!Array.isArray(skill.relatedSkillIds) || skill.relatedSkillIds.includes(skill.id)) fail(`${skill.id}.relatedSkillIds is invalid`);
  if (skill.visibility !== undefined && !visibilityValues.includes(skill.visibility)) fail(`${skill.id}.visibility is invalid`);
  if (skill.featured !== undefined && typeof skill.featured !== 'boolean') fail(`${skill.id}.featured must be boolean`);
  if (skill.discoveredFrom !== undefined) requireStringArray(skill.discoveredFrom, `${skill.id}.discoveredFrom`);
  if (skill.card !== undefined) {
    requireString(skill.card.outcomeZh, `${skill.id}.card.outcomeZh`);
    if (skill.card.previewImage !== null && skill.card.previewImage !== undefined) requireString(skill.card.previewImage, `${skill.id}.card.previewImage`);
    if (skill.card.previewLicense !== null && skill.card.previewLicense !== undefined) requireString(skill.card.previewLicense, `${skill.id}.card.previewLicense`);
  }
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
for (const skill of skills) {
  if (ids.has(skill.id)) fail(`duplicate id ${skill.id}`);
  ids.add(skill.id);
}
for (const skill of skills) {
  for (const related of skill.relatedSkillIds) if (!ids.has(related)) fail(`${skill.id} references missing related skill ${related}`);
  if (skill.source.type !== 'upstream') await validateLocalPackage(skill);
}

const catalogVersion = skills.map((skill) => skill.source.checkedAt).sort().at(-1);
const buildCommit = /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '') ? process.env.GITHUB_SHA : null;
const normalizedSkills = skills.map((skill) => ({
  ...skill,
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
  sourceType: skill.source.type, installable: skill.installable, featured: skill.featured,
  text: [skill.titleZh, skill.originalName, skill.summaryZh, skill.card.outcomeZh, ...skill.audiences, ...skill.useCases, ...skill.inputs, ...skill.outputs, ...skill.channels, skill.source.author].join(' ').toLocaleLowerCase('zh-CN')
}));
await writeFile(join(generatedDir, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
await writeFile(join(generatedDir, 'search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`);
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
