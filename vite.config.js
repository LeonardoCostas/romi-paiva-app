import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importa el plugin de v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Añade esto aquí
  ],
});