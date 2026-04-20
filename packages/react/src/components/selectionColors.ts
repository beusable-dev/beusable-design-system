/**
 * Checkbox / Radio 공통 색상 맵.
 * `--selection-color` CSS 변수에 주입되는 값입니다.
 */
export type SelectionColor = 'primary' | 'secondary' | 'action';

export const SELECTION_COLOR_MAP: Record<SelectionColor, string> = {
  primary: '#EC0047',
  secondary: '#2f2f2f',
  action: '#57ab00',
};
