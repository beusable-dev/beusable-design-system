import { Command } from 'commander';
import { loadManifest, getComponentNames } from '../lib/manifest';
import { logPlain, logError } from '../lib/logger';

/**
 * beusable list
 *
 * Muestra los componentes disponibles y el token "tokens".
 */
export function createListCommand(manifestDir: string): Command {
  return new Command('list')
    .description('Muestra los componentes disponibles para instalar')
    .action(async () => {
      let manifest;
      try {
        manifest = await loadManifest(manifestDir);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logError(message);
        process.exit(1);
      }

      const componentNames = getComponentNames(manifest).sort();

      logPlain('Componentes disponibles:');
      logPlain('');

      for (const name of componentNames) {
        const entry = manifest.components[name];
        const depList = entry.deps.length > 0 ? `  (deps: ${entry.deps.join(', ')})` : '';
        logPlain(`  ${name}${depList}`);
      }

      logPlain('');
      logPlain('  tokens  (CSS variables)');
      logPlain('');
      logPlain(`Total: ${componentNames.length} componentes + tokens`);
    });
}
