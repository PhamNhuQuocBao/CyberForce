export const skillAxes = [
  'web',
  'network',
  'binary',
  'crypto',
  'forensics',
  'windows_ad',
  'defensive',
  'cloud_devsecops',
] as const;

export type SkillAxisKey = (typeof skillAxes)[number];

export function emptySkills(): Record<SkillAxisKey, number> {
  return Object.fromEntries(skillAxes.map((axis) => [axis, 0])) as Record<SkillAxisKey, number>;
}
