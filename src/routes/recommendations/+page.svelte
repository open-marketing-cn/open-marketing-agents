<script lang="ts">
  import SiteHeader from '$lib/SiteHeader.svelte';
  import { communityRecommendations, communityRegistry } from '$lib/skills';
  let query = $state('');
  const results = $derived(communityRecommendations.filter(item => [item.name, item.originalAuthor, item.scenario, item.description, item.category, item.agent].join(' ').toLowerCase().includes(query.trim().toLowerCase())));
  const form = 'https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f';
</script>
<svelte:head><title>推荐广场｜Open Marketing</title><meta name="description" content="在这里查看社区推荐的营销 Skill、实际使用场景、原作者和推荐人。"/></svelte:head>
<div class="page-shell"><SiteHeader/><main class="handbook-main">
  <header class="book-intro"><span class="small-tag">COMMUNITY PICKS</span><h1>推荐广场</h1><p class="book-subtitle">看看别人用什么，也分享你用得怎么样。</p><p>这里是社区提交的使用经验，推荐内容不代表平台已完成实测。正式工具的来源与实践记录请查看工具详情。</p><a class="button button-primary" href={form} target="_blank" rel="noreferrer">推荐一个 Skill ↗</a></header>
  <section class="plaza-section" aria-label="全部推荐">
    <div class="plaza-heading"><div><h2>全部推荐 · {communityRecommendations.length}</h2><p>{#if communityRegistry.generatedAt}最近同步：{new Date(communityRegistry.generatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}（北京时间）{:else}暂未完成首次同步{/if}</p></div><label class="directory-search"><input aria-label="搜索推荐" type="search" placeholder="搜索工具、场景或作者" bind:value={query}/></label></div>
    <div class="plaza-grid">{#each results as item}<a class="community-pick" href={item.url ?? undefined} target="_blank" rel="noreferrer"><span class="small-tag">{item.category} · 社区推荐</span><h3>{item.name}{#if item.url} ↗{/if}</h3><p>{item.description}</p>{#if !item.url}<p class="small-tag">来源链接待补</p>{/if}<div class="pick-context"><span>使用场景</span><p>{item.scenario}</p></div><p>原作者 · {item.originalAuthor}</p><p>适配 · {item.agent}</p><footer>推荐人 · {item.contributor || '匿名贡献者'}<span>{item.recommendationCount} 次推荐</span></footer></a>{/each}</div>
    {#if !results.length}<div class="directory-empty"><h2>{query ? '没有匹配的推荐' : '还没有公开推荐'}</h2><p>{query ? '换一个任务词，或清除搜索。' : '分享一个你实际用过的 Skill 和具体场景。'}</p></div>{/if}
    <p class="plaza-footnote">提交后会在下一次成功同步后显示；页面展示最近一次成功记录。联系方式与内部评语不会公开。</p>
  </section>
</main></div>
