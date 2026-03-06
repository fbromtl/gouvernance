import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Required for preview tools
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // react core + react-dom + react-router must be in the same chunk
            if (/[/\\]react[/\\]/.test(id) || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler'))
              return 'vendor-react';
            if (id.includes('recharts') || id.includes('d3-'))
              return 'vendor-charts';
            if (id.includes('framer-motion'))
              return 'vendor-motion';
            if (id.includes('@radix-ui') || id.includes('radix-ui') || id.includes('cmdk'))
              return 'vendor-ui';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/'))
              return 'vendor-forms';
            if (id.includes('@tanstack/react-query'))
              return 'vendor-query';
            if (id.includes('@tanstack/react-table'))
              return 'vendor-table';
            if (id.includes('i18next'))
              return 'vendor-i18n';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified') || id.includes('mdast') || id.includes('hast') || id.includes('micromark'))
              return 'vendor-markdown';
            if (id.includes('@supabase'))
              return 'vendor-supabase';
            if (id.includes('lucide-react'))
              return 'vendor-icons';
            if (id.includes('date-fns'))
              return 'vendor-date';
          }
        },
      },
    },
  },
})
