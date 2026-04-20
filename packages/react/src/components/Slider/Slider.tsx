import React, { forwardRef, useCallback, useId, useRef } from 'react';
import clsx from 'clsx';
import styles from './Slider.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SliderVariant = 'extended' | 'simplified';

export interface SliderProps {
  /** 현재 값 (controlled) */
  value?: number;
  /** 초기 값 (uncontrolled) */
  defaultValue?: number;
  /** 최솟값 */
  min?: number;
  /** 최댓값 */
  max?: number;
  /** 단계 값 */
  step?: number;
  /** ± 버튼 포함 여부 */
  variant?: SliderVariant;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 값 변경 콜백 */
  onChange?: (value: number) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5.5" width="8" height="1" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5.5" width="8" height="1" rx="0.5" fill="currentColor" />
      <rect x="5.5" y="2" width="1" height="8" rx="0.5" fill="currentColor" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * range input 기반 슬라이더 컴포넌트다.
 *
 * extended 변형에서는 좌우 step 버튼을 함께 렌더링한다.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      variant = 'extended',
      disabled = false,
      onChange,
      id: idProp,
      className,
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const trackRef = useRef<HTMLDivElement>(null);

    const [currentValue, setCurrentValue] = useControllableState(value, defaultValue, onChange);

    const percentage =
      max === min ? 0 : ((currentValue - min) / (max - min)) * 100;

    /**
     * 범위 제한과 step 보정을 거쳐 최종 슬라이더 값을 확정한다.
     *
     * @param newValue - 반영할 원본 숫자 값.
     */
    const updateValue = useCallback(
      (newValue: number) => {
        const clamped = Math.min(max, Math.max(min, newValue));
        const stepped = Math.round((clamped - min) / step) * step + min;
        const final = Math.min(max, Math.max(min, stepped));
        setCurrentValue(final);
      },
      [min, max, step, setCurrentValue],
    );

    /**
     * range input에서 들어온 문자열 값을 숫자로 정규화해 반영한다.
     *
     * @param e - 네이티브 range input change 이벤트.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(Number(e.target.value));
    };

    /**
     * 현재 값을 한 step 감소시킨다.
     */
    const handleDecrement = () => {
      if (!disabled) updateValue(currentValue - step);
    };

    /**
     * 현재 값을 한 step 증가시킨다.
     */
    const handleIncrement = () => {
      if (!disabled) updateValue(currentValue + step);
    };

    return (
      <div
        className={clsx(
          styles.wrapper,
          styles[variant],
          disabled && styles.disabled,
          className,
        )}
        style={style}
      >
        {variant === 'extended' && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleDecrement}
            disabled={disabled}
            aria-label="Decrease"
          >
            <MinusIcon />
          </button>
        )}

        <div className={styles.trackArea} ref={trackRef}>
          <div className={styles.track} />
          <div
            className={styles.handle}
            style={{ left: `${percentage}%` }}
          />
          <input
            ref={ref}
            id={id}
            type="range"
            className={styles.input}
            min={min}
            max={max}
            step={step}
            value={currentValue}
            disabled={disabled}
            onChange={handleInputChange}
          />
        </div>

        {variant === 'extended' && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleIncrement}
            disabled={disabled}
            aria-label="Increase"
          >
            <PlusIcon />
          </button>
        )}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
