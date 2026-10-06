import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      // NFR-TST-06 leaves the language-model wrapper out of the coverage target.
      exclude: ['src/services/embeddingService.js', 'src/test/**'],
    },
  },
});
