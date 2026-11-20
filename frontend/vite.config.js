import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds straight into app/static so FastAPI's existing StaticFiles mount
// (app/main.py) serves the app with zero backend changes. The dev server
// proxies API calls to the FastAPI backend running separately on :8000.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../app/static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/chat': 'http://127.0.0.1:8000',
      '/score': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
      '/roles': 'http://127.0.0.1:8000',
      '/questions': 'http://127.0.0.1:8000',
      '/hint': 'http://127.0.0.1:8000',
      '/rewrite-answer': 'http://127.0.0.1:8000',
      '/analyze-resume': 'http://127.0.0.1:8000',
      '/export-markdown': 'http://127.0.0.1:8000',
    },
  },
})
