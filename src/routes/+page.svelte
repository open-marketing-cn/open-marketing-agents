<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ArrowDownToLine,
    ArrowUpRight,
    Bot,
    Check,
    ChevronRight,
    CircleAlert,
    Database,
    ExternalLink,
    FileOutput,
    FlaskConical,
    FolderSearch,
    Info,
    Laptop,
    LockKeyhole,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    Wrench,
    X
  } from '@lucide/svelte';
  import { CATALOG, canInstall, countByWorkspace, searchCatalog } from '$lib/catalog';
  import { detectCodex, installPackage, openCodex } from '$lib/bridge';
  import StatusPill from '$lib/StatusPill.svelte';
  import { WORKSPACES, type CatalogPackage, type CodexStatus, type WorkspaceId } from '$lib/types';
  import '../app.css';

  let query = $state('');
  let workspace = $state<WorkspaceId | 'all'>('all');
  let kind = $state<'all' | 'agent' | 'skill'>('agent');
  let statusFilter = $state<'all' | CatalogPackage['status']>('all');
  let selected = $state<CatalogPackage>(CATALOG[0]);
  let codexStatus = $state<CodexStatus | null>(null);
  let detecting = $state(false);
  let installOpen = $state(false);
  let installationMessage = $state('');
  let selectedOptionalSkills = $state<string[]>([]);

  let visiblePackages = $derived(searchCatalog(CATALOG, query, workspace, kind, statusFilter));
  let packageCounts = $derived({
    agents: CATALOG.filter((item) => item.kind === 'agent').length,
    skills: CATALOG.filter((item) => item.kind === 'skill').length,
    installable: CATALOG.filter((item) => canInstall(item)).length
  });

  onMount(() => refreshCodex());

  async function refreshCodex() {
    detecting = true;
    try {
      codexStatus = await detectCodex();
    } finally {
      detecting = false;
    }
  }

  function selectPackage(item: CatalogPackage) {
    selected = item;
    installationMessage = '';
  }

  function openInstall() {
    selectedOptionalSkills = selected.bundledSkills.filter((skill) => !skill.required).map((skill) => skill.id);
    installOpen = true;
  }

  async function confirmInstall() {
    const result = await installPackage({
      packageId: selected.id,
      optionalSkillIds: selectedOptionalSkills,
      permissionVersion: selected.version
    });
    installationMessage = result.message;
    if (result.status !== 'blocked') installOpen = false;
  }

  function toggleOptionalSkill(skillId: string) {
    selectedOptionalSkills = selectedOptionalSkills.includes(skillId)
      ? selectedOptionalSkills.filter((id) => id !== skillId)
      : [...selectedOptionalSkills, skillId];
  }

  function chooseKind(nextKind: 'agent' | 'skill') {
    kind = nextKind;
    const first = searchCatalog(CATALOG, query, workspace, kind, statusFilter)[0];
    if (first) selected = first;
  }
</script>

<svelte:head>
  <title>Open Marketing — 营销 Agent 商店</title>
</svelte:head>

