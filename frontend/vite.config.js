import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''

// https://vitejs.dev/config/
export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'dist' }
})
