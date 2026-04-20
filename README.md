# Beusable Design System

Figma 기반의 멀티 프레임워크 디자인 시스템. React 18과 Vue 3을 지원하며, Style Dictionary 기반 디자인 토큰을 공유합니다.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@beusable/tokens`](./packages/tokens) | Style Dictionary v4 기반 CSS/SCSS/JS 토큰 | ✅ |
| [`@beusable/react`](./packages/react) | React 18 컴포넌트 라이브러리 (13개) | ✅ |
| [`@beusable/vue`](./packages/vue) | Vue 3 컴포넌트 라이브러리 (13개) | ✅ |
| `@beusable/storybook` | Storybook 8 문서/플레이그라운드 | ✅ React / 🔲 Vue |

## Getting Started

### Prerequisites

- Node.js 18+
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
pnpm --filter @beusable/tokens build
pnpm --filter @beusable/react build
pnpm --filter @beusable/vue build
```

## Repository Structure

```
beusable-design-system/
├── packages/
│   ├── tokens/     @beusable/tokens  — 디자인 토큰
│   ├── react/      @beusable/react   — React 컴포넌트
│   └── vue/        @beusable/vue     — Vue 3 컴포넌트
└── apps/
    └── storybook/  @beusable/storybook — 문서
```

## Components

13개 컴포넌트가 React와 Vue 모두 지원됩니다:

Button · TextField · Dropdown · Toast · Checkbox · Radio · Toggle · Snackbar · Tooltip · Modal · Table · Slider · Tabs/SegmentControl

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
