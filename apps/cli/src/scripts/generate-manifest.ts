/**
 * Prebuild 스크립트: React 및 Vue 컴포넌트 디렉토리를 스캔하여
 * 컴포넌트별 파일 목록을 담은 src/components.json을 생성한다.
 *
 * 실행: tsx src/scripts/generate-manifest.ts
 * (tsup 실행 전 "prebuild" 단계에서 자동으로 호출된다)
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import type { SharedFileDep } from '../lib/manifest';

// __dirname = apps/cli/src/scripts — 모노레포 루트까지 4단계 상위로 이동
const MONOREPO_ROOT = path.resolve(__dirname, '../../../..');
const REACT_COMPONENTS_DIR = path.join(MONOREPO_ROOT, 'packages/react/src/components');
const VUE_COMPONENTS_DIR = path.join(MONOREPO_ROOT, 'packages/vue/src/components');
// 매니페스트는 apps/cli/src/components.json에 저장된다
const MANIFEST_OUTPUT = path.join(__dirname, '../components.json');

const CLI_PACKAGE_JSON = path.join(__dirname, '../../package.json');

/**
 * 컴포넌트별 의존성 — 소스에서 추론할 수 없어 하드코딩한다.
 * 새 컴포넌트를 추가할 때 이 항목에도 추가해야 한다.
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
 * 복사에서 항상 제외되는 파일:
 * - *.test.ts / *.test.tsx: 테스트 파일
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
    console.error(`컴포넌트 디렉토리 읽기 오류: ${componentsDir}`, error);
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
  console.log('components.json 생성 중...');

  const pkgRaw = await readFile(CLI_PACKAGE_JSON, 'utf-8');
  const pkg = JSON.parse(pkgRaw) as { version?: string };
  if (typeof pkg.version !== 'string' || pkg.version.length === 0) {
    throw new Error('apps/cli/package.json is missing a valid "version" field');
  }
  const manifestVersion = pkg.version;

  const reactFiles = await scanComponentDirectory(REACT_COMPONENTS_DIR);
  const vueFiles = await scanComponentDirectory(VUE_COMPONENTS_DIR);

  // 두 프레임워크에서 감지된 모든 컴포넌트 합집합
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
    version: manifestVersion,
    components,
    tokens: {
      src: 'packages/tokens/dist/css/variables.css',
      dest: 'src/styles/tokens.css',
      srcScss: 'packages/tokens/dist/scss/_tokens.scss',
      destScss: 'src/styles/_tokens.scss',
    },
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  await writeFile(MANIFEST_OUTPUT, manifestJson, 'utf-8');

  const componentCount = Object.keys(components).length;
  console.log(`components.json 생성 완료: ${componentCount}개 컴포넌트.`);
  console.log(`출력 경로: ${MANIFEST_OUTPUT}`);
}

main().catch((error) => {
  console.error('매니페스트 생성 오류:', error);
  process.exit(1);
});
