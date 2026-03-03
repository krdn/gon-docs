/**
 * publish-doc-graph.ts
 * doc-graph 스킬의 산출물(HTML, MD)을 gon-docs에 자동 발행합니다.
 *
 * 사용법:
 *   npx tsx scripts/publish-doc-graph.ts \
 *     --html <HTML파일경로> \
 *     --md <마크다운파일경로> \
 *     --project-id <category/name> \
 *     --name <표시이름> \
 *     --category <skills|ai|web|infra> \
 *     --description <설명> \
 *     --title <문서제목> \
 *     --tags <tag1,tag2>
 *
 * 예시:
 *   npx tsx scripts/publish-doc-graph.ts \
 *     --html /home/gon/projects/gons-evolve/docs/gons-evolve-graph.html \
 *     --md /home/gon/projects/gons-evolve/docs/gons-evolve.md \
 *     --project-id skills/gons-evolve \
 *     --name "gons-evolve" \
 *     --category skills \
 *     --description "Claude Code 스킬 저장소" \
 *     --title "스킬 저장소 개요" \
 *     --tags "Claude Code,Skills"
 */

import {
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
} from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ─── 카테고리별 기본 gradient ───
const CATEGORY_GRADIENTS: Record<string, string> = {
  skills: 'from-sky-500 to-indigo-500',
  ai: 'from-purple-500 to-pink-500',
  web: 'from-green-500 to-teal-500',
  infra: 'from-orange-500 to-red-500',
};

// ─── 인자 파싱 ───
interface Args {
  html: string;
  md?: string;
  projectId: string;
  name: string;
  category: string;
  description: string;
  title?: string;
  tags?: string[];
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const map = new Map<string, string>();

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        map.set(key, val);
        i++;
      }
    }
  }

  const html = map.get('html');
  const projectId = map.get('project-id');
  const name = map.get('name');
  const category = map.get('category');
  const description = map.get('description');

  if (!html || !projectId || !name || !category || !description) {
    console.error(
      '필수 인자: --html, --project-id, --name, --category, --description',
    );
    console.error(
      '사용법: npx tsx scripts/publish-doc-graph.ts --html <경로> --project-id <id> --name <이름> --category <카테고리> --description <설명>',
    );
    process.exit(1);
  }

  if (!existsSync(html)) {
    console.error(`HTML 파일이 존재하지 않습니다: ${html}`);
    process.exit(1);
  }

  const md = map.get('md');
  if (md && !existsSync(md)) {
    console.error(`마크다운 파일이 존재하지 않습니다: ${md}`);
    process.exit(1);
  }

  const tagsRaw = map.get('tags');

  return {
    html,
    md: md || undefined,
    projectId,
    name,
    category,
    description,
    title: map.get('title') || undefined,
    tags: tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : undefined,
  };
}

// ─── slug 추론 (HTML 파일명에서 -graph/-unified 제거) ───
function inferSlug(htmlPath: string): string {
  return basename(htmlPath, extname(htmlPath))
    .replace(/-graph$/, '')
    .replace(/-unified$/, '');
}

// ─── title 추론 (slug → Title Case) ───
function inferTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── projects.ts 업데이트 ───
function updateProjectsTs(args: Args, docCount: number): void {
  const filePath = join(ROOT, 'src', 'lib', 'projects.ts');
  let content = readFileSync(filePath, 'utf-8');

  const shortId = args.projectId.split('/').pop()!;
  const gradient =
    CATEGORY_GRADIENTS[args.category] || 'from-sky-500 to-indigo-500';
  const tags = args.tags || [args.category];

  // 기존 프로젝트가 있는지 확인
  const idPattern = new RegExp(`id:\\s*'${shortId}'`);
  if (idPattern.test(content)) {
    // docCount 업데이트
    const docCountPattern = new RegExp(
      `(id:\\s*'${shortId}'[\\s\\S]*?docCount:\\s*)\\d+`,
    );
    content = content.replace(docCountPattern, `$1${docCount}`);
    console.log(`  업데이트: projects.ts (docCount: ${docCount})`);
  } else {
    // 신규 항목 추가 (]; 직전에 삽입)
    const tagsStr = tags.map((t) => `'${t}'`).join(', ');
    const newEntry = `  {
    id: '${shortId}',
    name: '${args.name}',
    category: '${args.category}' as const,
    description: '${args.description.replace(/'/g, "\\'")}',
    docCount: ${docCount},
    tags: [${tagsStr}],
    href: '/docs/${args.projectId}/index',
    gradient: '${gradient}',
  },\n`;

    content = content.replace(/\n];/, `\n${newEntry}];`);
    console.log(`  추가: projects.ts (신규 프로젝트: ${shortId})`);
  }

  writeFileSync(filePath, content);
}

