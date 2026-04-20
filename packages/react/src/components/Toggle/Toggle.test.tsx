import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

describe('Toggle — 기본 렌더링', () => {
  it('switch role이 있다', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('label이 표시된다', () => {
    render(<Toggle label="알림 설정" />);
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
  });

  it('disabled 상태가 반영된다', () => {
    render(<Toggle disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});

describe('Toggle — controlled/uncontrolled', () => {
  it('defaultChecked=true이면 ON 상태다', () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('controlled: checked=true이면 ON 상태다', () => {
    render(<Toggle checked onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('uncontrolled: 클릭 시 토글된다', async () => {
    const { user } = setup(<Toggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Toggle onChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('disabled 상태에서는 클릭해도 onChange가 호출되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Toggle disabled onChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Toggle — showText', () => {
  it('showText=true(기본)이면 ON/OFF 텍스트가 보인다', () => {
    render(<Toggle />);
    // OFF 상태에서 OFF 텍스트 노출
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  it('showText=false이면 ON/OFF 텍스트가 없다', () => {
    render(<Toggle showText={false} />);
    expect(screen.queryByText('ON')).not.toBeInTheDocument();
    expect(screen.queryByText('OFF')).not.toBeInTheDocument();
  });

  it('ON 상태에서는 ON 텍스트가 보인다', () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByText('ON')).toBeInTheDocument();
  });
});
