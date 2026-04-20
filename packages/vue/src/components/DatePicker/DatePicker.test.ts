import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { fromZonedTime } from 'date-fns-tz';
import DatePicker from './DatePicker.vue';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a UTC midnight Date for a given yyyy-MM-dd calendar date */
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Returns the day-button element whose aria-label matches `yyyy-MM-dd`
 * in the rendered calendar.
 */
function getDayButton(wrapper: ReturnType<typeof mount>, label: string): Element | null {
  return wrapper.element.querySelector(`[aria-label="${label}"]`);
}

/**
 * Returns day-button elements whose aria-label is an ISO date (yyyy-MM-dd).
 * Excludes navigation buttons ("Previous month", "Next month", "Open calendar").
 */
function getAllDayButtons(wrapper: ReturnType<typeof mount>): HTMLButtonElement[] {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  return (Array.from(wrapper.element.querySelectorAll('button[aria-label]')) as HTMLButtonElement[]).filter(
    (b) => ISO_DATE.test(b.getAttribute('aria-label') ?? ''),
  );
}

// ─── Single mode ─────────────────────────────────────────────────────────────

describe('DatePicker — single mode', () => {
  it('opens the calendar on trigger click', async () => {
    const wrapper = mount(DatePicker, { props: { mode: 'single' } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('selects a date and closes the calendar', async () => {
    const onChange = vi.fn();
    const wrapper = mount(DatePicker, {
      props: {
        mode: 'single',
        timezone: 'UTC',
        'onUpdate:modelValue': onChange,
      },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    // find any enabled day button and click it
    const buttons = getAllDayButtons(wrapper);
    const enabled = Array.from(buttons).find(
      (b) => !(b as HTMLButtonElement).disabled,
    ) as HTMLButtonElement;
    expect(enabled).toBeTruthy();
    await wrapper.find(`[aria-label="${enabled.getAttribute('aria-label')}"]`).trigger('click');

    expect(onChange).toHaveBeenCalledOnce();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('closes on Escape key', async () => {
    const wrapper = mount(DatePicker, { props: { mode: 'single' } });
    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('does not open when disabled', async () => {
    const wrapper = mount(DatePicker, { props: { mode: 'single', disabled: true } });
    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
});

// ─── Range mode ──────────────────────────────────────────────────────────────

describe('DatePicker — range mode', () => {
  it('opens the calendar on trigger click', async () => {
    const wrapper = mount(DatePicker, { props: { mode: 'range' } });
    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('single-month range: selects start then end and commits immediately', async () => {
    const onChange = vi.fn();
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // current UTC month
    const pad = (n: number) => String(n).padStart(2, '0');

    const wrapper = mount(DatePicker, {
      props: {
        mode: 'range',
        months: 1,
        timezone: 'UTC',
        'onUpdate:modelValue': onChange,
      },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    // click day 1 (start)
    const startLabel = `${year}-${pad(month)}-01`;
    await wrapper.find(`[aria-label="${startLabel}"]`).trigger('click');
    expect(onChange).not.toHaveBeenCalled(); // not yet committed

    // click day 3 (end)
    const endLabel = `${year}-${pad(month)}-03`;
    await wrapper.find(`[aria-label="${endLabel}"]`).trigger('click');

    expect(onChange).toHaveBeenCalledOnce();
    const emitted = onChange.mock.calls[0][0] as { startDate: Date; endDate: Date };
    expect(emitted.startDate).toBeInstanceOf(Date);
    expect(emitted.endDate).toBeInstanceOf(Date);
  });
});

// ─── minDate / maxDate constraints ──────────────────────────────────────────

describe('DatePicker — date constraints', () => {
  it('disables days before minDate', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, '0');

    // minDate = day 10 of current UTC month
    const minDate = utcDate(year, month, 10);

    const wrapper = mount(DatePicker, {
      props: { mode: 'single', months: 1, timezone: 'UTC', minDate },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const day5 = getDayButton(wrapper, `${year}-${pad(month)}-05`) as HTMLButtonElement | null;
    if (day5) expect(day5.disabled).toBe(true);

    const day15 = getDayButton(wrapper, `${year}-${pad(month)}-15`) as HTMLButtonElement | null;
    if (day15) expect(day15.disabled).toBe(false);
  });
});

// ─── Controlled / uncontrolled ────────────────────────────────────────────────

describe('DatePicker — controlled mode', () => {
  it('reflects modelValue as the selected date', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, '0');

    // Select the 5th of current UTC month
    const selected = utcDate(year, month, 5);
    const wrapper = mount(DatePicker, {
      props: { mode: 'single', timezone: 'UTC', modelValue: selected },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const day5 = getDayButton(wrapper, `${year}-${pad(month)}-05`);
    expect(day5?.getAttribute('data-state')).toContain('selected-single');
  });
});

// ─── Timezone boundary (critical regression) ─────────────────────────────────

describe('DatePicker — timezone boundary', () => {
  /**
   * Core regression test.
   * Environment: Jest/Vitest runs in UTC by default.
   * timezone prop: 'Asia/Seoul' (UTC+9).
   *
   * Without the fix, a cell built at "Apr 1 UTC midnight" would be
   * formatted as "Apr 1" in UTC but "Apr 1 09:00" in Seoul — still Apr 1, OK.
   * The inverse bug triggered when local=KST and tz=UTC (browser env),
   * but we can still test the other direction:
   * UTC env + Seoul tz: "Apr 1 KST noon" = "Apr 1 03:00 UTC" — unambiguously Apr 1 in Seoul.
   */
  it('cell aria-label matches the target timezone day, not UTC day', async () => {
    // Use a known date: 2026-04-01 in Asia/Seoul
    // fromZonedTime('2026-04-01T12:00', 'Asia/Seoul') = 2026-04-01T03:00Z
    const seoulApril1 = fromZonedTime(new Date(2026, 3, 1, 12, 0, 0), 'Asia/Seoul');

    const wrapper = mount(DatePicker, {
      props: {
        mode: 'single',
        timezone: 'Asia/Seoul',
        modelValue: seoulApril1,
      },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    // The calendar must display April 2026 in Seoul timezone.
    // Day 1 button's aria-label must be "2026-04-01" (Seoul date).
    const day1 = getDayButton(wrapper, '2026-04-01');
    expect(day1).not.toBeNull();
    expect(day1?.getAttribute('data-state')).toContain('selected-single');

    // "2026-03-31" must not appear as selected (that was the bug)
    const march31 = getDayButton(wrapper, '2026-03-31');
    if (march31) {
      expect(march31.getAttribute('data-state') ?? '').not.toContain('selected-single');
    }
  });

  it('month title shows the correct target-timezone month', async () => {
    // 2026-04-01 00:00 UTC = 2026-04-01 09:00 Seoul → April in Seoul
    const utcMidnight = new Date(Date.UTC(2026, 3, 1, 0, 0, 0));

    const wrapper = mount(DatePicker, {
      props: {
        mode: 'single',
        timezone: 'Asia/Seoul',
        modelValue: utcMidnight,
      },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    // The month header must show "Apr, 2026"
    expect(dialog.text()).toContain('Apr, 2026');
  });

  it('selected cell has aria-label in target timezone, not local time', async () => {
    // 2026-03-31 23:00 UTC = 2026-04-01 08:00 Seoul
    // Without the fix, the cell would be labeled "2026-03-31" (UTC date)
    // With the fix it must be labeled "2026-04-01" (Seoul date)
    const justaheadOfMidnight = new Date(Date.UTC(2026, 2, 31, 23, 0, 0));

    const wrapper = mount(DatePicker, {
      props: {
        mode: 'single',
        timezone: 'Asia/Seoul',
        modelValue: justaheadOfMidnight,
      },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    // In Seoul this is April 1, so we should find a selected April 1 cell
    const seoulDay = getDayButton(wrapper, '2026-04-01');
    expect(seoulDay).not.toBeNull();
    expect(seoulDay?.getAttribute('data-state')).toContain('selected-single');

    // March 31 must not be selected
    const utcDay = getDayButton(wrapper, '2026-03-31');
    if (utcDay) {
      expect(utcDay.getAttribute('data-state') ?? '').not.toContain('selected-single');
    }
  });
});

// ─── Zero / negative offset timezones (critical regression) ──────────────────
// The test runner uses UTC as local timezone. These cases exercise the remaining
// bug: getCurrentMonthStart() and openCalendar() must produce the target-TZ month,
// not the UTC or local-TZ month.
//
// Reference time: 2026-05-01T01:00:00Z
//   • UTC timezone  → May 2026 (01:00 UTC is still May 1)
//   • America/New_York (EDT = UTC-4) → April 2026 (01:00 UTC = April 30, 21:00 EDT)

describe('DatePicker — zero/negative offset timezones', () => {
  // 2026-05-01T01:00:00Z  →  May 1 in UTC, April 30 in New York
  const REF_TIME = new Date('2026-05-01T01:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(REF_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('UTC timezone: getCurrentMonthStart returns May 2026', async () => {
    const wrapper = mount(DatePicker, {
      props: { mode: 'single', timezone: 'UTC' },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.text()).toContain('May, 2026');
    expect(dialog.text()).not.toContain('Apr, 2026');
    // May 1 must be a calendar day
    expect(getDayButton(wrapper, '2026-05-01')).not.toBeNull();
  });

  it('America/New_York: getCurrentMonthStart returns April 2026, not May', async () => {
    // Without the fix, old startOfMonth(toZonedTime) gives "Mar, 2026" here.
    const wrapper = mount(DatePicker, {
      props: { mode: 'single', timezone: 'America/New_York' },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.text()).toContain('Apr, 2026');
    expect(dialog.text()).not.toContain('Mar, 2026');
    // April 30 must be a visible day in the NY April calendar
    expect(getDayButton(wrapper, '2026-04-30')).not.toBeNull();
  });

  it('openCalendar: opens to NY-local month when modelValue crosses TZ boundary', async () => {
    // 2026-05-01T00:00:00Z = April 30, 20:00 EDT — calendar must open to April
    const modelValue = new Date('2026-05-01T00:00:00Z');

    const wrapper = mount(DatePicker, {
      props: { mode: 'single', timezone: 'America/New_York', modelValue },
    });

    await wrapper.find('button[aria-label="Open calendar"]').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    // Without the fix, openCalendar() called startOfMonth(baseDate) in local (UTC)
    // time, giving May 1 UTC → opens to May instead of April.
    expect(dialog.text()).toContain('Apr, 2026');
    expect(dialog.text()).not.toContain('May, 2026');
  });
});
