import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** Given. Vite serves the app on localhost:5173; Vitest runs the tests in a fake browser, jsdom. */
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setup-tests.ts'],
  },
});
