export interface Project {
  id: string;
  name: string;
  category: 'skills' | 'ai' | 'web' | 'infra';
  description: string;
  docCount: number;
  tags: string[];
  href: string;
  gradient: string;
}

export const projects: Project[] = [
  {
    id: 'gons-evolve',
    name: 'gons-evolve',
    category: 'skills',
    description: 'Claude Code 스킬 저장소 — Hooks, Plugins, Sub-agents, 팀 아키텍처',
    docCount: 8,
    tags: ['Claude Code', 'Skills', 'Automation'],
    href: '/docs/skills/gons-evolve/overview',
    gradient: 'from-sky-500 to-indigo-500',
  },
];

export const categories = [
  { id: 'all', label: '전체' },
  { id: 'skills', label: 'Skills' },
  { id: 'ai', label: 'AI' },
  { id: 'web', label: 'Web' },
  { id: 'infra', label: 'Infra' },
] as const;
