import React, { forwardRef, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

export interface ModalBodyProps {
  children?: React.ReactNode;
  /** 스크롤 시 상하단 fadeout 그라디언트 적용 */
  fadeout?: boolean;
  className?: string;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, fadeout = false }, ref) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(false);

    useEffect(() => {
      if (!fadeout) return;
      const el = bodyRef.current;
      if (!el) return;

      // 현재 스크롤 위치를 기준으로 상단/하단 페이드 표시 여부를 갱신한다.
      const check = () => {
        setShowTop(el.scrollTop > 0);
        setShowBottom(Math.ceil(el.scrollTop) + el.clientHeight < el.scrollHeight);
      };

      check();
      el.addEventListener('scroll', check, { passive: true });
      const ro = new ResizeObserver(check);
      ro.observe(el);

      return () => {
        el.removeEventListener('scroll', check);
        ro.disconnect();
      };
    }, [fadeout]);

    if (!fadeout) {
      return <div ref={ref} className={clsx(styles.body, className)}>{children}</div>;
    }

    return (
      <div ref={ref} className={clsx(styles.bodyOuter, className)}>
        <div className={clsx(styles.body, styles.bodyScrollable)} ref={bodyRef}>
          {children}
        </div>
        <div className={clsx(styles.fadeTop, showTop && styles.fadeVisible)} />
        <div className={clsx(styles.fadeBottom, showBottom && styles.fadeVisible)} />
      </div>
    );
  },
);

ModalBody.displayName = 'ModalBody';
