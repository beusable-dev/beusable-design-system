import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import {
  addMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
  format,
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { useControllableState } from '../../hooks/useControllableState';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import styles from './DatePicker.module.css';

export type DatePickerMode = 'single' | 'range';
export type DatePickerRole = 'start' | 'end';
export type DatePickerVariant = 'a' | 'b' | 'c';

export interface DateRangeValue {
  startDate: Date | null;
  endDate: Date | null;
}

export type DatePickerValue = Date | null | DateRangeValue;

export interface DatePickerProps {
  mode?: DatePickerMode;
  months?: 1 | 2;
  role?: DatePickerRole;
  variant?: DatePickerVariant;
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  onChange?: (value: DatePickerValue) => void;
  timezone?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;
  maxRangeMonths?: number;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  disabled?: boolean;
  label?: string;
  errorMessage?: string;
  message?: string;
  nonstopAnalysis?: boolean;
  onNonstopAnalysisChange?: (value: boolean) => void;
  className?: string;
  style?: CSSProperties;
  hovered?: boolean;
}

interface MonthCell {
  date: Date | null;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 2.5V5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 2.5V5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 7.5H17.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5L5 8L9.5 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5L11 8L6.5 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinboxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 6L8 3L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinboxIconBlue() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 6L8 3L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 명시된 timezone이 없으면 실행 환경의 timezone을 사용한다.
 *
 * @param timezone - 외부에서 전달된 timezone 식별자.
 * @returns 실제 날짜 계산에 사용할 timezone 문자열.
 */
function getResolvedTimezone(timezone?: string) {
  if (timezone) return timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * timezone 기준 날짜를 비교 가능한 문자열 키(`yyyyMMdd`)로 정규화한다.
 *
 * @param date - 정규화할 날짜.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns 동일한 달력 날짜끼리 같은 값을 갖는 8자리 문자열 키.
 */
function getDateKey(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyyMMdd');
}

/**
 * 두 날짜가 같은 달력 날짜인지 timezone 기준으로 비교한다.
 *
 * @param left - 비교 대상 왼쪽 날짜.
 * @param right - 비교 대상 오른쪽 날짜.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns 같은 달력 날짜면 `true`.
 */
function isSameDay(left: Date | null, right: Date | null, timezone: string): boolean {
  if (!left || !right) return false;
  return getDateKey(left, timezone) === getDateKey(right, timezone);
}

/**
 * 두 날짜의 일 단위 선후 관계를 timezone 기준으로 비교한다.
 * 사전식 문자열 비교(yyyyMMdd)는 숫자 비교와 동일한 결과를 보장한다.
 *
 * @param left - 비교 기준 날짜.
 * @param right - 비교 대상 날짜.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns left < right → -1, left === right → 0, left > right → 1.
 */
function compareDay(left: Date, right: Date, timezone: string): number {
  const leftKey = getDateKey(left, timezone);
  const rightKey = getDateKey(right, timezone);
  if (leftKey < rightKey) return -1;
  if (leftKey > rightKey) return 1;
  return 0;
}

/**
 * 두 날짜의 월 단위 선후 관계를 비교한다.
 *
 * @param left - 비교 기준 날짜.
 * @param right - 비교 대상 날짜.
 * @returns 월 단위 비교 결과.
 */
function compareMonth(left: Date, right: Date) {
  const leftKey = left.getFullYear() * 12 + left.getMonth();
  const rightKey = right.getFullYear() * 12 + right.getMonth();
  return leftKey - rightKey;
}

/**
 * 목표 월이 허용된 최대 월을 넘지 않도록 보정한다.
 *
 * @param targetMonth - 이동하려는 목표 월.
 * @param maxMonth - 허용 가능한 마지막 월.
 * @returns 보정된 월 시작일.
 */
function clampMonthToMax(targetMonth: Date, maxMonth: Date) {
  if (compareMonth(targetMonth, maxMonth) > 0) return maxMonth;
  return targetMonth;
}

/**
 * timezone 기준 현재 월의 시작일을 구한다.
 *
 * @param timezone - 날짜를 해석할 timezone.
 * @returns 현재 월 1일의 Date.
 */
function getCurrentMonthStart(timezone: string): Date {
  const zonedNow = toZonedTime(new Date(), timezone);
  return startOfMonth(zonedNow);
}

/**
 * 1개월/2개월 뷰 조건에 따라 앞으로 이동 가능한 마지막 월을 계산한다.
 *
 * @param showTwoMonths - 2개월 뷰 여부.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns 다음 이동 한계가 되는 월 시작일.
 */
function getMaxViewMonth(showTwoMonths: boolean, timezone: string) {
  const currentMonth = getCurrentMonthStart(timezone);
  return showTwoMonths ? addMonths(currentMonth, -1) : currentMonth;
}

/**
 * 헤더에 표시할 월 제목 문자열로 포맷한다.
 *
 * @param date - 표시할 월.
 * @returns `"Apr, 2026"` 형태의 문자열.
 */
function toMonthTitle(date: Date): string {
  return format(date, 'MMM, yyyy');
}

/**
 * 트리거와 입력 영역에 표시할 사용자용 날짜 문자열을 만든다.
 *
 * @param date - 표시할 날짜.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns `"Apr 16, 2026"` 형태의 문자열.
 */
function toDisplayDate(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'MMM d, yyyy');
}

/**
 * timezone 오프셋 정보를 포함한 라벨 문자열을 만든다.
 *
 * @param timezone - 표시할 timezone.
 * @returns `"(+09:00) Asia/Seoul"` 같은 라벨.
 */
function toTimezoneLabel(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(new Date());
  const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value;
  if (!offsetPart) return timezone;
  const normalizedOffset = offsetPart.replace('GMT', '');
  return `(${normalizedOffset}) ${timezone}`;
}

/**
 * day button의 key와 aria-label에 사용할 ISO 형식 문자열을 만든다.
 *
 * @param date - 포맷할 날짜.
 * @returns `"yyyy-MM-dd"` 문자열.
 */
function toIsoDayLabel(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * single 모드에서 사용할 값을 `Date | null`로 정규화한다.
 *
 * @param value - 외부에서 받은 DatePicker 값.
 * @returns single 모드에서 사용할 날짜 값.
 */
function normalizeSingleValue(value: DatePickerValue | undefined): Date | null {
  if (value instanceof Date) return value;
  return null;
}

/**
 * range 모드 값을 `{ startDate, endDate }` 구조로 정규화한다.
 *
 * @param value - 외부에서 받은 DatePicker 값.
 * @returns start/end가 항상 존재하는 range 값.
 */
function normalizeRangeValue(value: DatePickerValue | undefined): DateRangeValue {
  if (value && typeof value === 'object' && 'startDate' in value && 'endDate' in value) {
    return {
      startDate: value.startDate ?? null,
      endDate: value.endDate ?? null,
    };
  }
  return { startDate: null, endDate: null };
}

/**
 * 한 달을 6주 그리드로 고정 렌더링하기 위한 셀 배열을 만든다.
 *
 * @param viewMonth - 렌더링할 월의 시작일(1일).
 * @returns 빈 셀을 포함한 42개짜리 날짜 셀 배열.
 */
function buildMonthCells(viewMonth: Date): MonthCell[] {
  const firstWeekday = getDay(viewMonth);
  const daysInMonth = getDaysInMonth(viewMonth);
  const cells: MonthCell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day) });
  }
  while (cells.length < 42) {
    cells.push({ date: null });
  }
  return cells;
}

