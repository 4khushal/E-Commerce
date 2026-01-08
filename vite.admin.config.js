import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate config for admin dashboard on different port
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Admin dashboard on port 3001
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist-admin',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Ensure proper handling of client-side routes
  preview: {
    port: 3001,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})

