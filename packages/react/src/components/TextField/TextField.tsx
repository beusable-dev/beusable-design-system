import {
  forwardRef,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import styles from './TextField.module.css';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { useControllableState } from '../../hooks/useControllableState';

export type TextFieldLayout = 'vertical' | 'horizontal';
export type TextFieldSize = 's' | 'm' | 'l';
export type TextFieldTheme = 'light' | 'dark';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;
type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export interface TextFieldProps extends InputProps {
  /** 입력 레이블 */
  label?: string;
  /** 입력 높이 크기 */
  size?: TextFieldSize;
  /** 레이블 배치 방향 */
  layout?: TextFieldLayout;
  /** 다크/라이트 테마 */
  theme?: TextFieldTheme;
  /** 에러 메시지 (표시 시 error 스타일 적용) */
  errorMessage?: string;
  /** 도움말 메시지 */
  message?: string;
  /** 우측 커스텀 아이콘 */
  rightIcon?: ReactNode;
  /** X 버튼으로 값 초기화 활성화 */
  clearable?: boolean;
  /** clearable X 버튼 클릭 콜백 */
  onClear?: () => void;
  /** 유효 상태 (초록 체크 아이콘 표시) */
  valid?: boolean;
  /** 표시할 타이머 문자열 (직접 제어 시). timerSeconds와 함께 쓰면 무시됨 */
  timer?: string;
  /** 초 단위 초기값. 컴포넌트가 자체적으로 카운트다운하고 onTimerEnd를 호출 */
  timerSeconds?: number;
  /** 타이머 종료 콜백 */
  onTimerEnd?: () => void;
  /** textarea 모드 활성화 */
  multiline?: boolean;
  /** 최대 입력 글자 수 */
  maxLength?: number;
  /** 글자 수 카운터 표시 (multiline + maxLength 필요) */
  showCount?: boolean;
  /** textarea 기본 행 수 */
  rows?: number;
}

// ─── Local Hooks ──────────────────────────────────────────────────────────────

/**
 * password 입력일 때만 보기/숨기기 상태를 관리한다.
 *
 * @param type - 현재 input type.
 * @returns 비밀번호 필드 여부, 표시 상태, 실제 렌더링 type, 토글 함수.
 */
function usePasswordToggle(type: string) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  return { isPassword, showPassword, inputType, toggle: () => setShowPassword((v) => !v) };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M12 9.02051C13.6875 9.02057 15.0557 10.3547 15.0557 12C15.0556 13.6453 13.6875 14.9794 12 14.9795C10.3125 14.9795 8.9444 13.6453 8.94436 12C8.94436 10.3547 10.3125 9.02051 12 9.02051Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 4.84961C16.5562 4.84969 19.8416 7.87915 21.5801 9.99414C22.5513 11.1757 22.5513 12.8243 21.5801 14.0059C19.8416 16.1208 16.5562 19.1503 12 19.1504C7.44385 19.1504 4.15849 16.1209 2.41994 14.0059C1.44872 12.8243 1.44872 11.1757 2.41994 9.99414C4.15848 7.87913 7.44383 4.84961 12 4.84961ZM12 7C9.2386 7 7.00002 9.23858 7.00002 12C7.00002 14.7614 9.2386 17 12 17C14.7613 16.9999 17 14.7614 17 12C17 9.23864 14.7613 7.00011 12 7Z" fill="currentColor" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M7.82827 9.24219C7.30466 10.0327 7.00014 10.9808 7.00014 12C7.00014 14.7614 9.23872 17 12.0001 17C13.0192 16.9999 13.9666 16.6944 14.757 16.1709L16.6359 18.0498C15.2849 18.7104 13.7348 19.1503 12.0001 19.1504C7.44404 19.1504 4.15863 16.1209 2.42006 14.0059C1.44885 12.8243 1.44885 11.1757 2.42006 9.99414C3.18538 9.06312 4.24974 7.95388 5.59096 7.00488L7.82827 9.24219Z" fill="currentColor" />
    <path d="M12.0001 4.84961C16.5562 4.84977 19.8418 7.87918 21.5802 9.99414C22.5513 11.1756 22.5513 12.8244 21.5802 14.0059C20.8149 14.9369 19.7487 16.0441 18.4074 16.9932L16.1701 14.7559C16.6935 13.9655 17.0001 13.0189 17.0001 12C17.0001 9.23868 14.7614 7.00017 12.0001 7C10.981 7 10.0328 7.30457 9.24233 7.82812L7.3644 5.9502C8.71538 5.28962 10.2655 4.84961 12.0001 4.84961Z" fill="currentColor" />
    <path d="M12 9.02051C13.6875 9.02057 15.0557 10.3547 15.0557 12C15.0556 13.6453 13.6875 14.9794 12 14.9795C10.3125 14.9795 8.94441 13.6453 8.94437 12C8.94437 10.3547 10.3125 9.02051 12 9.02051Z" fill="currentColor" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M20.0335 4.54289C20.4182 4.21291 20.9982 4.22118 21.3733 4.57805C21.7483 4.93508 21.7855 5.51445 21.4749 5.91496L21.4085 5.99211L11.3001 16.6093C10.1952 17.7698 8.37327 17.8579 7.16237 16.8085L2.02858 12.3593L1.95534 12.288C1.60798 11.9192 1.58924 11.3404 1.92799 10.9491C2.26713 10.558 2.84352 10.4935 3.25807 10.7851L3.33913 10.8476L8.47291 15.2968C8.87655 15.6464 9.48361 15.6172 9.85182 15.2304L19.9592 4.6132L20.0335 4.54289Z" fill="currentColor" />
  </svg>
);

