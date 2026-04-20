import StyleDictionary from 'style-dictionary';
import { cp } from 'node:fs/promises';

const sd = new StyleDictionary({
  source: ['src/*.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: { outputReferences: false },
        },
      ],
    },
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { selector: ':root', outputReferences: false },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'index.mjs',
          format: 'javascript/es6',
        },
        {
          destination: 'index.cjs',
          format: 'javascript/module-flat',
        },
        {
          destination: 'index.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
await cp('src/fonts.css', 'dist/css/fonts.css');

console.log('\n✅ @beusable/tokens 빌드 완료');
