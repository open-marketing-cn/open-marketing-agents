import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');

function githubSlug(repoUrl) {
  const url = new URL(repoUrl);
  return url.pathname.replace(/^\//, '').replace(/\.git$/, '');
}

function rawSkillUrl(slug, commit, path) {
  const normalized = String(path || '').replace(/^\//, '').replace(/\/$/, '');
  const skillPath = normalized.endsWith('/SKILL.md') || normalized === 'SKILL.md' ? normalized : `${normalized}/SKILL.md`;
  return `https://raw.githubusercontent.com/${slug}/${commit}/${skillPath}`;
}

export function scanRiskFlags(text) {
  return [
    ['destructive-shell', /rm\s+-rf|git\s+reset\s+--hard/i],
    ['privilege-escalation', /\bsudo\b/i],
    ['remote-shell-pipe', /curl[^\n|]*\|\s*(?:sh|bash)|wget[^\n|]*\|\s*(?:sh|bash)/i],
    ['credential-access', /\.ssh|keychain|credentials|\.env\b/i],
    ['external-write', /publish|send message|create campaign|modify account/i]
  ].filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

async function checkLicense(skill, { repo, headCommit, evidence, fetchImpl, headers }) {
  const apiLicense = repo.license?.spdx_id ?? 'NOASSERTION';
  if (apiLicense !== 'NOASSERTION' && apiLicense) {
    return {
      currentLicense: apiLicense,
      licenseStatus: apiLicense === skill.source.license ? 'unchanged' : 'changed',
      licenseEvidence: { method: 'github-spdx', apiLicense }
    };
  }

  // Only a manually reviewed file at this exact pinned revision can resolve an unknown API label.
  const reviewed = evidence.find((item) => item.repo === skill.source.repo
    && item.commit === skill.source.commit && item.license === skill.source.license);
  const unresolved = (reason, details = {}) => ({
    currentLicense: apiLicense,
    licenseStatus: 'unverified',
    licenseEvidence: { method: 'reviewed-file-sha256', apiLicense, reason, ...details }
  });
  if (!reviewed || !/^[a-f0-9]{64}$/.test(reviewed.sha256)
    || !reviewed.path || reviewed.path.startsWith('/') || reviewed.path.split('/').includes('..')) {
    return unresolved('no_matching_reviewed_evidence');
  }
  const slug = githubSlug(skill.source.repo);
  const pinnedUrl = `https://raw.githubusercontent.com/${slug}/${skill.source.commit}/${reviewed.path}`;
  const latestUrl = `https://raw.githubusercontent.com/${slug}/${headCommit}/${reviewed.path}`;
  const details = { path: reviewed.path, expectedSha256: reviewed.sha256, pinnedUrl, latestUrl };
  try {
    const pinnedResponse = await fetchImpl(pinnedUrl, { headers });
    const latestResponse = pinnedUrl === latestUrl ? pinnedResponse : await fetchImpl(latestUrl, { headers });
    if (!pinnedResponse.ok || !latestResponse.ok) return unresolved('license_file_unavailable', details);
    const pinnedBytes = Buffer.from(await pinnedResponse.arrayBuffer());
    const latestBytes = pinnedResponse === latestResponse ? pinnedBytes : Buffer.from(await latestResponse.arrayBuffer());
    const pinnedSha256 = createHash('sha256').update(pinnedBytes).digest('hex');
    const latestSha256 = createHash('sha256').update(latestBytes).digest('hex');
    Object.assign(details, { pinnedSha256, latestSha256 });
    if (pinnedSha256 !== reviewed.sha256) return unresolved('pinned_evidence_mismatch', details);
    if (latestSha256 !== reviewed.sha256) return unresolved('upstream_license_text_changed', details);
    return {
      currentLicense: reviewed.license,
      licenseStatus: 'unchanged',
      licenseEvidence: { method: 'reviewed-file-sha256', apiLicense, ...details }
    };
  } catch {
    return unresolved('license_fetch_failed', details);
  }
}

export async function reviewUpstreamSkill(skill, { repo, headCommit, evidence = [], fetchImpl = fetch, headers = {} }) {
  const slug = githubSlug(skill.source.repo);
  const pinnedUrl = rawSkillUrl(slug, skill.source.commit, skill.source.path);
  const latestUrl = rawSkillUrl(slug, headCommit, skill.source.path);
  const [pinnedResponse, latestResponse] = await Promise.all([fetchImpl(pinnedUrl, { headers }), fetchImpl(latestUrl, { headers })]);
  const [pinnedText, latestText] = await Promise.all([
    pinnedResponse.ok ? pinnedResponse.text() : Promise.resolve(''),
    latestResponse.ok ? latestResponse.text() : Promise.resolve('')
  ]);
  const pinnedRiskFlags = scanRiskFlags(pinnedText);
  const riskFlags = scanRiskFlags(latestText);
  const newRiskFlags = riskFlags.filter((flag) => !pinnedRiskFlags.includes(flag));
  const license = await checkLicense(skill, { repo, headCommit, evidence, fetchImpl, headers });
  const pathMissing = !pinnedResponse.ok || !latestResponse.ok;
  const updateAvailable = headCommit !== skill.source.commit;
  return {
    id: skill.id,
    repo: skill.source.repo,
    path: skill.source.path,
    pinnedCommit: skill.source.commit,
    headCommit,
    checkedAt: new Date().toISOString(),
    pathStatus: pathMissing ? 'missing' : 'ok',
    pinnedLicense: skill.source.license,
    ...license,
    githubStars: repo.stargazers_count,
    githubStarsCheckedAt: new Date().toISOString().slice(0, 10),
    riskFlags,
    newRiskFlags,
    reviewStatus: pathMissing || license.licenseStatus !== 'unchanged' ? 'block_installation'
      : updateAvailable || newRiskFlags.length ? 'review_required' : 'current'
  };
}

export function summarizeResults(results) {
  return {
    total: results.length,
    current: results.filter((item) => item.reviewStatus === 'current').length,
    reviewRequired: results.filter((item) => item.reviewStatus === 'review_required').length,
    blocked: results.filter((item) => item.reviewStatus === 'block_installation').length
  };
}

async function main() {
  const manifestDir = join(root, 'catalog', 'skills');
  const files = (await readdir(manifestDir)).filter((name) => name.endsWith('.yaml')).sort();
  const manifests = await Promise.all(files.map(async (name) => JSON.parse(await readFile(join(manifestDir, name), 'utf8'))));
  const upstream = manifests.filter((skill) => skill.source.type === 'upstream');
  const evidence = JSON.parse(await readFile(join(root, 'catalog', 'upstream-license-evidence.json'), 'utf8'));
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'open-marketing-catalog-review' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  async function getJson(url) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }
  const repoCache = new Map();
  const results = [];
  for (const skill of upstream) {
    const slug = githubSlug(skill.source.repo);
    if (!repoCache.has(slug)) {
      const repo = await getJson(`https://api.github.com/repos/${slug}`);
      const commit = await getJson(`https://api.github.com/repos/${slug}/commits/${repo.default_branch}`);
      repoCache.set(slug, { repo, headCommit: commit.sha });
    }
    results.push(await reviewUpstreamSkill(skill, { ...repoCache.get(slug), evidence, headers }));
  }
  const report = {
    generatedAt: new Date().toISOString(),
    policy: '只检查文本、路径、许可证和版本；不执行候选仓库脚本，不自动覆盖正式目录。未知许可证仅可用固定版本及当前版本均匹配已人工核验的许可证文件哈希回退；未知或变化仍阻止安装。',
    summary: summarizeResults(results),
    sources: results
  };
  await writeFile(join(root, 'generated', 'updates.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.summary));
  if (report.summary.blocked > 0) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
