import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Crops and shrinks the team photos (components/about/teamPhotos.js). The `i` flag also takes
    // a phone's `IMG_0001.JPG`. Tests skip it: they only need the photo URLs, not the images.
    mode !== 'test' &&
      imagetools({
        include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
      }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // The tests that fill in the whole property form take 2 to 5 seconds under coverage, beyond
    // Vitest's default limit of 5, and more on a slower laptop. None of them waits on anything.
    testTimeout: 15000,
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      // NFR-TST-06 leaves the language-model wrapper out of the coverage target.
      exclude: ['src/services/embeddingService.js', 'src/test/**'],
    },
  },
}));
