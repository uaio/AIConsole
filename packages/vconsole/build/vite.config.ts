import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'AIConsole',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      input: {
        index: './src/index.ts'
      }
    }
  },
  plugins: [
    dts(),
    cssInjectedByJsPlugin({ topExecutionPriority: false })
  ],
  test: {
    include: ['**/test/**/*.{test,spec}.{js,ts}'],
    exclude: ['**/node_modules/**', '**/dist/**']
  }
});
