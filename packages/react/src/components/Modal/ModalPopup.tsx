import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

export interface ModalPopupProps {
  children?: React.ReactNode;
  /** B-3(Prompt)처럼 좌우 패딩이 좁은 경우 */
  narrow?: boolean;
  className?: string;
}

export const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
  ({ children, narrow, className }, ref) => (
    <div ref={ref} className={clsx(styles.popup, narrow && styles.popupNarrow, className)}>
      {children}
    </div>
  ),
);

ModalPopup.displayName = 'ModalPopup';
