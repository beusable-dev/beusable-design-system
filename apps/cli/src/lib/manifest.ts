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

/**
 * Carga el manifiesto de componentes desde src/components.json.
 * La ruta se calcula siempre desde __dirname para evitar path traversal (BR-03).
 */
export async function loadManifest(manifestDir: string): Promise<ComponentsManifest> {
  const manifestPath = path.join(manifestDir, 'components.json');

  let raw: string;
  try {
    raw = await readFile(manifestPath, 'utf-8');
  } catch {
    throw new ManifestLoadError(
      `No se encontró el manifiesto de componentes en ${manifestPath}. ¿Has ejecutado el build?`
    );
  }

  try {
    return JSON.parse(raw) as ComponentsManifest;
  } catch {
    throw new ManifestLoadError(`El manifiesto components.json no es JSON válido.`);
  }
}

export function getComponentNames(manifest: ComponentsManifest): string[] {
  return Object.keys(manifest.components);
}
