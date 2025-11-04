import { defineConfig } from "vite";
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    hmr: {
      overlay: true,
    },
    // ✅ THÊM PROXY - Giải pháp tốt nhất cho cookie issue
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // ⚠️ KHÔNG rewrite path vì backend đã có /api/v1
      }
    }
  },
  optimizeDeps: {
    exclude: ['react-csv']
  },
  css: {
    postcss: "./postcss.config.js",
  },
});