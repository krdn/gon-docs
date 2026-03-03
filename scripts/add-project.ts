/**
 * add-project.ts
 * 새 프로젝트를 projects.ts에 추가하고 디렉토리 구조를 생성합니다.
 *
 * 사용법:
 *   npx tsx scripts/add-project.ts <project-id> <name> <category> <description>
 *
 * 예시:
 *   npx tsx scripts/add-project.ts skills/new-skill "New Skill" skills "새로운 스킬 프로젝트"
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');

function main() {
  const [projectId, name, category, description] = process.argv.slice(2);

  if (!projectId || !name || !category || !description) {
    console.error(
      '사용법: npx tsx scripts/add-project.ts <project-id> <name> <category> <description>',
    );
    process.exit(1);
  }

  // 디렉토리 생성
  const publicDir = join(ROOT, 'public', 'docs', projectId);
  const contentDir = join(ROOT, 'content', 'docs', projectId);

  mkdirSync(publicDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });

  // meta.json 생성
  const metaPath = join(contentDir, 'meta.json');
  if (!existsSync(metaPath)) {
    writeFileSync(
      metaPath,
      JSON.stringify({ title: name, pages: [] }, null, 2),
    );
    console.log(`생성: content/docs/${projectId}/meta.json`);
  }

  // index.mdx 생성
  const indexPath = join(contentDir, 'index.mdx');
  if (!existsSync(indexPath)) {
    writeFileSync(
      indexPath,
      `---
title: ${name}
description: ${description}
---

# ${name}

${description}
`,
    );
    console.log(`생성: content/docs/${projectId}/index.mdx`);
  }

  console.log(`\n프로젝트 디렉토리 생성 완료: ${projectId}`);
  console.log(`\n다음 단계:`);
  console.log(`  1. src/lib/projects.ts에 프로젝트 항목 추가`);
  console.log(`  2. content/docs/meta.json에 상위 카테고리 등록`);
  console.log(`  3. npx tsx scripts/import-docs.ts <source> ${projectId} 로 HTML 임포트`);
}

main();
