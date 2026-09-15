const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeLink = (url: string) => !/[\\\s\u0000-\u001f]/.test(url) && /^(https?:\/\/|#[\w-]+$|\/(?!\/))/i.test(url);

function inline(s: string): string {
  return escape(s).replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label, url) => safeLink(url) ? `<a href="${url}" rel="noreferrer">${label}</a>` : label)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

// Content uses paired, non-nested ::: blocks. Raw HTML is always escaped.
function blocks(markdown: string): string[] {
  return markdown.trim().split(/\n\s*\n/);
}

export function headings(markdown: string) {
  let hidden = false;
  return blocks(markdown).flatMap(block => {
    if (/^:::details /.test(block)) { hidden = true; return []; }
    if (block === ':::') { hidden = false; return []; }
    const match = !hidden && block.match(/^(#{2,3}) (.+)$/);
    return match ? [{ text: match[2], level: match[1].length }] : [];
  }).map((h, i) => ({ ...h, id: `section-${i + 1}` }));
}

export function renderArticle(markdown: string, base = ''): string {
  let heading = 0;
  // SvelteKit supplies a relative base during prerendering of nested routes.
  const prefix = /^(?:\/[A-Za-z0-9_-]+)*$/.test(base) || /^\.{1,2}(?:\/\.\.)*$/.test(base) ? base : '';
  function render(source: string, hidden = false): string {
    const parts = blocks(source);
    const output: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const block = parts[i];
      const directive = block.match(/^:::(takeaways|case|details|steps) ([^\n]+)$/);
      if (directive) {
        const end = parts.indexOf(':::', i + 1);
        if (end !== -1) {
          const [, kind, title] = directive;
          const inner = render(parts.slice(i + 1, end).join('\n\n'), hidden || kind === 'details');
          output.push(kind === 'details'
            ? `<details class="article-more"><summary>${inline(title)}</summary><div class="article-more-body">${inner}</div></details>`
            : `<section class="article-${kind}"><p class="block-label">${inline(title)}</p>${inner}</section>`);
          i = end;
          continue;
        }
      }
      const h = block.match(/^(#{2,3}) (.+)$/);
      if (h) {
        output.push(hidden ? `<p><strong>${inline(h[2])}</strong></p>` : `<h${h[1].length} id="section-${++heading}">${inline(h[2])}</h${h[1].length}>`);
        continue;
      }
      const img = block.match(/^!\[([^\]]+)\]\((\/assets\/[A-Za-z0-9/_-]+\.(?:png|webp|jpg))\)\n\*([^\n]+)\*$/);
      if (img && !img[2].includes('//')) {
        output.push(`<figure class="article-figure"><img src="${prefix}${img[2]}" alt="${escape(img[1])}" width="1672" height="941" loading="lazy" decoding="async"><figcaption>${inline(img[3])}</figcaption></figure>`);
        continue;
      }
      if (block.startsWith('|')) {
        const rows = block.split('\n').filter(r => !/^\|[\s:|\-]+\|$/.test(r));
        const row = (r: string, tag: string) => '<tr>' + r.split('|').slice(1, -1).map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>';
        output.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="对照表，可横向滚动"><table><thead>${row(rows[0], 'th')}</thead><tbody>${rows.slice(1).map(r => row(r, 'td')).join('')}</tbody></table></div>`);
        continue;
      }
      if (/^\d+\. /.test(block)) {
        output.push('<ol>' + block.split('\n').map(s => '<li>' + inline(s.replace(/^\d+\. /, '')) + '</li>').join('') + '</ol>');
        continue;
      }
      if (/^- /.test(block)) {
        output.push('<ul>' + block.split('\n').map(s => '<li>' + inline(s.replace(/^- /, '')) + '</li>').join('') + '</ul>');
        continue;
      }
      output.push('<p>' + inline(block).replace(/\n/g, '<br>') + '</p>');
    }
    return output.join('\n');
  }
  return render(markdown);
}