/**
 * 단일/멀티라인 입력, clearable, 비밀번호 보기, 타이머 표시를 통합한 입력 컴포넌트다.
 */
export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (
    {
      label,
      size = 'm',
      layout = 'vertical',
      theme = 'light',
      errorMessage,
      message,
      rightIcon,
      clearable = false,
      onClear,
      valid = false,
      timer,
      timerSeconds,
      onTimerEnd,
      multiline = false,
      maxLength,
      showCount = false,
      rows = 4,
      disabled = false,
      id: idProp,
      className,
      type = 'text',
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const isControlled = value !== undefined;
    const [currentValue, setCurrentValue] = useControllableState<string>(
      isControlled ? String(value) : undefined,
      String(defaultValue ?? ''),
    );
    const hasError = Boolean(errorMessage);

    const { isPassword, showPassword, inputType, toggle: togglePassword } = usePasswordToggle(type);
    const { displayTimer: countdownTimer } = useCountdownTimer(timerSeconds, onTimerEnd);
    const displayTimer = timerSeconds != null ? countdownTimer : timer;
    const showClear = clearable && !disabled && !valid && !displayTimer && currentValue.length > 0;
    const showRightSlot = showClear || valid || isPassword || displayTimer || rightIcon;

    /**
     * 내부 문자열 상태를 업데이트하고 외부 `onChange` 시그니처도 그대로 전달한다.
     *
     * @param e - input 또는 textarea의 변경 이벤트.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCurrentValue(e.target.value);
      (onChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>)?.(e as any);
    };

    /**
     * clear 버튼 클릭 시 DOM 값과 React 이벤트 흐름을 함께 비워
     * controlled/uncontrolled 케이스 모두 빈 값으로 동기화한다.
     */
    const handleClear = () => {
      setCurrentValue('');
      // controlled/uncontrolled 모두: 네이티브 setter로 value를 비운 뒤
      // input 이벤트를 발화해 React의 onChange가 빈 값을 받도록 함
      if (inputRef.current) {
        const el = inputRef.current;
        const proto = el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      onClear?.();
      inputRef.current?.focus();
    };

    /**
     * 외부 ref와 내부 ref를 동시에 갱신한다.
     *
     * @param el - 실제 렌더링된 input/textarea 요소.
     */
    const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRef.current = el;
      if (typeof ref === 'function') {
        ref(el as HTMLInputElement);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = el;
      }
    };

    const sharedProps = {
      id,
      className: styles.input,
      disabled,
      onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(true);
        onFocus?.(e as React.FocusEvent<HTMLInputElement>);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(false);
        onBlur?.(e as React.FocusEvent<HTMLInputElement>);
      },
      onChange: handleChange,
      ...(isControlled ? { value } : { defaultValue }),
    };

    /**
     * multiline 여부에 따라 `textarea` 또는 `input`을 같은 인터페이스로 렌더링한다.
     *
     * @returns 현재 props 조합에 맞는 입력 엘리먼트.
     */
    const renderInput = () => {
      if (multiline) {
        return (
          <div className={styles.textareaInner}>
            <textarea
              ref={setRef as React.Ref<HTMLTextAreaElement>}
              {...sharedProps}
              className={clsx(styles.input, styles.textarea)}
              rows={rows}
              maxLength={maxLength}
              {...(rest as TextareaProps)}
            />
            {showCount && maxLength && (
              <p className={styles.count}>({currentValue.length}/{maxLength})</p>
            )}
          </div>
        );
      }
      return (
        <input
          ref={setRef as React.Ref<HTMLInputElement>}
          {...sharedProps}
          type={inputType}
          maxLength={maxLength}
          {...(rest as InputProps)}
        />
      );
    };

    return (
      <div
        className={clsx(
          styles.root,
          styles[size],
          styles[theme],
          layout === 'horizontal' && styles.horizontal,
          className,
        )}
      >
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.fieldWrap}>
          <div
            className={clsx(
              styles.inputWrap,
              multiline && styles.multiline,
              focused && styles.focused,
              hasError && styles.error,
              valid && styles.valid,
              disabled && styles.disabled,
            )}
          >
            {renderInput()}

            {showRightSlot && !multiline && (
              <div className={styles.iconArea}>
                {displayTimer ? (
                  <span className={styles.timer}>{displayTimer}</span>
                ) : valid ? (
                  <CheckIcon />
                ) : showClear ? (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleClear}
                    aria-label="Clear"
                  >
                    <ClearIcon />
                  </button>
                ) : isPassword ? (
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={togglePassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                ) : (
                  rightIcon
                )}
              </div>
            )}
          </div>

          {hasError && <p className={styles.errorMsg}>{errorMessage}</p>}
          {!hasError && message && <p className={styles.msg}>{message}</p>}
        </div>
      </div>
    );
  },
);

TextField.displayName = 'TextField';
