<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ArrowDownToLine,
    ArrowUpRight,
    BarChart3,
    ChevronRight,
    CircleAlert,
    Database,
    ExternalLink,
    FileOutput,
    FlaskConical,
    FolderSearch,
    Info,
    Laptop,
    Layers3,
    LayoutGrid,
    LockKeyhole,
    PenTool,
    Rocket,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    X
  } from '@lucide/svelte';
  import { CATALOG, canInstall, searchCatalog } from '$lib/catalog';
  import { detectCodex, installPackage, openCodex } from '$lib/bridge';
  import StatusPill from '$lib/StatusPill.svelte';
  import { WORKSPACES, type CatalogPackage, type CodexStatus, type WorkspaceId } from '$lib/types';
  import '../app.css';

  const AGENTS = CATALOG.filter((item) => item.kind === 'agent');
  const CHANNELS = [...new Set(AGENTS.flatMap((item) => item.channels))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const INDUSTRIES = [...new Set(AGENTS.flatMap((item) => item.industries))].sort((a, b) => a.localeCompare(b, 'zh-CN'));

  const VIEW_META: Record<WorkspaceId | 'all', { number: string; english: string; chinese: string; description: string; output: string }> = {
    all: { number: '00', english: 'Agent Store', chinese: '全部 Agent', description: '按营销任务、平台和行业挑选可安装到 Codex 的 Agent。', output: 'Agent 任务包 / 内置 Skill' },
    insights: { number: '01', english: 'Insights', chinese: '市场调研', description: '从品牌、竞品、消费者、搜索和平台变化中整理可追溯证据。', output: '市场资料包 / 证据与判断卡' },
    strategy: { number: '02', english: 'Strategy', chinese: '营销策略', description: '把已确认的问题、目标、人群和证据组织成可执行的营销选择。', output: '营销项目底稿 / 策略任务书' },
    creation: { number: '03', english: 'Creation', chinese: '创意与内容', description: '形成内容角度、信息结构、文案初稿和可供审稿的创意交付物。', output: '创意任务书 / 内容母稿' },
    adaptation: { number: '04', english: 'Adaptation', chinese: '平台适配', description: '把已确认内容改写成适合不同平台、场景和素材规格的版本。', output: '平台版本 / 内容与物料清单' },
    delivery: { number: '05', english: 'Delivery', chinese: '推进与发布', description: '准备达人、投放、发布和上线前需要的任务、素材与确认。', output: '执行任务包 / 上线前检查' },
    performance: { number: '06', english: 'Performance', chinese: '效果与学习', description: '归集真实结果、记录限制与失败，形成下一轮可验证的改进。', output: '结果复盘 / 学习记录' }
  };

  let query = $state('');
  let workspace = $state<WorkspaceId | 'all'>('insights');
  let statusFilter = $state<'all' | CatalogPackage['status']>('all');
  let channelFilter = $state('all');
  let industryFilter = $state('all');
  let selected = $state<CatalogPackage>(AGENTS.find((item) => item.workspace === 'insights') ?? AGENTS[0]);
  let codexStatus = $state<CodexStatus | null>(null);
  let detecting = $state(false);
  let detailOpen = $state(false);
  let installOpen = $state(false);
  let installationMessage = $state('');
  let selectedOptionalSkills = $state<string[]>([]);

  let activeView = $derived(VIEW_META[workspace]);
  let visiblePackages = $derived.by(() =>
    searchCatalog(AGENTS, query, workspace, 'agent', statusFilter).filter((item) =>
      (channelFilter === 'all' || item.channels.includes(channelFilter)) &&
      (industryFilter === 'all' || item.industries.includes(industryFilter))
    )
  );
  let groupedPackages = $derived(
    WORKSPACES.map((stage) => ({ stage, items: visiblePackages.filter((item) => item.workspace === stage.id) }))
      .filter((group) => group.items.length > 0)
  );
  let packageCounts = $derived({
    agents: AGENTS.length,
    visible: visiblePackages.length,
    installable: AGENTS.filter((item) => canInstall(item)).length
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

  function chooseWorkspace(nextWorkspace: WorkspaceId | 'all') {
    workspace = nextWorkspace;
    detailOpen = false;
  }

  function selectPackage(item: CatalogPackage) {
    selected = item;
    installationMessage = '';
    detailOpen = true;
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
</script>

<svelte:head>
  <title>Open Marketing — 营销 Agent 商店</title>
  <meta name="description" content="Open Marketing，面向中国营销人的本地 Agent 商店。" />
</svelte:head>

<div class="workbench-shell">
  <aside class="workspace-sidebar">
    <div class="sidebar-brand" data-tauri-drag-region>
      <strong>Open Marketing</strong>
      <span>Marketing Agent Store</span>
    </div>

    <button class="workspace-switch" type="button" onclick={() => chooseWorkspace('all')}>
      <span class="workspace-monogram">OM</span>
      <span><b>营销 Agent 商店</b><small>由 Interflow 发起</small></span>
      <ChevronRight size={15} />
    </button>

    <nav class="sidebar-nav" aria-label="Agent 商店导航">
      <button class:active={workspace === 'all'} type="button" onclick={() => chooseWorkspace('all')}>
        <LayoutGrid size={17} />
        <span>全部 Agent<small>{packageCounts.agents} 个候选</small></span>
      </button>
      {#each WORKSPACES as item, index}
        <button class:active={workspace === item.id} type="button" onclick={() => chooseWorkspace(item.id)}>
          {#if index === 0}<Search size={17} />
          {:else if index === 1}<Target size={17} />
          {:else if index === 2}<PenTool size={17} />
          {:else if index === 3}<Layers3 size={17} />
          {:else if index === 4}<Rocket size={17} />
          {:else}<BarChart3 size={17} />{/if}
          <span>{VIEW_META[item.id].english}<small>{VIEW_META[item.id].chinese}</small></span>
        </button>
      {/each}
    </nav>

    <section class="sidebar-status">
      <span>Codex status</span>
      <strong>{codexStatus?.cliFound ? '已检测到 Codex' : '未检测到 Codex'}</strong>
      <small>{codexStatus?.message ?? '网页预览不会读取你的电脑。'}</small>
      <button type="button" onclick={refreshCodex}>{detecting ? '检测中…' : '重新检测'}</button>
    </section>

    <div class="sidebar-foot">
      <ShieldCheck size={14} />
      <span>本地优先。不自动发布、投放、私信或调整预算。</span>
    </div>
  </aside>

  <section class="workbench-main">
    <header class="workbench-topbar" data-tauri-drag-region>
      <div>
        <span>OPEN MARKETING · 营销工作阶段</span>
        <h1>{activeView.english}</h1>
      </div>
      <div class="topbar-actions">
        <label>
          <span>Current scope</span>
          <select value={workspace} onchange={(event) => chooseWorkspace((event.currentTarget as HTMLSelectElement).value as WorkspaceId | 'all')}>
            <option value="all">全部 Agent</option>
            {#each WORKSPACES as item}<option value={item.id}>{VIEW_META[item.id].english} · {VIEW_META[item.id].chinese}</option>{/each}
          </select>
        </label>
        <div class="topbar-codex" class:connected={codexStatus?.cliFound}>
          <span><Database size={14} />Codex</span>
          <strong>{codexStatus?.cliFound ? codexStatus.cliVersion ?? '已连接' : '待连接'}</strong>
        </div>
      </div>
    </header>

    <div class="workbench-scroll">
      <section class="room-card">
        <nav class="stage-rail" aria-label="营销六阶段">
          {#each WORKSPACES as item, index}
            <button class:active={workspace === item.id} type="button" onclick={() => chooseWorkspace(item.id)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{VIEW_META[item.id].english}</strong>
              <small>{VIEW_META[item.id].chinese}</small>
            </button>
          {/each}
        </nav>

        <div class="room-context">
          <div class="room-title">
            <span>{activeView.number} / AGENT ROOM</span>
            <h2>{activeView.english}<i></i>{activeView.chinese}</h2>
            <p>{activeView.description}</p>
          </div>
          <dl>
            <div><dt>当前范围</dt><dd>{workspace === 'all' ? '全部营销 Agent' : activeView.chinese}</dd></div>
            <div><dt>候选 Agent</dt><dd>{packageCounts.visible} 个</dd></div>
            <div><dt>标准交付物</dt><dd>{activeView.output}</dd></div>
            <div><dt>安装目标</dt><dd>Codex 全局 Skill 目录</dd></div>
          </dl>
        </div>
      </section>

      <section class="agent-dock">
        <header class="dock-heading">
          <div>
            <span>AGENT DOCK</span>
            <h3>{workspace === 'all' ? '营销 Agent 商店' : `${activeView.chinese} Agent`}</h3>
            <p>单独挑选和安装；Skill 随 Agent 进入 Codex，不单独占用商店入口。</p>
          </div>
          {#if workspace !== 'all'}
            <button type="button" onclick={() => chooseWorkspace('all')}><Sparkles size={15} />查看全部 Agent</button>
          {/if}
        </header>

        <div class="dock-filters">
          <label class="dock-search"><Search size={15} /><input bind:value={query} placeholder="搜索营销任务、平台或行业" aria-label="搜索 Agent" /></label>
          <label><select bind:value={channelFilter} aria-label="平台筛选"><option value="all">全部平台</option>{#each CHANNELS as item}<option value={item}>{item}</option>{/each}</select></label>
          <label><select bind:value={industryFilter} aria-label="行业筛选"><option value="all">全部行业</option>{#each INDUSTRIES as item}<option value={item}>{item}</option>{/each}</select></label>
          <label><select bind:value={statusFilter} aria-label="状态筛选"><option value="all">全部状态</option><option value="installable">可安装</option><option value="pending_validation">待验证</option><option value="cocreating">共创中</option></select></label>
        </div>

        <div class="agent-groups" aria-live="polite">
          {#if groupedPackages.length === 0}
            <div class="empty-state"><FolderSearch size={28} /><strong>没有符合当前筛选的 Agent</strong><p>清除一个筛选条件，或切换到全部 Agent。</p></div>
          {:else}
            {#each groupedPackages as group}
              <section class="agent-group">
                <header><div><strong>{VIEW_META[group.stage.id].chinese}</strong><span>{group.items.length} Agents</span></div><small>{VIEW_META[group.stage.id].english}</small></header>
                <div class="agent-grid">
                  {#each group.items as item (item.id)}
                    <button class="agent-card" type="button" onclick={() => selectPackage(item)}>
                      <StatusPill status={item.status} />
                      <strong>{item.name}</strong>
                      <p>{item.shortDescription}</p>
                      <div class="card-tags">{#each item.channels.slice(0, 2) as channel}<span>{channel}</span>{/each}</div>
                      <footer><span>{item.outputs[0] ?? '营销交付物'}</span><ChevronRight size={15} /></footer>
                    </button>
                  {/each}
                </div>
              </section>
            {/each}
          {/if}
        </div>
      </section>
    </div>
  </section>
</div>

{#if detailOpen}
  <div class="detail-backdrop" role="presentation" onclick={(event) => event.currentTarget === event.target && (detailOpen = false)}>
    <div class="agent-detail-panel" role="dialog" aria-modal="true" aria-labelledby="agent-detail-title">
      <header>
        <span>{VIEW_META[selected.workspace].number} · {VIEW_META[selected.workspace].english} · v{selected.version}</span>
        <button type="button" aria-label="关闭 Agent 详情" onclick={() => (detailOpen = false)}><X size={18} /></button>
      </header>

      <div class="detail-title">
        <StatusPill status={selected.status} />
        <h2 id="agent-detail-title">{selected.name}</h2>
        <p>{selected.shortDescription}</p>
        <div>{#each selected.channels as channel}<span>{channel}</span>{/each}{#each selected.industries as industry}<span>{industry}</span>{/each}</div>
      </div>

      {#if installationMessage}<div class="inline-message"><Info size={15} />{installationMessage}</div>{/if}

      <section class="detail-task"><Sparkles size={17} /><div><span>它解决什么</span><strong>{selected.task}</strong></div></section>

      <section class="detail-io">
        <div><Database size={15} /><span>开始前要提供</span><ul>{#each selected.requiredInputs as input}<li>{input}</li>{/each}</ul></div>
        <div><FileOutput size={15} /><span>你会拿到</span><ul>{#each selected.outputs as output}<li>{output}</li>{/each}</ul></div>
      </section>

      <section class="human-gate"><ShieldCheck size={18} /><div><span>人工确认点</span><strong>{selected.humanGate}</strong></div></section>

      <details open>
        <summary>安装内容与权限 <span>{selected.bundledSkills.length} 个内置 Skill</span></summary>
        <div class="detail-block">
          {#if selected.bundledSkills.length === 0}<p class="muted">当前候选还没有完成依赖 Skill 的整理。</p>{/if}
          {#each selected.bundledSkills as skill}<div class="dependency"><span>{skill.required ? '必需' : '可选'}</span><div><b>{skill.name}</b><small>{skill.description}</small></div></div>{/each}
          {#each selected.permissions as permission}<div class="permission"><LockKeyhole size={14} /><div><b>{permission.label}<em>{permission.required ? '必需' : '可选'}</em></b><small>{permission.detail}</small></div></div>{/each}
        </div>
      </details>

      <details>
        <summary>不能替你判断 <span>{selected.cannotInfer.length} 项</span></summary>
        <div class="detail-block limit-list">{#each selected.cannotInfer as limit}<div><CircleAlert size={14} />{limit}</div>{/each}</div>
      </details>

      <details>
        <summary>验证记录 <span>{selected.validation.length} 条</span></summary>
        <div class="detail-block">
          {#if selected.validation.length === 0}<div class="validation-empty"><FlaskConical size={18} /><p><b>还没有真实验证记录</b><span>{selected.maturityNote}</span></p></div>{/if}
          {#each selected.validation as record}<div class="validation-record"><b>{record.role} · {record.industry}</b><p>{record.task}</p><small>{record.date} · {record.target} · {record.conclusion}</small></div>{/each}
        </div>
      </details>

      <details>
        <summary>来源与许可证 <span>{selected.sources.length} 个来源</span></summary>
        <div class="detail-block source-list">{#each selected.sources as source}<a href={source.url} target="_blank" rel="noreferrer"><span><b>{source.label}</b><small>{source.license} · {source.mode === 'adapted' ? '本土化改编' : source.mode === 'original' ? '原创' : '仅参考'}</small></span><ExternalLink size={14} /></a>{/each}</div>
      </details>

      <div class="codex-card"><Laptop size={19} /><div><b>Codex 优先</b><span>{codexStatus?.message ?? '网页预览不会读取你的电脑。'}</span><code>{codexStatus?.skillsDirectory ?? '~/.codex/skills'}</code></div></div>

      <footer>
        <small>{canInstall(selected) ? '安装前可取消不需要的可选 Skill。' : '必须由真实中国营销从业者完成脱敏任务验证后才能安装。'}</small>
        <div>
          {#if codexStatus?.desktopFound}<button class="secondary-button" type="button" onclick={openCodex}>打开 Codex<ArrowUpRight size={14} /></button>{/if}
          {#if canInstall(selected)}<button class="primary-button" type="button" onclick={openInstall}><ArrowDownToLine size={16} />安装到 Codex</button>
          {:else}<button class="primary-button" type="button" disabled><LockKeyhole size={16} />暂不可安装</button>{/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

{#if installOpen}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.currentTarget === event.target && (installOpen = false)}>
    <div class="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <button class="modal-close" aria-label="关闭" onclick={() => (installOpen = false)}><X size={18} /></button>
      <span class="eyebrow">INSTALL TO CODEX · 全局</span>
      <h2 id="install-title">{selected.name}</h2>
      <p>安装后会在 Codex 的技能列表中显示一个 Agent。它依赖的 Skill 会放在 Agent 内部，不占用顶层列表。</p>
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
