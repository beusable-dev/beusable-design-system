import React from 'react';
import clsx from 'clsx';
import styles from './Tooltip.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L11 11" stroke="#888" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 3L3 11" stroke="#888" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V9.5" stroke="#0074FF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 2.5H13.5V7" stroke="#0074FF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 2.5L7.5 8.5" stroke="#0074FF" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipArrow =
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'left'        | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  arrow?: TooltipArrow;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  linkLabel?: string;
  linkHref?: string;
  textAlign?: 'left' | 'center' | 'justify';
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const WRAPPER_ARROW_CLASS: Record<TooltipArrow, keyof typeof styles> = {
  'bottom-left':   'arrowBottomLeft',
  'bottom-center': 'arrowBottomCenter',
  'bottom-right':  'arrowBottomRight',
  'top-left':      'arrowTopLeft',
  'top-center':    'arrowTopCenter',
  'top-right':     'arrowTopRight',
  'left':          'arrowLeft',
  'right':         'arrowRight',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SAFE_URL_RE = /^(https?:|mailto:|tel:|\/|#|\.)/i;
// 앞뒤 공백·제어문자를 제거한 뒤 검사해야 " javascript:..." 같은 우회를 막을 수 있다.
const CONTROL_CHARS_RE = /^[\s\u0000-\u001F\u007F]+|[\s\u0000-\u001F\u007F]+$/g;

/**
 * 툴팁 링크에 전달된 href를 허용된 스킴만 남기도록 정제한다.
 *
 * @param href - 외부에서 전달된 원본 링크 문자열.
 * @returns 안전한 href 문자열. 차단 대상이면 `#`를 반환한다.
 */
function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return href;
  const trimmed = href.replace(CONTROL_CHARS_RE, '');
  if (SAFE_URL_RE.test(trimmed)) return trimmed;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Tooltip] Unsafe linkHref blocked: "${href}"`);
  }
  return '#';
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * 닫기 버튼, 액션 버튼, 외부 링크를 조합할 수 있는 인라인 툴팁 컴포넌트다.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      arrow,
      onClose,
      actionLabel,
      onAction,
      linkLabel,
      linkHref,
      textAlign,
      maxWidth = 500,
      className,
      style,
    },
    ref,
  ) => {
  const hasClose = !!onClose;
  const hasAction = !!(actionLabel && onAction);
  const hasLink = !!(linkLabel && linkHref);

  return (
    <div
      ref={ref}
      className={clsx(
        styles.wrapper,
        arrow && styles[WRAPPER_ARROW_CLASS[arrow]],
        hasClose && styles.hasClose,
        hasAction && styles.hasAction,
        className,
      )}
      style={{ maxWidth, ...style }}
    >
      {arrow && <span className={styles.arrow} />}

      <div
        className={clsx(styles.content, hasLink && styles.contentWithLink)}
        style={textAlign ? { textAlign } : undefined}
      >
        <div>{content}</div>
        {hasLink && (
          <a
            href={sanitizeHref(linkHref)}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkIcon />
            <span>{linkLabel}</span>
          </a>
        )}
      </div>

      {hasClose && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          <CloseIcon />
        </button>
      )}

      {hasAction && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
},
);

Tooltip.displayName = 'Tooltip';
