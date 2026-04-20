import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './SegmentControl.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SegmentItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentControlProps {
  items: SegmentItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 's' | 'm';
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SegmentControl = forwardRef<HTMLDivElement, SegmentControlProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      size = 's',
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

    // disabled 검사는 클릭 지점에서 하고, 실제 값 반영은 이 함수로 모은다.
    const handleSelect = (itemValue: string) => setCurrentValue(itemValue);

    return (
      <div
        ref={ref}
        className={clsx(styles.wrapper, styles[size], className)}
        style={style}
        role="tablist"
      >
        {items.map((item, index) => {
          const isSelected = currentValue === item.value;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={clsx(
                styles.item,
                isSelected && styles.selected,
                isFirst && styles.first,
                isLast && styles.last,
                item.disabled && styles.itemDisabled,
              )}
              onClick={() => !item.disabled && handleSelect(item.value)}
              disabled={item.disabled}
            >
              {isSelected && <span className={styles.selectedBg} />}
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

SegmentControl.displayName = 'SegmentControl';
