import { forwardRef } from 'react';
import styles from './Modal.module.css';

export const ModalDivider = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className={styles.divider} />
));

ModalDivider.displayName = 'ModalDivider';
