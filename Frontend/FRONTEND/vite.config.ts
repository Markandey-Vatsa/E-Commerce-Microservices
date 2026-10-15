import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev only: the browser calls /api/* on the Vite server, which forwards to the API Gateway on :8080.
// This avoids CORS while developing. The gateway is still the only backend entry point.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://111.118.185.38:8080', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') } },
  },
});
