import { readFile } from 'fs/promises';
import path from 'path';

export type SupportedFramework = 'react' | 'vue';

export class FrameworkDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrameworkDetectionError';
  }
}

const SUPPORTED_FRAMEWORKS: SupportedFramework[] = ['react', 'vue'];

function isSupportedFramework(value: string): value is SupportedFramework {
  return SUPPORTED_FRAMEWORKS.includes(value as SupportedFramework);
}

/**
 * Detecta el framework del proyecto leyendo package.json.
 * Si se pasa explicitFramework, se usa directamente sin leer package.json.
 */
export async function detectFramework(
  projectCwd: string,
  explicitFramework?: string
): Promise<SupportedFramework> {
  if (explicitFramework !== undefined) {
    if (!isSupportedFramework(explicitFramework)) {
      throw new FrameworkDetectionError(
        `Framework no reconocido: "${explicitFramework}". Usa react o vue.`
      );
    }
    return explicitFramework;
  }

  const packageJsonPath = path.join(projectCwd, 'package.json');

  let packageJsonContent: string;
  try {
    packageJsonContent = await readFile(packageJsonPath, 'utf-8');
  } catch {
    throw new FrameworkDetectionError(
      `No se encontró package.json en ${projectCwd}. ¿Estás en la raíz del proyecto?`
    );
  }

  let packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    packageJson = JSON.parse(packageJsonContent);
  } catch {
    throw new FrameworkDetectionError(`package.json no es JSON válido en ${projectCwd}.`);
  }

  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const hasReact = 'react' in allDependencies;
  const hasVue = 'vue' in allDependencies;

  if (hasReact && hasVue) {
    throw new FrameworkDetectionError(
      'Se detectaron tanto react como vue. Usa --framework react o --framework vue para especificar.'
    );
  }

  if (!hasReact && !hasVue) {
    throw new FrameworkDetectionError(
      'No se detectó react ni vue en package.json. Usa --framework react o --framework vue.'
    );
  }

  return hasReact ? 'react' : 'vue';
}
