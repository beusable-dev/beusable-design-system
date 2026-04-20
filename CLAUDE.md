use context7

# CLAUDE.md

## Engineering Principles

- **Default transition duration is 0.3s.** Use `0.3s` unless a specific value is given.
- **Identify the root cause before attempting a fix.** Do not apply compensating workarounds (e.g. JS-patching a CSS offset on every scroll event) when the real issue is an architectural mismatch. Example: a `position: absolute` element inside `overflow-x: auto` scrolls with the content — the fix is to move it outside the scroll container, not to track `scrollLeft` and recalculate `left` on every scroll event.

## Project Overview

Beusable Design System monorepo.
Built on Figma designs: tokens → React/Vue components → Storybook documentation.

```
beusable-design-system/
├── packages/
│   ├── tokens/     @beusable/tokens  — Style Dictionary-based CSS/SCSS/JS tokens
│   ├── react/      @beusable/react   — React 18 component library
│   └── vue/        @beusable/vue     — Vue 3 component library
└── apps/
    └── storybook/  @beusable/storybook — Storybook 8 docs/playground (React only currently)
```

## Commands

```bash
pnpm storybook          # Storybook dev server (port 6006)
pnpm build              # Build all packages
pnpm build:tokens       # Build tokens only
pnpm build:storybook    # Static Storybook build
pnpm test               # Run all tests (Vitest)
pnpm test:watch         # Watch mode
pnpm test:coverage      # With coverage report

# CLI (apps/cli)
pnpm --filter @beusable/cli build    # CLI 빌드 (components.json 생성 + tsup 번들)
pnpm --filter @beusable/cli test     # CLI 테스트
pnpm --filter @beusable/cli dev      # tsx로 직접 실행 (개발용)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Token build**: Style Dictionary v4
- **Components**: React 18 + TypeScript + CSS Modules + clsx / Vue 3 + TypeScript + CSS Modules
- **Bundler**: Vite (library mode)
- **Docs**: Storybook 8
- **Test**: Vitest 2 + @testing-library/react (React) / @vue/test-utils (Vue) + happy-dom

## Public API

`@beusable/react` exports components **and** the following hooks (see `packages/react/src/index.ts`):

| Export | Type | Notes |
|--------|------|-------|
| `useControllableState` | hook | Generic controlled/uncontrolled state. Used internally; also useful for consumers building custom controlled components. |
| `useCountdownTimer` | hook | `m:ss` countdown from a seconds value. Used by TextField internally. |

## Testing Rules (React)

- Test files live next to the component: `packages/react/src/components/<Name>/<Name>.test.tsx`
- Test environment: `happy-dom` (configured in `packages/react/vitest.config.ts`)
- Setup file: `packages/react/src/test/setup.ts` — jest-dom matchers + `scrollIntoView` mock
- Use `@testing-library/user-event` for all interactions. Never dispatch DOM events directly.
- Do not include test files in commits (see `agent_docs/git.md`).
- Run from repo root: `pnpm test`.

## Testing Rules (Vue)

- Test files live next to the component: `packages/vue/src/components/<Name>/<Name>.test.ts`
- Runner: Vitest 2 + `@vue/test-utils` + happy-dom (`packages/vue/vitest.config.ts`)
- Use `wrapper.trigger()` for interactions; `wrapper.emitted('eventName')` to verify emits.
- **`closable` prop required for close button tests**: Pass `closable: true` + `attrs: { onClose: vi.fn() }`. Without `closable`, the button is not rendered.
- **Document-level key events**: `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))` + `await wrapper.vm.$nextTick()`.
- **`element.checked` unreliable in happy-dom**: Use `modelValue` (controlled) instead of `defaultChecked` in tests; check `aria-checked` attribute rather than `.checked` property.
- Do not include test files in commits (see `agent_docs/git.md`).
- Run Vue tests: `pnpm --filter @beusable/vue test`.

## Component Authoring Rules (React)

- Styles must use CSS Modules (`Component.module.css`). Tailwind and inline styles are prohibited.
- Color values use `@beusable/tokens` CSS variables (`var(--color-*)`, `var(--shadow-*)`, `var(--radius-*)`, `var(--font-*)`). Consumers must import `@beusable/tokens/css` to load the `:root` variables. A small number of Snackbar-specific and Button accent colors without token equivalents remain hardcoded.
- Component file location: `packages/react/src/components/<ComponentName>/`
- Story file location: `apps/storybook/stories/components/<ComponentName>.stories.tsx`
- When adding a new component, exporting from `packages/react/src/index.ts` is required.

## Component Authoring Rules (Vue)

- Styles must use external CSS Modules: `<style module src="./<Name>.module.css"></style>`. Inline `<style module>` is prohibited.
- Component file location: `packages/vue/src/components/<ComponentName>/`
- When adding a new component, exporting from `packages/vue/src/index.ts` is required.
- **`closable` prop pattern**: To conditionally show a close button, use an explicit `closable?: boolean` prop. Never check `$attrs.onClose !== undefined` — in Vue 3, `defineEmits(['close'])` strips `onClose` from `$attrs`, making it always `undefined`.
- **Build check**: After adding/modifying a component, run `pnpm --filter @beusable/vue build` and verify `dist/` contains no test `.d.ts` files.

## Figma Integration

- Figma MCP is available (`mcp__claude_ai_Figma__get_design_context`).
- File key: `hREc7djOTwlFT7bgSHIXBE` (00. Component_Beusable_ver01)
- Figma-generated code is for reference only. Always convert to React + CSS Modules patterns.
- Use Figma color values as-is (tokens not yet integrated).

## Figma → CSS Conversion Rules (follow carefully)

### Typography
- **font-family**: Always use **Pretendard Variable**, even if Figma shows Roboto or another font.
- **font-weight**: Cross-check the Figma styles list (H_12_600, P_13_400, etc.) against generated code. Never guess.
- **font-size / line-height / color**: Use exact Figma values. Approximations are not allowed.

### Interactions (hover/active)
- **All interactive elements** must have hover styles. Check color/background in Figma hover variants.

## Implemented Components

### Button (`packages/react/src/components/Button/`)
- 12 variants: `primary` / `primary-outline` / `primary-surface` / `primary-ghost` / `secondary` / `secondary-surface` / `secondary-ghost` / `action` / `action-surface` / `action-ghost` / `accent` / `accent-surface` / `accent-ghost`
- size: `xs` / `s` / `m` / `l`
- shape: `pill` / `rounded`
- props: `loading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon`
- While loading, color is preserved independently of disabled (only pointer-events are blocked)
- action/accent variants: fill-on-hover on hover/pressed (background fills, text turns white)
- transition: 0.3s

### TextField (`packages/react/src/components/TextField/`)
- size: `s` / `m` / `l`
- layout: `vertical` / `horizontal`
- theme: `light` / `dark`
- states: default / focused / error / valid / disabled
- Special types: `type="password"` (eye toggle), timer / timerSeconds (verification countdown), multiline (textarea)
- multiline: character count displayed inline (`(n/max)` format), max-height 400px, no resize
- clearable: X button to reset value. `onClear?: () => void` callback fires when X is clicked
- `showCount?: boolean`: shows live character count `(n/max)` for multiline. Requires `maxLength` to be set

### Dropdown (`packages/react/src/components/Dropdown/`)
- size: `s` / `m` / `l`
- layout: `vertical` / `horizontal`
- variant: `border` / `shadow`
- props: `multiple`, `searchable`, `disabled`, `errorMessage`, `message`
- searchable: switches to input on open + filtering + X button
- shadow variant: box-shadow border (padding: 2px for clipping prevention)
- horizontal layout: label placed on the left
- On hover, blue border is preserved when open (`:not(.open)`)

### Toast (`packages/react/src/components/Toast/`)
- type: `a1` (text + icon, 32px) / `a2` (text only, 32px) / `b` (multiline, auto)
- status: `normal` (white) / `complete` (#68bb0c) / `caution` (#ffd900)
- no separate `negative` prop in the current codebase
- black background, 6px border-radius
- icon: `string` (CSS class name) → renders as `<i className="icon {className}" />`. Falls back to default check SVG if not specified. **Icon area only exists for type `a1`** — `a2` has no icon column
- Icon color changes based on status

### Checkbox (`packages/react/src/components/Checkbox/`)
- size: `s` / `m` / `l`
- color: `primary` (#EC0047) / `secondary` (#2f2f2f) / `action` (#57ab00)
- props: `checked`, `defaultChecked`, `indeterminate`, `disabled`, `label`
- SVG-based custom control (5 states: empty / checked / indeterminate / disabled-checked / disabled-indeterminate)
- checked/indeterminate color controlled via `--selection-color` CSS variable (color prop injected into wrapper style)
- disabled state always uses `#d7d7d7` (ignores color prop)

