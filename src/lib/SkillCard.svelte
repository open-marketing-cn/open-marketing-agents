<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowUpRight } from '@lucide/svelte';
  import { formatGithubStars, PRACTICE_LEVEL_LABELS, SOURCE_LABELS, WORKSPACES, skillHref, type Skill } from '$lib/skills';

  let { skill }: { skill: Skill } = $props();
  const workspace = $derived(WORKSPACES.find((item) => item.id === skill.workspace)!);
  const authorInitial = $derived(skill.source.author.trim().slice(0, 1).toUpperCase());
</script>

<article class={`skill-card workspace-${skill.workspace}`}>
  <a class="skill-card-link" href={skillHref(skill.id, base)}>
    <div class="card-topline">
      <span class="workspace-tag">{workspace.name}</span>
      <span class="source-badge">{SOURCE_LABELS[skill.source.type]}</span>
      <span class:practice-verified={skill.practiceLevel === 'practiced' || skill.practiceLevel === 'replicated' || skill.practiceLevel === 'best_practice'} class="practice-badge">{PRACTICE_LEVEL_LABELS[skill.practiceLevel]}</span>
    </div>

    <div class="card-title">
      <h3>{skill.titleZh}</h3>
      <code>{skill.originalName}</code>
    </div>

    <p class="method-type">{skill.methodType}</p>

    <p class="skill-summary">{skill.card.outcomeZh}</p>

    <div class="card-source">
      <span class="avatar-fallback" aria-hidden="true">{authorInitial}</span>
      <span class="card-source-copy">
        <strong>{skill.source.author}</strong>
        <small>
          {#if skill.source.githubStars !== undefined}GitHub ★ {formatGithubStars(skill.source.githubStars)} · {/if}
          来源已核验 · {skill.source.checkedAt}
        </small>
      </span>
      <ArrowUpRight class="card-arrow" size={17} aria-hidden="true" />
    </div>
  </a>
</article>