<div class="app-shell">
  <header class="titlebar" data-tauri-drag-region>
    <div class="traffic-light-space" data-tauri-drag-region aria-hidden="true"></div>
    <div class="brand-lockup">
      <span class="brand-mark"><Sparkles size={15} /></span>
      <span>Open Marketing</span>
      <small>由 Interflow 发起</small>
    </div>
    <div class="codex-summary" class:connected={codexStatus?.cliFound}>
      <span class="status-dot"></span>
      {#if detecting}
        正在检测 Codex…
      {:else if codexStatus?.cliFound}
        {codexStatus.cliVersion ?? '已检测到 Codex'}
      {:else}
        未检测到 Codex
      {/if}
      <button class="icon-button" aria-label="重新检测 Codex" title="重新检测 Codex" onclick={refreshCodex}>
        <RefreshCw size={14} class={detecting ? 'spinning' : ''} />
      </button>
    </div>
  </header>

  <main class="workspace-grid">
    <aside class="left-rail">
      <div class="section-eyebrow">工作阶段</div>
      <nav aria-label="营销工作阶段">
        <button class:active={workspace === 'all'} onclick={() => (workspace = 'all')}>
          <span class="nav-index">00</span>
          <span><b>全部能力</b><small>{CATALOG.length} 个候选</small></span>
        </button>
        {#each WORKSPACES as item, index}
          <button class:active={workspace === item.id} onclick={() => (workspace = item.id)}>
            <span class="nav-index">0{index + 1}</span>
            <span><b>{item.name}</b><small>{item.caption} · {countByWorkspace(CATALOG, item.id)}</small></span>
          </button>
        {/each}
      </nav>

      <div class="rail-note">
        <ShieldCheck size={18} />
        <div><b>默认本地优先</b><span>没有自动发布、投放、私信或预算写入。</span></div>
      </div>
    </aside>

    <section class="catalog-column">
      <div class="catalog-heading">
        <div>
          <span class="section-eyebrow">Marketing capability registry</span>
          <h1>营销 Agent 商店</h1>
          <p>挑选一项真实任务，查看它需要什么、交付什么、由谁确认。</p>
        </div>
        <button class="secondary-button" onclick={refreshCodex}>
          <RefreshCw size={15} />检查本机
        </button>
      </div>

      <div class="catalog-toolbar">
        <label class="search-box">
          <Search size={16} />
          <input bind:value={query} placeholder="搜索任务、平台、行业或来源…" aria-label="搜索 Agent 或 Skill" />
          {#if query}<button aria-label="清除搜索" onclick={() => (query = '')}><X size={14} /></button>{/if}
        </label>
        <select bind:value={statusFilter} aria-label="状态筛选">
          <option value="all">全部状态</option>
          <option value="installable">可安装</option>
          <option value="pending_validation">待验证</option>
          <option value="cocreating">共创中</option>
        </select>
      </div>

      <div class="kind-switch" role="tablist" aria-label="能力类型">
        <button role="tab" aria-selected={kind === 'agent'} class:active={kind === 'agent'} onclick={() => chooseKind('agent')}>
          <Bot size={15} />Agent <span>{packageCounts.agents}</span>
        </button>
        <button role="tab" aria-selected={kind === 'skill'} class:active={kind === 'skill'} onclick={() => chooseKind('skill')}>
          <Wrench size={15} />可选 Skill <span>{packageCounts.skills}</span>
        </button>
        <div class="installable-count"><i></i>{packageCounts.installable} 个已通过真实验证</div>
      </div>

      <div class="catalog-list" aria-live="polite">
        {#if visiblePackages.length === 0}
          <div class="empty-state"><FolderSearch size={32} /><b>没有匹配的能力</b><span>换一个任务、平台或行业试试。</span></div>
        {:else}
          {#each visiblePackages as item (item.id)}
            <button class:selected={selected.id === item.id} class="catalog-row" onclick={() => selectPackage(item)}>
              <span class="row-glyph">{item.kind === 'agent' ? 'A' : 'S'}</span>
              <span class="row-copy">
                <span class="row-title"><b>{item.name}</b><StatusPill status={item.status} /></span>
                <span class="row-description">{item.shortDescription}</span>
                <span class="row-meta">{item.channels.slice(0, 3).join(' · ')}<i></i>{item.industries.slice(0, 2).join(' · ')}</span>
              </span>
              <ChevronRight size={17} class="row-chevron" />
            </button>
          {/each}
        {/if}
      </div>
    </section>

    <aside class="detail-panel" aria-label="能力详情">
      <div class="detail-topline">
        <div class="detail-kind"><span>{selected.kind === 'agent' ? 'AGENT' : 'SKILL'}</span><i></i>v{selected.version}</div>
        <StatusPill status={selected.status} />
      </div>
      <h2>{selected.name}</h2>
      <p class="detail-lede">{selected.shortDescription}</p>

      <div class="action-strip">
        {#if canInstall(selected)}
          <button class="primary-button" onclick={openInstall}><ArrowDownToLine size={16} />安装到 Codex</button>
        {:else}
          <button class="primary-button" disabled title="完成真实验证后才开放安装"><LockKeyhole size={16} />暂不可安装</button>
        {/if}
        {#if codexStatus?.desktopFound}<button class="secondary-button compact" onclick={openCodex}>打开 Codex<ArrowUpRight size={14} /></button>{/if}
      </div>

      {#if installationMessage}<div class="inline-message"><Info size={15} />{installationMessage}</div>{/if}

      <section class="evidence-spine">
        <article>
          <div class="spine-icon"><Sparkles size={16} /></div>
          <div><h3>它解决什么</h3><p>{selected.task}</p></div>
        </article>
        <article>
          <div class="spine-icon"><Database size={16} /></div>
          <div><h3>开始前要提供</h3><ul>{#each selected.requiredInputs as input}<li>{input}</li>{/each}</ul></div>
        </article>
        <article>
          <div class="spine-icon"><FileOutput size={16} /></div>
          <div><h3>你会拿到</h3><ul>{#each selected.outputs as output}<li>{output}</li>{/each}</ul></div>
        </article>
        <article>
          <div class="spine-icon warning"><CircleAlert size={16} /></div>
          <div><h3>不能替你判断</h3><ul>{#each selected.cannotInfer as limit}<li>{limit}</li>{/each}</ul></div>
        </article>
        <article>
          <div class="spine-icon"><Check size={16} /></div>
          <div><h3>人工确认点</h3><p>{selected.humanGate}</p></div>
        </article>
      </section>

      <details open>
        <summary>安装内容与权限 <span>{selected.bundledSkills.length} 个内置 Skill</span></summary>
        <div class="detail-block">
          {#if selected.bundledSkills.length === 0}<p class="muted">当前候选还没有完成依赖 Skill 的整理。</p>{/if}
          {#each selected.bundledSkills as skill}
            <div class="dependency"><span>{skill.required ? '必需' : '可选'}</span><div><b>{skill.name}</b><small>{skill.description}</small></div></div>
          {/each}
          {#each selected.permissions as permission}
            <div class="permission"><LockKeyhole size={14} /><div><b>{permission.label}<em>{permission.required ? '必需' : '可选'}</em></b><small>{permission.detail}</small></div></div>
          {/each}
        </div>
      </details>

      <details>
        <summary>验证记录 <span>{selected.validation.length} 条</span></summary>
        <div class="detail-block">
          {#if selected.validation.length === 0}
            <div class="validation-empty"><FlaskConical size={18} /><p><b>还没有真实验证记录</b><span>{selected.maturityNote}</span></p></div>
          {/if}
          {#each selected.validation as record}
            <div class="validation-record"><b>{record.role} · {record.industry}</b><p>{record.task}</p><small>{record.date} · {record.target} · {record.conclusion}</small></div>
          {/each}
        </div>
      </details>

      <details>
        <summary>来源与许可证 <span>{selected.sources.length} 个来源</span></summary>
        <div class="detail-block source-list">
          {#each selected.sources as source}
            <a href={source.url} target="_blank" rel="noreferrer"><span><b>{source.label}</b><small>{source.license} · {source.mode === 'adapted' ? '本土化改编' : source.mode === 'original' ? '原创' : '仅参考'}</small></span><ExternalLink size={14} /></a>
          {/each}
        </div>
      </details>

      <div class="codex-card">
        <Laptop size={19} />
        <div><b>Codex 优先</b><span>{codexStatus?.message ?? '正在读取本机状态…'}</span><code>{codexStatus?.skillsDirectory ?? '~/.codex/skills'}</code></div>
      </div>
    </aside>
  </main>
</div>

{#if installOpen}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.currentTarget === event.target && (installOpen = false)}>
    <div class="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <button class="modal-close" aria-label="关闭" onclick={() => (installOpen = false)}><X size={18} /></button>
      <span class="section-eyebrow">安装到 Codex · 全局</span>
      <h2 id="install-title">{selected.name}</h2>
      <p>安装后会在 Codex 的技能列表中显示一个 Agent。它依赖的 Skill 会放在 Agent 内部，不占用你的顶层技能列表。</p>
      <div class="install-path"><code>~/.codex/skills/open-marketing-{selected.id}/</code></div>

      {#if selected.bundledSkills.length > 0}
        <h3>内置 Skill</h3>
        <div class="skill-options">
          {#each selected.bundledSkills as skill}
            <label class:required={skill.required}>
              <input type="checkbox" checked={skill.required || selectedOptionalSkills.includes(skill.id)} disabled={skill.required} onchange={() => toggleOptionalSkill(skill.id)} />
              <span><b>{skill.name}</b><small>{skill.description}</small></span>
              <em>{skill.required ? '必需' : '可选'}</em>
            </label>
          {/each}
        </div>
      {/if}

      <div class="permission-confirm"><ShieldCheck size={20} /><div><b>你正在确认 v{selected.version} 的权限说明</b><span>以后如果新增权限，Open Marketing 会再次征求确认。</span></div></div>
      <div class="modal-actions"><button class="secondary-button" onclick={() => (installOpen = false)}>取消</button><button class="primary-button" onclick={confirmInstall}><ArrowDownToLine size={16} />确认安装</button></div>
    </div>
  </div>
{/if}
