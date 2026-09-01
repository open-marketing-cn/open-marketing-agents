<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowLeft, ArrowRight, ArrowUpRight, Layers3 } from '@lucide/svelte';
  import SiteHeader from '$lib/SiteHeader.svelte';
  import type { ComparisonGroup } from '$lib/comparisons';
  import { COMPARISON_EVIDENCE_LABELS, COMPARISON_SCALE_LABELS, skillHref, type ComparisonProfile, type Skill } from '$lib/skills';

  let { data }: { data: { group: ComparisonGroup; skills: Skill[] } } = $props();
  const group = $derived(data.group);
  const skills = $derived(data.skills);
  const columnClass = $derived(`cols-${Math.min(skills.length, 4)}`);
  const profileRows: Array<{ key: keyof Omit<ComparisonProfile, 'bestForZh' | 'notForZh'>; labelZh: string }> = [
    { key: 'learningCurve', labelZh: '上手门槛' },
    { key: 'outputConsistency', labelZh: '结果稳定性' },
    { key: 'flexibility', labelZh: '自由度' },
    { key: 'operatorDependency', labelZh: '操作者依赖' },
    { key: 'materialDependency', labelZh: '素材依赖' },
    { key: 'workflowCompleteness', labelZh: '工作流完整度' }
  ];

  function findSkill(id: string) {
    return skills.find((skill) => skill.id === id)!;
  }
</script>

<svelte:head>
  <title>{group.taskZh} Skill 对比｜Open Marketing Skills</title>
  <meta name="description" content={group.introZh} />
</svelte:head>

<div class="page-shell compare-page">
  <SiteHeader />
  <main>
    <div class="compare-breadcrumb"><a href={`${base}/`}><ArrowLeft size={15} /> 返回全部 Skill</a><span>/</span><span>{group.taskZh}</span></div>

    <section class="compare-hero" aria-labelledby="compare-title">
      <p class="eyebrow"><span aria-hidden="true"></span> COMPARE BY TASK</p>
      <h1 id="compare-title">{group.titleZh}</h1>
      <p>{group.introZh}</p>
    </section>

    <section class="decision-section" aria-labelledby="difference-title">
      <div class="compare-section-heading">
        <p class="section-label">DIFFERENT DEPTH, SAME CATEGORY</p>
        <h2 id="difference-title">先看：它们各自把什么做深了？</h2>
      </div>
      <div class="decision-grid">
        {#each group.portraits as portrait, index}
          {@const skill = findSkill(portrait.skillId)}
          <a class:decision-flexible={index === 1} class="decision-card" href={skillHref(skill.id, base)}>
            <span>{portrait.methodZh}</span>
            <h3>{portrait.titleZh}</h3>
            <code>{skill.originalName}</code>
            <p>{portrait.summaryZh}</p>
            <b>查看完整说明 <ArrowRight size={15} /></b>
          </a>
        {/each}
        <article class="decision-card decision-neither">
          <span><Layers3 size={14} /> 共同边界</span>
          <h3>{group.sharedBoundary.titleZh}</h3>
          <p>{group.sharedBoundary.summaryZh}</p>
        </article>
      </div>
    </section>

    <section class="profile-compare-section" aria-labelledby="profile-title">
      <div class="compare-section-heading split-heading">
        <div><p class="section-label">SIX-DIMENSION PROFILE</p><h2 id="profile-title">六维画像，看的不是总分</h2></div>
        <p>每个“高”都可能带来代价。例如自由度高，通常也意味着操作者依赖更高。</p>
      </div>
      <div class="compare-scroll" role="region" aria-label="Skill 六维画像横向对比，可横向滚动">
        <div class={`profile-compare-grid ${columnClass}`}>
          <div class="compare-corner"><span>维度</span><small>高 ≠ 一定更好</small></div>
          {#each skills as skill}<div class="compare-skill-head"><code>{skill.originalName}</code><span>{skill.methodType}</span></div>{/each}
          {#each profileRows as row}
            <div class="compare-row-label"><strong>{row.labelZh}</strong></div>
            {#each skills as skill}
              {@const value = skill.comparisonProfile?.[row.key] ?? 'medium'}
              <div class={`profile-value level-${value}`}>
                <b>{COMPARISON_SCALE_LABELS[value]}</b>
                <span class="scale" aria-hidden="true"><i></i><i></i><i></i></span>
              </div>
            {/each}
          {/each}
        </div>
      </div>
    </section>

    <section class="matrix-section" aria-labelledby="matrix-title">
      <div class="compare-section-heading split-heading">
        <div><p class="section-label">WORKFLOW DIFFERENCES</p><h2 id="matrix-title">左右对比：从输入一路看到交付</h2></div>
        <p>只比较同一个具体任务。超过 4 个候选时先按使用前提筛选，再进入这张表。</p>
      </div>
      <div class="compare-scroll" role="region" aria-label="Skill 工作方式横向对比，可横向滚动">
        <div class={`comparison-matrix ${columnClass}`}>
          <div class="compare-corner"><span>比较项</span><small>先看问题，再看差异</small></div>
          {#each skills as skill}<div class="compare-skill-head"><code>{skill.originalName}</code><span>{skill.methodType}</span></div>{/each}
          {#each group.rows as row}
            <div class="matrix-label"><strong>{row.labelZh}</strong><span>{row.questionZh}</span></div>
            {#each skills as skill}<div class="matrix-value">{row.values[skill.id]}</div>{/each}
          {/each}
        </div>
      </div>
    </section>

    <section class="evidence-section" aria-labelledby="evidence-title">
      <div class="compare-section-heading split-heading">
        <div><p class="section-label">EVIDENCE, NOT OPINION</p><h2 id="evidence-title">每条判断都标明证据</h2></div>
        <p>目前两项都完成来源核验，但统一 Brief 的公开成果仍待补；因此还不计入“实践验证”。</p>
      </div>
      <div class="evidence-columns">
        {#each skills as skill}
          <article>
            <header><code>{skill.originalName}</code><span>{skill.validation.practice.status === 'passed' ? '实践已验证' : '实践待补'}</span></header>
            {#each skill.comparisonEvidence as evidence}
              <div class="evidence-line">
                <span>{COMPARISON_EVIDENCE_LABELS[evidence.type]} · {evidence.checkedAt}</span>
                <p>{evidence.summaryZh}</p>
                {#if evidence.sourceUrl}<a href={evidence.sourceUrl} target="_blank" rel="noreferrer">查看来源 <ArrowUpRight size={13} /></a>{/if}
              </div>
            {/each}
          </article>
        {/each}
      </div>
    </section>
  </main>

  <footer>
    <div class="brand-lockup light"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>OPEN MARKETING</strong><small>SKILLS DIRECTORY</small></span></div>
        <p>按任务说明差异 · 不做脱离场景的总分榜</p>
    <a href={`${base}/#catalog`}>返回 Skill 目录 <ArrowRight size={16} /></a>
  </footer>
</div>
