import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Config updated to force restart
export default defineConfig({
    plugins: [react()],
})
