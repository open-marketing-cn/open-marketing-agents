<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowUpRight } from '@lucide/svelte';
</script>

<header class="site-header">
  <a class="brand-lockup" href={`${base}/`} aria-label="Open Marketing Skills 首页">
    <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
    <span><strong>OPEN MARKETING</strong><small>BRAND 0→1 SKILLS</small></span>
  </a>
  <nav aria-label="主导航">
    <a href={`${base}/#path`}>0→1 路线</a>
    <a href={`${base}/#catalog`}>Skill 目录</a>
    <a class="github-link" href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">
      GitHub <ArrowUpRight size={15} strokeWidth={2.4} />
    </a>
  </nav>
</header>
