import { error } from '@sveltejs/kit';
import { registry } from '$lib/skills';

export function entries() {
  return registry.skills.map((skill) => ({ id: skill.id }));
}

export function load({ params }) {
  const skill = registry.skills.find((item) => item.id === params.id);
  if (!skill) error(404, 'Skill not found');
  return {
    skill,
    related: skill.relatedSkillIds.map((id) => registry.skills.find((item) => item.id === id)).filter(Boolean)
  };
}
