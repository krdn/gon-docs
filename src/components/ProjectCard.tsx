import Link from 'next/link';
import type { Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={project.href}
      className="group block rounded-xl border border-[var(--dg-border)] bg-[var(--dg-surface)] p-6 transition-all hover:border-[var(--dg-border-hover)] hover:bg-[var(--dg-surface2)]"
    >
      {/* 상단 그라데이션 바 */}
      <div
        className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${project.gradient} transition-all group-hover:w-20`}
      />

      {/* 프로젝트명 */}
      <h3 className="mb-2 text-lg font-bold text-[var(--dg-text)]">
        {project.name}
      </h3>

      {/* 설명 */}
      <p className="mb-4 text-sm leading-relaxed text-[var(--dg-text-dim)]">
        {project.description}
      </p>

      {/* 태그 + 문서 수 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[var(--dg-surface3)] px-2 py-0.5 text-xs text-[var(--dg-text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-[var(--dg-text-muted)]">
          {project.docCount}개 문서
        </span>
      </div>
    </Link>
  );
}
