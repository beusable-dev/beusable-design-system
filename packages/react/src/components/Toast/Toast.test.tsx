import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Toast — 기본 렌더링', () => {
  it('message가 렌더링된다', () => {
    render(<Toast message="저장되었습니다" />);
    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
  });

  it('role="status"가 있다', () => {
    render(<Toast message="저장되었습니다" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('aria-live="polite"가 있다', () => {
    render(<Toast message="저장되었습니다" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});

// ─── type 자동 결정 ───────────────────────────────────────────────────────────

describe('Toast — type 자동 결정', () => {
  it('description 있으면 type b로 결정된다', () => {
    const { container } = render(<Toast message="제목" description="설명" />);
    expect(container.firstChild).toHaveClass('b');
  });

  it('icon 있으면 type a1로 결정된다', () => {
    const { container } = render(<Toast message="알림" icon="icon-check" />);
    expect(container.firstChild).toHaveClass('a1');
  });

  it('icon/description 없으면 type a2로 결정된다', () => {
    const { container } = render(<Toast message="알림" />);
    expect(container.firstChild).toHaveClass('a2');
  });

  it('type을 명시하면 자동 결정을 무시한다', () => {
    const { container } = render(<Toast message="알림" type="a1" />);
    expect(container.firstChild).toHaveClass('a1');
  });
});

// ─── type a1 / 아이콘 ─────────────────────────────────────────────────────────

describe('Toast — type a1 아이콘', () => {
  it('icon prop이 있으면 <i> 엘리먼트가 렌더링된다', () => {
    const { container } = render(<Toast message="알림" type="a1" icon="icon-check" />);
    expect(container.querySelector('i.icon')).toBeInTheDocument();
  });

  it('icon prop이 없으면 기본 CheckIcon SVG가 렌더링된다', () => {
    const { container } = render(<Toast message="알림" type="a1" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('i.icon')).not.toBeInTheDocument();
  });

  it('type a2는 아이콘 영역이 없다', () => {
    const { container } = render(<Toast message="알림" type="a2" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('i.icon')).not.toBeInTheDocument();
  });
});

// ─── type b ───────────────────────────────────────────────────────────────────

describe('Toast — type b', () => {
  it('description이 렌더링된다', () => {
    render(<Toast message="제목" description="부가 설명" />);
    expect(screen.getByText('부가 설명')).toBeInTheDocument();
  });
});

// ─── status ───────────────────────────────────────────────────────────────────

describe('Toast — status', () => {
  it('status=complete 클래스가 적용된다', () => {
    const { container } = render(<Toast message="완료" status="complete" />);
    expect(container.firstChild).toHaveClass('complete');
  });

  it('status=caution 클래스가 적용된다', () => {
    const { container } = render(<Toast message="주의" status="caution" />);
    expect(container.firstChild).toHaveClass('caution');
  });

  it('기본 status는 normal이다', () => {
    const { container } = render(<Toast message="알림" />);
    expect(container.firstChild).toHaveClass('normal');
  });
});
