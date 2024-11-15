// See: https://eslint.org/docs/latest/use/configure/configuration-files

import { fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import _import from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: ['**/coverage', '**/dist', '**/linter', '**/node_modules']
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      jest,
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },

      ecmaVersion: 2023,
      sourceType: 'module'
    },

    rules: {
      camelcase: 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'import/no-namespace': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error'
    }
  }
]
