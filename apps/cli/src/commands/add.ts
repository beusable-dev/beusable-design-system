import { Command } from 'commander';
import path from 'path';
import { access } from 'fs/promises';

import { loadManifest, getComponentNames } from '../lib/manifest';
import type { SharedFileDep } from '../lib/manifest';
import { detectFramework, FrameworkDetectionError } from '../lib/detect-framework';
import {
  validateOutputDir,
  validateComponentName,
  copyFiles,
  PathTraversalError,
  ComponentNameError,
  FileConflictError,
  SourceFileNotFoundError,
  FileCopyOperation,
} from '../lib/copy-files';
import { logError, logWarning, logFileCopied, logDependencies, logInfo, logPlain } from '../lib/logger';

/**
 * beusable add <component> [--framework react|vue] [--output-dir <dir>] [--overwrite]
 * beusable add tokens [--output-dir <dir>] [--overwrite]
 */
export function createAddCommand(
  manifestDir: string,
  monorepoRoot: string
): Command {
  return new Command('add')
    .description('Añade un componente o tokens CSS al proyecto actual')
    .argument('<component>', 'Nombre del componente (ej: button) o "tokens"')
    .option('--framework <framework>', 'Framework: react o vue')
    .option('--output-dir <dir>', 'Directorio de salida', 'src/components')
    .option('--overwrite', 'Sobreescribir archivos existentes', false)
    .action(async (componentArg: string, options: {
      framework?: string;
      outputDir: string;
      overwrite: boolean;
    }) => {
      const cwd = process.cwd();

      // Cargar manifiesto
      let manifest;
      try {
        manifest = await loadManifest(manifestDir);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logError(message);
        process.exit(1);
      }

      const componentName = componentArg.toLowerCase();
      const allowlist = getComponentNames(manifest);

      // BR-02: validar nombre del componente
      try {
        validateComponentName(componentName, allowlist);
      } catch (error) {
        if (error instanceof ComponentNameError || error instanceof PathTraversalError) {
          logError(error.message);
          process.exit(1);
        }
        throw error;
      }

      // BR-01: validar output-dir
      // tokens uses the manifest's declared dest dir (e.g. "src/styles"), not --output-dir
      let resolvedOutputDir: string;
      try {
        const baseOutputDir = componentName === 'tokens'
          ? path.dirname(manifest.tokens.dest)
          : options.outputDir;
        resolvedOutputDir = validateOutputDir(cwd, baseOutputDir);
      } catch (error) {
        if (error instanceof PathTraversalError) {
          logError(error.message);
          process.exit(1);
        }
        throw error;
      }

      // Flujo "tokens"
      if (componentName === 'tokens') {
        await addTokens(manifest, monorepoRoot, resolvedOutputDir, options.overwrite, cwd);
        return;
      }

      // Detectar framework (ADR-0005)
      let framework: string;
      try {
        framework = await detectFramework(cwd, options.framework);
      } catch (error) {
        if (error instanceof FrameworkDetectionError) {
          logError(error.message);
          process.exit(1);
        }
        throw error;
      }

      // AC-7: comprobar si tokens.css existe
      const tokensDestPath = path.join(cwd, 'src/styles/tokens.css');
      const tokensExist = await fileExists(tokensDestPath);
      if (!tokensExist) {
        logWarning('tokens.css not found. Run `beusable add tokens` first to install CSS variables.');
      }

      // BFS: collect main component + all transitive componentDeps
      const toInstall = new Set<string>();
      const queue = [componentName];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (toInstall.has(curr)) continue;
        toInstall.add(curr);
        const depEntry = manifest.components[curr];
        if (!depEntry) continue;
        for (const dep of depEntry.componentDeps ?? []) queue.push(dep);
      }

      // Validate that the main component has files for the selected framework
      const mainEntry = manifest.components[componentName];
      const mainFiles: string[] = framework === 'react' ? mainEntry.react : mainEntry.vue;
      if (mainFiles.length === 0) {
        logError(`No hay archivos para el componente "${componentName}" en framework "${framework}".`);
        process.exit(1);
      }

      // Build operations for all components in one atomic copyFiles call.
      // resolvedOutputDir stays at src/components level.
      // relativeDestPath is ComponentDir/filename (e.g. Button/Button.tsx).
      const frameworkSrcBase = path.join(monorepoRoot, `packages/${framework}/src`);

      const operations: FileCopyOperation[] = [];
      for (const compName of toInstall) {
        const entry = manifest.components[compName];
        if (!entry) continue;
        const compDirName = toComponentDirName(compName);
        const compFiles: string[] = framework === 'react' ? entry.react : entry.vue;
        const compShared: SharedFileDep[] = framework === 'react'
          ? (entry.sharedReact ?? [])
          : (entry.sharedVue ?? []);
        const isMain = compName === componentName;

        // Skip transitive deps that have no files for this framework
        if (!isMain && compFiles.length === 0) continue;

        for (const filename of compFiles) {
          operations.push({
            absoluteSourcePath: path.join(
              frameworkSrcBase,
              `components/${compDirName}`,
              filename,
            ),
            relativeDestPath: path.join(compDirName, filename),
            skipIfExists: !isMain && !options.overwrite,
          });
        }

        for (const shared of compShared) {
          operations.push({
            absoluteSourcePath: path.join(frameworkSrcBase, shared.src),
            relativeDestPath: path.join(compDirName, shared.dest),
            skipIfExists: !options.overwrite,
          });
        }
      }

      // Copiar archivos
      try {
        const result = await copyFiles(operations, {
          overwrite: options.overwrite,
          resolvedOutputDir, // src/components level
          projectRoot: cwd,
        });

        for (const copiedFile of result.copiedFiles) {
          const absDestPath = path.join(resolvedOutputDir, copiedFile);
          const relPath = path.relative(cwd, absDestPath);
          logFileCopied(path.basename(copiedFile), relPath);
        }

        // Union dependencies from all installed components
        const allDeps = new Set<string>();
        for (const compName of toInstall) {
          const entry = manifest.components[compName];
          for (const dep of entry?.deps ?? []) allDeps.add(dep);
        }
        logDependencies(Array.from(allDeps).sort());

      } catch (error) {
        if (error instanceof FileConflictError) {
          logError(`Archivos en conflicto:\n${error.conflictingFiles.map((f) => `  ${f}`).join('\n')}`);
          logPlain('  Usa --overwrite para reemplazar los archivos existentes.');
          process.exit(1);
        }
        if (error instanceof SourceFileNotFoundError) {
          logError(error.message);
          process.exit(1);
        }
        throw error;
      }
    });
}

