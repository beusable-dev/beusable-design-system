import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

export interface ModalFooterProps {
  /** 버튼 행 중앙 — 메인 액션 버튼들 */
  children?: React.ReactNode;
  /** 버튼 행 위에 표시할 체크박스 동의 행 */
  checkbox?: React.ReactNode;
  /** 버튼 행 좌측 액션 (Back 버튼 등). 우측은 자동으로 spacer 처리 */
  leftAction?: React.ReactNode;
  className?: string;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, checkbox, leftAction, className }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)}>
      {checkbox && (
        <div className={styles.footerCheckbox}>{checkbox}</div>
      )}
      {children && (
        <div className={styles.buttonsRow}>
          <div className={styles.buttonsRowLeft}>{leftAction}</div>
          <div className={styles.buttonsRowCenter}>{children}</div>
          <div className={styles.buttonsRowRight} />
        </div>
      )}
    </div>
  ),
);

ModalFooter.displayName = 'ModalFooter';
