import { useRef, useState, useEffect, type KeyboardEvent } from 'react';
import type { DropdownOption } from './Dropdown';

interface UseDropdownStateOptions {
  disabled: boolean;
  searchable: boolean;
  multiple: boolean;
  options: DropdownOption[];
  listId: string;
  onSelect: (optionValue: string) => void;
  onClear: () => void;
}

/**
 * Dropdown 팝업의 열림 상태, 검색어, 키보드 탐색 상태를 관리한다.
 *
 * @param disabled - 전체 컴포넌트 비활성화 여부.
 * @param searchable - 검색 입력 사용 여부.
 * @param multiple - 다중 선택 여부.
 * @param options - 원본 옵션 목록.
 * @param listId - listbox/option id 생성에 사용할 기준 id.
 * @param onSelect - 옵션 선택 시 호출할 콜백.
 * @param onClear - 현재 선택과 검색어를 초기화할 때 호출할 콜백.
 * @returns 팝업 상태값, ref, 필터링된 옵션, 사용자 상호작용 핸들러 모음.
 */
export function useDropdownState({
  disabled,
  searchable,
  multiple,
  options,
  listId,
  onSelect,
  onClear,
}: UseDropdownStateOptions) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = searchable && searchQuery
    ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const enabledOptions = filteredOptions.filter((o) => !o.disabled);

  // outside click으로 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 열릴 때 검색 input 포커스
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  /**
   * 트리거 클릭 시 dropdown 열림/닫힘을 전환한다.
   */
  const handleToggle = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      setSearchQuery('');
      setActiveIndex(-1);
    } else {
      setOpen(true);
    }
  };

  /**
   * 옵션 선택을 반영하고 single 모드면 팝업을 함께 닫는다.
   *
   * @param optionValue - 선택된 옵션의 value.
   */
  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    if (!multiple) {
      setOpen(false);
      setSearchQuery('');
      setActiveIndex(-1);
    }
  };

  /**
   * 검색 입력과 선택 상태를 비우고 팝업을 닫는다.
   *
   * @param e - clear 버튼 클릭 이벤트.
   */
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    onClear();
    setOpen(false);
  };

  /**
   * 현재 활성 옵션이 보이도록 스크롤 위치를 맞춘다.
   *
   * @param index - enabled 옵션 기준 활성 인덱스.
   */
  const scrollActiveIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const value = enabledOptions[index]?.value;
    if (!value) return;
    list.querySelector<HTMLElement>(`[id="${listId}-option-${value}"]`)?.scrollIntoView({ block: 'nearest' });
  };

  /**
   * Escape, 방향키, Enter/Space 입력을 처리해 combobox 키보드 접근성을 맞춘다.
   *
   * @param e - 트리거나 검색 입력에서 전달된 키보드 이벤트.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setSearchQuery('');
      setActiveIndex(-1);
      return;
    }

    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1 < enabledOptions.length ? prev + 1 : 0;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1 >= 0 ? prev - 1 : enabledOptions.length - 1;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < enabledOptions.length) {
        handleSelect(enabledOptions[activeIndex].value);
      }
    }
  };

  return {
    open,
    searchQuery,
    setSearchQuery,
    activeIndex,
    containerRef,
    searchRef,
    listRef,
    filteredOptions,
    enabledOptions,
    handleToggle,
    handleSelect,
    handleClear,
    handleKeyDown,
  };
}
