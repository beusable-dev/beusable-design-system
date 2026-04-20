import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Toast.module.css';

// ─── Icon ─────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.68359 7.96289L6.7002 11.2734L13.6777 4.30273" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastStatus = 'complete' | 'caution' | 'normal';
export type ToastType = 'a1' | 'a2' | 'b';

export interface ToastProps {
  /** 메인 텍스트 */
  message: string;
  /** 보조 텍스트 (입력 시 자동으로 type b로 전환) */
  description?: string;
  /** 색상 상태 */
  status?: ToastStatus;
  /** 레이아웃 타입. 미지정 시 description 유무로 자동 결정 */
  type?: ToastType;
  /** 아이콘 CSS 클래스명 (type a1에서 사용) */
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      message,
      description,
      status = 'normal',
      type,
      icon,
      className,
      style,
    },
    ref,
  ) => {
    // 명시된 type이 없으면 description/icon 조합으로 레이아웃 타입을 자동 결정한다.
    const resolvedType: ToastType =
      type ?? (description ? 'b' : icon !== undefined ? 'a1' : 'a2');

    const iconEl = icon ? (
      <span className={styles.iconWrap}>
        <i className={`icon ${icon}`} aria-hidden />
      </span>
    ) : (
      <span className={styles.iconWrap}><CheckIcon /></span>
    );

    return (
      <div
        ref={ref}
        className={clsx(
          styles.toast,
          styles[status],
          styles[resolvedType],
          className,
        )}
        style={style}
        role="status"
        aria-live="polite"
      >
        {resolvedType === 'b' ? (
          <div className={styles.textBlock}>
            <span>{message}</span>
            {description && <span>{description}</span>}
          </div>
        ) : resolvedType === 'a1' ? (
          <>
            <span className={styles.message}>{message}</span>
            {iconEl}
          </>
        ) : (
          <span className={styles.message}>{message}</span>
        )}
      </div>
    );
  },
);

Toast.displayName = 'Toast';
