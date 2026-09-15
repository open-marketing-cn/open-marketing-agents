import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
const metadata=JSON.parse(readFileSync(new URL('../content/articles/index.json',import.meta.url),'utf8'));
const articles=metadata.map(item=>{const md=readFileSync(new URL(`../content/articles/${item.slug}.md`,import.meta.url),'utf8');const prefix=`# ${item.title}\n\n${item.deck}\n\n`;if(!md.startsWith(prefix))throw new Error(`Article heading mismatch: ${item.slug}`);const body=md.slice(prefix.length).split('\n\n---\n\n')[0];return {...item,body};});
writeFileSync(new URL('../src/lib/articles.ts',import.meta.url),'// Generated from content/articles; edit Markdown and index.json.\nexport const articles = '+JSON.stringify(articles,null,2)+' as const;\n');
console.log(`Generated ${articles.length} articles`);

mkdirSync(new URL('../static/templates/',import.meta.url),{recursive:true});
for(const article of articles)writeFileSync(new URL(`../static/templates/${article.slug}.md`,import.meta.url),article.template);
