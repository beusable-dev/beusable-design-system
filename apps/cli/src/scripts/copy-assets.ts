/**
 * Postbuild script: copies source files from the monorepo packages into dist/assets/
 * so that the published CLI can resolve component source paths at runtime without
 * requiring the full monorepo to be present.
 *
 * Output structure mirrors the monorepo layout under dist/assets/:
 *   dist/assets/packages/react/src/components/...
 *   dist/assets/packages/react/src/hooks/...
 *   dist/assets/packages/vue/src/components/...
 *   dist/assets/packages/tokens/dist/css/...
 *
 * Ejecución: tsx src/scripts/copy-assets.ts
 * (Se invoca automáticamente en el paso "postbuild" después de tsup)
 */

import { cp, copyFile, mkdir, rm, access, readFile } from 'fs/promises';
import path from 'path';

// __dirname = apps/cli/src/scripts — four levels up reaches the monorepo root
const MONOREPO_ROOT = path.resolve(__dirname, '../../../..');
const DIST_ASSETS = path.resolve(__dirname, '../../dist/assets');

interface CopySpec {
  /** Absolute source path inside the monorepo */
  src: string;
  /** Destination path inside dist/assets (same relative layout) */
  dest: string;
}

const COPY_SPECS: CopySpec[] = [
  {
    src: path.join(MONOREPO_ROOT, 'packages/react/src/components'),
    dest: path.join(DIST_ASSETS, 'packages/react/src/components'),
  },
  {
    src: path.join(MONOREPO_ROOT, 'packages/react/src/hooks'),
    dest: path.join(DIST_ASSETS, 'packages/react/src/hooks'),
  },
  {
    src: path.join(MONOREPO_ROOT, 'packages/vue/src/components'),
    dest: path.join(DIST_ASSETS, 'packages/vue/src/components'),
  },
  {
    src: path.join(MONOREPO_ROOT, 'packages/vue/src/composables'),
    dest: path.join(DIST_ASSETS, 'packages/vue/src/composables'),
  },
  {
    src: path.join(MONOREPO_ROOT, 'packages/tokens/dist/css'),
    dest: path.join(DIST_ASSETS, 'packages/tokens/dist/css'),
  },
];

/**
 * Patterns for files that should NOT be included in the published assets.
 */
function shouldExclude(filename: string): boolean {
  if (filename.endsWith('.test.ts') || filename.endsWith('.test.tsx')) return true;
  if (filename.endsWith('.stories.tsx')) return true;
  return false;
}

async function main(): Promise<void> {
  console.log('Copiando assets al directorio dist/assets/...');

  // Clean previous assets to avoid stale files
  await rm(DIST_ASSETS, { recursive: true, force: true });
  await mkdir(DIST_ASSETS, { recursive: true });

  for (const spec of COPY_SPECS) {
    await mkdir(spec.dest, { recursive: true });

    await cp(spec.src, spec.dest, {
      recursive: true,
      filter: (_src: string) => {
        const filename = path.basename(_src);
        return !shouldExclude(filename);
      },
    });

    const relativeSrc = path.relative(MONOREPO_ROOT, spec.src);
    console.log(`  Copiado: ${relativeSrc} → dist/assets/${path.relative(DIST_ASSETS, spec.dest)}`);
  }

  // Copy components.json into dist/ so the published CLI can load the manifest at runtime.
  const componentsSrc = path.resolve(__dirname, '../components.json');
  const componentsDest = path.resolve(__dirname, '../../dist/components.json');
  await copyFile(componentsSrc, componentsDest);
  console.log('  Copiado: src/components.json → dist/components.json');

  // Verify that every sharedReact.src referenced in components.json
  // actually landed in dist/assets. Catches mismatches between the manifest
  // and what copy-assets decided to include.
  await verifySharedDepsPresent();

  console.log('Assets copiados correctamente.');
}

interface ComponentEntry {
  sharedReact?: Array<{ src: string; dest: string }>;
  sharedVue?: Array<{ src: string; dest: string }>;
}

async function verifySharedDepsPresent(): Promise<void> {
  const manifestPath = path.resolve(__dirname, '../components.json');
  const raw = await readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw) as {
    components: Record<string, ComponentEntry>;
  };

  const missing: string[] = [];

  for (const [name, entry] of Object.entries(manifest.components)) {
    for (const shared of entry.sharedReact ?? []) {
      const assetPath = path.join(DIST_ASSETS, 'packages/react/src', shared.src);
      try {
        await access(assetPath);
      } catch {
        missing.push(`${name} [react]: ${shared.src} → expected at ${assetPath}`);
      }
    }
    for (const shared of entry.sharedVue ?? []) {
      const assetPath = path.join(DIST_ASSETS, 'packages/vue/src', shared.src);
      try {
        await access(assetPath);
      } catch {
        missing.push(`${name} [vue]: ${shared.src} → expected at ${assetPath}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Postbuild validation failed — shared deps missing from dist/assets:\n${missing.map(m => `  ${m}`).join('\n')}`
    );
  }

  console.log('  Shared dep validation: all sharedReact/sharedVue sources present in dist/assets.');
}

main().catch((error) => {
  console.error('Error al copiar assets:', error);
  process.exit(1);
});
