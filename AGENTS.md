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
│       ├── vue-shim.d.ts         *.vue module type declaration (resolves .vue imports in tests)
│       └── index.ts              public exports
├── apps/storybook/
│   ├── .storybook/               main.ts, preview.ts, reset.css
│   ├── stories/tokens/           Colors, Radius, Shadows, Typography
│   └── stories/components/       (React only — Vue stories not yet written,
│                                 Tabs family split into SegmentControl/TabBar/
│                                 TabPill/TabCard story files + Tabs overview)
└── apps/cli/                     @beusable-dev/cli — shadcn-style component installer CLI
    ├── package.json              bin: beusable, type: commonjs
    ├── tsconfig.json
    ├── tsup.config.ts
    ├── src/
    │   ├── index.ts              CLI entry point (Commander setup)
    │   ├── commands/
    │   │   ├── add.ts            beusable add <component> | tokens
    │   │   └── list.ts           beusable list
    │   ├── lib/
    │   │   ├── manifest.ts       components.json loader + runtime schema validation
    │   │   ├── detect-framework.ts  React/Vue auto-detection from package.json (dependencies + devDependencies + peerDependencies)
    │   │   ├── copy-files.ts     file copy + security validation (BR-01~BR-06) + monorepoRoot source guard
    │   │   └── logger.ts         output helper (picocolors)
    │   ├── scripts/
    │   │   ├── generate-manifest.ts  prebuild: generates components.json
    │   │   ├── copy-assets.ts        postbuild: component sources → dist/assets/, components.json → dist/
    │   │   └── clean.ts              deletes dist/ (cross-platform rm -rf replacement)
    │   └── components.json       build artifact — list of 14 components
    └── dist/
        ├── index.js              tsup CJS bundle (includes shebang)
        ├── components.json       runtime manifest copied for published CLI
        └── assets/               copied component/token source tree for installer runtime
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
- The close button `aria-label` in the source code is `"닫기"` (Korean for "close") — match with `{ name: '닫기' }` not `/close/i`.
- Do not stage or commit test files.

## Testing Conventions (Vue)

- **Runner**: Vitest 2 + @vue/test-utils + happy-dom (`packages/vue/vitest.config.ts`)
- **Test location**: `src/components/<Name>/<Name>.test.ts` — co-located with the component
- **Mount**: `mount(Component, { props: {...}, slots: {...}, attrs: {...} })`
- **Interaction**: `await wrapper.find('selector').trigger('click')` — use `trigger()` for all events
- **Emit check**: `wrapper.emitted('eventName')` returns array of call arguments; check with `.toBeTruthy()`
- **close button test**: Must pass `closable: true` prop. Without it, the close button is not rendered (by design). Pass handler via `attrs: { onClose: vi.fn() }`.
- **Document-level listeners** (e.g. Modal Escape): use `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))` then `await wrapper.vm.$nextTick()`.
- **happy-dom `:checked` caveat**: `element.checked` may not reflect bound value in happy-dom. Use `aria-checked` attribute or `modelValue` (controlled) instead of `defaultChecked` (uncontrolled) in tests.
- Do not stage or commit test files.

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
- **Build required**: After modifying a component, always run `pnpm --filter @beusable-dev/react build`. Storybook references the dist output.

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

## Storybook Deployment

- Workflow: `.github/workflows/storybook.yml`
- Trigger: `main` branch push with path filters
- Included paths: `apps/storybook/**`, `packages/react/**`, `packages/tokens/**`
- Excluded doc-only changes: `*.md` in those paths, plus `AGENTS.md` and `CLAUDE.md`

## New Component Checklist (React)

1. Create `packages/react/src/components/<Name>/` directory
2. Write `<Name>.tsx` + `<Name>.module.css`
3. Add export to `packages/react/src/index.ts`
4. Write `apps/storybook/stories/components/<Name>.stories.tsx`
   Compound component families may use separate story files per export (for example `SegmentControl.stories.tsx`, `TabBar.stories.tsx`) plus an optional overview story.
5. Verify rendering in Storybook

## New Component Checklist (Vue)

1. Create `packages/vue/src/components/<Name>/` directory
2. Write `<Name>.vue` + `<Name>.module.css`
3. In `<Name>.vue`: `<style module src="./<Name>.module.css"></style>` — no inline styles
4. Add export to `packages/vue/src/index.ts`
5. Write `<Name>.test.ts` co-located with the component
6. Run `pnpm --filter @beusable-dev/vue test` and verify all pass
7. Run `pnpm --filter @beusable-dev/vue build` and verify `dist/` contains no test `.d.ts` files

## CLI Maintenance Rules (`apps/cli`)

### Build Pipeline

```
prebuild  → tsx src/scripts/generate-manifest.ts   # generates components.json
build     → tsup                                    # CJS bundle
postbuild → tsx src/scripts/copy-assets.ts          # copies dist/assets/ + dist/components.json
```

`pnpm --filter @beusable-dev/cli build` runs all three steps in order.

### SHARED_DEPS_MAP Rules (critical)

`SHARED_DEPS_MAP` in `apps/cli/src/scripts/generate-manifest.ts` must be manually updated whenever a component imports files outside its own directory. There is no automatic detection.

