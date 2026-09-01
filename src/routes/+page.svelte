<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowLeft, ArrowRight, ArrowUpRight, Layers3, Search, Sparkles } from '@lucide/svelte';
  import CandidateCard from '$lib/CandidateCard.svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import {
    CATALOG_BUCKETS, candidateRegistry, catalogBucketForSkill, communityRecommendations,
    comparisonHref, pendingSkills, publicSkills, registry, skillHref, workflowExamples,
    type CatalogBucketId
  } from '$lib/skills';

  type CatalogMode = 'verified' | 'pending';
  const pageSize = 12;
  const recommendFormHref = 'https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f';
  const recommendationPlazaHref = 'https://my.feishu.cn/share/base/webpage/shrcnFlduGlQoZFNk27XZceIQNY';
  const curatorName = ['Joy', 'ce'].join('');
  let activeMode = $state<CatalogMode>('verified');
  let bucket = $state<CatalogBucketId | 'all'>('all');
  let query = $state('');
  let currentPage = $state(1);
  const guizang = publicSkills.find((skill) => skill.id === 'guizang-ppt-skill');
  const pptKit = publicSkills.find((skill) => skill.id === 'ppt-kit');
  const publicById = new Map(publicSkills.map((skill) => [skill.id, skill]));

  let verifiedFiltered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN');
    return publicSkills.filter((skill) => {
      if (bucket !== 'all' && catalogBucketForSkill(skill) !== bucket) return false;
      if (!needle) return true;
      return [skill.titleZh, skill.originalName, skill.summaryZh, skill.card.outcomeZh, skill.methodType, skill.source.author, ...skill.outputs, ...skill.channels]
        .join(' ').toLocaleLowerCase('zh-CN').includes(needle);
    });
  });

  let pendingFiltered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN');
    return pendingSkills.filter((skill) => {
      if (bucket !== 'all' && skill.bucket !== bucket) return false;
      if (!needle) return true;
      return [skill.titleZh, skill.originalName, skill.summaryZh, skill.sourceLabelZh].join(' ').toLocaleLowerCase('zh-CN').includes(needle);
    });
  });

  const filteredCount = $derived(activeMode === 'verified' ? verifiedFiltered.length : pendingFiltered.length);
  const totalPages = $derived(Math.max(1, Math.ceil(filteredCount / pageSize)));
  const visibleVerified = $derived(verifiedFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  const visiblePending = $derived(pendingFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize));

  $effect(() => { activeMode; bucket; query; currentPage = 1; });

  function selectBucket(id: CatalogBucketId | 'all') { bucket = bucket === id ? 'all' : id; }
  function resetFilters() { activeMode = 'verified'; bucket = 'all'; query = ''; }
  function bucketCount(id: CatalogBucketId) {
    return activeMode === 'verified' ? publicSkills.filter((skill) => catalogBucketForSkill(skill) === id).length : pendingSkills.filter((skill) => skill.bucket === id).length;
  }
  function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(value)); }
</script>

<svelte:head>
  <title>Open Marketing Skills｜把营销 Skill 真正用起来</title>
  <meta name="description" content="经过来源核验与实践分级的 Marketing Skills，以及同赛道差异、使用场景和社区真实推荐。" />
</svelte:head>

