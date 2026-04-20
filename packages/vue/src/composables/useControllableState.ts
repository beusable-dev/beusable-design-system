import { ref, computed, type Ref } from 'vue';

/**
 * controlled/uncontrolled 상태를 통합 관리하는 composable.
 *
 * - valueProp() 이 undefined 가 아니면 controlled 모드: 외부 값을 그대로 사용합니다.
 * - valueProp() 이 undefined 면 uncontrolled 모드: 내부 ref 로 관리합니다.
 * - 두 모드 모두 onChange 를 호출합니다.
 *
 * @param valueProp  props 에서 가져오는 getter (controlled 값)
 * @param defaultValue  uncontrolled 초기값
 * @param onChange  값 변경 콜백
 *
 * @example
 * const { value, setValue } = useControllableState(
 *   () => props.checked,
 *   props.defaultChecked ?? false,
 *   (v) => emit('update:modelValue', v),
 * );
 */
export function useControllableState<T>(
  valueProp: () => T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): { value: Ref<T>; setValue: (next: T) => void } {
  const internalValue = ref<T>(defaultValue) as Ref<T>;
  const isControlled = computed(() => valueProp() !== undefined);

  const value = computed({
    get: () => (isControlled.value ? (valueProp() as T) : internalValue.value),
    set: (next: T) => {
      if (!isControlled.value) {
        internalValue.value = next;
      }
      onChange?.(next);
    },
  }) as Ref<T>;

  function setValue(next: T) {
    if (!isControlled.value) {
      internalValue.value = next;
    }
    onChange?.(next);
  }

  return { value, setValue };
}
