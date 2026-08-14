import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  envPrefix: ['FIREBASE_', 'ADMIN_'],
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        /*
         * Split the big third-party libraries into their own chunks.
         *
         * This does not reduce what a first-time visitor downloads, the app needs
         * Firestore on first paint to read site content, so the SDK cannot be
         * deferred. What it buys is caching: previously every app change produced a
         * new 800 kB entry chunk, so a one-line copy edit made returning visitors
         * re-download the entire Firebase SDK. Now the vendor chunks keep their
         * hashes across app deploys and stay in the browser cache.
         *
         * Route-level splitting is separate and lives in src/pages/index.js.
         */
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  test: {
    // jsdom was already a devDependency but nothing selected it, so any component
    // test would have failed on a missing `document`.
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
