import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['node_modules/**', '.next/**', 'out/**', 'public/sw.js', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Architektur-Regel: localStorage nur im MockAdapter
      'no-restricted-globals': ['error', { name: 'localStorage', message: 'Nur über den DataAdapter.' }],
      '@next/next/no-img-element': 'off',
    },
  },
  { files: ['src/data/mock/**'], rules: { 'no-restricted-globals': 'off' } },
];

export default config;
