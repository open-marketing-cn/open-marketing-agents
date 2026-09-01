import { describe, expect, it } from 'vitest';
import { COMPARISON_GROUPS } from './comparisons';
import { publicSkills, registry, WORKSPACES } from './skills';

describe('generated public Skill registry', () => {
  it('only exposes public upstream Skills', () => {
    expect(registry.stats.total).toBe(registry.skills.length);
    expect(publicSkills).toHaveLength(registry.stats.total);
    expect(registry.skills.every((skill) => skill.visibility === 'public')).toBe(true);
    expect(registry.skills.every((skill) => skill.source.type === 'upstream')).toBe(true);
  });

  it('keeps category counts and the current featured set', () => {
    expect(registry.stats.byWorkspace).toEqual(Object.fromEntries(WORKSPACES.map((workspace) => [workspace.id, publicSkills.filter((skill) => skill.workspace === workspace.id).length])));
    expect(publicSkills.filter((skill) => skill.featured).length).toBeGreaterThan(0);
    for (const skill of publicSkills) {
      expect(skill.card.outcomeZh).toBeTruthy();
      expect(skill.card.previewImage).toBeNull();
      expect(skill.card.previewLicense).toBeNull();
      if (skill.source.githubStars !== undefined) {
        expect(skill.source.githubStars).toBeGreaterThan(0);
        expect(skill.source.githubStarsCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(publicSkills.filter((skill) => skill.discoveredFrom.includes('colaskill')).length).toBeGreaterThanOrEqual(0);
    expect(publicSkills.find((skill) => skill.id === 'yao-geo-page-audit')?.source.githubStars).toBeGreaterThan(0);
  });

  it('uses unique ids, valid categories and public related recommendations', () => {
    expect(new Set(registry.skills.map((skill) => skill.id)).size).toBe(registry.skills.length);
    for (const workspace of WORKSPACES) {
      expect(registry.skills.filter((skill) => skill.workspace === workspace.id).length).toBeGreaterThan(0);
    }
    for (const skill of registry.skills) {
      expect(skill.growthStage).toBe('zero_to_one');
      expect(skill.promptExamples).toHaveLength(3);
      expect(skill.relatedSkillIds).not.toContain(skill.id);
      for (const relatedId of skill.relatedSkillIds) expect(registry.skills.some((related) => related.id === relatedId)).toBe(true);
    }
    const sourceKeys = registry.skills.map((skill) => {
      const repo = skill.source.repo.replace(/\/+$/, '').replace(/\.git$/i, '').toLocaleLowerCase('en-US');
      const path = skill.source.path.replace(/^\/+|\/+$/g, '').replace(/\/?SKILL\.md$/i, '').toLocaleLowerCase('en-US');
      return `${repo}|${path}`;
    });
    expect(new Set(sourceKeys).size).toBe(sourceKeys.length);
  });

  it('keeps installation and practice validation separate', () => {
    expect(registry.stats.installable).toBe(registry.skills.filter((skill) => skill.installable).length);
    expect(registry.stats.practiceValidated).toBe(registry.skills.filter((skill) => skill.validation.practice.status === 'passed').length);
    for (const skill of registry.skills) {
      if (skill.validation.practice.status === 'passed') expect(skill.practiceEvidence).toBeTruthy();
    }
  });

  it('normalizes task, method, practice level and comparison evidence', () => {
    for (const skill of registry.skills) {
      expect(skill.categoryId).toBeTruthy();
      expect(skill.methodType).toBeTruthy();
      expect(['discovered', 'source_verified', 'practiced', 'replicated', 'best_practice']).toContain(skill.practiceLevel);
      expect(Array.isArray(skill.comparisonEvidence)).toBe(true);
    }
  });

  it('makes the PPT choice and its boundary explicit', () => {
    const guizang = publicSkills.find((skill) => skill.id === 'guizang-ppt-skill');
    const pptKit = publicSkills.find((skill) => skill.id === 'ppt-kit');
    expect(guizang?.methodType).toBe('受控设计型');
    expect(pptKit?.methodType).toBe('参考驱动型');
    expect(guizang?.comparisonGroupId).toBe('ppt');
    expect(pptKit?.comparisonGroupId).toBe('ppt');
    expect(COMPARISON_GROUPS.find((group) => group.id === 'ppt')?.skillIds).toEqual(['guizang-ppt-skill', 'ppt-kit']);
    expect(guizang?.comparisonProfile?.outputConsistency).toBe('high');
    expect(pptKit?.comparisonProfile?.flexibility).toBe('high');
    expect(guizang?.comparisonProfile?.notForZh.join(' ')).toContain('PPTX');
    expect(pptKit?.comparisonProfile?.notForZh.join(' ')).toContain('多人');
    expect(guizang?.comparisonEvidence.every((item) => item.checkedAt === '2026-09-01')).toBe(true);
    expect(pptKit?.comparisonEvidence.every((item) => item.checkedAt === '2026-09-01')).toBe(true);
  });
});
