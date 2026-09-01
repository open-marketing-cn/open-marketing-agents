import { describe, expect, it } from 'vitest';
import { publicSkills, registry, WORKSPACES } from './skills';

describe('generated public Skill registry', () => {
  it('only exposes public upstream Skills', () => {
    expect(registry.stats.total).toBe(23);
    expect(registry.skills).toHaveLength(23);
    expect(publicSkills).toHaveLength(23);
    expect(registry.skills.every((skill) => skill.visibility === 'public')).toBe(true);
    expect(registry.skills.every((skill) => skill.source.type === 'upstream')).toBe(true);
  });

  it('keeps category counts and the current featured set', () => {
    expect(registry.stats.byWorkspace).toEqual({ insights: 3, strategy: 3, creative: 8, media: 6, operations: 3 });
    expect(publicSkills.filter((skill) => skill.featured)).toHaveLength(19);
    for (const skill of publicSkills) {
      expect(skill.card.outcomeZh).toBeTruthy();
      expect(skill.card.previewImage).toBeNull();
      expect(skill.card.previewLicense).toBeNull();
      expect(skill.source.githubStars).toBeGreaterThan(0);
      expect(skill.source.githubStarsCheckedAt).toBe('2026-09-01');
    }
    expect(publicSkills.filter((skill) => skill.discoveredFrom.includes('colaskill'))).toHaveLength(4);
    expect(publicSkills.find((skill) => skill.id === 'yao-geo-page-audit')?.source.githubStars).toBeGreaterThan(700);
  });

  it('uses unique ids, valid categories and public related recommendations', () => {
    expect(new Set(registry.skills.map((skill) => skill.id)).size).toBe(23);
    for (const workspace of WORKSPACES) {
      expect(registry.skills.filter((skill) => skill.workspace === workspace.id).length).toBeGreaterThan(0);
    }
    for (const skill of registry.skills) {
      expect(skill.growthStage).toBe('zero_to_one');
      expect(skill.promptExamples).toHaveLength(3);
      expect(skill.relatedSkillIds).not.toContain(skill.id);
      for (const relatedId of skill.relatedSkillIds) expect(registry.skills.some((related) => related.id === relatedId)).toBe(true);
    }
  });

  it('keeps installation and practice validation separate', () => {
    expect(registry.stats.installable).toBe(23);
    expect(registry.stats.practiceValidated).toBe(0);
    expect(registry.skills.every((skill) => skill.validation.installation.status === 'passed')).toBe(true);
    expect(registry.skills.every((skill) => skill.validation.practice.status === 'pending')).toBe(true);
  });
});
