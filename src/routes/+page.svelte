<script lang="ts">
  import SiteHeader from '$lib/SiteHeader.svelte';
  import HandbookCatalog from '$lib/HandbookCatalog.svelte';
  import { base } from '$app/paths';
  import { communityRecommendations, communityRegistry } from '$lib/skills';
  const plaza = 'https://my.feishu.cn/share/base/webpage/shrcnFlduGlQoZFNk27XZceIQNY';
  const recommend = 'https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f';
</script>
<svelte:head><title>Open Marketing｜实践手册、开源工具与推荐广场</title><meta name="description" content="学习 AI 产品与营销方法，寻找适合任务的开源工具，交流真实的使用经验。"/></svelte:head>
<div class="page-shell handbook-home">
  <SiteHeader/>
  <main class="handbook-main">
    <header class="directory-hero sky-hero">
      <span class="hero-stamp">Open Marketing</span>
      <h1>好方法，一起找。<br>好想法，动手做。</h1>
      <p>从 AI 产品与营销实践，到用得上的开源工具。</p>
      <span class="hero-sub">读方法、找工具，也分享你真实用过的经验。</span>
      <div class="hero-entry-actions"><a class="button button-primary" href="#directory">开始探索 <span aria-hidden="true">↓</span></a><a class="button button-secondary" href="#recommendations">逛逛推荐广场 <span aria-hidden="true">↗</span></a></div>
      <div class="sky-decoration" aria-hidden="true"><span>research</span><span>make</span><span>learn</span></div>
    </header>
    <section class="entry-paths" aria-label="选择探索方向">
      <a href={`${base}/articles/`}><span class="path-icon" aria-hidden="true">▤</span><div><h2>读懂方法</h2><p>从需求到增长，四章实践手册。</p></div><span aria-hidden="true">↗</span></a>
      <a href={`${base}/tools/`}><span class="path-icon" aria-hidden="true">⌘</span><div><h2>找到工具</h2><p>按任务挑选 Skill，了解怎么用。</p></div><span aria-hidden="true">↗</span></a>
      <a href="#recommendations"><span class="path-icon" aria-hidden="true">✳</span><div><h2>交换经验</h2><p>社区推荐、适用场景与使用心得。</p></div><span aria-hidden="true">↗</span></a>
    </section>
    <section id="directory" class="explore-section" aria-labelledby="explore-title"><div class="explore-heading"><h2 id="explore-title">从你正在做的事开始</h2><p>带着问题读，也带着工具去试。</p></div><HandbookCatalog/></section>
    <section id="recommendations" class="plaza-section" aria-labelledby="plaza-title">
      <div class="plaza-heading"><div><span class="small-tag">一起发现</span><h2 id="plaza-title">推荐广场</h2><p>看看别人用什么，也说说你用得怎么样。</p></div><a class="button button-secondary" href={plaza} target="_blank" rel="noreferrer">查看全部推荐 ↗</a></div>
      <div class="plaza-grid">
        {#each communityRecommendations.slice(0, 2) as item}<a class="community-pick" href={item.url} target="_blank" rel="noreferrer"><span class="small-tag">社区推荐 · 未核验</span><h3>{item.name} <span aria-hidden="true">↗</span></h3><p>{item.description}</p><div class="pick-context"><span>适合场景</span><p>{item.scenario}</p></div><footer>原作者 · {item.originalAuthor}<span>{item.agent}</span></footer></a>{/each}
        <div class="community-invite"><span class="path-icon" aria-hidden="true">＋</span><h3>你用过的好工具，<br>可能正是别人需要的。</h3><p>留下工具、具体任务和使用经验，让下一位实践者有据可参考。</p><a class="button button-primary" href={recommend} target="_blank" rel="noreferrer">推荐一个 Skill ↗</a></div>
      </div>
      <p class="plaza-footnote">社区推荐与正式收录分开展示。{#if communityRegistry.generatedAt}此处为 {communityRegistry.generatedAt.slice(0,10)} 的推荐预览，最新内容见公开广场。{/if}</p>
    </section>
    <section class="reading-guide"><div><span class="small-tag">给正在实践的你</span><h2>不必从第一页开始。</h2></div><div><p>还没决定做什么，从第一章开始；已经有方向，进入第二、三章；产品可以使用后，用第四章设计下一次增长实验。每章都有可以带走的工作模板。</p><a href={`${base}/articles/`}>查看全书导读 →</a></div></section>
  </main>
  <footer class="handbook-footer"><a href={`${base}/`}>Open Marketing</a><span>方法与工具，持续修订。</span><a href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">在 GitHub 一起完善 ↗</a></footer>
</div>
