import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { renderArticle, headings } from './article-renderer';

describe('public article rendering', () => {
  it('escapes HTML and refuses executable or protocol-relative URLs', () => {
    const html = renderArticle('<script>alert(1)</script>\n\n[bad](javascript:alert) [bad](//evil.test) [bad](/\\evil.test) [good](https://example.com)');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('href="//');
    expect(html).not.toContain('href="/\\');
    expect(html).toContain('href="https://example.com"');
  });
  it('renders headings, lists and accessible tables', () => {
    const html = renderArticle('## A heading\n\n| A | B |\n|---|---|\n| one | two |\n\n1. First\n2. Second');
    expect(html).toContain('<h2 id="section-1">A heading</h2>');
    expect(html).toContain('<thead><tr><th>A</th>');
    expect(html).toContain('<td>two</td>');
    expect(html).not.toContain('<td>---</td>');
    expect(html).toContain('<ol><li>First</li>');
  });
  it('keeps supplemental explanations closed without hidden TOC targets', () => {
    const markdown = '## First\n\n:::details Read more\n\n### Hidden heading\n\n<script>bad</script>\n\n:::\n\n## Second';
    const html = renderArticle(markdown);
    expect(html).toContain('<details class="article-more"><summary>Read more</summary>');
    expect(html).not.toContain(' open');
    expect(html).toContain('&lt;script&gt;');
    expect(headings(markdown).map(h => h.text)).toEqual(['First', 'Second']);
    expect(html).toContain('<h2 id="section-2">Second</h2>');
  });
  it('renders escaped captions and local images with a deployment prefix', () => {
    const html = renderArticle('![An "image"](/assets/example/01-image.png)\n*A <caption>*', '/open-marketing-agents');
    expect(html).toContain('src="/open-marketing-agents/assets/example/01-image.png"');
    expect(html).toContain('alt="An &quot;image&quot;"');
    expect(html).toContain('loading="lazy"');
    expect(renderArticle('![alt](/assets/example/01-image.png)\n*Caption*', '../../..')).toContain('src="../../../assets/example/01-image.png"');
    expect(html).toContain('<figcaption>A &lt;caption&gt;</figcaption>');
    for (const path of ['javascript:alert', '//evil.test/a.png', '/assets/../secret.png', '/assets/a.svg']) {
      expect(renderArticle(`![alt](${path})\n*Caption*`)).not.toContain('<img');
    }
  });
  it('renders supported callouts while escaping unknown and incomplete blocks', () => {
    expect(renderArticle(':::case 教学假设\n\n**Example**\n\n:::')).toContain('<section class="article-case">');
    expect(renderArticle(':::details <img src=x>\n\nUnclosed')).not.toContain('<details');
    expect(renderArticle(':::unknown <script>')).not.toContain('<script>');
  });
});

describe('four illustrated chapters', () => {
  const metadata = JSON.parse(readFileSync('content/articles/index.json', 'utf8'));
  for (const chapter of metadata) {
    it(`${chapter.slug}: summary, two real images, four anchors and a case`, () => {
      const md = readFileSync(`content/articles/${chapter.slug}.md`, 'utf8');
      const html = renderArticle(md);
      expect((html.match(/<figure /g) || []).length).toBe(2);
      expect((md.match(/^:::takeaways /gm) || []).length).toBe(1);
      const summary = md.match(/:::takeaways [^\n]+\n\n([\s\S]*?)\n\n:::/)![1];
      expect(summary.split('\n').filter(l => l.startsWith('- '))).toHaveLength(3);
      expect(headings(md)).toHaveLength(4);
      for (const h of headings(md)) expect(html).toContain(`id="${h.id}"`);
      for (const image of md.matchAll(/\]\((\/assets\/[^)]+)\)/g)) expect(existsSync(`static${image[1]}`)).toBe(true);
      expect(html).toContain('class="article-case"');
      expect(html).toContain('class="article-steps"');
      expect(html).not.toContain(':::');
      expect(readFileSync(`static/templates/${chapter.slug}.md`, 'utf8')).toBe(chapter.template);
    });
  }
});