| Import path in component | Entry to register |
|--------------------------|-------------------|
| `../../hooks/useControllableState` (React) | `react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }]` |
| `../../hooks/useCountdownTimer` (React) | `react: [{ src: 'hooks/useCountdownTimer.ts', dest: '../../hooks/useCountdownTimer.ts' }]` |
| `../../composables/useControllableState` (Vue) | `vue: [VUE_CONTROLLABLE]` |
| `../selectionColors` (React, shared across components) | `react: [{ src: 'components/selectionColors.ts', dest: '../selectionColors.ts' }]` |

**Symptom when missing**: consumer project fails to build immediately after `beusable add <component> --framework react` — module not found.

**Required after any change**: modify `SHARED_DEPS_MAP` → run `pnpm --filter @beusable-dev/cli build` → verify `sharedReact`/`sharedVue` entries appear in `src/components.json`.

### Be Prefix Naming (`add.ts`)

When running `beusable add button`, the component is copied with the `Be` prefix applied to names.

- Destination directory: `Button/` → `BeButton/`
- Filenames: `Button.tsx` → `BeButton.tsx`, `Button.module.css` → `BeButton.module.css`
- `index.ts` is not renamed

After copying, `rewriteForBePrefix` rewrites the content of each `.tsx`/`.ts`/`.vue` file:

| Pattern | Before | After |
|---------|--------|-------|
| CSS import (React) | `from './Button.module.css'` | `from './BeButton.module.css'` |
| CSS src attr (Vue) | `src="./Button.module.css"` | `src="./BeButton.module.css"` |
| export declaration | `export const Button ` | `export const BeButton ` |
| displayName | `Button.displayName` | `BeButton.displayName` |
| re-export path (no extension) | `from './Button'` | `from './BeButton'` |
| re-export path (Vue .vue) | `from './Modal.vue'` | `from './BeModal.vue'` |
| named export | `{ Button }` | `{ BeButton }` |
| Vue default alias | `as Modal }` | `as BeModal }` |

Type names (`ButtonProps`, `ButtonVariant`, etc.) are not renamed.

Related functions: `toDestDirName`, `renameForBe`, `rewriteForBePrefix`, `strReplaceAll` (all at the bottom of `add.ts`)

### `--scss` behavior

When the `--scss` flag is set:

- `beusable add tokens --scss`: copies `_tokens.scss` into `src/styles/`
- `beusable add button --scss`: copies files with `.module.css` → `.module.scss` rename, and rewrites internal import paths automatically

**Be prefix + --scss combination**: `BeButton.module.css` → `BeButton.module.scss`, and `rewriteForBePrefix` rewrites paths to use the `.scss` extension.

### `--overwrite` behavior

`--overwrite` only overwrites files belonging to the **explicitly requested main component**.

- Transitive dependencies (`componentDeps`) and shared files are always treated as `skipIfExists: true`. Even with `--overwrite`, they are skipped if they already exist.
- This protects customized dependency files (e.g. `BeButton`, `BeCheckbox`) from being accidentally reset when running `datepicker --overwrite`.

```
beusable add datepicker --overwrite
  → BeDatePicker/*                 : overwritten
  → BeButton/*                     : skipped if exists (skipIfExists: true)
  → BeCheckbox/*                   : skipped if exists (skipIfExists: true)
  → hooks/useControllableState.ts  : skipped if exists (skipIfExists: true)
```

### Security: path traversal prevention (BR-01/BR-03)

`copy-files.ts` validates paths in three stages:

1. **Source path guard** (`monorepoRoot`) — When `CopyFilesOptions.monorepoRoot` is provided, every `absoluteSourcePath` must resolve within `fsRealpath(monorepoRoot)`. Blocks source path escape.
2. **String check** (`path.resolve`) — Early rejection of destination paths before any I/O.
3. **Realpath check** — After `mkdir`, resolves symlinks to real paths and re-validates.

Without stage 3, a symlink in the intermediate path could allow writes outside the project root. `assertWithinProjectRoot(dir, realProjectRoot)` must be called immediately after each `mkdir`.

### Release & Deployment

Registry: GitHub Packages (`@beusable-dev:registry=https://npm.pkg.github.com`)

**Automated publish (GitHub Actions)**
- Workflow: `.github/workflows/cli-publish.yml`
- Trigger: push of any `cli-v*` tag
- Steps: test → build → publish
- Publish step uses `NPM_TOKEN`

**Release procedure**
```bash
# After bumping version in apps/cli/package.json
git add apps/cli/package.json && git commit -m "Bump CLI version to x.y.z"
git tag cli-vx.y.z && git push origin cli-vx.y.z
```

### Security: manifest runtime validation

`loadManifest()` in `manifest.ts` calls `assertValidManifest()` immediately after `JSON.parse`. It checks:

- Required top-level fields exist: `version`, `components`, `tokens`
- `tokens.src/dest/srcScss/destScss` are safe relative paths (no absolute paths, no `..` escape)
- Same check for `sharedReact[].src/dest` and `sharedVue[].src/dest`

`isSafePath(p)` helper: passes only if `path.isAbsolute(p) === false` and `path.normalize(p)` does not start with `..`.
