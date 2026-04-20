import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Dropdown.module.css';
import { useDropdownSelection } from './useDropdownSelection';
import { useDropdownState } from './useDropdownState';

// ─── Icons ───────────────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M2 5.97848C2 5.85728 2.0492 5.73576 2.14725 5.64262C2.34574 5.45444 2.6703 5.45221 2.8722 5.63752L8.00021 10.3503L13.1282 5.63752C13.3298 5.45221 13.6543 5.45444 13.8528 5.64262C14.0513 5.83112 14.0486 6.13413 13.8474 6.31912L8.35961 11.3627C8.16009 11.5458 7.84032 11.5458 7.6408 11.3627L2.15305 6.31912C2.05125 6.22567 2 6.10191 2 5.97848Z" fill="currentColor"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M14 10.0215C14 10.1427 13.9508 10.2642 13.8528 10.3574C13.6543 10.5456 13.3297 10.5478 13.1278 10.3625L8.00021 5.64966L2.87219 10.3625C2.6703 10.5478 2.34574 10.5456 2.14725 10.3574C1.94875 10.1689 1.95143 9.86587 2.15273 9.68088L7.64048 4.63726C7.84 4.45418 8.15977 4.45418 8.35929 4.63726L13.847 9.68088C13.9488 9.77433 14 9.89809 14 10.0215Z" fill="currentColor"/>
  </svg>
);


const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3L11 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 3L3 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckboxUnchecked = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15 3H3V15H15V3Z" fill="white"/>
    <path d="M15 3V15H3V3H15ZM15.2222 1H2.77778C1.8 1 1 1.8 1 2.77778V15.2222C1 16.2 1.8 17 2.77778 17H15.2222C16.2 17 17 16.2 17 15.2222V2.77778C17 1.8 16.2 1 15.2222 1Z" fill="#AAAAAA"/>
  </svg>
);

const CheckboxChecked = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" rx="3" fill="#ec0047" />
    <path d="M3.5 8l3.5 3.5 5.5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type DropdownSize = 's' | 'm' | 'l';
export type DropdownTheme = 'light' | 'dark';
export type DropdownLayout = 'vertical' | 'horizontal';
export type DropdownVariant = 'border' | 'shadow';

export interface DropdownProps {
  /** 선택 가능한 옵션 목록 */
  options: DropdownOption[];
  /** 선택된 값 (controlled) */
  value?: string | string[];
  /** 초기 선택 값 (uncontrolled) */
  defaultValue?: string | string[];
  /** 값 변경 시 콜백 */
  onChange?: (value: string | string[]) => void;
  /** 미선택 상태 안내 문구 */
  placeholder?: string;
  /** 입력 레이블 */
  label?: string;
  /** 에러 메시지 (표시 시 error 스타일 적용) */
  errorMessage?: string;
  /** 도움말 메시지 */
  message?: string;
  /** 트리거 높이 크기 */
  size?: DropdownSize;
  /** 테두리 스타일 */
  variant?: DropdownVariant;
  /** 레이블 배치 방향 */
  layout?: DropdownLayout;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 다중 선택 여부 */
  multiple?: boolean;
  /** 검색 입력 활성화 여부 */
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * single/multiple 선택, 검색, 키보드 탐색을 지원하는 combobox 컴포넌트다.
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select',
      label,
      errorMessage,
      message,
      size = 'm',
      variant = 'border',
      layout = 'vertical',
      disabled = false,
      multiple = false,
      searchable = false,
      className,
      style,
      id: idProp,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const listId = `${id}-list`;

    const {
      selectedValues,
      selectedSingle,
      triggerLabel,
      isPlaceholder,
      select,
      clearValue,
    } = useDropdownSelection({ value, defaultValue, onChange, multiple, options, placeholder });

    const {
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
    } = useDropdownState({
      disabled,
      searchable,
      multiple,
      options,
      listId,
      onSelect: select,
      onClear: clearValue,
    });

    const hasError = !!errorMessage;

    return (
      <div
        ref={ref}
        className={clsx(styles.root, styles[size], variant === 'shadow' && styles.shadow, layout === 'horizontal' && styles.horizontal, className)}
        style={style}
      >
        {label && (
          // div 는 labelable element 가 아니므로 htmlFor 대신 aria-labelledby 사용
          <span id={labelId} className={styles.label} onClick={() => containerRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus()}>
            {label}
          </span>
        )}

        <div ref={containerRef} className={styles.wrapper}>
          {/* Trigger */}
          <div
            id={id}
            role={searchable && open ? undefined : 'combobox'}
            aria-expanded={searchable && open ? undefined : open}
            aria-haspopup={searchable && open ? undefined : 'listbox'}
            aria-controls={searchable && open ? undefined : open ? listId : undefined}
            aria-activedescendant={
              searchable && open
                ? undefined
                : open && activeIndex >= 0
                  ? `${listId}-option-${enabledOptions[activeIndex]?.value}`
                  : undefined
            }
            aria-labelledby={label ? labelId : undefined}
            aria-disabled={disabled}
            tabIndex={searchable && open ? -1 : disabled ? -1 : 0}
            className={clsx(
              styles.trigger,
              open && styles.open,
              hasError && styles.error,
              disabled && styles.disabled,
            )}
            onClick={handleToggle}
            onKeyDown={!searchable || !open ? handleKeyDown : undefined}
          >
            {searchable && open ? (
              <input
                ref={searchRef}
                role="combobox"
                aria-expanded={true}
                aria-haspopup="listbox"
                aria-controls={listId}
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${listId}-option-${enabledOptions[activeIndex]?.value}`
                    : undefined
                }
                aria-autocomplete="list"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                placeholder={triggerLabel}
              />
            ) : (
              <span className={clsx(styles.value, isPlaceholder && styles.placeholder)}>
                {triggerLabel}
              </span>
            )}

            <span className={styles.icons}>
              {searchable && open && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClear}
                  aria-label="Clear"
                >
                  <ClearIcon />
                </button>
              )}
              <span className={styles.chevron}>
                {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </span>
            </span>
          </div>

          {/* List */}
          {open && (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable={multiple}
              className={styles.list}
            >
              {filteredOptions.length === 0 ? (
                <li className={styles.empty}>검색 결과 없음</li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? selectedValues.includes(option.value)
                    : option.value === selectedSingle;

                  return (
                    <li
                      key={option.value}
                      id={`${listId}-option-${option.value}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      className={clsx(
                        styles.item,
                        isSelected && styles.selected,
                        option.disabled && styles.itemDisabled,
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      {multiple && (
                        <span className={styles.checkbox}>
                          {isSelected ? <CheckboxChecked /> : <CheckboxUnchecked />}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        {hasError && <p className={styles.errorMsg}>{errorMessage}</p>}
        {!hasError && message && <p className={styles.msg}>{message}</p>}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
