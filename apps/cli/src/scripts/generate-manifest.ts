/**
 * Prebuild script: escanea los directorios de componentes React y Vue,
 * genera src/components.json con la lista de archivos por componente.
 *
 * Ejecución: tsx src/scripts/generate-manifest.ts
 * (Se invoca automáticamente en el paso "prebuild" antes de tsup)
 */

import { readdir, writeFile } from 'fs/promises';
import path from 'path';

import type { SharedFileDep } from '../lib/manifest';

// __dirname = apps/cli/src/scripts — subimos 4 niveles para llegar a la raíz del monorepo
const MONOREPO_ROOT = path.resolve(__dirname, '../../../..');
const REACT_COMPONENTS_DIR = path.join(MONOREPO_ROOT, 'packages/react/src/components');
const VUE_COMPONENTS_DIR = path.join(MONOREPO_ROOT, 'packages/vue/src/components');
// El manifiesto se escribe en apps/cli/src/components.json
const MANIFEST_OUTPUT = path.join(__dirname, '../components.json');

const MANIFEST_VERSION = '0.1.0';

/**
 * Dependencias por componente — hardcoded porque no se pueden inferir del fuente.
 * Si se añade un componente nuevo, añadir aquí su entrada.
 */
const DEPS_MAP: Record<string, string[]> = {
  button: ['clsx'],
  textfield: ['clsx'],
  dropdown: ['clsx'],
  toast: ['clsx'],
  checkbox: ['clsx'],
  radio: ['clsx'],
  toggle: ['clsx'],
  snackbar: ['clsx'],
  tooltip: ['clsx'],
  modal: ['clsx'],
  table: ['clsx'],
  slider: ['clsx'],
  tabs: ['clsx'],
  datepicker: ['clsx', 'date-fns', 'date-fns-tz'],
};

/**
 * Transitive component-to-component dependencies.
 * Keys and values are component names in lowercase.
 * Example: Table imports Checkbox, so installing `table` should also install `checkbox`.
 */
const COMPONENT_DEPS_MAP: Record<string, string[]> = {
  table: ['checkbox'],
  datepicker: ['button', 'checkbox'],
};

/**
 * Shared file dependencies per component — files outside the component directory
 * that the component imports (hooks, shared utilities).
 * Paths are relative to packages/${framework}/src/ (src) and the component output dir (dest).
 */
const VUE_CONTROLLABLE = { src: 'composables/useControllableState.ts', dest: '../../composables/useControllableState.ts' };

const SHARED_DEPS_MAP: Record<string, { react?: SharedFileDep[]; vue?: SharedFileDep[] }> = {
  checkbox: {
    react: [
      { src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' },
      { src: 'components/selectionColors.ts', dest: '../selectionColors.ts' },
    ],
    vue: [VUE_CONTROLLABLE],
  },
  radio: {
    react: [
      { src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' },
      { src: 'components/selectionColors.ts', dest: '../selectionColors.ts' },
    ],
    vue: [VUE_CONTROLLABLE],
  },
  textfield: {
    react: [
      { src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' },
      { src: 'hooks/useCountdownTimer.ts', dest: '../../hooks/useCountdownTimer.ts' },
    ],
    vue: [
      { src: 'composables/useCountdownTimer.ts', dest: '../../composables/useCountdownTimer.ts' },
    ],
  },
  slider: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
  table: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
  tabs: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
  datepicker: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
  dropdown: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
  toggle: {
    react: [{ src: 'hooks/useControllableState.ts', dest: '../../hooks/useControllableState.ts' }],
    vue: [VUE_CONTROLLABLE],
  },
};

/**
 * Archivos que se excluyen siempre de la copia:
 * - *.test.ts / *.test.tsx: archivos de test
 * Note: index.ts / index.tsx are now included because React directory imports
 * (e.g. `import { Button } from '../Button'`) resolve through the component's index.ts re-export.
 * Consumer projects need this file to resolve such imports.
 */
function isExcludedFile(filename: string): boolean {
  if (filename.endsWith('.test.ts') || filename.endsWith('.test.tsx')) return true;
  return false;
}

async function scanComponentDirectory(componentsDir: string): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};

  let componentDirNames: string[];
  try {
    const entries = await readdir(componentsDir, { withFileTypes: true });
    componentDirNames = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error(`Error leyendo directorio de componentes: ${componentsDir}`, error);
    return result;
  }

  for (const componentDirName of componentDirNames) {
    const componentKey = componentDirName.toLowerCase();
    const componentPath = path.join(componentsDir, componentDirName);

    const files = await readdir(componentPath, { withFileTypes: true });
    const componentFiles = files
      .filter((f) => f.isFile() && !isExcludedFile(f.name))
      .map((f) => f.name)
      .sort();

    if (componentFiles.length > 0) {
      result[componentKey] = componentFiles;
    }
  }

  return result;
}

async function main(): Promise<void> {
  console.log('Generando components.json...');

  const reactFiles = await scanComponentDirectory(REACT_COMPONENTS_DIR);
  const vueFiles = await scanComponentDirectory(VUE_COMPONENTS_DIR);

  // Unión de todos los componentes detectados (en ambos frameworks)
  const allComponentKeys = new Set([...Object.keys(reactFiles), ...Object.keys(vueFiles)]);

  const components: Record<
    string,
    {
      react: string[];
      vue: string[];
      deps: string[];
      componentDeps?: string[];
      sharedReact?: SharedFileDep[];
      sharedVue?: SharedFileDep[];
    }
  > = {};

  for (const key of Array.from(allComponentKeys).sort()) {
    const sharedReact = SHARED_DEPS_MAP[key]?.react;
    const sharedVue = SHARED_DEPS_MAP[key]?.vue;
    const componentDeps = COMPONENT_DEPS_MAP[key];
    components[key] = {
      react: reactFiles[key] ?? [],
      vue: vueFiles[key] ?? [],
      deps: DEPS_MAP[key] ?? [],
      ...(componentDeps ? { componentDeps } : {}),
      ...(sharedReact ? { sharedReact } : {}),
      ...(sharedVue ? { sharedVue } : {}),
    };
  }

  const manifest = {
    version: MANIFEST_VERSION,
    components,
    tokens: {
      src: 'packages/tokens/dist/css/variables.css',
      dest: 'src/styles/tokens.css',
    },
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  await writeFile(MANIFEST_OUTPUT, manifestJson, 'utf-8');

  const componentCount = Object.keys(components).length;
  console.log(`components.json generado con ${componentCount} componentes.`);
  console.log(`Ruta: ${MANIFEST_OUTPUT}`);
}

main().catch((error) => {
  console.error('Error al generar el manifiesto:', error);
  process.exit(1);
});