### Radio (`packages/react/src/components/Radio/`)
- size: `s` / `m` / `l`
- color: `primary` (#EC0047) / `secondary` (#2f2f2f) / `action` (#57ab00)
- props: `checked`, `defaultChecked`, `disabled`, `label`, `name`, `value`
- CSS-based circular control + inner dot
- Selection color controlled via `--selection-color` CSS variable

### Toggle (`packages/react/src/components/Toggle/`)
- size: `m` (52×24px) / `s` (48×22px) / `xs` (28×18px, no-text only)
- props: `checked`, `defaultChecked`, `disabled`, `label`, `showText`
- `showText={false}`: hides ON/OFF text. m size width shrinks from 52px → 36px
- `xs` size: no-text only, knob 14px
- ON: `#57ab00` / OFF: `#d7d7d7` / Hover ON: `#429700` / Hover OFF: `#b1b1b1`
- Disabled ON: `#d4eabd` / Disabled OFF: `#ebebeb`

### Snackbar (`packages/react/src/components/Snackbar/`)
- variant: `notice` (#fce515) / `tip` (#9fce12) / `alert` (#ff9494)
- size: `s` (28px, padding: 4px 8px 4px 4px) / `m` (34px, padding: 4px 10px 4px 8px)
- props: `message`, `actionLabel`, `onAction`, `onClose`, `rounded`, `icon`, `className`, `style`
- s: actionLabel → text link (12px, **weight 600**, px-8px)
  - notice `#f46200` / tip `#57700a` / alert `#8a4343`
  - hover: notice `#ff8400` / tip `#7b9f0e` / alert `#a85555`
- m: actionLabel → white button (w-63px h-28px, border-radius 5px, shadow 0 1px 2px rgba(0,0,0,0.2), font 12px **weight 600** #444)
  - hover: background `#f4f4f4`
- close button: 14×14px (no hover effect)
- spacer margin before close: s=4px, m(no action)=8px, m(with action)=4px

### Tooltip (`packages/react/src/components/Tooltip/`)
- props: `content`, `maxWidth`, `arrow`, `textAlign`, `linkLabel`, `linkHref`, `actionLabel`, `onAction`, `onClose`, `className`, `style`
- arrow: `bottom-left` / `bottom-center` / `bottom-right` / `top-left` / `top-center` / `top-right` / `left` / `right` (8 directions)
- textAlign: `left` / `center` / `justify`
- justify: inner padding 17px, word-break: break-all
- linkLabel + linkHref: blue link (#0074ff) + external link icon, underline on hover
- actionLabel: bottom-right button, #ec0047 color, hover background rgba(236,0,71,0.06)
- onClose: top-right × button 14×14px (no hover effect)
- wrapper: bg #fff, border-radius 8px, padding 17px 21px, box-shadow 0 8px 16px rgba(0,0,0,0.16) + 0 0 0 1px rgba(0,0,0,0.16)

### Table (`packages/react/src/components/Table/`)
- props: `columns`, `data`, `sortKey`, `sortOrder`, `onSort`, `headerTone`, `headerHeight`, `rowHeight`, `headerSideCaps`, `stickyColumnHeaders`, `stickySelectable`, `showStickyShadows`, `selectable`, `rowKey`, `selectedRowKeys`, `defaultSelectedRowKeys`, `onSelectedRowKeysChange`
- `TableColumn` supports `sticky`, `headerDepth`, `headerBg`, `render`
- headerTone: `dark` (#333 background, white text) / `light` (white background, border-bottom 1px #bbb, #777 text)
- `headerTone="dark"` automatically activates `headerSideCaps`
- headerSideCaps: rounded outer corners on the header row
- stickyColumnHeaders: array of column labels to pin horizontally. Alternatively set `sticky: true` on `TableColumn`
- stickySelectable: pins the selection checkbox column as sticky
- showStickyShadows: shows sticky column boundary shadow (default `true`). 4px default, expands to 12px on scroll. Positioned at right edge of sticky area
- selectable: reuses Checkbox component. Selection color hardcoded to `#EC0047`
- rowKey: `keyof T` or `(row, rowIndex) => string | number`. Defaults to rowIndex if not specified
- controlled/uncontrolled: determined by whether `selectedRowKeys` is provided
- TableColumn.headerDepth: `'default'` | `'muted'` — muted applies #555 background (dark tone only)
- TableColumn.headerBg: custom highlight color applied on hover and when column is the active sort column. Transition: 0.3s
- Sort icon: 16×20 SVG (same size for inactive/active)
  - inactive: no background rect, both arrows at opacity 0.3
  - active dark: rect `fill #272727`, `stroke rgba(255,255,255,0.16)`
  - active light: rect `fill #FFF`, `stroke rgba(34,34,34,0.16)`
  - active direction opacity 1.0 / inactive direction opacity 0.3
- headerLabel: `padding-block: 2px`, font 13px/500
- bodyCell: padding 12px, border-bottom 1px solid #ebebeb
- cellText: font 13px/400/#444, overflow ellipsis

### Modal (`packages/react/src/components/Modal/`)
Sub-components: `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalDivider`, `ModalButtons`, `ModalPopup`
- Modal: fixed overlay (rgba 0,0,0,0.5) + white container (border-radius 14px). onClose fires on overlay click
  - props: `open`, `onClose`, `width`, `className`, `style`
  - **max-height: 720px** (global constraint)
- ModalHeader: `closeSize` prop splits sm(16px)/lg(24px). Supports 6 Figma patterns
  - props: `title`, `description`, `onClose`, `closeSize`, `textAlign`, `titleSize`, `step`, `icon`, `action`
  - Type 1: close only / Type 2: title+close / Type 3: title+desc+close / Type 4: step+close / Type 5: icon+divider+body+close / Type 6: center+large title
  - sm: close button in separate top row (pt:12px pr:12px) / lg: close button in same row as title (pt:12px pr:12px)
- ModalBody: padding 24px 28px 0, overflow-y auto, gap 12px
  - `fadeout` prop: shows 12px gradient overlay — top (white) / bottom (black 6%) — when scrolling
- ModalDivider: 1px #d7d7d7, margin 12px 28px 0
- ModalFooter: padding 24px 0, supports 4 Figma types
  - props: `children` (center buttons), `checkbox` (consent checkbox row), `leftAction` (Back button etc.)
  - Button row: 3-column layout (leftAction | center buttons | spacer), padding 0 24px
  - Type 1: checkbox + Cancel/Confirm (with divider) / Type 2: checkbox + Back/Next (with divider) / Type 3: Back/Next only / Type 4: empty
- ModalButtons: for B-type Popup only (gap 4px, justify-content center). Not needed when using ModalFooter
- ModalPopup: B-type container (padding: 48px 48px 24px, flex-col, align-items center, gap 12px)
  - props: `narrow` — reduces horizontal padding to 28px (for B-3 Prompt)
- Recommended widths by type: Type A 526px / Type B 428px / Type C 600px / Type D 720px
- close button: sm=16×16px / lg=24×24px (no hover effect)

### Slider (`packages/react/src/components/Slider/`)
- variant: `extended` (±아이콘 포함) / `simplified` (트랙만)
- props: `value`, `defaultValue`, `min`, `max`, `step`, `disabled`, `onChange`
- Container: height 30px, bg white, border-radius 5px, box-shadow
- Extended: padding 6px, icon 12px (#888), gap 6px to track
- Simplified: padding 12px
- Track: height 4px, bg #d7d7d7, border-radius 2px, box-shadow inset 0 1px 1px rgba(0,0,0,0.15)
- Handle: 11px circle, white fill, border 1px solid rgba(0,0,0,0.16), drop-shadow
- Hover: track #b1b1b1, handle border darker, icon #666
- Native `<input type="range">` (opacity 0) for accessibility + keyboard support

### Tabs / Segment Control (`packages/react/src/components/Tabs/`)
4 sub-components exported from single directory:

**SegmentControl** — Flat segmented control
- size: `s` (30px) / `m` (36px, with icons)
- Each item: border 1px #e0e0e0, margin-left -1px (border overlap pattern)
- First item: border-radius 7px 0 0 7px / Last: 0 7px 7px 0
- Selected: bg #ec0047, text white, inset shadow 0 2px 4px rgba(0,0,0,0.35), z-index 10
- selectedBg uses inset -1px to cover neighbor borders
- Font: 13px/600 (s), 13px/500 (m)

**TabBar** — Underline tabs
- Selected: text #2f2f2f, bottom bar 3px #ec0047
- Unselected: text #999, no bar
- Gap: 40px, padding-top 16px, font 18px/600

**TabPill** — Rounded capsule tabs
- Container: bg white, border 1px #e0e0e0, border-radius 20px, padding-right 8px
- Item: height 38px, border-radius 20px, margin-right -8px (overlap)
- Selected: bg #ec0047, text white, shadow 0 12px 10px -4px rgba(0,0,0,0.2)
- Unselected: text #888
- No transition (instant switch)
- withIcon: width 94px, 13px/500 / textOnly: auto width, 14px/500

**TabCard** — Card navigation
- 76×76px cards, gap 4px, border-radius 8px
- Color: primary (border #ec0047) / accent (border #0085ff)
- Hover: bg fills with border color, text white, ::after overlay rgba(0,0,0,0.06)
- Font: 15px/600, arrow icon 16px below label

### DatePicker (`packages/react/src/components/DatePicker/`, `packages/vue/src/components/DatePicker/`)
- mode: `single` / `range`
- months: `1` / `2` (range defaults to 2, single defaults to 1)
- variant: `a` (calendar icon trigger, 238px) / `b` (spinbox trailing icon, 212px) / `c` (borderless minimal, 244px)
- role: `start` / `end` — shifts selected-date highlight direction for paired pickers
- props: `value`/`defaultValue`/`onChange` (React) · `modelValue`/`update:modelValue` (Vue), `timezone`, `minDate`, `maxDate`, `disabledDate`, `maxRangeMonths`, `disabled`, `label`, `errorMessage`, `message`, `nonstopAnalysis`/`onNonstopAnalysisChange`
- timezone: IANA identifier. Falls back to browser timezone when omitted
- range flow: click start → hover preview → click end → (2-month mode) Apply to commit
- 1-month range: end click commits immediately, no Apply button
- single: closes on selection; Nonstop analysis checkbox shown at popup bottom
- dependencies: `date-fns ^4.1.0`, `date-fns-tz ^3.2.0`
- JS/TS compatible: ships compiled ESM/CJS — usable without TypeScript

## Planned Work

- `@beusable/icons` — shared SVG icon package (eliminate React/Vue duplication)
- Vue Storybook stories (currently 0% coverage)
