import { describe, it, expect, afterEach } from 'vitest';
import { mkdir, mkdtemp, symlink, writeFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { validateOutputDir, validateComponentName, copyFiles, PathTraversalError } from './copy-files';

describe('validateOutputDir (BR-01)', () => {
  const cwd = '/home/user/myproject';

  it('acepta una ruta relativa normal', () => {
    const result = validateOutputDir(cwd, 'src/components');
    expect(result).toBe('/home/user/myproject/src/components');
  });

  it('acepta una ruta absoluta dentro del cwd', () => {
    const result = validateOutputDir(cwd, '/home/user/myproject/src/components');
    expect(result).toBe('/home/user/myproject/src/components');
  });

  it('bloquea path traversal con ../', () => {
    expect(() => validateOutputDir(cwd, '../evil')).toThrow(PathTraversalError);
  });

  it('bloquea path traversal complejo', () => {
    expect(() => validateOutputDir(cwd, 'src/../../etc/passwd')).toThrow(PathTraversalError);
  });

  it('bloquea ruta absoluta fuera del cwd', () => {
    expect(() => validateOutputDir(cwd, '/etc/passwd')).toThrow(PathTraversalError);
  });
});

describe('validateComponentName (BR-02)', () => {
  const allowlist = ['button', 'textfield', 'modal', 'datepicker'];

  it('acepta nombre de componente válido', () => {
    expect(() => validateComponentName('button', allowlist)).not.toThrow();
  });

  it('acepta "tokens" como nombre especial', () => {
    expect(() => validateComponentName('tokens', allowlist)).not.toThrow();
  });

  it('rechaza nombre no en allowlist', () => {
    expect(() => validateComponentName('superevilcomponent', allowlist)).toThrow();
  });

  it('rechaza path traversal en el nombre', () => {
    expect(() => validateComponentName('../evil', allowlist)).toThrow();
  });

  it('rechaza nombre con slash', () => {
    expect(() => validateComponentName('button/evil', allowlist)).toThrow();
  });

  it('rechaza nombre vacío', () => {
    expect(() => validateComponentName('', allowlist)).toThrow();
  });
});

describe('copyFiles — symlink path confinement (BR-01/BR-03)', () => {
  const tmpDirs: string[] = [];

  afterEach(async () => {
    for (const dir of tmpDirs) {
      await rm(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  it('lanza PathTraversalError cuando resolvedOutputDir es un symlink fuera del proyecto', async () => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'beusable-outside-'));
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'beusable-project-'));
    tmpDirs.push(outside, projectRoot);

    const symlinkPath = path.join(projectRoot, 'evil-link');
    await symlink(outside, symlinkPath);

    const srcFile = path.join(projectRoot, 'source.txt');
    await writeFile(srcFile, 'hello');

    await expect(
      copyFiles(
        [{ absoluteSourcePath: srcFile, relativeDestPath: 'file.txt' }],
        { overwrite: false, resolvedOutputDir: symlinkPath, projectRoot }
      )
    ).rejects.toThrow(PathTraversalError);
  });

  it('lanza PathTraversalError cuando un subdirectorio de destino es un symlink fuera del proyecto', async () => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'beusable-outside-'));
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'beusable-project-'));
    tmpDirs.push(outside, projectRoot);

    const outputDir = path.join(projectRoot, 'src', 'components');
    await mkdir(outputDir, { recursive: true });

    const evilSubdir = path.join(outputDir, 'evil');
    await symlink(outside, evilSubdir);

    const srcFile = path.join(projectRoot, 'source.txt');
    await writeFile(srcFile, 'hello');

    await expect(
      copyFiles(
        [{ absoluteSourcePath: srcFile, relativeDestPath: 'evil/file.txt' }],
        { overwrite: false, resolvedOutputDir: outputDir, projectRoot }
      )
    ).rejects.toThrow(PathTraversalError);
  });

  it('lanza PathTraversalError en modo overwrite cuando resolvedOutputDir es un symlink fuera del proyecto', async () => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'beusable-outside-'));
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'beusable-project-'));
    tmpDirs.push(outside, projectRoot);

    const symlinkPath = path.join(projectRoot, 'evil-link');
    await symlink(outside, symlinkPath);

    const srcFile = path.join(projectRoot, 'source.txt');
    await writeFile(srcFile, 'hello');

    await expect(
      copyFiles(
        [{ absoluteSourcePath: srcFile, relativeDestPath: 'file.txt' }],
        { overwrite: true, resolvedOutputDir: symlinkPath, projectRoot }
      )
    ).rejects.toThrow(PathTraversalError);
  });
});
