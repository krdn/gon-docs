/**
 * import-docs.ts
 * 기존 doc-graph HTML 파일을 gon-docs에 임포트하고 MDX 스텁을 생성합니다.
 *
 * 사용법:
 *   npx tsx scripts/import-docs.ts <source-dir> <project-id>
 *
 * 예시:
 *   npx tsx scripts/import-docs.ts /home/gon/projects/skills/gons-evolve/docs skills/gons-evolve
 */

import { readdirSync, copyFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';

const ROOT = join(import.meta.dirname, '..');

function main() {
  const [sourceDir, projectId] = process.argv.slice(2);

  if (!sourceDir || !projectId) {
    console.error('사용법: npx tsx scripts/import-docs.ts <source-dir> <project-id>');
    process.exit(1);
  }

  const publicDir = join(ROOT, 'public', 'docs', projectId);
  const contentDir = join(ROOT, 'content', 'docs', projectId);

  // 디렉토리 생성
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });

  // HTML 파일 복사 + MDX 스텁 생성
  const htmlFiles = readdirSync(sourceDir).filter((f) => f.endsWith('.html'));
  const pages: string[] = [];

  for (const file of htmlFiles) {
    const src = join(sourceDir, file);
    const dest = join(publicDir, file);

    // HTML 복사
    copyFileSync(src, dest);
    console.log(`  복사: ${file} → public/docs/${projectId}/`);

    // MDX 스텁 생성
    const slug = basename(file, extname(file))
      .replace(/-graph$/, '')
      .replace(/-unified$/, '');
    const mdxPath = join(contentDir, `${slug}.mdx`);

    if (!existsSync(mdxPath)) {
      const title = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const mdxContent = `---
title: ${title}
description: ${title} 시각화 문서
---

import { DocGraphViewer } from '@/components/DocGraphViewer';

# ${title}

<DocGraphViewer
  src="/docs/${projectId}/${file}"
  title="${title}"
/>
`;
      writeFileSync(mdxPath, mdxContent);
      console.log(`  생성: ${slug}.mdx`);
      pages.push(slug);
    }
  }

  // meta.json 생성
  const metaPath = join(contentDir, 'meta.json');
  if (!existsSync(metaPath) && pages.length > 0) {
    writeFileSync(
      metaPath,
      JSON.stringify(
        { title: projectId.split('/').pop(), pages },
        null,
        2,
      ),
    );
    console.log(`  생성: meta.json`);
  }

  console.log(`\n완료: ${htmlFiles.length}개 HTML 임포트, ${pages.length}개 MDX 생성`);
}

main();
