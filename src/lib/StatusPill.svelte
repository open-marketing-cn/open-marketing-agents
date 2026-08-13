<script lang="ts">
  import { CircleCheck, FlaskConical, Hammer } from '@lucide/svelte';
  import type { PackageStatus } from './types';

  let { status }: { status: PackageStatus } = $props();

  const labels: Record<PackageStatus, string> = {
    cocreating: '共创中',
    pending_validation: '待验证',
    installable: '可安装'
  };
</script>

<span class:ready={status === 'installable'} class:pending={status === 'pending_validation'} class="status-pill">
  {#if status === 'installable'}
    <CircleCheck size={12} strokeWidth={2.2} />
  {:else if status === 'pending_validation'}
    <FlaskConical size={12} strokeWidth={2.2} />
  {:else}
    <Hammer size={12} strokeWidth={2.2} />
  {/if}
  {labels[status]}
</span>

<style>
  .status-pill {
    align-items: center;
    background: var(--signal-soft);
    border: 1px solid transparent;
    color: var(--signal-ink);
    display: inline-flex;
    font-size: 11px;
    font-weight: 650;
    gap: 5px;
    letter-spacing: .02em;
    padding: 4px 7px;
    white-space: nowrap;
  }

  .status-pill.pending {
    background: var(--cobalt-soft);
    color: var(--cobalt);
  }

  .status-pill.ready {
    background: var(--moss-soft);
    color: var(--moss);
  }
</style>
