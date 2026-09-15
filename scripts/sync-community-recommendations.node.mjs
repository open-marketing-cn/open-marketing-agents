import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCommunityPreview, canonicalizeSkillUrl, renderCommunityMarkdown } from './sync-community-recommendations.mjs';

test('canonicalizes repository URLs for recommendation deduplication', () => {
  assert.equal(canonicalizeSkillUrl('https://GitHub.com/Example/Skill.git/'), 'github.com/example/skill');
  assert.equal(canonicalizeSkillUrl('[仓库](https://github.com/Example/Skill)'), 'github.com/example/skill');
  assert.equal(canonicalizeSkillUrl('javascript:alert(1)'), null);
});

test('keeps the latest complete recommendation and counts duplicates', () => {
  const records = [
    {
      record_id: 'one',
      created_time: 1000,
      fields: {
        编号: 'OM-0001', 名称: 'Example', 原作者名称: 'Example Org', 分类: '内容视觉化', 使用场景: '文章封面', 一句话描述: '先提炼视觉方向',
        '适配 Agent': ['Codex'], 'Skill / 仓库链接': 'https://github.com/example/skill', 公开状态: '社区推荐 · 未核验'
      }
    },
    {
      record_id: 'two',
      created_time: 2000,
      fields: {
        编号: 'OM-0002', 名称: 'Example Skill', 原作者名称: 'Example Org', 分类: '内容视觉化', 使用场景: '品牌封面', 一句话描述: '同一 Skill 的第二次实践推荐',
        '适配 Agent': ['Codex', 'Claude Code'], 'Skill / 仓库链接': 'https://github.com/example/skill.git', 公开状态: '社区推荐 · 未核验'
      }
    }
  ];
  const preview = buildCommunityPreview(records);
  assert.equal(preview.length, 1);
  assert.equal(preview[0].name, 'Example Skill');
  assert.equal(preview[0].originalAuthor, 'Example Org');
  assert.equal(preview[0].recommendationCount, 2);
});

test('excludes incomplete, non-public and unsafe records', () => {
  const records = [
    { record_id: 'draft', fields: { 名称: 'Draft', 公开状态: '资料待补' } },
    {
      record_id: 'unsafe', fields: {
        名称: 'Unsafe', 原作者名称: 'Unknown', 分类: '其他', 使用场景: '测试', 一句话描述: '测试', '适配 Agent': 'Codex',
        'Skill / 仓库链接': 'javascript:alert(1)', 公开状态: '社区推荐 · 未核验'
      }
    }
  ];
  assert.deepEqual(buildCommunityPreview(records), []);
});

const publicRecord = (id, url = `https://github.com/example/skill-${id}`) => ({
  record_id: String(id), fields: { 名称: `Skill ${id}`, 原作者名称: 'Author', 分类: '内容', 使用场景: '场景', 一句话描述: '描述', '适配 Agent': 'Codex', 'Skill / 仓库链接': url, 公开状态: '社区推荐 · 未核验', 联系方式: 'private@example.com', 内部评语: 'private-review' }
});
test('full plaza includes more than six records and only public fields', () => {
  const result = buildCommunityPreview(Array.from({length: 12}, (_, i) => publicRecord(i)));
  assert.equal(result.length, 12);
  assert.equal(JSON.stringify(result).includes('private'), false);
});
test('plain names without source links remain visible without becoming clickable', () => {
  const result = buildCommunityPreview([publicRecord('a', 'site-architecture'), publicRecord('b', 'site-architecture')]);
  assert.equal(result.length, 2);
  assert.equal(result[0].url, null);
});
test('repository markdown escapes submitted HTML and markdown', () => {
  const recommendations = buildCommunityPreview([publicRecord(1)]);
  recommendations[0].name = '<script>alert(1)</script> [click](https://evil.example)';
  const output = renderCommunityMarkdown({generatedAt: '2026-09-15', recommendations});
  assert.ok(!output.includes('<script>'));
  assert.ok(!output.includes('[click]('));
  assert.ok(output.includes('github.com/example/skill-1'));
});
