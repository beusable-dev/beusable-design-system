<script setup lang="ts">
import { ref, computed, watch, onUnmounted, useCssModule, useId } from 'vue';
import clsx from 'clsx';
import {
  addMonths,
  getDaysInMonth,
  getDay,
} from 'date-fns';
import { toZonedTime, formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { useControllableState } from '../../composables/useControllableState';
import Button from '../Button/Button.vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import type { DatePickerMode, DatePickerRole, DatePickerVariant, DateRangeValue, DatePickerValue } from './types';

interface MonthCell {
  date: Date | null;
  dayNumber: number | null;
}

interface CellState {
  date: Date | null;
  dayNumber: number | null;
  index: number;
  key: string;
  selectedSingle: boolean;
  selectedStart: boolean;
  selectedEnd: boolean;
  inRange: boolean;
  rangeRowStart: boolean;
  rangeRowEnd: boolean;
  rangeSegmentStart: boolean;
  rangeSegmentEnd: boolean;
  isHoverPreview: boolean;
  isHoverEnd: boolean;
  hoverRangeRowStart: boolean;
  hoverRangeRowEnd: boolean;
  today: boolean;
  disabled: boolean;
}

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = withDefaults(
  defineProps<{
    mode?: DatePickerMode;
    months?: 1 | 2;
    role?: DatePickerRole;
    variant?: DatePickerVariant;
    modelValue?: DatePickerValue;
    defaultValue?: DatePickerValue;
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
    className?: string;
    style?: Record<string, string>;
    hovered?: boolean;
  }>(),
  {
    mode: 'range',
    variant: 'a',
    placeholder: 'Select date',
    startPlaceholder: 'Start Date',
    endPlaceholder: 'End Date',
    disabled: false,
    hovered: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: DatePickerValue];
  'nonstopAnalysisChange': [value: boolean];
}>();

// ─── Utility functions ────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getResolvedTimezone(tz?: string): string {
  if (tz) return tz;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getDateKey(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyyMMdd');
}

function isSameDay(left: Date | null, right: Date | null, timezone: string): boolean {
  if (!left || !right) return false;
  return getDateKey(left, timezone) === getDateKey(right, timezone);
}

function compareDay(left: Date, right: Date, timezone: string): number {
  const lk = getDateKey(left, timezone);
  const rk = getDateKey(right, timezone);
  if (lk < rk) return -1;
  if (lk > rk) return 1;
  return 0;
}

function compareMonth(left: Date, right: Date): number {
  return (left.getFullYear() * 12 + left.getMonth()) - (right.getFullYear() * 12 + right.getMonth());
}

function clampMonthToMax(target: Date, max: Date): Date {
  return compareMonth(target, max) > 0 ? max : target;
}

function getCurrentMonthStart(timezone: string): Date {
  const now = new Date();
  const tzYear = parseInt(formatInTimeZone(now, timezone, 'yyyy'), 10);
  const tzMonth = parseInt(formatInTimeZone(now, timezone, 'MM'), 10) - 1;
  return fromZonedTime(new Date(tzYear, tzMonth, 1, 12, 0, 0), timezone);
}

function getMaxViewMonth(showTwoMonths: boolean, timezone: string): Date {
  const cur = getCurrentMonthStart(timezone);
  return showTwoMonths ? addMonths(cur, -1) : cur;
}

function toMonthTitle(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'MMM, yyyy');
}

function toDisplayDate(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'MMM d, yyyy');
}

function toTimezoneLabel(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(new Date());
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value;
  if (!offsetPart) return timezone;
  return `(${offsetPart.replace('GMT', '')}) ${timezone}`;
}

