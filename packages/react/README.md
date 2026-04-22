# @beusable-dev/react

React 18 component library for the Beusable Design System.

## Installation

```bash
npm install @beusable-dev/react @beusable-dev/tokens
# or
pnpm add @beusable-dev/react @beusable-dev/tokens
```

> **`@beusable-dev/tokens` is required.** Components use CSS variables defined by the tokens package.

## Setup

Import the token CSS variables once at your app entry point:

```ts
import '@beusable-dev/tokens/css';
```

## Usage

```tsx
import { BeButton, BeTextField, BeDropdown } from '@beusable-dev/react';
import '@beusable-dev/tokens/css';

// Button
<BeButton variant="primary" size="m">저장</BeButton>
<BeButton variant="action-surface" loading>처리 중</BeButton>

// TextField
<BeTextField label="이메일" placeholder="example@beusable.com" />
<BeTextField label="비밀번호" type="password" />
<BeTextField label="내용" multiline rows={4} maxLength={100} showCount />

// Dropdown
<BeDropdown
  label="카테고리"
  options={[{ value: 'a', label: '옵션 A' }]}
  placeholder="선택하세요"
/>
```

## Components

| Component | Description |
|-----------|-------------|
| `BeButton` | 13 variants, 4 sizes, loading/disabled support |
| `BeTextField` | Input/textarea, password, timer, clearable |
| `BeDropdown` | Single/multiple select, searchable |
| `BeCheckbox` | 3 sizes, 3 colors, indeterminate support |
| `BeRadio` | 3 sizes, 3 colors |
| `BeToggle` | 3 sizes, showText option |
| `BeToast` | 3 types (a1/a2/b), 3 status variants |
| `BeSnackbar` | 3 variants, 2 sizes, action/close buttons |
| `BeTooltip` | 8 arrow directions, link/action/close |
| `BeModal` | Sub-components: Header, Body, Footer, Popup |
| `BeTable` | Sorting, selection, sticky columns |
| `BeSlider` | Extended/simplified variants |
| `BeTabs family` | BeTabBar, BeTabPill, BeTabCard, BeSegmentControl |

## Peer Dependencies

```json
{
  "react": ">=17",
  "react-dom": ">=17"
}
```

## Token Integration

Components use CSS custom properties from `@beusable-dev/tokens`. Consumers **must** import the token stylesheet:

```ts
// CSS Variables (recommended)
import '@beusable-dev/tokens/css';

// SCSS
@use '@beusable-dev/tokens/scss' as *;
```

## Hooks (Public API)

| Hook | Description |
|------|-------------|
| `useControllableState` | Generic controlled/uncontrolled state management |
| `useCountdownTimer` | `m:ss` countdown from a seconds value |

## License

MIT
