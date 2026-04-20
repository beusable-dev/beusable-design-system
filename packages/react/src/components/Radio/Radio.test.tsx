import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

describe('Radio — 기본 렌더링', () => {
  it('radio role이 있다', () => {
    render(<Radio />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('label이 표시된다', () => {
    render(<Radio label="선택지 A" />);
    expect(screen.getByText('선택지 A')).toBeInTheDocument();
  });

  it('label이 input과 연결된다', () => {
    render(<Radio label="선택지 A" />);
    expect(screen.getByLabelText('선택지 A')).toBeInTheDocument();
  });

  it('disabled 상태가 반영된다', () => {
    render(<Radio disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });
});

describe('Radio — controlled/uncontrolled', () => {
  it('defaultChecked가 초기 선택 상태로 반영된다', () => {
    render(<Radio defaultChecked />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('controlled: checked prop이 반영된다', () => {
    render(<Radio checked onChange={() => {}} />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('uncontrolled: 클릭 시 선택된다', async () => {
    const { user } = setup(<Radio />);
    await user.click(screen.getByRole('radio'));
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Radio onChange={onChange} />);
    await user.click(screen.getByRole('radio'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('disabled 상태에서는 클릭해도 onChange가 호출되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Radio disabled onChange={onChange} />);
    await user.click(screen.getByRole('radio'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Radio — 그룹 동작', () => {
  it('같은 name 그룹에서 하나만 선택된다', async () => {
    const { user } = setup(
      <>
        <Radio name="group" value="a" label="A" defaultChecked />
        <Radio name="group" value="b" label="B" />
      </>,
    );
    const radioA = screen.getByLabelText('A');
    const radioB = screen.getByLabelText('B');

    expect(radioA).toBeChecked();
    expect(radioB).not.toBeChecked();

    await user.click(radioB);
    expect(radioB).toBeChecked();
    expect(radioA).not.toBeChecked();
  });
});
