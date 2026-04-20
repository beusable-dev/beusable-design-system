import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './TabBar.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabBarItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface TabBarProps {
  items: TabBarItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      className,
      style,
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useControllableState(
      value,
      defaultValue ?? items[0]?.value,
      onChange,
    );

    // 탭 클릭 시 선택 값 변경 경로를 한 곳으로 유지한다.
    const handleSelect = (itemValue: string) => setCurrentValue(itemValue);

    return (
      <div
        ref={ref}
        className={clsx(styles.wrapper, className)}
        style={style}
        role="tablist"
      >
        {items.map((item) => {
          const isSelected = currentValue === item.value;

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={clsx(
                styles.item,
                isSelected && styles.selected,
                item.disabled && styles.itemDisabled,
              )}
              onClick={() => !item.disabled && handleSelect(item.value)}
              disabled={item.disabled}
            >
              <span className={styles.label}>{item.label}</span>
              <span className={styles.bar} />
            </button>
          );
        })}
      </div>
    );
  },
);

TabBar.displayName = 'TabBar';
