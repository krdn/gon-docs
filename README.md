# gon-docs

프로젝트별 도움말 문서 웹앱 (Fumadocs 기반)

## 기술 스택

- **Next.js 16** + **Fumadocs** (MDX 기반 문서 시스템)
- **Tailwind CSS v4** + 다크 테마
- **Docker** 배포 (standalone 모드, 포트 3200)

## 시작하기

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## 프로덕션 배포

```bash
# Docker
docker compose up -d    # http://localhost:3200

# 또는 직접 빌드
pnpm build && pnpm start
```

## 새 프로젝트 추가

```bash
# 1. 프로젝트 구조 생성
npx tsx scripts/add-project.ts <project-id> <name> <category> <description>

# 2. doc-graph HTML 임포트
npx tsx scripts/import-docs.ts <source-dir> <project-id>

# 3. src/lib/projects.ts에 메타데이터 추가
```
