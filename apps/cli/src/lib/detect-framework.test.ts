import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectFramework, FrameworkDetectionError } from './detect-framework';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

const mockReadFile = vi.mocked(fs.readFile);

describe('detectFramework', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devuelve "react" cuando solo react está en dependencies', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ dependencies: { react: '^18.0.0' } }) as any
    );
    const result = await detectFramework('/fake/project');
    expect(result).toBe('react');
  });

  it('devuelve "react" cuando react está en devDependencies', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ devDependencies: { react: '^18.0.0' } }) as any
    );
    const result = await detectFramework('/fake/project');
    expect(result).toBe('react');
  });

  it('devuelve "vue" cuando solo vue está en dependencies', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ dependencies: { vue: '^3.0.0' } }) as any
    );
    const result = await detectFramework('/fake/project');
    expect(result).toBe('vue');
  });

  it('lanza FrameworkDetectionError cuando react y vue están ambos presentes', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ dependencies: { react: '^18.0.0', vue: '^3.0.0' } }) as any
    );
    await expect(detectFramework('/fake/project')).rejects.toThrow(FrameworkDetectionError);
  });

  it('lanza FrameworkDetectionError cuando no hay ni react ni vue', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ dependencies: { lodash: '^4.0.0' } }) as any
    );
    await expect(detectFramework('/fake/project')).rejects.toThrow(FrameworkDetectionError);
  });

  it('lanza FrameworkDetectionError cuando no existe package.json', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    await expect(detectFramework('/fake/project')).rejects.toThrow(FrameworkDetectionError);
  });

  it('devuelve el framework explícito cuando se pasa --framework react', async () => {
    const result = await detectFramework('/fake/project', 'react');
    expect(result).toBe('react');
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('devuelve el framework explícito cuando se pasa --framework vue', async () => {
    const result = await detectFramework('/fake/project', 'vue');
    expect(result).toBe('vue');
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('lanza FrameworkDetectionError para framework explícito desconocido', async () => {
    await expect(detectFramework('/fake/project', 'angular' as any)).rejects.toThrow(
      FrameworkDetectionError
    );
  });
});
