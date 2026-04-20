/**
 * Tests de integración para el comando `beusable add`.
 * Se mockean fs/promises, manifest y detect-framework para aislar la lógica del comando.
 *
 * IMPORTANTE: parseAsync con { from: 'user' } toma los elementos del array
 * directamente como argumentos (sin el "node" y "bin" prefix). Los argumentos
 * deben ser ['add', 'button', '--framework', 'react'] o simplemente
 * usar process.argv format: ['node', 'beusable', 'add', 'button', ...].
 * Usamos la forma completa con process.argv para evitar confusiones.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';

vi.mock('fs/promises');
vi.mock('../lib/manifest');
vi.mock('../lib/detect-framework');

import { createAddCommand } from './add';
import * as manifestModule from '../lib/manifest';
import { detectFramework } from '../lib/detect-framework';
import type { ComponentsManifest } from '../lib/manifest';

const FAKE_MANIFEST: ComponentsManifest = {
  version: '0.1.0',
  components: {
    button: {
      react: ['Button.tsx', 'Button.module.css'],
      vue: ['Button.vue', 'Button.module.css'],
      deps: ['clsx'],
    },
    modal: {
      react: ['Modal.tsx', 'Modal.module.css', 'ModalHeader.tsx'],
      vue: ['Modal.vue', 'Modal.module.css'],
      deps: ['clsx'],
    },
    dropdown: {
      react: ['Dropdown.tsx', 'Dropdown.module.css', 'useDropdownSelection.ts', 'useDropdownState.ts'],
      vue: ['Dropdown.vue', 'Dropdown.module.css'],
      deps: ['clsx'],
      sharedReact: [
        { src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' },
      ],
    },
    toggle: {
      react: ['Toggle.tsx', 'Toggle.module.css'],
      vue: ['Toggle.vue', 'Toggle.module.css'],
      deps: ['clsx'],
      sharedReact: [
        { src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' },
      ],
    },
  },
  tokens: {
    src: 'packages/tokens/dist/css/variables.css',
    dest: 'src/styles/tokens.css',
  },
};

/**
 * Construye los argumentos en formato process.argv para Commander.
 * El primer elemento es siempre el ejecutable, el segundo el nombre del bin.
 * Los elementos siguientes son los argumentos reales del subcomando.
 */
function buildArgv(...args: string[]): string[] {
  return ['node', 'beusable', ...args];
}

function setupSuccessfulManifest(): void {
  vi.mocked(manifestModule.loadManifest).mockResolvedValue(FAKE_MANIFEST);
  vi.mocked(manifestModule.getComponentNames).mockReturnValue(['button', 'modal', 'dropdown', 'toggle']);
}

