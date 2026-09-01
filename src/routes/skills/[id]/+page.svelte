<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowDown, ArrowLeft, ArrowUpRight, Check, CircleAlert, Copy, ShieldCheck } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import { COMPARISON_EVIDENCE_LABELS, COMPARISON_SCALE_LABELS, formatGithubStars, PRACTICE_LEVEL_LABELS, SOURCE_LABELS, WORKSPACES, type Skill } from '$lib/skills';

  let { data }: { data: { skill: Skill; related: Skill[] } } = $props();
  let target = $state<'codex' | 'claudeCode'>('codex');
  let copied = $state('');
  const skill = $derived(data.skill);
  const practiceEvidence = $derived(skill.practiceEvidence);
  const workspace = $derived(WORKSPACES.find((item) => item.id === skill.workspace)!);
  const command = $derived(skill.installation[target]);
  const authorInitial = $derived(skill.source.author.trim().slice(0, 1).toUpperCase());
  const sourceFilePath = $derived(skill.source.path.endsWith('/SKILL.md') || skill.source.path === 'SKILL.md' ? skill.source.path : `${skill.source.path.replace(/\/$/, '')}/SKILL.md`);
  const sourcePathUrl = $derived(`${skill.source.repo}/blob/${skill.source.commit}/${sourceFilePath}`);
  const validationRecords = $derived([
    { label: '规范检查', record: skill.validation.spec },
    { label: '独立安装', record: skill.validation.installation },
    { label: '真实任务', record: skill.validation.practice }
  ]);
  const comparisonDimensions = $derived(skill.comparisonProfile ? [
    { label: '上手门槛', value: skill.comparisonProfile.learningCurve },
    { label: '结果稳定性', value: skill.comparisonProfile.outputConsistency },
    { label: '自由度', value: skill.comparisonProfile.flexibility },
    { label: '操作者依赖', value: skill.comparisonProfile.operatorDependency },
    { label: '素材依赖', value: skill.comparisonProfile.materialDependency },
    { label: '工作流完整度', value: skill.comparisonProfile.workflowCompleteness }
  ] : []);
  const sourceBlockNumber = $derived(String(4 + (skill.comparisonProfile ? 1 : 0) + (practiceEvidence ? 1 : 0)).padStart(2, '0'));

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
        {#if skill.installable}
          <div class="target-tabs" role="tablist" aria-label="选择安装目标">
            <button class:active={target === 'codex'} type="button" role="tab" aria-selected={target === 'codex'} onclick={() => (target = 'codex')}>Codex</button>
            <button class:active={target === 'claudeCode'} type="button" role="tab" aria-selected={target === 'claudeCode'} onclick={() => (target = 'claudeCode')}>Claude Code</button>
          </div>
          <div class="command-box"><code>{command}</code><button type="button" onclick={() => copyText(command, 'install')} aria-label="复制安装命令">{#if copied === 'install'}<Check size={17} />{:else}<Copy size={17} />{/if}</button></div>
          <p class="install-note"><ShieldCheck size={15} /> 上游 Skill 保留原作者目录，单独安装，不会安装整个合集。</p>
        {:else}
          <div class="install-pending-box"><CircleAlert size={18} /><p><strong>暂不提供一键复制</strong><span>来源和许可证已核验，但安装方式尚未在隔离的 Codex 与 Claude Code 环境完成双端复测。</span></p></div>
        {/if}
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

      {#if skill.comparisonProfile}
        <section class="detail-block comparison-block" id="comparison">
          <div class="block-number">04</div>
          <div class="block-body">
            <p class="section-label">HOW TO CHOOSE</p>
            <h2>{skill.methodType} · 六维使用画像</h2>
            <p class="block-lead">这不是总分。它帮助你判断当前任务的门槛、依赖和边界；每条结论都保留证据类型与核验日期。</p>
            <div class="comparison-profile">
              {#each comparisonDimensions as item}
                <div class={`comparison-dimension level-${item.value}`}><span>{item.label}</span><div class="scale"><i></i><i></i><i></i></div><b>{COMPARISON_SCALE_LABELS[item.value]}</b></div>
              {/each}
            </div>
            <div class="comparison-fit">
              <div><h3>更适合</h3><ul>{#each skill.comparisonProfile.bestForZh as item}<li>{item}</li>{/each}</ul></div>
              <div><h3>不优先</h3><ul>{#each skill.comparisonProfile.notForZh as item}<li>{item}</li>{/each}</ul></div>
            </div>
            <div class="comparison-evidence">
              <h3>这些判断从哪里来</h3>
              {#each skill.comparisonEvidence as evidence}
                <article><span>{COMPARISON_EVIDENCE_LABELS[evidence.type]} · {evidence.checkedAt}</span><p>{evidence.summaryZh}</p>{#if evidence.sourceUrl}<a href={evidence.sourceUrl} target="_blank" rel="noreferrer">查看依据 <ArrowUpRight size={13} /></a>{/if}</article>
              {/each}
            </div>
          </div>
        </section>
      {/if}

      {#if practiceEvidence}
        <section class="detail-block practice-block" id="practice">
          <div class="block-number">{skill.comparisonProfile ? '05' : '04'}</div>
          <div class="block-body">
            <p class="section-label">FIELD NOTES</p>
            <h2>{practiceEvidence.caseTitleZh}</h2>
            <p class="block-lead">{practiceEvidence.contextZh}</p>
            <div class="practice-meta">
              <div><span>实践者</span><p>{practiceEvidence.practitionerRole} · {practiceEvidence.attributionZh}</p></div>
              <div><span>证据</span><p><a href={practiceEvidence.evidenceUrl} target="_blank" rel="noreferrer">查看脱敏案例证据 <ArrowUpRight size={14} /></a></p></div>
            </div>
            <div class="practice-grid">
              <div><h3>使用场景</h3><ul>{#each practiceEvidence.scenariosZh as item}<li>{item}</li>{/each}</ul></div>
              <div><h3>先知道边界</h3><p>{practiceEvidence.boundaryZh}</p><ul>{#each practiceEvidence.notForZh as item}<li>{item}</li>{/each}</ul></div>
              <div><h3>怎么从入门玩到进阶</h3><p>{practiceEvidence.depthPathZh}</p><p class="practice-muted"><b>准备：</b>{practiceEvidence.setupZh}</p><p class="practice-muted"><b>预期：</b>{practiceEvidence.expectedOutputZh}</p></div>
            </div>
            <div class="practice-notes">
              <div><h3>踩过的坑</h3><ul>{#each practiceEvidence.pitfallsZh as item}<li>{item}</li>{/each}</ul></div>
              <div><h3>最佳实践</h3><ul>{#each practiceEvidence.bestPracticesZh as item}<li>{item}</li>{/each}</ul></div>
              <div><h3>二创记录</h3><p>{practiceEvidence.remixZh}</p></div>
            </div>
          </div>
        </section>
      {/if}

      <details class="source-details" id="source">
        <summary><span class="block-number">{sourceBlockNumber}</span><span><small class="section-label">SOURCE &amp; VALIDATION</small><strong>来源与验证</strong></span><ArrowDown size={18} /></summary>
        <div class="source-details-body">
          <dl class="source-table">
            <div><dt>作者</dt><dd>{skill.source.author}</dd></div>
            <div><dt>GitHub</dt><dd><a href={skill.source.repo} target="_blank" rel="noreferrer">{skill.source.repo.replace('https://github.com/', '')} <ArrowUpRight size={14} /></a></dd></div>
            <div><dt>Skill 路径</dt><dd><a href={sourcePathUrl} target="_blank" rel="noreferrer"><code>{sourceFilePath}</code> <ArrowUpRight size={14} /></a></dd></div>
            <div><dt>核验 Commit</dt><dd><code>{skill.source.commit}</code></dd></div>
            <div><dt>许可证</dt><dd>{skill.source.license}</dd></div>
            <div><dt>实践等级</dt><dd>{PRACTICE_LEVEL_LABELS[skill.practiceLevel]} · {skill.methodType}</dd></div>
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
