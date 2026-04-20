import { rm } from 'fs/promises';
import path from 'path';

const DIST = path.resolve(__dirname, '../../dist');

rm(DIST, { recursive: true, force: true }).then(() => {
  console.log('Removed dist/');
}).catch((err) => {
  console.error('Failed to remove dist/:', err);
  process.exit(1);
});
