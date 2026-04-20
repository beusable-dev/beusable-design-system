import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

describe('Checkbox — 기본 렌더링', () => {
  it('checkbox role이 있다', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('label이 표시된다', () => {
    render(<Checkbox label="동의합니다" />);
    expect(screen.getByText('동의합니다')).toBeInTheDocument();
  });

  it('label이 input과 연결된다', () => {
    render(<Checkbox label="선택" />);
    expect(screen.getByLabelText('선택')).toBeInTheDocument();
  });

  it('disabled 상태가 반영된다', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});

describe('Checkbox — controlled/uncontrolled', () => {
  it('defaultChecked가 초기값으로 반영된다', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('controlled: checked prop이 반영된다', () => {
    render(<Checkbox checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('uncontrolled: 클릭 시 체크 상태가 토글된다', async () => {
    const { user } = setup(<Checkbox />);
    const cb = screen.getByRole('checkbox');
    expect(cb).not.toBeChecked();
    await user.click(cb);
    expect(cb).toBeChecked();
    await user.click(cb);
    expect(cb).not.toBeChecked();
  });

  it('onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Checkbox onChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('disabled 상태에서는 클릭해도 onChange가 호출되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Checkbox disabled onChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Checkbox — indeterminate', () => {
  it('indeterminate prop이 있으면 aria-checked="mixed"이다', () => {
    render(<Checkbox indeterminate />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('indeterminate + checked가 동시에 있어도 aria-checked="mixed"이다', () => {
    render(<Checkbox indeterminate checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });
});
