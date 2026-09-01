<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowUpRight } from '@lucide/svelte';
</script>

<header class="site-header">
  <a class="brand-lockup" href={`${base}/`} aria-label="Open Marketing Skills 首页">
    <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
    <span><strong>OPEN MARKETING</strong><small>SKILLS, IN PRACTICE</small></span>
  </a>
  <nav aria-label="主导航">
    <a class="header-search" href={`${base}/#catalog`}>Skill 目录</a>
    <a class="header-workflows" href={`${base}/#workflows`}>玩法示范</a>
    <a class="header-compare" href={`${base}/compare/ppt/`}>同赛道差异</a>
    <a href="https://my.feishu.cn/share/base/form/shrcnv4VQeLloz4grjMYELZrM1f" target="_blank" rel="noreferrer">推荐 Skill <ArrowUpRight size={15} strokeWidth={2.4} /></a>
    <a class="github-link" href="https://github.com/open-marketing-cn/open-marketing-agents" target="_blank" rel="noreferrer">
      GitHub <ArrowUpRight size={15} strokeWidth={2.4} />
    </a>
  </nav>
</header>