// ─── meta.json 유틸리티 ───
function readJson(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function ensureInPages(metaPath: string, title: string, page: string): void {
  const meta = readJson(metaPath) as { title?: string; pages?: string[] };

  if (!meta.title) meta.title = title;
  if (!meta.pages) meta.pages = [];

  if (!meta.pages.includes(page)) {
    meta.pages.push(page);
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
    console.log(`  업데이트: ${metaPath.replace(ROOT + '/', '')} (+${page})`);
  }
}

// ─── MD → MDX 변환 ───
function convertMdToMdx(
  mdContent: string,
  title: string,
  description: string,
  htmlSrc: string,
  htmlTitle: string,
): string {
  let body = mdContent;

  // H1 제목 제거 (frontmatter title이 대체)
  body = body.replace(/^#\s+.+\n*/m, '');

  // 목차 섹션 제거 (Fumadocs 자동 TOC)
  body = body.replace(/^##\s*목차[\s\S]*?(?=^##\s[^#])/m, '');

  // 메타 블록(인용) 제거 (> 소스: ... 부분)
  body = body.replace(/^>\s*\*\*소스\*\*:.*\n(>\s*.*\n)*/m, '');
  body = body.replace(/^>\s*소스:.*\n(>\s*.*\n)*/m, '');

  // 앞뒤 공백 정리
  body = body.trim();

  return `---
title: ${title}
description: ${description}
---

import { DocGraphViewer } from '@/components/DocGraphViewer';

${body}

---

<DocGraphViewer
  src="${htmlSrc}"
  title="${htmlTitle}"
/>
`;
}

// ─── iframe-only MDX 생성 (MD 없을 때) ───
function createIframeOnlyMdx(
  title: string,
  description: string,
  htmlSrc: string,
): string {
  return `---
title: ${title}
description: ${description}
---

import { DocGraphViewer } from '@/components/DocGraphViewer';

<DocGraphViewer
  src="${htmlSrc}"
  title="${title}"
/>
`;
}

// ─── 메인 ───
function main(): void {
  const args = parseArgs();

  const slug = inferSlug(args.html);
  const title = args.title || inferTitle(slug);
  const htmlFileName = basename(args.html);

  // 경로 변수
  const categoryName = args.projectId.split('/')[0];
  const projectName = args.projectId.split('/').pop()!;

  const publicDir = join(ROOT, 'public', 'docs', args.projectId);
  const contentDir = join(ROOT, 'content', 'docs', args.projectId);
  const categoryDir = join(ROOT, 'content', 'docs', categoryName);

  console.log(`\n발행 시작: ${args.projectId}`);
  console.log(`  slug: ${slug}, title: ${title}\n`);

  // 1. 디렉토리 생성
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  mkdirSync(categoryDir, { recursive: true });

  // 2. 루트 meta.json 업데이트 (카테고리 등록)
  const rootMetaPath = join(ROOT, 'content', 'docs', 'meta.json');
  const rootMeta = readJson(rootMetaPath) as {
    title?: string;
    pages?: string[];
  };
  if (!rootMeta.pages) rootMeta.pages = [];
  if (!rootMeta.pages.includes(categoryName)) {
    rootMeta.pages.push(categoryName);
    writeFileSync(rootMetaPath, JSON.stringify(rootMeta, null, 2) + '\n');
    console.log(`  업데이트: content/docs/meta.json (+${categoryName})`);
  }

  // 3. 카테고리 meta.json 업데이트
  const categoryMetaPath = join(categoryDir, 'meta.json');
  const categoryTitle =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  ensureInPages(categoryMetaPath, categoryTitle, projectName);

  // 4. 프로젝트 meta.json (없으면 생성)
  const projectMetaPath = join(contentDir, 'meta.json');
  if (!existsSync(projectMetaPath)) {
    writeFileSync(
      projectMetaPath,
      JSON.stringify({ title: args.name, pages: [] }, null, 2) + '\n',
    );
    console.log(
      `  생성: content/docs/${args.projectId}/meta.json`,
    );
  }

  // 5. index.mdx 생성 (없으면)
  const indexPath = join(contentDir, 'index.mdx');
  if (!existsSync(indexPath)) {
    writeFileSync(
      indexPath,
      `---
title: ${args.name}
description: ${args.description}
---

# ${args.name}

${args.description}
`,
    );
    console.log(
      `  생성: content/docs/${args.projectId}/index.mdx`,
    );
  }

  // 6. HTML 복사
  const htmlDest = join(publicDir, htmlFileName);
  copyFileSync(args.html, htmlDest);
  console.log(
    `  복사: ${htmlFileName} → public/docs/${args.projectId}/`,
  );

  // 7. MDX 생성 (기존 파일이 없을 때만)
  const htmlSrc = `/docs/${args.projectId}/${htmlFileName}`;
  const mdxPath = join(contentDir, `${slug}.mdx`);
  const mdxDescription = `${title} 시각화 문서`;

  if (existsSync(mdxPath)) {
    console.log(`  건너뜀: ${slug}.mdx (이미 존재)`);
  } else {
    let mdxContent: string;
    if (args.md) {
      const mdContent = readFileSync(args.md, 'utf-8');
      mdxContent = convertMdToMdx(
        mdContent,
        title,
        mdxDescription,
        htmlSrc,
        title,
      );
      console.log(`  변환: ${basename(args.md)} → ${slug}.mdx`);
    } else {
      mdxContent = createIframeOnlyMdx(title, mdxDescription, htmlSrc);
      console.log(`  생성: ${slug}.mdx (iframe-only)`);
    }
    writeFileSync(mdxPath, mdxContent);
  }

  // 8. 프로젝트 meta.json에 slug 추가
  ensureInPages(projectMetaPath, args.name, slug);

  // 9. projects.ts 업데이트 (docCount 계산)
  const projectMeta = readJson(projectMetaPath) as { pages?: string[] };
  const docCount = projectMeta.pages?.length || 1;
  updateProjectsTs(args, docCount);

  // 완료 출력
  console.log(`\n발행 완료!`);
  console.log(`  프로젝트: ${args.projectId}`);
  console.log(`  HTML: public/docs/${args.projectId}/${htmlFileName}`);
  console.log(`  MDX: content/docs/${args.projectId}/${slug}.mdx`);
  console.log(`  문서 수: ${docCount}`);
  console.log(`  URL: /docs/${args.projectId}/${slug}`);
}

main();
