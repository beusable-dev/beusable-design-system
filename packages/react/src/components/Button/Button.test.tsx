import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

// ─── 기본 렌더링 ──────────────────────────────────────────────────────────────

describe('Button — 기본 렌더링', () => {
  it('children이 렌더링된다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('기본 variant가 primary다', () => {
    const { container } = render(<Button>저장</Button>);
    expect(container.firstChild).toHaveClass('primary');
  });

  it('기본 type이 button이다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('disabled 상태에서는 버튼이 비활성화된다', () => {
    render(<Button disabled>저장</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fullWidth가 적용된다', () => {
    const { container } = render(<Button fullWidth>저장</Button>);
    expect(container.firstChild).toHaveClass('fullWidth');
  });
});

// ─── 클릭 동작 ────────────────────────────────────────────────────────────────

describe('Button — 클릭 동작', () => {
  it('클릭 시 onClick이 호출된다', async () => {
    const onClick = vi.fn();
    const { user } = setup(<Button onClick={onClick}>저장</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled 상태에서는 클릭이 무시된다', async () => {
    const onClick = vi.fn();
    const { user } = setup(<Button disabled onClick={onClick}>저장</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ─── 로딩 상태 ────────────────────────────────────────────────────────────────

describe('Button — 로딩 상태', () => {
  it('loading=true이면 스피너가 렌더링된다', () => {
    const { container } = render(<Button loading>저장</Button>);
    expect(container.querySelector('svg.spinner')).toBeInTheDocument();
  });

  it('loading=true이면 버튼이 비활성화된다', () => {
    render(<Button loading>저장</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading=true이면 aria-busy가 true다', () => {
    render(<Button loading>저장</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('loading=false이면 aria-busy가 없다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });
});

// ─── 아이콘 ───────────────────────────────────────────────────────────────────

describe('Button — 아이콘', () => {
  it('leftIcon이 렌더링된다', () => {
    render(<Button leftIcon={<span data-testid="left" />}>저장</Button>);
    expect(screen.getByTestId('left')).toBeInTheDocument();
  });

  it('rightIcon이 렌더링된다', () => {
    render(<Button rightIcon={<span data-testid="right" />}>저장</Button>);
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});

// ─── 모든 variant ─────────────────────────────────────────────────────────────

describe('Button — variant', () => {
  const variants = [
    'primary', 'primary-outline', 'primary-surface', 'primary-ghost',
    'secondary', 'secondary-surface', 'secondary-ghost',
    'action', 'action-surface', 'action-ghost',
    'accent', 'accent-surface', 'accent-ghost',
  ] as const;

  it.each(variants)('variant="%s" 렌더링', (variant) => {
    render(<Button variant={variant}>버튼</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
