<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowDown, ArrowLeft, ArrowUpRight, Check, CircleAlert, Copy, ShieldCheck } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import { formatGithubStars, SOURCE_LABELS, WORKSPACES, type Skill } from '$lib/skills';

  let { data }: { data: { skill: Skill; related: Skill[] } } = $props();
  let target = $state<'codex' | 'claudeCode'>('codex');
  let copied = $state('');
  const skill = $derived(data.skill);
  const workspace = $derived(WORKSPACES.find((item) => item.id === skill.workspace)!);
  const command = $derived(skill.installation[target]);
  const authorInitial = $derived(skill.source.author.trim().slice(0, 1).toUpperCase());
  const sourcePathUrl = $derived(`${skill.source.repo}/tree/${skill.source.commit}/${skill.source.path}`);
  const validationRecords = $derived([
    { label: '规范检查', record: skill.validation.spec },
    { label: '独立安装', record: skill.validation.installation },
    { label: '真实任务', record: skill.validation.practice }
  ]);

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    copied = key;
    window.setTimeout(() => (copied = ''), 1800);
  }
</script>

<svelte:head>
  <title>{skill.titleZh}｜Open Marketing Skills</title>
  <meta name="description" content={skill.summaryZh} />
</svelte:head>

<div class="page-shell detail-page">
  <SiteHeader />
  <main>
    <div class="breadcrumb"><a href={`${base}/`}><ArrowLeft size={15} /> 返回全部 Skill</a><span>/</span><span>{workspace.name}</span></div>

    <section class={`detail-hero workspace-${skill.workspace}`} aria-labelledby="detail-title">
      <div class="detail-hero-main">
        <div class="detail-labels"><span class="workspace-tag">{workspace.name}</span><span class="source-badge">{SOURCE_LABELS[skill.source.type]}</span></div>
        <h1 id="detail-title">{skill.titleZh}</h1>
        <code class="detail-original">{skill.originalName}</code>
        <p>{skill.summaryZh}</p>
        <div class="detail-author"><span class="avatar-fallback" aria-hidden="true">{authorInitial}</span><span>{skill.source.author}</span><span>·</span><span>GitHub 来源已核验</span>{#if skill.source.githubStars !== undefined}<span>·</span><span>★ {formatGithubStars(skill.source.githubStars)} Stars</span>{/if}</div>
      </div>

      <aside class="install-panel" id="install" aria-label="安装这个 Skill">
        <div class="install-head"><span>INSTALL THIS SKILL</span><strong>{skill.installable ? '安装已验证' : '安装复测中'}</strong></div>
        <div class="target-tabs" role="tablist" aria-label="选择安装目标">
          <button class:active={target === 'codex'} type="button" role="tab" aria-selected={target === 'codex'} onclick={() => (target = 'codex')}>Codex</button>
          <button class:active={target === 'claudeCode'} type="button" role="tab" aria-selected={target === 'claudeCode'} onclick={() => (target = 'claudeCode')}>Claude Code</button>
        </div>
        <div class="command-box"><code>{command}</code><button type="button" onclick={() => copyText(command, 'install')} aria-label="复制安装命令">{#if copied === 'install'}<Check size={17} />{:else}<Copy size={17} />{/if}</button></div>
        <p class="install-note"><ShieldCheck size={15} /> 上游 Skill 保留原作者目录，单独安装，不会安装整个合集。</p>
        <a class="button button-primary install-button" href={sourcePathUrl} target="_blank" rel="noreferrer"><ArrowUpRight size={17} /> 查看 SKILL.md 来源</a>
      </aside>
    </section>

    <div class="detail-content">
      <section class="detail-block" id="result">
        <div class="block-number">01</div>
        <div class="block-body">
          <p class="section-label">THE RESULT</p>
          <h2>它帮你完成什么</h2>
          <p class="block-lead">{skill.card.outcomeZh}</p>
          <ul class="check-list">{#each skill.useCases as item}<li><Check size={17} />{item}</li>{/each}</ul>
          <div class="audience-list"><span>适合</span>{#each skill.audiences as item}<b>{item}</b>{/each}</div>
        </div>
      </section>

      <section class="detail-block" id="start">
        <div class="block-number">02</div>
        <div class="block-body">
          <p class="section-label">START HERE</p>
          <h2>先给材料，再开始</h2>
          <div class="input-prompt-grid">
            <div>
              <h3>你需要提供</h3>
              <ol class="number-list">{#each skill.inputs as item, index}<li><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>{/each}</ol>
            </div>
            <div>
              <h3>试试这样说 <small>点击复制</small></h3>
              <div class="prompt-list">{#each skill.promptExamples as prompt, index}<button type="button" onclick={() => copyText(prompt, `prompt-${index}`)}><span>{prompt}</span>{#if copied === `prompt-${index}`}<Check size={16} />{:else}<Copy size={16} />{/if}</button>{/each}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-block" id="delivery">
        <div class="block-number">03</div>
        <div class="block-body">
          <p class="section-label">THE HANDOFF</p>
          <h2>拿到可以继续工作的结果</h2>
          <div class="output-grid">{#each skill.outputs as item, index}<div><b>{String(index + 1).padStart(2, '0')}</b><p>{item}</p></div>{/each}</div>
          <div class="boundary-grid">
            <div><span>AI 做什么</span><p>读取你提供的材料，按 Skill 规则整理、比较、生成草稿，并明确证据与缺口。</p></div>
            <div class="human-side"><span>人必须决定</span><p>{skill.humanGate}</p></div>
          </div>
          <div class="cannot-box"><CircleAlert size={20} /><div><strong>不能替你判断</strong><ul>{#each skill.cannotInfer as item}<li>{item}</li>{/each}</ul></div></div>
        </div>
      </section>

      <details class="source-details" id="source">
        <summary><span class="block-number">04</span><span><small class="section-label">SOURCE &amp; VALIDATION</small><strong>来源与验证</strong></span><ArrowDown size={18} /></summary>
        <div class="source-details-body">
          <dl class="source-table">
            <div><dt>作者</dt><dd>{skill.source.author}</dd></div>
            <div><dt>GitHub</dt><dd><a href={skill.source.repo} target="_blank" rel="noreferrer">{skill.source.repo.replace('https://github.com/', '')} <ArrowUpRight size={14} /></a></dd></div>
            <div><dt>Skill 路径</dt><dd><a href={sourcePathUrl} target="_blank" rel="noreferrer"><code>{skill.source.path}</code> <ArrowUpRight size={14} /></a></dd></div>
            <div><dt>核验 Commit</dt><dd><code>{skill.source.commit}</code></dd></div>
            <div><dt>许可证</dt><dd>{skill.source.license}</dd></div>
            {#if skill.source.githubStars !== undefined}<div><dt>GitHub Star 快照</dt><dd>{formatGithubStars(skill.source.githubStars)} · {skill.source.githubStarsCheckedAt ?? skill.source.checkedAt}</dd></div>{/if}
            <div><dt>最近核验</dt><dd>{skill.source.checkedAt}</dd></div>
          </dl>
          <div class="validation-cards">{#each validationRecords as item}<article class:passed={item.record.status === 'passed'}><span>{item.record.status === 'passed' ? '✓ PASSED' : item.record.status === 'failed' ? '× FAILED' : '○ PENDING'}</span><h3>{item.label}</h3><p>{item.record.noteZh}</p><small>{item.record.checkedAt}</small></article>{/each}</div>
        </div>
      </details>
    </div>

    {#if data.related.length}
      <section class="related-section" aria-labelledby="related-title">
        <div class="related-heading"><div><p class="section-label">NEXT, IF NEEDED</p><h2 id="related-title">只推荐，不自动安装。</h2></div><p>当前 Skill 在没有这些 related Skill 时仍能独立完成任务。</p></div>
        <div class="skill-grid related-grid">{#each data.related.slice(0, 3) as item}<SkillCard skill={item} />{/each}</div>
      </section>
    {/if}
  </main>
</div>
