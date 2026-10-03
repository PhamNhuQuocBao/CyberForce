import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000, // Argon2id 64MB hashing requires sufficient timeout
    hookTimeout: 30000,
  },
});
