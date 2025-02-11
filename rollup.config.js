// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import license from 'rollup-plugin-license'

const config = {
  input: 'src/index.js',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    license({
      sourcemap: true,
      thirdParty: {
        output: 'dist/licenses.txt'
      }
    })
  ]
}

export default config
