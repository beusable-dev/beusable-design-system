# @beusable/react

React 18 component library for the Beusable Design System.

## Installation

```bash
npm install @beusable/react @beusable/tokens
# or
pnpm add @beusable/react @beusable/tokens
```

> **`@beusable/tokens` is required.** Components use CSS variables defined by the tokens package.

## Setup

Import the token CSS variables once at your app entry point:

```ts
import '@beusable/tokens/css';
```

## Usage

```tsx
import { Button, TextField, Dropdown } from '@beusable/react';
import '@beusable/tokens/css';

// Button
<Button variant="primary" size="m">저장</Button>
<Button variant="action-surface" loading>처리 중</Button>

// TextField
<TextField label="이메일" placeholder="example@beusable.com" />
<TextField label="비밀번호" type="password" />
<TextField label="내용" multiline rows={4} maxLength={100} showCount />

// Dropdown
<Dropdown
  label="카테고리"
  options={[{ value: 'a', label: '옵션 A' }]}
  placeholder="선택하세요"
/>
```

## Components

| Component | Description |
|-----------|-------------|
| `Button` | 12 variants, 4 sizes, loading/disabled support |
| `TextField` | Input/textarea, password, timer, clearable |
| `Dropdown` | Single/multiple select, searchable |
| `Checkbox` | 3 sizes, 3 colors, indeterminate support |
| `Radio` | 3 sizes, 3 colors |
| `Toggle` | 3 sizes, showText option |
| `Toast` | 3 types (a1/a2/b), 3 status variants |
| `Snackbar` | 3 variants, 2 sizes, action/close buttons |
| `Tooltip` | 8 arrow directions, link/action/close |
| `Modal` | Sub-components: Header, Body, Footer, Popup |
| `Table` | Sorting, selection, sticky columns |
| `Slider` | Extended/simplified variants |
| `Tabs` | TabBar, TabPill, TabCard, SegmentControl |

## Peer Dependencies

```json
{
  "react": ">=17",
  "react-dom": ">=17"
}
```

## Token Integration

Components use CSS custom properties from `@beusable/tokens`. Consumers **must** import the token stylesheet:

```ts
// CSS Variables (recommended)
import '@beusable/tokens/css';

// SCSS
@use '@beusable/tokens/scss' as *;
```

## Hooks (Public API)

| Hook | Description |
|------|-------------|
| `useControllableState` | Generic controlled/uncontrolled state management |
| `useCountdownTimer` | `m:ss` countdown from a seconds value |

## License

MIT
