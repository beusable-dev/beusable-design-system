use context7

# AGENTS.md

## Project Structure Summary

```
beusable-design-system/
├── packages/
│   ├── tokens/src/           Design token JSON (color, typography, shadow, radius)
│   ├── react/src/
│   │   ├── hooks/
│   │   │   ├── useControllableState.ts   shared controlled/uncontrolled state hook
│   │   │   └── useCountdownTimer.ts      m:ss countdown hook
│   │   ├── components/
│   │   │   ├── Button/           Button.tsx, Button.module.css
│   │   │   ├── TextField/        TextField.tsx, TextField.module.css, TextField.test.tsx
│   │   │   ├── Dropdown/         Dropdown.tsx, Dropdown.module.css
│   │   │   │                     useDropdownSelection.ts, useDropdownState.ts
│   │   │   │                     Dropdown.test.tsx
│   │   │   ├── Toast/            Toast.tsx, Toast.module.css
│   │   │   ├── Checkbox/         Checkbox.tsx, Checkbox.module.css, Checkbox.test.tsx
│   │   │   ├── Radio/            Radio.tsx, Radio.module.css, Radio.test.tsx
│   │   │   ├── Toggle/           Toggle.tsx, Toggle.module.css, Toggle.test.tsx
│   │   │   ├── Snackbar/         Snackbar.tsx, Snackbar.module.css
│   │   │   ├── Tooltip/          Tooltip.tsx, Tooltip.module.css
│   │   │   ├── Modal/            Modal.tsx, Modal.module.css, index.ts, Modal.test.tsx
│   │   │   ├── Table/            Table.tsx, Table.module.css, index.ts
│   │   │   ├── Slider/           Slider.tsx, Slider.module.css, Slider.test.tsx
│   │   │   ├── Tabs/             SegmentControl, TabBar, TabPill, TabCard, Tabs.test.tsx
│   │   │   └── DatePicker/       DatePicker.tsx, DatePicker.module.css
│   │   ├── test/
│   │   │   └── setup.ts          jest-dom matchers + scrollIntoView global mock
│   │   └── index.ts              public exports
│   └── vue/src/
│       ├── components/
│       │   ├── Button/           Button.vue, Button.module.css, Button.test.ts
│       │   ├── TextField/        TextField.vue, TextField.module.css, TextField.test.ts
│       │   ├── Dropdown/         Dropdown.vue, Dropdown.module.css, Dropdown.test.ts
│       │   ├── Toast/            Toast.vue, Toast.module.css, Toast.test.ts
│       │   ├── Checkbox/         Checkbox.vue, Checkbox.module.css, Checkbox.test.ts
│       │   ├── Radio/            Radio.vue, Radio.module.css, Radio.test.ts
│       │   ├── Toggle/           Toggle.vue, Toggle.module.css, Toggle.test.ts
│       │   ├── Snackbar/         Snackbar.vue, Snackbar.module.css, Snackbar.test.ts
│       │   ├── Tooltip/          Tooltip.vue, Tooltip.module.css, Tooltip.test.ts
│       │   ├── Modal/            Modal.vue, ModalHeader.vue, ModalBody.vue,
│       │   │                     ModalFooter.vue, ModalDivider.vue, ModalButtons.vue,
│       │   │                     ModalPopup.vue, Modal.module.css, Modal.test.ts
│       │   ├── Table/            Table.vue, Table.module.css, types.ts, Table.test.ts
│       │   ├── Slider/           Slider.vue, Slider.module.css, Slider.test.ts
│       │   ├── Tabs/             TabBar.vue, TabPill.vue, TabCard.vue,
│       │   │                     SegmentControl.vue, Tabs.module.css, Tabs.test.ts
│       │   └── DatePicker/       DatePicker.vue, DatePicker.module.css, types.ts,
│                                   index.ts, DatePicker.test.ts
│       ├── vue-shim.d.ts         *.vue 모듈 타입 선언 (테스트에서 .vue import 해결)
│       └── index.ts              public exports
├── apps/storybook/
│   ├── .storybook/               main.ts, preview.ts, reset.css
│   ├── stories/tokens/           Colors, Radius, Shadows, Typography
│   └── stories/components/       (React only — Vue stories 미작성)
└── apps/cli/                     @beusable/cli — shadcn-style 컴포넌트 설치 CLI
    ├── package.json              bin: beusable, type: commonjs
    ├── tsconfig.json
    ├── tsup.config.ts
    ├── src/
    │   ├── index.ts              CLI 진입점 (Commander 설정)
    │   ├── commands/
    │   │   ├── add.ts            beusable add <component> | tokens
    │   │   └── list.ts           beusable list
    │   ├── lib/
    │   │   ├── manifest.ts       components.json 로더
    │   │   ├── detect-framework.ts  package.json 기반 React/Vue 자동 감지
    │   │   ├── copy-files.ts     파일 복사 + 보안 검증 (BR-01~BR-06)
    │   │   └── logger.ts         출력 헬퍼 (picocolors)
    │   ├── scripts/
    │   │   ├── generate-manifest.ts  prebuild: components.json 생성
    │   │   ├── copy-assets.ts        postbuild: 컴포넌트 소스 → dist/assets/, components.json → dist/
    │   │   └── clean.ts              dist/ 삭제 (rm -rf 대체, 크로스플랫폼)
    │   └── components.json       빌드 산출물 — 14개 컴포넌트 목록
    └── dist/
        └── index.js              tsup CJS 번들 (shebang 포함)
        ├── Button.stories.tsx
        ├── TextField.stories.tsx
        ├── Dropdown.stories.tsx
        ├── Toast.stories.tsx
        ├── SelectionControl.stories.tsx  (Checkbox, Radio, Toggle)
        ├── Snackbar.stories.tsx
        ├── Tooltip.stories.tsx
        ├── Modal.stories.tsx
        ├── Table.stories.tsx
        ├── Slider.stories.tsx
        └── Tabs.stories.tsx
```

