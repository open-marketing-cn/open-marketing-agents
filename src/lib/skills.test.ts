import { describe, expect, it } from 'vitest';
import { registry, WORKSPACES } from './skills';

describe('generated brand 0→1 registry', () => {
  it('contains exactly 20 independent public Skills, four per workspace', () => {
    expect(registry.stats.total).toBe(20);
    expect(registry.skills).toHaveLength(20);
    for (const workspace of WORKSPACES) {
      expect(registry.stats.byWorkspace[workspace.id]).toBe(4);
      expect(registry.skills.filter((skill) => skill.workspace === workspace.id)).toHaveLength(4);
    }
  });

  it('uses unique ids and exactly three prompt examples', () => {
    expect(new Set(registry.skills.map((skill) => skill.id)).size).toBe(20);
    for (const skill of registry.skills) {
      expect(skill.growthStage).toBe('zero_to_one');
      expect(skill.promptExamples).toHaveLength(3);
      expect(skill.relatedSkillIds).not.toContain(skill.id);
      for (const relatedId of skill.relatedSkillIds) {
        expect(registry.skills.some((related) => related.id === relatedId)).toBe(true);
      }
    }
  });

  it('separates technical installation from practice validation', () => {
    expect(registry.stats.installable).toBe(20);
    expect(registry.stats.practiceValidated).toBe(0);
    expect(registry.skills.every((skill) => skill.validation.installation.status === 'passed')).toBe(true);
    expect(registry.skills.every((skill) => skill.validation.practice.status === 'pending')).toBe(true);
  });

  it('keeps source types and attribution visible', () => {
    expect(registry.stats.bySource).toEqual({ upstream: 10, adapted: 2, original: 8 });
    for (const skill of registry.skills) {
      expect(skill.source.repo).toMatch(/^https:\/\/github\.com\//);
      expect(skill.source.path).toBeTruthy();
      expect(skill.source.commit).toMatch(/^[a-f0-9]{40}$/);
      expect(skill.source.author).toBeTruthy();
      expect(skill.source.license).toBeTruthy();
    }
  });
});
