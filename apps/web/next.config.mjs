import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default {
  output: 'standalone',
  experimental: { outputFileTracingRoot: path.join(directory, '../..') },
};
