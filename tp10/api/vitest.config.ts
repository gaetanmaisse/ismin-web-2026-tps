import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
    setupFiles: ['dotenv/config'],
    env: { DATABASE_URL: 'file:./test.db' },
    globalSetup: ['test/global-setup.ts'],
  },
});
