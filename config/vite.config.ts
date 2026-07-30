import { chmod } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true }),
    {
      name: 'chmod-cli',
      closeBundle: async () => {
        await chmod(resolve(__dirname, '../dist/cli.js'), 0o755);
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, '../src/index.ts'),
        cli: resolve(__dirname, '../src/cli.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    target: 'es2022',
    minify: 'oxc',
    sourcemap: false,
    rollupOptions: {
      // Node-only tool — ship as a thin wrapper, don't bundle giget transitively.
      external: ['giget', /^node:/],
      output: {
        exports: 'named',
        banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node' : ''),
      },
    },
  },
});
