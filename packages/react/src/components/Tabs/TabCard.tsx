import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './TabCard.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabCardItem {
  label: string;
  value: string;
  color?: 'primary' | 'accent';
  icon?: React.ReactNode;
}

export interface TabCardProps {
  items: TabCardItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Arrow Icon ──────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TabCard = forwardRef<HTMLDivElement, TabCardProps>(
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

    // 카드형 탭도 동일한 선택 API를 사용하도록 값 갱신을 단일화한다.
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
          const color = item.color ?? 'primary';

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={clsx(
                styles.card,
                styles[color],
              )}
              onClick={() => handleSelect(item.value)}
            >
              <span className={styles.label}>{item.label}</span>
              <span className={styles.arrow}>
                {item.icon ?? <ArrowIcon />}
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

TabCard.displayName = 'TabCard';
