import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Snackbar } from './Snackbar';

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Snackbar — 기본 렌더링', () => {
  it('message가 렌더링된다', () => {
    render(<Snackbar message="변경 사항이 저장되었습니다" />);
    expect(screen.getByText('변경 사항이 저장되었습니다')).toBeInTheDocument();
  });

  it('기본 variant는 notice다', () => {
    const { container } = render(<Snackbar message="알림" />);
    expect(container.firstChild).toHaveClass('notice');
  });

  it('기본 size는 s다', () => {
    const { container } = render(<Snackbar message="알림" />);
    expect(container.firstChild).toHaveClass('s');
  });

  it('rounded=true이면 rounded 클래스가 적용된다', () => {
    const { container } = render(<Snackbar message="알림" rounded />);
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('rounded=false이면 rounded 클래스가 없다', () => {
    const { container } = render(<Snackbar message="알림" rounded={false} />);
    expect(container.firstChild).not.toHaveClass('rounded');
  });
});

// ─── variant 아이콘 ───────────────────────────────────────────────────────────

describe('Snackbar — 아이콘', () => {
  it('icon prop이 있으면 <i> 엘리먼트가 렌더링된다', () => {
    const { container } = render(<Snackbar message="알림" icon="icon-info" />);
    expect(container.querySelector('i.icon')).toBeInTheDocument();
  });

  it('icon prop이 없으면 variant 기본 SVG가 렌더링된다', () => {
    const { container } = render(<Snackbar message="알림" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

// ─── 액션 버튼 ────────────────────────────────────────────────────────────────

describe('Snackbar — 액션 버튼', () => {
  it('size=s이면 actionLabel이 텍스트 링크로 렌더링된다', () => {
    render(<Snackbar message="알림" actionLabel="실행 취소" size="s" />);
    expect(screen.getByRole('button', { name: '실행 취소' })).toBeInTheDocument();
  });

  it('size=m이면 actionLabel이 버튼으로 렌더링된다', () => {
    render(<Snackbar message="알림" actionLabel="실행 취소" size="m" />);
    expect(screen.getByRole('button', { name: '실행 취소' })).toBeInTheDocument();
  });

  it('액션 버튼 클릭 시 onAction이 호출된다', async () => {
    const onAction = vi.fn();
    const { user } = setup(
      <Snackbar message="알림" actionLabel="실행 취소" onAction={onAction} />,
    );
    await user.click(screen.getByRole('button', { name: '실행 취소' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

// ─── 닫기 버튼 ────────────────────────────────────────────────────────────────

describe('Snackbar — 닫기 버튼', () => {
  it('onClose가 있으면 닫기 버튼이 렌더링된다', () => {
    render(<Snackbar message="알림" onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { user } = setup(<Snackbar message="알림" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('onClose가 없으면 닫기 버튼이 렌더링되지 않는다', () => {
    render(<Snackbar message="알림" />);
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });
});

// ─── variant ──────────────────────────────────────────────────────────────────

describe('Snackbar — variant', () => {
  it.each(['notice', 'tip', 'alert'] as const)('variant="%s" 렌더링', (variant) => {
    const { container } = render(<Snackbar message="알림" variant={variant} />);
    expect(container.firstChild).toHaveClass(variant);
  });
});
