import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ignoredDirectories = new Set(['.git', '.svelte-kit', 'build', 'coverage', 'node_modules', 'target']);
const binaryExtensions = new Set([
  '.app', '.avi', '.dmg', '.gif', '.ico', '.jpeg', '.jpg', '.mov', '.mp3', '.mp4', '.pdf', '.png', '.webp', '.zip'
]);
const forbiddenProjectTerms = Buffer.from(
  'VGhlcmFib2R5CkpveWNlClBldGVyCkRvY3RvciBKYXNvbgpIWVJPWApNYXNrIEdsbwovVXNlcnMvam95Y2VzdW4K',
  'base64'
)
  .toString('utf8')
  .trim()
  .split('\n');

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
  /gh[oprsu]_[A-Za-z0-9_]{30,}/,
  /sk-[A-Za-z0-9_-]{20,}/
];

function walk(directory, files = []) {
  for (const name of readdirSync(directory)) {
    if (ignoredDirectories.has(name)) continue;
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function scanText(text, label, findings) {
  for (const term of forbiddenProjectTerms) {
    if (text.toLocaleLowerCase('en-US').includes(term.toLocaleLowerCase('en-US'))) {
      findings.push(`${label}: 包含客户或个人拒绝词`);
    }
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) findings.push(`${label}: 疑似包含密钥或凭证`);
  }
}

const findings = [];
for (const path of walk(root)) {
  const label = relative(root, path);
  scanText(label, label, findings);
  const extension = extname(path).toLocaleLowerCase('en-US');
  if (binaryExtensions.has(extension)) {
    if (!label.startsWith('src-tauri/icons/')) findings.push(`${label}: 不允许提交原始媒体或未审计二进制文件`);
    continue;
  }
  const stats = statSync(path);
  if (stats.size > 2_000_000) {
    findings.push(`${label}: 文本文件超过 2 MB，请确认不是原始采集数据或生成物`);
    continue;
  }
  scanText(readFileSync(path, 'utf8'), label, findings);
}

if (existsSync(join(root, '.git'))) {
  try {
    const history = execFileSync('git', ['log', '--all', '--format=fuller', '-p'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024
    });
    scanText(history, 'Git 历史', findings);
  } catch (error) {
    findings.push(`Git 历史扫描失败: ${error.message}`);
  }
}

if (findings.length > 0) {
  console.error('安全扫描未通过：');
  for (const finding of [...new Set(findings)]) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`安全扫描通过：${walk(root).length} 个文件，未发现拒绝词、凭证或原始媒体。`);
