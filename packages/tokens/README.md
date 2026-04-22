# @beusable-dev/tokens

Beusable Design System용 디자인 토큰 패키지입니다. 색상, 타이포그래피, radius, shadow 토큰을 CSS 변수, SCSS 변수, JS/TS 형태로 제공합니다.

## 설치

```bash
npm install @beusable-dev/tokens
# or
pnpm add @beusable-dev/tokens
```

## 제공 형식

| Export | 설명 |
|--------|------|
| `@beusable-dev/tokens/css` | CSS 변수 파일 (`dist/css/variables.css`) |
| `@beusable-dev/tokens/scss` | SCSS 변수 파일 (`dist/scss/_tokens.scss`) |
| `@beusable-dev/tokens/fonts` | Pretendard 폰트 CSS (`dist/css/fonts.css`) |
| `@beusable-dev/tokens` | JS/TS 토큰 객체 export |
| `@beusable-dev/tokens/js` | JS 토큰 객체 export |

## CSS 변수 사용

앱 엔트리나 전역 스타일에서 CSS 변수 파일을 import 해서 사용할 수 있습니다.

```ts
import '@beusable-dev/tokens/css';
```

필요하면 폰트 CSS도 함께 import 합니다.

```ts
import '@beusable-dev/tokens/fonts';
```

이후 컴포넌트나 스타일에서 CSS 변수를 사용할 수 있습니다.

```css
.button {
  color: var(--color-text-default);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-01);
}
```

## SCSS 변수 사용

SCSS 환경에서는 토큰 파일을 직접 불러와 사용할 수 있습니다.

```scss
@use '@beusable-dev/tokens/scss' as *;

.button {
  color: $color-text-default;
  border-radius: $radius-m;
}
```

## JS/TS 사용

토큰 값을 JavaScript나 TypeScript에서도 import 할 수 있습니다.

```ts
import * as tokens from '@beusable-dev/tokens';

console.log(tokens.colorBrandPrimary);
console.log(tokens.radiusM);
```

## 포함 토큰

현재 패키지는 아래 토큰 소스를 기반으로 빌드됩니다.

- `color.json`
- `typography.json`
- `radius.json`
- `shadow.json`

## 빌드

Style Dictionary 기반으로 `dist/` 산출물을 생성합니다.

```bash
pnpm --filter @beusable-dev/tokens build
```

빌드 결과물:

- `dist/css/variables.css`
- `dist/css/fonts.css`
- `dist/scss/_tokens.scss`
- `dist/js/index.mjs`
- `dist/js/index.cjs`
- `dist/js/index.d.ts`

## License

MIT
