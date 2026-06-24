import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

// oxlint-disable-next-line no-default-export
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    nitroV2Plugin({ preset: 'node-server', compatibilityDate: '2026-03-12' }),
    viteReact(),
  ],
});
