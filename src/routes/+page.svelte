<script lang="ts">
  import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import { publicSkills, registry, WORKSPACES, type WorkspaceId } from '$lib/skills';

  type CatalogTab = 'featured' | 'all';
  const pageSize = 18;
  let activeTab = $state<CatalogTab>('featured');
  let category = $state<WorkspaceId | 'all'>('all');
  let query = $state('');
  let currentPage = $state(1);

  let filteredSkills = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN');
    const pool = activeTab === 'featured' ? publicSkills.filter((skill) => skill.featured) : publicSkills;
    return pool.filter((skill) => {
      if (category !== 'all' && skill.workspace !== category) return false;
      if (!needle) return true;
      return [skill.titleZh, skill.originalName, skill.summaryZh, skill.card.outcomeZh, skill.source.author, ...skill.outputs, ...skill.channels]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(needle);
    });
  });

  const totalPages = $derived(Math.max(1, Math.ceil(filteredSkills.length / pageSize)));
  const visibleSkills = $derived(filteredSkills.slice((currentPage - 1) * pageSize, currentPage * pageSize));

  $effect(() => {
    activeTab;
    category;
    query;
    currentPage = 1;
  });

  function resetFilters() {
    query = '';
    category = 'all';
    activeTab = 'featured';
  }

  function selectCategory(id: WorkspaceId | 'all') {
    category = category === id ? 'all' : id;
  }
</script>

<svelte:head>
  <title>Open Marketing Skills｜外部营销 Skill 精选目录</title>
  <meta name="description" content="找到一个能解决当前品牌营销任务的外部 Skill：来源透明、交付具体、可以单独安装。" />
</svelte:head>

<div class="page-shell">
  <SiteHeader />

  <main>
    <section class="hero-section" aria-labelledby="hero-title">
      <p class="eyebrow"><span aria-hidden="true"></span> OPEN MARKETING SKILLS</p>
      <h1 id="hero-title">找一个 Skill，<br />完成一个品牌营销任务。</h1>
      <p class="hero-lead">外部精选 · 来源透明 · 单独安装</p>
    </section>

    <section class="catalog-section" id="catalog" aria-labelledby="catalog-title">
      <div class="catalog-heading">
        <div>
          <p class="section-label">SKILLS DIRECTORY</p>
          <h2 id="catalog-title">从一个具体结果开始</h2>
        </div>
        <p class="catalog-intro">每张卡只回答三件事：它做什么、谁维护、从哪里来。</p>
      </div>

      <div class="catalog-tabs" role="tablist" aria-label="目录范围">
        <button class:active={activeTab === 'featured'} type="button" role="tab" aria-selected={activeTab === 'featured'} onclick={() => (activeTab = 'featured')}>精选 <span>{publicSkills.filter((skill) => skill.featured).length}</span></button>
        <button class:active={activeTab === 'all'} type="button" role="tab" aria-selected={activeTab === 'all'} onclick={() => (activeTab = 'all')}>全部 Skill <span>{publicSkills.length}</span></button>
      </div>

      <div class="catalog-toolbar">
        <label class="search-field">
          <Search size={18} aria-hidden="true" />
          <span class="sr-only">搜索任务、输出或作者</span>
          <input bind:value={query} type="search" placeholder="搜索任务、输出或作者" />
        </label>
        <span class="result-count">{filteredSkills.length} 个结果</span>
      </div>

      <div class="category-row" aria-label="按营销任务分类">
        <button class:active={category === 'all'} type="button" aria-pressed={category === 'all'} onclick={() => selectCategory('all')}>全部</button>
        {#each WORKSPACES as item}
          <button class:active={category === item.id} type="button" aria-pressed={category === item.id} onclick={() => selectCategory(item.id)}>{item.name}<span>{publicSkills.filter((skill) => skill.workspace === item.id).length}</span></button>
        {/each}
      </div>

      {#if visibleSkills.length}
        <div class="skill-grid">
          {#each visibleSkills as skill (skill.id)}
            <SkillCard {skill} />
          {/each}
        </div>
        {#if totalPages > 1}
          <nav class="pagination" aria-label="目录分页">
            <button type="button" disabled={currentPage === 1} onclick={() => (currentPage -= 1)} aria-label="上一页"><ArrowLeft size={16} /></button>
            <span>第 {currentPage} / {totalPages} 页</span>
            <button type="button" disabled={currentPage === totalPages} onclick={() => (currentPage += 1)} aria-label="下一页"><ArrowRight size={16} /></button>
          </nav>
        {/if}
      {:else}
        <div class="empty-state">
          <p class="section-label">NO MATCH</p>
          <h3>没有找到对应的 Skill</h3>
          <p>换一个任务词，或回到全部目录。</p>
          <button type="button" onclick={resetFilters}>清空筛选</button>
        </div>
      {/if}
    </section>

    <section class="catalog-note" aria-label="收录说明">
      <div>
        <p class="section-label">CURATION NOTE</p>
        <h2>精选，不等于搬运。</h2>
      </div>
      <p>公开目录只收录有独立 SKILL.md、来源和许可证可核验的外部 Skill。内部实验与未完成复核的候选仍保留在仓库，不混进公开结果。</p>
      <a href="https://github.com/open-marketing-cn/open-marketing-agents/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">查看收录规则 <ArrowUpRight size={16} /></a>
    </section>
  </main>

  <footer>
    <div class="brand-lockup light"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>OPEN MARKETING</strong><small>SKILLS DIRECTORY</small></span></div>
    <p>目录版本 {registry.catalogVersion} · 不登录、不保存模型 Key、不连接真实营销账户。</p>
    <a href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">在 GitHub 查看与贡献 <ArrowRight size={16} /></a>
  </footer>
</div>
