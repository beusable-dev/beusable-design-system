import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

export interface ModalButtonsProps {
  children?: React.ReactNode;
  className?: string;
}

export const ModalButtons = forwardRef<HTMLDivElement, ModalButtonsProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={clsx(styles.buttons, className)}>{children}</div>
  ),
);

ModalButtons.displayName = 'ModalButtons';