## Code Conventions (React)

- **Styles**: CSS Modules only. Always referenced as `styles.foo`.
- **Conditional classes**: `clsx(styles.base, condition && styles.modifier)` pattern.
- **Icons**: Inline SVG components. Use `fill="currentColor"` or `stroke="currentColor"` for color inheritance.
- **Color variants**: Inject `--selection-color` CSS variable into wrapper `style` and reference it inside the component's SVG/CSS.
- **controlled/uncontrolled**: All interactive components use `useControllableState<T>(value, defaultValue, onChange)` from `src/hooks/`. Never duplicate this logic per-component.
- **forwardRef**: Applied to all input components.
- **SVG JSX**: `fill-rule` → `fillRule`, `clip-rule` → `clipRule` (camelCase required).

## Code Conventions (Vue)

- **Styles**: `<style module src="./Component.module.css"></style>` — always external CSS module file. Inline `<style module>` is prohibited.
- **Conditional classes**: `:class="[$style.base, condition && $style.modifier]"` array binding pattern.
- **Icons**: Inline SVG in template. Attribute names stay kebab-case (no camelCase conversion needed).
- **Color variants**: Same `--selection-color` CSS variable pattern as React.
- **controlled/uncontrolled**: Use `useControllableState<T>(() => props.modelValue, defaultValue, onChange)` from `src/composables/` — same shared composable as React. Emit `update:modelValue` on change.
- **close button pattern**: Use an explicit `closable?: boolean` prop, **never** `$attrs.onClose !== undefined`. In Vue 3, `defineEmits(['close'])` removes `onClose` from `$attrs`, so `$attrs.onClose` is always `undefined`. Correct usage: `<Component :closable="true" @close="handler" />`.
- **tsconfig/vite.config**: `exclude: ["src/**/*.test.ts"]` in both tsconfig and `vite-plugin-dts` to prevent test type files from appearing in `dist/`.
- **types.ts pattern**: When a component needs to export non-trivial types (interfaces, union types), define them in a co-located `types.ts` and re-export from the component's `index.ts`. Do not export types directly from `.vue` files — TypeScript cannot resolve named exports from `.vue` module declarations. See `DatePicker/types.ts` as the reference.

## Hook Architecture

| Hook | Location | Purpose |
|------|----------|---------|
| `useControllableState<T>` | `src/hooks/` | Shared controlled/uncontrolled pattern. Used by 10+ components. |
| `useCountdownTimer` | `src/hooks/` | Counts down `timerSeconds` to a `m:ss` display string. Used by TextField. |
| `useDropdownSelection` | `Dropdown/` | Selection value state: `selectedValues`, `triggerLabel`, `select`, `clearValue`. |
| `useDropdownState` | `Dropdown/` | UI state: `open`, `searchQuery`, `activeIndex`, refs, keyboard handlers. |

Component-local logic (e.g. `usePasswordToggle` in TextField) stays as a local function inside the component file. Only extract to `src/hooks/` if used by more than one component.

## Testing Conventions (React)

