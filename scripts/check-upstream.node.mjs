import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reviewUpstreamSkill, summarizeResults } from './check-upstream.mjs';

const pinnedCommit = 'a'.repeat(40);
const headCommit = 'b'.repeat(40);
const licenseBytes = Buffer.from('Reviewed test license\n');
const sha256 = createHash('sha256').update(licenseBytes).digest('hex');
const skill = { id: 'example', source: { repo: 'https://github.com/example/skill', commit: pinnedCommit, path: 'SKILL.md', license: 'MIT' } };
const reviewed = { repo: skill.source.repo, commit: pinnedCommit, path: 'LICENSE', license: 'MIT', sha256 };

async function review({ apiLicense = 'NOASSERTION', head = pinnedCommit, evidence = [reviewed], pinnedLicense = licenseBytes,
  latestLicense = licenseBytes, missingSkill = false, pinnedSkill = 'safe instructions', latestSkill = 'safe instructions', throwLicense = false } = {}) {
  return reviewUpstreamSkill(skill, {
    repo: { license: apiLicense === null ? null : { spdx_id: apiLicense }, stargazers_count: 1 }, headCommit: head, evidence,
    fetchImpl: async (url) => {
      if (url.endsWith('/LICENSE')) {
        if (throwLicense) throw new Error('offline');
        const bytes = url.includes(`/${pinnedCommit}/`) ? pinnedLicense : latestLicense;
        return bytes === null ? new Response('', { status: 404 }) : new Response(bytes);
      }
      if (missingSkill) return new Response('', { status: 404 });
      return new Response(url.includes(`/${pinnedCommit}/`) ? pinnedSkill : latestSkill);
    }
  });
}

test('resolves NOASSERTION only with reviewed bytes at the pinned revision', async () => {
  const result = await review();
  assert.equal(result.reviewStatus, 'current');
  assert.equal(result.currentLicense, 'MIT');
  assert.equal(result.licenseStatus, 'unchanged');
  assert.equal(result.licenseEvidence.apiLicense, 'NOASSERTION');
  assert.equal(result.licenseEvidence.pinnedSha256, sha256);
  assert.equal(result.licenseEvidence.latestSha256, sha256);
});

test('checks latest license bytes and keeps a new revision queued for review', async () => {
  const result = await review({ head: headCommit });
  assert.equal(result.reviewStatus, 'review_required');
  assert.equal(result.licenseEvidence.latestUrl, `https://raw.githubusercontent.com/example/skill/${headCommit}/LICENSE`);
});

test('also requires reviewed evidence when the API has no license object', async () => {
  assert.equal((await review({ apiLicense: null })).reviewStatus, 'current');
  assert.equal((await review({ apiLicense: null, evidence: [] })).reviewStatus, 'block_installation');
});

test('unknown API licenses without reviewed evidence remain blocked', async () => {
  const result = await review({ evidence: [] });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.currentLicense, 'NOASSERTION');
  assert.equal(result.licenseStatus, 'unverified');
});

test('evidence cannot be reused for another repository, revision or license', async () => {
  for (const change of [{ repo: 'https://github.com/another/skill' }, { commit: headCommit }, { license: 'Apache-2.0' }, { sha256: 'invalid' }, { path: '../LICENSE' }]) {
    assert.equal((await review({ evidence: [{ ...reviewed, ...change }] })).reviewStatus, 'block_installation');
  }
});

test('pinned license bytes must match the manual review', async () => {
  const result = await review({ pinnedLicense: Buffer.from('Different license') });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.licenseEvidence.reason, 'pinned_evidence_mismatch');
});

test('changed latest license bytes remain blocked even with an unchanged API unknown label', async () => {
  const result = await review({ head: headCommit, latestLicense: Buffer.from('Different license') });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.licenseEvidence.reason, 'upstream_license_text_changed');
});

test('raw-byte differences require review instead of whitespace normalization', async () => {
  assert.equal((await review({ head: headCommit, latestLicense: Buffer.from('Reviewed test license\r\n') })).reviewStatus, 'block_installation');
});

test('missing pinned or head LICENSE stays blocked', async () => {
  for (const change of [{ pinnedLicense: null }, { head: headCommit, latestLicense: null }]) {
    const result = await review(change);
    assert.equal(result.reviewStatus, 'block_installation');
    assert.equal(result.licenseEvidence.reason, 'license_file_unavailable');
  }
});

test('license network failures stay blocked with a reportable reason', async () => {
  const result = await review({ throwLicense: true });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.licenseEvidence.reason, 'license_fetch_failed');
});

test('recognized SPDX changes cannot be overridden by fallback evidence', async () => {
  const result = await review({ apiLicense: 'Apache-2.0', throwLicense: true });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.currentLicense, 'Apache-2.0');
  assert.equal(result.licenseStatus, 'changed');
  assert.equal(result.licenseEvidence.method, 'github-spdx');
});

test('recognized unchanged SPDX keeps the existing success path', async () => {
  assert.equal((await review({ apiLicense: 'MIT', evidence: [], throwLicense: true })).reviewStatus, 'current');
});

test('verified license fallback does not bypass missing Skill paths', async () => {
  const result = await review({ missingSkill: true });
  assert.equal(result.reviewStatus, 'block_installation');
  assert.equal(result.pathStatus, 'missing');
});

test('verified license fallback preserves new-risk detection', async () => {
  const result = await review({ head: headCommit, latestSkill: 'sudo remove temporary files' });
  assert.equal(result.reviewStatus, 'review_required');
  assert.deepEqual(result.newRiskFlags, ['privilege-escalation']);
});

test('unknowns and changes contribute to the blocking summary used by the CLI', async () => {
  const results = await Promise.all([review(), review({ head: headCommit }), review({ evidence: [] }), review({ apiLicense: 'Apache-2.0' })]);
  assert.deepEqual(summarizeResults(results), { total: 4, current: 1, reviewRequired: 1, blocked: 2 });
});

test('checked-in evidence matches the exact manifests and records full pinned commits', async () => {
  const evidence = JSON.parse(await readFile(new URL('../catalog/upstream-license-evidence.json', import.meta.url), 'utf8'));
  const manifests = await Promise.all(['gbro-cover-design', 'gzh-design'].map(async (id) => JSON.parse(await readFile(new URL(`../catalog/skills/${id}.yaml`, import.meta.url), 'utf8'))));
  for (const manifest of manifests) {
    const item = evidence.find((record) => record.repo === manifest.source.repo && record.commit === manifest.source.commit && record.license === manifest.source.license);
    assert.ok(item);
    assert.match(item.commit, /^[a-f0-9]{40}$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.equal(item.path, 'LICENSE');
    assert.match(item.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(manifests[1].source.license, 'AGPL-3.0-or-later');
});
