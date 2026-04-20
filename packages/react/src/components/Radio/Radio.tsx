import React, { forwardRef, useId, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './Radio.module.css';
import { useControllableState } from '../../hooks/useControllableState';
import { SELECTION_COLOR_MAP } from '../selectionColors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RadioSize = 's' | 'm' | 'l';
export type RadioColor = 'primary' | 'secondary' | 'action';

export interface RadioProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  size?: RadioSize;
  color?: RadioColor;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked,
      defaultChecked,
      disabled = false,
      label,
      size = 'm',
      color = 'primary',
      onChange,
      name,
      value,
      id: idProp,
      className,
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    const isControlled = checked !== undefined;
    const [isChecked, setChecked] = useControllableState<boolean>(checked, defaultChecked ?? false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 비제어 모드: 같은 name 그룹에서 다른 Radio 선택 시 이 Radio의 상태 동기화
    useEffect(() => {
      if (isControlled || !name) return;
      const handleGroupChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'radio' && target.name === name && target !== inputRef.current) {
          setChecked(false);
        }
      };
      document.addEventListener('change', handleGroupChange);
      return () => document.removeEventListener('change', handleGroupChange);
    }, [isControlled, name, setChecked]);

    // 현재 radio의 선택 상태를 내부 상태와 외부 콜백에 동시에 반영한다.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      onChange?.(e);
    };

    // 외부 ref와 내부 inputRef를 동시에 연결
    const setRef = (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    return (
      <label
        htmlFor={id}
        className={clsx(
          styles.wrapper,
          styles[size],
          disabled && styles.disabled,
          className,
        )}
        style={{ '--selection-color': SELECTION_COLOR_MAP[color], ...style } as React.CSSProperties}
      >
        <input
          ref={setRef}
          id={id}
          type="radio"
          className={styles.input}
          checked={checked}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled}
          name={name}
          value={value}
          onChange={handleChange}
        />
        <span
          className={clsx(
            styles.control,
            isChecked && styles.checked,
            disabled && styles.controlDisabled,
          )}
        >
          {isChecked && <span className={styles.dot} />}
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  },
);

Radio.displayName = 'Radio';