- **Runner**: Vitest 2 + @testing-library/react + happy-dom (`packages/react/vitest.config.ts`)
- **Test location**: `src/components/<Name>/<Name>.test.tsx` — co-located with the component
- **Why happy-dom**: `jsdom@29` pulls in `@exodus/bytes` (pure ESM), causing `ERR_REQUIRE_ESM` in some environments. happy-dom avoids this entirely.
- **scrollIntoView**: Globally mocked in `src/test/setup.ts` — happy-dom does not implement it.
- **Query priority**: `getByRole` > `getByLabelText` > `getByText` > `getByPlaceholderText` > `querySelector`
- `type="password"` inputs have no ARIA `textbox` role — use `container.querySelector('input')` instead.
- The close button `aria-label` is Korean: `"닫기"` — match with `{ name: '닫기' }` not `/close/i`.
- Do not stage or commit test files (see `agent_docs/git.md`).

## Testing Conventions (Vue)

- **Runner**: Vitest 2 + @vue/test-utils + happy-dom (`packages/vue/vitest.config.ts`)
- **Test location**: `src/components/<Name>/<Name>.test.ts` — co-located with the component
- **Mount**: `mount(Component, { props: {...}, slots: {...}, attrs: {...} })`
- **Interaction**: `await wrapper.find('selector').trigger('click')` — use `trigger()` for all events
- **Emit check**: `wrapper.emitted('eventName')` returns array of call arguments; check with `.toBeTruthy()`
- **close button test**: Must pass `closable: true` prop. Without it, the close button is not rendered (by design). Pass handler via `attrs: { onClose: vi.fn() }`.
- **Document-level listeners** (e.g. Modal Escape): use `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))` then `await wrapper.vm.$nextTick()`.
- **happy-dom `:checked` caveat**: `element.checked` may not reflect bound value in happy-dom. Use `aria-checked` attribute or `modelValue` (controlled) instead of `defaultChecked` (uncontrolled) in tests.
- Do not stage or commit test files (see `agent_docs/git.md`).

## Figma Spec Checklist (verify before implementing)

Check every item below in Figma before implementing a component and reflect them in CSS without omission.

