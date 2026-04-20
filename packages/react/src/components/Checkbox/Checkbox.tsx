import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.css';
import { useControllableState } from '../../hooks/useControllableState';
import { SELECTION_COLOR_MAP } from '../selectionColors';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckboxEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M16.75 3.24999V16.75H3.24999V3.24999H16.75ZM17 1H2.99999C1.9 1 1 1.9 1 2.99999V17C1 18.0999 1.9 18.9999 2.99999 18.9999H17C18.0999 18.9999 18.9999 18.0999 18.9999 17V2.99999C18.9999 1.9 18.0999 1 17 1Z" fill="currentColor"/>
    <path d="M16.75 3.25H3.25V16.75H16.75V3.25Z" fill="var(--cb-inner, white)"/>
  </svg>
);

const CheckboxChecked = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.3337 2.66675H2.66699V13.3334H13.3337V2.66675Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.4448 0.999756H2.5556C1.70002 0.999756 1 1.69978 1 2.55536V13.4446C1 14.3002 1.70002 15.0002 2.5556 15.0002H13.4448C14.3004 15.0002 15.0004 14.3002 15.0004 13.4446V2.55536C15.0004 1.69978 14.3004 0.999756 13.4448 0.999756ZM6.50017 11.5001L2.75005 7.71391L3.80009 6.65378L6.50017 9.37982L12.2003 3.62484L13.2504 4.68497L6.50017 11.5001Z" fill="var(--selection-color, #EC0047)"/>
  </svg>
);

const CheckboxIndeterminate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.2503 2.75H2.75V13.2503H13.2503V2.75Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.4448 0.999756H2.5556C1.70002 0.999756 1 1.69978 1 2.55536V13.4446C1 14.3002 1.70002 15.0002 2.5556 15.0002H13.4448C14.3004 15.0002 15.0004 14.3002 15.0004 13.4446V2.55536C15.0004 1.69978 14.3004 0.999756 13.4448 0.999756ZM3.62508 7.12495H12.3754V8.875H3.62508V7.12495Z" fill="var(--selection-color, #EC0047)"/>
  </svg>
);

const CheckboxDisabledChecked = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#d7d7d7"/>
    <path d="M5 10.5L8.5 14L15.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckboxDisabledIndeterminate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#d7d7d7"/>
    <path d="M6 10H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckboxSize = 's' | 'm' | 'l';
export type CheckboxColor = 'primary' | 'secondary' | 'action';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  size?: CheckboxSize;
  color?: CheckboxColor;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      indeterminate = false,
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

    const [isChecked, setChecked] = useControllableState<boolean>(checked, defaultChecked ?? false);

    // 내부 체크 상태를 갱신한 뒤 외부 onChange에도 동일한 이벤트를 전달한다.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      onChange?.(e);
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
          ref={ref}
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          defaultChecked={checked !== undefined ? undefined : defaultChecked}
          disabled={disabled}
          name={name}
          value={value}
          onChange={handleChange}
          aria-checked={indeterminate ? 'mixed' : isChecked}
        />
        <span className={styles.control}>
          {disabled && indeterminate ? <CheckboxDisabledIndeterminate /> :
           disabled && isChecked  ? <CheckboxDisabledChecked /> :
           indeterminate          ? <CheckboxIndeterminate /> :
           isChecked              ? <CheckboxChecked /> :
                                    <CheckboxEmpty />}
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
