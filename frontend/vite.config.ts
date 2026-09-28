import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  preview: {
    allowedHosts: [
      'internal-operations-service-hub-production-32c9.up.railway.app',
    ],
  },
});