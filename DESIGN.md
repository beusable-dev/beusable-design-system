# Beusable Design System

This file is the AI-facing summary of the Beusable design system for this repository.

It is not the source of truth.

Source of truth order:

1. Figma specs
2. `packages/tokens/src/*`
3. implemented component code in `packages/react` and `packages/vue`
4. Storybook stories in `apps/storybook`

If this file conflicts with Figma, tokens, or component code, follow those sources and update this file later.

## 1. Project Scope

Use this design system when building UI for the Beusable product family.

This repo provides:

- shared tokens via `@beusable/tokens`
- React 18 components via `@beusable/react`
- Vue 3 components via `@beusable/vue`
- Storybook docs via `apps/storybook`

Current exported React/Vue surface includes:

- Button
- TextField
- Dropdown
- Checkbox
- Radio
- Toggle
- Toast
- Snackbar
- Tooltip
- Modal
- Table
- Slider
- Tabs
- DatePicker

For app code, prefer composing existing components over inventing new primitives.

## 2. Core Rules

- Use `Pretendard Variable` as the default UI font family unless Figma explicitly shows another approved family.
- Do not invent colors, spacing scales, radii, shadows, or component variants.
- Do not add props or states that are not already present in component code or Figma.
- Prefer token values and existing component APIs over custom CSS.
- Keep React and Vue behavior visually aligned.
- If an exact spacing rule is unclear, verify in Figma. This repo does not currently expose a canonical spacing token file.

## 3. Token Setup

Components depend on token CSS variables.

Import once at app entry:

```ts
import '@beusable/tokens/css';
```

Optional token outputs:

- CSS variables: `@beusable/tokens/css`
- SCSS: `@beusable/tokens/scss`
- JS/TS exports: `@beusable/tokens/js`

## 4. Color System

### Brand

Primary brand color:

- `#EC0047` = `ColorBrand500`

Useful adjacent brand steps:

- `#FF1553` = `ColorBrand400`
- `#C6003B` = `ColorBrand600`
- `#8D002A` = `ColorBrand800`

### Neutral / Grayscale

Common UI neutrals:

- `#FFFFFF` = white
- `#F4F4F4`
- `#EBEBEB`
- `#E6E6E6`
- `#D7D7D7`
- `#BBBBBB`
- `#888888`
- `#555555`
- `#444444`
- `#2F2F2F` = primary dark text
- `#111111`
- `#000000`

Common alpha neutrals:

- `rgba(0,0,0,0.06)`
- `rgba(0,0,0,0.08)`
- `rgba(0,0,0,0.12)`
- `rgba(0,0,0,0.16)`
- `rgba(0,0,0,0.24)`
- `rgba(255,255,255,0.08)`
- `rgba(255,255,255,0.12)`
- `rgba(255,255,255,0.16)`

### Semantic Accent Colors Used in Components

These are the component-level accent colors that recur across the system:

- Brand / primary: `#EC0047`
- Secondary / dark: `#2F2F2F`
- Action / positive: `#57AB00`
- Accent / blue: `#0085FF`
- Focus border: `#0096FF`
- Error: `#E60724`

### Usage Guidance

- Use brand red for the main emphasis path.
- Use dark gray for secondary emphasis and neutral actions.
- Use green for action/positive flows.
- Use blue for accent or focused utility states where the existing components already use it.
- Avoid introducing new accent families unless they already exist in tokens or Figma.

## 5. Typography

### Font Families

- Default UI: `'Pretendard Variable', sans-serif`
- Japanese UI: `'Pretendard JP Variable', sans-serif`
- Alternate display family exists: `'rubrik-new', sans-serif`

### Font Weights

- Regular: `400`
- Medium: `500`
- Semibold: `600`
- Bold: `700`

### Size Scale

Display sizes:

- `100px`, `80px`, `68px`, `60px`, `48px`, `44px`, `42px`

Heading sizes:

- `40px`, `36px`, `30px`, `26px`, `24px`, `22px`, `20px`, `18px`, `16px`, `15px`, `14px`, `13px`, `12px`, `11px`

Paragraph sizes:

- `18px`, `16px`, `14px`, `13px`, `12px`, `11px`, `10px`

### Line Height

- `1` for display or one-line text
- `1.2` for headlines, labels, nav
- `1.5` for paragraphs and descriptive content

### Letter Spacing

Available values:

- `0px`
- `-0.3px`
- `-0.5px`
- `-0.8px`
- `-1px`

### Typography Guidance

- Most product UI should stay in the `11px` to `18px` range.
- Use tighter line height for compact controls and labels.
- Use relaxed line height for multi-line body text, messages, and descriptions.
- Do not switch to arbitrary font stacks like Inter or system-ui unless the source spec explicitly requires it.

