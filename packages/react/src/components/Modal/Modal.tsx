import React, { forwardRef, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  /** 모달 너비. Type A: 526, Type B: 428 */
  width?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, width, children, className, style }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // 내부 포커스 관리용 ref와 외부 ref를 동시에 유지한다.
    const setRef = (el: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    // 초기 포커스 & 이전 포커스 복원
    useEffect(() => {
      if (!open) return;
      const previouslyFocused = document.activeElement as HTMLElement | null;
      const firstFocusable = internalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      firstFocusable?.focus();
      return () => { previouslyFocused?.focus(); };
    }, [open]);

    // Escape 닫기 & focus trap
    useEffect(() => {
      if (!open) return;
      // 모달 내부에서만 Tab 순환이 일어나도록 포커스를 가둔다.
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { onClose?.(); return; }
        if (e.key !== 'Tab') return;
        const focusable = Array.from(
          internalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
        );
        if (focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div
          ref={setRef}
          role="dialog"
          aria-modal="true"
          className={clsx(styles.modal, className)}
          style={{ width, ...style }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';
