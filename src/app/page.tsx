'use client';

import { useState } from 'react';
import { projects, categories } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import Link from 'next/link';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--dg-bg)', color: 'var(--dg-text)' }}
    >
      {/* 헤더 */}
      <header
        className="border-b px-6 py-16 text-center"
        style={{
          borderColor: 'var(--dg-border)',
          background:
            'linear-gradient(180deg, var(--dg-surface) 0%, var(--dg-bg) 100%)',
        }}
      >
        <h1 className="mb-2 text-4xl font-extrabold">
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            gon-docs
          </span>
        </h1>
        <p style={{ color: 'var(--dg-text-dim)' }}>
          프로젝트별 도움말 문서 허브
        </p>
        <div className="mt-4">
          <Link
            href="/docs"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: 'var(--dg-surface2)',
              border: '1px solid var(--dg-border)',
              color: 'var(--dg-accent)',
            }}
          >
            문서 보기
          </Link>
        </div>
      </header>

      {/* 카테고리 필터 */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
              style={{
                background:
                  activeCategory === cat.id
                    ? 'var(--dg-surface3)'
                    : 'transparent',
                border: `1px solid ${
                  activeCategory === cat.id
                    ? 'var(--dg-accent)'
                    : 'var(--dg-border)'
                }`,
                color:
                  activeCategory === cat.id
                    ? 'var(--dg-accent)'
                    : 'var(--dg-text-dim)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pb-16">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {filtered.length === 0 && (
            <p
              className="col-span-full py-12 text-center"
              style={{ color: 'var(--dg-text-muted)' }}
            >
              해당 카테고리의 프로젝트가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