async function addTokens(
  manifest: { tokens: { src: string; dest: string } },
  monorepoRoot: string,
  resolvedOutputDir: string,
  overwrite: boolean,
  cwd: string
): Promise<void> {
  const tokensSrcPath = path.join(monorepoRoot, manifest.tokens.src);
  const tokensFilename = path.basename(manifest.tokens.dest);

  const operations: FileCopyOperation[] = [
    {
      absoluteSourcePath: tokensSrcPath,
      relativeDestPath: tokensFilename,
    },
  ];

  try {
    const result = await copyFiles(operations, {
      overwrite,
      resolvedOutputDir,
      projectRoot: cwd,
    });

    for (const copiedFile of result.copiedFiles) {
      const relPath = path.relative(cwd, path.join(resolvedOutputDir, copiedFile));
      logFileCopied(copiedFile, relPath);
    }

    logInfo('Importa los tokens en tu entrada CSS: @import "./tokens.css"');

  } catch (error) {
    if (error instanceof FileConflictError) {
      logError(`Archivos en conflicto:\n${error.conflictingFiles.map((f) => `  ${f}`).join('\n')}`);
      logPlain('  Usa --overwrite para reemplazar los archivos existentes.');
      process.exit(1);
    }
    if (error instanceof SourceFileNotFoundError) {
      logError(error.message);
      logError('¿Has ejecutado `pnpm --filter @beusable/tokens build` primero?');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Convierte el nombre del componente en minúsculas al nombre del directorio
 * con la primera letra en mayúscula que usa el monorepo.
 * Ejemplos: "button" → "Button", "datepicker" → "DatePicker", "tabs" → "Tabs"
 */
function toComponentDirName(componentName: string): string {
  const COMPONENT_DIR_MAP: Record<string, string> = {
    button: 'Button',
    textfield: 'TextField',
    dropdown: 'Dropdown',
    toast: 'Toast',
    checkbox: 'Checkbox',
    radio: 'Radio',
    toggle: 'Toggle',
    snackbar: 'Snackbar',
    tooltip: 'Tooltip',
    modal: 'Modal',
    table: 'Table',
    slider: 'Slider',
    tabs: 'Tabs',
    datepicker: 'DatePicker',
  };

  return COMPONENT_DIR_MAP[componentName] ?? capitalize(componentName);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
