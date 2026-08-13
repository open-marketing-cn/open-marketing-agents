import { describe, expect, it } from 'vitest';
import { CATALOG, canInstall, searchCatalog } from './catalog';

describe('Open Marketing catalog', () => {
  it('includes every Agency Agents marketing and paid-media candidate', () => {
    const agencyCandidates = CATALOG.filter((item) => item.id.startsWith('agency-'));
    expect(agencyCandidates).toHaveLength(43);
  });

  it('includes all 40 curated Marketing Skills candidates', () => {
    const skillCandidates = CATALOG.filter((item) => item.id.startsWith('skill-'));
    expect(skillCandidates).toHaveLength(40);
  });

  it('does not expose unvalidated packages as installable', () => {
    expect(CATALOG.filter((item) => canInstall(item))).toHaveLength(0);
    expect(CATALOG.every((item) => item.status !== 'installable' || item.validation.length > 0)).toBe(true);
  });

  it('finds Chinese platform and overseas candidates', () => {
    expect(searchCatalog(CATALOG, '小红书', 'all', 'agent', 'all').length).toBeGreaterThan(0);
    expect(searchCatalog(CATALOG, '中国品牌出海', 'all', 'agent', 'all').length).toBeGreaterThan(0);
  });

  it('keeps all six workspaces populated', () => {
    for (const workspace of ['insights', 'strategy', 'creation', 'adaptation', 'delivery', 'performance'] as const) {
      expect(CATALOG.some((item) => item.workspace === workspace)).toBe(true);
    }
  });
});
