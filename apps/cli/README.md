# @beusable/cli

shadcn 스타일 컴포넌트 설치 도구. `beusable add button` 한 줄로 컴포넌트 소스를 프로젝트에 복사한다.

---

## 작동 방식

- npm 패키지를 설치하는 것이 아니라 **소스 파일을 프로젝트에 직접 복사**한다.
- 복사된 파일은 **팀 소유**다. 디자인 시스템 업데이트에 종속되지 않으며 자유롭게 수정할 수 있다.
- React / Vue 프로젝트 모두 지원한다.

---

## 사용법

모노레포 내에서 처음 한 번만 빌드한다.

```bash
pnpm --filter @beusable/cli build
```

이후 대상 프로젝트 루트에서 아래 명령어를 실행한다.

```bash
# CSS 토큰 먼저 설치 (권장)
beusable add tokens

# 컴포넌트 추가 — 프레임워크 자동 감지
beusable add button

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

### `beusable add tokens`

CSS 변수 파일을 `src/styles/tokens.css`로 복사한다. 컴포넌트를 설치하기 전에 먼저 실행하는 것을 권장한다. 복사 후 CSS 진입점 파일에 다음 import를 추가한다.

```css
@import "./tokens.css";
```

### `beusable list`

설치 가능한 컴포넌트 전체 목록을 출력한다.

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

대상 프로젝트의 `package.json`에서 `dependencies`와 `devDependencies`를 확인한다.

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

---

## 참고

- 복사된 파일 상단에 원본 버전 주석이 기록된다. 향후 업데이트 여부를 비교할 때 참고할 수 있다.
- `beusable update` 명령어는 v1에서 지원하지 않는다. 복사 이후의 파일은 팀이 직접 관리한다.
- `beusable list`가 동작하려면 빌드 후 `dist/components.json`이 생성되어 있어야 한다. 빌드를 먼저 실행한다.
