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
      `다음 파일이 이미 존재합니다:\n${conflictingFiles.map((f) => `  ${f}`).join('\n')}\n--overwrite 옵션을 사용하면 덮어쓸 수 있습니다.`
    );
    this.name = 'FileConflictError';
    this.conflictingFiles = conflictingFiles;
  }
}

export class SourceFileNotFoundError extends Error {
  constructor(sourcePath: string) {
    super(`소스 파일을 찾을 수 없습니다: ${sourcePath}`);
    this.name = 'SourceFileNotFoundError';
  }
}

/**
 * 출력 디렉토리를 검증하고 절대 경로로 반환한다.
 * BR-01: 결과 경로가 cwd 내부에 있는지 확인하여 경로 탈출을 차단한다.
 */
export function validateOutputDir(cwd: string, outputDir: string): string {
  const resolvedOutput = path.resolve(cwd, outputDir);

  if (!resolvedOutput.startsWith(cwd + path.sep) && resolvedOutput !== cwd) {
    throw new PathTraversalError(
      `프로젝트 외부 출력 경로: "${outputDir}". 경로 탈출은 허용되지 않습니다.`
    );
  }

  return resolvedOutput;
}

/**
 * 컴포넌트 이름을 allowlist에 대해 검증한다.
 * BR-02: 경로 탈출이나 위험한 문자가 포함된 이름을 거부한다.
 */
export function validateComponentName(componentName: string, allowlist: string[]): void {
  if (!componentName || componentName.includes('/') || componentName.includes('..')) {
    throw new ComponentNameError(
      `유효하지 않은 컴포넌트 이름: "${componentName}". 슬래시 및 경로 탈출은 허용되지 않습니다.`
    );
  }

  if (componentName === 'tokens') {
    return;
  }

  if (!allowlist.includes(componentName.toLowerCase())) {
    throw new ComponentNameError(
      `알 수 없는 컴포넌트: "${componentName}". "beusable list" 명령으로 사용 가능한 컴포넌트를 확인하세요.`
    );
  }
}

export interface FileCopyOperation {
  /** 소스 파일의 절대 경로 — 항상 __dirname 기준으로 계산, 사용자 입력 금지 (BR-03) */
  absoluteSourcePath: string;
  /** 목적지 상대 경로 (사용자에게 표시됨) */
  relativeDestPath: string;
  /** true이면 목적지가 이미 존재할 때 복사를 건너뜀 (shared deps에 사용). */
  skipIfExists?: boolean;
}

export interface CopyFilesOptions {
  overwrite: boolean;
  resolvedOutputDir: string;
  /** Project root used to confine all destination paths. Defaults to process.cwd(). */
  projectRoot?: string;
  /** Monorepo root used to confine all source paths. When provided, every absoluteSourcePath must resolve within this directory. */
  monorepoRoot?: string;
}

export interface BackupEntry {
  /** Absolute path of the newly installed file. */
  destPath: string;
  /** Absolute path of the .bak backup of the original file. */
  bakPath: string;
}

export interface CopyResult {
  copiedFiles: string[];
  /**
   * Backup entries created during --overwrite. The caller must either:
   * - delete these after post-processing succeeds (happy path), or
   * - rename them back to destPath if post-processing fails (recovery).
   */
  backups: BackupEntry[];
}

/**
 * 소스에서 목적지로 파일을 복사하며 오류 시 롤백한다.
 * BR-05: 목적지 디렉토리가 없으면 생성한다.
 * BR-06: 복사 전 소스 파일 존재를 확인하고; 실패 시 롤백한다.
 */
export async function copyFiles(
  operations: FileCopyOperation[],
  options: CopyFilesOptions
): Promise<CopyResult> {
  const { overwrite, resolvedOutputDir } = options;
  const projectRoot = options.projectRoot ?? process.cwd();

  // Confine every source path to the monorepo root when provided (C-2).
  if (options.monorepoRoot !== undefined) {
    const realMonorepoRoot = await fsRealpath(options.monorepoRoot);
    for (const operation of operations) {
      const realSrc = await fsRealpath(operation.absoluteSourcePath).catch(() => operation.absoluteSourcePath);
      if (!realSrc.startsWith(realMonorepoRoot + path.sep) && realSrc !== realMonorepoRoot) {
        throw new PathTraversalError(
          `소스 경로가 모노레포 루트를 벗어났습니다: "${operation.absoluteSourcePath}"`
        );
      }
    }
  }

  // Confine every destination to the project root before any I/O.
  // Shared deps legitimately use '..' to target sibling directories (e.g. src/hooks/),
  // but all paths must still resolve within the consumer project.
  for (const operation of operations) {
    const absoluteDest = path.resolve(resolvedOutputDir, operation.relativeDestPath);
    if (!absoluteDest.startsWith(projectRoot + path.sep) && absoluteDest !== projectRoot) {
      throw new PathTraversalError(
        `목적지 경로가 프로젝트 루트를 벗어났습니다: "${operation.relativeDestPath}"`
      );
    }
  }

  // BR-05: 디렉토리가 없으면 생성
  await mkdir(resolvedOutputDir, { recursive: true });

  // mkdir 후 realpath로 symlink를 해소하여 재검증 (BR-01/BR-03).
  const realProjectRoot = await fsRealpath(projectRoot);
  await assertWithinProjectRoot(resolvedOutputDir, realProjectRoot);

  // 충돌 감지 (BR-04) — --overwrite 없을 때만 실행
  // skipIfExists인 operation은 충돌 체크에서 제외.
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

  // 복사 전 모든 소스 파일 존재 확인 (BR-06)
  for (const operation of operations) {
    if (!await fileExists(operation.absoluteSourcePath)) {
      throw new SourceFileNotFoundError(operation.absoluteSourcePath);
    }
  }

  // 복사 실행 — 오류 시 롤백 포함 (BR-06)
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

    // ── Phase 3: Collect backups (cleanup deferred to caller) ────────────────
    // The caller must delete these after successful post-processing, or restore
    // them (rename bakPath → destPath) if post-processing fails.
    const backups: BackupEntry[] = committed
      .filter(c => c.bakPath !== null)
      .map(c => ({ destPath: c.destPath, bakPath: c.bakPath! }));

    return { copiedFiles, backups };
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

  return { copiedFiles, backups: [] };
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
      `심볼릭 링크로 프로젝트 루트를 벗어나는 경로: "${absPath}"`
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
      console.warn(`⚠ 롤백 중 파일 삭제 실패 ${fullPath}: ${err instanceof Error ? err.message : err}`);
    }
  }
}
