import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

export type ButtonVariant =
  // Primary (red)
  | 'primary'          // P1 — solid filled
  | 'primary-outline'  // P2 — outline
  | 'primary-surface'  // P3 — white bg + shadow
  | 'primary-ghost'    // P4 — text only
  // Secondary (gray)
  | 'secondary'        // S1 — outline
  | 'secondary-surface'// S2 — white bg + shadow
  | 'secondary-ghost'  // S3 — text only
  // Action (green)
  | 'action'           // A1 — outline
  | 'action-surface'   // A2 — white bg + shadow
  | 'action-ghost'     // A3 — text only
  // Accent (blue)
  | 'accent'           // Ac1 — outline
  | 'accent-surface'   // Ac2 — white bg + shadow
  | 'accent-ghost';    // Ac3 — text only

export type ButtonSize = 'xs' | 's' | 'm' | 'l';
export type ButtonShape = 'pill' | 'rounded';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 버튼 색상 및 스타일 변형 */
  variant?: ButtonVariant;
  /** 버튼 높이 크기 */
  size?: ButtonSize;
  /** 버튼 모서리 형태 */
  shape?: ButtonShape;
  /** 버튼 좌측 아이콘 */
  leftIcon?: ReactNode;
  /** 버튼 우측 아이콘 */
  rightIcon?: ReactNode;
  /** 로딩 스피너 표시 (클릭 비활성화) */
  loading?: boolean;
  /** 너비 100% 확장 */
  fullWidth?: boolean;
  /** 버튼 텍스트 */
  children?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  'primary':          styles.primary,
  'primary-outline':  styles.primaryOutline,
  'primary-surface':  styles.primarySurface,
  'primary-ghost':    styles.primaryGhost,
  'secondary':        styles.secondary,
  'secondary-surface':styles.secondarySurface,
  'secondary-ghost':  styles.secondaryGhost,
  'action':           styles.action,
  'action-surface':   styles.actionSurface,
  'action-ghost':     styles.actionGhost,
  'accent':           styles.accent,
  'accent-surface':   styles.accentSurface,
  'accent-ghost':     styles.accentGhost,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'm',
      shape = 'pill',
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      disabled = false,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const iconOnly = !children;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={clsx(
          styles.btn,
          styles[size],
          styles[shape],
          variantClass[variant],
          leftIcon && styles.hasLeft,
          rightIcon && styles.hasRight,
          iconOnly && styles.iconOnly,
          fullWidth && styles.fullWidth,
          loading && styles.loading,
          className,
        )}
        {...rest}
      >
        {loading ? (
          <svg
            className={styles.spinner}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 26 26"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M22.3601 12.9996C22.3601 12.0975 22.2325 11.2251 21.9943 10.3996C20.8676 6.4952 17.2674 3.63965 13.0001 3.63965C7.83075 3.63965 3.64014 7.83026 3.64014 12.9996C3.64014 18.169 7.83075 22.3596 13.0001 22.3596C13.8081 22.3596 14.5922 22.2573 15.3401 22.0648"
              stroke="currentColor"
              strokeWidth="3.64"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
