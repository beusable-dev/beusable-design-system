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

export async function detectFramework(
  projectCwd: string,
  explicitFramework?: string
): Promise<SupportedFramework> {
  if (explicitFramework !== undefined) {
    if (!isSupportedFramework(explicitFramework)) {
      throw new FrameworkDetectionError(
        `지원하지 않는 프레임워크: "${explicitFramework}". react 또는 vue를 사용하세요.`
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
      `${projectCwd}에서 package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행하고 있나요?`
    );
  }

  let packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
  try {
    packageJson = JSON.parse(packageJsonContent);
  } catch {
    throw new FrameworkDetectionError(`${projectCwd}의 package.json이 유효한 JSON이 아닙니다.`);
  }

  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };

  const hasReact = 'react' in allDependencies;
  const hasVue = 'vue' in allDependencies;

  if (hasReact && hasVue) {
    throw new FrameworkDetectionError(
      'react와 vue가 모두 감지되었습니다. --framework react 또는 --framework vue로 명시해 주세요.'
    );
  }

  if (!hasReact && !hasVue) {
    throw new FrameworkDetectionError(
      'package.json에서 react 또는 vue를 찾을 수 없습니다. --framework react 또는 --framework vue를 사용하세요.'
    );
  }

  return hasReact ? 'react' : 'vue';
}
