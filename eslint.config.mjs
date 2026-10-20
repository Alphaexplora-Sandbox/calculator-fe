import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', '.next/', 'out/', 'node_modules/'] },
  ...tseslint.configs.recommended,
  {
    // A leading underscore marks a parameter kept for its signature, like
    // the mask(_page) hook in the visual browser test.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