| Item | What to check |
|------|--------------|
| font-family | **Always Pretendard Variable** (ignore if Figma shows Roboto etc.) |
| font-weight | Read the numeric value directly from the Figma styles list (400/600/700). Never guess |
| font-size | Use exact Figma value |
| line-height | Distinguish between `normal` / `1` / a numeric value |
| color | Exact hex (#2f2f2f vs #444 — small differences matter) |
| padding | Each side individually (top right bottom left order) |
| gap | flex gap in px |
| border-radius | May differ per element |
| box-shadow | offset-x offset-y blur spread color |
| hover styles | All interactive elements. Check Figma hover variant. Missing = implementation incomplete |

## Modal Component Notes

- **max-height**: Modal container is fixed at `max-height: 720px`. No need to specify in stories.
- **ModalHeader closeSize**: Two modes — `sm` (default, 16px) and `lg` (24px). In sm, close button is on a separate row; in lg, it's in the same row as the title.
- **ModalFooter**: children are always centered in a 3-column layout. If `leftAction` is absent, left/right spacers are symmetrical.
- **ModalBody fadeout**: When `fadeout` prop is used, internal structure changes to `.bodyOuter` + `.body` wrappers. Scroll state is detected via `useRef` + `ResizeObserver`.
- **ModalButtons**: Not needed when using `ModalFooter`. Only used inside B-type (`ModalPopup`).
- **Build required**: After modifying a component, always run `pnpm --filter @beusable/react build`. Storybook references the dist output.

## File Modification Notes

- `packages/react/src/index.ts` — Add export when adding a new component.
- `packages/vue/src/index.ts` — Add export when adding a new Vue component. For components with complex types, also export from the co-located `types.ts` (not from `.vue`).
- `apps/storybook/stories/` — If a story `title` (ID) changes, HMR will fail to find the old story. Keep it stable.
- CSS Modules specificity — size modifiers (`.m .input`) may have higher specificity than component modifiers (`.textarea`). Resolve conflicts with compound selectors (`.m .input.textarea`).

## Design Token Color Reference

Key colors currently hardcoded in components:

| Usage | Value |
|-------|-------|
| Brand Primary | `#ec0047` |
| Brand Secondary (dark) | `#2f2f2f` |
| Brand Action (green) | `#57ab00` |
| Brand Accent | `#0085ff` |
| Focus border | `#0096ff` |
| Error | `#e60724` |
| Valid | `#57ab00` |
| Text default | `#2f2f2f` |
| Placeholder | `#bbb` |
| Border default | `#bbb` |
| Disabled bg | `#e6e6e6` |
| Disabled control | `#d7d7d7` |
| Dark bg | `#555` |

## Selection Control Colors (`--selection-color`)

Mapping from Checkbox and Radio `color` prop to CSS variable:

| color prop | Value |
|------------|-------|
| `primary` (default) | `#EC0047` |
| `secondary` | `#2f2f2f` |
| `action` | `#57ab00` |

## Toggle Size Specs

| size | showText | Track size | Knob | translateX (ON) |
|------|----------|------------|------|-----------------|
| `m` | true | 52×24px | 18px | 28px |
| `m` | false | 36×24px | 18px | 12px |
| `s` | true | 48×22px | 16px | 26px |
| `xs` | false only | 28×18px | 14px | 10px |

## Running Storybook

```bash
pnpm storybook   # http://localhost:6006
```

## New Component Checklist (React)

1. Create `packages/react/src/components/<Name>/` directory
2. Write `<Name>.tsx` + `<Name>.module.css`
3. Add export to `packages/react/src/index.ts`
4. Write `apps/storybook/stories/components/<Name>.stories.tsx`
5. Verify rendering in Storybook

## New Component Checklist (Vue)

1. Create `packages/vue/src/components/<Name>/` directory
2. Write `<Name>.vue` + `<Name>.module.css`
3. In `<Name>.vue`: `<style module src="./<Name>.module.css"></style>` — no inline styles
4. Add export to `packages/vue/src/index.ts`
5. Write `<Name>.test.ts` co-located with the component
6. Run `pnpm --filter @beusable/vue test` and verify all pass
7. Run `pnpm --filter @beusable/vue build` and verify `dist/` contains no test `.d.ts` files

## CLI Maintenance Rules (`apps/cli`)

### Build Pipeline

```
prebuild  → tsx src/scripts/generate-manifest.ts   # components.json 생성
build     → tsup                                    # CJS 번들
postbuild → tsx src/scripts/copy-assets.ts          # dist/assets/ + dist/components.json 복사
```

`pnpm --filter @beusable/cli build` 한 번으로 세 단계가 순서대로 실행된다.

### SHARED_DEPS_MAP 규칙 (가장 중요)

`apps/cli/src/scripts/generate-manifest.ts`의 `SHARED_DEPS_MAP`은 컴포넌트가 디렉터리 외부 파일을 import할 때 반드시 수동으로 등록해야 한다. 자동 감지 없음.

| 컴포넌트가 import하는 경로 | 등록해야 할 항목 |
|--------------------------|----------------|
| `../../hooks/useControllableState` (React) | `react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }]` |
| `../../hooks/useCountdownTimer` (React) | `react: [{ src: 'hooks/useCountdownTimer.ts', dest: '../../hooks/useCountdownTimer.ts' }]` |
| `../../composables/useControllableState` (Vue) | `vue: [VUE_CONTROLLABLE]` |
| `../selectionColors` (React, 컴포넌트 간 공유) | `react: [{ src: 'components/selectionColors.ts', dest: '../selectionColors.ts' }]` |

**누락 시 증상**: `beusable add <component> --framework react` 후 소비자 프로젝트에서 모듈을 찾지 못해 즉시 빌드 실패.

**수정 후 필수 절차**: `SHARED_DEPS_MAP` 수정 → `pnpm --filter @beusable/cli build` 실행 → `src/components.json`에 `sharedReact`/`sharedVue` 항목 확인.

### `--overwrite` 동작

`--overwrite` 플래그는 메인 컴포넌트뿐 아니라 의존 컴포넌트(`componentDeps`)와 shared 파일 모두에 적용된다. `add.ts`의 `skipIfExists` 계산에 `&& !options.overwrite`가 포함되어 있어야 한다.

### 보안: 경로 탈출 방지 (BR-01/BR-03)

`copy-files.ts`는 두 단계로 경로를 검증한다:

1. **문자열 검사** (`path.resolve` 기반) — `mkdir` 전에 조기 차단
2. **realpath 검사** — `mkdir` 후 symlink를 실제 경로로 해소해 재검증

두 번째 검사가 없으면 중간 경로에 symlink가 있을 때 프로젝트 외부 디렉터리에 파일이 쓰일 수 있다. `assertWithinProjectRoot(dir, realProjectRoot)` 헬퍼를 각 `mkdir` 호출 직후에 반드시 호출해야 한다.
