<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowUpRight, Check, Copy, FileOutput } from '@lucide/svelte';
  import { SOURCE_LABELS, WORKSPACES, skillHref, type Skill } from '$lib/skills';

  let { skill }: { skill: Skill } = $props();
  let copied = $state(false);
  const workspace = $derived(WORKSPACES.find((item) => item.id === skill.workspace)!);

  async function copyInstall() {
    await navigator.clipboard.writeText(skill.installation.codex);
    copied = true;
    window.setTimeout(() => (copied = false), 1800);
  }
</script>

<article class={`skill-card workspace-${skill.workspace}`}>
  <div class="card-signal" aria-hidden="true"></div>
  <div class="card-topline">
    <span class="workspace-tag"><b>{workspace.number}</b> {workspace.name}</span>
    <span class={`source-badge source-${skill.source.type}`}>{SOURCE_LABELS[skill.source.type]}</span>
  </div>

  <div class="card-title">
    <h3>{skill.titleZh}</h3>
    <code>{skill.originalName}</code>
  </div>
  <p class="skill-summary">{skill.summaryZh}</p>

  <div class="card-facts">
    <div>
      <span>适合</span>
      <p>{skill.audiences.slice(0, 2).join(' · ')}</p>
    </div>
    <div>
      <span><FileOutput size={14} /> 主要交付</span>
      <p>{skill.outputs.slice(0, 2).map((item) => item.split(' ')[0]).join(' · ')}</p>
    </div>
  </div>

  <div class="source-row">
    {#if skill.source.avatarUrl}
      <img src={skill.source.avatarUrl} alt="" width="28" height="28" loading="lazy" />
    {:else}
      <span class="avatar-fallback">{skill.source.author.slice(0, 1)}</span>
    {/if}
    <span><strong>{skill.source.author}</strong><small>{skill.source.license} · 核验 {skill.source.checkedAt}</small></span>
  </div>

  <div class="validation-line">
    <span class:passed={skill.validation.installation.status === 'passed'}>
      {#if skill.validation.installation.status === 'passed'}<Check size={13} />{:else}<i></i>{/if}
      安装{skill.validation.installation.status === 'passed' ? '已验证' : '待验证'}
    </span>
    <span class:passed={skill.validation.practice.status === 'passed'}>
      {#if skill.validation.practice.status === 'passed'}<Check size={13} />{:else}<i></i>{/if}
      实战{skill.validation.practice.status === 'passed' ? '已验证' : '待验证'}
    </span>
  </div>

  <div class="card-actions">
    <a class="button button-primary" href={skillHref(skill.id, base)}>查看怎么用 <ArrowUpRight size={16} /></a>
    {#if skill.installable}
      <button class="button button-icon" type="button" onclick={copyInstall} aria-label={`复制 ${skill.titleZh} 的 Codex 安装命令`} title="复制 Codex 安装命令">
        {#if copied}<Check size={17} />{:else}<Copy size={17} />{/if}
      </button>
    {/if}
  </div>
</article>
