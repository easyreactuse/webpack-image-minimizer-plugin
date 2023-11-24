import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
const publicConfig = {
  format: 'esm'
}

const config = defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        ...publicConfig
      }
    ],
    plugins: [
      typescript({
        declaration: true,
        target: "ES5"
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [
      typescript({
        declaration: true,
      }),
    ]
  },
])

export default config;