import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-expect-error Optional local Vite plugin file (not committed in all environments)
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {
    // ignore when optional plugin is absent
  }
  return {
    plugins,
    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
  };
})
