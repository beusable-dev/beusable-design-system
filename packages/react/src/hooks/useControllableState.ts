import { useCallback, useRef, useState } from 'react';

/**
 * controlled/uncontrolled 상태를 통합 관리하는 훅.
 *
 * - `value`가 전달되면 controlled 모드: 외부 상태를 그대로 사용합니다.
 * - `value`가 undefined면 uncontrolled 모드: 내부 state로 관리합니다.
 * - 두 모드 모두 `onChange`를 호출합니다.
 *
 * @example
 * const [checked, setChecked] = useControllableState(
 *   props.checked,
 *   props.defaultChecked ?? false,
 *   props.onChange,
 * );
 *
 * @param value - controlled 모드에서 외부가 내려주는 현재 값.
 * @param defaultValue - uncontrolled 모드에서 사용할 초기 값.
 * @param onChange - 값이 바뀔 때 두 모드 공통으로 호출할 콜백.
 * @returns 현재 값과 다음 값을 반영하는 setter 튜플.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  // controlled → uncontrolled 전환 경고 (개발 환경 한정)
  const wasControlled = useRef(isControlled);
  if (process.env.NODE_ENV !== 'production') {
    if (wasControlled.current !== isControlled) {
      console.warn(
        '[useControllableState] ' +
          (isControlled
            ? 'uncontrolled → controlled 전환이 감지됐습니다.'
            : 'controlled → uncontrolled 전환이 감지됐습니다.') +
          ' 컴포넌트 수명 동안 모드를 바꾸지 마세요.',
      );
    }
    wasControlled.current = isControlled;
  }

  /**
   * 다음 값을 반영한다.
   *
   * controlled 모드에서는 내부 state를 건드리지 않고 `onChange`만 호출하고,
   * uncontrolled 모드에서는 내부 state와 `onChange`를 함께 갱신한다.
   *
   * @param next - 새로 반영할 값.
   */
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [isControlled ? (value as T) : internalValue, setValue];
}
