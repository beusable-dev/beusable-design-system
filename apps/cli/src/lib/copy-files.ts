import { copyFile, mkdir, access, unlink, rename, realpath as fsRealpath } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';

export class PathTraversalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathTraversalError';
  }
}

export class ComponentNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComponentNameError';
  }
}

export class FileConflictError extends Error {
  public readonly conflictingFiles: string[];

  constructor(conflictingFiles: string[]) {
    super(
      `Los siguientes archivos ya existen:\n${conflictingFiles.map((f) => `  ${f}`).join('\n')}\nUsa --overwrite para reemplazarlos.`
    );
    this.name = 'FileConflictError';
    this.conflictingFiles = conflictingFiles;
  }
}

export class SourceFileNotFoundError extends Error {
  constructor(sourcePath: string) {
    super(`Archivo fuente no encontrado: ${sourcePath}`);
    this.name = 'SourceFileNotFoundError';
  }
}

/**
 * Valida y resuelve el directorio de salida.
 * BR-01: Bloquea path traversal comprobando que el resultado esté dentro del cwd.
 */
export function validateOutputDir(cwd: string, outputDir: string): string {
  const resolvedOutput = path.resolve(cwd, outputDir);

  if (!resolvedOutput.startsWith(cwd + path.sep) && resolvedOutput !== cwd) {
    throw new PathTraversalError(
      `Ruta de salida fuera del proyecto: "${outputDir}". No se permite path traversal.`
    );
  }

  return resolvedOutput;
}

/**
 * Valida el nombre del componente contra la allowlist.
 * BR-02: Rechaza nombres con path traversal o caracteres peligrosos.
 */
export function validateComponentName(componentName: string, allowlist: string[]): void {
  if (!componentName || componentName.includes('/') || componentName.includes('..')) {
    throw new ComponentNameError(
      `Nombre de componente inválido: "${componentName}". No se permiten slashes ni path traversal.`
    );
  }

  if (componentName === 'tokens') {
    return;
  }

  if (!allowlist.includes(componentName.toLowerCase())) {
    throw new ComponentNameError(
      `Componente desconocido: "${componentName}". Usa "beusable list" para ver los componentes disponibles.`
    );
  }
}

export interface FileCopyOperation {
  /** Ruta absoluta del archivo fuente — siempre calculada desde __dirname, nunca del input del usuario (BR-03) */
  absoluteSourcePath: string;
  /** Ruta relativa de destino (se mostrará al usuario) */
  relativeDestPath: string;
  /** Si true, se omite la copia si el destino ya existe (usado para shared deps). */
  skipIfExists?: boolean;
}

export interface CopyFilesOptions {
  overwrite: boolean;
  resolvedOutputDir: string;
  /** Project root used to confine all destination paths. Defaults to process.cwd(). */
  projectRoot?: string;
}

export interface CopyResult {
  copiedFiles: string[];
}

/**
 * Copia archivos de fuente a destino con rollback en caso de error.
 * BR-05: Crea el directorio de destino si no existe.
 * BR-06: Verifica existencia de fuente antes de copiar; hace rollback si falla.
 */
