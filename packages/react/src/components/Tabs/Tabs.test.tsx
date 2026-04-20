import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentControl } from './SegmentControl';
import { TabBar } from './TabBar';
import { TabPill } from './TabPill';
import { TabCard } from './TabCard';

const ITEMS = [
  { value: 'a', label: '항목 A' },
  { value: 'b', label: '항목 B' },
  { value: 'c', label: '항목 C', disabled: true },
];

function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

// ─── SegmentControl ───────────────────────────────────────────────────────────

describe('SegmentControl', () => {
  it('모든 항목이 렌더링된다', () => {
    render(<SegmentControl items={ITEMS} />);
    expect(screen.getByText('항목 A')).toBeInTheDocument();
    expect(screen.getByText('항목 B')).toBeInTheDocument();
    expect(screen.getByText('항목 C')).toBeInTheDocument();
  });

  it('기본값: 첫 번째 항목이 선택된다', () => {
    render(<SegmentControl items={ITEMS} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('defaultValue로 초기 선택값을 지정할 수 있다', () => {
    render(<SegmentControl items={ITEMS} defaultValue="b" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('항목 클릭 시 해당 항목이 선택된다', async () => {
    const { user } = setup(<SegmentControl items={ITEMS} />);
    await user.click(screen.getByText('항목 B'));
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('onChange가 선택된 value와 함께 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<SegmentControl items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('disabled 항목은 클릭해도 선택되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<SegmentControl items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 C'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('controlled: value prop이 반영된다', () => {
    render(<SegmentControl items={ITEMS} value="b" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('tablist role이 있다', () => {
    render(<SegmentControl items={ITEMS} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});

// ─── TabBar ───────────────────────────────────────────────────────────────────

describe('TabBar', () => {
  it('모든 항목이 렌더링된다', () => {
    render(<TabBar items={ITEMS} />);
    expect(screen.getByText('항목 A')).toBeInTheDocument();
    expect(screen.getByText('항목 B')).toBeInTheDocument();
  });

  it('클릭 시 선택 상태가 변경된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabBar items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('controlled 동작', () => {
    render(<TabBar items={ITEMS} value="b" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled 항목은 클릭해도 onChange가 호출되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabBar items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 C'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── TabPill ──────────────────────────────────────────────────────────────────

describe('TabPill', () => {
  it('모든 항목이 렌더링된다', () => {
    render(<TabPill items={ITEMS} />);
    expect(screen.getByText('항목 A')).toBeInTheDocument();
    expect(screen.getByText('항목 B')).toBeInTheDocument();
  });

  it('클릭 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabPill items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('controlled 동작', () => {
    render(<TabPill items={ITEMS} value="b" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled 항목은 클릭해도 onChange가 호출되지 않는다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabPill items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 C'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── TabCard ──────────────────────────────────────────────────────────────────

describe('TabCard', () => {
  it('모든 항목이 렌더링된다', () => {
    render(<TabCard items={ITEMS} />);
    expect(screen.getByText('항목 A')).toBeInTheDocument();
    expect(screen.getByText('항목 B')).toBeInTheDocument();
  });

  it('클릭 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabCard items={ITEMS} onChange={onChange} />);
    await user.click(screen.getByText('항목 B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('controlled 동작', () => {
    render(<TabCard items={ITEMS} value="b" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('선택된 항목을 다시 클릭해도 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    const { user } = setup(<TabCard items={ITEMS} defaultValue="a" onChange={onChange} />);
    await user.click(screen.getByText('항목 A'));
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