/**
 * 특정 날짜가 timezone 기준 오늘인지 판별한다.
 *
 * @param date - 검사할 날짜.
 * @param timezone - 날짜를 해석할 timezone.
 * @returns 오늘이면 `true`.
 */
function isToday(date: Date, timezone: string) {
  return isSameDay(date, new Date(), timezone);
}

/**
 * single/range 선택, 드래프트 상태, timezone 기반 비교를 지원하는 날짜 선택기다.
 */
export function DatePicker({
  mode = 'range',
  months,
  role,
  variant = 'a',
  value,
  defaultValue,
  onChange,
  timezone,
  minDate,
  maxDate,
  disabledDate,
  maxRangeMonths,
  placeholder = 'Select date',
  startPlaceholder = 'Start Date',
  endPlaceholder = 'End Date',
  disabled = false,
  label,
  errorMessage,
  message,
  nonstopAnalysis,
  onNonstopAnalysisChange,
  className,
  style,
  hovered = false,
}: DatePickerProps) {
  const id = useId();
  // months prop이 없으면 range는 2개월, single은 1개월이 기본값
  const showTwoMonths = (months ?? (mode === 'range' ? 2 : 1)) === 2;
  const resolvedTimezone = getResolvedTimezone(timezone);
  const timezoneLabel = useMemo(() => toTimezoneLabel(resolvedTimezone), [resolvedTimezone]);

  const defaultState: DatePickerValue = useMemo(() => {
    if (defaultValue !== undefined) return defaultValue;
    return mode === 'single' ? null : { startDate: null, endDate: null };
  }, [defaultValue, mode]);

  const [committedValue, setCommittedValue] = useControllableState<DatePickerValue>(
    value,
    defaultState,
    onChange,
  );
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [localNonstopAnalysis, setLocalNonstopAnalysis] = useState(false);
  const effectiveNonstopAnalysis = nonstopAnalysis !== undefined ? nonstopAnalysis : localNonstopAnalysis;

  const popupRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const committedSingle = useMemo(() => normalizeSingleValue(committedValue), [committedValue]);
  const committedRange = useMemo(() => normalizeRangeValue(committedValue), [committedValue]);

  const [draftSingle, setDraftSingle] = useState<Date | null>(committedSingle);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(committedRange);

  useEffect(() => {
    if (mode === 'single') {
      setDraftSingle((prev) => (isSameDay(prev, committedSingle, resolvedTimezone) ? prev : committedSingle));
      return;
    }
    setDraftRange((prev) => (
      isSameDay(prev.startDate, committedRange.startDate, resolvedTimezone) &&
      isSameDay(prev.endDate, committedRange.endDate, resolvedTimezone)
        ? prev
        : committedRange
    ));
  }, [committedRange, committedSingle, mode, resolvedTimezone]);

  /**
   * 팝업을 열 때 현재 커밋 값을 드래프트로 복사하고 기준 월을 맞춘다.
   */
  const openCalendar = useCallback(() => {
    if (disabled) return;
    const maxViewMonth = getMaxViewMonth(showTwoMonths, resolvedTimezone);
    const baseDate = mode === 'single'
      ? (committedSingle ?? maxViewMonth)
      : (committedRange.startDate ?? committedRange.endDate ?? maxViewMonth);

    setDraftSingle(committedSingle);
    setDraftRange(committedRange);
    setViewMonth(clampMonthToMax(startOfMonth(baseDate), maxViewMonth));
    setOpen(true);
  }, [committedRange, committedSingle, disabled, mode, resolvedTimezone, showTwoMonths]);

  /**
   * 드래프트 상태를 마지막 커밋 값으로 되돌리고 팝업을 닫는다.
   */
  const closeCalendar = useCallback(() => {
    setDraftSingle(committedSingle);
    setDraftRange(committedRange);
    setOpen(false);
  }, [committedRange, committedSingle]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      const target = event.target as Node;
      if (rootRef.current.contains(target)) return;
      closeCalendar();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [closeCalendar, open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCalendar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeCalendar, open]);

  const leftMonth = viewMonth;
  const rightMonth = addMonths(viewMonth, 1);
  const maxViewMonth = getMaxViewMonth(showTwoMonths, resolvedTimezone);
  const canGoNextMonth = compareMonth(viewMonth, maxViewMonth) < 0;

  const rangeStart = draftRange.startDate;
  const rangeEnd = draftRange.endDate;
  const waitingForEnd = mode === 'range' && rangeStart !== null && rangeEnd === null;

  useEffect(() => {
    if (!waitingForEnd) setHoverDate(null);
  }, [waitingForEnd]);
  const rangeMaxDate =
    waitingForEnd && maxRangeMonths !== undefined ? addMonths(rangeStart, maxRangeMonths) : null;

  /**
   * min/max, range 제한, 사용자 정의 규칙을 종합해 날짜 비활성 여부를 판정한다.
   *
   * @param date - 검사할 날짜.
   * @returns 비활성 날짜면 `true`.
   */
  const isDisabledDay = useCallback(
    (date: Date) => {
      if (compareDay(date, new Date(), resolvedTimezone) > 0) return true;
      if (minDate && compareDay(date, minDate, resolvedTimezone) < 0) return true;
      if (maxDate && compareDay(date, maxDate, resolvedTimezone) > 0) return true;
      if (rangeMaxDate && compareDay(date, rangeMaxDate, resolvedTimezone) > 0) return true;
      if (disabledDate?.(date)) return true;
      return false;
    },
    [disabledDate, maxDate, minDate, rangeMaxDate, resolvedTimezone],
  );

  /**
   * single/range 모드 규칙에 따라 날짜 선택을 드래프트 또는 커밋 상태에 반영한다.
   *
   * @param date - 사용자가 선택한 날짜.
   */
  const selectDay = (date: Date) => {
    if (isDisabledDay(date)) return;
    if (mode === 'single') {
      setDraftSingle(date);
      setCommittedValue(date);
      setOpen(false);
      return;
    }

    // range mode
    if (!rangeStart || rangeEnd) {
      setDraftRange({ startDate: date, endDate: null });
      return;
    }
    const newStart = compareDay(date, rangeStart, resolvedTimezone) < 0 ? date : rangeStart;
    const newEnd = compareDay(date, rangeStart, resolvedTimezone) < 0 ? rangeStart : date;
    const newRange = { startDate: newStart, endDate: newEnd };
    setDraftRange(newRange);
    // 1개월 캘린더에서는 end 선택 즉시 적용
    if (!showTwoMonths) {
      setCommittedValue(newRange);
      setOpen(false);
    }
  };

  /**
   * 현재 드래프트 값을 최종 선택 값으로 확정한다.
   */
  const applySelection = () => {
    if (mode === 'single') {
      setCommittedValue(draftSingle);
    } else {
      setCommittedValue(draftRange);
    }
    setOpen(false);
  };

  const triggerText = useMemo(() => {
    if (mode === 'single') {
      return committedSingle ? toDisplayDate(committedSingle, resolvedTimezone) : placeholder;
    }
    const left = committedRange.startDate
      ? toDisplayDate(committedRange.startDate, resolvedTimezone)
      : startPlaceholder;
    const right = committedRange.endDate
      ? toDisplayDate(committedRange.endDate, resolvedTimezone)
      : endPlaceholder;
    return `${left} - ${right}`;
  }, [
    committedRange.endDate,
    committedRange.startDate,
    committedSingle,
    endPlaceholder,
    mode,
    placeholder,
    resolvedTimezone,
    startPlaceholder,
  ]);
  const hasValue = mode === 'single'
    ? committedSingle !== null
    : committedRange.startDate !== null || committedRange.endDate !== null;

  const popupStartText = mode === 'single'
    ? (draftSingle ? toDisplayDate(draftSingle, resolvedTimezone) : placeholder)
    : (rangeStart ? toDisplayDate(rangeStart, resolvedTimezone) : startPlaceholder);
  const popupEndText = mode === 'single'
    ? ''
    : (rangeEnd ? toDisplayDate(rangeEnd, resolvedTimezone) : endPlaceholder);

  /**
   * 월 헤더, 요일, 날짜 셀까지 포함한 단일 월 캘린더 블록을 렌더링한다.
   *
   * @param monthDate - 렌더링할 월.
   * @param showPrev - 이전 월 버튼 표시 여부.
   * @param showNext - 다음 월 버튼 표시 여부.
   * @returns 한 달 분량의 캘린더 JSX.
   */
  const renderCalendarMonth = (monthDate: Date, showPrev: boolean, showNext: boolean) => {
    const cells = buildMonthCells(monthDate);
    return (
        <div className={styles.month} key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}>
          <div
            className={clsx(
              styles.monthHeader,
              showPrev && showNext && styles.monthHeaderBoth,
              showPrev && !showNext && styles.monthHeaderLeft,
              !showPrev && showNext && styles.monthHeaderRight,
            )}
          >
            {showPrev && (
              <button
                type="button"
                className={clsx(styles.navButton, styles.navButtonPrev)}
                onClick={() => setViewMonth((prev) => addMonths(prev, -1))}
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </button>
            )}
            <span className={styles.monthTitle}>{toMonthTitle(monthDate)}</span>
            {showNext && (
              <button
                type="button"
                className={clsx(styles.navButton, styles.navButtonNext)}
                onClick={() =>
                  setViewMonth((prev) => {
                    const latestMaxViewMonth = getMaxViewMonth(showTwoMonths, resolvedTimezone);
                    return clampMonthToMax(addMonths(prev, 1), latestMaxViewMonth);
                  })
                }
                disabled={!canGoNextMonth}
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </button>
            )}
          </div>
        <div className={styles.weekdays}>
          {WEEKDAY_LABELS.map((labelItem) => (
            <span key={labelItem} className={styles.weekday}>
              {labelItem}
            </span>
          ))}
        </div>
        <div
          className={styles.grid}
          onMouseLeave={waitingForEnd ? () => setHoverDate(null) : undefined}
        >
          {cells.map((cell, index) => {
            if (!cell.date) {
              return <span key={`empty-${index}`} className={styles.emptyDay} aria-hidden="true" />;
            }
            const date = cell.date;
            const selectedSingle = mode === 'single' && isSameDay(draftSingle, date, resolvedTimezone);
            const selectedStart = mode === 'range' && isSameDay(rangeStart, date, resolvedTimezone);
            const selectedEnd = mode === 'range' && isSameDay(rangeEnd, date, resolvedTimezone);
            const inRange =
              mode === 'range' &&
              rangeStart &&
              rangeEnd &&
              compareDay(date, rangeStart, resolvedTimezone) > 0 &&
              compareDay(date, rangeEnd, resolvedTimezone) < 0;
            const prevDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            const prevInRange =
              inRange &&
              index % 7 !== 0 &&
              compareDay(prevDate, rangeStart!, resolvedTimezone) > 0 &&
              compareDay(prevDate, rangeEnd!, resolvedTimezone) < 0;
            const nextInRange =
              inRange &&
              index % 7 !== 6 &&
              compareDay(nextDate, rangeStart!, resolvedTimezone) > 0 &&
              compareDay(nextDate, rangeEnd!, resolvedTimezone) < 0;
            // Row-boundary: Sunday/Saturday where the range continues from/to adjacent row
            const rangeRowStart =
              inRange &&
              index % 7 === 0 &&
              !!rangeStart && !!rangeEnd &&
              compareDay(prevDate, rangeStart, resolvedTimezone) > 0 &&
              compareDay(prevDate, rangeEnd, resolvedTimezone) < 0;
            const rangeRowEnd =
              inRange &&
              index % 7 === 6 &&
              !!rangeStart && !!rangeEnd &&
              compareDay(nextDate, rangeStart, resolvedTimezone) > 0 &&
              compareDay(nextDate, rangeEnd, resolvedTimezone) < 0;
            const rangeSegmentStart = inRange && !prevInRange && !rangeRowStart;
            const rangeSegmentEnd = inRange && !nextInRange && !rangeRowEnd;
            // Hover preview: start 선택 후 end 확정 전 마우스 오버 구간
            const isHoverPreview =
              waitingForEnd &&
              !!hoverDate &&
              compareDay(date, rangeStart!, resolvedTimezone) > 0 &&
              compareDay(date, hoverDate, resolvedTimezone) < 0;
            const isHoverEnd =
              waitingForEnd &&
              !!hoverDate &&
              isSameDay(date, hoverDate, resolvedTimezone) &&
              compareDay(hoverDate, rangeStart!, resolvedTimezone) > 0;
            const hoverRangeRowStart =
              isHoverPreview &&
              index % 7 === 0 &&
              compareDay(prevDate, rangeStart!, resolvedTimezone) > 0 &&
              compareDay(prevDate, hoverDate!, resolvedTimezone) < 0;
            const hoverRangeRowEnd =
              isHoverPreview &&
              index % 7 === 6 &&
              compareDay(nextDate, rangeStart!, resolvedTimezone) > 0 &&
              compareDay(nextDate, hoverDate!, resolvedTimezone) < 0;
            const today = isToday(date, resolvedTimezone);
            const disabledDay = isDisabledDay(date);
            const stateTokens = [
              selectedSingle ? 'selected-single' : null,
              selectedStart ? 'selected-start' : null,
              selectedEnd ? 'selected-end' : null,
              inRange ? 'in-range' : null,
              rangeSegmentStart ? 'range-start' : null,
              rangeSegmentEnd ? 'range-end' : null,
              today ? 'today' : null,
              disabledDay ? 'disabled' : null,
            ].filter(Boolean).join(' ');
            return (
              <button
                key={toIsoDayLabel(date)}
                type="button"
                className={clsx(
                  styles.dayButton,
                  (selectedSingle || selectedStart || selectedEnd) && styles.daySelected,
                  selectedSingle && role === 'start' && styles.daySelectedSingleStart,
                  selectedSingle && role === 'end' && styles.daySelectedSingleEnd,
                  inRange && styles.dayInRange,
                  inRange && rangeRowStart && styles.dayInRangeRowStart,
                  inRange && rangeRowEnd && styles.dayInRangeRowEnd,
                  selectedStart && styles.daySelectedStart,
                  selectedEnd && styles.daySelectedEnd,
                  isHoverPreview && styles.dayHoverRange,
                  isHoverPreview && hoverRangeRowStart && styles.dayHoverRangeRowStart,
                  isHoverPreview && hoverRangeRowEnd && styles.dayHoverRangeRowEnd,
                  isHoverEnd && styles.dayHoverEnd,
                  today && styles.dayToday,
                )}
                onClick={() => selectDay(date)}
                disabled={disabledDay}
                aria-label={toIsoDayLabel(date)}
                data-state={stateTokens || undefined}
                onMouseEnter={waitingForEnd && !disabledDay ? () => setHoverDate(date) : undefined}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={rootRef} className={clsx(styles.root, className)} style={style}>
      {label && (
        <label className={styles.label} htmlFor={`${id}-trigger`}>
          {label}
        </label>
      )}

      <button
        id={`${id}-trigger`}
        type="button"
        className={clsx(
          styles.trigger,
          styles[`triggerVariant${variant.toUpperCase()}` as const],
          errorMessage && styles.triggerError,
          hovered && styles.triggerHovered,
          !hasValue && styles.triggerPlaceholderState,
          variant === 'c' && hasValue && styles.triggerVariantCValue,
          variant === 'c' && !hasValue && styles.triggerVariantCPlaceholder,
        )}
        disabled={disabled}
        aria-label="Open calendar"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={open ? closeCalendar : openCalendar}
      >
        {variant === 'a' && (
          <span className={styles.triggerIcon}>
            <CalendarIcon />
          </span>
        )}
        <span className={styles.triggerText}>{triggerText}</span>
        {(variant === 'b' || variant === 'c') && (
          <span className={clsx(styles.trailingIconArea, variant === 'c' && styles.trailingIconAreaC)}>
            {variant === 'c' ? <SpinboxIconBlue /> : <SpinboxIcon />}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popupRef}
          role="dialog"
          aria-label="Date picker calendar"
          className={clsx(styles.popup, !showTwoMonths && styles.popupSingle)}
        >
          {!showTwoMonths ? (
            <>
              <div className={styles.popupTopSingle}>
                <p className={styles.singleTimezone}>{timezoneLabel}</p>
                {renderCalendarMonth(leftMonth, true, true)}
              </div>
              <div className={styles.singleDivider} />
              <div className={styles.nonstopRow}>
                <Checkbox
                  id={`${id}-nonstop`}
                  size="m"
                  color="secondary"
                  label="Nonstop analysis"
                  className={styles.nonstopControl}
                  checked={effectiveNonstopAnalysis}
                  onChange={(e) => {
                    const v = e.target.checked;
                    if (nonstopAnalysis === undefined) setLocalNonstopAnalysis(v);
                    onNonstopAnalysisChange?.(v);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.popupTop}>
                <div className={styles.infoRow}>
                  <span className={clsx(styles.infoLabel, styles.infoLabelTimezone)}>Timezone</span>
                  <span className={styles.infoValue}>{timezoneLabel}</span>
                </div>
                <div className={styles.infoRowRange}>
                  <span className={clsx(styles.infoLabel, styles.infoLabelAnalysis)}>Analysis Period</span>
                  <div className={styles.rangeInputs}>
                    <div className={styles.rangeInput}>
                      <CalendarIcon />
                      <span className={clsx(!rangeStart && styles.placeholderText)}>{popupStartText}</span>
                    </div>
                    <span className={styles.rangeSeparator}>~</span>
                    <div className={styles.rangeInput}>
                      <CalendarIcon />
                      <span className={clsx(!rangeEnd && styles.placeholderText)}>{popupEndText}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.topDivider} />
              <div className={styles.calendarRow}>
                {renderCalendarMonth(leftMonth, true, false)}
                {renderCalendarMonth(rightMonth, false, true)}
              </div>
              <div className={styles.legendRow}>
                <div className={styles.legendItem}>
                  <span className={clsx(styles.legendDot, styles.legendFree)} aria-hidden="true" />
                  <span className={styles.legendText}>Free Plan</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={clsx(styles.legendDot, styles.legendPaid)} aria-hidden="true" />
                  <span className={styles.legendText}>Paid Plan</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={clsx(styles.legendDot, styles.legendSample)} aria-hidden="true" />
                  <span className={styles.legendText}>Paid Plan (Sampling)</span>
                </div>
              </div>
              <div className={styles.bottomDivider} />
              <div className={styles.footer}>
                <p className={styles.footerMessage}>
                  The maximum inquiry period is <strong>6 months.</strong>
                </p>
                <div className={styles.actionButtons}>
                  <Button
                    variant="secondary"
                    size="m"
                    shape="pill"
                    className={styles.cancelButton}
                    onClick={closeCalendar}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="m"
                    shape="pill"
                    className={styles.applyButton}
                    onClick={applySelection}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {!errorMessage && message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
