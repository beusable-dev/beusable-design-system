import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Toggle.module.css';
import { useControllableState } from '../../hooks/useControllableState';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToggleSize = 'm' | 's' | 'xs';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: ToggleSize;
  label?: string;
  showText?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked,
      defaultChecked,
      disabled = false,
      size = 'm',
      label,
      showText = true,
      onChange,
      id: idProp,
      className,
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    const [isChecked, setChecked] = useControllableState<boolean>(checked, defaultChecked ?? false);

    // switch 상태를 내부/외부에서 동일하게 관찰할 수 있도록 동기화한다.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      onChange?.(e);
    };

    return (
      <label
        htmlFor={id}
        className={clsx(
          styles.wrapper,
          disabled && styles.disabled,
          className,
        )}
        style={style}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          className={styles.input}
          checked={checked}
          defaultChecked={checked !== undefined ? undefined : defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={isChecked}
        />
        <span
          className={clsx(
            styles.track,
            styles[size],
            isChecked ? styles.on : styles.off,
            disabled && styles.trackDisabled,
            !showText && styles.noText,
          )}
        >
          {showText && <span className={styles.onText}>ON</span>}
          <span className={styles.knob} />
          {showText && <span className={styles.offText}>OFF</span>}
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = 'Toggle';
