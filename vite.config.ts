// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  build: {
    chunkSizeWarningLimit: 1200, // Increased from default 500KB to avoid warnings
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console statements in production
        drop_debugger: true // Remove debugger statements in production
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries to separate chunks
          'vendor': ['vue', 'vue-router', 'pinia'],
          // Additional manual chunks can be defined here
        }
      }
    }
  },
  
  server: {
    port: 3000,
    open: true, // Auto-open browser on server start
    cors: true // Enable CORS
  }
});