# Beusable Design System

Figma 기반의 멀티 프레임워크 디자인 시스템. React 18과 Vue 3을 지원하며, Style Dictionary 기반 디자인 토큰을 공유합니다.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@beusable-dev/tokens`](./packages/tokens) | Style Dictionary v4 기반 CSS/SCSS/JS 토큰 | ✅ |
| [`@beusable-dev/react`](./packages/react) | React 18 컴포넌트 라이브러리 (14개) | ✅ |
| [`@beusable-dev/vue`](./packages/vue) | Vue 3 컴포넌트 라이브러리 (14개) | ✅ |
| `@beusable-dev/storybook` | Storybook 8 문서/플레이그라운드 | ✅ React / 🔲 Vue |
| [`@beusable-dev/cli`](./apps/cli) | shadcn 스타일 컴포넌트 소스 복사 CLI | ✅ |

## 패키지 설치 (팀원용)

디자인 시스템 패키지는 [GitHub Package Registry](https://github.com/orgs/beusable-dev/packages)를 통해 배포됩니다.

### 1. GitHub Personal Access Token 발급

[GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens/new)

권한 선택:
- `read:packages` — 패키지 다운로드
- `repo` — private 패키지 접근

### 2. `.npmrc` 설정

프로젝트 루트 또는 홈 디렉토리(`~/.npmrc`)에 추가:

```
@beusable-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

`YOUR_GITHUB_TOKEN`을 발급받은 토큰으로 교체합니다.

### 3. 패키지 설치

```bash
# Vue 프로젝트
npm install @beusable-dev/vue @beusable-dev/tokens

# React 프로젝트
npm install @beusable-dev/react @beusable-dev/tokens
```

### 4. 사용

**Vue**

```vue
<script setup>
import { BeButton, BeTextField } from '@beusable-dev/vue'
import '@beusable-dev/vue/style.css'
import '@beusable-dev/tokens/css'
</script>

<template>
  <BeButton variant="primary" shape="rounded">확인</BeButton>
  <BeTextField label="이름" />
</template>
```

**React**

```tsx
import { BeButton, BeTextField } from '@beusable-dev/react'
import '@beusable-dev/react/style.css'
import '@beusable-dev/tokens/css'

export function App() {
  return (
    <>
      <BeButton variant="primary" shape="rounded">확인</BeButton>
      <BeTextField label="이름" />
    </>
  )
}
```

---

## CLI로 컴포넌트 설치

npm 패키지 설치 대신 **소스 파일을 프로젝트에 직접 복사**하는 shadcn 스타일 설치 방법입니다. 복사된 파일은 팀 소유로, 자유롭게 수정할 수 있습니다.

### npm 배포 버전

```bash
# 설치 없이 바로 실행
npx @beusable-dev/cli add button

# 전역 설치 후 사용
npm install -g @beusable-dev/cli
beusable add button
```

> **CLI 릴리스**: `v*` 태그를 푸시하면 `.github/workflows/cli-publish.yml`이 자동으로 GitHub Packages에 배포합니다.
> ```bash
> git tag v0.x.y && git push origin v0.x.y
> ```

### 미배포(로컬) 버전

```bash
# 1. 빌드 (최초 1회)
pnpm --filter @beusable-dev/cli build

# 2. 전역 링크 설정 (최초 1회)
cd apps/cli && pnpm link --global
```

링크 설정 후에는 배포 버전과 동일하게 사용할 수 있습니다.

### 주요 명령어

```bash
beusable add tokens          # CSS 토큰 설치 (권장 선행)
beusable add tokens --scss   # SCSS 토큰 설치 (_tokens.scss)
beusable add button          # 컴포넌트 추가 (프레임워크 자동 감지)
beusable add button --scss   # CSS Module을 .module.scss로 복사
beusable add button --framework vue   # 프레임워크 직접 지정
beusable add button --output-dir src/ui  # 출력 경로 지정
beusable add button --overwrite       # 기존 파일 덮어쓰기 (메인 컴포넌트만)
beusable list                # 설치 가능한 컴포넌트 목록
```

설치된 컴포넌트는 `Be` 접두사 네이밍으로 복사됩니다 (`BeButton`, `BeModal` 등).

> 자세한 사용법은 [apps/cli/README.md](./apps/cli/README.md)를 참고하세요.

---

## Getting Started (기여자용)

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Development

```bash
pnpm storybook          # Storybook dev server → http://localhost:6006
pnpm build              # 전체 패키지 빌드
pnpm test               # 전체 테스트 실행 (React + Vue)
pnpm test:watch         # Watch 모드
```

### Build individual packages

```bash
pnpm --filter @beusable-dev/tokens build
pnpm --filter @beusable-dev/react build
pnpm --filter @beusable-dev/vue build
```

## Repository Structure

```
beusable-design-system/
├── packages/
│   ├── tokens/     @beusable-dev/tokens  — 디자인 토큰
│   ├── react/      @beusable-dev/react   — React 컴포넌트
│   └── vue/        @beusable-dev/vue     — Vue 3 컴포넌트
└── apps/
    ├── storybook/  @beusable-dev/storybook — 문서
    └── cli/        @beusable-dev/cli          — 컴포넌트 설치 CLI
```

## Components

14개 컴포넌트 그룹이 React와 Vue 모두 지원됩니다:

Button · TextField · Dropdown · Toast · Checkbox · Radio · Toggle · Snackbar · Tooltip · Modal · Table · Slider · Tabs family (SegmentControl · TabBar · TabPill · TabCard) · DatePicker

## Tech Stack

| Role | Tool |
|------|------|
| Monorepo | pnpm workspaces |
| Token build | Style Dictionary v4 |
| React build | Vite (library mode) + TypeScript |
| Vue build | Vite (library mode) + TypeScript |
| Styles | CSS Modules |
| Docs | Storybook 8 |
| Test (React) | Vitest 2 + @testing-library/react + happy-dom |
| Test (Vue) | Vitest 2 + @vue/test-utils + happy-dom |
| Figma | 00. Component_Beusable_ver01 |

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## License

MIT
