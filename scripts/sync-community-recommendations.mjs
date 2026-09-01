import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const defaultOutput = join(root, 'generated', 'community-recommendations.json');
const requiredFields = ['名称', '原作者名称', '分类', '使用场景', '一句话描述', '适配 Agent', 'Skill / 仓库链接'];
const publicStatuses = new Set(['社区推荐 · 未核验', '已正式收录']);

function textValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join('、');
  if (typeof value === 'object') {
    return textValue(value.text ?? value.name ?? value.label ?? value.link ?? value.url ?? value.value ?? '');
  }
  return '';
}

function safeHttpUrl(value) {
  const text = textValue(value);
  const markdownMatch = text.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/i);
  const raw = markdownMatch?.[1] ?? text;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function canonicalizeSkillUrl(value) {
  const safe = safeHttpUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  const pathname = url.pathname.replace(/\/+$/, '').replace(/\.git$/i, '').toLocaleLowerCase('en-US');
  return `${url.hostname.toLocaleLowerCase('en-US')}${pathname}`;
}

function isoTime(value) {
  if (!value) return null;
  const numeric = Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric < 1e12 ? numeric * 1000 : numeric) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildCommunityPreview(records, options = {}) {
  const limit = options.limit ?? 6;
  const grouped = new Map();
  for (const record of records) {
    const fields = record.fields ?? {};
    const status = textValue(fields['公开状态']);
    if (status && !publicStatuses.has(status)) continue;
    if (requiredFields.some((field) => !textValue(fields[field]))) continue;
    const url = safeHttpUrl(fields['Skill / 仓库链接']);
    const canonicalUrl = canonicalizeSkillUrl(url);
    if (!url || !canonicalUrl) continue;
    const submittedAt = isoTime(fields['提交时间'] ?? record.created_time) ?? '1970-01-01T00:00:00.000Z';
    const item = {
      id: textValue(fields['编号']) || record.record_id,
      name: textValue(fields['名称']).slice(0, 100),
      originalAuthor: textValue(fields['原作者名称']).slice(0, 100),
      category: textValue(fields['分类']).slice(0, 60),
      scenario: textValue(fields['使用场景']).slice(0, 180),
      description: textValue(fields['一句话描述']).slice(0, 240),
      agent: textValue(fields['适配 Agent']).slice(0, 100),
      url,
      contributor: textValue(fields['贡献者署名（选填）']).slice(0, 80) || null,
      submittedAt,
      status: status || '社区推荐 · 未核验',
      recommendationCount: 1
    };
    const existing = grouped.get(canonicalUrl);
    if (!existing) grouped.set(canonicalUrl, item);
    else {
      const latest = existing.submittedAt >= item.submittedAt ? existing : item;
      grouped.set(canonicalUrl, { ...latest, recommendationCount: existing.recommendationCount + 1 });
    }
  }
  return [...grouped.values()]
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
    .slice(0, limit);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || (payload.code !== undefined && payload.code !== 0)) {
    const code = payload?.code ?? response.status;
    const message = payload?.msg ?? response.statusText;
    throw new Error(`Feishu API request failed (${code}): ${message}`);
  }
  return payload;
}

async function fetchTenantToken(appId, appSecret) {
  const payload = await requestJson('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  if (!payload.tenant_access_token) throw new Error('Feishu tenant token is missing');
  return payload.tenant_access_token;
}

async function fetchRecords({ token, baseToken, tableId, viewId }) {
  const records = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ page_size: '500', view_id: viewId });
    if (pageToken) query.set('page_token', pageToken);
    const payload = await requestJson(`https://open.feishu.cn/open-apis/bitable/v1/apps/${encodeURIComponent(baseToken)}/tables/${encodeURIComponent(tableId)}/records?${query}`, {
      headers: { authorization: `Bearer ${token}` }
    });
    records.push(...(payload.data?.items ?? []));
    pageToken = payload.data?.has_more ? payload.data?.page_token ?? '' : '';
  } while (pageToken);
  return records;
}

export async function syncCommunityRecommendations(options = {}) {
  const output = options.output ?? defaultOutput;
  const appId = options.appId ?? process.env.FEISHU_APP_ID;
  const appSecret = options.appSecret ?? process.env.FEISHU_APP_SECRET;
  const baseToken = options.baseToken ?? process.env.FEISHU_BASE_TOKEN ?? 'Po5AbdvD2aV9a2sKvB4cQSdon0e';
  const tableId = options.tableId ?? process.env.FEISHU_RECOMMENDATION_TABLE_ID ?? 'tblTpoVUJ7uc8AsW';
  const viewId = options.viewId ?? process.env.FEISHU_PUBLIC_VIEW_ID;
  if (!appId || !appSecret || !viewId) throw new Error('FEISHU_APP_ID, FEISHU_APP_SECRET and FEISHU_PUBLIC_VIEW_ID are required');
  const token = await fetchTenantToken(appId, appSecret);
  const records = await fetchRecords({ token, baseToken, tableId, viewId });
  const recommendations = buildCommunityPreview(records);
  const payload = {
    product: 'Open Marketing Community Recommendations',
    generatedAt: new Date().toISOString(),
    source: { type: 'feishu-public-view', view: '推荐广场' },
    recommendations
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

async function main() {
  if (process.argv.includes('--allow-fixture') && (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET || !process.env.FEISHU_PUBLIC_VIEW_ID)) {
    const fixture = JSON.parse(await readFile(defaultOutput, 'utf8'));
    console.log(`Using local community fixture with ${fixture.recommendations?.length ?? 0} recommendations.`);
    return;
  }
  const payload = await syncCommunityRecommendations();
  console.log(`Synced ${payload.recommendations.length} public community recommendations.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
