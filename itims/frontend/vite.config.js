import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite = fast dev server + build tool for React
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
