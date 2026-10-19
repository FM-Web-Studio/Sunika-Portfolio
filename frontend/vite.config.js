import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    {
      name: 'jsx-in-js',
      enforce: 'pre',
      async transform(code, id) {
        if (!/src[\\/].*\.js$/.test(id)) return null;
        return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  envPrefix: ['FIREBASE_', 'ADMIN_'],
  build: {
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
});
