import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon16 = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L13 13" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 3L3 13" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon24 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L19 19" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 5L5 19" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
  /**
   * 닫기 버튼 크기.
   * - `'sm'` (기본): 16px, 별도 상단 행
   * - `'lg'`: 24px, 타이틀과 같은 행
   */
  closeSize?: 'sm' | 'lg';
  textAlign?: 'left' | 'center';
  /** 타이틀 폰트 크기. `'normal'`=15px, `'large'`=20px */
  titleSize?: 'normal' | 'large';
  /** 스텝 표시 (원형 뱃지에 넣을 숫자/문자열) */
  step?: number | string;
  /** 아이콘 영역 (Type 5 — 아이콘 + 구분선 + 본문 레이아웃) */
  icon?: React.ReactNode;
  /** 아이콘 행 우측 액션 영역 */
  action?: React.ReactNode;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  (
    {
      title,
      description,
      onClose,
      closeSize = 'sm',
      textAlign = 'left',
      titleSize = 'normal',
      step,
      icon,
      action,
      className,
    },
    ref,
  ) => {
    const isLg = closeSize === 'lg';
    const isCenter = textAlign === 'center';
    const isLarge = titleSize === 'large';

    const closeBtn = onClose ? (
      <button
        type="button"
        className={clsx(styles.closeBtn, isLg && styles.closeBtnLg)}
        onClick={onClose}
        aria-label="닫기"
      >
        {isLg ? <CloseIcon24 /> : <CloseIcon16 />}
      </button>
    ) : null;

    /* ── sm 닫기 (16px, 별도 행) ── */
    if (!isLg) {
      /* Type 5: icon + divider + body (sm) */
      if (icon !== undefined) {
        return (
          <div ref={ref} className={clsx(styles.header, className)}>
            {closeBtn && (
              <div className={styles.headerTopSm}>{closeBtn}</div>
            )}
            <div className={styles.headerIconRow}>
              <div className={styles.headerIconEl}>{icon}</div>
              <div className={styles.headerIconDivider} />
              <div className={styles.headerIconBody}>
                <div className={styles.headerIconContent}>
                  {title && (
                    <div className={clsx(styles.headerTitleText, isLarge && styles.headerTitleTextLarge)}>
                      {title}
                    </div>
                  )}
                  {description && <div className={styles.headerDesc}>{description}</div>}
                </div>
                {action && <div className={styles.headerAction}>{action}</div>}
              </div>
            </div>
          </div>
        );
      }

      /* Type 4: step (sm) */
      if (step !== undefined) {
        return (
          <div ref={ref} className={clsx(styles.header, className)}>
            <div className={clsx(styles.headerTopSm, styles.headerTopSmStep)}>
              <div className={styles.headerStep}>{step}</div>
              {closeBtn}
            </div>
            {(title || description) && (
              <div className={clsx(styles.headerContent, isCenter && styles.headerContentCenter)}>
                {title && (
                  <div className={clsx(styles.headerTitleText, isLarge && styles.headerTitleTextLarge)}>
                    {title}
                  </div>
                )}
                {description && <div className={styles.headerDesc}>{description}</div>}
              </div>
            )}
          </div>
        );
      }

      /* Type 1/2/3/6: 기본 sm */
      return (
        <div ref={ref} className={clsx(styles.header, className)}>
          {closeBtn && (
            <div className={styles.headerTopSm}>{closeBtn}</div>
          )}
          {(title || description) && (
            <div className={clsx(styles.headerContent, isCenter && styles.headerContentCenter)}>
              {title && (
                <div className={clsx(styles.headerTitleText, isLarge && styles.headerTitleTextLarge)}>
                  {title}
                </div>
              )}
              {description && <div className={styles.headerDesc}>{description}</div>}
            </div>
          )}
        </div>
      );
    }

    /* ── lg 닫기 (24px, 타이틀과 같은 행) ── */

    /* Type 5 lg: icon row + close */
    if (icon !== undefined) {
      return (
        <div ref={ref} className={clsx(styles.header, className)}>
          <div className={styles.headerTopLg}>
            <div className={clsx(styles.headerIconRow, styles.headerIconRowLg)}>
              <div className={styles.headerIconEl}>{icon}</div>
              <div className={styles.headerIconDivider} />
              <div className={styles.headerIconBody}>
                <div className={styles.headerIconContent}>
                  {title && (
                    <div className={clsx(styles.headerTitleText, isLarge && styles.headerTitleTextLarge)}>
                      {title}
                    </div>
                  )}
                  {description && <div className={styles.headerDesc}>{description}</div>}
                </div>
                {action && <div className={styles.headerAction}>{action}</div>}
              </div>
            </div>
            {closeBtn}
          </div>
        </div>
      );
    }

    /* Type 4 lg: step + close (같은 행), title+desc 아래 */
    if (step !== undefined) {
      return (
        <div ref={ref} className={clsx(styles.header, className)}>
          <div className={clsx(styles.headerTopLg, styles.headerTopLgStep)}>
            <div className={styles.headerStepContainer}>
              <div className={styles.headerStep}>{step}</div>
            </div>
            {closeBtn}
          </div>
          {(title || description) && (
            <div className={clsx(styles.headerContent, isCenter && styles.headerContentCenter)}>
              {title && (
                <div className={clsx(styles.headerTitleText, isLarge && styles.headerTitleTextLarge)}>
                  {title}
                </div>
              )}
              {description && <div className={styles.headerDesc}>{description}</div>}
            </div>
          )}
        </div>
      );
    }

    /* Type 1 lg: 닫기만 */
    if (!title && !description) {
      return (
        <div ref={ref} className={clsx(styles.header, className)}>
          <div className={styles.headerTopLgOnly}>{closeBtn}</div>
        </div>
      );
    }

    /* Type 2/3/6 lg: title + close 같은 행 */
    return (
      <div ref={ref} className={clsx(styles.header, className)}>
        <div className={styles.headerTopLg}>
          <div className={clsx(styles.headerTitleInRow, isCenter && styles.headerTitleInRowCenter, isLarge && styles.headerTitleTextLarge)}>
            {title}
          </div>
          {closeBtn}
        </div>
        {description && (
          <div className={clsx(styles.headerContent, isCenter && styles.headerContentCenter)}>
            <div className={styles.headerDesc}>{description}</div>
          </div>
        )}
      </div>
    );
  },
);

ModalHeader.displayName = 'ModalHeader';