<div class="page-shell home-page">
  <SiteHeader />
  <main>
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span aria-hidden="true"></span> OPEN MARKETING SKILLS</p>
        <h1 id="hero-title">像搭乐高一样，<br /><em>组合你的营销工作流。</em></h1>
        <p class="hero-lead">不是再收藏一份 Skill 清单。这里讲清它适合什么场景、与同类有什么区别、怎样组合，以及真实使用还缺什么证据。</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#catalog">浏览 {registry.stats.total + candidateRegistry.stats.total} 个 Skill</a>
          <a class="button button-secondary" href={recommendFormHref} target="_blank" rel="noreferrer">推荐一个 Skill <ArrowUpRight size={16} /></a>
          <a class="text-link" href="https://github.com/open-marketing-cn/open-marketing-agents/blob/main/README.md#什么会被收录" target="_blank" rel="noreferrer">查看收录标准</a>
        </div>
      </div>
      <div class="lego-board" aria-label="一个 Skill 可以完成单项任务，多个 Skill 可以组合成工作流">
        <div class="lego-caption"><span>SKILL LEGO</span><small>单项能力 → 可交接工作流</small></div>
        <div class="lego-line"><b>1 个</b><span class="lego-piece piece-write">copywriting</span><i>写出一版页面文案</i></div>
        <div class="lego-line"><b>3 个</b><span class="lego-piece piece-gather">research</span><strong>+</strong><span class="lego-piece piece-write">copy</span><strong>+</strong><span class="lego-piece piece-visual">visual</span></div>
        <div class="lego-line lego-line-result"><b>5+ 个</b><div class="mini-pieces" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><span>品牌活动页 + 内容资产</span></div>
      </div>
    </section>

    <section class="catalog-section" id="catalog" aria-labelledby="catalog-title">
      <div class="section-heading catalog-heading"><div><p class="section-label">SKILL DIRECTORY</p><h2 id="catalog-title">按营销任务找，不按热度盲选</h2></div><p>正式收录和待核验严格分开。待核验代表值得研究，不代表已经好用。</p></div>
      <div class="catalog-tabs" role="tablist" aria-label="目录状态">
        <button class:active={activeMode === 'verified'} type="button" role="tab" aria-selected={activeMode === 'verified'} onclick={() => (activeMode = 'verified')}>正式收录 <span>{registry.stats.total}</span></button>
        <button class:active={activeMode === 'pending'} type="button" role="tab" aria-selected={activeMode === 'pending'} onclick={() => (activeMode = 'pending')}>待核验 <span>{candidateRegistry.stats.total}</span></button>
      </div>
      <div class="catalog-toolbar"><label class="search-field"><Search size={18} aria-hidden="true" /><span class="sr-only">搜索任务、Skill 或作者</span><input bind:value={query} type="search" placeholder="搜索任务、Skill 或作者" /></label><span class="result-count">{filteredCount} 个结果</span></div>
      <div class="category-row" aria-label="按营销任务分类">
        <button class:active={bucket === 'all'} type="button" aria-pressed={bucket === 'all'} onclick={() => selectBucket('all')}>全部</button>
        {#each CATALOG_BUCKETS as item}<button class:active={bucket === item.id} type="button" aria-pressed={bucket === item.id} onclick={() => selectBucket(item.id)}>{item.name}<span>{bucketCount(item.id)}</span></button>{/each}
      </div>
      {#if filteredCount}
        <div class="skill-grid">
          {#if activeMode === 'verified'}
            {#each visibleVerified as skill (skill.id)}<SkillCard {skill} />{/each}
          {:else}
            {#each visiblePending as skill (skill.id)}
              {@const candidateBucket = CATALOG_BUCKETS.find((item) => item.id === skill.bucket)!}
              <CandidateCard {skill} bucket={candidateBucket} claimHref={recommendFormHref} />
            {/each}
          {/if}
        </div>
        {#if totalPages > 1}<nav class="pagination" aria-label="目录分页"><button type="button" disabled={currentPage === 1} onclick={() => (currentPage -= 1)} aria-label="上一页"><ArrowLeft size={16} /></button><span>第 {currentPage} / {totalPages} 页</span><button type="button" disabled={currentPage === totalPages} onclick={() => (currentPage += 1)} aria-label="下一页"><ArrowRight size={16} /></button></nav>{/if}
      {:else}
        <div class="empty-state"><p class="section-label">NO MATCH</p><h3>没有找到对应的 Skill</h3><p>换一个任务词，或回到全部目录。</p><button type="button" onclick={resetFilters}>清空筛选</button></div>
      {/if}
    </section>

    <section class="workflow-section" id="workflows" aria-labelledby="workflow-title">
      <div class="section-heading"><div><p class="section-label">SCENARIO RECIPES</p><h2 id="workflow-title">四套场景玩法示范</h2></div><p>它们说明 Skill 可以怎样组合，不代表这四套组合已经完成真实案例验证。</p></div>
      <div class="workflow-grid">
        {#each workflowExamples as workflow, index}
          <article class="workflow-card">
            <header><span>PLAY {String(index + 1).padStart(2, '0')}</span><Layers3 size={18} /></header>
            <h3>{workflow.titleZh}</h3><p class="workflow-subtitle">{workflow.subtitleZh}</p><p class="workflow-description">{workflow.descriptionZh}</p>
            <div class="workflow-composition">{#each workflow.composition as item}{#if item.status === 'verified' && publicById.has(item.id)}<a href={skillHref(item.id, base)}>{item.id}<i>已核验</i></a>{:else}<span>{item.id}<i>待核验</i></span>{/if}{/each}</div>
            <ol>{#each workflow.steps as step}<li>{step}</li>{/each}</ol>
            <footer><span>留下的资产</span><strong>{workflow.outputZh}</strong></footer>
          </article>
        {/each}
      </div>
    </section>

    {#if guizang && pptKit}
      <section class="choice-section" aria-labelledby="ppt-choice-title">
        <div class="section-heading choice-heading"><div><p class="section-label">SAME CATEGORY, DIFFERENT DEPTH</p><h2 id="ppt-choice-title">同样做 PPT，做深的是不同环节</h2></div><p>不是选 A 或选 B。把工作方式、使用门槛和共同边界摊开，才能知道它们为什么不一样。</p></div>
        <div class="choice-grid">
          <a class="choice-card controlled" href={skillHref(guizang.id, base)}><span>受控设计型</span><h3>第一次出稿更快、更稳</h3><code>{guizang.originalName}</code><p>像一家有两套招牌风格的设计工作室。适合演讲、发布会和 Demo Day。</p><b>模板约束更强 <ArrowRight size={15} /></b></a>
          <a class="choice-card flexible" href={skillHref(pptKit.id, base)}><span>参考驱动型</span><h3>参考提炼与系列生产更完整</h3><code>{pptKit.originalName}</code><p>像自己的 PPT 工厂。上限更高，也更看参考质量和操作者水平。</p><b>自由度与门槛都更高 <ArrowRight size={15} /></b></a>
          <div class="choice-card neither"><span>共同边界</span><h3>原生可编辑 PPTX 与多人协作都不是核心交付</h3><p>复杂表格和多人在线协作属于另一段工作。边界不是缺点，是任务范围。</p><b>先看任务，再看 Skill</b></div>
        </div>
        <a class="section-link" href={comparisonHref('ppt', base)}>查看完整六维画像与逐项差异 <ArrowRight size={16} /></a>
      </section>
    {/if}

    <section class="diy-section" aria-labelledby="diy-title">
      <div class="diy-copy"><p class="section-label">BUILD YOUR OWN WORKFLOW</p><h2 id="diy-title">不会组合？从一句真实任务开始</h2><p>先拆动作，再给每个动作找 Skill。工作流不是装得越多越好，而是每一步都留下可交接结果。</p></div>
      <div class="diy-board"><blockquote>“这周把一个品牌活动做成落地页和配套内容。”</blockquote><div class="diy-steps"><span><b>1</b>研究用户语言<i>调研洞察</i></span><span><b>2</b>确定定位与主张<i>定位策略</i></span><span><b>3</b>写页面与社媒文案<i>内容写作</i></span><span><b>4</b>做封面和解释图<i>内容视觉化</i></span><span><b>5</b>接入转化与复盘<i>页面转化</i></span></div></div>
    </section>

    <section class="community-section" id="community" aria-labelledby="community-title">
      <div class="section-heading"><div><p class="section-label">COMMUNITY SIGNALS</p><h2 id="community-title">大家最近推荐了什么</h2></div><p>提交后立即进入飞书公开广场，网站展示最新的去重预览。社区推荐不等于正式收录。</p></div>
      {#if communityRecommendations.length}
        <div class="recommendation-grid">{#each communityRecommendations as item}<a href={item.url} target="_blank" rel="noreferrer"><span>{item.category} · {formatDate(item.submittedAt)}</span><h3>{item.name}</h3><p class="recommendation-author">原作者 · {item.originalAuthor}</p><p>{item.description}</p><dl><div><dt>场景</dt><dd>{item.scenario}</dd></div><div><dt>适配</dt><dd>{item.agent}</dd></div></dl><footer>推荐人 · {item.contributor ?? '匿名贡献者'}{#if item.recommendationCount > 1}<b>{item.recommendationCount} 人推荐</b>{/if}<ArrowUpRight size={15} /></footer></a>{/each}</div>
      {:else}
        <div class="community-empty"><Sparkles size={22} /><h3>公开推荐广场正在开放</h3><p>推荐一个你实际用过的 Marketing Skill，并写清它在哪个场景里帮了你。</p></div>
      {/if}
      <div class="community-actions"><a class="button button-primary" href={recommendFormHref} target="_blank" rel="noreferrer">推荐一个 Skill <ArrowUpRight size={16} /></a><a class="button button-secondary" href={recommendationPlazaHref} target="_blank" rel="noreferrer">查看全部推荐 <ArrowUpRight size={16} /></a></div>
    </section>

    <section class="layers-section" aria-labelledby="layers-title">
      <div><p class="section-label">WHAT A SKILL IS</p><h2 id="layers-title">Skill 是方法层，不是全部工具</h2><p>Skill 负责告诉 Agent 怎样完成任务；模型负责理解与生成；MCP / Connector 连接数据；生图、视频和发布仍由对应工具完成。</p></div>
      <div class="layer-stack" aria-label="Skill 与其他 AI 能力层的关系"><span>你的任务与材料</span><span>Skill：步骤、判断与交付标准</span><span>Agent / 模型：执行与生成</span><span>工具 / MCP：数据、图片、视频与发布</span></div>
    </section>
  </main>

  <section class="curator-section" aria-label="策展者说明"><img src={`${base}/interflow-logo.svg`} alt="互通有无 Interflow" /><div><p class="section-label">CURATED BY {curatorName.toLocaleUpperCase('en-US')}</p><h2>把好 Skill 变成真实营销能力</h2><p>Open Marketing 负责公开目录与社区共创。{curatorName} / 互通有无在页尾轻量承接真实场景诊断：把模糊的 AI 能力翻译成能运行、能交接的营销工作流。</p></div><a href="https://my.feishu.cn/wiki/VhY0wm5reiGxwskOUzPcj4M7nSe" target="_blank" rel="noreferrer">了解互通有无 <ArrowUpRight size={16} /></a></section>
  <footer class="site-footer"><div class="brand-lockup light"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>OPEN MARKETING</strong><small>SKILLS DIRECTORY</small></span></div><p>目录版本 {registry.catalogVersion} · 正式收录与社区推荐分开标记 · 不连接你的真实营销账户。</p><a href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">在 GitHub 查看与贡献 <ArrowRight size={16} /></a></footer>
</div>
