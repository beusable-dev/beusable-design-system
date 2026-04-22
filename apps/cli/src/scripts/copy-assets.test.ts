import { describe, it, expect, vi } from 'vitest';

import { ensureTokenAssetsAvailable } from './copy-assets';

describe('ensureTokenAssetsAvailable', () => {
  it('토큰 산출물이 이미 있으면 추가 빌드를 실행하지 않는다', async () => {
    const accessFn = vi.fn().mockResolvedValue(undefined);
    const execFileFn = vi.fn().mockResolvedValue({ stdout: '', stderr: '' });

    await ensureTokenAssetsAvailable({ accessFn, execFileFn });

    expect(accessFn).toHaveBeenCalled();
    expect(execFileFn).not.toHaveBeenCalled();
  });

  it('토큰 산출물이 없으면 tokens build를 실행한 뒤 다시 확인한다', async () => {
    let built = false;
    const accessFn = vi.fn().mockImplementation(async () => {
      if (!built) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
    });
    const execFileFn = vi.fn().mockImplementation(async () => {
      built = true;
      return { stdout: '', stderr: '' };
    });

    await ensureTokenAssetsAvailable({ accessFn, execFileFn });

    expect(execFileFn).toHaveBeenCalledWith('pnpm', ['--filter', '@beusable-dev/tokens', 'build'], {
      cwd: expect.any(String),
    });
    expect(accessFn.mock.calls.length).toBeGreaterThan(2);
  });
});