## 6. Radius

### Button Radius

- `2px`
- `3px`
- `4px`
- `5px`
- `6px`
- `8px`
- `999px` for pill shapes

### Panel Radius

- `8px`
- `10px`
- `12px`

### Graphic Radius

- `14px`
- `20px`
- `34px`

### Radius Guidance

- Buttons are generally pill or softly rounded.
- Panels and navigation surfaces use restrained medium radii, not oversized rounding.
- Graphic and content-heavy surfaces can use larger radii when already established in Figma.

## 7. Shadow System

Representative shadows:

- Button disabled: `0 1px 2px 0 rgba(0,0,0,0.08)`
- Button xs: `0 1px 2px 0 rgba(0,0,0,0.2)`
- Button s: `0 5px 6px -2px rgba(0,0,0,0.16)`
- Button m: `0 20px 16px -12px rgba(0,0,0,0.12)`
- Panel xxs: `0 2px 4px -2px rgba(0,0,0,0.2)`
- Panel xs: `0 2px 4px -2px rgba(0,0,0,0.32)`
- Panel s: `0 8px 12px -6px rgba(0,0,0,0.12)`
- Panel xl: `0 20px 38px -10px rgba(0,0,0,0.32)`
- Popup m: `0 8px 14px 0 rgba(0,0,0,0.16)`
- Tooltip s: `0 8px 14px -2px rgba(0,0,0,0.08)`

Special shadows:

- inner xs: `inset 0 1px 3px 0 rgba(0,0,0,0.32)`
- bevel normal: `1px 1px 3px 0 rgba(0,0,0,0.25), -1px -1px 3px 0 rgba(255,255,255,0.75)`
- bevel pressed: `inset -1px -1px 2px 0 rgba(255,255,255,0.85), inset 1px 1px 2px 0 rgba(0,0,0,0.35)`

Guidance:

- Shadows are real and structured, but not soft marketing glows.
- Prefer existing token shadows over custom `box-shadow` values.

## 8. Component Patterns

### Button

Available variants:

- `primary`
- `primary-outline`
- `primary-surface`
- `primary-ghost`
- `secondary`
- `secondary-surface`
- `secondary-ghost`
- `action`
- `action-surface`
- `action-ghost`
- `accent`
- `accent-surface`
- `accent-ghost`

Available sizes:

- `xs`
- `s`
- `m`
- `l`

Available shapes:

- `pill`
- `rounded`

Built-in states:

- default
- disabled
- loading
- full width
- icon left/right
- icon-only

Guidance:

- Use `primary` for the dominant CTA.
- Use `*-surface` when the UI already uses elevated white surfaces.
- Use `*-ghost` for low-emphasis text actions.
- Do not invent extra button colors.

### TextField

Available sizes:

- `s`
- `m`
- `l`

Available layouts:

- `vertical`
- `horizontal`

Available themes:

- `light`
- `dark`

Supported behaviors:

- input
- textarea via `multiline`
- password visibility toggle
- clearable input
- valid state
- error state
- helper message
- timer string or countdown
- character counter

Guidance:

- Use `light` as default unless the surrounding surface clearly uses the dark style.
- Use built-in `errorMessage`, `message`, `valid`, and `timer` props instead of custom suffix content.
- Keep label layout consistent within a form section.

### Dropdown

Available sizes:

- `s`
- `m`
- `l`

Available variants:

- `border`
- `shadow`

Supported behaviors:

- single select
- multiple select
- searchable
- vertical or horizontal label layout
- error and helper message

Guidance:

- Use `border` as the default form style.
- Use `shadow` only where the surrounding design already uses shadow-type inputs.

### Checkbox / Radio / Toggle

Checkbox and Radio sizes:

- `s`
- `m`
- `l`

Selection colors:

- `primary`
- `secondary`
- `action`

Toggle sizes:

- `m`
- `s`
- `xs`

Toggle options:

- `showText={true|false}`

Guidance:

- Keep selection controls on the existing three-color system.
- Use `xs` toggle only when `showText={false}`.

### Tabs

Available tab families:

- `SegmentControl`
- `TabBar`
- `TabPill`
- `TabCard`

Guidance:

- Choose from existing tab families before designing a new navigation pattern.
- Preserve the semantics of each family instead of mixing styles.

### DatePicker

Available variants:

- `a`
- `b`
- `c`

Available modes:

- `single`
- `range`

Supported behaviors:

- 1 or 2 month display
- timezone-aware formatting
- min/max date
- max range months
- disabled dates
- placeholder, message, error state

Guidance:

