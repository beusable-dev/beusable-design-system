import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('TextField — 기본 렌더링', () => {
  it('label이 input과 연결된다', () => {
    render(<TextField label="이름" />);
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
  });

  it('errorMessage가 표시된다', () => {
    render(<TextField errorMessage="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
  });

  it('message가 표시된다', () => {
    render(<TextField message="8자 이상 입력하세요" />);
    expect(screen.getByText('8자 이상 입력하세요')).toBeInTheDocument();
  });

  it('errorMessage와 message가 동시에 있을 때 errorMessage만 표시된다', () => {
    render(<TextField errorMessage="오류" message="도움말" />);
    expect(screen.getByText('오류')).toBeInTheDocument();
    expect(screen.queryByText('도움말')).not.toBeInTheDocument();
  });

  it('disabled 상태에서는 입력이 불가하다', () => {
    render(<TextField disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('placeholder가 표시된다', () => {
    render(<TextField placeholder="입력하세요" />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });
});

// ─── 입력 동작 ────────────────────────────────────────────────────────────────

describe('TextField — 입력 동작', () => {
  it('uncontrolled: 타이핑 시 value가 변경된다', async () => {
    const { user } = setup(<TextField />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('controlled: onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TextField value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('controlled: value prop이 반영된다', () => {
    render(<TextField value="initial" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('initial');
  });
});

// ─── clearable ───────────────────────────────────────────────────────────────

describe('TextField — clearable', () => {
  it('값이 있을 때 X 버튼이 표시된다', async () => {
    const { user } = setup(<TextField clearable />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('X 버튼 클릭 시 값이 비워진다', async () => {
    const { user } = setup(<TextField clearable defaultValue="hello" />);
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('X 버튼 클릭 시 onClear가 호출된다', async () => {
    const onClear = vi.fn();
    const { user } = setup(<TextField clearable defaultValue="hello" onClear={onClear} />);
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('값이 없으면 X 버튼이 표시되지 않는다', () => {
    render(<TextField clearable />);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('disabled 상태에서는 X 버튼이 표시되지 않는다', () => {
    render(<TextField clearable defaultValue="hello" disabled />);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });
});

// ─── 비밀번호 토글 ────────────────────────────────────────────────────────────

describe('TextField — 비밀번호 토글', () => {
  it('type="password"이면 기본적으로 비밀번호 타입이다', () => {
    const { container } = render(<TextField type="password" />);
    // password input은 ARIA textbox role이 없으므로 DOM 쿼리 사용
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('눈 아이콘 클릭 시 text 타입으로 전환된다', async () => {
    const { user, container } = setup(<TextField type="password" />);
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('눈 아이콘 재클릭 시 password 타입으로 돌아온다', async () => {
    const { user, container } = setup(<TextField type="password" />);
    await user.click(screen.getByRole('button', { name: /show password/i }));
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
  });
});

// ─── multiline ────────────────────────────────────────────────────────────────

describe('TextField — multiline', () => {
  it('multiline이면 textarea가 렌더링된다', () => {
    render(<TextField multiline />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('showCount + maxLength 시 글자 수 카운터가 표시된다', async () => {
    const { user } = setup(<TextField multiline maxLength={100} showCount />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByText('(5/100)')).toBeInTheDocument();
  });
});

// ─── 타이머 ───────────────────────────────────────────────────────────────────

describe('TextField — 타이머', () => {
  it('timer prop이 있으면 타이머 문자열이 표시된다', () => {
    render(<TextField timer="03:00" />);
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('timerSeconds prop이 있으면 카운트다운이 표시된다', () => {
    // formatTime: m:ss (분은 padding 없음) → 180초 = "3:00"
    render(<TextField timerSeconds={180} />);
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });

  it('timerSeconds=0이면 "0:00"이 표시된다', () => {
    render(<TextField timerSeconds={0} onTimerEnd={vi.fn()} />);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});
