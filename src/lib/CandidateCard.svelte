<script lang="ts">
  import { ArrowUpRight, FlaskConical } from '@lucide/svelte';
  import type { CandidateSkill, CatalogBucket } from '$lib/skills';

  let { skill, bucket, claimHref }: { skill: CandidateSkill; bucket: CatalogBucket; claimHref: string } = $props();
</script>

<article class={`candidate-card bucket-${skill.bucket}`}>
  <div class="card-topline">
    <span class="workspace-tag">{bucket.name}</span>
    <span class="candidate-status"><FlaskConical size={12} /> 待核验</span>
  </div>
  <div class="card-title">
    <h3>{skill.titleZh}</h3>
    <code>{skill.originalName}</code>
  </div>
  <p class="skill-summary">{skill.summaryZh}</p>
  <div class="candidate-missing">
    <span>仍需补</span>
    <p>{skill.missingChecksZh.join(' · ')}</p>
  </div>
  <div class="candidate-actions">
    {#if skill.sourceUrl}<a href={skill.sourceUrl} target="_blank" rel="noreferrer">查看候选来源 <ArrowUpRight size={14} /></a>{/if}
    <a class="claim-link" href={claimHref} target="_blank" rel="noreferrer">认领实践 <ArrowUpRight size={14} /></a>
  </div>
</article>
