import pc from 'picocolors';

/**
 * Funciones de log con formato consistente.
 * Formato de salida definido en el PRD:
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
  logPlain('Run the following to install dependencies:');
  logPlain(`  pnpm add ${deps.join(' ')}`);
}