function toIsoDayLabel(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

function normalizeSingleValue(value: DatePickerValue | undefined): Date | null {
  if (value instanceof Date) return value;
  return null;
}

function normalizeRangeValue(value: DatePickerValue | undefined): DateRangeValue {
  if (value && typeof value === 'object' && 'startDate' in value && 'endDate' in value) {
    return { startDate: value.startDate ?? null, endDate: value.endDate ?? null };
  }
  return { startDate: null, endDate: null };
}

function buildMonthCells(viewMonth: Date, timezone: string): MonthCell[] {
  // Extract year/month in target timezone — never rely on local getters, because
  // fromZonedTime-based viewMonth dates have UTC ≠ target-TZ midnight for negative offsets.
  const tzYear = parseInt(formatInTimeZone(viewMonth, timezone, 'yyyy'), 10);
  const tzMonth = parseInt(formatInTimeZone(viewMonth, timezone, 'MM'), 10) - 1;

  // toZonedTime so that date-fns getDay/getDaysInMonth see target-TZ local values
  const firstDayZoned = toZonedTime(
    fromZonedTime(new Date(tzYear, tzMonth, 1, 12, 0, 0), timezone),
    timezone,
  );
  const firstWeekday = getDay(firstDayZoned);
  const daysInMonth = getDaysInMonth(firstDayZoned);

  const cells: MonthCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, dayNumber: null });
  for (let d = 1; d <= daysInMonth; d++) {
    // noon on day d in target timezone — fromZonedTime reads LOCAL values of new Date(...)
    // as if they are in `timezone`, producing a UTC stamp where formatInTimeZone gives day d.
    const date = fromZonedTime(new Date(tzYear, tzMonth, d, 12, 0, 0), timezone);
    cells.push({ date, dayNumber: d });
  }
  while (cells.length < 42) cells.push({ date: null, dayNumber: null });
  return cells;
}

// ─── State ───────────────────────────────────────────────────────────────────

const id = useId();
const styles = useCssModule();
const rootRef = ref<HTMLDivElement | null>(null);

const showTwoMonths = computed(() => ((props.months ?? (props.mode === 'range' ? 2 : 1)) === 2));
const resolvedTimezone = computed(() => getResolvedTimezone(props.timezone));
const timezoneLabel = computed(() => toTimezoneLabel(resolvedTimezone.value));

const defaultState = computed<DatePickerValue>(() => {
  if (props.defaultValue !== undefined) return props.defaultValue;
  return props.mode === 'single' ? null : { startDate: null, endDate: null };
});

const { value: committedValue, setValue: setCommittedValue } = useControllableState<DatePickerValue>(
  () => props.modelValue,
  defaultState.value,
  (v) => emit('update:modelValue', v),
);

const isOpen = ref(false);
const viewMonth = ref<Date>(new Date());
const hoverDate = ref<Date | null>(null);
const localNonstopAnalysis = ref(false);

const effectiveNonstopAnalysis = computed(() =>
  props.nonstopAnalysis !== undefined ? props.nonstopAnalysis : localNonstopAnalysis.value,
);

const committedSingle = computed(() => normalizeSingleValue(committedValue.value));
const committedRange = computed(() => normalizeRangeValue(committedValue.value));

const draftSingle = ref<Date | null>(committedSingle.value);
const draftRange = ref<DateRangeValue>({ ...committedRange.value });

// committed 변경 시 draft 동기화
watch(committedSingle, (next) => {
  if (props.mode !== 'single') return;
  if (!isSameDay(draftSingle.value, next, resolvedTimezone.value)) {
    draftSingle.value = next;
  }
});
watch(committedRange, (next) => {
  if (props.mode === 'single') return;
  const sameStart = isSameDay(draftRange.value.startDate, next.startDate, resolvedTimezone.value);
  const sameEnd = isSameDay(draftRange.value.endDate, next.endDate, resolvedTimezone.value);
  if (!sameStart || !sameEnd) {
    draftRange.value = { ...next };
  }
});

const leftMonth = computed(() => viewMonth.value);
const rightMonth = computed(() => addMonths(viewMonth.value, 1));
const maxViewMonth = computed(() => getMaxViewMonth(showTwoMonths.value, resolvedTimezone.value));
const canGoNextMonth = computed(() => compareMonth(viewMonth.value, maxViewMonth.value) < 0);

const rangeStart = computed(() => draftRange.value.startDate);
const rangeEnd = computed(() => draftRange.value.endDate);
const waitingForEnd = computed(() =>
  props.mode === 'range' && rangeStart.value !== null && rangeEnd.value === null,
);

watch(waitingForEnd, (v) => {
  if (!v) hoverDate.value = null;
});

