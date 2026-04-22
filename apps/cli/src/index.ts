#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { existsSync } from 'fs';

import { createAddCommand } from './commands/add';
import { createListCommand } from './commands/list';

// tsup CJS 번들에서 __dirname은 dist/를 가리킨다.
// components.json은 빌드 시 dist/ 디렉토리로 복사된다.
const MANIFEST_DIR = __dirname;

// When published to npm, component source files are bundled under dist/assets/
// by the postbuild step. When running directly from the monorepo (development),
// dist/assets/ does not exist and we fall back to the monorepo root instead.
const ASSETS_DIR = path.resolve(__dirname, 'assets');
const MONOREPO_ROOT = existsSync(ASSETS_DIR)
  ? ASSETS_DIR
  : path.resolve(__dirname, '../../..');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('../package.json') as { version: string; description: string };

const program = new Command();

program
  .name('beusable')
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version', '버전을 출력합니다');

program.addCommand(createAddCommand(MANIFEST_DIR, MONOREPO_ROOT));
program.addCommand(createListCommand(MANIFEST_DIR));

program.parse(process.argv);
