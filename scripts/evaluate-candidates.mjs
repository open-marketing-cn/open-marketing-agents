import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const intakeDir = join(root, 'catalog', 'intake');
const manifestDir = join(root, 'catalog', 'skills');
const defaultOutput = join(root, 'generated', 'candidate-evaluation.json');

const terminalStatuses = new Set(['passed', 'failed', 'pending']);
const pendingWords = /^(?:pending|unknown|noassertion|未核验|待核验|)$/i;
const githubUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/i;
const hardRiskFlags = new Set(['destructive-shell', 'privilege-escalation', 'remote-shell-pipe', 'credential-access']);

function parseArgs(argv) {
  const args = { input: intakeDir, output: defaultOutput, offline: false, includePublic: false, ids: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--offline') args.offline = true;
    else if (arg === '--include-public') args.includePublic = true;
    else if (arg === '--input') args.input = resolve(root, argv[++index]);
    else if (arg === '--output') args.output = resolve(root, argv[++index]);
    else if (arg === '--id') args.ids = new Set(argv[++index].split(',').map((id) => id.trim()).filter(Boolean));
    else if (arg === '--help') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`用法：node scripts/evaluate-candidates.mjs [选项]

选项：
  --offline                 不访问 GitHub，只使用仓库已有证据
  --include-public          同时评判 catalog/skills 中的公开条目
  --id a,b                  只评判指定 ID
  --input <dir>             候选目录，默认 catalog/intake
  --output <file>           报告路径，默认 generated/candidate-evaluation.json
`);
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function status(value) {
  return terminalStatuses.has(value) ? value : 'unknown';
}

function isPending(value) {
  return !clean(value) || pendingWords.test(clean(value));
}

function githubSlug(repo) {
  if (!githubUrlPattern.test(clean(repo))) return null;
  return new URL(repo).pathname.replace(/^\//, '').replace(/\.git\/?$/, '').replace(/\/$/, '');
}

function normalizeSkillPath(path) {
  const value = clean(path).replace(/^\//, '').replace(/\/$/, '');
  if (isPending(value)) return null;
  return value.endsWith('/SKILL.md') || value === 'SKILL.md' ? value : `${value}/SKILL.md`;
}

function sourceFrom(record) {
  const source = record.source ?? {};
  const origin = record.origin ?? {};
  const review = record.review ?? {};
  const claimedSource = clean(record.claimedSource);
  const catalogRepo = clean(origin.repo);
  const repo = clean(source.repo) || (githubSlug(claimedSource) ? claimedSource : '') || (catalogRepo && !catalogRepo.endsWith('/brand-marketing-skills') ? catalogRepo : '');
  const path = normalizeSkillPath(source.path || (review.path === 'verified' ? '' : review.path));
  const license = clean(source.license) || (review.license && !isPending(review.license) ? clean(review.license) : '');
  const independent = clean(review.independent) || (record.validation?.spec?.status === 'passed' ? 'verified' : '');
  return {
    repo,
    path,
    license,
    commit: clean(source.commit),
    independent,
    type: clean(source.type) || 'upstream'
  };
}

function listValues(record, field) {
  return Array.isArray(record[field]) ? record[field].filter((value) => clean(value)) : [];
}

function evidenceFrom(record) {
  return record.practiceEvidence ?? record.caseStudy ?? {};
}

function evidenceQuality(record) {
  const evidence = evidenceFrom(record);
  const hasCase = ['caseTitleZh', 'contextZh', 'inputZh', 'outputZh', 'evidenceUrl']
    .every((field) => clean(evidence[field]));
  const hasAttribution = clean(record.source?.author) && clean(evidence.practitionerRole) && clean(evidence.attributionZh);
  const hasPlaybook = clean(evidence.howToUseZh) && clean(evidence.setupZh) &&
    clean(evidence.expectedOutputZh) && listValues(record, 'promptExamples').length >= 3;
  const hasDetails = listValues(evidence, 'pitfallsZh').length > 0 &&
    listValues(evidence, 'bestPracticesZh').length > 0 && clean(evidence.remixZh);
  const hasDepth = listValues(evidence, 'scenariosZh').length >= 2 &&
    clean(evidence.boundaryZh) && listValues(evidence, 'notForZh').length > 0 &&
    clean(evidence.depthPathZh);
  return {
    case: hasCase
      ? criterion('case', 'pass', '有可脱敏复现的真实案例、输入、输出和证据链接')
      : criterion('case', 'unknown', '缺少案例上下文、输入、输出或证据链接', '补充一个可脱敏复现的真实案例'),
    attribution: hasAttribution
      ? criterion('attribution', 'pass', `已标注实践者身份：${clean(evidence.practitionerRole)}`)
      : criterion('attribution', 'unknown', '缺少上游作者与实践贡献者署名', '补充上游作者、实践者角色和案例署名'),
    playbook: hasPlaybook
      ? criterion('playbook', 'pass', '有安装后如何开始、提示词和预期输出说明')
      : criterion('playbook', 'unknown', '缺少可照着执行的使用步骤或预期输出', '补充 setup、howToUse、提示词和预期输出'),
    practiceDetails: hasDetails
      ? criterion('practice-details', 'pass', '记录了弯路、最佳实践和二创方式')
      : criterion('practice-details', 'unknown', '缺少弯路、最佳实践或二创记录', '补充 pitfalls、bestPractices 和 remix'),
    depth: hasDepth
      ? criterion('depth', 'pass', '至少有两个具体场景、适用边界、反例和进阶路径')
      : criterion('depth', 'unknown', '缺少具体使用场景、边界/反例或进阶玩法', '补充 scenarios、boundary、notFor 和 depthPath')
  };
}

function scanRiskFlags(text) {
  const checks = [
    ['destructive-shell', /rm\s+-rf|git\s+reset\s+--hard|git\s+clean\s+-fd/i],
    ['privilege-escalation', /\bsudo\b|chmod\s+7[0-7]{2}/i],
    ['remote-shell-pipe', /(?:curl|wget)[^\n|]*\|\s*(?:sh|bash|zsh)/i],
    ['credential-access', /\.ssh|keychain|credentials|\.env\b|access[_ -]?token|api[_ -]?key/i],
    ['external-write', /auto(?:matically)?\s+(?:publish|send|post|delete|pay)|自动(?:发布|发消息|投放|付款)|(?:publish|send message|create campaign|modify account|save_keywords)/i]
  ];
  return checks.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

function criterion(id, state, evidence, nextAction = '') {
  return { id, state, evidence, nextAction };
}

function isoWeekStart(value = new Date()) {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date;
}

function inWindow(value, start, end = new Date()) {
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date >= start && date <= end;
}

function manifestQuality(record) {
  const hasTask = clean(record.workspace) && listValues(record, 'useCases').length > 0;
  const hasHandoff = listValues(record, 'outputs').length > 0 && clean(record.humanGate) && listValues(record, 'cannotInfer').length > 0;
  return {
    taskFit: hasTask ? criterion('task-fit', 'pass', '有营销阶段和具体使用场景') : criterion('task-fit', 'unknown', '缺少 workspace 或 useCases', '补齐具体营销任务'),
    handoff: hasHandoff ? criterion('handoff', 'pass', '有输出、人类决策和不能推断边界') : criterion('handoff', 'unknown', '缺少 outputs、humanGate 或 cannotInfer', '补齐可交接结果和人工边界'),
    ...evidenceQuality(record)
  };
}

async function getJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function getText(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function fetchRemote(source, headers) {
  const slug = githubSlug(source.repo);
  if (!slug) return { error: '不是公开 GitHub 仓库 URL' };
  try {
    const repo = await getJson(`https://api.github.com/repos/${slug}`, headers);
    const commit = source.commit || (await getJson(`https://api.github.com/repos/${slug}/commits/${repo.default_branch}`, headers)).sha;
    const candidates = [];
    if (source.path) candidates.push(source.path);
    if (source.path?.endsWith('/SKILL.md')) candidates.push(source.path.replace(/\/SKILL\.md$/, ''));
    if (!source.path) candidates.push('SKILL.md');
    let skillText = '';
    let resolvedPath = source.path;
    let lastError = '';
    for (const path of [...new Set(candidates)]) {
      try {
        skillText = await getText(`https://raw.githubusercontent.com/${slug}/${commit}/${path}`, headers);
        resolvedPath = normalizeSkillPath(path) ?? path;
        break;
      } catch (error) {
        lastError = error.message;
      }
    }
    return {
      repo,
      commit,
      path: skillText ? resolvedPath : null,
      skillText,
      error: skillText ? null : lastError || '找不到 SKILL.md'
    };
  } catch (error) {
    return { error: error.message };
  }
}

function decide({ source, remote, record, risks, quality }) {
  const gates = [];
  const sourceRepo = githubSlug(source.repo);
  gates.push(sourceRepo
    ? criterion('source', 'pass', source.repo)
    : criterion('source', 'fail', '缺少可验证的公开 GitHub 仓库', '补充真实仓库 URL'));
  const resolvedPath = remote?.path || source.path;
  gates.push(resolvedPath && (remote?.skillText || remote?.error === 'offline mode')
    ? criterion('skill-path', 'pass', resolvedPath)
    : remote?.error && !source.path
      ? criterion('skill-path', 'unknown', remote.error, '核对真实 SKILL.md 路径')
      : criterion('skill-path', 'unknown', source.path || '未提供 SKILL.md 路径', '核对真实 SKILL.md 路径'));
  const commit = remote?.commit || source.commit;
  gates.push(commit
    ? criterion('commit', 'pass', commit)
    : criterion('commit', 'unknown', '尚未锁定来源 Commit', '核对默认分支当前 Commit 并写入 manifest'));
  const license = remote?.repo?.license?.spdx_id && remote.repo.license.spdx_id !== 'NOASSERTION' ? remote.repo.license.spdx_id : source.license;
  gates.push(license && !isPending(license)
    ? criterion('license', 'pass', license)
    : criterion('license', 'fail', '许可证缺失或无法核验', '补充许可证链接并回到上游核对'));
  gates.push(source.independent === 'verified'
    ? criterion('independence', 'pass', '候选记录标记为独立 Skill')
    : source.independent === 'failed'
      ? criterion('independence', 'fail', '候选记录标记为非独立', '保留在候选库，不进入公开目录')
      : criterion('independence', 'unknown', '尚未完成单独触发与产出核验', '用单 Skill 安装测试确认'));
  gates.push(hardRiskFlags.size && risks.some((risk) => hardRiskFlags.has(risk))
    ? criterion('safety', 'fail', `发现风险：${risks.join(', ')}`, '人工检查原文，确认是否越权或移除危险步骤')
    : risks.includes('external-write')
      ? criterion('safety', 'unknown', '包含外部写入或保存动作关键词', '确认所有写入都由用户明确确认，并在卡片标注')
      : criterion('safety', 'pass', '未发现硬阻断风险'));
  gates.push(quality.taskFit.state === 'pass' ? quality.taskFit : quality.taskFit);
  gates.push(quality.handoff.state === 'pass' ? quality.handoff : quality.handoff);
  for (const id of ['case', 'attribution', 'playbook', 'practiceDetails', 'depth']) gates.push(quality[id]);

  const installState = status(record.validation?.installation?.status || record.review?.installation);
  const practiceState = status(record.validation?.practice?.status || record.review?.practice);
  gates.push(installState === 'passed'
    ? criterion('installation', 'pass', 'Codex 与 Claude Code 安装已记录')
    : criterion('installation', installState === 'failed' ? 'fail' : 'unknown', '尚无双端安装通过记录', '在干净环境分别安装并触发'));
  gates.push(practiceState === 'passed'
    ? criterion('practice', 'pass', '已有脱敏真实任务验证')
    : criterion('practice', practiceState === 'failed' ? 'fail' : 'unknown', '尚无脱敏实战通过记录', '使用统一 Brief 完成六项二元复核'));

  const failures = gates.filter((gate) => gate.state === 'fail');
  const unknowns = gates.filter((gate) => gate.state === 'unknown');
  let decision = 'ready_for_publication';
  if (failures.length) decision = 'blocked';
  else if (unknowns.some((gate) => ['source', 'skill-path', 'license'].includes(gate.id))) decision = 'needs_source_review';
  else if (unknowns.some((gate) => ['task-fit', 'handoff', 'playbook'].includes(gate.id))) decision = 'needs_manifest';
  else if (unknowns.some((gate) => gate.id === 'safety')) decision = 'needs_human_review';
  else if (unknowns.some((gate) => gate.id === 'installation')) decision = 'needs_install_test';
  else if (unknowns.some((gate) => ['practice', 'case', 'attribution', 'practice-details', 'depth'].includes(gate.id))) decision = 'needs_practice';

  const prioritySignals = [quality.taskFit.state === 'pass', quality.handoff.state === 'pass', quality.case.state === 'pass', quality.playbook.state === 'pass', quality.depth.state === 'pass', installState === 'passed', practiceState === 'passed', source.independent === 'verified'];
  const priority = prioritySignals.filter(Boolean).length >= 4 ? 'high' : prioritySignals.filter(Boolean).length >= 2 ? 'medium' : 'low';
  return { decision, priority, gates, failures, unknowns };
}

async function readRecords(dir) {
  const files = (await readdir(dir)).filter((name) => name.endsWith('.yaml')).sort();
  const records = [];
  for (const filename of files) {
    const record = JSON.parse(await readFile(join(dir, filename), 'utf8'));
    if (record.status === 'research_snapshot' || Array.isArray(record.candidates)) continue;
    records.push({ filename, record });
  }
  return records;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'open-marketing-skill-evaluator' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const intake = await readRecords(args.input);
  const publicRecords = args.includePublic ? await readRecords(manifestDir) : [];
  const records = [...publicRecords.map((item) => ({ ...item, kind: 'public' })), ...intake.map((item) => ({ ...item, kind: 'candidate' }))];
  const selected = args.ids ? records.filter(({ record }) => args.ids.has(clean(record.id))) : records;
  const results = [];
  for (const { filename, record, kind } of selected) {
    const source = sourceFrom(record);
    const remote = args.offline ? { error: 'offline mode' } : await fetchRemote(source, headers);
    const skillText = remote.skillText || '';
    const risks = scanRiskFlags(skillText);
    const quality = manifestQuality(record);
    const decision = decide({ source, remote, record, risks, quality });
    results.push({
      id: clean(record.id) || filename.replace(/\.yaml$/, ''),
      filename,
      kind,
      titleZh: clean(record.titleZh) || clean(record.id),
      source: { repo: source.repo, path: remote.path || source.path, commit: remote.commit || source.commit, license: remote.repo?.license?.spdx_id || source.license },
      risks,
      quality,
      submittedAt: clean(record.submittedAt) || null,
      publishedAt: clean(record.publishedAt) || null,
      ...decision,
      evaluatedAt: new Date().toISOString()
    });
  }
  const summary = Object.fromEntries(['blocked', 'needs_source_review', 'needs_manifest', 'needs_human_review', 'needs_install_test', 'needs_practice', 'ready_for_publication'].map((decision) => [decision, results.filter((item) => item.decision === decision).length]));
  const now = new Date();
  const weekStart = isoWeekStart(now);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const cadence = {
    weeklyGoodSkillSubmissionsMin: 5,
    monthlyPublicationsMin: 10,
    countingRule: '只有全部 gate 通过、带来源/案例/署名/实践细节并进入人工复核队列的记录，才计为每周好用 Skill 提交；只有同样通过并人工合并的记录，才计为公开。',
    period: { weekStart: weekStart.toISOString().slice(0, 10), monthStart: monthStart.toISOString().slice(0, 10) },
    observed: {
      submitted: results.filter((item) => item.submittedAt && inWindow(item.submittedAt, weekStart, now) && item.gates.every((gate) => gate.state === 'pass')).length,
      published: results.filter((item) => item.kind === 'public' && (item.publishedAt || item.decision === 'ready_for_publication') && inWindow(item.publishedAt || item.evaluatedAt, monthStart, now) && item.gates.every((gate) => gate.state === 'pass')).length
    }
  };
  const report = {
    protocol: 'open-marketing-skill-evaluator/v1',
    generatedAt: new Date().toISOString(),
    policy: '机器评判只生成证据、门槛和下一步；不执行候选脚本，不自动公开、合并或覆盖人工字段。',
    scope: { input: relative(root, args.input) || '.', includePublic: args.includePublic, offline: args.offline },
    cadence,
    summary: { total: results.length, ...summary },
    results: results.sort((left, right) => left.decision.localeCompare(right.decision) || left.id.localeCompare(right.id))
  };
  await writeFile(args.output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.summary));
}

export { decide, evidenceQuality, normalizeSkillPath, scanRiskFlags, sourceFrom };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