describe('add command — integración', () => {
  let originalExit: typeof process.exit;
  let exitCode: number | undefined;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    originalExit = process.exit;
    exitCode = undefined;

    process.exit = ((code?: number) => {
      exitCode = code ?? 0;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(fs.mkdir).mockResolvedValue(undefined as any);
    vi.mocked(fs.copyFile).mockResolvedValue(undefined);
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
    vi.mocked(fs.realpath).mockImplementation(async (p) => String(p) as any);
  });

  afterEach(() => {
    process.exit = originalExit;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('copia archivos React de button correctamente (AC-1)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const strPath = String(p);
      // tokens.css: no existe
      if (strPath.endsWith('tokens.css')) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      // destination files dentro del cwd: no existen
      if (strPath.startsWith(process.cwd())) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      // source files (/fake/monorepo/...): sí existen → no lanzar
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    // Usamos process.argv format: los 2 primeros son node + bin, luego vienen los args del subcomando
    await cmd.parseAsync(buildArgv('button', '--framework', 'react'));

    expect(vi.mocked(fs.copyFile)).toHaveBeenCalledTimes(2);
    const calls = vi.mocked(fs.copyFile).mock.calls.map((call) => String(call[0]));
    expect(calls.some((p) => p.includes('Button.tsx'))).toBe(true);
    expect(calls.some((p) => p.includes('Button.module.css'))).toBe(true);
  });

  it('sale con error cuando el componente no existe en el allowlist (BR-02)', async () => {
    setupSuccessfulManifest();

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');

    await expect(
      cmd.parseAsync(buildArgv('superevilcomponent'))
    ).rejects.toThrow(/process\.exit/);

    expect(exitCode).toBe(1);
    expect(vi.mocked(fs.copyFile)).not.toHaveBeenCalled();
  });

  it('sale con error por path traversal en el nombre (BR-02)', async () => {
    setupSuccessfulManifest();

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');

    await expect(
      cmd.parseAsync(buildArgv('../evil'))
    ).rejects.toThrow(/process\.exit/);

    expect(exitCode).toBe(1);
  });

  it('detecta conflicto y sale con error sin --overwrite (BR-04, AC-5)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const strPath = String(p);
      if (strPath.endsWith('tokens.css')) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      // destination files: SÍ existen → conflicto
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');

    await expect(
      cmd.parseAsync(buildArgv('button', '--framework', 'react'))
    ).rejects.toThrow(/process\.exit/);

    expect(exitCode).toBe(1);
    expect(vi.mocked(fs.copyFile)).not.toHaveBeenCalled();
  });

  it('con --overwrite sobreescribe archivos existentes (BR-04)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      if (String(p).endsWith('tokens.css')) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      // source files: sí existen
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('button', '--framework', 'react', '--overwrite'));

    expect(vi.mocked(fs.copyFile)).toHaveBeenCalledTimes(2);
  });

  it('muestra advertencia cuando tokens.css no existe (AC-7)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const strPath = String(p);
      if (strPath.endsWith('tokens.css')) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      if (strPath.startsWith(process.cwd())) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('button', '--framework', 'react'));

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tokens.css not found')
    );
  });

  it('NO muestra advertencia cuando tokens.css existe (AC-7 negativo)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const strPath = String(p);
      // tokens.css EXISTS (no throw)
      if (strPath.endsWith('tokens.css')) return;
      // destination files inside cwd: do NOT exist
      if (strPath.startsWith(process.cwd())) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      // source files: exist
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('button', '--framework', 'react'));

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('copia tokens al directorio src/styles (AC-7 flujo tokens)', async () => {
    setupSuccessfulManifest();

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      // Source inside fake monorepo: exists
      if (String(p).startsWith('/fake/monorepo')) return;
      // Destination: does not exist → triggers copy
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('tokens'));

    expect(vi.mocked(fs.copyFile)).toHaveBeenCalledTimes(1);
    const srcArg = String(vi.mocked(fs.copyFile).mock.calls[0][0]);
    const destArg = String(vi.mocked(fs.copyFile).mock.calls[0][1]);
    expect(srcArg).toContain('variables.css');
    expect(destArg).toContain('styles');
  });

  it('tokens usa src/styles no src/components como destino por defecto (bug fix BR-01)', async () => {
    setupSuccessfulManifest();

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      if (String(p).startsWith('/fake/monorepo')) return;
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('tokens'));

    const destArg = String(vi.mocked(fs.copyFile).mock.calls[0][1]);
    expect(destArg).not.toContain('/components');
    expect(destArg).toContain('/styles');
  });

  it('instala dropdown React con useControllableState (sharedReact regression)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const s = String(p);
      if (s.endsWith('tokens.css')) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      if (s.startsWith(process.cwd())) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('dropdown', '--framework', 'react'));

    const srcPaths = vi.mocked(fs.copyFile).mock.calls.map((c) => String(c[0]));
    expect(srcPaths.some((p) => p.includes('useControllableState.ts'))).toBe(true);
  });

  it('instala toggle React con useControllableState (sharedReact regression)', async () => {
    setupSuccessfulManifest();
    vi.mocked(detectFramework).mockResolvedValue('react');

    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      const s = String(p);
      if (s.endsWith('tokens.css')) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      if (s.startsWith(process.cwd())) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    });

    const cmd = createAddCommand('/fake/manifest', '/fake/monorepo');
    await cmd.parseAsync(buildArgv('toggle', '--framework', 'react'));

    const srcPaths = vi.mocked(fs.copyFile).mock.calls.map((c) => String(c[0]));
    expect(srcPaths.some((p) => p.includes('useControllableState.ts'))).toBe(true);
  });
});