const rangeMaxDate = computed(() =>
  waitingForEnd.value && props.maxRangeMonths !== undefined && rangeStart.value
    ? addMonths(rangeStart.value, props.maxRangeMonths)
    : null,
);

// ─── isDisabledDay ────────────────────────────────────────────────────────────

function isDisabledDay(date: Date): boolean {
  if (compareDay(date, new Date(), resolvedTimezone.value) > 0) return true;
  if (props.minDate && compareDay(date, props.minDate, resolvedTimezone.value) < 0) return true;
  if (props.maxDate && compareDay(date, props.maxDate, resolvedTimezone.value) > 0) return true;
  if (rangeMaxDate.value && compareDay(date, rangeMaxDate.value, resolvedTimezone.value) > 0) return true;
  if (props.disabledDate?.(date)) return true;
  return false;
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date(), resolvedTimezone.value);
}

// ─── openCalendar / closeCalendar ─────────────────────────────────────────────

function openCalendar() {
  if (props.disabled) return;
  const tz = resolvedTimezone.value;
  const max = getMaxViewMonth(showTwoMonths.value, tz);
  const baseDate =
    props.mode === 'single'
      ? (committedSingle.value ?? max)
      : (committedRange.value.startDate ?? committedRange.value.endDate ?? max);

  draftSingle.value = committedSingle.value;
  draftRange.value = { ...committedRange.value };

  // Build month start in target timezone — startOfMonth(baseDate) is local-timezone-based
  // and gives wrong results when baseDate's UTC is in a different TZ month than expected.
  const tzYear = parseInt(formatInTimeZone(baseDate, tz, 'yyyy'), 10);
  const tzMonth = parseInt(formatInTimeZone(baseDate, tz, 'MM'), 10) - 1;
  const tzMonthStart = fromZonedTime(new Date(tzYear, tzMonth, 1, 12, 0, 0), tz);
  viewMonth.value = clampMonthToMax(tzMonthStart, max);
  isOpen.value = true;
}

function closeCalendar() {
  draftSingle.value = committedSingle.value;
  draftRange.value = { ...committedRange.value };
  isOpen.value = false;
}

// ─── Document event listeners ─────────────────────────────────────────────────

function handleOutside(e: MouseEvent) {
  if (!rootRef.value) return;
  if (rootRef.value.contains(e.target as Node)) return;
  closeCalendar();
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') closeCalendar();
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('mousedown', handleOutside);
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutside);
  document.removeEventListener('keydown', handleEscape);
});

// ─── selectDay / applySelection ───────────────────────────────────────────────

function selectDay(date: Date) {
  if (isDisabledDay(date)) return;

  if (props.mode === 'single') {
    draftSingle.value = date;
    setCommittedValue(date);
    isOpen.value = false;
    return;
  }

  // range mode
  if (!rangeStart.value || rangeEnd.value) {
    draftRange.value = { startDate: date, endDate: null };
    return;
  }
  const newStart = compareDay(date, rangeStart.value, resolvedTimezone.value) < 0 ? date : rangeStart.value;
  const newEnd = compareDay(date, rangeStart.value, resolvedTimezone.value) < 0 ? rangeStart.value : date;
  const newRange = { startDate: newStart, endDate: newEnd };
  draftRange.value = newRange;
  if (!showTwoMonths.value) {
    setCommittedValue(newRange);
    isOpen.value = false;
  }
}

function applySelection() {
  if (props.mode === 'single') {
    setCommittedValue(draftSingle.value);
  } else {
    setCommittedValue(draftRange.value);
  }
  isOpen.value = false;
}

function prevMonth() {
  viewMonth.value = addMonths(viewMonth.value, -1);
}

function nextMonth() {
  const max = getMaxViewMonth(showTwoMonths.value, resolvedTimezone.value);
  viewMonth.value = clampMonthToMax(addMonths(viewMonth.value, 1), max);
}

// ─── Trigger text ─────────────────────────────────────────────────────────────

