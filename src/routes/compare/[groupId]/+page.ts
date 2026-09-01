import { error } from '@sveltejs/kit';
import { COMPARISON_GROUPS, getComparisonGroup } from '$lib/comparisons';
import { registry } from '$lib/skills';

export function entries() {
  return COMPARISON_GROUPS.map((group) => ({ groupId: group.id }));
}

export function load({ params }) {
  const group = getComparisonGroup(params.groupId);
  if (!group) error(404, 'Comparison not found');

  const skills = group.skillIds
    .map((id) => registry.skills.find((skill) => skill.id === id))
    .filter((skill) => skill?.comparisonGroupId === group.id);

  if (skills.length !== group.skillIds.length) error(500, 'Comparison data is incomplete');
  return { group, skills };
}
