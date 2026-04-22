# @beusable-dev/vue

Beusable Design System용 Vue 3 컴포넌트 라이브러리입니다.

## 설치

```bash
npm install @beusable-dev/vue @beusable-dev/tokens
# or
pnpm add @beusable-dev/vue @beusable-dev/tokens
```

> **`@beusable-dev/tokens`는 필수입니다.** 컴포넌트는 토큰 패키지의 CSS 변수를 사용합니다.

## 설정

앱 엔트리에서 컴포넌트 스타일시트와 토큰 CSS 변수를 한 번만 import 합니다:

```ts
import '@beusable-dev/vue/style.css';
import '@beusable-dev/tokens/css';
```

## 사용 예시

```vue
<script setup lang="ts">
import { BeButton, BeTextField, BeDropdown } from '@beusable-dev/vue';
import '@beusable-dev/vue/style.css';
import '@beusable-dev/tokens/css';

const options = [{ value: 'a', label: '옵션 A' }];
</script>

<template>
  <BeButton variant="primary" size="m">저장</BeButton>
  <BeTextField label="이메일" placeholder="example@beusable.com" />
  <BeDropdown
    label="카테고리"
    :options="options"
    placeholder="선택하세요"
  />
</template>
```

## 컴포넌트

| Component | Description |
|-----------|-------------|
| `BeButton` | 13개 variant, 4개 size, loading/disabled 지원 |
| `BeTextField` | input/textarea, password, timer, clearable 지원 |
| `BeDropdown` | 단일/다중 선택, 검색 지원 |
| `BeCheckbox` | 3개 size, 3개 color, indeterminate 지원 |
| `BeRadio` | 3개 size, 3개 color 지원 |
| `BeToggle` | 3개 size, showText 옵션 지원 |
| `BeToast` | 3개 타입(a1/a2/b), 3개 상태 variant 지원 |
| `BeSnackbar` | 3개 variant, 2개 size, action/close 버튼 지원 |
| `BeTooltip` | 8개 화살표 방향, link/action/close 지원 |
| `BeModal` | Header, Body, Footer, Popup 등 하위 컴포넌트 포함 |
| `BeTable` | 정렬, 선택, sticky column 지원 |
| `BeSlider` | extended/simplified variant 지원 |
| `BeTabs family` | BeTabBar, BeTabPill, BeTabCard, BeSegmentControl |
| `BeDatePicker` | 단일/범위 선택과 날짜/타임존 유틸리티 지원 |

## Peer Dependencies

```json
{
  "vue": ">=3.3"
}
```

## 토큰 연동

컴포넌트는 `@beusable-dev/tokens`의 CSS 커스텀 프로퍼티를 사용합니다. 사용하는 앱에서 컴포넌트와 토큰 스타일시트를 반드시 import 해야 합니다:

```ts
import '@beusable-dev/vue/style.css';
import '@beusable-dev/tokens/css';
```

```scss
@use '@beusable-dev/tokens/scss' as *;
```

## Composables (Public API)

| Composable | Description |
|------------|-------------|
| `useControllableState` | controlled/uncontrolled 상태를 공통 방식으로 관리 |
| `useCountdownTimer` | 초 단위 값을 `m:ss` 형식으로 카운트다운 |

## 타입 export

패키지는 `BeTable`, `BeDatePicker` 같은 복합 컴포넌트에서 사용하는 타입도 함께 export 합니다.

## License

MIT
