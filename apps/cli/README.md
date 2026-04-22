# @beusable-dev/cli

shadcn 스타일 컴포넌트 설치 도구. `beusable add button` 한 줄로 컴포넌트 소스를 프로젝트에 복사한다.

---

## 작동 방식

- npm 패키지를 설치하는 것이 아니라 **소스 파일을 프로젝트에 직접 복사**한다.
- 복사된 파일은 **팀 소유**다. 디자인 시스템 업데이트에 종속되지 않으며 자유롭게 수정할 수 있다.
- React / Vue 프로젝트 모두 지원한다.

---

## 사용법

### npm 배포 버전

npm에 배포된 경우 설치 없이 바로 실행할 수 있다.

```bash
# 설치 없이 바로 실행 (npx)
npx @beusable-dev/cli add button

# 또는 전역 설치 후 사용
npm install -g @beusable-dev/cli
beusable add button
```

### 미배포(로컬) 버전

npm에 배포하지 않은 경우 모노레포에서 직접 빌드한 뒤 전역 링크를 설정한다.

```bash
# 1. 모노레포 루트에서 빌드 (최초 1회)
pnpm --filter @beusable-dev/cli build

# 2. 전역 링크 설정 (최초 1회)
cd apps/cli && pnpm link --global
```

링크 설정 후에는 배포 버전과 동일하게 `beusable` 명령어를 사용할 수 있다.

---

이후 대상 프로젝트 루트에서 아래 명령어를 실행한다.

```bash
# CSS 토큰 먼저 설치 (권장)
beusable add tokens

# SCSS 토큰으로 설치 (_tokens.scss)
beusable add tokens --scss

# 컴포넌트 추가 — 프레임워크 자동 감지
beusable add button

# SCSS 모드: .module.css → .module.scss로 복사
beusable add button --scss

# 프레임워크 직접 지정
beusable add button --framework vue

# 출력 경로 지정
beusable add button --output-dir src/ui

# 기존 파일 덮어쓰기
beusable add button --overwrite

# 지원 컴포넌트 목록 확인
beusable list
```

---

## 명령어 레퍼런스

### `beusable add <component>`

컴포넌트 소스 파일을 프로젝트에 복사한다.

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `--framework <react\|vue>` | 자동 감지 | 프레임워크를 명시적으로 지정 |
| `--output-dir <dir>` | `src/components` | 파일을 복사할 출력 디렉토리 |
| `--overwrite` | false | 이미 파일이 존재하면 덮어쓴다 |
| `--scss` | false | 토큰을 SCSS로, CSS Module을 `.module.scss`로 복사 |

`--scss` 플래그를 사용하면 복사된 컴포넌트 파일 내부의 import 경로도 자동으로 `.module.scss`로 재작성된다.

### `beusable add tokens`

CSS 변수 파일을 `src/styles/tokens.css`로 복사한다. 컴포넌트를 설치하기 전에 먼저 실행하는 것을 권장한다.

```bash
# CSS 방식 (기본)
beusable add tokens
# → src/styles/tokens.css 생성

# SCSS 방식
beusable add tokens --scss
# → src/styles/_tokens.scss 생성
```

CLI는 import를 자동으로 삽입하지 않는다. 복사 후 아래 안내에 따라 직접 추가해야 한다.

```css
@import "./tokens.css";
```

```scss
@use "./tokens" as *;
```

### `beusable list`

설치 가능한 컴포넌트 전체 목록을 출력한다.

---

## Be 네이밍 컨벤션

설치된 컴포넌트는 **`Be` 접두사**를 붙인 이름으로 복사된다.

```
src/components/
└── BeButton/
    ├── BeButton.tsx          ← export const BeButton = ...
    ├── BeButton.module.css
    └── index.ts              ← export { BeButton } from './BeButton'
```

사용 예시:

```tsx
import { BeButton } from './components/BeButton';

<BeButton variant="primary">확인</BeButton>
```

Tabs처럼 여러 컴포넌트가 하나의 디렉토리에 있는 경우도 동일하게 적용된다.

```
src/components/
└── BeTabs/
    ├── BeSegmentControl.tsx
    ├── BeTabBar.tsx
    ├── BeTabPill.tsx
    ├── BeTabCard.tsx
    └── index.ts              ← export { BeSegmentControl, BeTabBar, ... }
```

---

## 지원 컴포넌트

| 컴포넌트 | 명령어 | 추가 의존성 |
|----------|--------|-------------|
| Button | `beusable add button` | — |
| Checkbox | `beusable add checkbox` | — |
| DatePicker | `beusable add datepicker` | `date-fns`, `date-fns-tz` |
| Dropdown | `beusable add dropdown` | — |
| Modal | `beusable add modal` | — |
| Radio | `beusable add radio` | — |
| Slider | `beusable add slider` | — |
| Snackbar | `beusable add snackbar` | — |
| Table | `beusable add table` | — |
| Tabs | `beusable add tabs` | — |
| TextField | `beusable add textfield` | — |
| Toast | `beusable add toast` | — |
| Toggle | `beusable add toggle` | — |
| Tooltip | `beusable add tooltip` | — |

---

## 필요 의존성

대부분의 컴포넌트는 `clsx`가 필요하다.

```bash
pnpm add clsx
```

DatePicker는 추가로 `date-fns`와 `date-fns-tz`가 필요하다.

```bash
pnpm add clsx date-fns date-fns-tz
```

CLI는 복사 완료 후 필요한 패키지를 자동으로 안내한다.

---

## 프레임워크 자동 감지

대상 프로젝트의 `package.json`에서 `dependencies`, `devDependencies`, `peerDependencies`를 모두 확인한다.

| 상황 | 동작 |
|------|------|
| `react`만 존재 | React 버전 파일 복사 |
| `vue`만 존재 | Vue 버전 파일 복사 |
| 둘 다 존재하거나 둘 다 없음 | `--framework` 옵션 직접 지정 필요 |

---

## 파일 충돌 보호

대상 경로에 이미 파일이 존재하면 경고를 출력하고 복사를 중단한다. 덮어쓰려면 `--overwrite` 플래그를 추가해 재실행한다.

```bash
beusable add button --overwrite
```

`--overwrite`는 명령줄에 직접 지정한 컴포넌트 파일만 덮어쓴다. 전이 의존성(예: `datepicker`가 의존하는 `BeButton`, `BeCheckbox`)과 shared 파일은 이미 존재하면 항상 건너뛴다. 커스터마이징한 의존 파일을 보호하기 위한 동작이다.

---

## 참고

- `beusable update` 명령어는 v1에서 지원하지 않는다. 복사 이후의 파일은 팀이 직접 관리한다.
- `beusable list`가 동작하려면 빌드 후 `dist/components.json`이 생성되어 있어야 한다. 빌드를 먼저 실행한다.
