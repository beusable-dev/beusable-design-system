import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createListCommand } from './list';
import * as manifestModule from '../lib/manifest';
import type { ComponentsManifest } from '../lib/manifest';

vi.mock('../lib/manifest');

const FAKE_MANIFEST: ComponentsManifest = {
  version: '0.1.0',
  components: {
    button: { react: ['Button.tsx', 'Button.module.css'], vue: ['Button.vue', 'Button.module.css'], deps: ['clsx'] },
    modal: { react: ['Modal.tsx', 'Modal.module.css'], vue: ['Modal.vue', 'Modal.module.css'], deps: ['clsx'] },
    datepicker: { react: ['DatePicker.tsx'], vue: ['DatePicker.vue'], deps: ['date-fns', 'date-fns-tz'] },
  },
  tokens: { src: 'packages/tokens/dist/css/variables.css', dest: 'src/styles/tokens.css' },
};

describe('list command (AC-4)', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalExit: typeof process.exit;
  let exitCode: number | undefined;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalExit = process.exit;
    exitCode = undefined;
    process.exit = ((code?: number) => {
      exitCode = code ?? 0;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;
  });

  afterEach(() => {
    process.exit = originalExit;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('muestra la lista de componentes y "tokens" (AC-4)', async () => {
    vi.mocked(manifestModule.loadManifest).mockResolvedValue(FAKE_MANIFEST);
    vi.mocked(manifestModule.getComponentNames).mockReturnValue(['button', 'modal', 'datepicker']);

    const cmd = createListCommand('/fake/manifest');
    await cmd.parseAsync(['node', 'beusable', 'list']);

    const allOutput = consoleLogSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(allOutput).toContain('button');
    expect(allOutput).toContain('modal');
    expect(allOutput).toContain('datepicker');
    expect(allOutput).toContain('tokens');
  });

  it('muestra las dependencias de cada componente', async () => {
    vi.mocked(manifestModule.loadManifest).mockResolvedValue(FAKE_MANIFEST);
    vi.mocked(manifestModule.getComponentNames).mockReturnValue(['button', 'datepicker']);

    const cmd = createListCommand('/fake/manifest');
    await cmd.parseAsync(['node', 'beusable', 'list']);

    const allOutput = consoleLogSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(allOutput).toContain('clsx');
    expect(allOutput).toContain('date-fns');
  });

  it('sale con código 1 cuando loadManifest falla', async () => {
    vi.mocked(manifestModule.loadManifest).mockRejectedValue(new Error('manifest not found'));

    const cmd = createListCommand('/fake/manifest');
    await expect(cmd.parseAsync(['node', 'beusable', 'list'])).rejects.toThrow(/process\.exit/);
    expect(exitCode).toBe(1);
  });

  it('el error de carga usa logError (muestra ✗ en stderr)', async () => {
    vi.mocked(manifestModule.loadManifest).mockRejectedValue(new Error('No se encontró components.json'));

    const cmd = createListCommand('/fake/manifest');
    await expect(cmd.parseAsync(['node', 'beusable', 'list'])).rejects.toThrow(/process\.exit/);

    // logError escribe en console.error con el prefijo ✗
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('No se encontró components.json'),
    );
  });
});