const triggerText = computed(() => {
  if (props.mode === 'single') {
    return committedSingle.value
      ? toDisplayDate(committedSingle.value, resolvedTimezone.value)
      : props.placeholder;
  }
  const left = committedRange.value.startDate
    ? toDisplayDate(committedRange.value.startDate, resolvedTimezone.value)
    : props.startPlaceholder;
  const right = committedRange.value.endDate
    ? toDisplayDate(committedRange.value.endDate, resolvedTimezone.value)
    : props.endPlaceholder;
  return `${left} - ${right}`;
});

const hasValue = computed(() =>
  props.mode === 'single'
    ? committedSingle.value !== null
    : committedRange.value.startDate !== null || committedRange.value.endDate !== null,
);

const popupStartText = computed(() =>
  props.mode === 'single'
    ? (draftSingle.value ? toDisplayDate(draftSingle.value, resolvedTimezone.value) : props.placeholder)
    : (rangeStart.value ? toDisplayDate(rangeStart.value, resolvedTimezone.value) : props.startPlaceholder),
);

const popupEndText = computed(() =>
  props.mode === 'single'
    ? ''
    : (rangeEnd.value ? toDisplayDate(rangeEnd.value, resolvedTimezone.value) : props.endPlaceholder),
);

// ─── Trigger CSS classes ──────────────────────────────────────────────────────

const triggerClass = computed(() => [
  styles.trigger,
  styles[`triggerVariant${props.variant!.toUpperCase()}` as keyof typeof styles],
  props.errorMessage ? styles.triggerError : '',
  props.hovered ? styles.triggerHovered : '',
  !hasValue.value ? styles.triggerPlaceholderState : '',
  props.variant === 'c' && hasValue.value ? styles.triggerVariantCValue : '',
  props.variant === 'c' && !hasValue.value ? styles.triggerVariantCPlaceholder : '',
].filter(Boolean));

// ─── Cell state computation ───────────────────────────────────────────────────

function buildCellStates(monthDate: Date): CellState[] {
  const cells = buildMonthCells(monthDate, resolvedTimezone.value);
  return cells.map((cell, index) => {
    if (!cell.date) {
      return {
        date: null,
        dayNumber: null,
        index,
        key: `empty-${index}`,
        selectedSingle: false,
        selectedStart: false,
        selectedEnd: false,
        inRange: false,
        rangeRowStart: false,
        rangeRowEnd: false,
        rangeSegmentStart: false,
        rangeSegmentEnd: false,
        isHoverPreview: false,
        isHoverEnd: false,
        hoverRangeRowStart: false,
        hoverRangeRowEnd: false,
        today: false,
        disabled: false,
      };
    }

    const date = cell.date;
    const tz = resolvedTimezone.value;
    const rs = rangeStart.value;
    const re = rangeEnd.value;
    const hd = hoverDate.value;
    const we = waitingForEnd.value;

    const selectedSingle = props.mode === 'single' && isSameDay(draftSingle.value, date, tz);
    const selectedStart = props.mode === 'range' && isSameDay(rs, date, tz);
    const selectedEnd = props.mode === 'range' && isSameDay(re, date, tz);
    const inRange = !!(
      props.mode === 'range' &&
      rs && re &&
      compareDay(date, rs, tz) > 0 &&
      compareDay(date, re, tz) < 0
    );

    // Cell dates are at noon in target timezone, so ±86400000ms = noon prev/next day
    const prevDate = new Date(date.getTime() - 86400000);
    const nextDate = new Date(date.getTime() + 86400000);

    const prevInRange = !!(
      inRange && index % 7 !== 0 &&
      rs && re &&
      compareDay(prevDate, rs, tz) > 0 &&
      compareDay(prevDate, re, tz) < 0
    );
    const nextInRange = !!(
      inRange && index % 7 !== 6 &&
      rs && re &&
      compareDay(nextDate, rs, tz) > 0 &&
      compareDay(nextDate, re, tz) < 0
    );
    const rangeRowStart = !!(
      inRange && index % 7 === 0 &&
      rs && re &&
      compareDay(prevDate, rs, tz) > 0 &&
      compareDay(prevDate, re, tz) < 0
    );
    const rangeRowEnd = !!(
      inRange && index % 7 === 6 &&
      rs && re &&
      compareDay(nextDate, rs, tz) > 0 &&
      compareDay(nextDate, re, tz) < 0
    );
    const rangeSegmentStart = inRange && !prevInRange && !rangeRowStart;
    const rangeSegmentEnd = inRange && !nextInRange && !rangeRowEnd;

    const isHoverPreview = !!(
      we && hd && rs &&
      compareDay(date, rs, tz) > 0 &&
      compareDay(date, hd, tz) < 0
    );
    const isHoverEnd = !!(
      we && hd && rs &&
      isSameDay(date, hd, tz) &&
      compareDay(hd, rs, tz) > 0
    );
    const hoverRangeRowStart = !!(
      isHoverPreview && index % 7 === 0 && rs && hd &&
      compareDay(prevDate, rs, tz) > 0 &&
      compareDay(prevDate, hd, tz) < 0
    );
    const hoverRangeRowEnd = !!(
      isHoverPreview && index % 7 === 6 && rs && hd &&
      compareDay(nextDate, rs, tz) > 0 &&
      compareDay(nextDate, hd, tz) < 0
    );

    return {
      date,
      dayNumber: cell.dayNumber,
      index,
      key: toIsoDayLabel(date, tz),
      selectedSingle,
      selectedStart,
      selectedEnd,
      inRange,
      rangeRowStart,
      rangeRowEnd,
      rangeSegmentStart,
      rangeSegmentEnd,
      isHoverPreview,
      isHoverEnd,
      hoverRangeRowStart,
      hoverRangeRowEnd,
      today: isToday(date),
      disabled: isDisabledDay(date),
    };
  });
}

