<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Copy, Download, FileInput, FileOutput, ShieldCheck, UserCheck } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import SkillCard from '$lib/SkillCard.svelte';
  import { SOURCE_LABELS, WORKSPACES, type Skill } from '$lib/skills';

  let { data }: { data: { skill: Skill; related: Skill[] } } = $props();
  let target = $state<'codex' | 'claudeCode'>('codex');
  let copied = $state('');
  const skill = $derived(data.skill);
  const workspace = $derived(WORKSPACES.find((item) => item.id === skill.workspace)!);
  const command = $derived(skill.installation[target]);
  const sourcePathUrl = $derived(`${skill.source.repo}/tree/${skill.source.type === 'upstream' ? skill.source.commit : 'main'}/${skill.source.path}`);
  const upstreamPathUrl = $derived(skill.source.upstreamRepo && skill.source.upstreamCommit && skill.source.upstreamPath
    ? `${skill.source.upstreamRepo}/tree/${skill.source.upstreamCommit}/${skill.source.upstreamPath}`
    : '');
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
    <div class="breadcrumb"><a href={`${base}/`}><ArrowLeft size={15} /> 返回目录</a><span>/</span><span>{workspace.name}</span><span>/</span><code>{skill.originalName}</code></div>

    <section class={`detail-hero workspace-${skill.workspace}`}>
      <div class="detail-hero-main">
        <div class="detail-badges"><span class="workspace-tag"><b>{workspace.number}</b> {workspace.name}</span><span class={`source-badge source-${skill.source.type}`}>{SOURCE_LABELS[skill.source.type]}</span></div>
        <h1>{skill.titleZh}</h1>
        <code class="detail-original">{skill.originalName}</code>
        <p>{skill.summaryZh}</p>
        <div class="audience-row"><span>适合谁</span>{#each skill.audiences as item}<b>{item}</b>{/each}</div>
      </div>
      <div class="detail-source-stamp">
        {#if skill.source.avatarUrl}<img src={skill.source.avatarUrl} alt="" width="48" height="48" />{/if}
        <span><small>AUTHOR / SOURCE</small><strong>{skill.source.author}</strong><a href={skill.source.repo} target="_blank" rel="noreferrer">查看 GitHub <ArrowUpRight size={14} /></a></span>
        <dl><div><dt>许可证</dt><dd>{skill.source.license}</dd></div><div><dt>最近核验</dt><dd>{skill.source.checkedAt}</dd></div></dl>
      </div>
    </section>

    <div class="detail-layout">
      <article class="detail-content">
        <section class="content-section" id="what">
          <div class="section-index">01</div><div><span class="detail-kicker">这个 Skill 帮你完成什么</span><h2>{skill.useCases[0]}</h2><ul class="check-list">{#each skill.useCases as item}<li><Check size={17} />{item}</li>{/each}</ul></div>
        </section>

        <section class="content-section" id="inputs">
          <div class="section-index">02</div><div><span class="detail-kicker"><FileInput size={15} /> 使用前需要提供什么</span><h2>先给材料，再让 AI 判断。</h2><ol class="number-list">{#each skill.inputs as item, index}<li><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>{/each}</ol></div>
        </section>

        <section class="content-section prompt-section" id="prompts">
          <div class="section-index">03</div><div><span class="detail-kicker">试试这样说</span><h2>三句话，直接复制开始。</h2><div class="prompt-list">{#each skill.promptExamples as prompt, index}<button type="button" onclick={() => copyText(prompt, `prompt-${index}`)}><span>{prompt}</span>{#if copied === `prompt-${index}`}<Check size={16} />{:else}<Copy size={16} />{/if}</button>{/each}</div></div>
        </section>

        <section class="content-section output-section" id="outputs">
          <div class="section-index">04</div><div><span class="detail-kicker"><FileOutput size={15} /> 你会拿到什么</span><h2>不是一段聊天，是可交接的结果。</h2><div class="output-grid">{#each skill.outputs as item, index}<div><b>{String(index + 1).padStart(2, '0')}</b><p>{item}</p></div>{/each}</div></div>
        </section>

        <section class="content-section boundary-section" id="boundary">
          <div class="section-index">05</div><div><span class="detail-kicker"><UserCheck size={15} /> AI 与人的分工</span><h2>AI 整理和生成，人做关键选择。</h2><div class="boundary-grid"><div class="ai-side"><span>AI 做什么</span><p>读取你提供的材料，按该 Skill 的规则整理、比较、生成草稿，并明确证据与缺口。</p></div><div class="human-side"><span>人必须决定</span><p>{skill.humanGate}</p></div></div><div class="cannot-box"><CircleAlert size={20} /><div><strong>它不能替你判断</strong><ul>{#each skill.cannotInfer as item}<li>{item}</li>{/each}</ul></div></div></div>
        </section>

        <section class="content-section source-section" id="source">
          <div class="section-index">06</div><div><span class="detail-kicker">来源与改动</span><h2>你知道它从哪里来。</h2><dl class="source-table"><div><dt>公开类型</dt><dd>{SOURCE_LABELS[skill.source.type]}</dd></div><div><dt>作者</dt><dd>{skill.source.author}</dd></div><div><dt>GitHub</dt><dd><a href={skill.source.repo} target="_blank" rel="noreferrer">{skill.source.repo.replace('https://github.com/', '')} <ArrowUpRight size={14} /></a></dd></div><div><dt>安装包路径</dt><dd><a href={sourcePathUrl} target="_blank" rel="noreferrer"><code>{skill.source.path}</code> <ArrowUpRight size={14} /></a></dd></div><div><dt>核验 Commit</dt><dd><code>{skill.source.commit.slice(0, 12)}</code></dd></div><div><dt>许可证</dt><dd>{skill.source.license}</dd></div>{#if skill.source.upstreamName}<div><dt>上游原版</dt><dd><a href={upstreamPathUrl} target="_blank" rel="noreferrer"><code>{skill.source.upstreamName}</code> · {skill.source.upstreamAuthor} <ArrowUpRight size={14} /></a></dd></div><div><dt>上游 Commit</dt><dd><code>{skill.source.upstreamCommit?.slice(0, 12)}</code></dd></div>{/if}{#if skill.source.changesZh}<div><dt>改动说明</dt><dd>{skill.source.changesZh}</dd></div>{/if}</dl></div>
        </section>

        <section class="content-section validation-section" id="validation">
          <div class="section-index">07</div><div><span class="detail-kicker"><ShieldCheck size={15} /> 验证记录</span><h2>技术通过，不等于实战通过。</h2><div class="validation-cards">{#each validationRecords as item}<article class:passed={item.record.status === 'passed'}><span>{item.record.status === 'passed' ? '✓ PASSED' : item.record.status === 'failed' ? '× FAILED' : '○ PENDING'}</span><h3>{item.label}</h3><p>{item.record.noteZh}</p><small>{item.record.checkedAt}</small></article>{/each}</div></div>
        </section>
      </article>

      <aside class="install-panel" id="install">
        <div class="install-head"><span>INSTALL THIS SKILL</span><strong>{skill.installable ? '安装已验证' : '安装复测中'}</strong></div>
        <div class="target-tabs"><button class:active={target === 'codex'} type="button" onclick={() => (target = 'codex')}>Codex</button><button class:active={target === 'claudeCode'} type="button" onclick={() => (target = 'claudeCode')}>Claude Code</button></div>
        <div class="command-box"><code>{command}</code><button type="button" disabled={!skill.installable} onclick={() => copyText(command, 'install')} aria-label="复制安装命令">{#if copied === 'install'}<Check size={17} />{:else}<Copy size={17} />{/if}</button></div>
        {#if skill.installable}<p class="install-note"><ShieldCheck size={15} /> 已完成独立目录与目标环境安装检查。</p>{:else}<p class="install-note pending"><CircleAlert size={15} /> 安装复测完成前不开放复制按钮。</p>{/if}
        {#if skill.installation.download}
          <a class:disabled={!skill.installable} class="button button-download" href={skill.installable ? `${base}/${skill.installation.download}` : undefined} download><Download size={17} /> 下载独立 ZIP</a>
        {:else}
          <a class="button button-download secondary" href={sourcePathUrl} target="_blank" rel="noreferrer">查看上游原目录 <ArrowUpRight size={16} /></a>
        {/if}
        <div class="install-facts"><div><span>一次只装</span><b>1 个 Skill</b></div><div><span>强制依赖</span><b>0 个</b></div><div><span>账户写入</span><b>不会</b></div></div>
      </aside>
    </div>

    <section class="related-section">
      <div class="section-heading"><div><div class="section-kicker"><span>08</span><p>下一步推荐</p></div><h2>只推荐，不自动安装。</h2></div><p>当前 Skill 在没有这些 related Skill 时仍能独立完成任务。</p></div>
      <div class="skill-grid related-grid">{#each data.related as item}<SkillCard skill={item} />{/each}</div>
    </section>
  </main>
</div>
