import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, '', '')
  
  return {
    plugins: [react()],
    // Optional: Define global constants to replace at build time
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    },
    // Optional: Server configuration
    server: {
      port: 5173,
      host: true,
    },
  }
})
    