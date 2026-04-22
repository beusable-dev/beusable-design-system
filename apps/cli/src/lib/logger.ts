import pc from 'picocolors';

/**
 * 일관된 형식의 로그 출력 함수.
 *   ✓ Copied Button.tsx → src/components/Button/Button.tsx
 *   ✗ File already exists: ...
 *   ⚠ tokens.css not found.
 */

export function logSuccess(message: string): void {
  console.log(pc.green('✓') + ' ' + message);
}

export function logError(message: string): void {
  console.error(pc.red('✗') + ' ' + message);
}

export function logWarning(message: string): void {
  console.warn(pc.yellow('⚠') + ' ' + message);
}

export function logInfo(message: string): void {
  console.log(pc.cyan('ℹ') + ' ' + message);
}

export function logPlain(message: string): void {
  console.log(message);
}

export function logFileCopied(fileName: string, destPath: string): void {
  logSuccess(`Copied ${fileName} → ${destPath}`);
}

export function logDependencies(deps: string[]): void {
  if (deps.length === 0) return;

  logPlain('');
  logPlain('다음 명령으로 의존성을 설치하세요:');
  logPlain(`  pnpm add ${deps.join(' ')}`);
}