const leftMonthCells = computed(() => buildCellStates(leftMonth.value));
const rightMonthCells = computed(() => buildCellStates(rightMonth.value));

// ─── Day button class builder ─────────────────────────────────────────────────

function dayButtonClass(cell: CellState): (string | false)[] {
  return [
    styles.dayButton,
    (cell.selectedSingle || cell.selectedStart || cell.selectedEnd) && styles.daySelected,
    cell.selectedSingle && props.role === 'start' && styles.daySelectedSingleStart,
    cell.selectedSingle && props.role === 'end' && styles.daySelectedSingleEnd,
    cell.inRange && styles.dayInRange,
    cell.inRange && cell.rangeRowStart && styles.dayInRangeRowStart,
    cell.inRange && cell.rangeRowEnd && styles.dayInRangeRowEnd,
    cell.selectedStart && styles.daySelectedStart,
    cell.selectedEnd && styles.daySelectedEnd,
    cell.isHoverPreview && styles.dayHoverRange,
    cell.isHoverPreview && cell.hoverRangeRowStart && styles.dayHoverRangeRowStart,
    cell.isHoverPreview && cell.hoverRangeRowEnd && styles.dayHoverRangeRowEnd,
    cell.isHoverEnd && styles.dayHoverEnd,
    cell.today && styles.dayToday,
  ].filter(Boolean) as string[];
}

function dayStateTokens(cell: CellState): string | undefined {
  const tokens = [
    cell.selectedSingle ? 'selected-single' : null,
    cell.selectedStart ? 'selected-start' : null,
    cell.selectedEnd ? 'selected-end' : null,
    cell.inRange ? 'in-range' : null,
    cell.rangeSegmentStart ? 'range-start' : null,
    cell.rangeSegmentEnd ? 'range-end' : null,
    cell.today ? 'today' : null,
    cell.disabled ? 'disabled' : null,
  ].filter(Boolean).join(' ');
  return tokens || undefined;
}

function handleNonstopChange(v: boolean) {
  if (props.nonstopAnalysis === undefined) localNonstopAnalysis.value = v;
  emit('nonstopAnalysisChange', v);
}
</script>

