<script lang="ts">
  import { ArrowDown, ArrowRight, Search, ShieldCheck, Sparkles } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import { registry, SOURCE_LABELS, WORKSPACES, type SourceType, type WorkspaceId } from '$lib/skills';

  const channels = [...new Set(registry.skills.flatMap((skill) => skill.channels))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  let query = $state('');
  let workspace = $state<WorkspaceId | 'all'>('all');
  let source = $state<SourceType | 'all'>('all');
  let channel = $state('all');
  let validation = $state<'all' | 'installable' | 'practice'>('all');

  let filteredSkills = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN');
    return registry.skills.filter((skill) => {
      if (workspace !== 'all' && skill.workspace !== workspace) return false;
      if (source !== 'all' && skill.source.type !== source) return false;
      if (channel !== 'all' && !skill.channels.includes(channel)) return false;
      if (validation === 'installable' && !skill.installable) return false;
      if (validation === 'practice' && skill.validation.practice.status !== 'passed') return false;
      if (!needle) return true;
      return [skill.titleZh, skill.originalName, skill.summaryZh, ...skill.audiences, ...skill.useCases, ...skill.inputs, ...skill.outputs, ...skill.channels]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(needle);
    });
  });

  function chooseWorkspace(id: WorkspaceId) {
    workspace = workspace === id ? 'all' : id;
    document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>Open Marketing Skills｜品牌 0→1 独立 Skill 精选</title>
  <meta name="description" content="围绕洞察、策略、创意、媒介与运营，精选来源透明、可独立安装的品牌 0→1 营销 Skill。" />
</svelte:head>

<div class="page-shell">
  <SiteHeader />

  <main>
    <section class="hero-section">
      <div class="hero-copy">
        <div class="eyebrow"><span></span> OPEN MARKETING SKILLS · V1</div>
        <h1>一条品牌 0→1 路线<br /><em>{registry.stats.total} 个能单独开工的 Skill</em></h1>
        <p class="hero-lead">从消费者洞察到 Campaign 复盘。每次只装一个，输入清楚、交付具体、来源透明，人保留最后决定。</p>
        <div class="hero-actions">
          <a class="button button-primary button-large" href="#catalog">开始选 Skill <ArrowDown size={18} /></a>
          <a class="text-link" href="https://github.com/open-marketing-cn/open-marketing-agents/tree/main/docs/plans" target="_blank" rel="noreferrer">看公开收录规则 <ArrowRight size={16} /></a>
        </div>
      </div>

      <div class="hero-board" aria-label="品牌 0 到 1 五阶段概览">
        <div class="board-head"><span>BRAND BUILDING MAP</span><b>0 → 1</b></div>
        <ol>
          {#each WORKSPACES as item}
            <li class={`workspace-${item.id}`}>
              <span>{item.number}</span>
              <div><strong>{item.name}</strong><small>{item.output}</small></div>
              <b>{registry.stats.byWorkspace[item.id]}</b>
            </li>
          {/each}
        </ol>
        <div class="board-foot"><ShieldCheck size={16} /> 独立安装 · 来源核验 · 人工决策</div>
      </div>
    </section>

    <section class="growth-section" aria-labelledby="growth-title">
      <div class="section-kicker"><span>01</span><p id="growth-title">先选品牌成长阶段</p></div>
      <div class="growth-grid">
        <article class="growth-card active">
          <div><b>0→1</b><span>现在开放</span></div>
          <h2>从机会到第一次完整上线</h2>
          <p>找到人群与问题，建立定位，产出创意，完成上线与第一轮学习。</p>
          <a href="#path">进入这条路线 <ArrowRight size={17} /></a>
        </article>
        <article class="growth-card future">
          <div><b>1→10</b><span>后续开放</span></div>
          <h2>从有效尝试到可复制增长</h2>
          <p>放大有效渠道、内容和转化机制，建立稳定节奏与增长模型。</p>
        </article>
        <article class="growth-card future">
          <div><b>10→∞</b><span>后续开放</span></div>
          <h2>从单点增长到品牌系统</h2>
          <p>跨市场、跨团队扩张，在规模化中保持品牌一致与组织能力。</p>
        </article>
      </div>
    </section>

    <section class="path-section" id="path" aria-labelledby="path-title">
      <div class="section-heading">
        <div>
          <div class="section-kicker"><span>02</span><p>按 0→1 路线选择</p></div>
          <h2 id="path-title">你现在卡在哪一步？</h2>
        </div>
        <p>路线只帮助导航。点击一个阶段筛选，Skill 之间没有强制依赖。</p>
      </div>

      <div class="path-rail">
        {#each WORKSPACES as item, index}
          <button class:active={workspace === item.id} class={`path-stop workspace-${item.id}`} type="button" onclick={() => chooseWorkspace(item.id)}>
            <span class="path-number">{item.number}</span>
            <span class="path-dot" aria-hidden="true"></span>
            <span class="path-copy"><b>{item.name}</b><small>{item.question}</small><em>{item.output}</em></span>
            <span class="path-count">{registry.stats.byWorkspace[item.id]} SKILLS</span>
          </button>
          {#if index < WORKSPACES.length - 1}<span class="path-arrow" aria-hidden="true">→</span>{/if}
        {/each}
      </div>
    </section>

    <section class="catalog-section" id="catalog" aria-labelledby="catalog-title">
      <div class="catalog-heading">
        <div>
          <div class="section-kicker"><span>03</span><p>独立 Skill 目录</p></div>
          <h2 id="catalog-title">直接看你会拿到什么</h2>
        </div>
        <div class="catalog-stat"><strong>{filteredSkills.length}</strong><span>个结果</span><small>目录版本 {registry.catalogVersion}</small></div>
      </div>

      <div class="filter-panel">
        <label class="search-field">
          <Search size={18} />
          <span class="sr-only">搜索任务、输出或渠道</span>
          <input bind:value={query} type="search" placeholder="搜任务、输出、渠道，例如：竞品 / Brief / 小红书" />
        </label>
        <label><span>阶段</span><select bind:value={workspace}><option value="all">全部五阶段</option>{#each WORKSPACES as item}<option value={item.id}>{item.number} {item.name}</option>{/each}</select></label>
        <label><span>渠道</span><select bind:value={channel}><option value="all">全部渠道</option>{#each channels as item}<option value={item}>{item}</option>{/each}</select></label>
        <label><span>验证</span><select bind:value={validation}><option value="all">全部状态</option><option value="installable">安装已验证</option><option value="practice">实战已验证</option></select></label>
      </div>

      <div class="source-filters" aria-label="按来源类型筛选">
        <button class:active={source === 'all'} type="button" onclick={() => (source = 'all')}>全部来源 <span>{registry.stats.total}</span></button>
        {#each Object.entries(SOURCE_LABELS) as [id, label]}
          <button class:active={source === id} type="button" onclick={() => (source = id as SourceType)}>{label} <span>{registry.stats.bySource[id as SourceType]}</span></button>
        {/each}
      </div>

      {#if filteredSkills.length}
        <div class="skill-grid">{#each filteredSkills as skill (skill.id)}<SkillCard {skill} />{/each}</div>
      {:else}
        <div class="empty-state"><Sparkles size={24} /><h3>暂时没有完全匹配的 Skill</h3><p>试试减少筛选，或换一个更具体的交付物名称。</p><button type="button" onclick={() => { query = ''; workspace = 'all'; source = 'all'; channel = 'all'; validation = 'all'; }}>清空筛选</button></div>
      {/if}
    </section>

    <section class="selection-rule">
      <div><span>WHAT “CURATED” MEANS</span><h2>精选，不等于搬运。</h2></div>
      <ul>
        <li><b>01</b><span><strong>来源透明</strong>作者、路径、Commit、许可证和核验日期都可查。</span></li>
        <li><b>02</b><span><strong>任务具体</strong>先写输入、输出和人要做的决定，再写它有多聪明。</span></li>
        <li><b>03</b><span><strong>独立安装</strong>related 只推荐下一步，不形成隐藏依赖或组合包。</span></li>
        <li><b>04</b><span><strong>验证分层</strong>技术安装通过才能安装；真实任务通过才有实战徽章。</span></li>
      </ul>
    </section>
  </main>

  <footer>
    <div class="brand-lockup light"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>OPEN MARKETING</strong><small>BRAND 0→1 SKILLS</small></span></div>
    <p>V1 只收录独立 Skill。没有登录、没有模型 Key、不会连接或修改真实营销账户。</p>
    <a href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">在 GitHub 查看与贡献 <ArrowRight size={16} /></a>
  </footer>
</div>
