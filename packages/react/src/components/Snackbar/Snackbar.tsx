import React from 'react';
import clsx from 'clsx';
import styles from './Snackbar.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const NoticeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M10 4.5C7.79086 4.5 6 6.11177 6 8.1C6 12.3 4.5 13.5 4.5 13.5H15.5C15.5 13.5 14 12.3 14 8.1C14 6.11177 12.2091 4.5 10 4.5Z" stroke="#0E90A5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.55035 13.9862C8.55581 14.3628 8.7022 14.7377 8.98953 15.025C9.57531 15.6108 10.5251 15.6108 11.1108 15.025C11.412 14.7238 11.5584 14.3265 11.5498 13.9318" stroke="#0E90A5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10Z" fill="white"/>
    <path d="M8.56665 7.69238H6.46069V13.5H5.29639V7.69238H3.20898V6.74609H8.56665V7.69238ZM10.6912 13.5H9.52222V6.74609H10.6912V13.5ZM14.7175 6.74609C15.4721 6.74609 16.0712 6.94246 16.515 7.33521C16.9588 7.72795 17.1807 8.24747 17.1807 8.8938C17.1807 9.55559 16.9634 10.0705 16.5289 10.4385C16.0944 10.8065 15.486 10.9905 14.7036 10.9905H13.3074V13.5H12.1338V6.74609H14.7175ZM14.75 7.69238H13.3074V10.0488H14.7175C15.135 10.0488 15.4535 9.95064 15.6731 9.75427C15.8927 9.5579 16.0024 9.27417 16.0024 8.90308C16.0024 8.53817 15.8911 8.24671 15.6685 8.02869C15.4458 7.81067 15.1397 7.69857 14.75 7.69238Z" fill="#0E90A5"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="white"/>
    <path d="M10 11V5" stroke="#E92020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14Z" fill="#E92020"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L11 11" stroke="#444444" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 3L3 11" stroke="#444444" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type SnackbarVariant = 'notice' | 'tip' | 'alert';
export type SnackbarSize = 's' | 'm';

const ICON_MAP: Record<SnackbarVariant, React.ReactElement> = {
  notice: <NoticeIcon />,
  tip: <TipIcon />,
  alert: <AlertIcon />,
};

export interface SnackbarProps {
  variant?: SnackbarVariant;
  size?: SnackbarSize;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  rounded?: boolean;
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      variant = 'notice',
      size = 's',
      message,
      actionLabel,
      onAction,
      onClose,
      rounded = true,
      icon,
      className,
      style,
    },
    ref,
  ) => {
  return (
    <div
      ref={ref}
      className={clsx(
        styles.wrapper,
        styles[variant],
        styles[size],
        rounded && styles.rounded,
        className,
      )}
      style={style}
    >
      <span className={styles.icon}>
        {icon
          ? <i className={`icon ${icon}`} aria-hidden />
          : ICON_MAP[variant]}
      </span>

      <span className={styles.message}>{message}</span>

      {actionLabel && size === 's' && (
        <button
          type="button"
          className={clsx(styles.actionText, styles[`actionText_${variant}`])}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}

      {actionLabel && size === 'm' && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
},
);

Snackbar.displayName = 'Snackbar';
