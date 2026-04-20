import { useControllableState } from '../../hooks/useControllableState';
import type { DropdownOption } from './Dropdown';

interface UseDropdownSelectionOptions {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple: boolean;
  options: DropdownOption[];
  placeholder: string;
}

/**
 * Dropdown의 선택 값과 트리거 표시 문자열을 일관된 형태로 계산한다.
 *
 * single/multiple 모드 차이를 이 훅 안에서 흡수해 컴포넌트는
 * 선택 상태 렌더링과 이벤트 연결에만 집중할 수 있게 한다.
 *
 * @param options - 선택 동작과 표시 문자열 계산에 필요한 옵션 목록.
 * @param value - controlled 모드에서 사용하는 현재 값.
 * @param defaultValue - uncontrolled 모드에서 사용하는 초기 값.
 * @param onChange - 선택 값이 바뀔 때 호출할 콜백.
 * @param multiple - 다중 선택 여부.
 * @param placeholder - 선택 값이 없을 때 트리거에 표시할 문구.
 * @returns 현재 선택 값, 파생된 표시 문자열, 선택/초기화 액션 집합.
 */
export function useDropdownSelection({
  value,
  defaultValue,
  onChange,
  multiple,
  options,
  placeholder,
}: UseDropdownSelectionOptions) {
  const [currentValue, setCurrentValue] = useControllableState<string | string[]>(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onChange,
  );

  const selectedValues: string[] = multiple
    ? Array.isArray(currentValue)
      ? currentValue
      : currentValue
      ? [currentValue as string]
      : []
    : [];

  const selectedSingle = multiple ? '' : (currentValue as string) ?? '';

  const triggerLabel = multiple
    ? selectedValues.length
      ? selectedValues.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')
      : placeholder
    : selectedSingle
    ? options.find((o) => o.value === selectedSingle)?.label ?? selectedSingle
    : placeholder;

  const isPlaceholder = multiple ? selectedValues.length === 0 : !selectedSingle;

  /**
   * 옵션 값을 토글하거나 단일 값으로 확정한다.
   *
   * @param optionValue - 사용자가 선택한 옵션의 value.
   */
  const select = (optionValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      setCurrentValue(next);
    } else {
      setCurrentValue(optionValue);
    }
  };

  /**
   * 현재 선택 값을 초기 상태로 되돌린다.
   */
  const clearValue = () => {
    setCurrentValue(multiple ? [] : '');
  };

  return {
    currentValue,
    selectedValues,
    selectedSingle,
    triggerLabel,
    isPlaceholder,
    select,
    clearValue,
  };
}
