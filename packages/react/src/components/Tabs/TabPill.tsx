import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './TabPill.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabPillItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabPillProps {
  items: TabPillItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TabPill = forwardRef<HTMLDivElement, TabPillProps>(
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
    const hasIcons = items.some((item) => item.icon);

    // pill 탭 선택 로직을 단일 함수로 모아 controlled/uncontrolled 흐름을 유지한다.
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
                hasIcons ? styles.withIcon : styles.textOnly,
                item.disabled && styles.itemDisabled,
              )}
              onClick={() => !item.disabled && handleSelect(item.value)}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className={clsx(styles.icon, item.disabled && styles.iconDisabled)}>
                  {item.icon}
                </span>
              )}
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

TabPill.displayName = 'TabPill';
