import { Command } from 'commander';
import path from 'path';
import { access, readFile, rename, unlink, writeFile } from 'fs/promises';

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
    .description('컴포넌트 또는 CSS 토큰을 현재 프로젝트에 추가합니다')
    .argument('<component>', '컴포넌트 이름 (예: button) 또는 "tokens"')
    .option('--framework <framework>', '프레임워크: react 또는 vue')
    .option('--output-dir <dir>', '출력 디렉토리', 'src/components')
    .option('--overwrite', '기존 파일 덮어쓰기', false)
    .option('--scss', 'Copiar tokens como SCSS y renombrar .module.css → .module.scss', false)
    .action(async (componentArg: string, options: {
      framework?: string;
      outputDir: string;
      overwrite: boolean;
      scss: boolean;
    }) => {
      const cwd = process.cwd();

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

      // BR-02: 컴포넌트 이름 검증
      try {
        validateComponentName(componentName, allowlist);
      } catch (error) {
        if (error instanceof ComponentNameError || error instanceof PathTraversalError) {
          logError(error.message);
          process.exit(1);
        }
        throw error;
      }

      // BR-01: output-dir 검증
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

      if (componentName === 'tokens') {
        await addTokens(manifest, monorepoRoot, resolvedOutputDir, options.overwrite, options.scss, cwd);
        return;
      }

      // 프레임워크 감지 (ADR-0005)
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

      // AC-7: 토큰 파일 존재 확인 (CSS 또는 SCSS)
      const tokensDestPath = options.scss
        ? path.join(cwd, manifest.tokens.destScss)
        : path.join(cwd, manifest.tokens.dest);
      const tokensExist = await fileExists(tokensDestPath);
      if (!tokensExist) {
        const hint = options.scss ? 'beusable add tokens --scss' : 'beusable add tokens';
        const tokensFileName = options.scss ? '_tokens.scss' : 'tokens.css';
        logWarning(`${tokensFileName} not found. Run \`${hint}\` first to install tokens.`);
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
        logError(`"${componentName}" 컴포넌트에 "${framework}" 프레임워크용 파일이 없습니다.`);
        process.exit(1);
      }

      // Build operations for all components in one atomic copyFiles call.
      // Destination directories use the Be prefix (e.g. BeButton/).
      // Files are also prefixed: Button.tsx → BeButton.tsx (except index.ts).
      const frameworkSrcBase = path.join(monorepoRoot, `packages/${framework}/src`);

      const operations: FileCopyOperation[] = [];
      const beSpecs = new Map<string, { sourceDirName: string; subcompNames: string[]; cssFilenames: string[] }>();
      for (const compName of toInstall) {
        const entry = manifest.components[compName];
        if (!entry) continue;
        const sourceDirName = toComponentDirName(compName);
        const destDirName = toDestDirName(compName);
        const compFiles: string[] = framework === 'react' ? entry.react : entry.vue;
        const compShared: SharedFileDep[] = framework === 'react'
          ? (entry.sharedReact ?? [])
          : (entry.sharedVue ?? []);
        const isMain = compName === componentName;

        // Skip transitive deps that have no files for this framework
        if (!isMain && compFiles.length === 0) continue;

        // Collect metadata for post-copy content rewriting
        const subcompNames = compFiles
          .filter(f => (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.vue'))
            && !f.includes('.module.')
            && f !== 'index.ts' && f !== 'index.tsx')
          .map(f => f.replace(/\.(tsx|ts|vue)$/, ''));
        const cssFilenames = compFiles.filter(f => f.endsWith('.module.css'));
        beSpecs.set(destDirName, { sourceDirName, subcompNames, cssFilenames });

        for (const filename of compFiles) {
          const destFilename = renameForBe(filename, options.scss);
          operations.push({
            absoluteSourcePath: path.join(
              frameworkSrcBase,
              `components/${sourceDirName}`,
              filename,
            ),
            relativeDestPath: path.join(destDirName, destFilename),
            skipIfExists: !isMain,
          });
        }

        for (const shared of compShared) {
          operations.push({
            absoluteSourcePath: path.join(frameworkSrcBase, shared.src),
            relativeDestPath: path.join(destDirName, shared.dest),
            skipIfExists: true,
          });
        }
      }

      try {
        const result = await copyFiles(operations, {
          overwrite: options.overwrite,
          resolvedOutputDir, // src/components level
          projectRoot: cwd,
          monorepoRoot,
        });

        // Rewrite CSS import paths and export names for Be prefix.
        // On success: clean up .bak files from --overwrite.
        // On failure: restore originals (overwrite) or remove new files (fresh install).
        try {
          await rewriteForBePrefix(result.copiedFiles, resolvedOutputDir, beSpecs, options.scss);
          for (const { bakPath } of result.backups) {
            await unlink(bakPath).catch(() => {});
          }
        } catch (rewriteError) {
          if (result.backups.length > 0) {
            const backedUpDests = new Set(result.backups.map(b => b.destPath));
            for (const { destPath, bakPath } of result.backups) {
              await rename(bakPath, destPath).catch(() => {});
            }
            for (const relPath of result.copiedFiles) {
              const absPath = path.join(resolvedOutputDir, relPath);
              if (!backedUpDests.has(absPath)) {
                await unlink(absPath).catch(() => {});
              }
            }
          } else {
            for (const relPath of result.copiedFiles) {
              await unlink(path.join(resolvedOutputDir, relPath)).catch(() => {});
            }
          }
          const msg = rewriteError instanceof Error ? rewriteError.message : String(rewriteError);
          const action = result.backups.length > 0 ? 'Original files have been restored.' : 'Copied files have been removed.';
          logError(`Post-processing failed. ${action}\n  Cause: ${msg}`);
          process.exit(1);
        }

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
          logError(`충돌하는 파일:\n${error.conflictingFiles.map((f) => `  ${f}`).join('\n')}`);
          logPlain('  --overwrite 옵션을 추가하면 기존 파일을 덮어쓸 수 있습니다.');
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
  manifest: { tokens: { src: string; dest: string; srcScss: string; destScss: string } },
  monorepoRoot: string,
  resolvedOutputDir: string,
  overwrite: boolean,
  scss: boolean,
  cwd: string
): Promise<void> {
  const src = scss ? manifest.tokens.srcScss : manifest.tokens.src;
  const dest = scss ? manifest.tokens.destScss : manifest.tokens.dest;
  const tokensSrcPath = path.join(monorepoRoot, src);
  const tokensFilename = path.basename(dest);

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
      monorepoRoot,
    });

    for (const { bakPath } of result.backups) {
      await unlink(bakPath).catch(() => {});
    }

    for (const copiedFile of result.copiedFiles) {
      const relPath = path.relative(cwd, path.join(resolvedOutputDir, copiedFile));
      logFileCopied(copiedFile, relPath);
    }

    const importHint = scss
      ? '@use "./tokens" as *;'
      : '@import "./tokens.css";';
    logInfo(`토큰을 CSS 진입점에 추가하세요: ${importHint}`);

  } catch (error) {
    if (error instanceof FileConflictError) {
      logError(`충돌하는 파일:\n${error.conflictingFiles.map((f) => `  ${f}`).join('\n')}`);
      logPlain('  --overwrite 옵션을 추가하면 기존 파일을 덮어쓸 수 있습니다.');
      process.exit(1);
    }
    if (error instanceof SourceFileNotFoundError) {
      logError(error.message);
      logError('`pnpm --filter @beusable-dev/tokens build`를 먼저 실행했나요?');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * 소문자 컴포넌트 이름을 모노레포의 디렉토리 이름(첫 글자 대문자)으로 변환한다.
 * 예: "button" → "Button", "datepicker" → "DatePicker", "tabs" → "Tabs"
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

function toDestDirName(componentName: string): string {
  return `Be${toComponentDirName(componentName)}`;
}

/**
 * Renames a component source filename for the Be-prefixed destination.
 * index.ts/index.tsx are kept as-is; all other files get 'Be' prepended.
 * When --scss is set, .module.css files are also renamed to .module.scss.
 */
function renameForBe(filename: string, scss: boolean): string {
  if (filename === 'index.ts' || filename === 'index.tsx') return filename;
  const renamed = `Be${filename}`;
  if (scss && renamed.endsWith('.module.css')) {
    return renamed.replace(/\.module\.css$/, '.module.scss');
  }
  return renamed;
}

/** ES2020-compatible replaceAll using split/join. */
function strReplaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replaces all whole-identifier occurrences (word-boundary safe). */
function strReplaceAllIdentifier(content: string, name: string, replacement: string): string {
  const re = new RegExp(`(?<![A-Za-z0-9_$])${escapeRegex(name)}(?![A-Za-z0-9_$])`, 'g');
  return content.replace(re, replacement);
}

/**
 * After copyFiles, rewrites CSS import paths and export identifiers in each
 * copied .tsx/.ts/.vue file so they reference the new Be-prefixed filenames.
 */
async function rewriteForBePrefix(
  copiedFiles: string[],
  resolvedOutputDir: string,
  beSpecs: Map<string, { sourceDirName: string; subcompNames: string[]; cssFilenames: string[] }>,
  scss: boolean,
): Promise<void> {
  const cssExt = scss ? 'scss' : 'css';

  for (const relativePath of copiedFiles) {
    if (!path.basename(relativePath).match(/\.(tsx|ts|vue)$/)) continue;

    const topDir = relativePath.split(path.sep)[0];
    const spec = beSpecs.get(topDir);
    if (!spec) continue;

    const absPath = path.join(resolvedOutputDir, relativePath);
    let content = await readFile(absPath, 'utf-8');
    let modified = false;

    // 1. CSS Module import paths (React: from './X.module.css' / Vue: src="./X.module.css")
    for (const cssFile of spec.cssFilenames) {
      const newRef = `Be${cssFile.replace(/\.module\.css$/, `.module.${cssExt}`)}`;
      if (content.includes(cssFile)) {
        content = strReplaceAll(content, cssFile, newRef);
        modified = true;
      }
    }

    // 2. Export declarations, displayName, re-export paths, named exports
    for (const compName of spec.subcompNames) {
      const beCompName = `Be${compName}`;

      for (const kw of ['const', 'function', 'class'] as const) {
        const token = `export ${kw} ${compName} `;
        if (content.includes(token)) {
          content = strReplaceAll(content, token, `export ${kw} ${beCompName} `);
          modified = true;
        }
      }

      const displayToken = `${compName}.displayName`;
      if (content.includes(displayToken)) {
        content = strReplaceAll(content, displayToken, `${beCompName}.displayName`);
        modified = true;
      }

      for (const q of ["'", '"'] as const) {
        // React index.ts: from './Modal' (no extension)
        const fromToken = `from ${q}./${compName}${q}`;
        if (content.includes(fromToken)) {
          content = strReplaceAll(content, fromToken, `from ${q}./${beCompName}${q}`);
          modified = true;
        }
        // Vue index.ts: from './Modal.vue' (with .vue extension)
        const fromVueToken = `from ${q}./${compName}.vue${q}`;
        if (content.includes(fromVueToken)) {
          content = strReplaceAll(content, fromVueToken, `from ${q}./${beCompName}.vue${q}`);
          modified = true;
        }
      }

      // React index.ts: export { Modal } from '...'
      const namedExportToken = `{ ${compName} }`;
      if (content.includes(namedExportToken)) {
        content = strReplaceAll(content, namedExportToken, `{ ${beCompName} }`);
        modified = true;
      }
      // Vue index.ts: export { default as Modal } from '...'
      const asToken = `as ${compName} }`;
      if (content.includes(asToken)) {
        content = strReplaceAll(content, asToken, `as ${beCompName} }`);
        modified = true;
      }

      // Rename all remaining call sites and references (e.g. hook invocations,
      // type references) that the specific patterns above didn't cover.
      const renamed = strReplaceAllIdentifier(content, compName, beCompName);
      if (renamed !== content) {
        content = renamed;
        modified = true;
      }
    }

    // Cross-directory: rename PascalCase identifiers for all other installed components.
    // Handles `import { Button } from '../Button'` in BeDatePicker.tsx when both are
    // installed together. strReplaceAllIdentifier uses word boundaries, so the path
    // segment `'../Button'` → `'../BeButton'` is handled automatically (slash is not
    // a word char). Only PascalCase names are replaced here — hooks (useXxx), utilities
    // (types, utils) and other lowercase names are excluded to prevent false positives.
    for (const [otherDestDir, otherSpec] of beSpecs.entries()) {
      if (otherDestDir === topDir) continue;
      for (const otherName of otherSpec.subcompNames) {
        if (!/^[A-Z]/.test(otherName)) continue;
        const renamed = strReplaceAllIdentifier(content, otherName, `Be${otherName}`);
        if (renamed !== content) {
          content = renamed;
          modified = true;
        }
      }
    }

    if (modified) {
      await writeFile(absPath, content, 'utf-8');
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
