import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Slider — 기본 렌더링', () => {
  it('range input이 렌더링된다', () => {
    render(<Slider />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('defaultValue가 반영된다', () => {
    render(<Slider defaultValue={40} />);
    expect(screen.getByRole('slider')).toHaveValue('40');
  });

  it('min/max가 반영된다', () => {
    render(<Slider min={10} max={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '50');
  });

  it('disabled 상태가 반영된다', () => {
    render(<Slider disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});

// ─── extended 버튼 ────────────────────────────────────────────────────────────

describe('Slider — extended ±버튼', () => {
  it('extended variant에서 감소/증가 버튼이 존재한다', () => {
    render(<Slider variant="extended" />);
    expect(screen.getByRole('button', { name: /decrease/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase/i })).toBeInTheDocument();
  });

  it('simplified variant에서는 버튼이 없다', () => {
    render(<Slider variant="simplified" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('증가 버튼 클릭 시 step만큼 증가한다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Slider defaultValue={50} step={5} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /increase/i }));
    expect(onChange).toHaveBeenCalledWith(55);
  });

  it('감소 버튼 클릭 시 step만큼 감소한다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Slider defaultValue={50} step={5} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it('max를 넘어서 증가하지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Slider defaultValue={100} max={100} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /increase/i }));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('min 아래로 감소하지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      <Slider defaultValue={0} min={0} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('disabled 시 증가 버튼이 비활성화된다', () => {
    render(<Slider disabled />);
    expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
  });
});

// ─── controlled / uncontrolled ───────────────────────────────────────────────

describe('Slider — controlled/uncontrolled', () => {
  it('controlled: value prop이 슬라이더에 반영된다', () => {
    render(<Slider value={30} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveValue('30');
  });

  it('controlled: value 변경 시 슬라이더가 업데이트된다', () => {
    const { rerender } = render(<Slider value={20} onChange={() => {}} />);
    rerender(<Slider value={80} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveValue('80');
  });

  it('onChange가 새 값으로 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<Slider defaultValue={50} step={10} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /increase/i }));
    expect(onChange).toHaveBeenCalledWith(60);
  });
});
