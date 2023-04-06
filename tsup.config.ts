import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/smartcli.ts', 'src/ai.ts'],
    format: ['esm'],
    dts: false,
    clean: true,
});
