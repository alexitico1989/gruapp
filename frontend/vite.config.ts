import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  // ✅ NUEVO: Configuración para producción
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,        // Elimina todos los console.log
        drop_debugger: true,       // Elimina debugger statements
        pure_funcs: [              // Elimina funciones específicas
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
        ],
      },
    },
  },
});