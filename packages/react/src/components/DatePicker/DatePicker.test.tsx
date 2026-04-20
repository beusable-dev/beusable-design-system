import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

// date-fns + date-fns-tz 교체 후 엣지케이스 검증을 위한 헬퍼
// 아래 함수들은 DatePicker.tsx 내부 함수와 동일한 로직을 미러링한다.
// 구현 교체 후에는 컴포넌트 렌더링을 통해 동작을 간접 검증한다.
import {
  addMonths as dateFnsAddMonths,
  format,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('DatePicker — 기본 렌더링', () => {
  it('range 모드 기본 placeholder를 표시한다', () => {
    render(<DatePicker mode="range" />);
    expect(screen.getByText('Start Date - End Date')).toBeInTheDocument();
  });

  it('single 모드 placeholder를 표시한다', () => {
    render(<DatePicker mode="single" placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });
});

describe('DatePicker — 커밋 동작', () => {
  it('single 모드에서 날짜 클릭 시 즉시 onChange를 호출한다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<DatePicker mode="single" defaultValue={new Date(2025, 1, 12)} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    await user.click(screen.getByRole('button', { name: '2025-02-15' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(new Date(2025, 1, 15));
  });

  it('range 모드에서 Cancel 클릭 시 onChange를 호출하지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <DatePicker
        mode="range"
        defaultValue={{ startDate: new Date(2025, 1, 12), endDate: null }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    await user.click(screen.getByRole('button', { name: '2025-02-12' }));
    await user.click(screen.getByRole('button', { name: '2025-02-16' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DatePicker — 제약', () => {
  it('min/max 범위 밖 날짜를 비활성화한다', async () => {
    const minDate = new Date(2025, 1, 10);
    const maxDate = new Date(2025, 1, 20);
    const { user } = setup(
      <DatePicker mode="single" defaultValue={new Date(2025, 1, 12)} minDate={minDate} maxDate={maxDate} />,
    );

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('button', { name: '2025-02-09' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2025-02-21' })).toBeDisabled();
  });

  it('disabledDate 콜백으로 특정 날짜를 비활성화한다', async () => {
    const { user } = setup(
      <DatePicker
        mode="single"
        defaultValue={new Date(2025, 1, 12)}
        disabledDate={(date) => date.getDate() === 14}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('button', { name: '2025-02-14' })).toBeDisabled();
  });

  it('maxRangeMonths 제약으로 종료일 선택 범위를 제한한다', async () => {
    const { user } = setup(
      <DatePicker
        mode="range"
        defaultValue={{ startDate: new Date(2025, 1, 12), endDate: null }}
        maxRangeMonths={0}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('button', { name: '2025-02-13' })).toBeDisabled();
  });

  it('range 모드에서 시작일/종료일/중간 범위를 상태값으로 구분한다', async () => {
    const { user } = setup(
      <DatePicker
        mode="range"
        defaultValue={{ startDate: new Date(2025, 1, 12), endDate: new Date(2025, 1, 15) }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    expect(screen.getByRole('button', { name: '2025-02-12' })).toHaveAttribute(
      'data-state',
      expect.stringContaining('selected-start'),
    );
    expect(screen.getByRole('button', { name: '2025-02-15' })).toHaveAttribute(
      'data-state',
      expect.stringContaining('selected-end'),
    );
    expect(screen.getByRole('button', { name: '2025-02-13' })).toHaveAttribute(
      'data-state',
      expect.stringContaining('in-range'),
    );
    expect(screen.getByRole('button', { name: '2025-02-14' })).toHaveAttribute(
      'data-state',
      expect.stringContaining('in-range'),
    );
  });
});

describe('DatePicker — controlled', () => {
  it('외부 value 변경을 트리거 텍스트에 반영한다', () => {
    const { rerender } = render(<DatePicker mode="single" value={new Date(2025, 1, 12)} />);
    expect(screen.getByText(/Feb/)).toBeInTheDocument();

    rerender(<DatePicker mode="single" value={new Date(2025, 1, 20)} />);
    expect(screen.getByText(/20, 2025/)).toBeInTheDocument();
  });
});

describe('DatePicker — month navigation', () => {
  it('single(1month)에서 현재 월이면 next는 비활성이고, 과거로 이동하면 활성화된다', async () => {
    const { user } = setup(<DatePicker mode="single" />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    const nextButton = screen.getByRole('button', { name: 'Next month' });
    const prevButton = screen.getByRole('button', { name: 'Previous month' });

    expect(nextButton).toBeDisabled();
    await user.click(prevButton);
    expect(screen.getByRole('button', { name: 'Next month' })).not.toBeDisabled();
  });

  it('range(2month)에서도 현재 월이면 next는 비활성이고, 과거로 이동하면 활성화된다', async () => {
    const { user } = setup(<DatePicker mode="range" />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    const nextButton = screen.getByRole('button', { name: 'Next month' });
    const prevButton = screen.getByRole('button', { name: 'Previous month' });

    expect(nextButton).toBeDisabled();
    await user.click(prevButton);
    expect(screen.getByRole('button', { name: 'Next month' })).not.toBeDisabled();
  });

  it('future 기본값이어도 open 시 현재 월로 클램프되어 future로 넘어가지 않는다', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const now = new Date();
    const currentMonthTitle = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    const currentYearTitle = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(now);

    const { user } = setup(<DatePicker mode="single" defaultValue={futureDate} />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByText(`${currentMonthTitle}, ${currentYearTitle}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('range(2month)는 오늘 기준으로 이전월+현재월까지만 보이고 다음달은 보이지 않는다', async () => {
    const now = new Date();
    const currentMonthTitle = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    const currentYearTitle = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(now);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthTitle = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(nextMonthDate);
    const nextYearTitle = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(nextMonthDate);

    const { user } = setup(<DatePicker mode="range" />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByText(`${currentMonthTitle}, ${currentYearTitle}`)).toBeInTheDocument();
    expect(screen.queryByText(`${nextMonthTitle}, ${nextYearTitle}`)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('현재 월 상한에서 next를 눌러도 미래 월로 이동하지 않는다', async () => {
    const now = new Date();
    const currentMonthTitle = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
    const currentYearTitle = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(now);

    const { user } = setup(<DatePicker mode="single" defaultValue={now} />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    const nextButton = screen.getByRole('button', { name: 'Next month' });
    expect(nextButton).toBeDisabled();

    await user.click(nextButton);
    expect(screen.getByText(`${currentMonthTitle}, ${currentYearTitle}`)).toBeInTheDocument();
  });

  it('과거 값이 있으면 open 시 single은 선택된 월 문맥을 유지한다', async () => {
    const pastDate = new Date(2025, 1, 15);

    const { user } = setup(<DatePicker mode="single" defaultValue={pastDate} />);

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByText('Feb, 2025')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).not.toBeDisabled();
  });

  it('현재 월 상한은 로컬 시간이 아니라 timezone 기준으로 계산한다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T01:00:00.000Z'));

    render(<DatePicker mode="single" timezone="America/New_York" />);

    fireEvent.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByText('Apr, 2026')).toBeInTheDocument();
    expect(screen.queryByText('May, 2026')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// date-fns + date-fns-tz 교체 엣지케이스
// ─────────────────────────────────────────────────────────────────────────────

describe('date-fns addMonths — 말일 클램핑', () => {
  it('addMonths(Jan 31, 1) → Feb 28 (말일 클램핑)', () => {
    const jan31 = new Date(2025, 0, 31);
    const result = dateFnsAddMonths(jan31, 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1); // 2월 = 인덱스 1
    expect(result.getDate()).toBe(28);
  });

  it('addMonths(Feb 29 2024, 12) → Feb 28 2025 (윤년 → 일반년)', () => {
    const feb29Leap = new Date(2024, 1, 29);
    const result = dateFnsAddMonths(feb29Leap, 12);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });
});

describe('date-fns-tz isSameDay — timezone 크로스 날짜 경계', () => {
  it('UTC 2025-04-15T15:00:00Z는 Asia/Seoul 기준 2025-04-16 (다음날)이다', () => {
    // getDateKey(date, timezone) 역할을 직접 검증
    const utcDate = new Date('2025-04-15T15:00:00Z');
    const seoulKey = formatInTimeZone(utcDate, 'Asia/Seoul', 'yyyyMMdd');
    expect(seoulKey).toBe('20250416');
  });

  it('UTC 2025-04-15T15:00:00Z는 America/New_York 기준 2025-04-15 (같은날)이다', () => {
    const utcDate = new Date('2025-04-15T15:00:00Z');
    const nyKey = formatInTimeZone(utcDate, 'America/New_York', 'yyyyMMdd');
    expect(nyKey).toBe('20250415');
  });
});

describe('date-fns format — toDisplayDate Intl 포맷 일치', () => {
  it('formatInTimeZone과 Intl.DateTimeFormat이 동일한 결과를 반환한다', () => {
    const testCases: Array<{ date: Date; timezone: string }> = [
      { date: new Date(2025, 0, 1), timezone: 'Asia/Seoul' },
      { date: new Date(2025, 11, 31), timezone: 'America/New_York' },
      { date: new Date(2026, 3, 16), timezone: 'UTC' },
    ];

    for (const { date, timezone } of testCases) {
      const dateFnsResult = formatInTimeZone(date, timezone, 'MMM d, yyyy');
      const intlResult = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
      expect(dateFnsResult).toBe(intlResult);
    }
  });
});

describe('date-fns format — toMonthTitle 형식 확인', () => {
  it('format(date, "MMM, yyyy")는 "Apr, 2026" 형식을 반환한다', () => {
    const apr2026 = new Date(2026, 3, 1);
    expect(format(apr2026, 'MMM, yyyy')).toBe('Apr, 2026');
  });

  it('format(date, "MMM, yyyy")는 "Jan, 2025" 형식을 반환한다', () => {
    const jan2025 = new Date(2025, 0, 1);
    expect(format(jan2025, 'MMM, yyyy')).toBe('Jan, 2025');
  });
});

describe('DatePicker — date-fns 교체 후 동작 회귀', () => {
  it('1월 달력에서 next month 클릭 시 2월 달력이 올바르게 표시된다 (2월 28일 존재, 29일 없음)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-01T10:00:00.000Z'));

    render(<DatePicker mode="single" defaultValue={new Date(2025, 0, 31)} />);
    fireEvent.click(screen.getByRole('button', { name: /open calendar/i }));
    // Jan 2025 달력이 표시되어야 함
    expect(screen.getByText('Jan, 2025')).toBeInTheDocument();

    // next month 버튼 클릭 → Feb 2025로 이동
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('Feb, 2025')).toBeInTheDocument();

    // 2025년 2월은 28일까지 존재하고 29일은 없어야 함
    expect(screen.getByRole('button', { name: '2025-02-28' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '2025-02-29' })).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('월 헤더가 "Apr, 2026" 형식으로 표시된다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T00:00:00.000Z'));

    render(<DatePicker mode="single" />);
    fireEvent.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByText('Apr, 2026')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('toDisplayDate가 Asia/Seoul 기준 "Apr 16, 2026" 형식으로 트리거에 표시된다', () => {
    // UTC ISO 문자열로 날짜를 고정하면 timezone과 무관하게 일관된 결과를 얻는다
    const date = new Date('2026-04-16T00:00:00+09:00'); // Asia/Seoul 기준 Apr 16
    render(<DatePicker mode="single" value={date} timezone="Asia/Seoul" />);
    expect(screen.getByText('Apr 16, 2026')).toBeInTheDocument();
  });
});