<template>
  <div ref="rootRef" :class="clsx(styles.root, className)" :style="style">
    <!-- Label -->
    <label v-if="label" :class="styles.label" :for="`${id}-trigger`">{{ label }}</label>

    <!-- Trigger button -->
    <button
      :id="`${id}-trigger`"
      type="button"
      :class="triggerClass"
      :disabled="disabled"
      aria-label="Open calendar"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="isOpen ? closeCalendar() : openCalendar()"
    >
      <span v-if="variant === 'a'" :class="styles.triggerIcon">
        <!-- CalendarIcon -->
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2.5" y="3.5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M6 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M14 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M2.5 7.5H17.5" stroke="currentColor" stroke-width="2" />
        </svg>
      </span>
      <span :class="styles.triggerText">{{ triggerText }}</span>
      <span
        v-if="variant === 'b' || variant === 'c'"
        :class="[styles.trailingIconArea, variant === 'c' && styles.trailingIconAreaC]"
      >
        <!-- SpinboxIcon -->
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5 6L8 3L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M5 10L8 13L11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <!-- Popup -->
    <div
      v-if="isOpen"
      role="dialog"
      aria-label="Date picker calendar"
      :class="[styles.popup, !showTwoMonths && styles.popupSingle]"
    >
      <!-- Single month layout -->
      <template v-if="!showTwoMonths">
        <div :class="styles.popupTopSingle">
          <p :class="styles.singleTimezone">{{ timezoneLabel }}</p>

          <!-- Calendar month (single: showPrev=true, showNext=true) -->
          <div :class="styles.month">
            <div :class="[styles.monthHeader, styles.monthHeaderBoth]">
              <button type="button" :class="[styles.navButton, styles.navButtonPrev]" @click="prevMonth" aria-label="Previous month">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <span :class="styles.monthTitle">{{ toMonthTitle(leftMonth, resolvedTimezone) }}</span>
              <button type="button" :class="[styles.navButton, styles.navButtonNext]" @click="nextMonth" :disabled="!canGoNextMonth" aria-label="Next month">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <div :class="styles.weekdays">
              <span v-for="wl in WEEKDAY_LABELS" :key="wl" :class="styles.weekday">{{ wl }}</span>
            </div>
            <div :class="styles.grid" @mouseleave="waitingForEnd ? (hoverDate = null) : undefined">
              <template v-for="cell in leftMonthCells" :key="cell.key">
                <span v-if="!cell.date" :class="styles.emptyDay" aria-hidden="true" />
                <button
                  v-else
                  type="button"
                  :class="dayButtonClass(cell)"
                  :disabled="cell.disabled"
                  :aria-label="cell.key"
                  :data-state="dayStateTokens(cell)"
                  @click="selectDay(cell.date!)"
                  @mouseenter="waitingForEnd && !cell.disabled ? (hoverDate = cell.date) : undefined"
                >{{ cell.dayNumber }}</button>
              </template>
            </div>
          </div>
        </div>

        <div :class="styles.singleDivider" />

        <div :class="styles.nonstopRow">
          <Checkbox
            :id="`${id}-nonstop`"
            size="m"
            color="secondary"
            label="Nonstop analysis"
            :class="styles.nonstopControl"
            :model-value="effectiveNonstopAnalysis"
            @change="handleNonstopChange"
          />
        </div>
      </template>

      <!-- Two months layout -->
      <template v-else>
        <div :class="styles.popupTop">
          <div :class="styles.infoRow">
            <span :class="[styles.infoLabel, styles.infoLabelTimezone]">Timezone</span>
            <span :class="styles.infoValue">{{ timezoneLabel }}</span>
          </div>
          <div :class="styles.infoRowRange">
            <span :class="[styles.infoLabel, styles.infoLabelAnalysis]">Analysis Period</span>
            <div :class="styles.rangeInputs">
              <div :class="styles.rangeInput">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="2.5" y="3.5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M6 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M14 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M2.5 7.5H17.5" stroke="currentColor" stroke-width="2" />
                </svg>
                <span :class="!rangeStart ? styles.placeholderText : undefined">{{ popupStartText }}</span>
              </div>
              <span :class="styles.rangeSeparator">~</span>
              <div :class="styles.rangeInput">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="2.5" y="3.5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M6 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M14 2.5V5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M2.5 7.5H17.5" stroke="currentColor" stroke-width="2" />
                </svg>
                <span :class="!rangeEnd ? styles.placeholderText : undefined">{{ popupEndText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div :class="styles.topDivider" />

        <!-- Two calendar months side by side -->
        <div :class="styles.calendarRow">
          <!-- Left month (showPrev=true, showNext=false) -->
          <div :class="styles.month">
            <div :class="[styles.monthHeader, styles.monthHeaderLeft]">
              <button type="button" :class="[styles.navButton, styles.navButtonPrev]" @click="prevMonth" aria-label="Previous month">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M9.5 3.5L5 8L9.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <span :class="styles.monthTitle">{{ toMonthTitle(leftMonth, resolvedTimezone) }}</span>
            </div>
            <div :class="styles.weekdays">
              <span v-for="wl in WEEKDAY_LABELS" :key="wl" :class="styles.weekday">{{ wl }}</span>
            </div>
            <div :class="styles.grid" @mouseleave="waitingForEnd ? (hoverDate = null) : undefined">
              <template v-for="cell in leftMonthCells" :key="cell.key">
                <span v-if="!cell.date" :class="styles.emptyDay" aria-hidden="true" />
                <button
                  v-else
                  type="button"
                  :class="dayButtonClass(cell)"
                  :disabled="cell.disabled"
                  :aria-label="cell.key"
                  :data-state="dayStateTokens(cell)"
                  @click="selectDay(cell.date!)"
                  @mouseenter="waitingForEnd && !cell.disabled ? (hoverDate = cell.date) : undefined"
                >{{ cell.dayNumber }}</button>
              </template>
            </div>
          </div>

          <!-- Right month (showPrev=false, showNext=true) -->
          <div :class="styles.month">
            <div :class="[styles.monthHeader, styles.monthHeaderRight]">
              <span :class="styles.monthTitle">{{ toMonthTitle(rightMonth, resolvedTimezone) }}</span>
              <button type="button" :class="[styles.navButton, styles.navButtonNext]" @click="nextMonth" :disabled="!canGoNextMonth" aria-label="Next month">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <div :class="styles.weekdays">
              <span v-for="wl in WEEKDAY_LABELS" :key="wl" :class="styles.weekday">{{ wl }}</span>
            </div>
            <div :class="styles.grid" @mouseleave="waitingForEnd ? (hoverDate = null) : undefined">
              <template v-for="cell in rightMonthCells" :key="cell.key">
                <span v-if="!cell.date" :class="styles.emptyDay" aria-hidden="true" />
                <button
                  v-else
                  type="button"
                  :class="dayButtonClass(cell)"
                  :disabled="cell.disabled"
                  :aria-label="cell.key"
                  :data-state="dayStateTokens(cell)"
                  @click="selectDay(cell.date!)"
                  @mouseenter="waitingForEnd && !cell.disabled ? (hoverDate = cell.date) : undefined"
                >{{ cell.dayNumber }}</button>
              </template>
            </div>
          </div>
        </div>

        <div :class="styles.legendRow">
          <div :class="styles.legendItem">
            <span :class="[styles.legendDot, styles.legendFree]" aria-hidden="true" />
            <span :class="styles.legendText">Free Plan</span>
          </div>
          <div :class="styles.legendItem">
            <span :class="[styles.legendDot, styles.legendPaid]" aria-hidden="true" />
            <span :class="styles.legendText">Paid Plan</span>
          </div>
          <div :class="styles.legendItem">
            <span :class="[styles.legendDot, styles.legendSample]" aria-hidden="true" />
            <span :class="styles.legendText">Paid Plan (Sampling)</span>
          </div>
        </div>

        <div :class="styles.bottomDivider" />

        <div :class="styles.footer">
          <p :class="styles.footerMessage">
            The maximum inquiry period is <strong>6 months.</strong>
          </p>
          <div :class="styles.actionButtons">
            <Button
              variant="secondary"
              size="m"
              shape="pill"
              :class="styles.cancelButton"
              @click="closeCalendar"
            >Cancel</Button>
            <Button
              variant="primary"
              size="m"
              shape="pill"
              :class="styles.applyButton"
              @click="applySelection"
            >Apply</Button>
          </div>
        </div>
      </template>
    </div>

    <!-- Error / Message -->
    <p v-if="errorMessage" :class="styles.error">{{ errorMessage }}</p>
    <p v-else-if="message" :class="styles.message">{{ message }}</p>
  </div>
</template>

<style module src="./DatePicker.module.css"></style>