- Prefer range mode for analysis/reporting contexts.
- Use built-in constraints instead of ad hoc validation UI.

### Toast

Available:

- types: `a1`, `a2`, `b`
- status: `normal`, `complete`, `caution`

Key states:

- single-line confirmation
- single-line notice
- multi-line message via `description`
- custom icon class for `a1`

Use when:

- short transient feedback is needed
- `b` type is needed for message + description stacking

Do not:

- invent extra status colors
- replace `description` layouts with ad hoc custom markup unless the existing Toast surface cannot express it

### Snackbar

Available:

- variants: `notice`, `tip`, `alert`
- sizes: `s`, `m`
- optional `actionLabel`
- optional `rounded={false}`

Key states:

- dismiss-only
- dismiss + action
- compact single-line
- longer medium message

Use when:

- system feedback needs stronger persistence than a toast
- a secondary action like `Detail` is appropriate

Do not:

- use Snackbar where Toast is enough
- add new snackbar severity names outside the current three

### Tooltip

Available:

- plain text content
- close action
- secondary action button
- link CTA
- text alignment control
- arrows: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`, `left`, `right`

Key states:

- text-only
- closable
- actionable
- linked
- key/value content blocks

Use when:

- contextual help or metric explanation is needed inline
- compact structured content is enough without opening a modal

Do not:

- turn Tooltip into a full dialog
- create new arrow semantics when an existing placement already fits

### Modal

Available building blocks:

- `Modal`
- `ModalHeader`
- `ModalBody`
- `ModalFooter`
- `ModalDivider`
- `ModalButtons`
- `ModalPopup`

Key states:

- content modal
- scrollable content modal with `fadeout`
- confirmation popup
- alert popup

Use when:

- content is too large or important for tooltip/snackbar patterns
- footer actions or checkbox confirmation are needed
- popup-style confirmation should use the existing `ModalPopup` composition

Do not:

- rebuild modal chrome manually
- ignore existing header/body/footer composition when the current subcomponents already match the need

### Table

Available:

- sortable columns
- selectable rows
- configurable `headerTone`
- configurable `headerHeight`
- configurable `rowHeight`
- optional header side caps
- custom cell renderers

Key states:

- dark header variants
- 40/40, 52/48, 56/88 density patterns in Storybook
- two-line custom cells
- row selection

Use when:

- dense operational data needs consistent header and row behavior
- sorting and selection should follow the current table surface

Do not:

- introduce a new table visual language for basic admin/data views
- hardcode custom row selection color outside the existing Beusable selection system

### Slider

Available:

- variants: `extended`, `simplified`
- controlled and uncontrolled usage
- custom `min`, `max`, `step`
- disabled state

Key states:

- compact slider with buttons via `extended`
- track-focused slider via `simplified`
- narrow and wide width usage

Use when:

- a bounded numeric adjustment is needed
- plus/minus affordance is useful in tight UI with `extended`

Do not:

- create a third slider style without first proving `extended` or `simplified` cannot cover the case

## 9. Layout and Spacing Guidance

There is no exported spacing token JSON in this repo at the moment.

Therefore:

- derive spacing from Figma first
- reuse spacing already present in nearby components
- prefer compact, product-style control spacing over airy marketing spacing
- do not invent a new global spacing scale in code

When unsure, keep density moderate and align with existing form, modal, and table layouts.

## 10. Implementation Rules for AI Agents

- Reuse existing components before writing new ones.
- Reuse existing props before adding new props.
- Prefer token CSS variables and existing CSS Modules.
- In React, use the existing controlled/uncontrolled patterns.
- In Vue, keep parity with React behavior and visual states.
- Keep icons inline and inherit color via `currentColor`.
- Do not replace Beusable colors with generic Tailwind or system palettes.

## 11. Anti-Patterns

- Do not use generic system-ui or Inter by default.
- Do not introduce purple-heavy AI aesthetics unless explicitly required by source material.
- Do not create new semantic colors because they “look close enough”.
- Do not add oversized radii or soft glossy shadows that are not in tokens.
- Do not build a new button, input, or tab style if an existing one already fits.
- Do not treat this file as permission to ignore Figma measurements.
- Do not assume spacing values that are not defined in code or Figma.

## 12. Quick Start Prompts for AI

Use these working assumptions when implementing UI in this repo:

- "Use existing `@beusable/react` or `@beusable/vue` components first."
- "Import `@beusable/tokens/css` and follow Beusable token colors and typography."
- "Default to `Pretendard Variable`."
- "Use `#EC0047` as the primary brand color and `#2F2F2F` as the primary dark neutral."
- "Do not invent new component variants, spacing scales, or accent colors."
- "If a value is not present in tokens or component code, verify it in Figma."
