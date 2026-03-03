# gon-docs

프로젝트별 도움말 문서 웹앱 (Fumadocs 기반)

## 기술 스택
- **프레임워크**: Next.js + Fumadocs (MDX 기반 문서 시스템)
- **스타일링**: Tailwind CSS v4 + Fumadocs UI
- **배포**: Docker (standalone 모드), 포트 3200
- **패키지 매니저**: pnpm

## 프로젝트 구조
```
content/docs/          # MDX 문서 소스 (사이드바 구조)
public/docs/           # doc-graph HTML 파일 (iframe 임베드)
src/app/               # Next.js App Router
src/components/        # DocGraphViewer, ProjectCard 등
src/lib/               # source.ts, projects.ts
scripts/               # import-docs.ts, add-project.ts (자동화)
```

## 핵심 패턴
- doc-graph HTML → `public/docs/<project>/`에 배치
- 각 HTML에 대응하는 MDX 파일이 DocGraphViewer iframe으로 임베드
- `meta.json`으로 사이드바 트리 구조 관리
- 항상 다크 모드 (테마 토글 비활성화)

## 명령어
```bash
pnpm dev       # 개발 서버 (localhost:3000)
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버
```

## 새 프로젝트 추가
```bash
npx tsx scripts/add-project.ts <project-id> <name> <category> <description>
npx tsx scripts/import-docs.ts <source-dir> <project-id>
```
