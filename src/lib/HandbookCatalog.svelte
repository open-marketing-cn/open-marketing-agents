<script lang="ts">
 import {base} from '$app/paths';import {articles} from '$lib/articles';import {publicSkills,WORKSPACES} from '$lib/skills';
 let { articlesOnly = false } = $props<{ articlesOnly?: boolean }>();
 let tab=$state('book'),query=$state(''),category=$state('全部');
 const topics=$derived(tab==='book'?articles.map(a=>a.topic):WORKSPACES.map(w=>w.name));
 const chapters=$derived(articles.filter(a=>(category==='全部'||a.topic===category)&&`${a.title} ${a.deck} ${a.outcome}`.toLowerCase().includes(query.toLowerCase().trim())));
 const tools=$derived(publicSkills.filter(s=>(category==='全部'||WORKSPACES.find(w=>w.id===s.workspace)?.name===category)&&`${s.titleZh} ${s.summaryZh} ${s.useCases.join(' ')} ${s.outputs.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim())));
 function switchTab(value:string){tab=value;category='全部';}
</script>
<section class="directory" aria-label="实践与工具目录">
 <div class="directory-bar"><div class="directory-tabs"><button class:active={tab==='book'} aria-pressed={tab==='book'} onclick={()=>switchTab('book')}>实践手册</button>{#if !articlesOnly}<button class:active={tab==='tools'} aria-pressed={tab==='tools'} onclick={()=>switchTab('tools')}>开源工具</button>{/if}</div><label class="directory-search"><span>⌕</span><input aria-label="搜索章节或工具" placeholder="搜索问题、方法或工具" bind:value={query}/></label></div>
 <div class="category-row" aria-label="分类">{#each ['全部',...topics] as topic}<button class:active={category===topic} aria-pressed={category===topic} onclick={()=>category=topic}>{topic}</button>{/each}{#if query||category!=='全部'}<button class="clear-filter" onclick={()=>{query='';category='全部';}}>清除筛选</button>{/if}</div>
 {#if tab==='book'}<div class="directory-grid">{#each chapters as a}<a class="directory-card" href={`${base}/articles/${a.slug}/`}><div class={`cover-sheet chapter-${a.order}`}><span>OPEN MARKETING / FIELD GUIDE</span><b>0{a.order}</b><strong>{a.topic}</strong><i>{a.outcome}</i></div><div class="card-copy"><span class="card-kicker">第 {a.order} 章</span><h2>{a.title}</h2><p>{a.deck}</p><footer>完成：{a.outcome}<span>↗</span></footer></div></a>{/each}</div>
 {#if chapters.length===0}<div class="directory-empty"><h2>还没有匹配的章节</h2><p>换一个具体问题，或清除筛选查看完整目录。</p><button onclick={()=>{query='';category='全部';}}>查看全部</button></div>{/if}
 {:else}<div class="directory-grid">{#each tools as s}<a class="directory-card" href={`${base}/skills/${s.id}/`}><div class="tool-preview"><span>OUTPUT / 交付成果</span><strong>{s.outputs[0]||s.titleZh}</strong><div>{#each s.outputs.slice(1,3) as o}<i>{o}</i>{/each}</div></div><div class="card-copy"><span class="card-kicker">{WORKSPACES.find(w=>w.id===s.workspace)?.name}</span><h2>{s.titleZh}</h2><p>{s.summaryZh}</p><footer>{s.source.author} · {s.source.license}<span>↗</span></footer></div></a>{/each}</div>{#if tools.length===0}<div class="directory-empty"><h2>没有找到匹配工具</h2><p>试试描述想完成的任务。</p><button onclick={()=>{query='';category='全部';}}>查看全部</button></div>{/if}<a class="catalog-full" href={`${base}/tools/`}>进入完整工具库：工作流、对照与使用说明 →</a>{/if}
</section>
