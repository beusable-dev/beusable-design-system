import { readFile } from 'fs/promises';
import path from 'path';

export interface SharedFileDep {
  /** Relative path from packages/${framework}/src/ */
  src: string;
  /** Relative path from the component output directory */
  dest: string;
}

export interface ComponentEntry {
  react: string[];
  vue: string[];
  deps: string[];
  componentDeps?: string[]; // transitive component names in lowercase
  sharedReact?: SharedFileDep[];
  sharedVue?: SharedFileDep[];
}

export interface TokensEntry {
  src: string;
  dest: string;
  srcScss: string;
  destScss: string;
}

export interface ComponentsManifest {
  version: string;
  components: Record<string, ComponentEntry>;
  tokens: TokensEntry;
}

export class ManifestLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestLoadError';
  }
}

function isSafePath(p: unknown): boolean {
  if (typeof p !== 'string') return false;
  if (path.isAbsolute(p)) return false;
  const normalized = path.normalize(p);
  return !normalized.startsWith('..') && normalized !== '..';
}

function assertValidManifest(data: unknown): asserts data is ComponentsManifest {
  if (typeof data !== 'object' || data === null) {
    throw new ManifestLoadError('components.json 매니페스트는 객체여야 합니다.');
  }
  const m = data as Record<string, unknown>;

  if (typeof m['version'] !== 'string') {
    throw new ManifestLoadError('components.json에 "version" 필드(string)가 필요합니다.');
  }
  if (typeof m['components'] !== 'object' || m['components'] === null) {
    throw new ManifestLoadError('components.json에 "components" 필드(object)가 필요합니다.');
  }
  if (typeof m['tokens'] !== 'object' || m['tokens'] === null) {
    throw new ManifestLoadError('components.json에 "tokens" 필드(object)가 필요합니다.');
  }

  const tokens = m['tokens'] as Record<string, unknown>;
  for (const field of ['src', 'dest', 'srcScss', 'destScss'] as const) {
    if (!isSafePath(tokens[field])) {
      throw new ManifestLoadError(
        `tokens.${field}에 유효하지 않거나 위험한 경로가 있습니다: "${tokens[field]}".`
      );
    }
  }

  const components = m['components'] as Record<string, unknown>;
  for (const [compName, entry] of Object.entries(components)) {
    if (typeof entry !== 'object' || entry === null) continue;
    const e = entry as Record<string, unknown>;
    for (const field of ['sharedReact', 'sharedVue'] as const) {
      const shared = e[field];
      if (!Array.isArray(shared)) continue;
      for (const item of shared) {
        if (typeof item !== 'object' || item === null) continue;
        const dep = item as Record<string, unknown>;
        if (!isSafePath(dep['src'])) {
          throw new ManifestLoadError(
            `${compName}.${field}[].src에 유효하지 않거나 위험한 경로가 있습니다: "${dep['src']}".`
          );
        }
        if (!isSafePath(dep['dest'])) {
          throw new ManifestLoadError(
            `${compName}.${field}[].dest에 유효하지 않거나 위험한 경로가 있습니다: "${dep['dest']}".`
          );
        }
      }
    }
  }
}

/**
 * components.json 매니페스트를 로드한다.
 * 경로는 항상 __dirname 기준으로 계산하여 경로 탈출을 방지한다 (BR-03).
 */
export async function loadManifest(manifestDir: string): Promise<ComponentsManifest> {
  const manifestPath = path.join(manifestDir, 'components.json');

  let raw: string;
  try {
    raw = await readFile(manifestPath, 'utf-8');
  } catch {
    throw new ManifestLoadError(
      `컴포넌트 매니페스트를 찾을 수 없습니다: ${manifestPath}. 빌드를 먼저 실행하세요.`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ManifestLoadError('components.json이 유효한 JSON이 아닙니다.');
  }

  assertValidManifest(parsed);
  return parsed;
}

export function getComponentNames(manifest: ComponentsManifest): string[] {
  return Object.keys(manifest.components);
}