export async function copyFiles(
  operations: FileCopyOperation[],
  options: CopyFilesOptions
): Promise<CopyResult> {
  const { overwrite, resolvedOutputDir } = options;
  const projectRoot = options.projectRoot ?? process.cwd();

  // Confine every destination to the project root before any I/O.
  // Shared deps legitimately use '..' to target sibling directories (e.g. src/hooks/),
  // but all paths must still resolve within the consumer project.
  for (const operation of operations) {
    const absoluteDest = path.resolve(resolvedOutputDir, operation.relativeDestPath);
    if (!absoluteDest.startsWith(projectRoot + path.sep) && absoluteDest !== projectRoot) {
      throw new PathTraversalError(
        `Destination path escapes project root: "${operation.relativeDestPath}"`
      );
    }
  }

  // BR-05: crear directorio si no existe
  await mkdir(resolvedOutputDir, { recursive: true });

  // Resolve real paths after mkdir so symlinks in the path are detected (BR-01/BR-03).
  const realProjectRoot = await fsRealpath(projectRoot);
  await assertWithinProjectRoot(resolvedOutputDir, realProjectRoot);

  // Comprobar conflictos si no se sobreescribe (BR-04)
  // Operaciones con skipIfExists se ignoran en el conflicto check.
  if (!overwrite) {
    const conflictingFiles: string[] = [];
    for (const operation of operations) {
      if (operation.skipIfExists) continue;
      const destPath = path.join(resolvedOutputDir, operation.relativeDestPath);
      if (await fileExists(destPath)) {
        conflictingFiles.push(operation.relativeDestPath);
      }
    }

    if (conflictingFiles.length > 0) {
      throw new FileConflictError(conflictingFiles);
    }
  }

  // Verificar que todos los archivos fuente existen antes de copiar nada (BR-06)
  for (const operation of operations) {
    if (!await fileExists(operation.absoluteSourcePath)) {
      throw new SourceFileNotFoundError(operation.absoluteSourcePath);
    }
  }

  // Copiar con rollback en caso de error (BR-06)
  const copiedFiles: string[] = [];

  if (overwrite) {
    // Overwrite path — atomic 3-phase pattern:
    //   Phase 1 (Staging): write each file to a unique .tmp path; originals untouched.
    //   Phase 2 (Commit):  for each op, rename existing dest → .bak, then rename .tmp → dest.
    //   Phase 3 (Cleanup): unlink all .bak files (best-effort).
    // On Phase 1 failure: unlink all .tmp files written so far; throw original error.
    // On Phase 2 failure: rollback already-committed ops; throw combined error if rollback fails.
    // This removes the unlink→rename gap in the old rollback, making restore atomic.

    interface StagingEntry {
      operation: FileCopyOperation;
      destPath: string;
      tmpPath: string;
      /** True when destPath existed before Phase 1 (and was not skipped). */
      hadOriginal: boolean;
    }

    // ── Phase 1: Staging ──────────────────────────────────────────────────────
    const staged: StagingEntry[] = [];
    try {
      for (const operation of operations) {
        const destPath = path.join(resolvedOutputDir, operation.relativeDestPath);
        const destDir = path.dirname(destPath);
        await mkdir(destDir, { recursive: true });
        await assertWithinProjectRoot(destDir, realProjectRoot);

        const destAlreadyExists = await fileExists(destPath);
        if (destAlreadyExists && operation.skipIfExists) continue;

        const tmpPath = destPath + '.' + randomUUID() + '.tmp';
        await copyFile(operation.absoluteSourcePath, tmpPath);
        staged.push({ operation, destPath, tmpPath, hadOriginal: destAlreadyExists });
      }
    } catch (stagingError) {
      // Clean up any .tmp files written so far; originals were never touched.
      for (const { tmpPath } of staged) {
        await unlink(tmpPath).catch(() => {});
      }
      throw stagingError;
    }

    // ── Phase 2: Commit ───────────────────────────────────────────────────────
    // Track which ops have been committed so we can roll back on failure.
    interface CommitRecord {
      destPath: string;
      bakPath: string | null; // null = new file (no original existed)
    }
    const committed: CommitRecord[] = [];

    try {
      for (const { operation, destPath, tmpPath, hadOriginal } of staged) {
        let bakPath: string | null = null;

        if (hadOriginal) {
          bakPath = destPath + '.' + randomUUID() + '.bak';
          await rename(destPath, bakPath);
        }

        try {
          await rename(tmpPath, destPath);
        } catch (renameErr) {
          // tmp→dest rename failed; restore .bak if we moved the original.
          if (bakPath !== null) {
            await rename(bakPath, destPath).catch(() => {});
          }
          throw renameErr;
        }

        committed.push({ destPath, bakPath });
        copiedFiles.push(operation.relativeDestPath);
      }
    } catch (commitError) {
      // Phase 2-rollback: undo all already-committed ops in reverse order.
      const rollbackFailures: string[] = [];

      for (const { destPath, bakPath } of [...committed].reverse()) {
        if (bakPath !== null) {
          // Had an original — restore it atomically (rename overwrites dest).
          try {
            await rename(bakPath, destPath);
          } catch (err) {
            rollbackFailures.push(`restore ${destPath}: ${err instanceof Error ? err.message : err}`);
          }
        } else {
          // New file — remove it.
          try {
            await unlink(destPath);
          } catch (err) {
            rollbackFailures.push(`delete ${destPath}: ${err instanceof Error ? err.message : err}`);
          }
        }
      }

      // Also clean up any remaining .tmp files from uncommitted staged ops.
      const committedDestSet = new Set(committed.map(c => c.destPath));
      for (const { destPath, tmpPath } of staged) {
        if (!committedDestSet.has(destPath)) {
          await unlink(tmpPath).catch(() => {});
        }
      }

      if (rollbackFailures.length > 0) {
        const originalMsg = commitError instanceof Error ? commitError.message : String(commitError);
        const rollbackMsg = `Rollback failed — the following files may be in an inconsistent state (manual recovery required):\n${rollbackFailures.map(f => `  ${f}`).join('\n')}`;
        throw new Error(`Install failed: ${originalMsg}\n\n${rollbackMsg}`);
      }

      throw commitError;
    }

    // ── Phase 3: Cleanup ─────────────────────────────────────────────────────
    for (const { bakPath } of committed) {
      if (bakPath === null) continue;
      try {
        await unlink(bakPath);
      } catch (err) {
        console.warn(`⚠ Could not remove backup ${bakPath}: ${err instanceof Error ? err.message : err}`);
      }
    }
  } else {
    try {
      for (const operation of operations) {
        const destPath = path.join(resolvedOutputDir, operation.relativeDestPath);
        if (operation.skipIfExists && await fileExists(destPath)) continue;
        const destDir = path.dirname(destPath);
        await mkdir(destDir, { recursive: true });
        await assertWithinProjectRoot(destDir, realProjectRoot);
        await copyFile(operation.absoluteSourcePath, destPath);
        copiedFiles.push(operation.relativeDestPath);
      }
    } catch (error) {
      await rollbackCopiedFiles(copiedFiles, resolvedOutputDir);
      throw error;
    }
  }

  return { copiedFiles };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertWithinProjectRoot(absPath: string, realProjectRoot: string): Promise<void> {
  const real = await fsRealpath(absPath);
  if (!real.startsWith(realProjectRoot + path.sep) && real !== realProjectRoot) {
    throw new PathTraversalError(
      `Path escapes project root via symlink: "${absPath}"`
    );
  }
}

async function rollbackCopiedFiles(
  relativeDestPaths: string[],
  resolvedOutputDir: string
): Promise<void> {
  for (const relPath of relativeDestPaths) {
    const fullPath = path.join(resolvedOutputDir, relPath);
    try {
      await unlink(fullPath);
    } catch (err) {
      // Rollback best-effort: log but do not re-throw (would mask the original error)
      console.warn(`⚠ Could not clean up ${fullPath}: ${err instanceof Error ? err.message : err}`);
    }
  }
}
