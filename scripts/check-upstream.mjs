import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestDir = join(root, 'catalog', 'skills');
const files = (await readdir(manifestDir)).filter((name) => name.endsWith('.yaml')).sort();
const manifests = await Promise.all(files.map(async (name) => JSON.parse(await readFile(join(manifestDir, name), 'utf8'))));
const upstream = manifests.filter((skill) => skill.source.type === 'upstream');
const token = process.env.GITHUB_TOKEN;
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'open-marketing-catalog-review' };
if (token) headers.Authorization = `Bearer ${token}`;

function githubSlug(repoUrl) {
  const url = new URL(repoUrl);
  return url.pathname.replace(/^\//, '').replace(/\.git$/, '');
}

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const repoCache = new Map();
const results = [];
function scanRiskFlags(text) {
  return [
    ['destructive-shell', /rm\s+-rf|git\s+reset\s+--hard/i],
    ['privilege-escalation', /\bsudo\b/i],
    ['remote-shell-pipe', /curl[^\n|]*\|\s*(?:sh|bash)|wget[^\n|]*\|\s*(?:sh|bash)/i],
    ['credential-access', /\.ssh|keychain|credentials|\.env\b/i],
    ['external-write', /publish|send message|create campaign|modify account/i]
  ].filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}
for (const skill of upstream) {
  const slug = githubSlug(skill.source.repo);
  if (!repoCache.has(slug)) {
    const repo = await getJson(`https://api.github.com/repos/${slug}`);
    const commit = await getJson(`https://api.github.com/repos/${slug}/commits/${repo.default_branch}`);
    repoCache.set(slug, { repo, headCommit: commit.sha });
  }
  const { repo, headCommit } = repoCache.get(slug);
  const pinnedUrl = `https://raw.githubusercontent.com/${slug}/${skill.source.commit}/${skill.source.path}/SKILL.md`;
  const latestUrl = `https://raw.githubusercontent.com/${slug}/${headCommit}/${skill.source.path}/SKILL.md`;
  const [pinnedResponse, latestResponse] = await Promise.all([fetch(pinnedUrl, { headers }), fetch(latestUrl, { headers })]);
  const [pinnedText, latestText] = await Promise.all([
    pinnedResponse.ok ? pinnedResponse.text() : Promise.resolve(''),
    latestResponse.ok ? latestResponse.text() : Promise.resolve('')
  ]);
  const pinnedRiskFlags = scanRiskFlags(pinnedText);
  const riskFlags = scanRiskFlags(latestText);
  const newRiskFlags = riskFlags.filter((flag) => !pinnedRiskFlags.includes(flag));
  const currentLicense = repo.license?.spdx_id ?? 'NOASSERTION';
  const pathMissing = !pinnedResponse.ok || !latestResponse.ok;
  const licenseChanged = currentLicense !== skill.source.license;
  const updateAvailable = headCommit !== skill.source.commit;
  results.push({
    id: skill.id,
    repo: skill.source.repo,
    path: skill.source.path,
    pinnedCommit: skill.source.commit,
    headCommit,
    checkedAt: new Date().toISOString(),
    pathStatus: pathMissing ? 'missing' : 'ok',
    pinnedLicense: skill.source.license,
    currentLicense,
    riskFlags,
    newRiskFlags,
    reviewStatus: pathMissing ? 'block_installation' : licenseChanged ? 'block_installation' : updateAvailable || newRiskFlags.length ? 'review_required' : 'current'
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  policy: '只检查文本、路径、许可证和版本；不执行候选仓库脚本，不自动覆盖正式目录。',
  summary: {
    total: results.length,
    current: results.filter((item) => item.reviewStatus === 'current').length,
    reviewRequired: results.filter((item) => item.reviewStatus === 'review_required').length,
    blocked: results.filter((item) => item.reviewStatus === 'block_installation').length
  },
  sources: results
};
await writeFile(join(root, 'generated', 'updates.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
if (report.summary.blocked > 0) process.exitCode = 1;
