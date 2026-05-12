import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    // Only include inspect plugin in development mode to prevent DOM attribute leakage in production
    ...(mode === 'development' ? [inspectAttr()] : []),
    react(),
  ],
  server: {
    port: 3000,
    // Security: fs.deny prevents access to sensitive files during development
    fs: {
      deny: ['.env', '.env.*', '*.pem', '*.key', '*.crt', '.git', 'node_modules'],
      strict: true,
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    // Security: Disable source maps in production to prevent source code exposure
    sourcemap: mode === 'development',
    // Security: Enable CSS code splitting for better cache control
    cssCodeSplit: true,
    // Security: Enable minification (esbuild default, removes console in production)
    minify: 'esbuild',
    // Security: Rollup output options
    rollupOptions: {
      output: {
        // Enable manual chunks for better cache isolation
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
